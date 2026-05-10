import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface PreloaderProps {
  finishLoading: () => void;
  theme?: "light" | "dark";
}

export const Preloader = ({ finishLoading }: PreloaderProps) => {
  const [phase, setPhase] = useState<"text" | "exit">("text");

  useEffect(() => {
    // Text visible for 1.0s (Quick reveal)
    const timer = setTimeout(() => {
      setPhase("exit");
    }, 1000);

    // Cleanup after exit animation (1.5s exit -> wait 2.5s total)
    const cleanup = setTimeout(() => {
      finishLoading();
    }, 2500);

    return () => {
      clearTimeout(timer);
      clearTimeout(cleanup);
    };
  }, [finishLoading]);

  return (
    <div className="fixed inset-0 z-100 flex flex-col pointer-events-none">
      {/* Top Shutter */}
      <motion.div
        initial={{ y: 0 }}
        animate={{ y: phase === "exit" ? "-100%" : 0 }}
        transition={{
          duration: 1.5,
          ease: [0.87, 0, 0.13, 1],
        }}
        className="
            relative z-20
            flex h-[50vh] w-full
            items-end justify-center
            overflow-hidden
            
            bg-white text-[#050505]
            dark:bg-black dark:text-white
        "
      >
        <div className="overflow-hidden px-4 pb-[2vw]">
          <motion.h1
            initial={{ y: "100%" }}
            animate={{
              y: phase === "exit" ? "12%" : "0%",
            }}
            transition={{
              duration: 1.5,
              ease: [0.87, 0, 0.13, 1],
            }}
            className="
                    text-[15vw]
                    leading-[0.9]
                    font-black
                    tracking-tighter
                    font-display
                    will-change-transform
                "
          >
            Abhay
          </motion.h1>
        </div>
      </motion.div>

      {/* Bottom Shutter */}
      <motion.div
        initial={{ y: 0 }}
        animate={{ y: phase === "exit" ? "100%" : 0 }}
        transition={{
          duration: 1.5,
          ease: [0.87, 0, 0.13, 1],
        }}
        className="
            relative z-20
            flex h-[50vh] w-full
            items-start justify-center
            overflow-hidden
        
            bg-black text-white
            dark:bg-white dark:text-[#050505]
        "
      >
        <div className="overflow-hidden px-4 pt-[2vw]">
          <motion.h1
            initial={{ y: "-100%" }}
            animate={{
              y: phase === "exit" ? "-12%" : "0%",
            }}
            transition={{
              duration: 1.5,
              ease: [0.87, 0, 0.13, 1],
            }}
            className="
                    text-[15vw]
                    leading-[0.9]
                    font-black
                    tracking-tighter
                    font-display
                    will-change-transform
                "
          >
            Maurya
          </motion.h1>
        </div>
      </motion.div>
    </div>
  );
};
