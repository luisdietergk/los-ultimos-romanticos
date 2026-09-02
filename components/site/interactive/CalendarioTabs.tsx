"use client";

import { useState } from "react";
import Image from "next/image";
import { isToday, matchScore, type DerivedGoal, type DerivedMatch } from "@/lib/derived";
import { GoalMapModal, type GoalMapEntry } from "../shared/GoalMapModal";

const MONTERREY_TZ = "America/Monterrey";
const DOW = ["DOM", "LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB"];
const MESES = ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"];

function fixtureDateParts(kickoffAt: Date): { weekday: string; day: number; month: string } {
  const [y, m, d] = new Intl.DateTimeFormat("en-CA", {
    timeZone: MONTERREY_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
    .format(kickoffAt)
    .split("-")
    .map((n) => parseInt(n, 10));
  const weekday = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  return { weekday: DOW[weekday], day: d, month: MESES[m - 1] };
}

/** "JUE 04 SEP · 19:00 · CDT" — used only for upcoming fixtures (Calendario
 * tab), where the kickoff time and venue still matter. */
function formatFixtureMeta(kickoffAt: Date, venue: string): string {
  const { weekday, day, month } = fixtureDateParts(kickoffAt);
  const hm = new Intl.DateTimeFormat("en-GB", {
    timeZone: MONTERREY_TZ,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(kickoffAt);
  return `${weekday} ${String(day).padStart(2, "0")} ${month} · ${hm} · ${venue}`;
}

/** "JUE 04 SEP" — a finished match already happened, so the Resultados tab
 * shows only the date (no kickoff time, no venue/"CDT"): the outcome badge
 * is what matters there now. */
function formatResultDate(kickoffAt: Date): string {
  const { weekday, day, month } = fixtureDateParts(kickoffAt);
  return `${weekday} ${String(day).padStart(2, "0")} ${month}`;
}

function crestFor(m: DerivedMatch): string | null {
  return m.crestOverrideUrl ?? m.rival.crestUrl ?? null;
}

/** Outcome badge for a Resultados row — matches the prototype's `fixtures()`
 * badge logic (victoria = ink, derrota = accent, empate = outlined, cancelled
 * or a finished-with-zero-goals match = muted "— · —", never a fabricated
 * 0-0), plus an explicit VICTORIA/DERROTA/EMPATE word (score alone wasn't
 * legible enough at a glance). */
function outcomeBadge(m: DerivedMatch): { result: string | null; score: string; className: string } {
  if (m.status === "CANCELLED" || m.goals.length === 0) {
    return { result: null, score: "— · —", className: "bg-neutral-300 text-neutral-800" };
  }
  const { lur, rival } = matchScore(m);
  const score = `${lur} - ${rival}`;
  if (lur > rival) return { result: "VICTORIA", score, className: "bg-ink text-cream" };
  if (lur < rival) return { result: "DERROTA", score, className: "bg-accent text-cream" };
  return { result: "EMPATE", score, className: "border border-ink bg-transparent text-ink" };
}

function buildGoalEntries(m: DerivedMatch): GoalMapEntry[] {
  return [...m.goals]
    .sort((a, b) => a.minute - b.minute)
    .map((g: DerivedGoal) => ({
      key: g.id,
      minute: g.minute,
      title: g.scorerName || (g.team === "LUR" ? "SIN ASIGNAR" : m.rival.name),
      dorsalLabel: "#—",
      subline: `${g.team === "LUR" ? "LOS ÚLTIMOS ROMÁNTICOS" : m.rival.name} · ${m.jornadaLabel}`,
      typeLabel: g.note || "Gol",
      situacion: g.note || "—",
      photoUrl: null,
      videoUrl: g.videoUrl,
      isLur: g.team === "LUR",
      shotX: g.shotX,
      shotY: g.shotY,
      goalX: g.goalX,
      goalY: g.goalY,
    }));
}

function CrestThumb({ src, alt }: { src: string | null; alt: string }) {
  return (
    <div className="relative h-[54px] w-11 flex-none">
      {src && <Image src={src} alt={alt} width={44} height={54} className="h-full w-full object-contain" />}
    </div>
  );
}

export function CalendarioTabs({
  calendario,
  resultados,
  now,
}: {
  calendario: DerivedMatch[];
  resultados: DerivedMatch[];
  now: Date;
}) {
  const [tab, setTab] = useState<"cal" | "res">("cal");
  const [fullCal, setFullCal] = useState(false);
  const [expandedMatchId, setExpandedMatchId] = useState<string | null>(null);
  const [modalMatchId, setModalMatchId] = useState<string | null>(null);
  const [goalIndex, setGoalIndex] = useState(0);

  const visibleFixtures = fullCal ? calendario : calendario.slice(0, 3);
  const modalMatch = modalMatchId ? resultados.find((m) => m.id === modalMatchId) ?? null : null;
  const entries = modalMatch ? buildGoalEntries(modalMatch) : [];

  return (
    <div>
      <div className="mb-3 flex border-2 border-ink">
        <button
          type="button"
          onClick={() => setTab("cal")}
          className={`flex-1 py-[18px] text-[11.5px] font-extrabold uppercase tracking-[0.16em] ${
            tab === "cal" ? "bg-ink text-cream" : "bg-transparent text-ink"
          }`}
        >
          CALENDARIO
        </button>
        <button
          type="button"
          onClick={() => setTab("res")}
          className={`flex-1 py-[18px] text-[11.5px] font-extrabold uppercase tracking-[0.16em] ${
            tab === "res" ? "bg-ink text-cream" : "bg-transparent text-ink"
          }`}
        >
          RESULTADOS
        </button>
      </div>

      {tab === "cal" && (
        <div>
          {visibleFixtures.length === 0 && (
            <p className="py-8 text-center text-[12.5px] font-semibold text-neutral-600">Aún no hay partidos programados.</p>
          )}
          {visibleFixtures.map((m) => {
            const hoy = isToday(m.kickoffAt, now);
            return (
              <div key={m.id} className="grid grid-cols-[30px_44px_1fr_auto] items-center gap-3.5 border-b border-ink/15 py-[22px]">
                <span className="text-[17px] font-black tabular-nums text-neutral-400">{String(m.jornada).padStart(2, "0")}</span>
                <CrestThumb src={crestFor(m)} alt={m.rival.name} />
                <div>
                  <div className="text-[15px] font-extrabold uppercase leading-[1.3]">{m.rival.name}</div>
                  <div className="mt-2 text-[11.5px] font-semibold tracking-[0.04em] text-neutral-600">
                    {formatFixtureMeta(m.kickoffAt, m.venue)}
                  </div>
                </div>
                {hoy ? (
                  <span className="min-w-[58px] bg-accent px-3 py-2.5 text-center text-[11px] font-extrabold tracking-[0.1em] text-cream">
                    HOY
                  </span>
                ) : (
                  <span />
                )}
              </div>
            );
          })}

          {calendario.length > 3 && (
            <button
              type="button"
              onClick={() => setFullCal((v) => !v)}
              className="mt-[22px] flex w-full items-center justify-between border-2 border-ink bg-transparent px-[18px] py-[17px] text-[11.5px] font-extrabold uppercase tracking-[0.14em] text-ink"
            >
              {fullCal ? "VER MENOS" : "VER CALENDARIO COMPLETO"}
              <svg
                width="20"
                height="12"
                viewBox="0 0 20 12"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className={fullCal ? "rotate-180" : ""}
              >
                <path d="M1 6h16M12 1l5 5-5 5" />
              </svg>
            </button>
          )}
        </div>
      )}

      {tab === "res" && (
        <div>
          {resultados.length === 0 && (
            <p className="py-8 text-center text-[12.5px] font-semibold text-neutral-600">Aún no hay resultados.</p>
          )}
          {resultados.map((m) => {
            const badge = outcomeBadge(m);
            const expanded = expandedMatchId === m.id;
            const goals = expanded ? buildGoalEntries(m) : [];
            return (
              <div key={m.id} className="border-b border-ink/15">
                <button
                  type="button"
                  onClick={() => setExpandedMatchId(expanded ? null : m.id)}
                  className="grid w-full grid-cols-[30px_44px_1fr_auto] items-center gap-3.5 py-[22px] text-left"
                >
                  <span className="text-[17px] font-black tabular-nums text-neutral-400">{String(m.jornada).padStart(2, "0")}</span>
                  <CrestThumb src={crestFor(m)} alt={m.rival.name} />
                  <div>
                    <div className="text-[15px] font-extrabold uppercase leading-[1.3]">{m.rival.name}</div>
                    <div className="mt-2 text-[11.5px] font-semibold tracking-[0.04em] text-neutral-600">
                      {formatResultDate(m.kickoffAt)}
                    </div>
                  </div>
                  <span className={`flex min-w-[76px] flex-col items-center px-3 py-2 text-center ${badge.className}`}>
                    {badge.result ? (
                      <>
                        <span className="text-[13px] font-black uppercase leading-none tracking-[0.02em]">{badge.result}</span>
                        <span className="mt-1 text-[10.5px] font-bold tabular-nums leading-none opacity-80">{badge.score}</span>
                      </>
                    ) : (
                      <span className="text-[14px] font-black tabular-nums leading-none">{badge.score}</span>
                    )}
                  </span>
                </button>

                {expanded && (
                  <div className="pb-4">
                    {goals.length === 0 ? (
                      <p className="pb-3 text-[12px] font-semibold text-neutral-600">Sin goles registrados.</p>
                    ) : (
                      <div className="flex flex-col gap-1.5">
                        {goals.map((entry, i) => (
                          <button
                            key={entry.key}
                            type="button"
                            onClick={() => {
                              setModalMatchId(m.id);
                              setGoalIndex(i);
                            }}
                            className="flex items-center gap-3 border border-ink/15 bg-ink/[0.03] px-3 py-2.5 text-left"
                          >
                            <span className="w-8 flex-none font-serif text-[16px] leading-none text-accent">{entry.minute}&apos;</span>
                            <span className="flex-1 text-[12.5px] font-extrabold uppercase leading-[1.3]">{entry.title}</span>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-none text-neutral-500">
                              <path d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <GoalMapModal
        entries={entries}
        index={goalIndex}
        onIndexChange={setGoalIndex}
        onClose={() => setModalMatchId(null)}
      />
    </div>
  );
}
