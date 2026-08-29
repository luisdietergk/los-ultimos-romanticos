"use client";

import {
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import Image from "next/image";

export interface KitImage {
  id: string;
  type: "LOCAL" | "VISITA" | "PORTERO";
  title: string;
  imageUrl: string | null;
}

const KIT_ORDER: KitImage["type"][] = ["LOCAL", "VISITA", "PORTERO"];
const KIT_META: Record<KitImage["type"], { label: string; dot: string }> = {
  LOCAL: { label: "LOCAL", dot: "var(--color-accent-light)" },
  VISITA: { label: "VISITANTE", dot: "var(--color-neutral-100)" },
  PORTERO: { label: "PORTERO", dot: "#c08a3e" },
};

// Constants below are ported directly from the prototype's kit-orbit methods
// (Los Ultimos Romanticos.dc.html:1618-1704: `kitIndex`/`setKitPos`/
// `animateKit`/`spinKit`/`layoutKits`/`startKitSpin`/`kitDown`).
const RADIUS = 150; // px — orbit radius, from `layoutKits`'s R
const IDLE_VEL = 0.085; // slots/sec — idle auto-spin speed the velocity decays toward
const SPIN_DECAY = 0.62; // per-second multiplier pulling velocity back to IDLE_VEL
const DRAG_UNIT = 132; // px of drag per one orbit slot

/** The "orbit": 3 kit photos arranged on a circle, one front-and-center at a
 * time. Auto-spins slowly forever, and can be dragged/flicked (Pointer
 * Events, unified mouse+touch) with momentum that decays back into the idle
 * spin rather than ever fully stopping. Ported from the prototype's
 * `#uniformes` kit carousel (dc.html:405-414, math at 1618-1704) — the
 * per-frame transform/shadow layout is applied directly to DOM refs (not
 * React state) to keep the animation loop off the render path, same
 * approach as `Hero.tsx`'s scroll parallax. */
export function KitOrbit({ kits }: { kits: KitImage[] }) {
  const ordered = [...kits].sort((a, b) => KIT_ORDER.indexOf(a.type) - KIT_ORDER.indexOf(b.type));
  const n = Math.max(1, ordered.length);

  const stageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const shadowRefs = useRef<(HTMLDivElement | null)[]>([]);

  const posRef = useRef(0); // `kpos` — continuous rotation position, in orbit slots
  const velRef = useRef(IDLE_VEL); // `kitVel`
  const holdRef = useRef(false); // `kitHold`
  const draggedRef = useRef(false); // `kitDragged`
  const rafRef = useRef<number | null>(null);

  const [activeIndex, setActiveIndex] = useState(0);

  const setPos = useCallback(
    (p: number) => {
      let v = p % n;
      if (v < 0) v += n;
      posRef.current = v;
    },
    [n]
  );

  const layout = useCallback(() => {
    for (let i = 0; i < n; i++) {
      const node = stageRefs.current[i];
      if (!node) continue;
      const ang = ((i - posRef.current) / n) * Math.PI * 2;
      const sin = Math.sin(ang);
      const cos = Math.cos(ang);
      const depth = (1 - cos) / 2;
      node.style.transform = `translateX(${(RADIUS * sin).toFixed(2)}px) translateY(${(10 * depth).toFixed(2)}px) scale(${(1 - 0.3 * depth).toFixed(3)})`;
      node.style.opacity = (1 - 0.34 * depth).toFixed(3);
      node.style.filter = `brightness(${(1 - 0.16 * depth).toFixed(3)})`;
      node.style.zIndex = String(Math.round(100 + cos * 50));

      const shadow = shadowRefs.current[i];
      if (shadow) {
        shadow.style.bottom = `${(-30 + 16 * depth).toFixed(1)}px`;
        shadow.style.width = `${(196 - 26 * depth).toFixed(1)}px`;
        shadow.style.height = `${(32 - 6 * depth).toFixed(1)}px`;
        shadow.style.marginLeft = `${(-98 + 13 * depth).toFixed(1)}px`;
      }
    }
    const idx = ((Math.round(posRef.current) % n) + n) % n;
    setActiveIndex((prev) => (prev === idx ? prev : idx));
  }, [n]);

  const startSpin = useCallback(() => {
    if (rafRef.current != null) return;
    let last = performance.now();
    const step = (now: number) => {
      const dt = Math.min(50, now - last) / 1000;
      last = now;
      if (!holdRef.current) {
        velRef.current = IDLE_VEL + (velRef.current - IDLE_VEL) * Math.pow(SPIN_DECAY, dt);
        if (Math.abs(velRef.current - IDLE_VEL) < 0.004) velRef.current = IDLE_VEL;
        setPos(posRef.current + velRef.current * dt);
      }
      layout();
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
  }, [layout, setPos]);

  useLayoutEffect(() => {
    layout(); // synchronous first paint so kits aren't briefly stacked at (0,0)
    startSpin();
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const animateTo = useCallback(
    (target: number) => {
      const start = posRef.current;
      let d = target - start;
      while (d > n / 2) d -= n;
      while (d < -n / 2) d += n;
      velRef.current = d * 2.6;
      startSpin();
    },
    [n, startSpin]
  );

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    // Pointer capture is deferred until the drag threshold is actually
    // crossed (not set on every pointerdown) — capturing immediately would
    // redirect the eventual `click` event's target to this container for
    // every tap, including simple selects, silently breaking each kit's
    // onClick handler below.
    const target = e.currentTarget;
    const pointerId = e.pointerId;
    let captured = false;
    holdRef.current = true;
    draggedRef.current = false;
    startSpin();
    const startX = e.clientX;
    const startPos = posRef.current;
    let lastX = startX;
    let lastT = performance.now();
    let vel = 0;

    const onMove = (ev: PointerEvent) => {
      const dx = ev.clientX - startX;
      if (Math.abs(dx) > 4) {
        draggedRef.current = true;
        if (!captured) {
          target.setPointerCapture(pointerId);
          captured = true;
        }
      }
      const now = performance.now();
      const dt = Math.max(8, now - lastT);
      vel = (ev.clientX - lastX) / dt;
      lastX = ev.clientX;
      lastT = now;
      setPos(startPos - dx / DRAG_UNIT);
    };
    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      if (captured) target.releasePointerCapture(pointerId);
      holdRef.current = false;
      velRef.current = Math.max(-9, Math.min(9, (-vel / DRAG_UNIT) * 1000));
      setTimeout(() => {
        draggedRef.current = false;
      }, 60);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
  };

  const active = ordered[activeIndex] ?? ordered[0];
  const activeMeta = active ? KIT_META[active.type] : null;

  return (
    <div className="mx-auto max-w-[420px]">
      <div
        onPointerDown={onPointerDown}
        className="relative mt-6 h-[545px] touch-pan-y select-none"
        style={{ perspective: "1100px" }}
      >
        {ordered.map((kit, i) => {
          const meta = KIT_META[kit.type];
          return (
            <div
              key={kit.id}
              ref={(el) => {
                stageRefs.current[i] = el;
              }}
              onClick={() => {
                if (!draggedRef.current) animateTo(i);
              }}
              className="absolute left-1/2 top-0 -ml-[169px] h-[520px] w-[338px] cursor-grab will-change-transform"
              style={{ transformOrigin: "center bottom" }}
            >
              <div className="relative h-full w-full">
                {kit.imageUrl ? (
                  <Image src={kit.imageUrl} alt={kit.title} fill sizes="338px" className="object-contain" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center border border-dashed border-neutral-700 text-center text-xs font-extrabold uppercase tracking-widest text-neutral-500">
                    {meta.label}
                  </div>
                )}
              </div>
              <div
                ref={(el) => {
                  shadowRefs.current[i] = el;
                }}
                className="pointer-events-none absolute left-1/2 -z-10 blur-[7px]"
                style={{
                  background:
                    "radial-gradient(ellipse at center, rgba(0,0,0,.5) 0%, rgba(0,0,0,.26) 52%, rgba(0,0,0,0) 80%)",
                }}
              />
            </div>
          );
        })}
      </div>

      <div className="mt-1 flex items-center justify-center gap-6">
        <button
          type="button"
          onClick={() => animateTo(posRef.current - 1)}
          className="text-2xl leading-none text-cream"
          aria-label="Uniforme anterior"
        >
          ‹
        </button>
        {activeMeta && (
          <div className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.16em] text-cream">
            <span className="h-[5px] w-[5px] rotate-45" style={{ background: activeMeta.dot }} />
            {activeMeta.label}
          </div>
        )}
        <button
          type="button"
          onClick={() => animateTo(posRef.current + 1)}
          className="text-2xl leading-none text-cream"
          aria-label="Siguiente uniforme"
        >
          ›
        </button>
      </div>

      <div className="mt-2.5 flex items-center justify-center gap-2">
        {ordered.map((kit, i) => (
          <span
            key={kit.id}
            onClick={() => animateTo(i)}
            className="block h-[5px] w-[5px] rotate-45 cursor-pointer transition-colors"
            style={{ background: i === activeIndex ? "var(--color-accent-light)" : "var(--color-neutral-700)" }}
          />
        ))}
      </div>
    </div>
  );
}
