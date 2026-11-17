"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { ArrowRight, Bot, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function FinalCTA() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="relative py-28 px-4 sm:px-6 lg:px-8 overflow-hidden bg-background select-none">
      {/* 3D Ambient Backdrop Spotlight */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-primary/5 rounded-full blur-[140px] pointer-events-none -z-10" />

      {/* Subtle Dot-grid background with radial fade mask */}
      <div className="pointer-events-none absolute inset-0 dot-grid [mask-image:radial-gradient(ellipse_80%_70%_at_50%_50%,#000_40%,transparent_100%)] opacity-30 dark:opacity-20" />

      <div className="max-w-4xl mx-auto relative z-10">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="relative text-center border border-border/80 bg-card/90 dark:bg-card/75 backdrop-blur-2xl rounded-3xl p-10 md:p-16 [box-shadow:0_0_0_1px_rgba(0,0,0,.04),0_20px_50px_rgba(0,0,0,.12),0_40px_80px_rgba(0,0,0,.08)] dark:[box-shadow:0_-20px_80px_-20px_#ffffff10_inset,0_0_0_1px_rgba(255,255,255,.06),0_20px_60px_rgba(0,0,0,.8)]"
        >
          {/* Unified 3D Section Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-border/80 bg-muted/50 text-foreground text-xs font-medium tracking-wide shadow-xs mb-6">
            <Bot className="w-3.5 h-3.5 text-primary" />
            <span>ZERO-LATENCY MULTI-AGENT SWARMS</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-foreground mb-4">
            Ready to automate at agentic scale?
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-muted-foreground mb-10 max-w-xl mx-auto leading-relaxed">
            Join developers and enterprises building self-correcting agent systems, semantic MMR retrieval chains, and multi-model routing pipelines.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <Button
              asChild
              size="lg"
              className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl px-8 h-12 text-sm font-semibold flex items-center justify-center gap-2 shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              <Link href="/pricing">
                Get Started Free
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="w-full sm:w-auto rounded-xl px-8 h-12 text-sm font-semibold border-border/80 text-foreground hover:bg-accent hover:text-accent-foreground bg-card/60 backdrop-blur-md flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              <Link href="/contact">Contact Us</Link>
            </Button>
          </div>

          <p className="mt-8 text-[11px] font-mono text-muted-foreground">
            Free tier includes 10k execution cycles/month. Enterprise SLAs and SSO available.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
