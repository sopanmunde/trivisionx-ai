"use client";

import React, { useRef, useState } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import {
  Play,
  Bot,
  BrainCircuit,
  Calendar,
  Mail,
  CheckSquare,
  FileText,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { HeroVideoDialog } from "@/components/ui/hero-video-dialog";

export function VideoExplodeScroll() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  // Link explosion animation smoothly to page scroll
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
  // [0.08, 0.42]: Explodes outward from center video
  // [0.42, 0.72]: Holds fully exploded position for live demo inspection
  // [0.72, 0.95]: Reassembles as user scrolls past
  const explodeFactor = useTransform(smoothProgress, [0.08, 0.42, 0.72, 0.95], [0, 1, 1, 0]);

  // Central Core Video Transforms with 3D Depth
  const centralScale = useTransform(explodeFactor, [0, 1], [0.94, 1.05]);
  const centralRotateX = useTransform(explodeFactor, [0, 1], [12, 0]);
  const centralY = useTransform(explodeFactor, [0, 1], [20, 0]);
  const guideOpacity = useTransform(explodeFactor, [0.2, 0.5], [0, 0.7]);
  const moduleOpacity = useTransform(explodeFactor, [0, 0.2], [0, 1]);

  // Exploding Modules Offsets (Scatter outward on scroll down, pull back on scroll up)
  const xTL = useTransform(explodeFactor, [0, 1], [0, -330]);
  const yTL = useTransform(explodeFactor, [0, 1], [0, -190]);
  const rTL = useTransform(explodeFactor, [0, 1], [0, -10]);

  const xTR = useTransform(explodeFactor, [0, 1], [0, 330]);
  const yTR = useTransform(explodeFactor, [0, 1], [0, -190]);
  const rTR = useTransform(explodeFactor, [0, 1], [0, 10]);

  const xBL = useTransform(explodeFactor, [0, 1], [0, -330]);
  const yBL = useTransform(explodeFactor, [0, 1], [0, 190]);
  const rBL = useTransform(explodeFactor, [0, 1], [0, -6]);

  const xBR = useTransform(explodeFactor, [0, 1], [0, 330]);
  const yBR = useTransform(explodeFactor, [0, 1], [0, 190]);
  const rBR = useTransform(explodeFactor, [0, 1], [0, 6]);

  const yTC = useTransform(explodeFactor, [0, 1], [0, -260]);
  const scaleTC = useTransform(explodeFactor, [0, 1], [0.75, 0.95]);

  const yBC = useTransform(explodeFactor, [0, 1], [0, 260]);
  const scaleBC = useTransform(explodeFactor, [0, 1], [0.75, 0.95]);

  return (
    <section
      id="demo-explode"
      ref={containerRef}
      className="relative py-28 min-h-[820px] sm:min-h-[900px] flex flex-col items-center justify-center bg-background text-foreground select-none overflow-hidden"
    >
      {/* 3D Ambient Backdrop Spotlight */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-primary/5 rounded-full blur-[140px] pointer-events-none -z-10" />

      {/* Subtle Geometric Background Mesh */}
      <div className="absolute inset-0 dot-grid [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-35 dark:opacity-20 pointer-events-none" />

      {/* Section Header with 3D Pill Badge */}
      <div className="relative z-10 text-center mb-10 max-w-3xl mx-auto px-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-border/80 bg-muted/50 text-foreground text-xs font-medium tracking-wide shadow-xs mb-4">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          <span>INTERACTIVE PLATFORM WALKTHROUGH</span>
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-foreground">
          Watch Autonomous Intelligence
          <br />
          <span className="text-muted-foreground font-semibold">in live execution.</span>
        </h2>
        <p className="max-w-xl mx-auto text-sm sm:text-base text-muted-foreground mt-3 leading-relaxed">
          Scroll down to trigger the 3D kinetic explosion and inspect each dedicated co-pilot subsystem in high resolution.
        </p>
      </div>

      {/* 3D Exploding Stage Area */}
      <div
        className="relative z-10 w-full max-w-5xl h-[380px] sm:h-[460px] flex items-center justify-center"
        style={{ perspective: "1200px" }}
      >
        {/* Connecting Alignment Guides */}
        <motion.div
          style={{ opacity: guideOpacity }}
          className="absolute inset-8 sm:inset-12 border border-dashed border-border/70 rounded-3xl pointer-events-none"
        />

        {/* ─── CENTRAL CORE: DEMO VIDEO PLAYER WITH 3D DEPTH ─── */}
        <motion.div
          style={{
            scale: centralScale,
            rotateX: centralRotateX,
            y: centralY,
            transformStyle: "preserve-3d",
          }}
          className="relative z-20 w-[290px] sm:w-[480px] md:w-[560px] aspect-video rounded-2xl border border-border/80 bg-card/90 p-2.5 backdrop-blur-2xl group cursor-pointer transition-all duration-300 [box-shadow:0_0_0_1px_rgba(0,0,0,.04),0_20px_50px_rgba(0,0,0,.12),0_40px_80px_rgba(0,0,0,.1)] dark:[box-shadow:0_-20px_80px_-20px_#ffffff15_inset,0_0_0_1px_rgba(255,255,255,.08),0_30px_70px_rgba(0,0,0,.7)] hover:border-primary/50"
          onClick={() => setIsVideoOpen(true)}
        >
          <div className="relative w-full h-full rounded-xl overflow-hidden bg-muted border border-border flex items-center justify-center">
            {/* Thumbnail Image */}
            <img
              src="/chat_dashboard.png"
              alt="TriVisionX Platform Demo Walkthrough"
              className="w-full h-full object-cover brightness-[0.92] dark:brightness-[0.8] group-hover:brightness-100 transition-all duration-500 group-hover:scale-105"
            />

            {/* Glowing Pulsing Play Button */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="size-16 sm:size-20 rounded-full bg-background/60 backdrop-blur-md flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-2xl border border-border/80">
                <div className="size-12 sm:size-14 rounded-full bg-primary flex items-center justify-center shadow-lg text-primary-foreground">
                  <Play className="size-6 fill-current translate-x-0.5" />
                </div>
              </div>
            </div>

            {/* Video Overlay Badges */}
            <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 px-3 py-1 rounded-full bg-background/90 backdrop-blur-md border border-border text-[10px] font-mono font-semibold text-foreground shadow-xs">
              <span className="size-1.5 rounded-full bg-primary animate-pulse" />
              <span>Live Interactive Walkthrough</span>
            </div>

            <div className="absolute bottom-2.5 inset-x-2.5 flex items-center justify-between text-[10px] font-mono text-muted-foreground bg-background/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-border shadow-xs">
              <span>Click to Play Demo (02:40)</span>
              <span className="text-foreground font-bold">1080p HD</span>
            </div>
          </div>
        </motion.div>

        {/* ─── EXPLODED SURROUNDING PRODUCT MODULES WITH 3D DEPTH ─── */}

        {/* 1. TOP-LEFT: Chat Copilot */}
        <motion.div
          style={{
            x: xTL,
            y: yTL,
            rotateZ: rTL,
            opacity: moduleOpacity,
            transformStyle: "preserve-3d",
          }}
          whileHover={{ scale: 1.05, y: -5 }}
          className="hidden md:block absolute z-10 w-[210px] lg:w-[245px] cursor-pointer"
        >
          <div className="rounded-2xl border border-border/80 bg-card/85 dark:bg-card/65 backdrop-blur-xl p-2.5 transition-all duration-300 hover:border-primary/50 [box-shadow:0_0_0_1px_rgba(0,0,0,.03),0_8px_24px_rgba(0,0,0,.08)] dark:[box-shadow:0_-15px_50px_-15px_#ffffff0d_inset,0_10px_30px_rgba(0,0,0,.5)] hover:shadow-2xl">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Bot className="size-3.5 text-primary" />
              <span className="text-[11px] font-semibold text-foreground truncate">AI Chat & Swarm</span>
              <Badge variant="outline" className="ml-auto text-[8px] border-border/80">
                LangGraph
              </Badge>
            </div>
            <div className="w-full h-22 lg:h-28 rounded-lg overflow-hidden border border-border bg-muted/40">
              <img
                src="/ui/bchatpanel.png"
                alt="Chat Panel"
                className="w-full h-full object-cover object-top hidden dark:block"
              />
              <img
                src="/ui/wchatpanel.png"
                alt="Chat Panel"
                className="w-full h-full object-cover object-top block dark:hidden"
              />
            </div>
          </div>
        </motion.div>

        {/* 2. TOP-RIGHT: Brain Telemetry */}
        <motion.div
          style={{
            x: xTR,
            y: yTR,
            rotateZ: rTR,
            opacity: moduleOpacity,
            transformStyle: "preserve-3d",
          }}
          whileHover={{ scale: 1.05, y: -5 }}
          className="hidden md:block absolute z-10 w-[210px] lg:w-[245px] cursor-pointer"
        >
          <div className="rounded-2xl border border-border/80 bg-card/85 dark:bg-card/65 backdrop-blur-xl p-2.5 transition-all duration-300 hover:border-primary/50 [box-shadow:0_0_0_1px_rgba(0,0,0,.03),0_8px_24px_rgba(0,0,0,.08)] dark:[box-shadow:0_-15px_50px_-15px_#ffffff0d_inset,0_10px_30px_rgba(0,0,0,.5)] hover:shadow-2xl">
            <div className="flex items-center gap-1.5 mb-1.5">
              <BrainCircuit className="size-3.5 text-primary" />
              <span className="text-[11px] font-semibold text-foreground truncate">Brain Telemetry</span>
              <Badge variant="outline" className="ml-auto text-[8px] border-border/80">
                10+ LLMs
              </Badge>
            </div>
            <div className="w-full h-22 lg:h-28 rounded-lg overflow-hidden border border-border bg-muted/40">
              <img
                src="/ui/bbrain.png"
                alt="Brain Dashboard"
                className="w-full h-full object-cover object-top hidden dark:block"
              />
              <img
                src="/ui/wbrain.png"
                alt="Brain Dashboard"
                className="w-full h-full object-cover object-top block dark:hidden"
              />
            </div>
          </div>
        </motion.div>

        {/* 3. BOTTOM-LEFT: Notes Hub */}
        <motion.div
          style={{
            x: xBL,
            y: yBL,
            rotateZ: rBL,
            opacity: moduleOpacity,
            transformStyle: "preserve-3d",
          }}
          whileHover={{ scale: 1.05, y: -5 }}
          className="hidden md:block absolute z-10 w-[210px] lg:w-[245px] cursor-pointer"
        >
          <div className="rounded-2xl border border-border/80 bg-card/85 dark:bg-card/65 backdrop-blur-xl p-2.5 transition-all duration-300 hover:border-primary/50 [box-shadow:0_0_0_1px_rgba(0,0,0,.03),0_8px_24px_rgba(0,0,0,.08)] dark:[box-shadow:0_-15px_50px_-15px_#ffffff0d_inset,0_10px_30px_rgba(0,0,0,.5)] hover:shadow-2xl">
            <div className="flex items-center gap-1.5 mb-1.5">
              <FileText className="size-3.5 text-primary" />
              <span className="text-[11px] font-semibold text-foreground truncate">Research Notes</span>
              <Badge variant="outline" className="ml-auto text-[8px] border-border/80">
                Markdown AI
              </Badge>
            </div>
            <div className="w-full h-22 lg:h-28 rounded-lg overflow-hidden border border-border bg-muted/40">
              <img
                src="/ui/bnotes.png"
                alt="Notes Hub"
                className="w-full h-full object-cover object-top hidden dark:block"
              />
              <img
                src="/ui/wnotes.png"
                alt="Notes Hub"
                className="w-full h-full object-cover object-top block dark:hidden"
              />
            </div>
          </div>
        </motion.div>

        {/* 4. BOTTOM-RIGHT: Tasks Kanban */}
        <motion.div
          style={{
            x: xBR,
            y: yBR,
            rotateZ: rBR,
            opacity: moduleOpacity,
            transformStyle: "preserve-3d",
          }}
          whileHover={{ scale: 1.05, y: -5 }}
          className="hidden md:block absolute z-10 w-[210px] lg:w-[245px] cursor-pointer"
        >
          <div className="rounded-2xl border border-border/80 bg-card/85 dark:bg-card/65 backdrop-blur-xl p-2.5 transition-all duration-300 hover:border-primary/50 [box-shadow:0_0_0_1px_rgba(0,0,0,.03),0_8px_24px_rgba(0,0,0,.08)] dark:[box-shadow:0_-15px_50px_-15px_#ffffff0d_inset,0_10px_30px_rgba(0,0,0,.5)] hover:shadow-2xl">
            <div className="flex items-center gap-1.5 mb-1.5">
              <CheckSquare className="size-3.5 text-primary" />
              <span className="text-[11px] font-semibold text-foreground truncate">Task Kanban</span>
              <Badge variant="outline" className="ml-auto text-[8px] border-border/80">
                Dnd-Kit
              </Badge>
            </div>
            <div className="w-full h-22 lg:h-28 rounded-lg overflow-hidden border border-border bg-muted/40">
              <img
                src="/ui/btask.png"
                alt="Tasks Kanban"
                className="w-full h-full object-cover object-top hidden dark:block"
              />
              <img
                src="/ui/wtask.png"
                alt="Tasks Kanban"
                className="w-full h-full object-cover object-top block dark:hidden"
              />
            </div>
          </div>
        </motion.div>

        {/* 5. TOP-CENTER: Email Co-Pilot */}
        <motion.div
          style={{
            y: yTC,
            scale: scaleTC,
            opacity: moduleOpacity,
            transformStyle: "preserve-3d",
          }}
          whileHover={{ scale: 1.05, y: -5 }}
          className="hidden lg:block absolute z-5 w-[205px] cursor-pointer"
        >
          <div className="rounded-2xl border border-border/80 bg-card/85 dark:bg-card/65 backdrop-blur-xl p-2.5 transition-all duration-300 hover:border-primary/50 [box-shadow:0_0_0_1px_rgba(0,0,0,.03),0_8px_24px_rgba(0,0,0,.08)] dark:[box-shadow:0_-15px_50px_-15px_#ffffff0d_inset,0_10px_30px_rgba(0,0,0,.5)] hover:shadow-2xl">
            <div className="flex items-center gap-1.5 mb-1">
              <Mail className="size-3 text-primary" />
              <span className="text-[10px] font-semibold text-foreground">Email Co-Pilot</span>
              <Badge variant="outline" className="ml-auto text-[7px] border-border/80">
                SSE
              </Badge>
            </div>
            <div className="w-full h-18 rounded overflow-hidden border border-border bg-muted/40">
              <img src="/ui/bemail.png" alt="Email" className="w-full h-full object-cover object-top hidden dark:block" />
              <img src="/ui/wemail.png" alt="Email" className="w-full h-full object-cover object-top block dark:hidden" />
            </div>
          </div>
        </motion.div>

        {/* 6. BOTTOM-CENTER: Calendar Scheduler */}
        <motion.div
          style={{
            y: yBC,
            scale: scaleBC,
            opacity: moduleOpacity,
            transformStyle: "preserve-3d",
          }}
          whileHover={{ scale: 1.05, y: -5 }}
          className="hidden lg:block absolute z-5 w-[205px] cursor-pointer"
        >
          <div className="rounded-2xl border border-border/80 bg-card/85 dark:bg-card/65 backdrop-blur-xl p-2.5 transition-all duration-300 hover:border-primary/50 [box-shadow:0_0_0_1px_rgba(0,0,0,.03),0_8px_24px_rgba(0,0,0,.08)] dark:[box-shadow:0_-15px_50px_-15px_#ffffff0d_inset,0_10px_30px_rgba(0,0,0,.5)] hover:shadow-2xl">
            <div className="flex items-center gap-1.5 mb-1">
              <Calendar className="size-3 text-primary" />
              <span className="text-[10px] font-semibold text-foreground">Calendar & Scheduler</span>
              <Badge variant="outline" className="ml-auto text-[7px] border-border/80">
                Logs
              </Badge>
            </div>
            <div className="w-full h-18 rounded overflow-hidden border border-border bg-muted/40">
              <img src="/ui/bcalendar.png" alt="Calendar" className="w-full h-full object-cover object-top hidden dark:block" />
              <img src="/ui/wcalendar.png" alt="Calendar" className="w-full h-full object-cover object-top block dark:hidden" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Embedded Full Video Modal via HeroVideoDialog */}
      <HeroVideoDialog
        isOpen={isVideoOpen}
        onOpenChange={setIsVideoOpen}
        hideTrigger={true}
        videoSrc="https://youtu.be/yVSE9QFFcTU"
        thumbnailSrc="/chat_dashboard.png"
      />
    </section>
  );
}
