"use client";

import { useEffect, useRef, useState } from "react";

/** Animates a stat from 0 up to its already-server-computed final value the
 * first time it scrolls into view — mirrors the prototype's scroll-gated
 * count-up on the record row. */
export function RecordCountUp({ value }: { value: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          observer.disconnect();
          const duration = 800;
          const start = performance.now();
          const tick = (now: number) => {
            const t = Math.min(1, (now - start) / duration);
            setDisplay(Math.round(value * (1 - Math.pow(1 - t, 3))));
            if (t < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [value]);

  return (
    <div ref={ref} className="mt-px text-[28px] font-black leading-none tracking-tight tabular-nums">
      {String(display).padStart(2, "0")}
    </div>
  );
}
