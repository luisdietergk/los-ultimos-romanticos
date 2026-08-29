// Pure functions for every value the site computes from stored data rather
// than storing redundantly — the record row, calendar/resultados bucketing,
// leaderboards, and shot-map coordinate mapping. Logic here mirrors the
// Claude Design prototype's own `record()`, `isFinished()`, `podios()`, and
// `profile()`/`goalMap()` coordinate math (Los Ultimos Romanticos.dc.html),
// but reads from real relational rows instead of localStorage.

export type GoalTeam = "LUR" | "RIVAL";

export interface DerivedGoal {
  id: string;
  minute: number;
  team: string; // GoalTeam
  playerId: string | null;
  scorerName: string;
  note: string | null;
  shotX: number | null;
  shotY: number | null;
  goalX: number | null;
  goalY: number | null;
}

export interface DerivedMatch {
  id: string;
  jornada: number;
  jornadaLabel: string;
  kickoffAt: Date;
  status: string; // MatchStatus
  rival: { name: string; crestUrl: string | null };
  crestOverrideUrl: string | null;
  heroCrestUrl: string | null;
  venue: string;
  goals: DerivedGoal[];
}

const NINETY_MINUTES_MS = 90 * 60 * 1000;

/** A match is "finished" once it has any registered goal, or once 90 minutes
 * have passed since kickoff even with zero goals (shown as "— · —"). */
export function isFinished(m: Pick<DerivedMatch, "goals" | "kickoffAt">, now: Date): boolean {
  if (m.goals.length > 0) return true;
  return now.getTime() >= m.kickoffAt.getTime() + NINETY_MINUTES_MS;
}

export function matchScore(m: Pick<DerivedMatch, "goals">): { lur: number; rival: number } {
  let lur = 0;
  let rival = 0;
  for (const g of m.goals) {
    if (g.team === "LUR") lur++;
    else rival++;
  }
  return { lur, rival };
}

/** The next unplayed, non-cancelled fixture, in chronological (jornada) order. */
export function nextMatch(matches: DerivedMatch[], now: Date): DerivedMatch | null {
  const sorted = [...matches].sort((a, b) => a.jornada - b.jornada);
  return sorted.find((m) => m.status !== "CANCELLED" && !isFinished(m, now)) ?? null;
}

/** Calendario shows upcoming (non-cancelled, unfinished) fixtures; Resultados
 * shows everything finished or cancelled, most recent first. */
export function calendarioResultadosBucket(
  matches: DerivedMatch[],
  now: Date
): { calendario: DerivedMatch[]; resultados: DerivedMatch[] } {
  const sorted = [...matches].sort((a, b) => a.jornada - b.jornada);
  const calendario = sorted.filter((m) => m.status !== "CANCELLED" && !isFinished(m, now));
  const resultados = sorted.filter((m) => m.status === "CANCELLED" || isFinished(m, now)).reverse();
  return { calendario, resultados };
}

const TORREON_TZ = "America/Monterrey";

/** "HOY" badge: does kickoff fall on today's calendar date in Torreón? */
export function isToday(kickoffAt: Date, now: Date): boolean {
  const fmt = (d: Date) =>
    new Intl.DateTimeFormat("en-CA", { timeZone: TORREON_TZ, year: "numeric", month: "2-digit", day: "2-digit" }).format(d);
  return fmt(kickoffAt) === fmt(now);
}

export interface RecordRow {
  jugados: number;
  victorias: number;
  empates: number;
  derrotas: number;
  porJugar: number;
}

/** The 5-stat record row. A finished match with zero registered goals (an
 * unresolved "— · —") counts toward nothing — not even "jugados" — matching
 * the prototype's own `record()` exactly. */
export function record(matches: DerivedMatch[], now: Date): RecordRow {
  let jugados = 0;
  let victorias = 0;
  let empates = 0;
  let derrotas = 0;
  let porJugar = 0;
  for (const m of matches) {
    if (m.status === "CANCELLED") continue;
    if (!isFinished(m, now)) {
      porJugar++;
      continue;
    }
    if (m.goals.length === 0) continue;
    const { lur, rival } = matchScore(m);
    jugados++;
    if (lur > rival) victorias++;
    else if (lur === rival) empates++;
    else derrotas++;
  }
  return { jugados, victorias, empates, derrotas, porJugar };
}

export interface DerivedPlayer {
  id: string;
  name: string;
  dorsal: string;
  photoUrl: string | null;
  pj: number;
  assists: number;
}

export function playerGoalCount(playerId: string, allGoals: DerivedGoal[]): number {
  return allGoals.filter((g) => g.team === "LUR" && g.playerId === playerId).length;
}

export interface PodiumPlace {
  rank: 1 | 2 | 3;
  player: DerivedPlayer | null;
  value: number;
  isFirst: boolean; // rank 1 and not tied with rank 2 — gets the big/photo treatment
  isTie: boolean; // rank 1 and rank 2 share the top value — all bars render flat/gray
}

export interface PodiumCategory {
  key: "goleadores" | "asistencias" | "partidos";
  label: string;
  hint: string;
  unit: string;
  places: PodiumPlace[];
}

/** The 3 season leaderboards, top 3 each, with the prototype's tie-flattening
 * rule: if rank 1 and rank 2 share the same value, no place gets the
 * big/photo emphasis — all render as equal gray bars. */
export function podios(players: DerivedPlayer[], allGoals: DerivedGoal[]): PodiumCategory[] {
  const categories: { key: PodiumCategory["key"]; label: string; hint: string; unit: string; value: (p: DerivedPlayer) => number }[] = [
    { key: "goleadores", label: "GOLEADORES", hint: "GOLES", unit: "G", value: (p) => playerGoalCount(p.id, allGoals) },
    { key: "asistencias", label: "ASISTENCIAS", hint: "ASISTENCIAS", unit: "A", value: (p) => p.assists },
    { key: "partidos", label: "MÁS PARTIDOS", hint: "PARTIDOS JUGADOS", unit: "PJ", value: (p) => p.pj },
  ];

  return categories.map((c) => {
    const ranked = players
      .map((p) => ({ player: p, value: c.value(p) }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 3);
    const isTie = ranked.length > 1 && ranked[0].value === ranked[1].value;
    const places: PodiumPlace[] = [1, 2, 3].map((rank) => {
      const item = ranked[rank - 1];
      return {
        rank: rank as 1 | 2 | 3,
        player: item?.player ?? null,
        value: item?.value ?? 0,
        isFirst: rank === 1 && !isTie,
        isTie,
      };
    });
    return { key: c.key, label: c.label, hint: c.hint, unit: c.unit, places };
  });
}

/** Maps a stored 0..1 shot-origin coordinate onto the 300x200 pitch SVG's
 * playable rect (x=8 y=8 w=284 h=184). */
export function pitchPoint(x: number, y: number): { x: number; y: number } {
  return { x: 8 + x * 284, y: 8 + y * 184 };
}

/** Maps a stored 0..1 goal-mouth coordinate onto the 300x140 goal-mouth SVG's
 * frame (x=41 y=21 w=218 h=107). */
export function goalMouthPoint(gx: number, gy: number): { x: number; y: number } {
  return { x: 41 + gx * 218, y: 21 + gy * 107 };
}

/** The dashed line from shot origin to goal entry uses the pitch's x/y for
 * the start and the goal-mouth's y-only for the end (matching the
 * prototype's `shots[].y2` — the line terminates at the pitch's shot depth
 * on the x axis but the goal-mouth's vertical placement). */
export function shotLineEnd(gy: number | null): number {
  return 76 + (gy ?? 0.5) * 48;
}
