import { RevealSection } from "./shared/RevealSection";

/** Everything the original brief still calls for but the design never
 * finished: Tabla de posiciones, Galería de fotos, Contacto/Únete. Per
 * scope, this stays a static placeholder rather than new design work. */
export function ComingSoon() {
  return (
    <RevealSection className="relative z-10 px-6 pb-[60px] pt-[52px] lg:px-16">
      <div className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-neutral-600">SIGUE EN CAMINO</div>
      <div className="my-3.5 h-[3px] w-[38px] bg-neutral-400" />
      <p className="text-sm leading-[1.85] text-neutral-700">Tabla de posiciones, goleadores, galería y contacto.</p>
    </RevealSection>
  );
}
