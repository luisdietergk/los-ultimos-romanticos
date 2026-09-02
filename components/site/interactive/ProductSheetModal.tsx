"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useState } from "react";
import Image from "next/image";
import type { ShopProduct } from "../Tienda";

// Perk icon paths + copy ported verbatim from the prototype's `spPerks`
// (Los Ultimos Romanticos.dc.html:2170-2179), minus "Diseños Exclusivos" —
// the reference sheet shows only these 3.
const PERKS = [
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

/** Full-page product detail view — opened by tapping a rack item. The whole
 * sheet is sized to the viewport (`h-dvh`, no page scroll). The main photo
 * itself is static (not swipeable) — only the thumbnail strip below it is
 * interactive, tapping one swaps the main photo to it. Everything above/
 * below the main photo is fixed-height chrome; the photo absorbs whatever
 * space is left. The hanger graphic itself is baked into each product photo
 * (not drawn here). */
export function ProductSheetModal({
  product,
  onClose,
}: {
  product: ShopProduct | null;
  onClose: () => void;
}) {
  const [size, setSize] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState(0);
  const [galleryForProductId, setGalleryForProductId] = useState<string | null>(null);
  const [favorited, setFavorited] = useState(false);
  const open = product != null;

  // Reset the selected gallery image (and favorite toggle) when a different
  // product opens — done during render (React's documented pattern for
  // "adjust state when a prop changes") rather than in an effect, since a
  // useEffect setState here would cause an extra cascading render for no
  // benefit.
  if (product && product.id !== galleryForProductId) {
    setGalleryForProductId(product.id);
    setActiveImage(0);
    setFavorited(false);
  }

  const gallery = product ? [product.photoUrl, ...product.detailImageUrls].filter((u): u is string => !!u) : [];

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
        <Dialog.Content className="fixed inset-0 z-50 overflow-hidden bg-cream" aria-describedby={undefined}>
          {product && (
            <div className="mx-auto flex h-dvh w-full max-w-[480px] flex-col px-6 pb-4 pt-4 lg:max-w-[960px] lg:px-16 lg:pb-8 lg:pt-8">
              <Dialog.Close className="absolute right-4 top-4 z-10 flex h-9 w-9 flex-none items-center justify-center border-2 border-ink bg-cream text-2xl leading-none lg:right-8 lg:top-8">
                ×
              </Dialog.Close>

              <div className="flex min-h-0 flex-1 items-stretch gap-4 overflow-hidden pr-12 lg:gap-16 lg:pr-16">
                {/* Measured off the reference (853x1844px capture): the text
                    block sits vertically centered next to the photo, which
                    fills the full row height flush from the top — it isn't
                    top-aligned with the text. Font sizes below are viewport-
                    scaled (vw) to match the reference's own proportions
                    (title ≈ 10% of the page width, price ≈ 6.5%), clamped so
                    they stay sane outside the ~850px width it was shot at. */}
                <div className="flex w-[38%] flex-none flex-col justify-center overflow-y-auto">
                  <div className="text-[clamp(9px,1.8vw,13px)] font-extrabold uppercase tracking-[0.2em] text-accent">
                    COLECCIÓN 20◆20
                  </div>
                  <Dialog.Title asChild>
                    <h2 className="mt-2 font-serif text-[clamp(26px,9vw,64px)] uppercase leading-[0.95]">
                      {product.name}
                    </h2>
                  </Dialog.Title>
                  <div className="my-3 h-1 w-[50px] bg-accent lg:w-[70px]" />
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-serif text-[clamp(20px,6.5vw,42px)] leading-none text-accent">
                      ${product.priceMxn}
                    </span>
                    <span className="text-[9px] font-extrabold tracking-[0.12em] text-neutral-600">MXN</span>
                  </div>
                  <p className="mt-3 text-[11.5px] leading-[1.55] text-neutral-700 lg:text-[13px] lg:leading-[1.7]">
                    {product.description}
                  </p>
                  <button
                    type="button"
                    onClick={() => setFavorited((v) => !v)}
                    className="mt-3 flex items-center gap-1.5 text-[9.5px] font-extrabold uppercase tracking-[0.12em] text-ink lg:mt-5 lg:text-[11px]"
                  >
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill={favorited ? "var(--color-accent)" : "none"}
                      stroke={favorited ? "var(--color-accent)" : "currentColor"}
                      strokeWidth="1.8"
                      className="flex-none"
                    >
                      <path d="M12 20.6S3.6 14.6 3.6 9.1A4.6 4.6 0 0 1 12 6.4a4.6 4.6 0 0 1 8.4 2.7c0 5.5-8.4 11.5-8.4 11.5z" />
                    </svg>
                    {favorited ? "EN FAVORITOS" : "AÑADIR A FAVORITOS"}
                  </button>
                </div>

                <div
                  className="relative min-h-0 flex-1"
                  // Only the main photo (index 0) is the same element the
                  // rack thumbnail represents, so only it gets the shared
                  // name — see ShopRack.tsx's setOpenIdWithTransition. The
                  // sheet always opens on index 0, which is the only moment
                  // the name is actually needed.
                  style={{ viewTransitionName: activeImage === 0 ? `shop-photo-${product.id}` : undefined }}
                >
                  {gallery[activeImage] && (
                    <Image
                      src={gallery[activeImage]}
                      alt={product.name}
                      fill
                      sizes="420px"
                      className="object-contain"
                    />
                  )}
                </div>
              </div>

              {/* The only interactive way to browse the gallery — the main
                  photo above is static, tapping a thumbnail here swaps it. */}
              {gallery.length > 1 && (
                <div className="mt-2 grid flex-none grid-cols-5 gap-2">
                  {gallery.map((url, i) => (
                    <button
                      key={url}
                      type="button"
                      onClick={() => setActiveImage(i)}
                      className={`relative aspect-square overflow-hidden border-2 ${
                        i === activeImage ? "border-ink" : "border-neutral-300"
                      }`}
                    >
                      <Image src={url} alt="" fill sizes="100px" className="object-cover" />
                    </button>
                  ))}
                </div>
              )}

              <div className="flex-none pt-2">
                <div className="text-[9px] font-extrabold uppercase tracking-[0.2em]">TALLA</div>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {sizes.map((s) => {
                    const on = s === picked;
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setSize(s)}
                        className={`min-w-[42px] flex-1 border px-1 py-2 text-[10px] font-extrabold tracking-[0.1em] lg:py-[11px] lg:text-[11px] ${
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
                    className="mt-2.5 flex items-center justify-between border-2 border-ink bg-ink px-4 py-2.5 text-[10px] font-extrabold uppercase tracking-[0.16em] text-cream lg:px-[18px] lg:py-4 lg:text-[11px]"
                  >
                    PEDIR POR WHATSAPP
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="2">
                      <path d="M21 11.5a8.4 8.4 0 0 1-12.3 7.4L3 20.5l1.7-5.5A8.4 8.4 0 1 1 21 11.5z" />
                    </svg>
                  </a>
                )}
              </div>

              <div className="mt-2 grid flex-none grid-cols-3 border-t border-ink/40">
                {PERKS.map((perk, i) => (
                  <div key={perk.l1} className={`px-1 pb-2 pt-2 text-center lg:pb-[18px] lg:pt-[15px] ${i < 2 ? "border-r border-ink/40" : ""}`}>
                    <div className="flex justify-center">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" className="lg:h-[19px] lg:w-[19px]">
                        <path d={perk.d} />
                      </svg>
                    </div>
                    <div className="mt-1 text-[6.5px] font-extrabold uppercase leading-[1.35] tracking-[0.08em] text-neutral-700 lg:mt-2 lg:text-[8px] lg:leading-[1.45] lg:tracking-[0.1em]">
                      {perk.l1}
                      <br />
                      {perk.l2}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
