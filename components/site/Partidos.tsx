import Image from "next/image";
import { RevealSection } from "./shared/RevealSection";
import { RecordCountUp } from "./interactive/RecordCountUp";
import { Countdown } from "./interactive/Countdown";
import { record, nextMatch, type DerivedMatch } from "@/lib/derived";

const RECORD_LABELS: { key: keyof ReturnType<typeof record>; label: string }[] = [
  { key: "jugados", label: "JUGADOS" },
  { key: "victorias", label: "VICTORIAS" },
  { key: "empates", label: "EMPATES" },
  { key: "derrotas", label: "DERROTAS" },
  { key: "porJugar", label: "POR JUGAR" },
];

export function Partidos({ matches, now, teamCrestUrl }: { matches: DerivedMatch[]; now: Date; teamCrestUrl: string | null }) {
  const rec = record(matches, now);
  const np = nextMatch(matches, now);
  const rivalCrest = np ? np.heroCrestUrl ?? np.crestOverrideUrl ?? np.rival.crestUrl : null;

  return (
    <RevealSection id="partidos" className="relative z-10 border-b-2 border-ink px-6 pb-[52px] pt-[34px] lg:px-16">
      <div className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-accent">NUESTROS PARTIDOS</div>
      <div className="my-3.5 h-[3px] w-[38px] bg-accent" />
      <h2 className="mb-7 font-dynamic text-[36px] font-black uppercase leading-[1.08] tracking-tight lg:text-5xl">
        UNA HISTORIA QUE SIGUE JUGÁNDOSE.
      </h2>

      <div className="grid grid-cols-5 border-y-2 border-ink">
        {RECORD_LABELS.map(({ key, label }) => (
          <div key={key} className="px-1.5 py-2.5">
            <div className="text-[8.5px] font-bold uppercase tracking-[0.08em] text-neutral-600">{label}</div>
            <RecordCountUp value={rec[key]} />
          </div>
        ))}
      </div>

      {np && (
        <div className="-mx-6 mt-11 lg:-mx-16">
          <div className="px-5 pt-[15px] text-[11px] font-black uppercase tracking-[0.2em] text-accent lg:px-16">PRÓXIMO PARTIDO</div>
          <div className="flex items-center gap-3.5 px-5 pt-[18px] lg:px-16">
            <span className="h-px flex-1 bg-ink/40" />
            <span className="text-[11px] font-extrabold tracking-[0.2em] text-accent-hover">{np.jornadaLabel}</span>
            <span className="h-px flex-1 bg-ink/40" />
          </div>

          <div className="relative min-h-[220px] overflow-visible pt-5 lg:flex lg:items-center lg:justify-between lg:px-24">
            <div className="absolute left-[-130px] top-1/2 h-[346px] w-[288px] -translate-y-[calc(50%-60px)] lg:static lg:h-[240px] lg:w-[200px] lg:translate-y-0">
              {teamCrestUrl && <Image src={teamCrestUrl} alt="Los Últimos Románticos" width={288} height={346} className="h-full w-full object-contain" />}
            </div>
            <div className="absolute right-[-130px] top-1/2 h-[346px] w-[288px] -translate-y-[calc(50%-60px)] lg:static lg:h-[240px] lg:w-[200px] lg:translate-y-0">
              {rivalCrest && <Image src={rivalCrest} alt={np.rival.name} width={288} height={346} className="h-full w-full object-contain" />}
            </div>
            <div className="relative z-10 flex min-h-[200px] translate-y-[30px] items-center justify-center pointer-events-none lg:static lg:translate-y-0">
              <div className="font-dynamic text-[60px] leading-none text-accent">VS</div>
            </div>
          </div>

          <Countdown targetISO={np.kickoffAt.toISOString()} />
        </div>
      )}
    </RevealSection>
  );
}
