import { RevealSection } from "./shared/RevealSection";
import { SquadMarquee } from "./interactive/SquadMarquee";
import type { DerivedGoal } from "@/lib/derived";

/** The full Prisma `Player` row shape (minus `sortOrder`/`isActive`/
 * `description`, which the public profile no longer shows) — richer than
 * `lib/derived.ts`'s `DerivedPlayer`, which only carries what the Podios
 * leaderboards need. Plantilla's roster cards and profile modal need the
 * bio fields too (position, nationality, apodo, quote). */
export interface FullPlayer {
  id: string;
  dorsal: string;
  name: string;
  position: string;
  nationality: string;
  apodo: string | null;
  quote: string | null;
  pj: number;
  photoUrl: string | null;
}

/** Roster section — ported from the prototype's `#plantilla` (Los Ultimos
 * Romanticos.dc.html:259-359). Thin server wrapper: title/kicker are static
 * markup, everything interactive (the auto-scrolling marquee, the full-list
 * toggle, and the player profile modal) lives in the client child. */
export default function Plantilla({ roster, allGoals }: { roster: FullPlayer[]; allGoals: DerivedGoal[] }) {
  return (
    <RevealSection id="plantilla" className="relative z-10 border-b-2 border-ink pb-[58px] pt-[34px]">
      <div className="px-6 lg:px-16">
        <div className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-accent">
          CONOCE A LOS QUE DEFIENDEN ESTA HISTORIA CADA SEMANA.
        </div>
        <div className="my-3.5 h-[3px] w-[38px] bg-accent" />
        <h2
          className="font-dynamic text-[36px] uppercase leading-[1.08] tracking-tight lg:text-5xl"
          style={{ fontVariationSettings: '"opsz" 72', fontWeight: 900 }}
        >
          LOS
          <br />
          ROMÁNTICOS
        </h2>
        <div className="mt-4 text-[9.5px] font-extrabold uppercase tracking-[0.2em] text-neutral-600">
          POR AMOR AL JUEGO, POR AMOR A LO NUESTRO.
        </div>
      </div>

      <SquadMarquee roster={roster} allGoals={allGoals} />
    </RevealSection>
  );
}
