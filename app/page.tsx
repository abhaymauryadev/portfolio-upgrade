"use client"
import { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from "@vercel/speed-insights/react";
import { Mail } from 'lucide-react';
import { FaLinkedin, FaXTwitter } from 'react-icons/fa6';
import { Hero } from './components/sections/Hero';
import { Grain } from './components/ui/Grain';
import { Preloader } from './components/ui/Preloader';
import { StatusBadge } from './components/ui/StatusBadge';
import { ViewerBadge } from './components/ui/ViewerBadge';
import { AnimatePresence, motion } from 'framer-motion';
import { CustomCursor } from './components/ui/CustomCursor';
import { useLenis } from './hooks/useLenis';
import type { Project } from './components/sections/Work';
import projectsData from './data/projects.json';
import { fetchPortfolioGitHubStats } from './lib/github';


function getStaticProjectStars() {
   return ((projectsData.projects as { stars?: number }[]) ?? []).reduce(
      (total, project) => total + (project.stars || 0),
      0
   );
}

// Lazy load section and modals
const Work = lazy(() => import('./components/sections/Work').then(m => ({ default: m.Work })));
const MoreProjects = lazy(() => import('./components/sections/MoreProject').then(m => ({ default: m.MoreProjects })));
const Skills = lazy(() => import('./components/sections/Skills').then(m => ({ default: m.Skills })));
const OssImpact = lazy(() => import('./components/sections/OssImpact').then(m => ({ default: m.OssImpact })));
const Services = lazy(() => import('./components/sections/Service').then(m => ({ default: m.Services })));
const Footer = lazy(() => import('./components/sections/Footer').then(m => ({ default: m.Footer })));
const ProjectModal = lazy(() => import('./components/ui/ProjectModal').then(m => ({ default: m.ProjectModal })));
const ResumeModal = lazy(() => import('./components/ui/ResumeModal').then(m => ({ default: m.ResumeModal })));




export default function Home() {
   const [theme] = useState<'light' | 'dark'>('dark');
   const [stats, setStats] = useState({ stars: 0, commits: 0, prs: 0 });
   const [isStatsLoading, setIsStatsLoading] = useState(true);
   const [isModalOpen, setIsModalOpen] = useState(false);
   const [isResumeModalOpen, setIsResumeModalOpen] = useState(false);
   const [selectedProject, setSelectedProject] = useState<Project | null>(null);
   const [isNavInverted, setIsNavInverted] = useState(false);
   const [isLoading, setIsLoading] = useState(true);
   const [isTransitioning] = useState(false);
   const [clickPos] = useState({ x: 0, y: 0 });
   const GITHUB_USERNAME = 'abhaymauryadev';

   //  Initialize lenis smooth scrolling
   useLenis()

   const resumeUrl = "https://drive.google.com/file/d/19B5Jx7tMJgM_m9IbAFo8lXi6e_9pvNqu/view?usp=sharing"

   useEffect(() => {
      document.documentElement.setAttribute('data-theme', theme);
   }, [theme])

   // Detect what's behind the bottom nav so it can flip its color scheme
   // when crossing inverted-bg sections (Experience, MoreProjects, OssImpact).

   useEffect(() => {
      const NAV_INVERTED_SECTION_IDS = ['experience', 'more-projects', 'oss-impact', 'services'];
      let rafId: number | null = null;

      const check = () => {
         rafId = null;
         // Nav sits at bottom-6 (24px from bottom) with ~50px height — sample its center.
         const navCenterY = window.innerHeight - 50;
         const overlaps = NAV_INVERTED_SECTION_IDS.some(id => {
            const el = document.getElementById(id);
            if (!el) return false;
            const rect = el.getBoundingClientRect();
            return rect.top <= navCenterY && rect.bottom >= navCenterY;
         });
         setIsNavInverted(overlaps);
      };

      const onScroll = () => {
         if (rafId === null) rafId = requestAnimationFrame(check);
      };

      check();
      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', onScroll);
      return () => {
         window.removeEventListener('scroll', onScroll);
         window.removeEventListener('resize', onScroll);
         if (rafId !== null) cancelAnimationFrame(rafId);
      };
   }, []);

   useEffect(() => {
      const fetchStats = async () => {
         setIsStatsLoading(true);

         try {
            // Helper to fetch and return JSON or null on error
            const fetchJson = async (url: string) => {
               try {
                  const res = await fetch(url);
                  if (!res.ok) {
                     console.warn(`API returned ${res.status} for ${url}`);
                     return null;
                  }
                  return await res.json();
               } catch (e) {
                  console.warn(`Failed to fetch from ${url}:`, e);
                  return null;
               }
            };

            // 1. Use the same API as react-github-calendar for accurate contribution data (last year only)
            const contributionsData = await fetchJson(
               `https://github-contributions-api.jogruber.de/v4/${GITHUB_USERNAME}?y=last`
            );
            if (contributionsData && contributionsData.total) {
               // Get last year's contributions (matches the heatmap)
               if (contributionsData.total.lastYear !== undefined) {
                  setStats(prev => ({ ...prev, commits: contributionsData.total.lastYear }));
               } else {
                  // Fallback: sum contributions from the data
                  const total = contributionsData.contributions?.reduce((acc: number, day: { count?: number }) => acc + (day.count || 0), 0) || 0;
                  setStats(prev => ({ ...prev, commits: total }));
               }
            }

            // 2. Fetch live stars through the cached Vercel API first, then
            // fall back to direct GitHub, then stale local JSON. Never show a
            // fake zero just because a live request got rate-limited.
            try {
               const starsData = await fetchPortfolioGitHubStats();
               if (starsData.stars > 0) {
                  setStats(prev => ({ ...prev, stars: starsData.stars }));
               } else {
                  throw new Error('GitHub returned zero stars unexpectedly');
               }
            } catch (e) {
               console.warn('Failed to fetch live GitHub stars:', e);
               const cachedStarsData = await fetchJson(
                  `https://api.github-star-counter.workers.dev/user/${GITHUB_USERNAME}`
               );
               const fallbackStars =
                  cachedStarsData && typeof cachedStarsData.stars === 'number' && cachedStarsData.stars > 0
                     ? cachedStarsData.stars
                     : getStaticProjectStars();

               setStats(prev => ({ ...prev, stars: Math.max(prev.stars, fallbackStars) }));
            }

            // 3. Fetch PR Count from GitHub API
            const prsData = await fetchJson(
               `https://api.github.com/search/issues?q=type:pr+author:${GITHUB_USERNAME}`
            );
            if (prsData && typeof prsData.total_count === 'number') {
               setStats(prev => ({ ...prev, prs: prsData.total_count }));
            }

         } catch (e) {
            console.error("Critical error fetching GH stats:", e);
         } finally {
            setIsStatsLoading(false);
         }
      };

      // Initial fetch with slight delay to prioritize LCP
      const initialTimer = setTimeout(fetchStats, 1000);

      // Periodic refresh every 5 minutes (300000ms)
      const refreshInterval = setInterval(fetchStats, 300000);
      window.addEventListener('focus', fetchStats);

      return () => {
         clearTimeout(initialTimer);
         clearInterval(refreshInterval);
         window.removeEventListener('focus', fetchStats);
      };
   }, []);

   const finishLoading = useCallback(() => setIsLoading(false), []);

   const openModal = (project: Project) => {
      setSelectedProject(project);
      setIsModalOpen(true);
   };

   const openResumeModal = () => {
      setIsResumeModalOpen(true);
   };

   const projects: Project[] = [
      {
         title: 'AI-Powered Note Manager',
         category: 'AI / Productivity',
         description:
            'A smart, responsive note-taking application built with Next.js 15+ App Router, featuring a rich text Tiptap editor with AI-powered integrations.',
         summary:
            'A modern AI-enhanced note management platform that combines rich text editing, intelligent commands, media support, and seamless organization. Create, edit, search, and manage notes efficiently with AI assistance built directly into the editor experience.',
         details: [
            {
               title: 'The idea',
               body:
                  'Traditional note apps lack intelligent assistance and flexible organization. AI-Powered Note Manager brings AI capabilities directly into the writing workflow, allowing users to create structured notes, trigger AI commands, and manage knowledge efficiently from one place.',
            },
            {
               title: 'Rich AI Editor',
               bullets: [
                  'Tiptap-powered block-style rich text editor for a smooth writing experience',
                  'AI commands triggered directly inside the editor using the / command',
                  'Supports Markdown shortcuts, formatting, links, lists, blockquotes, and code blocks',
                  'Drag-and-drop or paste images with automatic Base64 conversion for instant saving',
               ],
            },
            {
               title: 'Organization & Search',
               body:
                  'Notes can be organized using folders, categories, and custom tags. Real-time search and sorting allow users to quickly find information by content, category, tags, creation date, or modification date.',
            },
            {
               title: 'Authentication & Database',
               bullets: [
                  'Secure authentication using NextAuth.js',
                  'Google and GitHub OAuth provider integration',
                  'MongoDB database integration using Mongoose for reliable data storage',
                  'Designed for scalable and resilient note management',
               ],
            },
            {
               title: 'Stack',
               bullets: [
                  'Next.js 15+ — App Router',
                  'TypeScript',
                  'Tailwind CSS V4 + Tailwind Typography',
                  'Tiptap React Editor',
                  'Lucide React Icons',
                  'MongoDB with Mongoose',
                  'NextAuth.js Authentication',
                  'OpenAI API for AI-powered features',
               ],
            },
         ],
         highlights: [
            'AI-powered writing assistant with editor commands',
            'Rich Tiptap-based block editor with Markdown support',
            'Smart organization using folders, categories, and tags',
            'Secure authentication with Google and GitHub providers',
            'MongoDB-powered scalable note storage',
         ],
         tech: [
            'Next.js 15',
            'TypeScript',
            'Tiptap',
            'Tailwind CSS V4',
            'MongoDB',
            'Mongoose',
            'NextAuth.js',
            'OpenAI API',
            'Lucide React',
         ],
         videoUrl: '',
         thumbnailUrl: '/covers/ai-note-manager.png',
         liveUrl: 'https://ai-powered-note-manager.vercel.app'
      },
      {
         title: 'Smart Service Place',
         category: 'Service Marketplace / Full Stack',
         description:
            'A modern service marketplace platform that connects users with service providers. It enables seamless service booking, appointment management, secure payments, and real-time communication.',
         summary:
            'Smart Service Place is a complete service management ecosystem where users can discover services, book appointments, make payments, and manage their profiles while providers handle bookings, verify services, and track earnings through dedicated dashboards.',
         details: [
            {
               title: 'Service Marketplace',
               bullets: [
                  'Users can browse and discover different services',
                  'Seamless service booking and appointment scheduling',
                  'Dedicated user dashboard for managing bookings and profiles',
                  'Provider dashboard for managing services, bookings, and earnings',
               ],
            },
            {
               title: 'Authentication & Security',
               bullets: [
                  'Secure authentication using NextAuth.js',
                  'Supports Credentials, Google, and Apple authentication providers',
                  'Protected user and provider dashboard access',
                  'Role-based experience for customers and service providers',
               ],
            },
            {
               title: 'Real-time Experience',
               body:
                  'Socket.io integration enables instant updates for booking confirmations, service status changes, and real-time notifications between users and providers.',
            },
            {
               title: 'Payments & Reviews',
               bullets: [
                  'Razorpay integration for secure online payments',
                  'Complete booking payment workflow',
                  'Users can submit ratings and reviews for completed services',
                  'Helps maintain trust and quality across the platform',
               ],
            },
            {
               title: 'Architecture',
               bullets: [
                  'Frontend: React 19 + Next.js 16 App Router',
                  'Backend: Next.js API Routes',
                  'Database: MongoDB with Mongoose',
                  'Authentication: NextAuth.js',
                  'Real-time Communication: Socket.io',
                  'Payments: Razorpay',
                  'UI: Tailwind CSS + Lucide React + React Icons',
                  'Calendar Management: FullCalendar',
               ],
            },
         ],
         highlights: [
            'Complete service booking ecosystem connecting customers and providers',
            'Real-time booking updates powered by Socket.io',
            'Secure payments with Razorpay integration',
            'Separate dashboards for users and service providers',
            'Authentication with multiple OAuth providers',
         ],
         tech: [
            'Next.js 16',
            'React 19',
            'TypeScript',
            'Tailwind CSS',
            'MongoDB',
            'Mongoose',
            'NextAuth.js',
            'Razorpay',
            'Socket.io',
            'FullCalendar',
            'Lucide React',
         ],
         videoUrl: '',
         thumbnailUrl: '/covers/SmartServicePlace.png',
         liveUrl: 'https://smartserviceplace.vercel.app/'
      },
      {
         title: 'DevTrack',
         category: 'Developer Productivity / SaaS',
         description:
            'A personal developer activity tracker that helps developers build consistent coding habits through focused sessions, productivity analytics, and habit tracking.',
         summary:
            'DevTrack is a productivity platform designed for developers to track coding sessions, maintain streaks, and improve focus using a built-in Pomodoro timer. It combines session analytics, personalized focus environments, and visual productivity insights into one seamless experience.',
         details: [
            {
               title: 'Focus & Productivity Tracking',
               bullets: [
                  'Built-in Pomodoro timer with countdown controls',
                  'Document title synchronization for tracking sessions even in background tabs',
                  'Log focused coding sessions with duration, tags, and notes',
                  'Track productivity patterns over time',
               ],
            },
            {
               title: 'Habit Building',
               bullets: [
                  'Daily coding streak tracking to encourage consistency',
                  'Visualize progress and maintain developer habits',
                  'Session history tracking for long-term improvement',
                  'Personal productivity insights through analytics',
               ],
            },
            {
               title: 'Interactive Experience',
               body:
                  'DevTrack provides an engaging developer-focused interface with animated landing sections, customizable wallpapers, and smooth interactions powered by modern animation libraries.',
            },
            {
               title: 'Analytics Dashboard',
               bullets: [
                  'Session history visualization using Recharts',
                  'Track coding activity trends',
                  'Analyze focused work patterns',
                  'Understand productivity growth over time',
               ],
            },
            {
               title: 'Architecture',
               bullets: [
                  'Framework: Next.js 16 App Router',
                  'Language: TypeScript',
                  'Database: PostgreSQL with Prisma ORM',
                  'Authentication: NextAuth v4 with Google OAuth',
                  'State Management: Zustand',
                  'Animations: GSAP + Motion',
                  'UI: Radix UI + Lucide React',
                  'Styling: Tailwind CSS 4',
               ],
            },
         ],
         highlights: [
            'Pomodoro-based developer focus tracking system',
            'Coding streaks and productivity analytics',
            'Google OAuth authentication with NextAuth',
            'Animated SaaS-style landing experience',
            'Modern full-stack architecture with Prisma and PostgreSQL',
         ],
         tech: [
            'Next.js 16',
            'TypeScript',
            'Tailwind CSS 4',
            'PostgreSQL',
            'Prisma ORM',
            'NextAuth.js',
            'Google OAuth',
            'Zustand',
            'GSAP',
            'Motion',
            'Recharts',
            'Radix UI',
            'Lucide React',
         ],
         videoUrl: '',
         thumbnailUrl: '/covers/devtrack.png',
         liveUrl: ''
      },
   ];

   // Nav bg is "light" when (theme is light) XOR (over an inverted section).
   // Drives the glass + text colors so the nav is always readable.
   const navIsOverLightBg = (theme === 'light') !== isNavInverted;


   return (
      <div className="min-h-screen bg-bg-primary text-fg-primary selection:bg-fg-primary selection:text-bg-primary font-sans relative">
         <CustomCursor theme={theme} />
         <AnimatePresence mode="wait">
            {isLoading && (
               <Preloader key="preloader" theme={theme} finishLoading={finishLoading} />
            )}
         </AnimatePresence>

         <AnimatePresence mode="wait">
            {isTransitioning && (
               <div className="fixed inset-0 pointer-events-none z-100 overflow-hidden">
                  <motion.div
                     initial={{ opacity: 0, scale: 0 }}
                     animate={{
                        opacity: [0, 1, 0.5, 0],
                        scale: [0, 1, 5],
                     }}
                     transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                     className="absolute"
                     style={{
                        left: clickPos.x,
                        top: clickPos.y,
                        width: '100vw',
                        height: '100vw',
                        marginLeft: '-50vw',
                        marginTop: '-50vw',
                        borderRadius: '50%',
                        border: theme === 'dark' ? '2px solid rgba(255, 255, 255, 0.1)' : '2px solid rgba(0, 0, 0, 0.1)',
                        background: theme === 'dark'
                           ? 'radial-gradient(circle, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 50%, transparent 70%)'
                           : 'radial-gradient(circle, rgba(0, 0, 0, 0.15) 0%, rgba(0, 0, 0, 0.05) 50%, transparent 70%)',
                        boxShadow: theme === 'dark'
                           ? '0 0 60px rgba(255, 255, 255, 0.1)'
                           : '0 0 60px rgba(0, 0, 0, 0.1)',
                        transform: 'translateZ(0)',
                        willChange: 'transform, opacity',
                     }}
                  />
                  {[...Array(8)].map((_, i) => (
                     <motion.div
                        key={i}
                        initial={{ opacity: 0, height: 0, rotate: i * 45, width: 2 }}
                        animate={{
                           opacity: [0, 0.6, 0],
                           height: ['0px', `${150 + Math.random() * 400}px`],
                           width: [2, 3, 1],
                        }}
                        transition={{
                           duration: 1.0,
                           ease: "easeOut",
                           delay: Math.random() * 0.1
                        }}
                        className="absolute origin-top"
                        style={{
                           left: clickPos.x,
                           top: clickPos.y,
                           background: theme === 'dark'
                              ? 'linear-gradient(to bottom, rgba(255, 255, 255, 0.4), transparent)'
                              : 'linear-gradient(to bottom, rgba(0, 0, 0, 0.4), transparent)',
                           transform: 'translateZ(0)', // Force GPU
                        }}
                     />
                  ))}
               </div>
            )}
         </AnimatePresence>

         <Grain />

         <nav className="fixed bottom-6 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
            <div
               className={`
                  backdrop-blur-2xl backdrop-saturate-150 border rounded-full px-5 md:px-8 py-4 md:py-5 flex items-center gap-4 md:gap-8 w-full md:w-auto justify-between md:justify-center transition-colors duration-300 pointer-events-auto
                  ${navIsOverLightBg
                     ? 'bg-white/70 border-black/10 text-black shadow-[0_8px_32px_rgba(0,0,0,0.08),inset_0_1px_0_0_rgba(255,255,255,0.9)]'
                     : 'bg-zinc-900/60 border-white/15 text-white shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_0_0_rgba(255,255,255,0.12)]'}
               `}
            >
               <span className="font-mono text-sm md:text-base uppercase tracking-widest font-black shrink-0">
                  Abhay-Maurya
               </span>
               <div className="flex items-center gap-4 md:gap-6">
                  <div className="flex lg:hidden items-center gap-4 pr-4 border-r border-current/10">
                     <a href="mailto:theabhaymauryadev@gmail.com" className="opacity-70 hover:opacity-100 transition-opacity">
                        <Mail className="w-4 h-4 md:w-5 md:h-5" />
                     </a>
                     <a href="https://www.linkedin.com/in/abhaymauryadev/" target="_blank" rel="noopener noreferrer" className="opacity-70 hover:opacity-100 transition-opacity">
                        <FaLinkedin className="w-4 h-4 md:w-5 md:h-5" />
                     </a>
                     <a href="https://twitter.com/theabhaywebdev" target="_blank" rel="noopener noreferrer" className="opacity-70 hover:opacity-100 transition-opacity">
                        <FaXTwitter className="w-4 h-4 md:w-5 md:h-5" />
                     </a>
                  </div>
                  <a href="#skills" className="hidden lg:block text-sm md:text-base font-mono uppercase tracking-widest opacity-80 hover:opacity-100 transition-opacity">Skills</a>
                  <a href="#services" className="hidden lg:block text-sm md:text-base font-mono uppercase tracking-widest opacity-80 hover:opacity-100 transition-opacity">Services</a>
                  <a href="#contact" className="hidden lg:block text-sm md:text-base font-mono uppercase tracking-widest opacity-80 hover:opacity-100 transition-opacity">Contact</a>
                  {/* Theme toggle removed */}
               </div>
            </div>
         </nav >

         <StatusBadge isInverted={isNavInverted} theme={theme} />
         <ViewerBadge theme={theme} />

         {/* Stacked Sticky Sections - Each overlaps the previous */}

         {/* Hero Section - Fixed behind everything */}
         <div className="fixed top-0 left-0 right-0 h-screen z-10">
            <Hero theme={theme} onResumeClick={openResumeModal} />
         </div>

         {/* Spacer to push content below the Hero - pointer-events-none to allow interaction with hero */}
         <div className="h-screen pointer-events-none relative z-0" />

         {/* All scrollable content - overlaps the fixed Hero */}
         <div className="relative z-20 bg-bg-primary">
            <Suspense fallback={<div className="h-96" />}>
               {/* <Experience /> */}
               <Work projects={projects} openModal={openModal} />
               <MoreProjects />
               <Skills />
               <OssImpact stats={stats} isLoading={isStatsLoading} />
               <Services />
               <Footer theme={theme} onResumeClick={openResumeModal} />
            </Suspense>
         </div>

         <Suspense fallback={null}>
            <ProjectModal
               isOpen={isModalOpen}
               onClose={() => setIsModalOpen(false)}
               project={selectedProject}
            />

            <ResumeModal
               isOpen={isResumeModalOpen}
               onClose={() => setIsResumeModalOpen(false)}
               resumeUrl={resumeUrl}
            />
         </Suspense>
         <Analytics />
         <SpeedInsights />
      </div >
   );
}


