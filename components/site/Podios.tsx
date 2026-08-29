import { RevealSection } from "./shared/RevealSection";
import { PodiosDisclosure } from "./interactive/PodiosDisclosure";
import { podios, type DerivedGoal, type DerivedPlayer } from "@/lib/derived";

/** Season leaderboards section — ported from the prototype's `#podios`
 * (Los Ultimos Romanticos.dc.html:360-391). Thin server wrapper: the
 * kicker/title markup is static, the actual leaderboard computation comes
 * from `lib/derived.ts`'s `podios()`, and the collapsible + bar-chart
 * rendering lives in the client child. */
export default function Podios({ roster, allGoals }: { roster: DerivedPlayer[]; allGoals: DerivedGoal[] }) {
  const categories = podios(roster, allGoals);

  return (
    <RevealSection id="podios" className="relative z-10 border-b-2 border-ink px-6 pb-14 pt-[52px] lg:px-16">
      <div className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-accent">PODIOS</div>
      <div className="my-3.5 h-[3px] w-[38px] bg-accent" />
      <PodiosDisclosure categories={categories} />
    </RevealSection>
  );
}
