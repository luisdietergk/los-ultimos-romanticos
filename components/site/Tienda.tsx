import { RevealSection } from "./shared/RevealSection";
import { ShopRack } from "./interactive/ShopRack";

export interface ShopProduct {
  id: string;
  name: string;
  sizesCsv: string;
  priceMxn: number;
  description: string;
  photoUrl: string | null;
  sortOrder: number;
}

/** "La tienda" shop section — ported from the prototype's `#tienda` section
 * (Los Ultimos Romanticos.dc.html:425-459). Thin server wrapper: kicker/
 * headline/copy here are static markup (reusing the prototype's exact
 * copy), the draggable rack + product sheet live in the client child
 * (`ShopRack`, which renders `ProductSheetModal`). */
export default function Tienda({ products }: { products: ShopProduct[] }) {
  return (
    <RevealSection id="tienda" className="relative z-10 border-b-2 border-ink pb-14 pt-[54px]">
      <div className="px-6 lg:px-16">
        <div className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-accent">LA TIENDA</div>
        <div className="my-3.5 h-[3px] w-[38px] bg-accent" />
        <h2 className="text-[clamp(26px,7.6vw,34px)] font-normal uppercase leading-none">
          LLEVA EL
          <br />
          ROMANCE PUESTO.
        </h2>
      </div>

      <p className="mt-4 px-6 text-[13.5px] leading-[1.7] text-neutral-700 lg:px-16">
        Desliza para explorar la colección.
      </p>

      <ShopRack products={products} />
    </RevealSection>
  );
}
