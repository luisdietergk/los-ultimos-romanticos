"use client";

import * as Dialog from "@radix-ui/react-dialog";
import Image from "next/image";
import { goalMouthPoint, pitchPoint, shotLineEnd, type PlayMarker } from "@/lib/derived";

export interface GoalMapEntry {
  key: string;
  minute: number;
  title: string;
  dorsalLabel: string;
  subline: string;
  typeLabel: string;
  situacion: string;
  photoUrl: string | null;
  videoUrl: string | null;
  isLur: boolean;
  shotX: number | null;
  shotY: number | null;
  goalX: number | null;
  goalY: number | null;
  assistX: number | null;
  assistY: number | null;
  playMarkers: PlayMarker[];
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
  const lineY2 = g ? shotLineEnd(g.goalX, g.isLur) : 0;
  // A rival's goal is scored against LUR's own goal, so its shot line/entry
  // targets the opposite end of the pitch from a LUR goal (which always
  // shoots at the rival's goal on the right).
  const lineX2 = g?.isLur === false ? 6 : 294;
  const hasGoalDot = !!g && g.goalX != null && g.goalY != null;
  const goalDot = hasGoalDot ? goalMouthPoint(g!.goalX!, g!.goalY!) : goalMouthPoint(0.5, 0.5);
  const hasAssist = !!g && g.assistX != null && g.assistY != null;
  const assist = hasAssist ? pitchPoint(g!.assistX!, g!.assistY!) : null;
  const markers = g?.playMarkers ?? [];

