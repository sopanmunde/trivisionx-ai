"use client";

import type React from "react";
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import { scrollToY } from "@/components/smooth-scroll";
import { cn } from "@/lib/utils";

interface Point {
  x: number;
  y: number;
}

interface PathSample extends Point {
  ratio: number;
}

interface SectionInfo {
  label: string;
  ratio: number;
}

const SECTION_MATCHERS: Array<{ pattern: RegExp; label: string }> = [
  { pattern: /autonomous|future|agentic|command|hero|trivision/i, label: "Overview" },
  { pattern: /trusted|teams|partner|enterprise/i, label: "Partners" },
  { pattern: /watch|explode|tour|demo|cinema|studio/i, label: "Product Tour" },
  { pattern: /layered|architecture|stack|system/i, label: "Architecture" },
  { pattern: /terminal|cli|matrix|console|shell/i, label: "Terminal" },
  { pattern: /capabilit|telemetry|observable|speed|latency/i, label: "Capabilities" },
  { pattern: /ecosystem|workspace|built-in|connected/i, label: "Ecosystem" },
  { pattern: /module|bento|agent|grid|orchestr/i, label: "Modules" },
  { pattern: /workflow|automation|canvas|pipeline/i, label: "Workflows" },
  { pattern: /pricing|plan|tier|enterprise/i, label: "Pricing" },
  { pattern: /ready|start|deploy|launch|cta/i, label: "Get Started" },
];

function inferSectionLabel(el: Element, index: number, total: number): string {
  const explicit =
    el.getAttribute("data-section-label") || el.getAttribute("aria-label");
  if (explicit) return explicit;

  const heading = el.querySelector("h1, h2, h3");
  const badge = el.querySelector("[class*='uppercase'], [data-slot='badge']");
  const sampleText = `${badge?.textContent ?? ""} ${heading?.textContent ?? ""}`.trim();

  if (index === 0) return "Overview";
  for (const matcher of SECTION_MATCHERS) {
    if (matcher.pattern.test(sampleText)) {
      return matcher.label;
    }
  }
  if (index === total - 1) return "Get Started";
  return `Section ${index + 1}`;
}

/**
 * Generates a slim pixel-accurate stepped zig-zag SVG path with subtle rounded corners.
 */
function buildZigZagPath(width: number, height: number): string {
  if (width <= 4 || height <= 20) return "";

  const padX = Math.max(2, Math.min(4, width * 0.16));
  const padY = Math.max(3, Math.min(6, height * 0.008));
  const usableW = Math.max(5, width - padX * 2);
  const usableH = Math.max(40, height - padY * 2);

  // Compact stepped proportions faithful to the reference contour
  const x0 = padX + usableW * 0.16;
  const x1 = padX + usableW * 0.62;
  const x2 = padX + usableW * 0.78;
  const x3 = padX + usableW * 0.94;

  const y0 = padY;
  const y1 = padY + usableH * 0.175;
  const y2 = padY + usableH * 0.335;
  const y3 = padY + usableH * 0.495;
  const y4 = padY + usableH * 0.655;
  const y5 = padY + usableH * 0.855;
  const y6 = padY + usableH;

  const pts: Point[] = [
    { x: x0, y: y0 },
    { x: x0, y: y1 },
    { x: x1, y: y1 },
    { x: x1, y: y2 },
    { x: x0, y: y2 },
    { x: x0, y: y3 },
    { x: x2, y: y3 },
    { x: x2, y: y4 },
    { x: x0, y: y4 },
    { x: x0, y: y5 },
    { x: x3, y: y5 },
    { x: x3, y: y6 },
  ];

  const maxCornerR = Math.min(4.5, usableW * 0.28, usableH * 0.03);
  const commands: string[] = [`M ${pts[0].x.toFixed(2)} ${pts[0].y.toFixed(2)}`];

  for (let i = 1; i < pts.length - 1; i++) {
    const prev = pts[i - 1];
    const curr = pts[i];
    const next = pts[i + 1];

    const dxIn = curr.x - prev.x;
    const dyIn = curr.y - prev.y;
    const lenIn = Math.hypot(dxIn, dyIn);

    const dxOut = next.x - curr.x;
    const dyOut = next.y - curr.y;
    const lenOut = Math.hypot(dxOut, dyOut);

    if (lenIn === 0 || lenOut === 0) continue;

    const r = Math.min(maxCornerR, lenIn * 0.44, lenOut * 0.44);
    const startX = curr.x - (dxIn / lenIn) * r;
    const startY = curr.y - (dyIn / lenIn) * r;
    const endX = curr.x + (dxOut / lenOut) * r;
    const endY = curr.y + (dyOut / lenOut) * r;

    commands.push(
      `L ${startX.toFixed(2)} ${startY.toFixed(2)} Q ${curr.x.toFixed(2)} ${curr.y.toFixed(2)} ${endX.toFixed(2)} ${endY.toFixed(2)}`
    );
  }

  const last = pts[pts.length - 1];
  commands.push(`L ${last.x.toFixed(2)} ${last.y.toFixed(2)}`);
  return commands.join(" ");
}

