"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

interface Brand {
  name: string;
  category: string;
  svg: React.ReactNode;
}

const brands: Brand[] = [
  {
    name: "Vercel",
    category: "Deployment",
    svg: (
      <svg className="size-4 fill-current" viewBox="0 0 1155 1000">
        <path d="m577.3 0 577.4 1000H0z" />
      </svg>
    ),
  },
  {
    name: "Stripe",
    category: "Payments",
    svg: (
      <svg className="size-4 fill-current" viewBox="0 0 24 24">
        <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.839 3.771 6.323 6.854 7.426 2.046.708 2.723 1.407 2.723 2.327 0 .93-.772 1.455-2.095 1.455-2.054 0-4.96-.948-6.903-2.073l-.903 5.464c1.868.802 4.749 1.437 7.9 1.437 2.668 0 4.833-.653 6.304-1.872 1.547-1.275 2.34-3.12 2.34-5.461 0-4.838-3.69-6.323-6.804-7.426z" />
      </svg>
    ),
  },
  {
    name: "Linear",
    category: "Issue Tracker",
    svg: (
      <svg className="size-4 fill-current" viewBox="0 0 24 24">
        <path d="M3.14 3.14a12 12 0 0 1 17.72 0l-8.86 8.86-8.86-8.86zm17.72 17.72a12 12 0 0 1-17.72 0l8.86-8.86 8.86 8.86z" />
      </svg>
    ),
  },
  {
    name: "Notion",
    category: "Knowledge Base",
    svg: (
      <svg className="size-4 fill-current" viewBox="0 0 24 24">
        <path d="M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L17.86 1.968c-.42-.326-.981-.7-2.055-.607L3.105 2.295c-.466.046-.56.28-.373.466zm.84 3.034v13.635c0 .7.373 1.073 1.12 1.026l14.195-.84c.746-.046.886-.466.886-1.12V6.634c0-.653-.28-.98-1.026-.933l-14.195.84c-.747.047-.98.373-.98 1.027z" />
      </svg>
    ),
  },
  {
    name: "Figma",
    category: "Design System",
    svg: (
      <svg className="size-4 fill-current" viewBox="0 0 24 24">
        <path d="M8 24c2.2 0 4-1.8 4-4v-4H8c-2.2 0-4 1.8-4 4s1.8 4 4 4zM4 12c0-2.2 1.8-4 4-4h4v8H8c-2.2 0-4-1.8-4-4zm0-8c0-2.2 1.8-4 4-4h4v8H8C5.8 8 4 6.2 4 4zm8-4h4c2.2 0 4 1.8 4 4s-1.8 4-4 4h-4V0zm0 8h4c2.2 0 4 1.8 4 4s-1.8 4-4 4h-4V8z" />
      </svg>
    ),
  },
  {
    name: "Slack",
    category: "Messaging",
    svg: (
      <svg className="size-4 fill-current" viewBox="0 0 24 24">
        <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z" />
      </svg>
    ),
  },
  {
    name: "Discord",
    category: "Community",
    svg: (
      <svg className="size-4 fill-current" viewBox="0 0 24 24">
        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
      </svg>
    ),
  },
  {
    name: "GitHub",
    category: "Version Control",
    svg: (
      <svg className="size-4 fill-current" viewBox="0 0 24 24">
        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
      </svg>
    ),
  },
];

/** Horizontal marquee strip of partner ecosystem cards for placement inside hero bottom. */
export function LogoMarquee() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 16 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: 0.6 }}
      className="relative z-10 w-full max-w-7xl mx-auto select-none"
    >
      <div className="relative overflow-hidden [mask-image:linear-gradient(to_right,transparent_0%,black_10%,black_90%,transparent_100%)]">
        {/* Marquee container with 3D glassmorphic chips */}
        <div className="flex animate-marquee py-2">
          {[...brands, ...brands].map((brand, index) => (
            <div
              key={index}
              className="flex items-center justify-center shrink-0 mx-3 group cursor-pointer"
            >
              <div className="flex items-center gap-3 px-5 py-2.5 rounded-2xl border border-border/80 bg-card/85 dark:bg-card/55 backdrop-blur-xl transition-all duration-300 group-hover:border-primary/50 group-hover:bg-card group-hover:-translate-y-1 [box-shadow:0_0_0_1px_rgba(0,0,0,.02),0_4px_12px_rgba(0,0,0,.04)] dark:[box-shadow:0_-10px_30px_-10px_#ffffff0d_inset,0_0_0_1px_rgba(255,255,255,.05),0_6px_18px_rgba(0,0,0,.4)] group-hover:shadow-lg">
                <div className="size-8 rounded-xl bg-muted/80 border border-border/80 flex items-center justify-center text-foreground group-hover:text-primary group-hover:border-primary/40 transition-colors shadow-xs">
                  {brand.svg}
                </div>
                <div className="flex flex-col text-left">
                  <span className="font-bold text-sm text-foreground tracking-tight group-hover:text-primary transition-colors">
                    {brand.name}
                  </span>
                  <span className="text-[10px] font-mono text-muted-foreground">
                    {brand.category}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
