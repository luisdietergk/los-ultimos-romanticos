"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useState } from "react";
import Image from "next/image";
import type { ShopProduct } from "../Tienda";

// Perk icon paths + copy ported verbatim from the prototype's `spPerks`
// (Los Ultimos Romanticos.dc.html:2170-2179).
const PERKS = [
  {
    l1: "DISEÑOS",
    l2: "EXCLUSIVOS",
    d: "M12 20.6S3.6 14.6 3.6 9.1A4.6 4.6 0 0 1 12 6.4a4.6 4.6 0 0 1 8.4 2.7c0 5.5-8.4 11.5-8.4 11.5z",
  },
  {
    l1: "EDICIONES",
    l2: "LIMITADAS",
    d: "M12 3.2 14.6 8l5.4.8-3.9 3.8.9 5.4-5-2.7-5 2.7.9-5.4L4 8.8 9.4 8z",
  },
  {
    l1: "ENVÍOS A",
    l2: "TODO MÉXICO",
    d: "M3.4 7.6 12 3.4l8.6 4.2v8.8L12 20.6 3.4 16.4zM3.4 7.6 12 11.9l8.6-4.3M12 11.9v8.7",
  },
  {
    l1: "PAGO",
    l2: "SEGURO",
    d: "M6 10.5V8a6 6 0 0 1 12 0v2.5M4.8 10.5h14.4v9.7H4.8z",
  },
];

/** Bottom-sheet product detail page — ported from the prototype's shop
 * sheet (Los Ultimos Romanticos.dc.html:483-529). Visual pattern matches
 * `GoalMapModal.tsx` (fixed bottom sheet via Radix `Dialog`). The
 * prototype's inline "CAMBIAR FOTO" admin control is intentionally omitted
 * — this is the public-facing view. */
export function ProductSheetModal({
  product,
  onClose,
}: {
  product: ShopProduct | null;
  onClose: () => void;
}) {
  const [size, setSize] = useState<string | null>(null);
  const open = product != null;

  const sizes = product
    ? product.sizesCsv
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];
  const picked = size ?? sizes[Math.min(2, sizes.length - 1)] ?? "";
  const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
  const waMessage = product ? `Hola! Me interesa: ${product.name}` : "";

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(v) => {
        if (!v) {
          onClose();
          setSize(null);
        }
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
        <Dialog.Content
          className="fixed bottom-0 left-1/2 z-50 max-h-[92vh] w-full max-w-[480px] -translate-x-1/2 overflow-y-auto bg-neutral-100"
          aria-describedby={undefined}
        >
          {product && (
            <>
              <div className="flex justify-center pt-2.5">
                <span className="h-1 w-11 bg-neutral-400" />
              </div>
              <Dialog.Close className="absolute right-3 top-3 z-10 text-2xl leading-none">×</Dialog.Close>

              <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] items-start gap-2 px-4 pb-1 pt-3">
                <div>
                  <div className="text-[9.5px] font-extrabold uppercase tracking-[0.2em] text-accent">
                    {product.name.toUpperCase()}
                  </div>
                  <Dialog.Title asChild>
                    <div className="mt-[11px] font-serif text-[25px] leading-[1.06]">{product.name}</div>
                  </Dialog.Title>
                  <p className="mt-3 text-[12.5px] leading-[1.65] text-neutral-700">{product.description}</p>
                  <div className="mt-4 flex items-baseline gap-1.5">
                    <span className="font-serif text-[27px] leading-none text-accent">${product.priceMxn}</span>
                    <span className="text-[10px] font-extrabold tracking-[0.12em] text-neutral-600">MXN</span>
                  </div>
                </div>
                <div className="relative z-[2] h-[268px] bg-neutral-200">
                  {product.photoUrl && (
                    <Image src={product.photoUrl} alt={product.name} fill sizes="220px" className="object-contain" />
                  )}
                </div>
              </div>

              <div className="px-4 pt-1.5">
                <div className="text-[9.5px] font-extrabold uppercase tracking-[0.2em]">TALLA</div>
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {sizes.map((s) => {
                    const on = s === picked;
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setSize(s)}
                        className={`min-w-[48px] flex-1 border px-1 py-[11px] text-[11px] font-extrabold tracking-[0.1em] ${
                          on ? "border-ink bg-ink text-neutral-100" : "border-neutral-400 bg-transparent text-ink"
                        }`}
                      >
                        {s.toUpperCase()}
                      </button>
                    );
                  })}
                </div>

                {!!whatsapp && (
                  <a
                    href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(waMessage)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 flex items-center justify-between border-2 border-ink px-[18px] py-4 text-[11px] font-extrabold uppercase tracking-[0.16em]"
                  >
                    PEDIR POR WHATSAPP
                    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="2">
                      <path d="M21 11.5a8.4 8.4 0 0 1-12.3 7.4L3 20.5l1.7-5.5A8.4 8.4 0 1 1 21 11.5z" />
                    </svg>
                  </a>
                )}
              </div>

              <div className="mt-[18px] grid grid-cols-4 border-t border-ink/40">
                {PERKS.map((perk, i) => (
                  <div key={perk.l1} className={`px-1.5 pb-[18px] pt-[15px] text-center ${i < 3 ? "border-r border-ink/40" : ""}`}>
                    <div className="flex justify-center">
                      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round">
                        <path d={perk.d} />
                      </svg>
                    </div>
                    <div className="mt-2 text-[8px] font-extrabold uppercase leading-[1.45] tracking-[0.1em] text-neutral-700">
                      {perk.l1}
                      <br />
                      {perk.l2}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
