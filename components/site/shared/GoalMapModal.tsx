"use client";

import * as Dialog from "@radix-ui/react-dialog";
import Image from "next/image";
import { goalMouthPoint, pitchPoint, shotLineEnd } from "@/lib/derived";

export interface GoalMapEntry {
  key: string;
  minute: number;
  title: string;
  dorsalLabel: string;
  subline: string;
  typeLabel: string;
  situacion: string;
  photoUrl: string | null;
  isLur: boolean;
  shotX: number | null;
  shotY: number | null;
  goalX: number | null;
  goalY: number | null;
}

/** Read-only shot-map viewer, shared across Calendario's goal rows, the
 * player profile modal, and Podios — ported from the prototype's
 * `goalMap()`/pitch+goal SVGs (Los Ultimos Romanticos.dc.html:1969-2009,
 * 644-684). The prototype's inline edit controls (shot-type <select>,
 * dorsal <input>) are admin-only in this build, so they're display-only
 * here. */
export function GoalMapModal({
  entries,
  index,
  onIndexChange,
  onClose,
}: {
  entries: GoalMapEntry[];
  index: number;
  onIndexChange: (i: number) => void;
  onClose: () => void;
}) {
  const open = entries.length > 0 && index >= 0 && index < entries.length;
  const g = open ? entries[index] : null;
  const n = entries.length;

  const has = !!g && g.shotX != null && g.shotY != null;
  const shot = has ? pitchPoint(g!.shotX!, g!.shotY!) : null;
  const lineY2 = g ? shotLineEnd(g.goalY) : 0;
  const hasGoalDot = !!g && g.goalX != null && g.goalY != null;
  const goalDot = hasGoalDot ? goalMouthPoint(g!.goalX!, g!.goalY!) : goalMouthPoint(0.5, 0.5);

  return (
    <Dialog.Root open={open} onOpenChange={(v) => !v && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
        <Dialog.Content
          className="fixed bottom-0 left-1/2 z-50 max-h-[92vh] w-full max-w-[480px] -translate-x-1/2 overflow-y-auto bg-cream"
          aria-describedby={undefined}
        >
          {g && (
            <>
              <div className="relative border-b-2 border-ink px-4 pb-3 pt-2.5 text-center">
                <Dialog.Close className="absolute right-3 top-1 text-2xl leading-none">×</Dialog.Close>
                <Dialog.Title asChild>
                  <div className="mx-auto -my-5 h-[150px] w-[150px]">
                    {g.photoUrl && <Image src={g.photoUrl} alt={g.title} width={150} height={150} className="h-full w-full object-contain" />}
                  </div>
                </Dialog.Title>
                <div className="flex items-baseline justify-center gap-2.5">
                  <span className="text-[19px] font-black uppercase tracking-tight">{g.title}</span>
                  <span className="text-xs font-extrabold text-accent">{g.dorsalLabel}</span>
                </div>
                <div className="mt-1.5 text-[10.5px] font-bold uppercase tracking-[0.14em] text-neutral-600">{g.subline}</div>
              </div>

              <div className="flex items-baseline gap-2.5 px-4 pb-0.5 pt-2.5">
                <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-accent">MAPA DE TIRO</span>
                <span className="h-px flex-1 bg-ink/40" />
              </div>
              <div className="px-4 pt-1">
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
                  {has && (
                    <>
                      <line
                        x1={shot!.x}
                        y1={shot!.y}
                        x2={294}
                        y2={lineY2}
                        stroke="var(--color-accent)"
                        strokeWidth="1.6"
                        strokeDasharray="5 4"
                        pathLength={1}
                        style={{ strokeDashoffset: 0, animation: "lur-dash 0.6s ease-out" }}
                      />
                      <circle cx={shot!.x} cy={shot!.y} r="7.5" fill="var(--color-cream)" stroke="var(--color-accent)" strokeWidth="3" />
                      <circle cx={shot!.x} cy={shot!.y} r="3" fill="var(--color-ink)" />
                    </>
                  )}
                </svg>
              </div>

              <div className="flex items-center justify-center gap-5 px-4 pb-0.5 pt-1.5">
                <button
                  type="button"
                  onClick={() => onIndexChange((index - 1 + n) % n)}
                  disabled={n <= 1}
                  className="text-2xl leading-none disabled:opacity-30"
                  aria-label="Gol anterior"
                >
                  ‹
                </button>
                <div className="min-w-[120px] text-center">
                  <div className="font-serif text-[27px] leading-none">{g.minute}&apos;</div>
                  <div className="mt-1.5 text-[9.5px] font-extrabold uppercase tracking-[0.24em] text-accent">GOL</div>
                </div>
                <button
                  type="button"
                  onClick={() => onIndexChange((index + 1) % n)}
                  disabled={n <= 1}
                  className="text-2xl leading-none disabled:opacity-30"
                  aria-label="Siguiente gol"
                >
                  ›
                </button>
              </div>

              <div className="px-4 pb-1.5 pt-0.5">
                <svg viewBox="0 0 300 140" className="w-full">
                  <path d="M66 36 L234 36 L234 110 L66 110 Z" fill="none" stroke="var(--color-neutral-500)" strokeWidth="1" />
                  <path d="M41 21 L66 36 M259 21 L234 36 M41 128 L66 110 M259 128 L234 110" stroke="var(--color-neutral-500)" strokeWidth="1" />
                  <path d="M108 36 L108 110 M150 36 L150 110 M192 36 L192 110" stroke="var(--color-neutral-400)" strokeWidth="0.8" />
                  <path d="M66 60.7 L234 60.7 M66 85.3 L234 85.3" stroke="var(--color-neutral-400)" strokeWidth="0.8" />
                  <path d="M95.5 21 L108 36 M150 21 L150 36 M204.5 21 L192 36" stroke="var(--color-neutral-400)" strokeWidth="0.8" />
                  <path d="M95.5 128 L108 110 M150 128 L150 110 M204.5 128 L192 110" stroke="var(--color-neutral-400)" strokeWidth="0.8" />
                  <path d="M41 56.7 L66 60.7 M41 92.6 L66 85.3 M259 56.7 L234 60.7 M259 92.6 L234 85.3" stroke="var(--color-neutral-400)" strokeWidth="0.8" />
                  <rect x="36" y="18" width="7" height="112" fill="var(--color-ink)" />
                  <rect x="257" y="18" width="7" height="112" fill="var(--color-ink)" />
                  <rect x="36" y="18" width="228" height="7" fill="var(--color-ink)" />
                  {hasGoalDot && (
                    <>
                      <circle cx={goalDot.x} cy={goalDot.y} r="9" fill="var(--color-cream)" stroke="var(--color-accent)" strokeWidth="3" />
                      <circle cx={goalDot.x} cy={goalDot.y} r="3.4" fill="var(--color-ink)" />
                    </>
                  )}
                </svg>
              </div>

              <div className="grid grid-cols-3 border-t-2 border-ink text-center">
                <div className="px-2.5 py-3">
                  <div className="text-sm font-extrabold">{g.typeLabel}</div>
                  <div className="mt-2 text-[9px] font-bold uppercase tracking-[0.14em] text-neutral-600">TIPO DE TIRO</div>
                </div>
                <div className="border-l border-ink/40 px-2.5 py-3">
                  <div className="text-sm font-extrabold">{g.situacion}</div>
                  <div className="mt-2 text-[9px] font-bold uppercase tracking-[0.14em] text-neutral-600">SITUACIÓN</div>
                </div>
                <div className="border-l border-ink/40 px-2.5 py-3">
                  <div className="text-sm font-extrabold">{g.dorsalLabel}</div>
                  <div className="mt-2 text-[9px] font-bold uppercase tracking-[0.14em] text-neutral-600">DORSAL</div>
                </div>
              </div>
            </>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
