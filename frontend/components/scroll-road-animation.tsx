"use client";

import type React from "react";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { useScroll, useSpring } from "framer-motion";

interface RoadSample {
  ratio: number;
  x: number;
  y: number;
  angle: number;
}

interface SnakeWaypoint {
  x: number;
  y: number;
  docY: number;
  cumRatio?: number;
}

interface ResolvedMilestone {
  docY: number;
  ratio: number;
}

interface SectionMeasure {
  secTop: number;
  secBottom: number;
  contentTop: number;
  contentBottom: number;
  contentLeft: number;
  contentRight: number;
}

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

function measureSectionsInStage(stageEl: HTMLElement): SectionMeasure[] {
  const stageRect = stageEl.getBoundingClientRect();
  const stageTop = stageRect.top;
  const stageLeft = stageRect.left;
  const stageWidth = stageEl.clientWidth || window.innerWidth;

  const sectionEls = Array.from(stageEl.querySelectorAll("section"));
  const targets =
    sectionEls.length > 0
      ? sectionEls
      : Array.from(stageEl.children).filter(
          (el) =>
            !el.hasAttribute("data-scroll-road") &&
            !el.hasAttribute("data-zigzag-scrollbar")
        );

  return targets.map((sec) => {
    const sRect = sec.getBoundingClientRect();
    const secTop = sRect.top - stageTop;
    const secBottom = sRect.bottom - stageTop;

    const contentNode =
      sec.querySelector<HTMLElement>(
        ":scope > div.relative.z-10, :scope > div[class*='max-w-']"
      ) ?? sec.querySelector<HTMLElement>(":scope > div:not([aria-hidden='true'])");

    let contentTop = secTop + Math.min(80, sRect.height * 0.16);
    let contentBottom = secBottom - Math.min(80, sRect.height * 0.16);
    let contentLeft = Math.max(24, stageWidth * 0.12);
    let contentRight = Math.min(stageWidth - 24, stageWidth * 0.88);

    if (contentNode) {
      const cRect = contentNode.getBoundingClientRect();
      if (cRect.height > 20 && cRect.width > 20) {
        contentTop = Math.max(secTop + 16, cRect.top - stageTop);
        contentBottom = Math.min(secBottom - 16, cRect.bottom - stageTop);
        contentLeft = Math.max(16, cRect.left - stageLeft);
        contentRight = Math.min(stageWidth - 16, cRect.right - stageLeft);
      }
    }

    return {
      secTop,
      secBottom,
      contentTop,
      contentBottom,
      contentLeft,
      contentRight,
    };
  });
}

/**
 * Generates a pure, continuous sinusoidal snake-like structure weaving
 * end-to-end down the landing page in fluid wide S-curves aligned to sections.
 */
