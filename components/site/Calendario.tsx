import { RevealSection } from "./shared/RevealSection";
import { CalendarioTabs } from "./interactive/CalendarioTabs";
import { calendarioResultadosBucket, type DerivedMatch, type DerivedPlayer } from "@/lib/derived";

/** #calendario — the season's fixture list / results, ported from the
 * prototype's CALENDARIO/RESULTADOS tab switcher (Los Ultimos Romanticos.dc.html:166-258).
 * The bucketing (upcoming vs. finished-or-cancelled, sort order) is owned by
 * `lib/derived.ts::calendarioResultadosBucket`; this component only lays out
 * the static shell and hands the two lists to the client-side tab switcher. */
export function Calendario({
  matches,
  now,
  ligaNombre = "LIGA ROMÁNTICA CDT",
  roster,
}: {
  matches: DerivedMatch[];
  now: Date;
  ligaNombre?: string;
  roster: DerivedPlayer[];
}) {
  const { calendario, resultados } = calendarioResultadosBucket(matches, now);

  return (
    <RevealSection id="calendario" className="relative z-[1] border-b-2 border-ink px-6 pb-16 pt-14 lg:px-16">
      <div className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-accent">{ligaNombre}</div>
      <div className="mb-[34px] mt-3.5 h-[3px] w-[38px] bg-accent" />

      <CalendarioTabs calendario={calendario} resultados={resultados} now={now} roster={roster} />

      <p className="mt-[26px] text-[11.5px] font-semibold leading-[1.7] text-neutral-600">
        18 jornadas los jueves, del 30 de julio al 26 de noviembre, todas a las 19:00 h en CDT; semifinal el 3 y final
        el 10 de diciembre. En Resultados, toca un partido para ver los goles minuto a minuto.
      </p>
    </RevealSection>
  );
}

export default Calendario;
