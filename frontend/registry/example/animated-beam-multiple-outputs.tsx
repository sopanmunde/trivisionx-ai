"use client";

import React, { forwardRef, useRef } from "react";
import { cn } from "@/lib/utils";
import { AnimatedBeam } from "@/components/magicui/animated-beam";
import {
  FileText,
  Bot,
  Database,
  Cloud,
  Layers,
  Sparkles,
  Cpu,
} from "lucide-react";

const Circle = forwardRef<
  HTMLDivElement,
  { className?: string; children?: React.ReactNode }
>(({ className, children }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "z-10 flex size-11 items-center justify-center rounded-xl border border-border bg-card p-2.5 shadow-sm transition-transform duration-200 hover:scale-110",
        className
      )}
    >
      {children}
    </div>
  );
});

Circle.displayName = "Circle";

export default function AnimatedBeamMultipleOutputDemo({
  className,
}: {
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const fromRef = useRef<HTMLDivElement>(null);
  const toRef1 = useRef<HTMLDivElement>(null);
  const toRef2 = useRef<HTMLDivElement>(null);
  const toRef3 = useRef<HTMLDivElement>(null);
  const toRef4 = useRef<HTMLDivElement>(null);
  const toRef5 = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative flex h-[300px] w-full items-center justify-center overflow-hidden p-6",
        className
      )}
    >
      <div className="flex size-full max-w-md flex-row items-center justify-between gap-8">
        {/* Left Side: Single Origin Node */}
        <div className="flex flex-col items-center justify-center">
          <Circle ref={fromRef} className="size-14 border-primary/40 bg-primary/10">
            <Bot className="size-7 text-primary" />
          </Circle>
        </div>

        {/* Right Side: Multiple Integration Outputs */}
        <div className="flex flex-col items-center justify-between gap-3">
          <Circle ref={toRef1} className="hover:border-sky-500/50">
            <Cloud className="size-4 text-sky-500" />
          </Circle>
          <Circle ref={toRef2} className="hover:border-emerald-500/50">
            <FileText className="size-4 text-emerald-500" />
          </Circle>
          <Circle ref={toRef3} className="hover:border-purple-500/50">
            <Cpu className="size-4 text-purple-500" />
          </Circle>
          <Circle ref={toRef4} className="hover:border-amber-500/50">
            <Database className="size-4 text-amber-500" />
          </Circle>
          <Circle ref={toRef5} className="hover:border-rose-500/50">
            <Sparkles className="size-4 text-rose-500" />
          </Circle>
        </div>
      </div>

      <AnimatedBeam
        containerRef={containerRef}
        fromRef={fromRef}
        toRef={toRef1}
        curvature={-60}
        duration={3}
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={fromRef}
        toRef={toRef2}
        curvature={-30}
        duration={3}
        delay={0.4}
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={fromRef}
        toRef={toRef3}
        curvature={0}
        duration={3}
        delay={0.8}
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={fromRef}
        toRef={toRef4}
        curvature={30}
        duration={3}
        delay={1.2}
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={fromRef}
        toRef={toRef5}
        curvature={60}
        duration={3}
        delay={1.6}
      />
    </div>
  );
}