function buildFullySnakeRoadPath(
  width: number,
  height: number,
  sections: SectionMeasure[]
): { pathD: string; anchors: SnakeWaypoint[] } {
  if (width < 100 || height < 200) {
    return { pathD: "", anchors: [] };
  }

  const isMobile = width < 768;
  const minRightMargin = isMobile ? 22 : 44;
  const defaultLeft = isMobile ? Math.max(18, width * 0.08) : Math.max(38, width * 0.07);
  const defaultRight = isMobile
    ? Math.min(width - minRightMargin, width * 0.92)
    : Math.min(width - minRightMargin, width * 0.915);

  const crests: Array<{ x: number; y: number }> = [];

  if (sections.length > 0) {
    let sideIdx = 0;

    for (let i = 0; i < sections.length; i++) {
      const sec = sections[i];
      const secSpan = Math.max(120, sec.secBottom - sec.secTop);
      const secLeft = isMobile
        ? defaultLeft
        : clamp(Math.min(sec.contentLeft - 24, width * 0.085), 34, width * 0.16);
      const secRight = isMobile
        ? defaultRight
        : clamp(
            Math.max(sec.contentRight + 24, width * 0.905),
            width * 0.84,
            width - minRightMargin
          );

      // Subdivide taller interactive sections so the snake wave rhythm stays uniform
      const waveBudget = isMobile ? 420 : 540;
      const crestsInSection = Math.max(1, Math.round(secSpan / waveBudget));

      for (let k = 0; k < crestsInSection; k++) {
        const frac = (k + 0.5) / crestsInSection;
        const crestY = clamp(
          sec.secTop + secSpan * frac,
          sec.secTop + 60,
          sec.secBottom - 50
        );
        const crestX = sideIdx % 2 === 0 ? secLeft : secRight;

        const prevCrest = crests[crests.length - 1];
        if (!prevCrest || crestY > prevCrest.y + 120) {
          crests.push({ x: crestX, y: crestY });
          sideIdx++;
        }
      }
    }
  } else {
    const waveHeight = isMobile ? 360 : 480;
    const count = Math.max(6, Math.round((height - 200) / waveHeight));
    const step = (height - 220) / count;
    for (let i = 0; i <= count; i++) {
      crests.push({
        x: i % 2 === 0 ? defaultLeft : defaultRight,
        y: 120 + i * step,
      });
    }
  }

  if (crests.length === 0) {
    return { pathD: "", anchors: [] };
  }

  // Add curved top entry tail (starting gracefully above first crest) & curved end tail
  const first = crests[0];
  const last = crests[crests.length - 1];
  const centerStageX = width * 0.5;

  const entryX =
    first.x < centerStageX
      ? clamp(width * 0.34, defaultLeft, centerStageX)
      : clamp(width * 0.66, centerStageX, defaultRight);
  const entryY = Math.max(44, first.y - 120);

  const exitX =
    last.x < centerStageX
      ? clamp(width * 0.42, defaultLeft, centerStageX)
      : clamp(width * 0.58, centerStageX, defaultRight);
  const exitY = Math.min(height - 32, last.y + 140);

  const curveNodes: Array<{ x: number; y: number }> = [
    { x: entryX, y: entryY },
    ...crests,
    ...(exitY > last.y + 40 ? [{ x: exitX, y: exitY }] : []),
  ];

  // Build pure vertical-tangent sinusoidal S-waves between every alternating crest
  const commands: string[] = [
    `M ${curveNodes[0].x.toFixed(1)} ${curveNodes[0].y.toFixed(1)}`,
  ];
  const anchors: SnakeWaypoint[] = [];

  for (let i = 0; i < curveNodes.length - 1; i++) {
    const p1 = curveNodes[i];
    const p2 = curveNodes[i + 1];
    const dy = p2.y - p1.y;

    // 0.45 handle keeps vertical tangents pure at every snake crest without Y inversion
    const handle = dy * 0.45;
    const cp1y = p1.y + handle;
    const cp2y = p2.y - handle;

    commands.push(
      `C ${p1.x.toFixed(1)} ${cp1y.toFixed(1)}, ${p2.x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`
    );

    anchors.push({ x: p1.x, y: p1.y, docY: p1.y });
    // Add inflection midpoint along every S-sweep so the bike glides smoothly side-to-side
    anchors.push({
      x: (p1.x + p2.x) * 0.5,
      y: (p1.y + p2.y) * 0.5,
      docY: (p1.y + p2.y) * 0.5,
    });
  }

  const endNode = curveNodes[curveNodes.length - 1];
  anchors.push({ x: endNode.x, y: endNode.y, docY: endNode.y });

  const cumDists: number[] = [0];
  let totalPoly = 0;
  for (let i = 1; i < anchors.length; i++) {
    totalPoly += Math.hypot(
      anchors[i].x - anchors[i - 1].x,
      anchors[i].y - anchors[i - 1].y
    );
    cumDists.push(totalPoly);
  }
  const safeTotal = Math.max(1, totalPoly);
  const enrichedAnchors = anchors.map((pt, idx) => ({
    ...pt,
    cumRatio: cumDists[idx] / safeTotal,
  }));

  return {
    pathD: commands.join(" "),
    anchors: enrichedAnchors,
  };
}

