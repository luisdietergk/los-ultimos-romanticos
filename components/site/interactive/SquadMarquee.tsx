"use client";

import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import Image from "next/image";
import { playerGoalCount, type DerivedGoal } from "@/lib/derived";
import type { FullPlayer } from "../Plantilla";
import { PlayerProfileModal } from "./PlayerProfileModal";

const SPEED_PX_PER_MS = 0.034; // ~ the prototype's 0.34px/frame at 60fps
const RESUME_DELAY_MS = 4500;
// Must match PlayerCard's `w-[236px]` below — Tailwind's arbitrary-value
// classes can't be built from a JS constant, so the width is duplicated
// here purely for the centering/momentum math.
const CARD_WIDTH = 236;
const MOMENTUM_FRICTION = 0.94; // velocity multiplier per ~16.7ms frame
const MOMENTUM_MIN_VX = 0.02; // px/ms — below this, hand back to auto-scroll

/** The `#plantilla` squad row: a continuously auto-scrolling card marquee
 * (roster rendered twice back-to-back, translated by hand with
 * requestAnimationFrame and wrapped by exactly one list-length on cycle
 * completion — ported from the prototype's `startMarquee()`/`pauseMarquee()`,
 * Los Ultimos Romanticos.dc.html:1712-1737, but driving a CSS transform
 * instead of native `scrollLeft`), a "ver plantilla completa" toggle to a
 * static full-roster list, and the tap-to-open player profile modal. */
