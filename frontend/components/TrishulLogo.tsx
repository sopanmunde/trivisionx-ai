"use client";

import { motion } from "framer-motion";

type LogoSize = "xs" | "sm" | "md" | "lg" | "xl";

interface TrishulLogoProps {
  size?: LogoSize;
  shimmer?: boolean;
  glow?: boolean;
  showWordmark?: boolean;
  wordmark?: string;
  className?: string;
  animate?: boolean;
}

const sizeConfig: Record<
  LogoSize,
  { box: string; icon: string; text: string }
> = {
  xs: {
    box: "h-5 w-5 rounded-md",
    icon: "w-[52%] h-[52%]",
    text: "text-[13px]",
  },
  sm: {
    box: "h-7 w-7 rounded-[8px]",
    icon: "w-[54%] h-[54%]",
    text: "text-[14px]",
  },
  md: {
    box: "h-9 w-9 rounded-[10px]",
    icon: "w-[54%] h-[54%]",
    text: "text-[15px]",
  },
  lg: {
    box: "h-14 w-14 rounded-[14px]",
    icon: "w-[54%] h-[54%]",
    text: "text-[18px]",
  },
  xl: {
    box: "h-20 w-20 rounded-[18px]",
    icon: "w-[54%] h-[54%]",
    text: "text-[22px]",
  },
};

export function TrishulLogo({
  size = "md",
  shimmer = false,
  glow = false,
  showWordmark = false,
  wordmark = "AI Research Assistant",
  className = "",
  animate = true,
}: TrishulLogoProps) {
  const cfg = sizeConfig[size];

  const Wrapper = animate ? motion.div : "div";
  const animateProps = animate
    ? {
      initial: { opacity: 0, y: -6 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.35, ease: "easeOut" },
    }
    : {};

  return (
    <Wrapper
      className={`flex items-center gap-2.5 ${className}`}
      {...animateProps}
    >
      <div className="relative flex-shrink-0">
        {/* Subtle glow ring — only when glow prop is true */}
        {glow && (
          <div
            className="absolute inset-0 rounded-[inherit] animate-pulse-glow blur-xl opacity-80"
            style={{
              background:
                "radial-gradient(circle, rgba(139,92,246,0.4) 0%, rgba(59,130,246,0.2) 50%, transparent 80%)",
              transform: "scale(1.8)",
            }}
          />
        )}

        {/* Premium solid icon box */}
        <div
          className={`relative flex items-center justify-center overflow-hidden select-none z-10 ${cfg.box}
            bg-white dark:bg-zinc-900
            border border-zinc-200 dark:border-zinc-700
            shadow-[0_2px_8px_rgba(0,0,0,0.08)] dark:shadow-black/40 transition-colors duration-300`}
        >
          {/* Subtle inner shine */}
          <div className="absolute inset-0 bg-gradient-to-br from-black/5 via-transparent to-black/5 dark:from-white/10 dark:via-transparent dark:to-black/10 pointer-events-none" />
          {/* Animated sweeping shine */}
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_2.5s_infinite] bg-gradient-to-r from-transparent via-black/5 dark:via-white/10 to-transparent pointer-events-none" />

          {/* Trident / fork SVG */}
          <svg
            className={`relative ${cfg.icon} text-zinc-900 dark:text-zinc-100 transition-colors duration-300`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {/* center prong */}
            <line x1="12" y1="3" x2="12" y2="21" />
            {/* arc top */}
            <path d="M5 7 C5 3 19 3 19 7" />
            {/* left prong */}
            <line x1="5" y1="7" x2="5" y2="13" />
            {/* right prong */}
            <line x1="19" y1="7" x2="19" y2="13" />
            {/* base bar */}
            <line x1="8" y1="21" x2="16" y2="21" />
          </svg>
        </div>
      </div>

      {showWordmark && (
        <span
          className={`font-semibold tracking-tight ${cfg.text} ${shimmer
              ? "animate-shimmer-text"
              : "text-zinc-900 dark:text-zinc-100"
            }`}
        >
          {wordmark}
        </span>
      )}
    </Wrapper>
  );
}
