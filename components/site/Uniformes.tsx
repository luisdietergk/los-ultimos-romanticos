import { RevealSection } from "./shared/RevealSection";
import { KitOrbit, type KitImage } from "./interactive/KitOrbit";

export type { KitImage };

/** "Nuestra piel" kit showcase — ported from the prototype's `#uniformes`
 * section (Los Ultimos Romanticos.dc.html:393-424). Thin server wrapper:
 * kicker/headline/copy here are static markup (reusing the prototype's exact
 * copy), the orbiting-kit interaction lives in the client child
 * (`KitOrbit`). */
export default function Uniformes({ kits }: { kits: KitImage[] }) {
  return (
    <RevealSection id="uniformes" className="relative z-10 overflow-hidden bg-ink pb-[46px] pt-[54px] text-cream">
      <div className="px-6 lg:px-16">
        <div className="text-[10.5px] font-extrabold uppercase tracking-[0.24em] text-accent-light">NUESTRA PIEL</div>
        <div className="my-[13px] h-[3px] w-[38px] bg-accent-light" />
        <h2
          className="font-dynamic text-[clamp(28px,8.4vw,38px)] uppercase leading-[1.08]"
          style={{ fontVariationSettings: '"opsz" 72', fontWeight: 900 }}
        >
          TRES COLORES.
          <br />
          UN MISMO AMOR.
        </h2>
        <div className="mt-4 flex items-center gap-2.5">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 20.5C12 20.5 3.8 14.5 3.8 9.1A4.6 4.6 0 0 1 12 6.4A4.6 4.6 0 0 1 20.2 9.1C20.2 14.5 12 20.5 12 20.5Z" />
          </svg>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="var(--color-accent-light)">
            <path d="M12 21C12 21 3 14.6 3 8.9A5.1 5.1 0 0 1 12 5.9A5.1 5.1 0 0 1 21 8.9C21 14.6 12 21 12 21Z" />
          </svg>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 20.5C12 20.5 3.8 14.5 3.8 9.1A4.6 4.6 0 0 1 12 6.4A4.6 4.6 0 0 1 20.2 9.1C20.2 14.5 12 20.5 12 20.5Z" />
          </svg>
        </div>
      </div>

      <KitOrbit kits={kits} />

      <div className="mt-1 text-center">
        <div className="flex items-center justify-center gap-2">
          <span className="h-px w-[26px] bg-neutral-700" />
          <span className="h-[5px] w-[5px] rotate-45 bg-accent-light" />
          <span className="h-px w-[26px] bg-neutral-700" />
        </div>
        <div className="mt-2.5 text-[9.5px] font-bold tracking-[0.22em] text-neutral-500">20 &#9670; 20</div>
      </div>
    </RevealSection>
  );
}
