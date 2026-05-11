import { motion } from "framer-motion";
import { GitHubCalendar } from "react-github-calendar";
import { Mail, FileText } from "lucide-react";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { useEffect, useRef, useState } from "react";

import { Container } from "../ui/Container";
import { MagneticButton } from "../ui/MagneticButton";
import { ResumeButton } from "../ui/ResumeButton";

interface FooterProps {
  theme: "light" | "dark";
  onResumeClick?: () => void;
}

export const Footer = ({ theme, onResumeClick }: FooterProps) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [contributionCount, setContributionCount] = useState(0);

  // Replace with your GitHub username
  const githubUsername = "YOUR_GITHUB_USERNAME";

  // Fetch GitHub contribution count
  useEffect(() => {
    const fetchContributions = async () => {
      try {
        const res = await fetch(
          `https://github-contributions-api.jogruber.de/v4/${githubUsername}?y=last`,
        );

        const data = await res.json();

        if (data?.total?.lastYear !== undefined) {
          setContributionCount(data.total.lastYear);
        } else if (data?.contributions) {
          const total = data.contributions.reduce(
            (acc: number, day: { count?: number }) => acc + (day.count || 0),
            0,
          );

          setContributionCount(total);
        }
      } catch (error) {
        console.warn("Failed to fetch contributions:", error);
      }
    };

    fetchContributions();
  }, [githubUsername]);

  // Drag scroll handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollContainerRef.current) return;

    setIsDragging(true);

    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);

    setScrollLeft(scrollContainerRef.current.scrollLeft);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollContainerRef.current) return;

    e.preventDefault();

    const x = e.pageX - scrollContainerRef.current.offsetLeft;

    const walk = (x - startX) * 2;

    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  // Auto scroll to latest contributions
  useEffect(() => {
    let scrollTimer: ReturnType<typeof setTimeout> | null = null;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && scrollContainerRef.current) {
            scrollTimer = setTimeout(() => {
              const container = scrollContainerRef.current;

              if (container) {
                container.scrollLeft = container.scrollWidth;
              }
            }, 1000);

            observer.disconnect();
          }
        });
      },
      { threshold: 0.1 },
    );

    if (scrollContainerRef.current) {
      observer.observe(scrollContainerRef.current);
    }

    return () => {
      observer.disconnect();

      if (scrollTimer) {
        clearTimeout(scrollTimer);
      }
    };
  }, []);

  return (
    <footer
      id="contact"
      className="min-h-[80vh] flex flex-col justify-between pt-[4vw] md:pt-8 relative"
    >
      <Container>
        <div className="flex flex-col gap-[12vw] md:gap-16">
          {/* Top Section */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-[8vw] md:gap-8 items-center">
            {/* Heading */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="col-span-1 md:col-span-4"
            >
              <span className="font-mono text-[2.5vw] md:text-base uppercase tracking-widest text-fg-secondary block mb-[3vw] md:mb-4 text-center md:text-left">
                <span className="text-fg-primary/30">06 /</span> Contact
              </span>

              <h2 className="font-display font-black text-[15vw] md:text-8xl lg:text-[10rem] leading-[0.8] tracking-tighter uppercase text-center md:text-left">
                Let's
                <br />
                Build.
              </h2>
            </motion.div>

            {/* GitHub Heatmap */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="col-span-1 md:col-span-8"
            >
              <div className="bg-bg-secondary/50 p-[4vw] md:p-6 rounded-2xl border border-border-primary backdrop-blur-sm">
                {/* Calendar */}
                <div
                  ref={scrollContainerRef}
                  onMouseDown={handleMouseDown}
                  onMouseUp={handleMouseUp}
                  onMouseMove={handleMouseMove}
                  onMouseLeave={handleMouseLeave}
                  className={`overflow-x-scroll select-none ${
                    isDragging ? "cursor-grabbing" : "cursor-grab"
                  }`}
                  style={{
                    scrollbarWidth: "none",
                    msOverflowStyle: "none",
                    WebkitOverflowScrolling: "touch",
                  }}
                >
                  <div
                    style={{
                      width: "fit-content",
                      pointerEvents: isDragging ? "none" : "auto",
                    }}
                  >
                    <GitHubCalendar
                      username={githubUsername}
                      colorScheme={theme === "dark" ? "dark" : "light"}
                      blockSize={12}
                      blockMargin={4}
                      fontSize={12}
                      showColorLegend={false}
                      showTotalCount={false}
                    />
                  </div>
                </div>

                {/* Contribution Info */}
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-border-primary/30">
                  <span className="text-[2.5vw] md:text-sm font-mono text-fg-secondary">
                    {contributionCount.toLocaleString()} contributions in the
                    last year
                  </span>

                  <div className="flex items-center gap-2">
                    <span className="text-[2.5vw] md:text-xs font-mono text-fg-secondary">
                      Less
                    </span>

                    <div className="flex gap-1">
                      {[
                        theme === "dark" ? "#161b22" : "#ebedf0",

                        theme === "dark" ? "#0e4429" : "#9be9a8",

                        theme === "dark" ? "#006d32" : "#40c463",

                        theme === "dark" ? "#26a641" : "#30a14e",

                        theme === "dark" ? "#39d353" : "#216e39",
                      ].map((color, i) => (
                        <div
                          key={i}
                          className="w-[2.5vw] h-[2.5vw] md:w-3 md:h-3 rounded-sm"
                          style={{
                            backgroundColor: color,
                          }}
                        />
                      ))}
                    </div>

                    <span className="text-[2.5vw] md:text-xs font-mono text-fg-secondary">
                      More
                    </span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm md:text-base text-fg-secondary mt-4 leading-relaxed">
                  Consistently building full-stack applications, exploring AI
                  tools, and improving problem-solving through real-world
                  projects.
                </p>
              </div>
            </motion.div>
          </div>

          {/* Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap md:flex-nowrap gap-[3vw] md:gap-4 items-center justify-center w-full"
          >
            {[
              {
                href: "mailto:yourmail@gmail.com",
                icon: <Mail className="w-[4.5vw] h-[4.5vw] md:w-5 md:h-5" />,
                label: "Email",
              },

              {
                href: "https://github.com/YOUR_GITHUB_USERNAME",
                icon: (
                  <FaGithub className="w-[4.5vw] h-[4.5vw] md:w-5 md:h-5" />
                ),
                label: "GitHub",
              },

              {
                href: "https://linkedin.com/in/YOUR_LINKEDIN",
                icon: (
                  <FaLinkedin className="w-[4.5vw] h-[4.5vw] md:w-5 md:h-5" />
                ),
                label: "LinkedIn",
              },
            ].map((btn, i) => (
              <MagneticButton key={i}>
                <a
                  href={btn.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-[6vw] md:px-8 py-[3vw] md:py-4 rounded-full font-bold font-mono text-[2.5vw] md:text-base uppercase transition-all flex items-center gap-[2vw] md:gap-3 whitespace-nowrap border border-border-primary hover:bg-bg-secondary"
                >
                  {btn.icon}
                  {btn.label}
                </a>
              </MagneticButton>
            ))}

            <ResumeButton
              className="font-bold border border-border-primary hover:bg-bg-secondary"
              onClick={onResumeClick}
            />
          </motion.div>
        </div>
      </Container>

      {/* Bottom Footer */}
      <Container className="flex justify-between items-end text-[3vw] md:text-sm pt-[6vw] md:pt-8 font-mono uppercase text-fg-secondary">
        <span>© 2026 Abhay Maurya</span>

        <div className="flex gap-[6vw] md:gap-4">
          <a
            href="https://github.com/YOUR_GITHUB_USERNAME"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-fg-primary transition-colors"
          >
            GitHub
          </a>

          <a
            href="https://linkedin.com/in/YOUR_LINKEDIN"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-fg-primary transition-colors"
          >
            LinkedIn
          </a>
        </div>
      </Container>

      {/* Watermark */}
      <div className="w-full flex justify-center items-end mt-[10vw] md:mt-4 overflow-hidden pointer-events-none select-none">
        <motion.h1
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 0.25, y: 12 }}
          viewport={{ once: true }}
          transition={{
            duration: 1.2,
            ease: "easeOut",
          }}
          className="font-display font-black text-[18vw] md:text-[14vw] leading-[0.7] bg-linear-to-b from-fg-primary to-transparent bg-clip-text text-transparent tracking-tighter uppercase whitespace-nowrap"
        >
          ABHAY Maurya
        </motion.h1>
      </div>
    </footer>
  );
};