export function ZigZagScrollBar() {
  const rawUid = useId();
  const uid = rawUid.replace(/[^a-zA-Z0-9_-]/g, "");
  const gradMainId = `zigzag-shadcn-${uid}`;
  const gradMobileId = `zigzag-shadcn-m-${uid}`;

  const railRef = useRef<HTMLDivElement>(null);
  const desktopPathRef = useRef<SVGPathElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const percentTextRef = useRef<HTMLSpanElement>(null);
  const sectionLabelRef = useRef<HTMLSpanElement>(null);
  const mobileContainerRef = useRef<HTMLDivElement>(null);

  const lutRef = useRef<PathSample[]>([]);
  const totalLengthRef = useRef<number>(0);
  const sectionsRef = useRef<SectionInfo[]>([]);
  const isDraggingRef = useRef<boolean>(false);
  const scrollIdleTimerRef = useRef<number | null>(null);

  const [railSize, setRailSize] = useState({ width: 24, height: 560 });
  const [mobileSize, setMobileSize] = useState({ width: 14, height: 480 });
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);

  const { scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 340,
    damping: 36,
    restDelta: 0.0005,
  });

  const desktopPathD = useMemo(
    () => buildZigZagPath(railSize.width, railSize.height),
    [railSize.width, railSize.height]
  );

  const mobilePathD = useMemo(
    () => buildZigZagPath(mobileSize.width, mobileSize.height),
    [mobileSize.width, mobileSize.height]
  );

  // Hide native desktop scrollbar strictly while landing zig-zag bar is active
  useEffect(() => {
    document.documentElement.classList.add("landing-zigzag-scroll");
    return () => {
      document.documentElement.classList.remove("landing-zigzag-scroll");
    };
  }, []);

  // Measure rail containers via ResizeObserver so thin stroke weights stay crisp
  useEffect(() => {
    const observers: ResizeObserver[] = [];

    if (railRef.current) {
      const ro = new ResizeObserver((entries) => {
        const rect = entries[0]?.contentRect;
        if (rect && rect.width > 0 && rect.height > 0) {
          setRailSize({
            width: Math.round(rect.width),
            height: Math.round(rect.height),
          });
        }
      });
      ro.observe(railRef.current);
      observers.push(ro);
    }

    if (mobileContainerRef.current) {
      const ro = new ResizeObserver((entries) => {
        const rect = entries[0]?.contentRect;
        if (rect && rect.width > 0 && rect.height > 0) {
          setMobileSize({
            width: Math.round(rect.width),
            height: Math.round(rect.height),
          });
        }
      });
      ro.observe(mobileContainerRef.current);
      observers.push(ro);
    }

    return () => {
      observers.forEach((ro) => ro.disconnect());
    };
  }, []);

  // Update floating compact Shadcn label + % position at 60fps
  const syncVisualsToProgress = useCallback(
    (progress: number) => {
      const clamped = Math.max(0, Math.min(1, progress));
      const pathEl = desktopPathRef.current;
      const totalLen = totalLengthRef.current;

      if (pathEl && totalLen > 0 && tooltipRef.current) {
        const pt = pathEl.getPointAtLength(clamped * totalLen);
        const maxTipY = Math.max(20, railSize.height - 36);
        const clampedTipY = Math.max(14, Math.min(maxTipY, pt.y));
        tooltipRef.current.style.transform = `translate3d(0, ${clampedTipY.toFixed(2)}px, 0)`;
      }

      if (percentTextRef.current) {
        percentTextRef.current.textContent = `${Math.round(clamped * 100)}%`;
      }

      if (sectionLabelRef.current && sectionsRef.current.length > 0) {
        let activeLabel = sectionsRef.current[0].label;
        for (const sec of sectionsRef.current) {
          if (clamped + 0.015 >= sec.ratio) {
            activeLabel = sec.label;
          }
        }
        if (sectionLabelRef.current.textContent !== activeLabel) {
          sectionLabelRef.current.textContent = activeLabel;
        }
      }
    },
    [railSize.height]
  );

  // Sample path LUT & discover landing page sections for active HUD tracking
  useEffect(() => {
    let rafId = 0;

    const recomputePathAndSections = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const pathEl = desktopPathRef.current;
        if (!pathEl || !desktopPathD) return;

        let totalLen = 0;
        try {
          totalLen = pathEl.getTotalLength();
        } catch {
          return;
        }
        if (!totalLen || Number.isNaN(totalLen)) return;

        totalLengthRef.current = totalLen;

        const samples = 220;
        const lut: PathSample[] = [];
        for (let i = 0; i <= samples; i++) {
          const ratio = i / samples;
          const pt = pathEl.getPointAtLength(ratio * totalLen);
          lut.push({ ratio, x: pt.x, y: pt.y });
        }
        lutRef.current = lut;

        const maxScroll = Math.max(
          1,
          document.documentElement.scrollHeight - window.innerHeight
        );
        const mainEl = document.querySelector("main");
        const sectionsRoot =
          mainEl?.querySelector("[data-landing-sections]") ?? mainEl;
        const children = sectionsRoot
          ? Array.from(sectionsRoot.children).filter(
              (el) =>
                !el.hasAttribute("data-zigzag-scrollbar") &&
                !el.hasAttribute("data-scroll-road")
            )
          : [];

        const discovered: SectionInfo[] = children.map((el, idx) => {
          const rect = el.getBoundingClientRect();
          const scrollY = Math.max(0, rect.top + window.scrollY - 64);
          const ratio = Math.max(0, Math.min(1, scrollY / maxScroll));
          return {
            label: inferSectionLabel(el, idx, children.length),
            ratio,
          };
        });

        if (discovered.length > 0) {
          discovered[0].ratio = 0;
        }
        sectionsRef.current = discovered;

        syncVisualsToProgress(smoothProgress.get());
      });
    };

    recomputePathAndSections();

    const bodyRo = new ResizeObserver(recomputePathAndSections);
    bodyRo.observe(document.body);

    return () => {
      cancelAnimationFrame(rafId);
      bodyRo.disconnect();
    };
  }, [desktopPathD, smoothProgress, syncVisualsToProgress]);

  // Subscribe to smooth progress + temporary scroll indicator
  useEffect(() => {
    const unsubSmooth = smoothProgress.on("change", (latest) => {
      syncVisualsToProgress(latest);
    });

    const unsubRaw = scrollYProgress.on("change", () => {
      setIsScrolling(true);
      if (scrollIdleTimerRef.current) {
        window.clearTimeout(scrollIdleTimerRef.current);
      }
      scrollIdleTimerRef.current = window.setTimeout(() => {
        setIsScrolling(false);
      }, 1000);
    });

    return () => {
      unsubSmooth();
      unsubRaw();
      if (scrollIdleTimerRef.current) {
        window.clearTimeout(scrollIdleTimerRef.current);
      }
    };
  }, [scrollYProgress, smoothProgress, syncVisualsToProgress]);

  const getProgressFromPointer = useCallback((clientX: number, clientY: number): number => {
    const rail = railRef.current;
    const lut = lutRef.current;
    if (!rail || lut.length === 0) return 0;

    const rect = rail.getBoundingClientRect();
    const localX = clientX - rect.left;
    const localY = clientY - rect.top;

    if (localY <= lut[0].y) return 0;
    if (localY >= lut[lut.length - 1].y) return 1;

    let bestRatio = 0;
    let bestScore = Number.POSITIVE_INFINITY;

    for (const sample of lut) {
      const dy = Math.abs(sample.y - localY);
      const dx = Math.abs(sample.x - localX);
      const score = dy * 10 + (dy < 8 ? dx * 0.4 : dx * 0.02);
      if (score < bestScore) {
        bestScore = score;
        bestRatio = sample.ratio;
      }
    }

    return Math.max(0, Math.min(1, bestRatio));
  }, []);

  const scrubToPointer = useCallback(
    (clientX: number, clientY: number, immediate: boolean) => {
      const ratio = getProgressFromPointer(clientX, clientY);
      const maxScroll = Math.max(
        0,
        document.documentElement.scrollHeight - window.innerHeight
      );
      scrollToY(ratio * maxScroll, immediate);
    },
    [getProgressFromPointer]
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (e.button !== 0) return;
      e.preventDefault();
      e.currentTarget.setPointerCapture(e.pointerId);
      isDraggingRef.current = true;
      setIsDragging(true);
      scrubToPointer(e.clientX, e.clientY, false);
    },
    [scrubToPointer]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!isDraggingRef.current) return;
      scrubToPointer(e.clientX, e.clientY, true);
    },
    [scrubToPointer]
  );

  const handlePointerUpOrCancel = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!isDraggingRef.current) return;
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
      isDraggingRef.current = false;
      setIsDragging(false);
    },
    []
  );

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    const step = window.innerHeight * 0.25;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      scrollToY(window.scrollY + step, false);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      scrollToY(window.scrollY - step, false);
    } else if (e.key === "PageDown") {
      e.preventDefault();
      scrollToY(window.scrollY + window.innerHeight * 0.85, false);
    } else if (e.key === "PageUp") {
      e.preventDefault();
      scrollToY(window.scrollY - window.innerHeight * 0.85, false);
    } else if (e.key === "Home") {
      e.preventDefault();
      scrollToY(0, false);
    } else if (e.key === "End") {
      e.preventDefault();
      scrollToY(document.documentElement.scrollHeight - window.innerHeight, false);
    }
  }, []);

  const showHud = isHovered || isDragging || isScrolling;

  return (
    <div data-zigzag-scrollbar="true">
      {/* Desktop Thin Shadcn UI Green Zig-Zag Scrollbar (top to bottom, dot-free) */}
      <div
        ref={railRef}
        role="slider"
        tabIndex={0}
        aria-label="Landing page zig-zag scrollbar"
        aria-orientation="vertical"
        aria-valuemin={0}
        aria-valuemax={100}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUpOrCancel}
        onPointerCancel={handlePointerUpOrCancel}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onKeyDown={handleKeyDown}
        className={cn(
          "hidden md:block fixed right-1.5 lg:right-2 top-1.5 bottom-1.5 w-[22px] z-40 select-none touch-none outline-none",
          "rounded-lg border transition-colors duration-200",
          isHovered || isDragging
            ? "bg-emerald-500/[0.06] backdrop-blur-sm border-emerald-500/25"
            : "bg-transparent border-transparent hover:bg-muted/40",
          isDragging ? "cursor-grabbing" : "cursor-pointer"
        )}
      >
        {/* Compact Shadcn Popover HUD (clean label + green percentage, no dots) */}
        <div
          ref={tooltipRef}
          className={cn(
            "pointer-events-none absolute right-[calc(100%+8px)] top-0 -translate-y-1/2 transition-opacity duration-200",
            showHud ? "opacity-100" : "opacity-0"
          )}
        >
          <div className="flex items-center gap-2 whitespace-nowrap rounded-md border border-border bg-popover/95 backdrop-blur-md px-2 py-1 text-popover-foreground shadow-sm">
            <span
              ref={sectionLabelRef}
              className="text-[11px] font-medium tracking-tight text-foreground"
            >
              Overview
            </span>
            <span className="h-2.5 w-px bg-border" />
            <span
              ref={percentTextRef}
              className="font-mono text-[10px] font-semibold tabular-nums text-emerald-600 dark:text-emerald-400"
            >
              0%
            </span>
          </div>
        </div>

        {/* Hairline Top-to-Bottom Stepped SVG Track (Green) */}
        <svg
          width={railSize.width}
          height={railSize.height}
          viewBox={`0 0 ${railSize.width} ${railSize.height}`}
          className="h-full w-full overflow-visible pointer-events-none"
        >
          <defs>
            <linearGradient id={gradMainId} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#4ade80" />
              <stop offset="50%" stopColor="#22c55e" />
              <stop offset="100%" stopColor="#16a34a" />
            </linearGradient>
          </defs>

          {desktopPathD && (
            <>
              {/* Thin Inactive Base Track */}
              <path
                ref={desktopPathRef}
                d={desktopPathD}
                fill="none"
                strokeWidth={1.15}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="stroke-border dark:stroke-white/15"
              />

              {/* Thin Active Green Progress Line */}
              <motion.path
                d={desktopPathD}
                fill="none"
                stroke={`url(#${gradMainId})`}
                strokeWidth={isHovered || isDragging ? 2.25 : 1.75}
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ pathLength: smoothProgress }}
              />
            </>
          )}
        </svg>
      </div>

      {/* Mobile Slim Hairline Top-to-Bottom Zig-Zag Progress Trace (Green, dot-free) */}
      <div
        ref={mobileContainerRef}
        aria-hidden="true"
        className="md:hidden pointer-events-none fixed right-1 top-1.5 bottom-1.5 w-[14px] z-40 opacity-90"
      >
        <svg
          width={mobileSize.width}
          height={mobileSize.height}
          viewBox={`0 0 ${mobileSize.width} ${mobileSize.height}`}
          className="h-full w-full overflow-visible"
        >
          <defs>
            <linearGradient id={gradMobileId} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#4ade80" />
              <stop offset="100%" stopColor="#16a34a" />
            </linearGradient>
          </defs>
          {mobilePathD && (
            <>
              <path
                d={mobilePathD}
                fill="none"
                strokeWidth={1}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="stroke-border dark:stroke-white/15"
              />
              <motion.path
                d={mobilePathD}
                fill="none"
                stroke={`url(#${gradMobileId})`}
                strokeWidth={1.65}
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ pathLength: smoothProgress }}
              />
            </>
          )}
        </svg>
      </div>
    </div>
  );
}
