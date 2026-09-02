"use client";

import { useEffect, useRef, useState } from "react";

/** Fades/slides a section up into place the first time it enters the
 * viewport — mirrors the prototype's `data-reveal` + IntersectionObserver
 * bookkeeping (`scanReveals`), simplified into one shared hook-backed
 * wrapper instead of hand-rolled per-section tracking. */
export function RevealSection({
  as: Tag = "section",
  className,
  id,
  style,
  children,
}: {
  as?: "section" | "div";
  className?: string;
  id?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.disconnect();
          }
        }
      },
      { threshold: 0.12 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref as never}
      id={id}
      style={style}
      className={`${className ?? ""} scroll-mt-16 transition-all duration-700 ease-out ${
        visible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
      }`}
    >
      {children}
    </Tag>
  );
}