  return (
    <Dialog.Root open={open} onOpenChange={(v) => !v && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
        <Dialog.Content
          className="fixed bottom-0 left-1/2 z-50 max-h-[100dvh] w-full max-w-[480px] -translate-x-1/2 overflow-hidden bg-cream"
          aria-describedby={undefined}
        >
          {g && (
            <>
              <div className="relative border-b-2 border-ink px-4 pb-2 pt-2 text-center">
                <Dialog.Close className="absolute right-3 top-1 text-2xl leading-none">×</Dialog.Close>
                {g.photoUrl && (
                  <Dialog.Title asChild>
                    <div className="mx-auto -mb-1 h-[64px] w-[64px]">
                      <Image src={g.photoUrl} alt={g.title} width={64} height={64} className="h-full w-full object-contain" />
                    </div>
                  </Dialog.Title>
                )}
                {!g.photoUrl && <Dialog.Title className="sr-only">{g.title}</Dialog.Title>}
                <div className="flex items-baseline justify-center gap-2.5">
                  <span className="text-[16px] font-black uppercase tracking-tight">{g.title}</span>
                  <span className="text-[11px] font-extrabold text-accent">{g.dorsalLabel}</span>
                </div>
                <div className="mt-1 text-[9.5px] font-bold uppercase tracking-[0.12em] text-neutral-600">{g.subline}</div>
              </div>

              <div className="flex items-baseline gap-2.5 px-4 pb-0.5 pt-1.5">
                <span className="text-[9.5px] font-extrabold uppercase tracking-[0.2em] text-accent">MAPA DE TIRO</span>
                <span className="h-px flex-1 bg-ink/40" />
              </div>
              {/* Sized by width via aspect-ratio (matching the 300x200
                  viewBox exactly) rather than a flex-grow box bigger than the
                  svg itself needs — that was leaving empty space around a
                  centered, letterboxed map instead of the map actually
                  filling its box. */}
              <div className="px-4 pt-1">
                <svg viewBox="0 0 300 200" className="mx-auto aspect-[300/200] w-full max-w-[400px]">
                  <rect x="8" y="8" width="284" height="184" fill="none" stroke="var(--color-neutral-500)" strokeWidth="1.5" />
                  <line x1="150" y1="8" x2="150" y2="192" stroke="var(--color-neutral-500)" strokeWidth="1.5" />
                  <circle cx="150" cy="100" r="26" fill="none" stroke="var(--color-neutral-500)" strokeWidth="1.5" />
                  <circle cx="150" cy="100" r="2" fill="var(--color-neutral-500)" />
                  <rect x="8" y="52" width="46" height="96" fill="none" stroke="var(--color-neutral-500)" strokeWidth="1.5" />
                  <rect x="8" y="76" width="18" height="48" fill="none" stroke="var(--color-neutral-500)" strokeWidth="1.5" />
                  <rect x="246" y="52" width="46" height="96" fill="none" stroke="var(--color-neutral-500)" strokeWidth="1.5" />
                  <rect x="274" y="76" width="18" height="48" fill="none" stroke="var(--color-neutral-500)" strokeWidth="1.5" />
                  <rect x="292" y="76" width="4" height="48" fill="var(--color-ink)" />
                  {/* Context dots for "showing the play" — other players'
                      positions, purely illustrative (see PlayMarker). */}
                  {markers.map((m, i) => {
                    const pt = pitchPoint(m.x, m.y);
                    return (
                      <circle
                        key={i}
                        cx={pt.x}
                        cy={pt.y}
                        r="5"
                        fill={m.team === "RIVAL" ? "var(--color-ink)" : "var(--color-accent-light)"}
                      />
                    );
                  })}
                  {has && assist && (
                    <line
                      key={`${g!.key}-assist`}
                      x1={assist.x}
                      y1={assist.y}
                      x2={shot!.x}
                      y2={shot!.y}
                      stroke="var(--color-accent)"
                      strokeWidth="1.6"
                      strokeDasharray="0.045 0.035"
                      pathLength={1}
                      style={{ animation: "lur-dash 1s linear infinite" }}
                    />
                  )}
                  {has && (
                    <>
                      <line
                        key={g!.key}
                        x1={shot!.x}
                        y1={shot!.y}
                        x2={lineX2}
                        y2={lineY2}
                        stroke="var(--color-accent)"
                        strokeWidth="1.6"
                        strokeDasharray="0.045 0.035"
                        pathLength={1}
                        style={{ animation: "lur-dash 1s linear infinite" }}
                      />
                      {/* The play, as one dot: assist origin -> scorer ->
                          goal, looping continuously. Only drawn when there's
                          an assist point to start from — otherwise the
                          marching dashes above already carry that cue. */}
                      {assist && (
                        <circle r="4.5" fill="var(--color-accent)">
                          <animateMotion
                            dur="1.8s"
                            repeatCount="indefinite"
                            path={`M ${assist.x} ${assist.y} L ${shot!.x} ${shot!.y} L ${lineX2} ${lineY2}`}
                          />
                        </circle>
                      )}
                      {assist && (
                        <circle cx={assist.x} cy={assist.y} r="6" fill="var(--color-cream)" stroke="var(--color-accent)" strokeWidth="2.5" />
                      )}
                      <circle cx={shot!.x} cy={shot!.y} r="7.5" fill="var(--color-cream)" stroke="var(--color-accent)" strokeWidth="3" />
                      <circle cx={shot!.x} cy={shot!.y} r="3" fill="var(--color-ink)" />
                    </>
                  )}
                </svg>
              </div>

              {g.videoUrl && (
                <div className="px-4 pt-1">
                  <a
                    href={g.videoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-2 border-2 border-ink bg-ink px-4 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.16em] text-cream"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="var(--color-accent)">
                      <path d="M8 5.5v13l11-6.5z" />
                    </svg>
                    VER GOL
                  </a>
                </div>
              )}

              <div className="flex items-center justify-center gap-4 px-4 pb-0.5 pt-1">
                <button
                  type="button"
                  onClick={() => onIndexChange((index - 1 + n) % n)}
                  disabled={n <= 1}
                  className="text-xl leading-none disabled:opacity-30"
                  aria-label="Gol anterior"
                >
                  ‹
                </button>
                <div className="min-w-[90px] text-center">
                  <div className="font-serif text-[20px] leading-none">{g.minute}&apos;</div>
                  <div className="mt-1 text-[8.5px] font-extrabold uppercase tracking-[0.2em] text-accent">GOL</div>
                </div>
                <button
                  type="button"
                  onClick={() => onIndexChange((index + 1) % n)}
                  disabled={n <= 1}
                  className="text-xl leading-none disabled:opacity-30"
                  aria-label="Siguiente gol"
                >
                  ›
                </button>
              </div>

              <div className="px-4 pb-1 pt-0.5">
                <svg viewBox="0 0 300 140" className="mx-auto aspect-[300/140] w-full max-w-[300px]">
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
                <div className="px-2.5 py-2">
                  <div className="text-[13px] font-extrabold">{g.typeLabel}</div>
                  <div className="mt-1 text-[8.5px] font-bold uppercase tracking-[0.12em] text-neutral-600">TIPO DE TIRO</div>
                </div>
                <div className="border-l border-ink/40 px-2.5 py-2">
                  <div className="text-[13px] font-extrabold">{g.situacion}</div>
                  <div className="mt-1 text-[8.5px] font-bold uppercase tracking-[0.12em] text-neutral-600">SITUACIÓN</div>
                </div>
                <div className="border-l border-ink/40 px-2.5 py-2">
                  <div className="text-[13px] font-extrabold">{g.dorsalLabel}</div>
                  <div className="mt-1 text-[8.5px] font-bold uppercase tracking-[0.12em] text-neutral-600">DORSAL</div>
                </div>
              </div>
            </>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
