"use client";

import { useState } from "react";
import Image from "next/image";

const NAV_ITEMS = [
  { n: "01", label: "Historia", href: "#historia" },
  { n: "02", label: "Partidos", href: "#partidos" },
  { n: "03", label: "Calendario", href: "#calendario" },
  { n: "04", label: "Plantilla", href: "#plantilla" },
  { n: "05", label: "Números", href: "#podios" },
  { n: "06", label: "Uniformes", href: "#uniformes" },
];

export function HeaderNav({ crestUrl }: { crestUrl: string | null }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 flex items-center gap-3 border-b-2 border-ink bg-ink px-4 py-2.5 text-cream lg:px-8">
        <div className="h-[41px] w-[34px] flex-none">
          {crestUrl && <Image src={crestUrl} alt="Escudo" width={68} height={82} className="h-full w-full object-contain" />}
        </div>
        <div className="text-[13px] font-black uppercase leading-[1.05] tracking-wide">
          LOS ÚLTIMOS
          <br />
          ROMÁNTICOS
        </div>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label="Menú"
          aria-expanded={open}
          className="ml-auto flex w-6 flex-col gap-[5px] border-0 bg-none p-0"
        >
          <span className="block h-0.5 bg-cream" />
          <span className="block h-0.5 bg-cream" />
          <span className="block h-0.5 bg-cream" />
        </button>
      </header>

      <nav
        className="overflow-hidden bg-cream transition-[max-height] duration-300 ease-out"
        style={{ maxHeight: open ? 480 : 0 }}
      >
        {NAV_ITEMS.map((item) => (
          <a
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            className="flex items-baseline gap-4 border-b border-ink/40 px-6 py-[19px] text-[15px] font-extrabold uppercase tracking-wider text-ink"
          >
            <span className="font-bold text-[10px] text-accent tabular-nums">{item.n}</span>
            <span>{item.label}</span>
          </a>
        ))}
      </nav>
    </>
  );
}
