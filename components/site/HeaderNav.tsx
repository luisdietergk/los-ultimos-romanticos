"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

const NAV_ITEMS = [
  { n: "01", label: "Historia", href: "#historia" },
  { n: "02", label: "Partidos", href: "#partidos" },
  { n: "03", label: "Calendario", href: "#calendario" },
  { n: "04", label: "Plantilla", href: "#plantilla" },
  { n: "05", label: "Números", href: "#podios" },
  { n: "06", label: "Uniformes", href: "#uniformes" },
  { n: "07", label: "Tienda", href: "#tienda" },
];

// Header hides once the visitor scrolls down past a small threshold, and
// reappears as soon as they scroll back up (or return near the top) — a
// scroll-direction comparison against the last known position, throttled to
// one check per animation frame so it doesn't run on every scroll event.
const HIDE_AFTER_PX = 80;

export function HeaderNav({ crestUrl }: { crestUrl: string | null }) {
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);
  const ticking = useRef(false);

  useEffect(() => {
    lastY.current = window.scrollY;

    function onScroll() {
      if (ticking.current) return;
      ticking.current = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        if (y <= HIDE_AFTER_PX) {
          setHidden(false);
        } else if (y > lastY.current) {
          setHidden(true);
        } else if (y < lastY.current) {
          setHidden(false);
        }
        lastY.current = y;
        ticking.current = false;
      });
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className="fixed inset-x-0 top-0 z-40 transition-transform duration-300 ease-out"
      style={{ transform: hidden && !open ? "translateY(-100%)" : "translateY(0)" }}
    >
      <header className="flex items-center gap-3 bg-transparent px-4 py-2.5 text-ink lg:px-8">
        <div className="h-[41px] w-[34px] flex-none">
          {crestUrl && <Image src={crestUrl} alt="Escudo" width={68} height={82} className="h-full w-full object-contain" />}
        </div>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label="Menú"
          aria-expanded={open}
          className="relative ml-auto flex h-6 w-6 flex-none flex-col items-center justify-center gap-[5px] border-0 bg-none p-0"
        >
          <span
            className={`block h-0.5 w-6 bg-ink transition-transform duration-200 ${
              open ? "absolute rotate-45" : ""
            }`}
          />
          <span className={`block h-0.5 w-6 bg-ink transition-opacity duration-150 ${open ? "opacity-0" : ""}`} />
          <span
            className={`block h-0.5 w-6 bg-ink transition-transform duration-200 ${
              open ? "absolute -rotate-45" : ""
            }`}
          />
        </button>
      </header>

      <nav className="overflow-hidden bg-cream transition-[max-height] duration-300 ease-out" style={{ maxHeight: open ? 480 : 0 }}>
        {NAV_ITEMS.map((item) => (
          <a
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            className="flex items-baseline gap-4 border-b border-ink/40 px-6 py-[19px] text-[15px] font-extrabold uppercase tracking-wider text-ink"
          >
            <span className="font-bold text-[10px] text-accent tabular-nums">{item.n}</span>
            <span>{item.label}</span>
          </a>
        ))}
      </nav>
    </div>
  );
}
