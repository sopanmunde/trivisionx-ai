"use client";

import type React from "react";

import { useEffect } from "react";
import Lenis from "lenis";

let activeLenis: Lenis | null = null;

/** Scrolls the active document smoothly (or immediately while scrubbing) via Lenis when mounted. */
export function scrollToY(targetY: number, immediate = false) {
  const maxScroll = Math.max(
    0,
    document.documentElement.scrollHeight - window.innerHeight
  );
  const clampedY = Math.max(0, Math.min(maxScroll, targetY));

  if (activeLenis) {
    activeLenis.scrollTo(clampedY, { immediate });
  } else {
    window.scrollTo({
      top: clampedY,
      behavior: immediate ? "auto" : "smooth",
    });
  }
}

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });
    activeLenis = lenis;

    let rafId = 0;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }

    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      if (activeLenis === lenis) {
        activeLenis = null;
      }
    };
  }, []);

  return <>{children}</>;
}
