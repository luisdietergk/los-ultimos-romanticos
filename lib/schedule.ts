// Season schedule: 18 jornadas, every Thursday 19:00 (Torreón, Coahuila —
// America/Monterrey, fixed UTC-6, no DST), 30 Jul – 26 Nov 2026, then
// semifinal 3 Dec and final 10 Dec, both also 19:00. Ported from the
// prototype's `defaultMatches()` (base date new Date(2026, 6, 30), +7 days
// per jornada) — see Los Ultimos Romanticos.dc.html:1002-1018.

const TORREON_UTC_OFFSET_HOURS = 6; // fixed, no DST observed in Torreón

function torreonKickoff(year: number, month1to12: number, day: number, hour = 19): Date {
  // month1to12 is 1-indexed for readability at call sites.
  return new Date(Date.UTC(year, month1to12 - 1, day, hour + TORREON_UTC_OFFSET_HOURS, 0, 0));
}

export type SeasonFixture = {
  jornada: number; // 1..18 for regular season, 19 = semifinal, 20 = final
  jornadaLabel: string;
  kickoffAt: Date;
};

export function generateSeasonFixtures(seasonYear = 2026): SeasonFixture[] {
  const fixtures: SeasonFixture[] = [];
  const base = torreonKickoff(seasonYear, 7, 30); // 30 Jul, jornada 1
  for (let i = 0; i < 18; i++) {
    const kickoffAt = new Date(base.getTime() + i * 7 * 24 * 60 * 60 * 1000);
    fixtures.push({
      jornada: i + 1,
      jornadaLabel: "JORNADA " + String(i + 1).padStart(2, "0"),
      kickoffAt,
    });
  }
  fixtures.push({
    jornada: 19,
    jornadaLabel: "SEMIFINAL",
    kickoffAt: torreonKickoff(seasonYear, 12, 3),
  });
  fixtures.push({
    jornada: 20,
    jornadaLabel: "FINAL",
    kickoffAt: torreonKickoff(seasonYear, 12, 10),
  });
  return fixtures;
}
