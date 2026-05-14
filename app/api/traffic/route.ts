import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'node:crypto';

interface TrafficRequestBody {
  trackView?: boolean;
  heartbeat?: boolean;
}

interface RedisPipelineResponse<T = unknown> {
  result?: T;
  error?: string;
}

interface TrafficResponse {
  totalViews: number;
  uniqueVisitors: number;
  activeNow: number;
  service: string;
  tracked: {
    view: boolean;
    uniqueVisitor: boolean;
    activeSession: boolean;
  };
}

const VIEWS_KEY = 'portfolio:traffic:views';

const UNIQUE_KEY =
  'portfolio:traffic:unique-visitors';

const VISITOR_KEY_PREFIX =
  'portfolio:traffic:visitor';

const ACTIVE_VISITORS_KEY =
  'portfolio:traffic:active-visitors';

const ACTIVE_WINDOW_SECONDS = 90;

const RATE_LIMIT_PREFIX =
  'portfolio:traffic:rate';

const RATE_LIMIT_PER_MINUTE = 120;

const BOT_USER_AGENT =
  /bot|crawler|spider|crawling|preview|facebookexternalhit|slackbot|twitterbot|linkedinbot|discordbot|whatsapp|telegrambot|vercel-screenshot/i;

const json = (
  body: unknown,
  status = 200
): NextResponse =>
  NextResponse.json(body, {
    status,
    headers: {
      'cache-control': 'no-store, max-age=0',
    },
  });

const getClientIp = (
  request: NextRequest
): string => {
  const forwardedFor =
    request.headers.get('x-forwarded-for');

  const firstForwardedIp =
    forwardedFor?.split(',')[0];

  return (
    firstForwardedIp?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
};

const getMinuteBucket = (): number =>
  Math.floor(Date.now() / 60000);

const hashValue = (value: string): string =>
  createHash('sha256')
    .update(value)
    .digest('hex');

const getRedisConfig = (): {
  url: string;
  token: string;
} => {
  const url =
    process.env.UPSTASH_REDIS_REST_URL?.replace(
      /\/$/,
      ''
    );

  const token =
    process.env.UPSTASH_REDIS_REST_TOKEN;

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

  const response = await fetch(
    `${url}/pipeline`,
    {
      method: 'POST',
      headers: {
        authorization: `Bearer ${token}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify(commands),
    }
  );

  if (!response.ok) {
    throw new Error(
      `Upstash returned ${response.status}`
    );
  }

  const results: RedisPipelineResponse<T>[] =
    await response.json();

  const error = results.find(
    (item) => item.error
  );

  if (error?.error) {
    throw new Error(error.error);
  }

  return results.map(
    (item) => item.result as T
  );
};

const toCount = (value: unknown): number => {
  const parsed = Number(value);

  return Number.isFinite(parsed)
    ? parsed
    : 0;
};

export async function POST(
  request: NextRequest
): Promise<NextResponse> {
  try {
    let body: TrafficRequestBody = {};

    try {
      body =
        (await request.json()) as TrafficRequestBody;
    } catch {
      // Empty body is acceptable
    }

    const userAgent =
      request.headers.get('user-agent') || '';

    const acceptLanguage =
      request.headers.get(
        'accept-language'
      ) || '';

    const isBot =
      BOT_USER_AGENT.test(userAgent);

    const ip = getClientIp(request);

    const clientHash = hashValue(
      `${ip}:${userAgent}:${acceptLanguage}`
    );

    const rateKey =
      `${RATE_LIMIT_PREFIX}:` +
      `${getMinuteBucket()}:` +
      `${hashValue(ip)}`;

    const now = Date.now();

    const staleBefore =
      now -
      ACTIVE_WINDOW_SECONDS * 1000;

    const [requestCount] =
      await redisPipeline<number | string>([
        ['INCR', rateKey],
        ['EXPIRE', rateKey, 60],
      ]);

    if (
      toCount(requestCount) >
      RATE_LIMIT_PER_MINUTE
    ) {
      return json(
        {
          error: 'Rate limited',
        },
        429
      );
    }

    const shouldTrackView =
      Boolean(body.trackView) && !isBot;

    let totalViews = 0;

    let uniqueVisitors = 0;

    let activeNow = 0;

    let trackedUniqueVisitor = false;

    if (shouldTrackView) {
      const visitorKey =
        `${VISITOR_KEY_PREFIX}:${clientHash}`;

      const [
        views,
        visitorCreated,
        currentUniqueVisitors,
        ,
        ,
        activeCount,
      ] = await redisPipeline<
        number | string | null
      >([
        ['INCR', VIEWS_KEY],
        ['SET', visitorKey, '1', 'NX'],
        ['GET', UNIQUE_KEY],
        [
          'ZADD',
          ACTIVE_VISITORS_KEY,
          now,
          clientHash,
        ],
        [
          'ZREMRANGEBYSCORE',
          ACTIVE_VISITORS_KEY,
          0,
          staleBefore,
        ],
        ['ZCARD', ACTIVE_VISITORS_KEY],
      ]);

      totalViews = toCount(views);

      uniqueVisitors = toCount(
        currentUniqueVisitors
      );

      activeNow = toCount(activeCount);

      if (visitorCreated === 'OK') {
        const [updatedUniqueVisitors] =
          await redisPipeline<
            number | string
          >([
            ['INCR', UNIQUE_KEY],
          ]);

        uniqueVisitors = toCount(
          updatedUniqueVisitors
        );

        trackedUniqueVisitor = true;
      }
    } else {
      const shouldHeartbeat =
        !isBot && Boolean(body.heartbeat);

      const commands: unknown[][] = [
        ['GET', VIEWS_KEY],
        ['GET', UNIQUE_KEY],
      ];

      if (shouldHeartbeat) {
        commands.push([
          'ZADD',
          ACTIVE_VISITORS_KEY,
          now,
          clientHash,
        ]);
      }

      commands.push(
        [
          'ZREMRANGEBYSCORE',
          ACTIVE_VISITORS_KEY,
          0,
          staleBefore,
        ],
        ['ZCARD', ACTIVE_VISITORS_KEY]
      );

      const results =
        await redisPipeline<
          number | string | null
        >(commands);

      totalViews = toCount(results[0]);

      uniqueVisitors = toCount(results[1]);

      activeNow = toCount(
        results[results.length - 1]
      );
    }

    const response: TrafficResponse = {
      totalViews,
      uniqueVisitors,
      activeNow,
      service: 'upstash-redis',
      tracked: {
        view: shouldTrackView,
        uniqueVisitor:
          trackedUniqueVisitor,
        activeSession:
          !isBot &&
          (shouldTrackView ||
            Boolean(body.heartbeat)),
      },
    };

    return json(response);
  } catch (error) {
    console.error(
      'Traffic API failed:',
      error
    );

    return json(
      {
        error:
          'Traffic data unavailable',
      },
      500
    );
  }
}