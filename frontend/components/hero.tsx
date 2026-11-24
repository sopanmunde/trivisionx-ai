"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  ShieldCheck,
  Cpu,
  Database,
  Zap,
  Sparkles,
  ChevronRight,
  Brain,
  Search,
  CheckCircle2,
  Terminal,
  RefreshCw,
  Globe,
  FileText,
  Layers,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Meteors } from "@/components/ui/meteors";
import { Highlighter } from "@/components/ui/highlighter";

interface AgentNodeState {
  id: string;
  label: string;
  role: string;
  icon: any;
  color: string;
  badge: string;
}

const AGENT_NODES: AgentNodeState[] = [
  { id: "planner", label: "Planner", role: "Intent & Task Routing", icon: Brain, color: "text-blue-500", badge: "LangGraph Router" },
  { id: "retriever", label: "Retriever", role: "Pinecone Hybrid MMR", icon: Search, color: "text-cyan-500", badge: "Sub-20ms Vector" },
  { id: "verifier", label: "Verifier", role: "Citation Grounding & Audit", icon: ShieldCheck, color: "text-purple-500", badge: "Self-Correction" },
  { id: "synthesizer", label: "Reporter", role: "Executive Synthesis & Export", icon: FileText, color: "text-emerald-500", badge: "Multi-Format" },
];

