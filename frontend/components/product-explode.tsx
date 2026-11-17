"use client";

import React, { useRef, useState } from "react";
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from "framer-motion";
import {
  Cpu,
  Database,
  ShieldCheck,
  Terminal,
  Activity,
  Bot,
  CheckCircle2,
  FileSearch,
  Sparkles,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface LayerData {
  id: string;
  number: string;
  name: string;
  tagline: string;
  badge: string;
  specs: { label: string; value: string }[];
  description: string;
  yOffsetFactor: number;
  zOffsetFactor: number;
}

const LAYERS: LayerData[] = [
  {
    id: "interface",
    number: "01",
    name: "Glassmorphic Client & Copilot Tier",
    tagline: "Ultra-responsive interactive research canvas with Server-Sent Events",
    badge: "Next.js 15 · React 19",
    specs: [
      { label: "Rendering", value: "React 19 Server/Client" },
      { label: "Streaming", value: "SSE Token Pipeline" },
      { label: "UI System", value: "Shadcn UI + Tailwind v4" },
      { label: "Latency", value: "< 24ms TTFT" },
    ],
    description:
      "Interactive workspace uniting multi-modal chat, voice transcription, rich markdown notes, email drafting, and Kanban task scheduling.",
    yOffsetFactor: -130,
    zOffsetFactor: 110,
  },
  {
    id: "agents",
    number: "02",
    name: "LangGraph Multi-Agent Orchestrator",
    tagline: "Cyclic stateful graph coordinating specialized autonomous agents",
    badge: "LangGraph · Multi-LLM",
    specs: [
      { label: "Topology", value: "Cyclic 6-Graph Matrix" },
      { label: "Routing", value: "Supervisor + Planner" },
      { label: "Providers", value: "Gemini · OpenAI · Claude · Groq" },
      { label: "Verification", value: "Citation Confidence Auditing" },
    ],
    description:
      "Dynamically routes prompts between Research, Coding, Data Analysis, and Competitive subgraphs with automated provider failover.",
    yOffsetFactor: -45,
    zOffsetFactor: 35,
  },
  {
    id: "rag",
    number: "03",
    name: "Multimodal RAG & Pinecone Vector Store",
    tagline: "High-dimensional semantic embedding index with MMR diversity search",
    badge: "Pinecone · Google GenAI",
    specs: [
      { label: "Vector DB", value: "Pinecone Serverless" },
      { label: "Embeddings", value: "gemini-embedding-001" },
      { label: "Search Mode", value: "MMR (Lambda = 0.75)" },
      { label: "Vision OCR", value: "Gemini Vision Multimodal" },
    ],
    description:
      "Ingests PDFs, DOCX, XLSX, and images with automatic OCR fallback, indexing dense chunks for grounded citation back-referencing.",
    yOffsetFactor: 45,
    zOffsetFactor: -35,
  },
  {
    id: "infrastructure",
    number: "04",
    name: "Async Engine & Sandboxed Execution",
    tagline: "Enterprise persistence, Redis cache, and isolated code sandbox",
    badge: "FastAPI · Motor · Redis",
    specs: [
      { label: "Gateway", value: "FastAPI 0.115 + Uvicorn" },
      { label: "Database", value: "MongoDB Atlas (Async Motor)" },
      { label: "Sandbox", value: "Subprocess Isolate (30s SLA)" },
      { label: "Security", value: "Prompt Injection Scanner" },
    ],
    description:
      "High-throughput asynchronous gateway with graceful connection draining, slowapi rate-limiting, and zero-leakage Python sandboxing.",
    yOffsetFactor: 130,
    zOffsetFactor: -110,
  },
];

export function ProductExplode() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedLayerId, setSelectedLayerId] = useState<string>("interface");

  // Scroll tracking across section
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 24,
    mass: 0.5,
  });

  // As user scrolls through this section:
  // [0.08, 0.42]: Explodes outward into 3D isometric layers
  // [0.42, 0.72]: Holds fully exploded view for inspection
  // [0.72, 0.95]: Reassembles smoothly as user scrolls past
  const spread = useTransform(smoothProgress, [0.08, 0.42, 0.72, 0.95], [0, 1, 1, 0]);

  // 3D Scene tilt angles dynamically as you scroll
  const sceneRotateX = useTransform(smoothProgress, [0.08, 0.42], [22, 54]);
  const sceneRotateZ = useTransform(smoothProgress, [0.08, 0.42], [-14, -34]);
  const sceneRotateY = useTransform(smoothProgress, [0.08, 0.42], [0, 6]);

  // Alignment guide lines appear smoothly as layers explode
  const guideOpacity = useTransform(spread, [0.15, 0.6], [0, 0.7]);

  // Dynamic layer offsets calculated on GPU
  const l0Y = useTransform(spread, (v) => LAYERS[0].yOffsetFactor * v);
  const l0Z = useTransform(spread, (v) => LAYERS[0].zOffsetFactor * v);

  const l1Y = useTransform(spread, (v) => LAYERS[1].yOffsetFactor * v);
  const l1Z = useTransform(spread, (v) => LAYERS[1].zOffsetFactor * v);

  const l2Y = useTransform(spread, (v) => LAYERS[2].yOffsetFactor * v);
  const l2Z = useTransform(spread, (v) => LAYERS[2].zOffsetFactor * v);

  const l3Y = useTransform(spread, (v) => LAYERS[3].yOffsetFactor * v);
  const l3Z = useTransform(spread, (v) => LAYERS[3].zOffsetFactor * v);

  const activeLayer = LAYERS.find((l) => l.id === selectedLayerId) || LAYERS[0];

  return (
    <section
      id="product-explode"
      ref={containerRef}
      className="relative py-28 px-4 sm:px-6 lg:px-8 bg-background text-foreground overflow-hidden select-none"
    >
      {/* 3D Ambient Backdrop Spotlight */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-primary/5 rounded-full blur-[140px] pointer-events-none -z-10" />

      {/* Subtle Dot-grid Background */}
      <div className="absolute inset-0 dot-grid [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30 dark:opacity-20 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto z-10">
        {/* Unified 3D Section Header */}
        <div className="text-center mb-14 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-border/80 bg-muted/50 text-foreground text-xs font-medium tracking-wide shadow-xs mb-4">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span>LAYERED RUNTIME ARCHITECTURE</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-foreground">
            Hardware-grade AI runtime.
            <br />
            <span className="text-muted-foreground font-semibold">Deconstructed layer by layer.</span>
          </h2>
          <p className="max-w-2xl mx-auto text-sm sm:text-base text-muted-foreground mt-3 leading-relaxed">
            Scroll down to trigger the kinetic 3D exploded view and inspect each architectural layer from client streaming to isolated Python sandboxes.
          </p>
        </div>

        {/* 3D Exploded View Canvas Stage */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: 3D Layer Stack Scene */}
          <div className="lg:col-span-7 relative flex items-center justify-center min-h-[540px] sm:min-h-[620px] py-10 overflow-visible">
            <div
              className="relative w-[300px] sm:w-[440px] md:w-[480px] h-[340px] sm:h-[400px]"
              style={{
                perspective: "1200px",
                transformStyle: "preserve-3d",
              }}
            >
              <motion.div
                className="relative w-full h-full"
                style={{
                  rotateX: sceneRotateX,
                  rotateZ: sceneRotateZ,
                  rotateY: sceneRotateY,
                  transformStyle: "preserve-3d",
                }}
              >
                {/* Connecting Alignment Guides */}
                <motion.div
                  style={{ opacity: guideOpacity, transform: "translateZ(0px)" }}
                  className="absolute inset-x-12 inset-y-8 border border-dashed border-border/70 rounded-3xl pointer-events-none"
                />

                {/* ─── LAYER 1: CLIENT & COPILOT INTERFACE ─── */}
                <motion.div
                  onClick={() => setSelectedLayerId("interface")}
                  style={{
                    y: l0Y,
                    z: l0Z,
                    transformStyle: "preserve-3d",
                    zIndex: 40,
                  }}
                  animate={{
                    scale: selectedLayerId === "interface" ? 1.04 : 1,
                  }}
                  transition={{ type: "spring", stiffness: 220, damping: 22 }}
                  className={cn(
                    "absolute inset-0 rounded-2xl border p-4 sm:p-5 cursor-pointer transition-all duration-300 flex flex-col justify-between select-none backdrop-blur-xl",
                    selectedLayerId === "interface"
                      ? "border-primary/90 bg-card/95 [box-shadow:0_0_0_2px_rgba(59,130,246,0.35),0_20px_50px_rgba(0,0,0,.15)] dark:[box-shadow:0_-20px_80px_-20px_#ffffff1f_inset,0_0_0_2px_rgba(59,130,246,0.4),0_20px_50px_rgba(0,0,0,.8)]"
                      : "border-border/80 bg-card/85 dark:bg-card/65 [box-shadow:0_0_0_1px_rgba(0,0,0,.03),0_8px_30px_rgba(0,0,0,.08)] dark:[box-shadow:0_-20px_80px_-20px_#ffffff0d_inset,0_0_0_1px_rgba(255,255,255,.05),0_12px_36px_rgba(0,0,0,.5)] hover:border-primary/50"
                  )}
                >
                  <div className="flex items-center justify-between border-b border-border/70 pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="size-2 rounded-full bg-primary" />
                      <span className="text-[11px] font-mono font-bold tracking-wider text-foreground">
                        LAYER 01 : CLIENT TIERS
                      </span>
                    </div>
                    <Badge variant="outline" className="text-[10px] border-border/80">
                      Next.js 15
                    </Badge>
                  </div>

                  <div className="space-y-2.5 my-2">
                    <div className="rounded-xl border border-border/70 bg-muted/40 p-3 shadow-inner">
                      <div className="flex items-center gap-2 mb-1.5">
                        <Bot className="size-3.5 text-primary" />
                        <span className="text-[11px] font-semibold text-foreground">TriVisionX AI Copilot</span>
                        <Badge variant="secondary" className="ml-auto text-[9px]">
                          Streaming Active
                        </Badge>
                      </div>
                      <p className="text-[11px] text-muted-foreground line-clamp-2">
                        Comparing algorithmic latency across multi-modal vector partitions...
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono bg-muted/80 px-2 py-1 rounded text-foreground border border-border/70">
                        Confidence: 99.4%
                      </span>
                      <span className="text-[10px] font-mono bg-muted/80 px-2 py-1 rounded text-foreground border border-border/70">
                        Citations: 5 Verified
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-muted-foreground font-mono pt-1">
                    <span>Interactive Workspace View</span>
                    <span className="text-foreground font-semibold">Click to Inspect →</span>
                  </div>
                </motion.div>

                {/* ─── LAYER 2: LANGGRAPH 5-AGENT ORCHESTRATOR ─── */}
                <motion.div
                  onClick={() => setSelectedLayerId("agents")}
                  style={{
                    y: l1Y,
                    z: l1Z,
                    transformStyle: "preserve-3d",
                    zIndex: 30,
                  }}
                  animate={{
                    scale: selectedLayerId === "agents" ? 1.04 : 1,
                  }}
                  transition={{ type: "spring", stiffness: 220, damping: 22 }}
                  className={cn(
                    "absolute inset-0 rounded-2xl border p-4 sm:p-5 cursor-pointer transition-all duration-300 flex flex-col justify-between select-none backdrop-blur-xl",
                    selectedLayerId === "agents"
                      ? "border-primary/90 bg-card/95 [box-shadow:0_0_0_2px_rgba(59,130,246,0.35),0_20px_50px_rgba(0,0,0,.15)] dark:[box-shadow:0_-20px_80px_-20px_#ffffff1f_inset,0_0_0_2px_rgba(59,130,246,0.4),0_20px_50px_rgba(0,0,0,.8)]"
                      : "border-border/80 bg-card/85 dark:bg-card/65 [box-shadow:0_0_0_1px_rgba(0,0,0,.03),0_8px_30px_rgba(0,0,0,.08)] dark:[box-shadow:0_-20px_80px_-20px_#ffffff0d_inset,0_0_0_1px_rgba(255,255,255,.05),0_12px_36px_rgba(0,0,0,.5)] hover:border-primary/50"
                  )}
                >
                  <div className="flex items-center justify-between border-b border-border/70 pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="size-2 rounded-full bg-primary" />
                      <span className="text-[11px] font-mono font-bold tracking-wider text-foreground">
                        LAYER 02 : AGENT SWARM
                      </span>
                    </div>
                    <Badge variant="outline" className="text-[10px] border-border/80">
                      LangGraph Pipeline
                    </Badge>
                  </div>

                  {/* Node Grid Representation */}
                  <div className="grid grid-cols-3 gap-2 my-2">
                    <div className="rounded-lg bg-muted/40 border border-border/70 p-2 text-center">
                      <Cpu className="size-3.5 text-primary mx-auto mb-1" />
                      <span className="text-[10px] font-mono text-foreground font-semibold block">Router</span>
                      <span className="text-[9px] text-muted-foreground">Intent Classify</span>
                    </div>
                    <div className="rounded-lg bg-muted/40 border border-border/70 p-2 text-center">
                      <FileSearch className="size-3.5 text-primary mx-auto mb-1" />
                      <span className="text-[10px] font-mono text-foreground font-semibold block">Retriever</span>
                      <span className="text-[9px] text-muted-foreground">Pinecone MMR</span>
                    </div>
                    <div className="rounded-lg bg-muted/40 border border-border/70 p-2 text-center">
                      <ShieldCheck className="size-3.5 text-primary mx-auto mb-1" />
                      <span className="text-[10px] font-mono text-foreground font-semibold block">Auditor</span>
                      <span className="text-[9px] text-muted-foreground">Source Hash</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-muted-foreground font-mono pt-1">
                    <span>5 Autonomous Sub-Agents</span>
                    <span className="text-foreground font-semibold">Click to Inspect →</span>
                  </div>
                </motion.div>

                {/* ─── LAYER 3: MULTIMODAL VECTOR RAG & PINECONE ─── */}
                <motion.div
                  onClick={() => setSelectedLayerId("rag")}
                  style={{
                    y: l2Y,
                    z: l2Z,
                    transformStyle: "preserve-3d",
                    zIndex: 20,
                  }}
                  animate={{
                    scale: selectedLayerId === "rag" ? 1.04 : 1,
                  }}
                  transition={{ type: "spring", stiffness: 220, damping: 22 }}
                  className={cn(
                    "absolute inset-0 rounded-2xl border p-4 sm:p-5 cursor-pointer transition-all duration-300 flex flex-col justify-between select-none backdrop-blur-xl",
                    selectedLayerId === "rag"
                      ? "border-primary/90 bg-card/95 [box-shadow:0_0_0_2px_rgba(59,130,246,0.35),0_20px_50px_rgba(0,0,0,.15)] dark:[box-shadow:0_-20px_80px_-20px_#ffffff1f_inset,0_0_0_2px_rgba(59,130,246,0.4),0_20px_50px_rgba(0,0,0,.8)]"
                      : "border-border/80 bg-card/85 dark:bg-card/65 [box-shadow:0_0_0_1px_rgba(0,0,0,.03),0_8px_30px_rgba(0,0,0,.08)] dark:[box-shadow:0_-20px_80px_-20px_#ffffff0d_inset,0_0_0_1px_rgba(255,255,255,.05),0_12px_36px_rgba(0,0,0,.5)] hover:border-primary/50"
                  )}
                >
                  <div className="flex items-center justify-between border-b border-border/70 pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="size-2 rounded-full bg-primary" />
                      <span className="text-[11px] font-mono font-bold tracking-wider text-foreground">
                        LAYER 03 : VECTOR MEMORY
                      </span>
                    </div>
                    <Badge variant="outline" className="text-[10px] border-border/80">
                      Pinecone MMR
                    </Badge>
                  </div>

                  <div className="space-y-1.5 my-2">
                    <div className="flex items-center justify-between text-[11px] font-mono bg-muted/40 p-2 rounded-lg border border-border/70">
                      <span className="text-muted-foreground">Index Partition:</span>
                      <span className="text-foreground font-semibold">trivisionx-mmr-v2</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] font-mono bg-muted/40 p-2 rounded-lg border border-border/70">
                      <span className="text-muted-foreground">Vector Dimensions:</span>
                      <span className="text-foreground font-semibold">1,536-dim gemini</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-muted-foreground font-mono pt-1">
                    <span>Dense Semantic Chunks</span>
                    <span className="text-foreground font-semibold">Click to Inspect →</span>
                  </div>
                </motion.div>

                {/* ─── LAYER 4: DISTRIBUTED BACKEND & SANDBOX RUNTIME ─── */}
                <motion.div
                  onClick={() => setSelectedLayerId("infrastructure")}
                  style={{
                    y: l3Y,
                    z: l3Z,
                    transformStyle: "preserve-3d",
                    zIndex: 10,
                  }}
                  animate={{
                    scale: selectedLayerId === "infrastructure" ? 1.04 : 1,
                  }}
                  transition={{ type: "spring", stiffness: 220, damping: 22 }}
                  className={cn(
                    "absolute inset-0 rounded-2xl border p-4 sm:p-5 cursor-pointer transition-all duration-300 flex flex-col justify-between select-none backdrop-blur-xl",
                    selectedLayerId === "infrastructure"
                      ? "border-primary/90 bg-card/95 [box-shadow:0_0_0_2px_rgba(59,130,246,0.35),0_20px_50px_rgba(0,0,0,.15)] dark:[box-shadow:0_-20px_80px_-20px_#ffffff1f_inset,0_0_0_2px_rgba(59,130,246,0.4),0_20px_50px_rgba(0,0,0,.8)]"
                      : "border-border/80 bg-card/85 dark:bg-card/65 [box-shadow:0_0_0_1px_rgba(0,0,0,.03),0_8px_30px_rgba(0,0,0,.08)] dark:[box-shadow:0_-20px_80px_-20px_#ffffff0d_inset,0_0_0_1px_rgba(255,255,255,.05),0_12px_36px_rgba(0,0,0,.5)] hover:border-primary/50"
                  )}
                >
                  <div className="flex items-center justify-between border-b border-border/70 pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="size-2 rounded-full bg-primary" />
                      <span className="text-[11px] font-mono font-bold tracking-wider text-foreground">
                        LAYER 04 : CORE INFRASTRUCTURE
                      </span>
                    </div>
                    <Badge variant="outline" className="text-[10px] border-border/80">
                      FastAPI · Motor
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-2 my-2">
                    <div className="rounded-lg bg-muted/40 border border-border/70 p-2">
                      <Database className="size-3 text-primary mb-1" />
                      <span className="text-[10px] font-mono text-foreground block font-semibold">MongoDB Atlas</span>
                      <span className="text-[9px] text-muted-foreground">Motor async ODM</span>
                    </div>
                    <div className="rounded-lg bg-muted/40 border border-border/70 p-2">
                      <Terminal className="size-3 text-primary mb-1" />
                      <span className="text-[10px] font-mono text-foreground block font-semibold">Python Sandbox</span>
                      <span className="text-[9px] text-muted-foreground">Isolated 30s SLA</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-muted-foreground font-mono pt-1">
                    <span>Zero Data Leakage Security</span>
                    <span className="text-foreground font-semibold">Click to Inspect →</span>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>

          {/* Right Column: Deep Inspector Panel with 3D Depth Card */}
          <div className="lg:col-span-5 flex flex-col justify-center space-y-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeLayer.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="rounded-2xl border border-border/80 bg-card/90 dark:bg-card/75 backdrop-blur-2xl [box-shadow:0_0_0_1px_rgba(0,0,0,.03),0_12px_36px_rgba(0,0,0,.08)] dark:[box-shadow:0_-20px_80px_-20px_#ffffff10_inset,0_0_0_1px_rgba(255,255,255,.06),0_16px_36px_rgba(0,0,0,.5)] overflow-hidden">
                  <div className="pb-3 pt-5 px-6 border-b border-border/70">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-mono font-bold tracking-widest text-muted-foreground uppercase">
                        ARCHITECTURAL LAYER {activeLayer.number}
                      </span>
                      <Badge variant="secondary" className="text-xs font-semibold px-2.5 py-0.5">
                        {activeLayer.badge}
                      </Badge>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
                      {activeLayer.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1 font-normal leading-relaxed">
                      {activeLayer.tagline}
                    </p>
                  </div>

                  <div className="px-6 py-5 space-y-5">
                    {/* Specs Grid */}
                    <div className="grid grid-cols-2 gap-2.5 bg-muted/40 p-3.5 rounded-xl border border-border/70">
                      {activeLayer.specs.map((spec, idx) => (
                        <div key={idx} className="space-y-0.5">
                          <span className="text-[10px] font-mono text-muted-foreground uppercase">{spec.label}</span>
                          <span className="text-xs font-semibold text-foreground block truncate">{spec.value}</span>
                        </div>
                      ))}
                    </div>

                    {/* Architectural Description */}
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {activeLayer.description}
                    </p>

                    {/* Layer Picker Quick Switcher */}
                    <div className="border-t border-border/70 pt-4 flex flex-wrap gap-2">
                      {LAYERS.map((layer) => (
                        <button
                          key={layer.id}
                          onClick={() => setSelectedLayerId(layer.id)}
                          className={cn(
                            "px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer flex items-center gap-1.5 border",
                            (selectedLayerId || "interface") === layer.id
                              ? "bg-primary text-primary-foreground border-primary shadow-xs"
                              : "bg-muted text-muted-foreground border-border/80 hover:text-foreground"
                          )}
                        >
                          <span>{layer.number}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Quick Summary Callouts */}
            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-3.5 rounded-xl border border-border/80 bg-card/85 dark:bg-card/65 backdrop-blur-md flex items-center gap-2.5 shadow-xs">
                <CheckCircle2 className="size-4 text-primary shrink-0" />
                <span className="text-foreground font-medium">Zero-State Coupling</span>
              </div>
              <div className="p-3.5 rounded-xl border border-border/80 bg-card/85 dark:bg-card/65 backdrop-blur-md flex items-center gap-2.5 shadow-xs">
                <Activity className="size-4 text-primary shrink-0" />
                <span className="text-foreground font-medium">Live MMR Telemetry</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
