"use client";

import * as Dialog from "@radix-ui/react-dialog";
import Image from "next/image";
import { useRef } from "react";
import { pitchPoint, playerAssistCount, type DerivedGoal } from "@/lib/derived";
import { countryFlag } from "@/lib/countries";
import type { FullPlayer } from "../Plantilla";

const CLOSE_DRAG_THRESHOLD_PX = 90;
const CLOSE_ANIM_MS = 220;

/** Player profile bottom-sheet — ported from the prototype's `profile()`
 * (Los Ultimos Romanticos.dc.html:1256-1298, markup ~520-624), but the
 * shot-map shows every LUR goal this player has scored on one diagram
 * (aggregate dots) rather than the prototype's goal-by-goal stepper —
 * that's `GoalMapModal`'s job for a single match goal; here the story is
 * "where does this player score from", told all at once. */
export function PlayerProfileModal({
  player,
  allGoals,
  onClose,
}: {
  player: FullPlayer | null;
  allGoals: DerivedGoal[];
  onClose: () => void;
}) {
  const open = !!player;
  const p = player;

  const goals = p ? allGoals.filter((g) => g.team === "LUR" && g.playerId === p.id) : [];
  const goalCount = goals.length;
  const assistCount = p ? playerAssistCount(p.id, allGoals) : 0;
  const shots = goals.filter((g) => g.shotX != null && g.shotY != null);
  const dorsalLabel = p ? `#${p.dorsal.padStart(2, "0")}` : "";
  const shotsLabel = shots.length === 0 ? "SIN REGISTROS" : shots.length === 1 ? "1 TIRO" : `${shots.length} TIROS`;

  const contentRef = useRef<HTMLDivElement>(null);

  // Same drag-to-dismiss/slide-up treatment as GoalMapModal.tsx, with one
  // difference: this sheet's own content really can scroll (a long bio +
  // goals list), so a body-wide drag only starts a dismiss once the content
  // is already scrolled to the top — otherwise it's a normal scroll, not a
  // close gesture. The grabber bar itself always starts a dismiss-drag
  // regardless of scroll position, since dragging it is unambiguous intent.
  function animateClosed() {
    const el = contentRef.current;
    if (!el) {
      onClose();
      return;
    }
    el.style.transition = `transform ${CLOSE_ANIM_MS}ms ease-in`;
    el.style.transform = "translateY(100%)";
    window.setTimeout(onClose, CLOSE_ANIM_MS);
  }

  function startDismissDrag(e: React.PointerEvent<HTMLDivElement>, requireScrollTop: boolean) {
    const el = contentRef.current;
    if (!el) return;
    if (requireScrollTop && el.scrollTop > 0) return;
    const container = e.currentTarget;
    const pointerId = e.pointerId;
    const startY = e.clientY;
    let captured = false;

    const onMove = (ev: PointerEvent) => {
      const dy = ev.clientY - startY;
      if (!captured) {
        if (dy <= 8) return;
        captured = true;
        el.style.transition = "none";
        container.setPointerCapture(pointerId);
      }
      el.style.transform = `translateY(${Math.max(0, dy)}px)`;
    };
    const onUp = (ev: PointerEvent) => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      if (!captured) return;
      container.releasePointerCapture(pointerId);
      const dy = ev.clientY - startY;
      if (dy > CLOSE_DRAG_THRESHOLD_PX) {
        animateClosed();
      } else {
        el.style.transition = `transform ${CLOSE_ANIM_MS}ms cubic-bezier(0.22,1,0.36,1)`;
        el.style.transform = "translateY(0px)";
      }
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
  }

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(v) => {
        if (!v) animateClosed();
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
        <Dialog.Content
          ref={contentRef}
          onPointerDown={(e) => startDismissDrag(e, true)}
          className="fixed inset-x-0 bottom-0 z-50 mx-auto max-h-[92vh] w-full max-w-[480px] overflow-y-auto rounded-t-[20px] bg-cream data-[state=open]:animate-[lur-sheet-in_0.32s_cubic-bezier(0.22,1,0.36,1)]"
          aria-describedby={undefined}
        >
          {p && (
            <>
              <div className="relative border-b-2 border-ink px-4 pb-3.5 pt-2.5">
                <div
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    startDismissDrag(e, false);
                  }}
                  className="absolute inset-x-0 -top-0.5 flex touch-none justify-center py-2"
                  aria-hidden
                >
                  <span className="h-1 w-10 bg-ink/30" />
                </div>
                <div className="grid grid-cols-[82px_1fr] gap-3.5 pt-2">
                  <Dialog.Title asChild>
                    <div className={`relative h-24 w-[82px] flex-none overflow-hidden ${p.photoUrl ? "" : "bg-neutral-200"}`}>
                      {p.photoUrl && (
                        <Image src={p.photoUrl} alt={p.name} fill className="object-cover object-[center_top]" sizes="82px" />
                      )}
                    </div>
                  </Dialog.Title>
                  <div className="min-w-0 pr-6">
                    <div className="flex items-baseline gap-2">
                      <span className="text-lg font-black uppercase leading-none tracking-tight">{p.name}</span>
                      <span className="text-[13px] font-black text-accent">{dorsalLabel}</span>
                    </div>
                    <div className="mt-2 text-[9px] font-extrabold uppercase tracking-[0.16em] text-neutral-600">{p.position}</div>
                    <div className="mt-2 flex items-center gap-1.5">
                      <span className="h-[5px] w-[5px] flex-none rotate-45 bg-accent" />
                      <span className="text-[10.5px] font-extrabold uppercase tracking-[0.12em]">{p.nationality}</span>
                      {countryFlag(p.nationality) && <span aria-hidden>{countryFlag(p.nationality)}</span>}
                    </div>
                    {p.apodo && (
                      <div className="mt-2 font-serif text-[13px] italic leading-tight text-accent-hover">{p.apodo}</div>
                    )}
                    {p.quote && (
                      <div className="mt-1.5 font-serif text-[12.5px] italic leading-snug text-neutral-700">“{p.quote}”</div>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 border-b-2 border-ink text-center">
                <div className="px-2 py-2.5">
                  <div className="font-serif text-2xl leading-none">{p.pj}</div>
                  <div className="mt-1.5 text-[9px] font-extrabold uppercase tracking-[0.14em] text-neutral-600">PARTIDOS</div>
                </div>
                <div className="border-l border-ink/15 px-2 py-2.5">
                  <div className="font-serif text-2xl leading-none text-accent">{goalCount}</div>
                  <div className="mt-1.5 text-[9px] font-extrabold uppercase tracking-[0.14em] text-neutral-600">GOLES</div>
                  <div className="mt-0.5 text-[7.5px] font-bold uppercase tracking-[0.12em] text-neutral-500">AUTOMÁTICO</div>
                </div>
                <div className="border-l border-ink/15 px-2 py-2.5">
                  <div className="font-serif text-2xl leading-none">{assistCount}</div>
                  <div className="mt-1.5 text-[9px] font-extrabold uppercase tracking-[0.14em] text-neutral-600">ASISTENCIAS</div>
                  <div className="mt-0.5 text-[7.5px] font-bold uppercase tracking-[0.12em] text-neutral-500">AUTOMÁTICO</div>
                </div>
              </div>

              <div className="flex items-baseline gap-2.5 px-4 pb-0.5 pt-3">
                <span className="text-[9.5px] font-extrabold uppercase tracking-[0.2em] text-accent">MAPA DE TIRO</span>
                <span className="h-px flex-1 bg-ink/40" />
                <span className="text-[9px] font-bold tracking-[0.1em] text-neutral-600">{shotsLabel}</span>
              </div>
              <div className="px-4 pb-3 pt-1.5">
                <svg viewBox="0 0 300 200" className="w-full">
                  <rect x="8" y="8" width="284" height="184" fill="none" stroke="var(--color-neutral-500)" strokeWidth="1.5" />
                  <line x1="150" y1="8" x2="150" y2="192" stroke="var(--color-neutral-500)" strokeWidth="1.5" />
                  <circle cx="150" cy="100" r="26" fill="none" stroke="var(--color-neutral-500)" strokeWidth="1.5" />
                  <circle cx="150" cy="100" r="2" fill="var(--color-neutral-500)" />
                  <rect x="8" y="52" width="46" height="96" fill="none" stroke="var(--color-neutral-500)" strokeWidth="1.5" />
                  <rect x="8" y="76" width="18" height="48" fill="none" stroke="var(--color-neutral-500)" strokeWidth="1.5" />
                  <rect x="246" y="52" width="46" height="96" fill="none" stroke="var(--color-neutral-500)" strokeWidth="1.5" />
                  <rect x="274" y="76" width="18" height="48" fill="none" stroke="var(--color-neutral-500)" strokeWidth="1.5" />
                  <rect x="292" y="76" width="4" height="48" fill="var(--color-ink)" />
                  {shots.map((g) => {
                    const pt = pitchPoint(g.shotX!, g.shotY!);
                    return (
                      <g key={g.id}>
                        <circle cx={pt.x} cy={pt.y} r="6.5" fill="var(--color-cream)" stroke="var(--color-accent)" strokeWidth="2.6" />
                        <circle cx={pt.x} cy={pt.y} r="2.6" fill="var(--color-ink)" />
                      </g>
                    );
                  })}
                </svg>
              </div>

              {goals.length > 0 && (
                <div className="border-t-2 border-ink px-4 pb-4 pt-2">
                  <div className="mb-1 text-[9px] font-extrabold uppercase tracking-[0.2em] text-accent">GOLES REGISTRADOS</div>
                  <ul>
                    {[...goals]
                      .sort((a, b) => a.minute - b.minute)
                      .map((g) => (
                        <li key={g.id} className="flex items-baseline gap-2.5 border-t border-ink/15 py-2 first:border-t-0">
                          <span className="font-serif text-base leading-none text-accent tabular-nums">{g.minute}&apos;</span>
                          <span className="text-[11.5px] font-semibold text-neutral-700">{g.note || "Gol"}</span>
                        </li>
                      ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
