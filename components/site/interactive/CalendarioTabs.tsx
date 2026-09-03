"use client";

import { useState } from "react";
import Image from "next/image";
import { isToday, matchScore, type DerivedGoal, type DerivedMatch, type DerivedPlayer } from "@/lib/derived";
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
 * or a finished-with-zero-goals match = muted "— · —"). The VICTORIA/DERROTA/
 * EMPATE word and the score box are two separate pieces now (word to the
 * box's left, plain text) rather than one badge stacking both. */
function outcomeBadge(
  m: DerivedMatch
): { result: string | null; resultClassName: string; score: string; boxClassName: string } {
  if (m.status === "CANCELLED" || m.goals.length === 0) {
    return { result: null, resultClassName: "", score: "— · —", boxClassName: "bg-neutral-300 text-neutral-800" };
  }
  const { lur, rival } = matchScore(m);
  const score = `${lur} - ${rival}`;
  if (lur > rival) return { result: "VICTORIA", resultClassName: "text-ink", score, boxClassName: "bg-ink text-cream" };
  if (lur < rival) return { result: "DERROTA", resultClassName: "text-accent", score, boxClassName: "bg-accent text-cream" };
  return { result: "EMPATE", resultClassName: "text-neutral-700", score, boxClassName: "border border-ink bg-transparent text-ink" };
}

/** Looks up each goal's scorer in the roster so the shot map can show their
 * real photo/dorsal instead of a placeholder — only LUR goals have a
 * `playerId` at all (a rival's goal is just a name, see lib/actions/matches.ts). */
function buildGoalEntries(m: DerivedMatch, roster: DerivedPlayer[]): GoalMapEntry[] {
  return [...m.goals]
    .sort((a, b) => a.minute - b.minute)
    .map((g: DerivedGoal) => {
      const player = g.playerId ? roster.find((p) => p.id === g.playerId) : undefined;
      const assistPlayer = g.assistPlayerId ? roster.find((p) => p.id === g.assistPlayerId) : undefined;
      return {
        key: g.id,
        minute: g.minute,
        title: g.scorerName || (g.team === "LUR" ? "SIN ASIGNAR" : m.rival.name),
        dorsalLabel: player ? `#${player.dorsal.padStart(2, "0")}` : "#—",
        subline: `${g.team === "LUR" ? "LOS ÚLTIMOS ROMÁNTICOS" : m.rival.name} · ${m.jornadaLabel}`,
        typeLabel: g.note || "Gol",
        situacion: g.note || "—",
        videoUrl: g.videoUrl,
        isLur: g.team === "LUR",
        shotX: g.shotX,
        shotY: g.shotY,
        goalX: g.goalX,
        goalY: g.goalY,
        assistX: g.assistX,
        assistY: g.assistY,
        assistDorsal: assistPlayer?.dorsal ?? null,
        playMarkers: g.playMarkers,
      };
    });
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
  roster,
}: {
  calendario: DerivedMatch[];
  resultados: DerivedMatch[];
  now: Date;
  roster: DerivedPlayer[];
}) {
  const [tab, setTab] = useState<"cal" | "res">("res");
  const [fullCal, setFullCal] = useState(false);
  const [expandedMatchId, setExpandedMatchId] = useState<string | null>(null);
  const [modalMatchId, setModalMatchId] = useState<string | null>(null);
  const [goalIndex, setGoalIndex] = useState(0);

  const visibleFixtures = fullCal ? calendario : calendario.slice(0, 3);
  const modalMatch = modalMatchId ? resultados.find((m) => m.id === modalMatchId) ?? null : null;
  const entries = modalMatch ? buildGoalEntries(modalMatch, roster) : [];

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
            const goals = expanded ? buildGoalEntries(m, roster) : [];
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
                  <span className="flex items-center gap-2.5">
                    {badge.result && (
                      <span className={`text-[11px] font-extrabold uppercase tracking-[0.06em] ${badge.resultClassName}`}>
                        {badge.result}
                      </span>
                    )}
                    <span className={`min-w-[52px] px-3 py-2 text-center text-[14px] font-black tabular-nums leading-none ${badge.boxClassName}`}>
                      {badge.score}
                    </span>
                    <svg
                      width="14"
                      height="8"
                      viewBox="0 0 14 8"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className={`flex-none text-neutral-500 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
                    >
                      <path d="M1 1l6 6 6-6" />
                    </svg>
                  </span>
                </button>

                {expanded && (
                  <div className="pb-4">
                    {goals.length === 0 ? (
                      <p className="pb-3 text-[12px] font-semibold text-neutral-600">Sin goles registrados.</p>
                    ) : (
                      <div className="flex flex-col">
                        {goals.map((entry, i) => (
                          <button
                            key={entry.key}
                            type="button"
                            onClick={() => {
                              setModalMatchId(m.id);
                              setGoalIndex(i);
                            }}
                            className="flex items-center gap-3 py-2.5 text-left"
                          >
                            <span className="w-9 flex-none font-dynamic text-[19px] font-bold leading-none tracking-[0.02em] text-accent">
                              {entry.minute}&apos;
                            </span>
                            <span className="flex-1 text-[12.5px] font-extrabold uppercase leading-[1.3]">{entry.title}</span>
                            <span
                              className={`flex-none px-1.5 py-0.5 text-[8.5px] font-extrabold uppercase tracking-[0.08em] ${
                                entry.isLur ? "bg-accent text-cream" : "bg-neutral-300 text-neutral-700"
                              }`}
                            >
                              {entry.isLur ? "LUR" : "RIVAL"}
                            </span>
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