function ScrollRoadBackdrop({
  containerRef,
}: {
  containerRef: React.RefObject<HTMLDivElement | null>;
}) {
  const rawUid = useId();
  const uid = rawUid.replace(/[^a-zA-Z0-9_-]/g, "");
  const gradId = `scroll-snake-grad-${uid}`;
  const bikeBodyGradId = `scroll-bike-body-${uid}`;
  const helmetGradId = `scroll-helmet-grad-${uid}`;
  const jacketGradId = `scroll-jacket-grad-${uid}`;
  const headlightGradId = `scroll-bike-beam-${uid}`;

  const measurePathRef = useRef<SVGPathElement>(null);
  const activeHaloRef = useRef<SVGPathElement>(null);
  const activeTraceRef = useRef<SVGPathElement>(null);
  const activeHighlightRef = useRef<SVGPathElement>(null);
  const bikeWrapperRef = useRef<HTMLDivElement>(null);

  const lutRef = useRef<RoadSample[]>([]);
  const milestonesRef = useRef<ResolvedMilestone[]>([]);
  const anchorsRef = useRef<SnakeWaypoint[]>([]);
  const prevScrollProgressRef = useRef<number>(0);
  const directionRef = useRef<"down" | "up">("down");
  const moveTimerRef = useRef<number | null>(null);

  const [docSize, setDocSize] = useState({ width: 1280, height: 4000 });
  const [roadPathD, setRoadPathD] = useState("");
  const [hasScrolled, setHasScrolled] = useState(false);
  const [isMoving, setIsMoving] = useState(false);
  const [scrollDir, setScrollDir] = useState<"down" | "up">("down");

  const { scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 195,
    damping: 28,
    restDelta: 0.0002,
  });

  // Measure landing stage & section crests dynamically without cursor tracking
  useEffect(() => {
    const stageEl = containerRef.current;
    if (!stageEl) return;

    let rafId = 0;

    const rebuildRoad = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const w = Math.round(stageEl.clientWidth || window.innerWidth);
        const h = Math.round(
          stageEl.scrollHeight || document.documentElement.scrollHeight
        );
        if (w <= 0 || h <= 0) return;

        const sections = measureSectionsInStage(stageEl);
        const { pathD, anchors } = buildFullySnakeRoadPath(w, h, sections);
        anchorsRef.current = anchors;

        setDocSize((prev) =>
          prev.width === w && prev.height === h ? prev : { width: w, height: h }
        );
        setRoadPathD((prev) => (prev === pathD ? prev : pathD));
      });
    };

    rebuildRoad();

    const ro = new ResizeObserver(rebuildRoad);
    ro.observe(stageEl);
    window.addEventListener("resize", rebuildRoad);

    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
      window.removeEventListener("resize", rebuildRoad);
    };
  }, [containerRef]);

  // Synchronize bike center & snake trail directly with scroll depth
  const syncBikeToScroll = useCallback(
    (progress: number) => {
      const clamped = Math.max(0, Math.min(1, progress));
      const lut = lutRef.current;
      const milestones = milestonesRef.current;
      if (lut.length === 0 || milestones.length === 0) return;

      const winH = window.innerHeight || 800;
      const stageH = docSize.height || 4000;
      const maxScroll = Math.max(1, stageH - winH);

      const viewOffset = winH * (0.16 + clamped * 0.62);
      const viewFocusY = clamped * maxScroll + viewOffset;

      let activeRatio = milestones[milestones.length - 1].ratio;
      if (viewFocusY <= milestones[0].docY) {
        activeRatio = milestones[0].ratio;
      } else {
        for (let i = 1; i < milestones.length; i++) {
          const prevM = milestones[i - 1];
          const currM = milestones[i];
          if (viewFocusY <= currM.docY) {
            const span = Math.max(1, currM.docY - prevM.docY);
            const t = clamp((viewFocusY - prevM.docY) / span, 0, 1);
            activeRatio = prevM.ratio + (currM.ratio - prevM.ratio) * t;
            break;
          }
        }
      }

      activeRatio = clamp(activeRatio, 0, 1);

      const fIdx = activeRatio * (lut.length - 1);
      const i0 = Math.floor(fIdx);
      const i1 = Math.min(lut.length - 1, i0 + 1);
      const frac = fIdx - i0;
      const p0 = lut[i0];
      const p1 = lut[i1];

      const x = p0.x + (p1.x - p0.x) * frac;
      const y = p0.y + (p1.y - p0.y) * frac;

      let dAngle = p1.angle - p0.angle;
      if (dAngle > 180) dAngle -= 360;
      if (dAngle < -180) dAngle += 360;
      const angle = p0.angle + dAngle * frac;

      const dashOffset = (1 - activeRatio).toFixed(5);
      if (activeHaloRef.current) {
        activeHaloRef.current.style.strokeDashoffset = dashOffset;
      }
      if (activeTraceRef.current) {
        activeTraceRef.current.style.strokeDashoffset = dashOffset;
      }
      if (activeHighlightRef.current) {
        activeHighlightRef.current.style.strokeDashoffset = dashOffset;
      }

      if (bikeWrapperRef.current) {
        bikeWrapperRef.current.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) rotate(${angle.toFixed(1)}deg)`;
      }
    },
    [docSize.height]
  );

  // Sample dense LUT along the snake spline and resolve exact milestone ratios
  useEffect(() => {
    const rafId = requestAnimationFrame(() => {
      const pathEl = measurePathRef.current;
      if (!pathEl || !roadPathD) return;

      let totalLen = 0;
      try {
        totalLen = pathEl.getTotalLength();
      } catch {
        return;
      }
      if (!totalLen || Number.isNaN(totalLen)) return;

      const sampleCount = clamp(Math.round(totalLen / 16), 520, 2000);
      const samples: RoadSample[] = [];
      const delta = Math.max(2, totalLen / 1400);

      for (let i = 0; i <= sampleCount; i++) {
        const ratio = i / sampleCount;
        const len = ratio * totalLen;
        const pt = pathEl.getPointAtLength(len);
        const pAhead = pathEl.getPointAtLength(Math.min(totalLen, len + delta));
        const pBehind = pathEl.getPointAtLength(Math.max(0, len - delta));
        const angleRad = Math.atan2(pAhead.y - pBehind.y, pAhead.x - pBehind.x);
        const angle = (angleRad * 180) / Math.PI;

        samples.push({ ratio, x: pt.x, y: pt.y, angle });
      }

      lutRef.current = samples;

      const anchors = anchorsRef.current;
      const resolved: ResolvedMilestone[] = [];
      let prevIdx = 0;

      for (let aIdx = 0; aIdx < anchors.length; aIdx++) {
        const anchor = anchors[aIdx];
        const expectedIdx = Math.round((anchor.cumRatio ?? 0) * (samples.length - 1));
        const winStart = Math.max(prevIdx, expectedIdx - 80);
        const winEnd = Math.min(samples.length - 1, expectedIdx + 80);

        let bestIdx = winStart;
        let bestDist = Number.POSITIVE_INFINITY;
        for (let j = winStart; j <= winEnd; j++) {
          const d = Math.hypot(samples[j].x - anchor.x, samples[j].y - anchor.y);
          if (d < bestDist) {
            bestDist = d;
            bestIdx = j;
          }
        }

        prevIdx = Math.max(prevIdx, bestIdx);
        resolved.push({
          docY: anchor.docY,
          ratio: samples[prevIdx].ratio,
        });
      }

      milestonesRef.current = resolved;
      syncBikeToScroll(smoothProgress.get());
    });

    return () => cancelAnimationFrame(rafId);
  }, [roadPathD, smoothProgress, syncBikeToScroll]);

  // Listen strictly to page scroll: advance down on scroll down, reverse up on scroll up
  useEffect(() => {
    const unsubRaw = scrollYProgress.on("change", (latest) => {
      const delta = latest - prevScrollProgressRef.current;
      prevScrollProgressRef.current = latest;

      if (latest > 0.002) {
        setHasScrolled((prev) => (prev ? prev : true));
      }

      if (Math.abs(delta) > 0.00015) {
        setIsMoving(true);
        if (moveTimerRef.current) {
          window.clearTimeout(moveTimerRef.current);
        }
        moveTimerRef.current = window.setTimeout(() => {
          setIsMoving(false);
        }, 200);
      }

      if (delta > 0.00025 && directionRef.current !== "down") {
        directionRef.current = "down";
        setScrollDir("down");
      } else if (delta < -0.00025 && directionRef.current !== "up") {
        directionRef.current = "up";
        setScrollDir("up");
      }
    });

    const unsubSmooth = smoothProgress.on("change", (latest) => {
      syncBikeToScroll(latest);
    });

    return () => {
      unsubRaw();
      unsubSmooth();
      if (moveTimerRef.current) {
        window.clearTimeout(moveTimerRef.current);
      }
    };
  }, [scrollYProgress, smoothProgress, syncBikeToScroll]);

  const isMobile = docSize.width < 768;
  const roadWidth = isMobile ? 22 : 36;

  return (
    <div
      aria-hidden="true"
      data-scroll-road="true"
      className="pointer-events-none select-none absolute inset-0 z-[5] overflow-hidden"
    >
      {/* Full Continuous Snake-Like Winding Road SVG */}
      <svg
        width={docSize.width}
        height={docSize.height}
        viewBox={`0 0 ${docSize.width} ${docSize.height}`}
        className="w-full h-full overflow-visible"
        style={{
          maskImage:
            "linear-gradient(to right, rgba(0,0,0,0.96) 0%, rgba(0,0,0,0.96) 20%, rgba(0,0,0,0.34) 40%, rgba(0,0,0,0.34) 60%, rgba(0,0,0,0.96) 80%, rgba(0,0,0,0.96) 100%)",
          WebkitMaskImage:
            "linear-gradient(to right, rgba(0,0,0,0.96) 0%, rgba(0,0,0,0.96) 20%, rgba(0,0,0,0.34) 40%, rgba(0,0,0,0.34) 60%, rgba(0,0,0,0.96) 80%, rgba(0,0,0,0.96) 100%)",
        }}
      >
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fde047" />
            <stop offset="50%" stopColor="#facc15" />
            <stop offset="100%" stopColor="#eab308" />
          </linearGradient>
        </defs>

        {roadPathD && (
          <>
            {/* Concrete Curb / Road Shoulder Verge */}
            <path
              ref={measurePathRef}
              d={roadPathD}
              fill="none"
              strokeWidth={roadWidth + 4}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="stroke-zinc-400/55 dark:stroke-zinc-600/60"
            />

            {/* Real Dark Charcoal Asphalt Surface */}
            <path
              d={roadPathD}
              fill="none"
              strokeWidth={roadWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="stroke-zinc-700/80 dark:stroke-zinc-800/95"
            />

            {/* Darker Inner Tarmac Wear Track */}
            <path
              d={roadPathD}
              fill="none"
              strokeWidth={roadWidth - 10}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="stroke-zinc-800/35 dark:stroke-zinc-900/55"
            />

            {/* Classic Road-Yellow Dashed Center Highway Striping */}
            <path
              d={roadPathD}
              fill="none"
              stroke="#eab308"
              strokeWidth={1.6}
              strokeDasharray="10 13"
              strokeLinecap="round"
              opacity={0.58}
            />

            {/* Soft Driven Tarmac Sheen Behind Bike */}
            <path
              ref={activeHaloRef}
              d={roadPathD}
              pathLength={1}
              fill="none"
              stroke="#f8fafc"
              strokeWidth={isMobile ? 8 : 14}
              strokeDasharray="1"
              strokeDashoffset="1"
              strokeLinecap="round"
              opacity={hasScrolled ? 0.1 : 0.03}
              className="transition-opacity duration-500"
            />

            {/* Illuminated Amber-Yellow Driven Highway Line */}
            <path
              ref={activeTraceRef}
              d={roadPathD}
              pathLength={1}
              fill="none"
              stroke={`url(#${gradId})`}
              strokeWidth={isMobile ? 1.85 : 2.5}
              strokeDasharray="1"
              strokeDashoffset="1"
              strokeLinecap="round"
              opacity={hasScrolled ? 0.88 : 0.3}
              className="transition-opacity duration-500"
            />

            {/* Crisp Warm Highlight Along Traveled Road Center */}
            <path
              ref={activeHighlightRef}
              d={roadPathD}
              pathLength={1}
              fill="none"
              stroke="#fef9c3"
              strokeWidth={isMobile ? 0.75 : 1}
              strokeDasharray="1"
              strokeDashoffset="1"
              strokeLinecap="round"
              opacity={hasScrolled ? 0.55 : 0.15}
              className="transition-opacity duration-500"
            />
          </>
        )}
      </svg>

      {/* Attractive Top-Down Motorcycle + Human Rider Locked ON Road Centerline */}
      <div
        ref={bikeWrapperRef}
        className="pointer-events-none absolute left-0 top-0 h-0 w-0 origin-[0_0] will-change-transform"
        style={{
          opacity: hasScrolled ? 1 : 0.78,
          transition: "opacity 300ms ease",
        }}
      >
        <div className="absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2">
          <div
            className="transition-transform duration-300 ease-out"
            style={{
              transform: `${isMobile ? "scale(0.82) " : ""}${scrollDir === "up" ? "rotate(180deg)" : "rotate(0deg)"}`,
            }}
          >
            {/* Centered 64x28 Top-Down Superbike + Human Rider (Center = 32, 14) */}
            <svg
              width="64"
              height="28"
              viewBox="0 0 64 28"
              fill="none"
              className="overflow-visible drop-shadow-[0_5px_10px_rgba(0,0,0,0.32)]"
            >
              <defs>
                <linearGradient id={bikeBodyGradId} x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#16a34a" />
                  <stop offset="55%" stopColor="#22c55e" />
                  <stop offset="100%" stopColor="#10b981" />
                </linearGradient>
                <linearGradient id={jacketGradId} x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#1e293b" />
                  <stop offset="100%" stopColor="#334155" />
                </linearGradient>
                <linearGradient id={helmetGradId} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f8fafc" />
                  <stop offset="100%" stopColor="#cbd5e1" />
                </linearGradient>
                <linearGradient id={headlightGradId} x1="0%" y1="50%" x2="100%" y2="50%">
                  <stop offset="0%" stopColor="#fef9c3" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* Warm Halogen Forward Headlight Beam Cone */}
              <path
                d="M52 11 L82 4 L82 24 L52 17 Z"
                fill={`url(#${headlightGradId})`}
                opacity={isMoving ? 0.95 : 0.45}
                className="transition-opacity duration-200"
              />

              {/* Subtle Air Slipstream Streaks Behind Rear Tire */}
              <g
                opacity={isMoving ? 0.7 : 0}
                className="transition-opacity duration-200"
              >
                <line
                  x1="-12"
                  y1="14"
                  x2="5"
                  y2="14"
                  stroke="#e4e4e7"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <line
                  x1="-7"
                  y1="10.5"
                  x2="4"
                  y2="10.5"
                  stroke="#a1a1aa"
                  strokeWidth="1.1"
                  strokeLinecap="round"
                />
                <line
                  x1="-7"
                  y1="17.5"
                  x2="4"
                  y2="17.5"
                  stroke="#a1a1aa"
                  strokeWidth="1.1"
                  strokeLinecap="round"
                />
              </g>

              {/* Rear Sport Tire (centered cleanly on y=14) */}
              <rect
                x="8"
                y="10.5"
                width="13"
                height="7"
                rx="3.2"
                fill="#09090b"
                stroke="#3f3f46"
                strokeWidth="0.7"
              />

              {/* Front Sport Tire (centered cleanly on y=14) */}
              <rect
                x="44"
                y="11"
                width="12"
                height="6"
                rx="2.8"
                fill="#09090b"
                stroke="#3f3f46"
                strokeWidth="0.7"
              />

              {/* Metallic Exhaust Pipes */}
              <rect x="13" y="9" width="9" height="2" rx="1" fill="#64748b" />
              <rect x="13" y="17" width="9" height="2" rx="1" fill="#64748b" />

              {/* Rear Tail Cowl & Red Brake Strip */}
              <path
                d="M14 11.5 L22 10.5 L22 17.5 L14 16.5 Z"
                fill="#0f172a"
                stroke="#22c55e"
                strokeWidth="0.8"
              />
              <rect
                x="13.5"
                y="12"
                width="1.6"
                height="4"
                rx="0.8"
                fill={isMoving ? "#ef4444" : "#f87171"}
              />

              {/* Sleek Emerald Fuel Tank & Front Fairing Nose */}
              <path
                d="M27 9.5 C34 8.2 44 9.5 51 12.2 C52.2 12.8 52.2 15.2 51 15.8 C44 18.5 34 19.8 27 18.5 Z"
                fill={`url(#${bikeBodyGradId})`}
                stroke="#bbf7d0"
                strokeOpacity="0.65"
                strokeWidth="0.8"
              />

              {/* Smoked Aero Windscreen & Front LED Headlight */}
              <path
                d="M41 11.2 C44.5 11.4 47.5 12.6 48.5 14 C47.5 15.4 44.5 16.6 41 16.8 Z"
                fill="#020617"
                fillOpacity="0.88"
              />
              <rect x="50.2" y="12.2" width="2.2" height="3.6" rx="1.1" fill="#fef08a" />

              {/* Wide Clip-On Handlebars & Grips */}
              <path
                d="M39.5 5.2 L42 11 M39.5 22.8 L42 17"
                stroke="#94a3b8"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
              <rect x="38.2" y="4" width="2.4" height="3.2" rx="1" fill="#09090b" />
              <rect x="38.2" y="20.8" width="2.4" height="3.2" rx="1" fill="#09090b" />

              {/* Human Rider Seated: Knees Flanking Tank */}
              <ellipse cx="29" cy="9.2" rx="3.4" ry="1.6" fill="#0f172a" />
              <ellipse cx="29" cy="18.8" rx="3.4" ry="1.6" fill="#0f172a" />

              {/* Human Rider Jacket Torso & Shoulders */}
              <path
                d="M21 10 C21 7.2 24.5 6.4 28 7.5 L31.5 9 C32.5 11.5 32.5 16.5 31.5 19 L28 20.5 C24.5 21.6 21 20.8 21 18 Z"
                fill={`url(#${jacketGradId})`}
                stroke="#475569"
                strokeWidth="0.8"
              />

              {/* Jacket Emerald Spine Stripe */}
              <rect x="22" y="13.2" width="5.5" height="1.6" rx="0.8" fill="#4ade80" />

              {/* Human Arms Reaching Forward Gripping Handlebars */}
              <path
                d="M27.5 8.2 C31.5 7.4 35.5 6.8 39 5.8"
                stroke="#334155"
                strokeWidth="3.1"
                strokeLinecap="round"
              />
              <path
                d="M27.5 19.8 C31.5 20.6 35.5 21.2 39 22.2"
                stroke="#334155"
                strokeWidth="3.1"
                strokeLinecap="round"
              />
              {/* Rider Armored Gloves */}
              <circle cx="39.2" cy="5.8" r="1.4" fill="#22c55e" />
              <circle cx="39.2" cy="22.2" r="1.4" fill="#22c55e" />

              {/* Human Full-Face Glossy Motorcycle Helmet (centered on y=14) */}
              <ellipse
                cx="30.5"
                cy="14"
                rx="6.2"
                ry="5.2"
                fill={`url(#${helmetGradId})`}
                stroke="#0f172a"
                strokeWidth="0.9"
              />
              {/* Emerald Helmet Racing Stripe */}
              <path
                d="M24.8 14 L33.5 14"
                stroke="#22c55e"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
              {/* Tinted Helmet Visor Facing Road Forward */}
              <path
                d="M33.2 10.2 C36 11.2 36.8 12.6 36.8 14 C36.8 15.4 36 16.8 33.2 17.8 C34.2 15.6 34.2 12.4 33.2 10.2 Z"
                fill="#020617"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Wraps landing page sections to render a fully snake-like winding road with bike & rider.
 */
export function ScrollRoadStage({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={containerRef}
      data-landing-sections="true"
      className="relative overflow-x-clip"
    >
      {children}
      <ScrollRoadBackdrop containerRef={containerRef} />
    </div>
  );
}
