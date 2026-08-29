import { RevealSection } from "./shared/RevealSection";

export function Historia({ p1, p2 }: { p1: string; p2: string }) {
  return (
    <RevealSection id="historia" className="relative z-10 border-b-2 border-ink bg-ink px-6 pb-[60px] pt-14 text-cream lg:px-16">
      <div className="lg:grid lg:grid-cols-[280px_1fr] lg:gap-16">
        <div>
          <div className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-accent-light">DESDE 2020</div>
          <div className="my-3.5 h-[3px] w-[38px] bg-accent-light lg:mb-0" />
        </div>
        <div>
          <p className="mb-6 text-lg font-bold leading-snug text-cream text-pretty">{p1}</p>
          <p className="text-[14.5px] leading-[1.85] text-neutral-400 text-pretty">{p2}</p>
        </div>
      </div>
    </RevealSection>
  );
}
