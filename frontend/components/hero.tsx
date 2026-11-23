"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  Play,
  ShieldCheck,
  Cpu,
  Database,
  Zap,
  Sparkles,
  ChevronRight,
  Activity,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TriVisionXLogo } from "@/components/TriVisionXLogo";
import { Meteors } from "@/components/ui/meteors";
import { Highlighter } from "@/components/ui/highlighter";

export function Hero() {
  return (
    <section className="relative min-h-[92vh] flex items-center justify-center px-4 sm:px-6 pt-32 pb-24 overflow-hidden bg-background text-foreground select-none">
      {/* ─── ANIMATED LIGHT EFFECTS LAYER ─── */}

      {/* 1. Top Horizon Luminous Light Beam */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent pointer-events-none" />

      {/* 2. Top-Center Breathing Radial Aurora Light Cone */}
      <motion.div
        animate={{
          opacity: [0.18, 0.32, 0.18],
          scale: [1, 1.08, 1],
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] sm:w-[900px] h-[450px] rounded-full blur-[140px] bg-primary/20 dark:bg-primary/25"
      />

      {/* 3. Secondary Ambient Spotlight Behind Core Content */}
      <motion.div
        animate={{
          opacity: [0.12, 0.22, 0.12],
          scale: [0.95, 1.04, 0.95],
        }}
        transition={{
          duration: 9,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
        className="pointer-events-none absolute top-1/3 left-1/2 -translate-x-1/2 w-[380px] sm:w-[560px] h-[300px] rounded-full blur-[120px] bg-primary/15 dark:bg-primary/20"
      />

      {/* 4. Fine Geometric Mesh Grid with Radial Spotlight Mask */}
      <div className="pointer-events-none absolute inset-0 dot-grid [mask-image:radial-gradient(ellipse_70%_60%_at_50%_25%,#000_65%,transparent_100%)] opacity-40 dark:opacity-25" />

      {/* 5. Isometric Line-Grid Coordinate Overlay */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.35)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.35)_1px,transparent_1px)] bg-[size:4.5rem_4.5rem] [mask-image:radial-gradient(ellipse_65%_55%_at_50%_25%,#000_60%,transparent_100%)]" />

      {/* 6. Subtle Drifting Light Meteors */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <Meteors number={12} />
      </div>

      {/* ─── HERO CONTENT STAGE ─── */}
      <div className="relative z-10 max-w-5xl mx-auto w-full flex flex-col items-center text-center space-y-6 sm:space-y-8">
        
        {/* Animated Shimmer Announcement Badge */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-border/80 bg-card/80 backdrop-blur-md shadow-xs hover:border-primary/50 transition-all cursor-pointer group"
        >
          {/* Pulsing Primary Light Beacon */}
          <span className="relative flex size-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex rounded-full size-2 bg-primary" />
          </span>
          <span className="font-mono text-[11px] font-semibold text-muted-foreground group-hover:text-foreground transition-colors">
            TriVisionX OS v2.4 · Multi-Agent Swarm Engine
          </span>
          <ChevronRight className="size-3 text-muted-foreground group-hover:text-foreground transition-transform group-hover:translate-x-0.5" />
        </motion.div>

        {/* Brand Logo with Ambient Glow */}
        <motion.div
          initial={{ opacity: 0, scale: 0.88 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="relative flex items-center justify-center pt-1"
        >
          {/* Logo Radial Backlight */}
          <div className="absolute inset-0 rounded-full blur-xl bg-primary/20 scale-125 pointer-events-none animate-pulse" />
          <TriVisionXLogo size="lg" glow={true} shimmer={true} animate={true} />
        </motion.div>

        {/* Main Headline with Animated Light Gradient */}
        <div className="space-y-3 max-w-4xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-[1.08] text-foreground"
          >
            <span className="block bg-gradient-to-b from-foreground via-foreground/95 to-foreground/65 bg-clip-text text-transparent">
              Autonomous AI Agents
            </span>
            <span className="block mt-1 sm:mt-2 text-2xl sm:text-4xl md:text-5xl font-semibold text-muted-foreground">
              Orchestrated by{" "}
              <span className="text-foreground">
                <Highlighter action="underline" color="#3b82f6" strokeWidth={2.5} isView={false}>
                  LangGraph
                </Highlighter>
              </span>
              .
            </span>
          </motion.h1>
        </div>

        {/* Dual Call-To-Action with Animated Light Borders & Glows */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="flex flex-wrap items-center justify-center gap-3.5 pt-2"
        >
          <a href="/dashboard">
            <Button
              size="lg"
              className="relative group h-12 px-8 rounded-xl text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer gap-2"
            >
              <span>Get Started Free</span>
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </a>

          <a href="#demo-explode">
            <Button
              variant="outline"
              size="lg"
              className="h-12 px-7 rounded-xl text-sm font-semibold border-border bg-card/80 backdrop-blur-md hover:bg-accent text-foreground hover:border-primary/40 shadow-xs transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer gap-2.5"
            >
              <Play className="size-4 text-primary fill-primary/20" />
              <span>Explore Interactive Demo</span>
            </Button>
          </a>
        </motion.div>

        {/* Trust Metric Micro-Ribbon */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.45 }}
          className="flex items-center gap-2 text-xs font-mono text-muted-foreground"
        >
          <span className="size-1.5 rounded-full bg-primary" />
          <span>Zero credit card required</span>
          <span className="text-muted-foreground/40">·</span>
          <span>10k free execution runs/month</span>
          <span className="text-muted-foreground/40">·</span>
          <span>99.9% Uptime SLA</span>
        </motion.div>

        {/* Interactive Glassmorphic Feature Light Chips with 3D Depth */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.55 }}
          className="pt-4 grid grid-cols-2 sm:flex sm:flex-wrap items-center justify-center gap-3 max-w-3xl"
        >
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-border/80 bg-card/80 dark:bg-card/60 backdrop-blur-xl text-xs font-mono text-foreground hover:border-primary/50 hover:bg-card/95 transition-all duration-300 [box-shadow:0_0_0_1px_rgba(0,0,0,.03),0_4px_12px_rgba(0,0,0,.04)] dark:[box-shadow:0_-15px_50px_-15px_#ffffff0d_inset,0_0_0_1px_rgba(255,255,255,.05),0_8px_20px_rgba(0,0,0,.4)] hover:shadow-lg hover:-translate-y-0.5 cursor-default">
            <Cpu className="size-3.5 text-primary shrink-0" />
            <span className="truncate">5-Agent Swarm</span>
          </div>

          <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-border/80 bg-card/80 dark:bg-card/60 backdrop-blur-xl text-xs font-mono text-foreground hover:border-primary/50 hover:bg-card/95 transition-all duration-300 [box-shadow:0_0_0_1px_rgba(0,0,0,.03),0_4px_12px_rgba(0,0,0,.04)] dark:[box-shadow:0_-15px_50px_-15px_#ffffff0d_inset,0_0_0_1px_rgba(255,255,255,.05),0_8px_20px_rgba(0,0,0,.4)] hover:shadow-lg hover:-translate-y-0.5 cursor-default">
            <Database className="size-3.5 text-primary shrink-0" />
            <span className="truncate">Pinecone Vector RAG</span>
          </div>

          <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-border/80 bg-card/80 dark:bg-card/60 backdrop-blur-xl text-xs font-mono text-foreground hover:border-primary/50 hover:bg-card/95 transition-all duration-300 [box-shadow:0_0_0_1px_rgba(0,0,0,.03),0_4px_12px_rgba(0,0,0,.04)] dark:[box-shadow:0_-15px_50px_-15px_#ffffff0d_inset,0_0_0_1px_rgba(255,255,255,.05),0_8px_20px_rgba(0,0,0,.4)] hover:shadow-lg hover:-translate-y-0.5 cursor-default">
            <ShieldCheck className="size-3.5 text-primary shrink-0" />
            <span className="truncate">Citation Audited</span>
          </div>

          <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-border/80 bg-card/80 dark:bg-card/60 backdrop-blur-xl text-xs font-mono text-foreground hover:border-primary/50 hover:bg-card/95 transition-all duration-300 [box-shadow:0_0_0_1px_rgba(0,0,0,.03),0_4px_12px_rgba(0,0,0,.04)] dark:[box-shadow:0_-15px_50px_-15px_#ffffff0d_inset,0_0_0_1px_rgba(255,255,255,.05),0_8px_20px_rgba(0,0,0,.4)] hover:shadow-lg hover:-translate-y-0.5 cursor-default">
            <Zap className="size-3.5 text-primary shrink-0" />
            <span className="truncate">Real-Time SSE Streams</span>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
