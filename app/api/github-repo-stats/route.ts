import { NextRequest, NextResponse } from 'next/server';

interface CachedStats {
  owner: string;
  repo: string;
  fetchedAt: string;
  stars: number;
  forks: number;
  openPullRequests: number;
  source: string;
  cached: boolean;
  stale: boolean;
}

interface GitHubRepoResponse {
  stargazers_count?: number;
  forks_count?: number;
}

interface GitHubPullRequestResponse {
  total_count?: number;
}

interface RedisPipelineResponse<T = unknown> {
  result?: T;
  error?: string;
}

const CACHE_TTL_SECONDS = 60;
const STALE_TTL_SECONDS = 86400;

const OWNER_RE = /^[a-z\d](?:[a-z\d-]{0,37}[a-z\d])?$/i;
const REPO_RE = /^[A-Za-z0-9_.-]+$/;

const CACHE_HEADERS: HeadersInit = {
  'cache-control': 's-maxage=60, stale-while-revalidate=300',
};

const json = (body: unknown, status = 200) =>
  NextResponse.json(body, {
    status,
    headers: CACHE_HEADERS,
  });

const githubHeaders = (): HeadersInit => ({
  Accept: 'application/vnd.github+json',
  'User-Agent': 'portfolio-github-repo-stats',
  ...(process.env.GITHUB_TOKEN
    ? {
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      }
    : {}),
});

const getRedisConfig = (): { url: string; token: string } => {
  const url = process.env.UPSTASH_REDIS_REST_URL?.replace(/\/$/, '');
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    throw new Error(
      'Missing UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN'
    );
  }

  return { url, token };
};

const redisPipeline = async <T = unknown>(
  commands: unknown[][]
): Promise<T[]> => {
  const { url, token } = getRedisConfig();

  const response = await fetch(`${url}/pipeline`, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${token}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify(commands),
  });

  if (!response.ok) {
    throw new Error(`Upstash returned ${response.status}`);
  }

  const results: RedisPipelineResponse<T>[] = await response.json();

  const error = results.find((item) => item.error);

  if (error?.error) {
    throw new Error(error.error);
  }

  return results.map((item) => item.result as T);
};

const cacheKey = (owner: string, repo: string): string =>
  `portfolio:github:repo:${owner.toLowerCase()}:${repo.toLowerCase()}:stats`;

const readCachedStats = async (
  owner: string,
  repo: string
): Promise<CachedStats | null> => {
  try {
    const [cached] = await redisPipeline<string | null>([
      ['GET', cacheKey(owner, repo)],
    ]);

    if (!cached) {
      return null;
    }

    const parsed: CachedStats = JSON.parse(cached);

    if (
      typeof parsed.stars !== 'number' ||
      typeof parsed.forks !== 'number' ||
      typeof parsed.openPullRequests !== 'number'
    ) {
      return null;
    }

    return parsed;
  } catch (error) {
    console.warn('GitHub repo stats cache read failed:', error);
    return null;
  }
};

const writeCachedStats = async (
  owner: string,
  repo: string,
  payload: CachedStats
): Promise<void> => {
  try {
    await redisPipeline([
      [
        'SET',
        cacheKey(owner, repo),
        JSON.stringify(payload),
        'EX',
        STALE_TTL_SECONDS,
      ],
    ]);
  } catch (error) {
    console.warn('GitHub repo stats cache write failed:', error);
  }
};

const cacheAgeSeconds = (payload: CachedStats): number => {
  const fetchedAt = new Date(payload.fetchedAt).getTime();

  if (!Number.isFinite(fetchedAt)) {
    return Infinity;
  }

  return Math.max(
    0,
    Math.floor((Date.now() - fetchedAt) / 1000)
  );
};

const fetchGitHubJson = async <T>(url: string): Promise<T> => {
  const response = await fetch(url, {
    headers: githubHeaders(),
  });

  if (!response.ok) {
    const body = await response.text();

    throw new Error(`GitHub API ${response.status}: ${body}`);
  }

  return response.json() as Promise<T>;
};

const fetchRepoStats = async (
  owner: string,
  repo: string
): Promise<CachedStats> => {
  const [repoData, pullRequests] = await Promise.all([
    fetchGitHubJson<GitHubRepoResponse>(
      `https://api.github.com/repos/${owner}/${repo}`
    ),
    fetchGitHubJson<GitHubPullRequestResponse>(
      `https://api.github.com/search/issues?q=repo:${owner}/${repo}+type:pr+state:open`
    ),
  ]);

  return {
    owner,
    repo,
    fetchedAt: new Date().toISOString(),
    stars: repoData.stargazers_count || 0,
    forks: repoData.forks_count || 0,
    openPullRequests: pullRequests.total_count || 0,
    source: 'github-rest',
    cached: false,
    stale: false,
  };
};

export async function GET(
  request: NextRequest
): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);

  const owner = searchParams.get('owner')?.trim() || '';
  const repo = searchParams.get('repo')?.trim() || '';

  if (!OWNER_RE.test(owner) || !REPO_RE.test(repo)) {
    return json(
      {
        error: 'Invalid owner or repo',
      },
      400
    );
  }

  try {
    const cached = await readCachedStats(owner, repo);

    if (
      cached &&
      cacheAgeSeconds(cached) < CACHE_TTL_SECONDS
    ) {
      return json({
        ...cached,
        cached: true,
        stale: false,
        source: 'upstash-redis',
      });
    }

    const payload = await fetchRepoStats(owner, repo);

    await writeCachedStats(owner, repo, payload);

    return json(payload);
  } catch (error) {
    console.error('GitHub repo stats API failed:', error);

    const cached = await readCachedStats(owner, repo);

    if (cached) {
      return json({
        ...cached,
        cached: true,
        stale: true,
        source: 'upstash-redis-stale',
      });
    }

    return json(
      {
        error: 'GitHub repo stats unavailable',
      },
      502
    );
  }
}