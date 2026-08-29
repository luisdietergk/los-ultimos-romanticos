"use client";

import { useEffect, useRef } from "react";

/** Fixed, full-bleed tiled background pattern behind the whole page, drifting
 * at 0.12x scroll speed (counter to the hero video's 0.18x drift in Hero.tsx)
 * — ported from the prototype's `patRef`/`onScroll` handler. */
export function BackgroundPattern({ patternUrl }: { patternUrl: string | null }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const y = window.scrollY || 0;
        if (ref.current) ref.current.style.transform = `translateY(${(-y * 0.12).toFixed(1)}px)`;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  if (!patternUrl) return null;

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed left-1/2 top-[-15%] z-0 h-[130%] w-[480px] max-w-[100vw] -ml-[240px] will-change-transform"
      style={{ backgroundImage: `url(${patternUrl})`, backgroundSize: "480px auto", backgroundRepeat: "repeat" }}
    />
  );
}
