import { motion } from 'framer-motion';
import { Mail,FileText} from 'lucide-react';
import { FaGithub, FaLinkedin } from 'react-icons/fa';

import { Container } from '../ui/Container';
import { SocialButton } from '../ui/SocialButton';
import { ResumeButton } from '../ui/ResumeButton';
import { SideBranding } from '../ui/SideBranding';

interface HeroProps {
    theme?: 'light' | 'dark';
    onResumeClick?: () => void;
}


export const Hero = ({
    theme = 'dark',
    onResumeClick,
}: HeroProps) => {

    return (
        <section
            id="hero"
            className="min-h-dvh lg:min-h-[90vh] relative flex flex-col pb-0 overflow-visible"
        >
            {/* Background Split */}
            <div className="absolute inset-0 z-0 flex flex-col pointer-events-none">

                {/* Top Section */}
                <div
                    className={`relative h-[58%] lg:h-[44%] w-full overflow-hidden ${
                        theme === 'dark'
                            ? 'bg-white'
                            : 'bg-black'
                    }`}
                >
                    <div
                        className={`absolute inset-0 ${
                            theme === 'dark'
                                ? 'bg-linear-to-b from-white via-white/95 to-zinc-100'
                                : 'bg-linear-to-b from-black via-black/95 to-zinc-950'
                        }`}
                    />

                    <div
                        className={`absolute inset-x-0 top-0 h-1/3 ${
                            theme === 'dark'
                                ? 'bg-linear-to-b from-white via-white/40 to-transparent'
                                : 'bg-linear-to-b from-zinc-700/60 via-zinc-800/30 to-transparent'
                        }`}
                    />

                    <div
                        className={`absolute inset-0 ${
                            theme === 'dark'
                                ? 'bg-linear-to-tr from-transparent via-white/15 to-transparent'
                                : 'bg-linear-to-tr from-transparent via-zinc-700/20 to-transparent'
                        }`}
                    />

                    <div
                        className={`absolute inset-x-0 bottom-0 h-12 ${
                            theme === 'dark'
                                ? 'bg-linear-to-t from-zinc-200/50 to-transparent'
                                : 'bg-linear-to-t from-zinc-900/40 to-transparent'
                        }`}
                    />
                </div>

                {/* Bottom Section */}
                <div className="relative h-[42%] lg:h-[56%] w-full overflow-hidden bg-bg-primary">

                    <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-fg-primary/30 to-transparent" />

                    <div className="absolute inset-x-0 top-0 h-1/4 bg-linear-to-b from-fg-primary/[0.05] to-transparent" />

                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(255,255,255,0.06),transparent_70%)]" />
                </div>
            </div>

            {/* Side Branding */}
            <SideBranding />

            <Container className="relative z-10 min-h-dvh lg:h-full flex flex-col pt-4 lg:pt-8 pb-24 lg:pb-10 overflow-visible">

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1 }}
                    className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-8 items-end lg:items-start overflow-visible"
                >

                    {/* Left Content */}
                    <div className="order-2 lg:order-1 lg:row-start-1 lg:col-start-1 lg:col-span-7 relative z-30 pt-24 md:pt-24 h-full flex flex-col pointer-events-none">

                        {/* Heading */}
                        <div className="translate-y-[-20%] lg:translate-y-0 -mb-20 lg:mb-0">

                            <h1
                                className={`font-display font-black text-[13vw] md:text-[11vw] lg:text-9xl xl:text-[9rem] leading-[0.8] lg:leading-[0.85] tracking-tighter uppercase mb-4 lg:mb-6 lg:mix-blend-difference ${
                                    theme === 'light'
                                        ? 'text-white'
                                        : 'text-black'
                                }`}
                            >
                                <motion.span
                                    initial={{
                                        opacity: 0,
                                        x: -20,
                                    }}
                                    animate={{
                                        opacity: 1,
                                        x: 0,
                                    }}
                                    transition={{
                                        duration: 0.8,
                                        delay: 0.2,
                                    }}
                                    className="block"
                                >
                                    ABHAY
                                </motion.span>

                                <motion.span
                                    initial={{
                                        opacity: 0,
                                        x: -20,
                                    }}
                                    animate={{
                                        opacity: 1,
                                        x: 0,
                                    }}
                                    transition={{
                                        duration: 0.8,
                                        delay: 0.4,
                                    }}
                                    className="block"
                                >
                                    MAURYA
                                </motion.span>
                            </h1>
                        </div>

                        {/* Intro */}
                        <motion.div
                            initial={{
                                opacity: 0,
                                y: 20,
                            }}
                            animate={{
                                opacity: 1,
                                y: 0,
                            }}
                            transition={{
                                duration: 0.8,
                                delay: 0.8,
                            }}
                            className="w-full mt-auto mb-2 lg:mb-28 lg:mt-12 pointer-events-auto"
                        >

                            <p className="hero-intro-text max-w-2xl text-sm md:text-xl lg:text-2xl text-fg-secondary leading-relaxed font-medium mb-4 lg:mb-10">

                                <strong className="text-fg-primary font-bold">
                                    MERN Stack Developer
                                </strong>{' '}
                                from{' '}
                                <span className="text-fg-primary">
                                    India
                                </span>{' '}
                                building{' '}
                                <strong className="text-fg-primary">
                                    Full-Stack Web Applications
                                </strong>
                                ,{' '}
                                <strong className="text-fg-primary">
                                    Real-Time Systems
                                </strong>
                                ,{' '}
                                <strong className="text-fg-primary">
                                    AI-Powered Projects
                                </strong>
                                , and modern digital experiences using{' '}
                                <strong className="text-fg-primary">
                                    React, Node.js, MongoDB
                                </strong>
                                , and scalable backend technologies.
                            </p>

                            {/* Social Buttons */}
                            <div className="flex flex-wrap items-center gap-3 md:gap-4 relative z-50">

                                <SocialButton
                                    href="https://github.com/YOUR_GITHUB_USERNAME"
                                    icon={FaGithub}
                                    label="GitHub Profile"
                                />

                                <SocialButton
                                    href="https://linkedin.com/in/YOUR_LINKEDIN"
                                    icon={FaLinkedin}
                                    label="LinkedIn Profile"
                                />

                                <SocialButton
                                    href="mailto:yourmail@gmail.com"
                                    icon={Mail}
                                    label="Email Me"
                                />

                                <SocialButton
                                    href="/resume.pdf"
                                    icon={FileText}
                                    label="Resume"
                                />

                                <ResumeButton
                                    onClick={onResumeClick}
                                />
                            </div>
                        </motion.div>
                    </div>

                    {/* Right Image */}
                    <div className="order-1 lg:order-2 absolute lg:relative inset-0 lg:inset-auto lg:row-start-1 lg:col-start-6 lg:col-span-12 flex justify-center lg:justify-end items-center lg:items-start z-10 pointer-events-none overflow-visible">

                        <motion.div
                            initial={{
                                opacity: 0,
                                scale: 1.05,
                            }}
                            animate={{
                                opacity: 1,
                                scale: 1,
                            }}
                            transition={{
                                duration: 1.2,
                                ease: 'easeOut',
                            }}
                            className="w-full h-full lg:h-auto relative md:opacity-100 transition-opacity duration-1000 overflow-visible"
                        >

                            {/* Mobile Gradient */}
                            <div
                                className={`absolute inset-x-0 bottom-0 top-[40%] lg:hidden z-20 pointer-events-none ${
                                    theme === 'dark'
                                        ? 'bg-linear-to-t from-[#050505] via-[#050505]/40 to-transparent'
                                        : 'bg-linear-to-t from-white via-white/40 to-transparent'
                                }`}
                            />

                            {/* Hero Image */}
                            <motion.img
                                src="/Pic/Hero.webp"
                                alt="Abhay Maurya"
                                loading="eager"
                                fetchPriority="high"
                                initial={false}
                                animate={{
                                    filter:
                                        theme === 'dark'
                                            ? 'grayscale(5%) contrast(115%) brightness(1.05) saturate(1.05)'
                                            : 'grayscale(10%) contrast(105%) brightness(0.98) saturate(1.05)',
                                }}
                                transition={{
                                    duration: 0.8,
                                }}
                                style={{
                                    willChange:
                                        'transform, filter',

                                    WebkitMaskImage:
                                        'linear-gradient(to bottom, black 95%, transparent 100%)',

                                    maskImage:
                                        'linear-gradient(to bottom, black 95%, transparent 100%)',
                                }}
                                className="relative w-full h-[105%] lg:h-full object-contain object-bottom drop-shadow-2xl z-10 scale-[1.35] md:scale-[1.2] lg:scale-110 translate-y-[-35%] md:translate-y-[-15%] lg:-translate-y-8"
                            />
                        </motion.div>
                    </div>
                </motion.div>
            </Container>
        </section>
    );
};