export function SquadMarquee({ roster, allGoals }: { roster: FullPlayer[]; allGoals: DerivedGoal[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef(0);
  const pausedRef = useRef(false);
  const draggedRef = useRef(false);
  const resumeTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const momentumRafRef = useRef<number | undefined>(undefined);
  const [selected, setSelected] = useState<FullPlayer | null>(null);
  const [showFull, setShowFull] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null);

  const pause = useCallback(() => {
    pausedRef.current = true;
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    resumeTimerRef.current = setTimeout(() => {
      pausedRef.current = false;
    }, RESUME_DELAY_MS);
  }, []);

  // Tap-to-center: the tapped card glides to the middle of the row and gets
  // its 15%-bigger highlight treatment (see PlayerCard) instead of jumping
  // straight to the profile modal — "Ver perfil" (or tapping it again) is
  // what actually opens the modal now.
  const centerOn = useCallback((i: number) => {
    const container = containerRef.current;
    const track = trackRef.current;
    if (!container || !track) return;
    const half = track.scrollWidth / 2;
    if (half <= 0) return;
    if (momentumRafRef.current) cancelAnimationFrame(momentumRafRef.current);
    const cardCenter = i * CARD_WIDTH + CARD_WIDTH / 2;
    let target = cardCenter - container.clientWidth / 2;
    target = ((target % half) + half) % half;
    pausedRef.current = true;
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    offsetRef.current = target;
    track.style.transition = "transform 0.45s cubic-bezier(0.22,1,0.36,1)";
    track.style.transform = `translateX(${-target}px)`;
    window.setTimeout(() => {
      if (trackRef.current) trackRef.current.style.transition = "";
    }, 460);
    setHighlightedIndex(i);
  }, []);

  useEffect(() => {
    if (roster.length === 0) return;
    let raf = 0;
    let last = 0;
    const step = (t: number) => {
      raf = requestAnimationFrame(step);
      const track = trackRef.current;
      if (!track || pausedRef.current || showFull || highlightedIndex != null) {
        last = t;
        return;
      }
      const dt = last ? Math.min(50, t - last) : 16.7;
      last = t;
      const half = track.scrollWidth / 2;
      if (half <= 0) return;
      offsetRef.current += SPEED_PX_PER_MS * dt;
      if (offsetRef.current >= half) offsetRef.current -= half;
      track.style.transform = `translateX(${-offsetRef.current}px)`;
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [roster.length, showFull, highlightedIndex]);

  useEffect(
    () => () => {
      if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
      if (momentumRafRef.current) cancelAnimationFrame(momentumRafRef.current);
    },
    []
  );

  // The auto-scroll above only ever *paused* on touch/pointerdown — it never
  // let the row follow the user's finger, so a swipe just froze it in place
  // for a few seconds instead of moving anything, which read as "scroll
  // doesn't work". This adds real dragging (ported the same way ShopRack's
  // rack drag works): pointer capture is deferred until the drag threshold
  // is crossed so a plain tap still reaches each card's onClick.
  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const track = trackRef.current;
    if (!track) return;
    const half = track.scrollWidth / 2;
    if (half <= 0) return;
    if (momentumRafRef.current) cancelAnimationFrame(momentumRafRef.current);
    track.style.transition = "";
    pause();
    const pointerId = e.pointerId;
    let captured = false;
    const startX = e.clientX;
    const startOffset = offsetRef.current;
    let lastMoveX = e.clientX;
    let lastMoveT = performance.now();
    let velocity = 0; // px/ms, smoothed

    const onMove = (ev: PointerEvent) => {
      const dx = ev.clientX - startX;
      if (!captured && Math.abs(dx) > 5) {
        draggedRef.current = true;
        setHighlightedIndex(null);
        container.setPointerCapture(pointerId);
        captured = true;
      }
      if (!captured) return;
      let next = startOffset - dx;
      next = ((next % half) + half) % half;
      offsetRef.current = next;
      track.style.transform = `translateX(${-next}px)`;

      const now = performance.now();
      const dt = now - lastMoveT;
      if (dt > 0) {
        const instant = (ev.clientX - lastMoveX) / dt;
        velocity = velocity * 0.7 + instant * 0.3;
      }
      lastMoveX = ev.clientX;
      lastMoveT = now;
    };
    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      if (captured) container.releasePointerCapture(pointerId);
      if (draggedRef.current) {
        setTimeout(() => {
          draggedRef.current = false;
        }, 80);

        // Keep gliding in the swipe's direction instead of stopping dead the
        // instant the finger lifts — velocity decays each frame until it's
        // negligible, then normal auto-scroll takes back over via pause().
        let vx = velocity;
        if (Math.abs(vx) > MOMENTUM_MIN_VX) {
          // Hold the pause without its auto-resume timer for the whole
          // glide — otherwise the timer from pause() at drag-start could
          // fire mid-glide and let the constant-speed auto-scroll loop
          // fight this one over the same transform.
          if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
          pausedRef.current = true;
          let lastT = performance.now();
          const glide = (t: number) => {
            const dt = Math.min(50, t - lastT);
            lastT = t;
            vx *= Math.pow(MOMENTUM_FRICTION, dt / 16.7);
            offsetRef.current -= vx * dt;
            offsetRef.current = ((offsetRef.current % half) + half) % half;
            if (track) track.style.transform = `translateX(${-offsetRef.current}px)`;
            if (Math.abs(vx) > MOMENTUM_MIN_VX) {
              momentumRafRef.current = requestAnimationFrame(glide);
            } else {
              momentumRafRef.current = undefined;
              pause();
            }
          };
          momentumRafRef.current = requestAnimationFrame(glide);
        } else {
          pause();
        }
      }
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
  };

  if (roster.length === 0) return null;

  const doubled = [...roster, ...roster];

  return (
    <>
      <div
        ref={containerRef}
        className="mt-1 touch-pan-y select-none overflow-hidden py-[30px] cursor-grab"
        onPointerDown={onPointerDown}
      >
        <div ref={trackRef} className="flex will-change-transform">
          {doubled.map((p, i) => (
            <PlayerCard
              key={`${p.id}-${i}`}
              player={p}
              allGoals={allGoals}
              highlighted={highlightedIndex === i}
              onTap={() => {
                if (draggedRef.current) return;
                if (highlightedIndex === i) {
                  setSelected(p);
                } else {
                  centerOn(i);
                }
              }}
              onViewProfile={() => setSelected(p)}
            />
          ))}
        </div>
      </div>

      <div className="px-6 pb-1 lg:px-16">
        <button
          type="button"
          onClick={() => setShowFull((v) => !v)}
          className="flex w-full items-center justify-between border-2 border-ink bg-transparent px-[18px] py-4 text-[11px] font-extrabold uppercase tracking-[0.16em] text-ink"
        >
          {showFull ? "VER MENOS" : "VER PLANTILLA COMPLETA"}
          <svg width="20" height="12" viewBox="0 0 20 12" fill="none" stroke="currentColor" strokeWidth="2" className={showFull ? "rotate-180" : ""}>
            <path d="M1 6h16M12 1l5 5-5 5" />
          </svg>
        </button>

        {showFull && (
          <div className="mt-1">
            {roster.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setSelected(p)}
                className="grid w-full grid-cols-[26px_1fr_auto] items-center gap-3 border-b border-ink/15 py-3.5 text-left"
              >
                <span className="text-sm font-black tabular-nums text-neutral-500">{p.dorsal}</span>
                <span className="min-w-0">
                  <span className="block truncate text-[13px] font-extrabold uppercase tracking-[0.02em]">{p.name}</span>
                  <span className="mt-1 block text-[9.5px] font-bold uppercase tracking-[0.12em] text-neutral-600">{p.position}</span>
                </span>
                <span className="whitespace-nowrap text-[10.5px] font-bold tracking-[0.08em] text-neutral-700 tabular-nums">
                  {p.pj} PJ · {playerGoalCount(p.id, allGoals)} G · {p.assists} A
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      <PlayerProfileModal
        player={selected}
        allGoals={allGoals}
        onClose={() => {
          setSelected(null);
          setHighlightedIndex(null);
          pausedRef.current = false;
        }}
      />
    </>
  );
}

function PlayerCard({
  player,
  allGoals,
  highlighted,
  onTap,
  onViewProfile,
}: {
  player: FullPlayer;
  allGoals: DerivedGoal[];
  highlighted: boolean;
  onTap: () => void;
  onViewProfile: () => void;
}) {
  const goals = playerGoalCount(player.id, allGoals);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onTap}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onTap();
        }
      }}
      className={`relative w-[236px] flex-none cursor-pointer border-l border-ink/15 px-4 pb-1 pt-3.5 text-left transition-transform duration-300 ease-out ${
        highlighted ? "z-10 scale-[1.15]" : "z-0"
      }`}
    >
      <div className="relative h-[232px] overflow-hidden">
        <div className="pointer-events-none absolute -left-1 top-0.5 z-0 font-serif text-[74px] leading-[0.8] tracking-tight text-neutral-400 opacity-50 tabular-nums">
          {player.dorsal}
        </div>
        <div className={`absolute inset-x-3.5 bottom-0 top-[26px] z-[1] overflow-hidden ${player.photoUrl ? "" : "bg-neutral-200"}`}>
          {player.photoUrl ? (
            <Image src={player.photoUrl} alt={player.apodo ?? player.name} fill className="object-cover object-[center_top]" sizes="200px" />
          ) : (
            <div className="flex h-full w-full items-center justify-center border border-dashed border-neutral-500 text-center text-[10px] font-semibold uppercase tracking-[0.1em] text-neutral-600">
              Sin foto
            </div>
          )}
        </div>
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-11"
          style={{ background: "linear-gradient(to top, var(--color-cream), transparent)" }}
        />
      </div>

      <div className="my-3.5 flex items-center gap-1.5">
        <span className="h-px flex-1 bg-neutral-400" />
        <span className="h-[5px] w-[5px] flex-none rotate-45 bg-accent" />
        <span className="h-px flex-1 bg-neutral-400" />
      </div>

      <div className="text-[19px] font-black uppercase leading-none tracking-[-0.01em]">{player.name}</div>
      <div className="mt-2.5 text-[9.5px] font-extrabold uppercase tracking-[0.16em] text-neutral-600">{player.position}</div>
      <div className="mt-3 min-h-[24px] font-serif text-base italic leading-[1.2] text-accent-hover">{player.apodo}</div>
      <div className="mt-1 flex items-baseline gap-3 text-[11px] font-bold tracking-[0.1em] text-neutral-700 tabular-nums">
        <span>{player.pj} PJ</span>
        <span>{goals} G</span>
        <span>{player.assists} A</span>
      </div>

      {highlighted && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onViewProfile();
          }}
          className="mt-3 flex w-full items-center justify-center gap-2 bg-accent px-3 py-2.5 text-[10px] font-extrabold uppercase tracking-[0.16em] text-cream hover:bg-accent-hover"
        >
          VER PERFIL
        </button>
      )}
    </div>
  );
}
