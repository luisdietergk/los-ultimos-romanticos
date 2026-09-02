"use client";

import {
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { flushSync } from "react-dom";
import Image from "next/image";
import type { ShopProduct } from "../Tienda";
import { ProductSheetModal } from "./ProductSheetModal";

// Geometry + physics constants below are ported from the prototype's rack
// methods (Los Ultimos Romanticos.dc.html:1365-1506: `rackGeom`/`rackScale`/
// `itemDelta`/`heroIdx`/`layoutRack`/`startRack`/`glideRack`/`rackDown`).
function rackGeom(width: number) {
  const W = width || 390;
  return { W, SP: W * 0.365, HERO: W * 0.325, TY0: 40, SLOPE: 0.105 };
}

function rackScale(f: number) {
  if (f <= 0.325) return 1 + 0.06 * Math.min(1, (0.325 - f) / 0.325);
  if (f <= 0.5) return 1 - 0.13 * ((f - 0.325) / 0.175);
  if (f <= 0.85) return 0.87 - 0.12 * ((f - 0.5) / 0.35);
  return Math.max(0.66, 0.75 - 0.09 * ((f - 0.85) / 0.35));
}

function itemDelta(i: number, pos: number, n: number) {
  let d = (i - pos) % n;
  if (d < 0) d += n;
  if (d > n / 2) d -= n;
  return d;
}

function heroIndex(pos: number, n: number) {
  let best = 0;
  let bestDist = Infinity;
  for (let i = 0; i < n; i++) {
    const d = Math.abs(itemDelta(i, pos, n));
    if (d < bestDist) {
      bestDist = d;
      best = i;
    }
  }
  return best;
}

const GLIDE_RATE = 7.5; // ported from `startRack`'s glide-to-target ease factor
const FRICTION = 0.045; // ported from `startRack`'s post-drag deceleration
const IDLE_VEL = 0.05; // slots/sec — gentle continuous auto-scroll at rest (the
// prototype decays fully to a stop; this build keeps the rack subtly alive)
const SWAY_AMPLITUDE = 0.55; // deg — idle per-item tilt oscillation amplitude
const SWAY_FREQ = 0.55; // rad/sec
const SWAY_PHASE = 1.7; // rad offset per item index, ported from `layoutRack`'s
// per-item tilt factor (0.82 + 0.18*sin(i*1.7))

/** The horizontal "clothing rack": 8 shop items with perspective
 * depth-scaling by horizontal position, infinite wraparound, drag/swipe
 * momentum, a gentle continuous idle drift, and a subtle per-item tilt-sway.
 * Tapping an item opens the product sheet. Ported from the prototype's
 * `#tienda` rack (dc.html:434-445, math at 1365-1506) — per-frame layout is
 * applied directly to DOM refs rather than React state, same approach as
 * `KitOrbit`/`Hero.tsx`. */
export function ShopRack({ products }: { products: ShopProduct[] }) {
  const n = Math.max(1, products.length);

  const stageRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  const posRef = useRef(0); // `rpos`
  const velRef = useRef(IDLE_VEL); // `rvel`
  const targetRef = useRef<number | null>(null); // `rtarget`
  const holdRef = useRef(false); // `rackHold`
  const draggedRef = useRef(false); // `rackDragged`
  const tiltRef = useRef(0); // shared velocity-reactive component of `tilt`
  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef(0);

  const [activeIndex, setActiveIndex] = useState(0);
  const [openId, setOpenId] = useState<string | null>(null);
  const [hasSwiped, setHasSwiped] = useState(false);
  // Which single product's rack photo is allowed to carry a
  // view-transition-name right now. Only ever one product at a time (or
  // none) — every other item's name must stay undefined, always, even
  // outside of a transition: the View Transitions API tracks *any* element
  // that has a name at snapshot time as its own independently-animated
  // group, so if every rack photo kept a permanent unique name, opening one
  // product would still cross-fade all the *other* untouched photos too
  // (each fading out on its own, right where it sits) — which is exactly
  // the "other jerseys hang around" bug this avoids.
  const [transitionProductId, setTransitionProductId] = useState<string | null>(null);

  // Opening/closing the product sheet goes through the browser's View
  // Transitions API when available, so the tapped photo (view-transition-name
  // set below, and again on the modal's own hero image) morphs smoothly
  // between its rack position and the sheet's hero position instead of the
  // sheet just appearing. `flushSync` forces each state update to commit
  // synchronously, which the API requires to capture the "before"/"after"
  // DOM snapshots correctly. Unsupported browsers (no startViewTransition)
  // just get the plain, instant state change — pure progressive enhancement.
  const setOpenIdWithTransition = useCallback((id: string | null) => {
    const withTransitions = typeof document !== "undefined" && "startViewTransition" in document;
    if (!withTransitions) {
      setOpenId(id);
      return;
    }
    if (id !== null) {
      // The browser snapshots the "old" DOM synchronously the instant
      // startViewTransition is called (before its callback ever runs), so
      // the rack item needs to already have claimed the name *before* that
      // call — flushed here as its own separate update, ahead of time.
      flushSync(() => setTransitionProductId(id));
    }
    const transition = document.startViewTransition(() => flushSync(() => setOpenId(id)));
    if (id === null) {
      // Closing: only release the name after the reverse morph finishes
      // playing, so the rack item has it back in time for the "new" snapshot.
      transition.finished.finally(() => setTransitionProductId(null));
    }
  }, []);

  const layout = useCallback(() => {
    const stage = stageRef.current;
    const rail = railRef.current;
    if (!stage) return;
    const g = rackGeom(stage.clientWidth);
    // The rail is a wide static bar, but the items it "hangs" from follow a
    // sloped line (y = TY0 + x*SLOPE, per item x). Rotating the bar by the
    // slope's angle and anchoring it at the same y the hero item sits at
    // (x = g.HERO) makes the rail's drawn line coincide with that formula
    // instead of sitting flat while the items themselves lean across it.
    if (rail) {
      const angleDeg = Math.atan(g.SLOPE) * (180 / Math.PI);
      const railY = g.TY0 + g.HERO * g.SLOPE + 4;
      rail.style.top = `${railY}px`;
      rail.style.transform = `rotate(${angleDeg.toFixed(3)}deg)`;
    }
    const elapsed = (performance.now() - startTimeRef.current) / 1000;
    for (let i = 0; i < products.length; i++) {
      const node = itemRefs.current[i];
      if (!node) continue;
      const d = itemDelta(i, posRef.current, n);
      const x = g.HERO + d * g.SP;
      const f = x / g.W;
      const sc = rackScale(f);
      const visible = x > -0.55 * g.W && x < 1.75 * g.W;
      node.style.visibility = visible ? "visible" : "hidden";
      if (!visible) continue;
      const y = g.TY0 + x * g.SLOPE - 22 * sc;
      const velTilt = tiltRef.current * (0.82 + 0.18 * Math.sin(i * SWAY_PHASE));
      const idleSway = SWAY_AMPLITUDE * Math.sin(elapsed * SWAY_FREQ + i * SWAY_PHASE);
      const tilt = velTilt + idleSway;
      node.style.left = `${x}px`;
      node.style.top = `${y}px`;
      node.style.transform = `translateX(-50%) scale(${sc.toFixed(3)}) rotate(${tilt.toFixed(2)}deg)`;
      node.style.zIndex = String(Math.round(120 - x / 8));
      node.style.opacity = (1 - Math.max(0, Math.min(0.16, (f - 0.325) * 0.28))).toFixed(3);
      node.style.filter = f <= 0.34 ? "none" : `brightness(${(1 - Math.min(0.06, (f - 0.34) * 0.11)).toFixed(3)})`;
    }
    const hero = heroIndex(posRef.current, n);
    setActiveIndex((prev) => (prev === hero ? prev : hero));
  }, [n, products.length]);

  const startLoop = useCallback(() => {
    if (rafRef.current != null) return;
    let last = performance.now();
    const step = (now: number) => {
      rafRef.current = requestAnimationFrame(step);
      const dt = Math.min(50, now - last) / 1000;
      last = now;
      if (!holdRef.current) {
        if (targetRef.current != null) {
          const diff = targetRef.current - posRef.current;
          posRef.current += diff * Math.min(1, dt * GLIDE_RATE);
          velRef.current = diff * 3;
          if (Math.abs(diff) < 0.002) {
            posRef.current = targetRef.current;
            targetRef.current = null;
            velRef.current = IDLE_VEL;
          }
        } else {
          velRef.current = IDLE_VEL + (velRef.current - IDLE_VEL) * Math.pow(FRICTION, dt);
          if (Math.abs(velRef.current - IDLE_VEL) < 0.003) velRef.current = IDLE_VEL;
          posRef.current += velRef.current * dt;
        }
      }
      const tiltTarget = Math.max(-6, Math.min(6, -velRef.current * 2.4));
      tiltRef.current += (tiltTarget - tiltRef.current) * Math.min(1, dt * 5);
      layout();
    };
    rafRef.current = requestAnimationFrame(step);
  }, [layout]);

  const glideTo = useCallback(
    (i: number) => {
      const d = itemDelta(i, posRef.current, n);
      targetRef.current = posRef.current + d;
      startLoop();
    },
    [n, startLoop]
  );

  useLayoutEffect(() => {
    startTimeRef.current = performance.now();
    layout(); // synchronous first paint so items aren't briefly stacked at (0,0)
    startLoop();
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    const stage = stageRef.current;
    if (!stage) return;
    // Pointer capture is deferred until the drag threshold is actually
    // crossed (not set on every pointerdown) — capturing immediately would
    // redirect the eventual `click` event's target to `stage` for every
    // tap, including a simple product select, silently breaking each
    // card's onClick={() => handleOpen(...)} below.
    const pointerId = e.pointerId;
    let captured = false;
    stage.style.cursor = "grabbing";
    const g = rackGeom(stage.clientWidth);
    holdRef.current = true;
    targetRef.current = null;
    draggedRef.current = false;
    startLoop();
    const startX = e.clientX;
    const startPos = posRef.current;
    let lastX = startX;
    let lastT = performance.now();
    let v = 0;

    const onMove = (ev: PointerEvent) => {
      const dx = ev.clientX - startX;
      if (Math.abs(dx) > 5) {
        draggedRef.current = true;
        if (!captured) {
          stage.setPointerCapture(pointerId);
          captured = true;
          setHasSwiped(true);
        }
      }
      const now = performance.now();
      const dtm = Math.max(8, now - lastT);
      v = (ev.clientX - lastX) / g.SP / (dtm / 1000);
      lastX = ev.clientX;
      lastT = now;
      posRef.current = startPos - dx / g.SP;
      tiltRef.current = Math.max(-6, Math.min(6, tiltRef.current + (v * 0.85 - tiltRef.current) * 0.3));
      layout();
    };
    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      if (captured) stage.releasePointerCapture(pointerId);
      stage.style.cursor = "grab";
      holdRef.current = false;
      velRef.current = Math.max(-9, Math.min(9, -v * 0.85));
      if (draggedRef.current) {
        setTimeout(() => {
          draggedRef.current = false;
        }, 80);
      }
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
  };

  const handleOpen = (i: number, product: ShopProduct) => {
    if (draggedRef.current) return;
    if (i !== heroIndex(posRef.current, n)) glideTo(i);
    setOpenIdWithTransition(product.id);
  };

  return (
    <>
      <div
        ref={stageRef}
        onPointerDown={onPointerDown}
        className="relative mt-5 h-[640px] touch-pan-y select-none overflow-hidden cursor-grab"
      >
        <div
          ref={railRef}
          aria-hidden
          className="pointer-events-none absolute inset-x-0 h-[16px] origin-center"
          style={{
            top: "44px",
            background: "linear-gradient(to bottom, #4c4746, #2a2726 26%, #141212 62%, #080707 100%)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,.15), 0 6px 10px rgba(0,0,0,.35)",
          }}
        />
        {!hasSwiped && (
          <div className="pointer-events-none absolute inset-x-0 top-2 flex flex-col items-center gap-1 text-ink">
            <svg
              width="26"
              height="33"
              viewBox="0 0 24 30"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="animate-[lur-swipe-hint_1.4s_ease-in-out_infinite]"
            >
              <path d="M 7.6 15.5 C 7.8 14.64 7.49 9.55 7.5 8 C 7.51 6.45 7.45 3.42 7.7 2.6 C 7.95 1.78 9.16 1.2 9.6 1.2 C 10.04 1.2 11.21 1.93 11.4 2.6 C 11.59 3.27 11.14 6.03 11.2 6.8 C 11.26 7.57 11.68 8.99 11.9 9 C 12.12 9.01 12.7 7.31 13 6.9 C 13.3 6.49 14.09 5.6 14.4 5.6 C 14.71 5.6 15.48 6.47 15.6 6.9 C 15.72 7.33 15.35 8.72 15.4 9.2 C 15.45 9.68 15.82 10.89 16 10.9 C 16.18 10.91 16.67 9.59 16.9 9.3 C 17.13 9.01 17.66 8.5 17.9 8.5 C 18.14 8.5 18.8 8.98 18.9 9.3 C 19 9.62 18.66 10.8 18.7 11.2 C 18.74 11.6 19.07 12.59 19.2 12.6 C 19.33 12.61 19.63 11.5 19.8 11.3 C 19.97 11.1 20.42 10.82 20.6 10.9 C 20.78 10.98 21.23 11.51 21.3 12 C 21.37 12.49 21.24 14.16 21.2 15 C 21.16 15.84 21.19 17.92 21 19 C 20.81 20.08 20.44 23.06 19.6 24 C 18.76 24.94 15.21 26.56 14 26.8 C 12.79 27.04 10.56 26.54 9.5 26 C 8.44 25.46 6.03 23.21 5.2 22.3 C 4.37 21.39 2.97 19.24 2.6 18.4 C 2.23 17.56 1.98 15.9 2.1 15.3 C 2.22 14.7 3.16 13.41 3.6 13.4 C 4.04 13.39 5.32 14.95 5.8 15.2 C 6.28 15.45 7.4 16.36 7.6 15.5 Z" />
            </svg>
            <span className="text-[11px] font-extrabold uppercase tracking-[0.14em]">ARRASTRA</span>
            <span className="-mt-0.5 text-[8.5px] font-bold uppercase tracking-[0.2em] text-neutral-600">PARA EXPLORAR</span>
          </div>
        )}

        {products.map((p, i) => (
          <div
            key={p.id}
            ref={(el) => {
              itemRefs.current[i] = el;
            }}
            onClick={() => handleOpen(i, p)}
            className="absolute top-0 h-[440px] w-[252px] origin-top cursor-pointer will-change-transform"
          >
            {/* Box height is intentionally close to typical garment-photo
                proportions (roughly 2:3 to 5:9) rather than tall — a much
                taller box was letterboxing product photos far down inside
                it (object-contain centers the image vertically when the box
                is proportionally taller than the photo), which pushed each
                photo's own hanger artwork ~60-90px below this rail instead
                of lining up with it. Keeping the box close to the photo's
                real aspect ratio means the image fills it top-to-bottom
                with no such gap. */}
            <div
              className="relative mt-1.5 h-[370px]"
              // Claimed by the product sheet's hero image while it's open for
              // this product (see setOpenIdWithTransition above) — releasing
              // it here is what lets the View Transitions API match the two
              // elements up and morph between them. Every other product must
              // stay nameless at all times (see transitionProductId above).
              style={{
                viewTransitionName:
                  p.id === transitionProductId && openId !== p.id ? `shop-photo-${p.id}` : undefined,
              }}
            >
              {p.photoUrl ? (
                <Image
                  src={p.photoUrl}
                  alt={p.name}
                  fill
                  sizes="252px"
                  className="object-contain drop-shadow-[0_18px_22px_rgba(32,30,29,0.24)]"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center border border-dashed border-neutral-400 text-center text-[11px] font-extrabold uppercase tracking-wide text-neutral-600">
                  {p.name}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3.5 flex items-center justify-center gap-1.5">
        {products.map((p, i) => (
          <span
            key={p.id}
            onClick={() => glideTo(i)}
            className="block h-[6px] w-[6px] cursor-pointer transition-colors"
            style={{ background: i === activeIndex ? "var(--color-accent)" : "var(--color-neutral-400)" }}
          />
        ))}
      </div>

      <ProductSheetModal
        product={products.find((p) => p.id === openId) ?? null}
        onClose={() => setOpenIdWithTransition(null)}
      />
    </>
  );
}