export function Hero() {
  const [activeNodeIndex, setActiveNodeIndex] = useState(0);
  const [isCyclePaused, setIsCyclePaused] = useState(false);

  // Autonomous Agent Swarm Cycle Simulation
  useEffect(() => {
    if (isCyclePaused) return;
    const interval = setInterval(() => {
      setActiveNodeIndex((prev) => (prev + 1) % AGENT_NODES.length);
    }, 2800);
    return () => clearInterval(interval);
  }, [isCyclePaused]);

  return (
    <section className="relative min-h-[92vh] flex items-center justify-center px-4 sm:px-6 pt-28 pb-20 overflow-hidden bg-background text-foreground select-none">
      {/* ─── ANIMATED LIGHT EFFECTS LAYER ─── */}

      {/* 1. Top Horizon Luminous Light Beam */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent pointer-events-none" />

      {/* 2. Top-Center Breathing Radial Aurora Light Cone */}
      <motion.div
        animate={{
          opacity: [0.35, 0.55, 0.35],
          scale: [1, 1.08, 1],
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] sm:w-[950px] h-[480px] rounded-full blur-[130px] bg-gradient-to-tr from-blue-500/20 via-indigo-500/20 to-purple-500/15 dark:from-blue-600/30 dark:via-purple-600/30 dark:to-cyan-400/25"
      />

      {/* 3. Secondary Ambient Spotlight Behind Core Content */}
      <motion.div
        animate={{
          opacity: [0.25, 0.4, 0.25],
          scale: [0.95, 1.05, 0.95],
        }}
        transition={{
          duration: 9,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
        className="pointer-events-none absolute top-1/3 left-1/2 -translate-x-1/2 w-[380px] sm:w-[580px] h-[320px] rounded-full blur-[110px] bg-gradient-to-br from-indigo-500/15 via-sky-400/15 to-violet-500/10 dark:from-indigo-500/25 dark:via-cyan-500/25 dark:to-fuchsia-500/20"
      />

      {/* 4. Fine Geometric Mesh Grid with Radial Spotlight Mask */}
      <div className="pointer-events-none absolute inset-0 dot-grid [mask-image:radial-gradient(ellipse_70%_60%_at_50%_25%,#000_65%,transparent_100%)] opacity-40 dark:opacity-25" />

      {/* 5. Isometric Line-Grid Coordinate Overlay */}
      <div className="pointer-events-none absolute inset-0 grid-lines-dual [mask-image:radial-gradient(ellipse_65%_55%_at_50%_25%,#000_60%,transparent_100%)] opacity-60 dark:opacity-40" />

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
            TriVisionX OS v2.5 · Autonomous Multi-Agent Swarm
          </span>
          <ChevronRight className="size-3 text-muted-foreground group-hover:text-foreground transition-transform group-hover:translate-x-0.5" />
        </motion.div>

        {/* Main Headline with Animated Light Gradient */}
        <div className="space-y-3.5 max-w-4xl mx-auto pt-1">
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

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="max-w-2xl mx-auto text-sm sm:text-base text-muted-foreground leading-relaxed pt-1"
          >
            The enterprise research platform that reasons, self-corrects via cyclic LangGraph pipelines, and preserves persistent Pinecone vector memory across sessions.
          </motion.p>
        </div>

        {/* Dual Call-To-Action with Animated Light Borders & Glows */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="flex flex-wrap items-center justify-center gap-3.5 pt-1"
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

          <a href="/demo">
            <Button
              variant="outline"
              size="lg"
              className="relative group h-12 px-7 rounded-xl text-sm font-semibold border-primary/30 bg-card/85 dark:bg-card/70 backdrop-blur-md hover:bg-primary/5 text-foreground hover:border-primary/60 shadow-sm hover:shadow-lg hover:shadow-primary/10 transition-all hover:scale-[1.03] active:scale-[0.98] cursor-pointer gap-2.5 overflow-hidden"
            >
              <span className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
              <span className="relative flex size-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full size-2 bg-emerald-500" />
              </span>
              <Sparkles className="size-4 text-primary" />
              <span>Try Live Demo</span>
            </Button>
          </a>
        </motion.div>

        {/* ─── HERO CENTERPIECE: INTERACTIVE MULTI-AGENT SWARM CONSOLE ─── */}
        <motion.div
          initial={{ opacity: 0, y: 28, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.45, ease: "easeOut" }}
          className="w-full max-w-4xl mx-auto pt-4"
          onMouseEnter={() => setIsCyclePaused(true)}
          onMouseLeave={() => setIsCyclePaused(false)}
        >
          <div className="relative rounded-2xl md:rounded-3xl border border-border/80 bg-card/90 dark:bg-card/75 backdrop-blur-2xl shadow-[0_20px_70px_rgba(0,0,0,0.12)] dark:shadow-[0_24px_80px_rgba(0,0,0,0.6)] overflow-hidden transition-all duration-300 hover:border-primary/40">
            {/* Top macOS Style Window Bar */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/60 bg-muted/40">
              <div className="flex items-center gap-2">
                <div className="size-3 rounded-full bg-red-500/80" />
                <div className="size-3 rounded-full bg-yellow-500/80" />
                <div className="size-3 rounded-full bg-green-500/80" />
                <span className="ml-2 font-mono text-[11px] text-muted-foreground flex items-center gap-1.5">
                  <Terminal className="size-3 text-primary" />
                  <span>trivisionx.swarm://orchestrator.graph</span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-mono text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Self-Correcting Graph
                </span>
                <span className="text-[10px] font-mono text-muted-foreground bg-background/60 px-2 py-0.5 rounded-md border border-border/60">
                  P95: 14.2ms
                </span>
              </div>
            </div>

            {/* Interactive Agent Swarm Pipeline Node Grid */}
            <div className="p-4 sm:p-6 space-y-5">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {AGENT_NODES.map((node, idx) => {
                  const Icon = node.icon;
                  const isActive = activeNodeIndex === idx;
                  return (
                    <button
                      key={node.id}
                      onClick={() => setActiveNodeIndex(idx)}
                      className={`relative p-3.5 rounded-xl border text-left transition-all duration-300 cursor-pointer ${
                        isActive
                          ? "bg-primary/5 border-primary shadow-sm ring-1 ring-primary/30"
                          : "bg-background/60 border-border/70 hover:border-border hover:bg-muted/40"
                      }`}
                    >
                      {isActive && (
                        <span className="absolute -top-1 -right-1 size-2 rounded-full bg-primary animate-ping" />
                      )}
                      <div className="flex items-center justify-between mb-2">
                        <div className={`p-2 rounded-lg ${isActive ? "bg-primary text-primary-foreground shadow-xs" : "bg-muted text-muted-foreground"}`}>
                          <Icon className="size-4" />
                        </div>
                        <Badge variant="outline" className={`text-[9px] font-mono ${isActive ? "border-primary/40 text-primary" : "text-muted-foreground"}`}>
                          0{idx + 1}
                        </Badge>
                      </div>
                      <h4 className="text-xs font-bold text-foreground flex items-center gap-1">
                        {node.label}
                        {isActive && <span className="size-1.5 rounded-full bg-emerald-500" />}
                      </h4>
                      <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">{node.role}</p>
                    </button>
                  );
                })}
              </div>

              {/* Real-Time Live Execution Preview Banner */}
              <div className="rounded-xl border border-border/70 bg-muted/30 p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="size-2 rounded-full bg-primary animate-pulse shrink-0" />
                  <div className="font-mono text-muted-foreground">
                    <span className="text-foreground font-semibold">Active Agent Node: </span>
                    <span className="text-primary font-bold">[{AGENT_NODES[activeNodeIndex].label}] </span>
                    <span className="hidden sm:inline text-muted-foreground/80">— {AGENT_NODES[activeNodeIndex].role}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 font-mono text-[11px] text-muted-foreground shrink-0 self-end sm:self-auto">
                  <span className="text-emerald-500 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="size-3" /> Grounded
                  </span>
                  <span>•</span>
                  <span>MMR $\lambda$=0.65</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ─── FEATURE PILLS ─── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.6 }}
          className="pt-2 grid grid-cols-2 sm:flex sm:flex-wrap items-center justify-center gap-3 max-w-3xl"
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

        {/* ─── LIVE METRICS STRIP ─── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.7 }}
          className="pt-4 w-full max-w-2xl mx-auto grid grid-cols-3 gap-3.5"
        >
          {[
            { label: "Documents Processed", value: "847K+", icon: "📄" },
            { label: "Agent Runs / Day", value: "12,400+", icon: "🤖" },
            { label: "Avg Latency", value: "< 2.1s", icon: "⚡" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col items-center justify-center gap-1 px-4 py-3 rounded-2xl border border-border/70 bg-card/60 backdrop-blur-md text-center hover:border-primary/40 transition-colors"
            >
              <span className="text-lg">{stat.icon}</span>
              <span className="text-base font-extrabold text-foreground tracking-tight">{stat.value}</span>
              <span className="text-[10px] font-mono text-muted-foreground leading-tight">{stat.label}</span>
            </div>
          ))}
        </motion.div>

      </div>
    </section>
  );
}
