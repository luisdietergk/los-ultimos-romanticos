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

/** Full-page product detail view — opened by tapping a rack item. Redesigned
 * to match a full product-page layout (title/price/description, a large
 * hanging product shot, and a detail-shot gallery below it) rather than the
 * small bottom-sheet this used to be, since a product can now carry extra
 * "detail" photos (`detailImageUrls`, set in /admin/shop) alongside its main
 * photo — those need real room to be seen at a useful size. The hanger
 * graphic itself is baked into each product photo (not drawn here). */
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
        <Dialog.Content
          className="fixed inset-0 z-50 overflow-y-auto bg-cream"
          aria-describedby={undefined}
        >
          {product && (
            <div className="mx-auto w-full max-w-[480px] px-6 pb-10 pt-14 lg:max-w-[960px] lg:px-16 lg:pt-20">
              <Dialog.Close className="fixed right-4 top-4 z-10 flex h-9 w-9 items-center justify-center border-2 border-ink bg-cream text-2xl leading-none lg:right-8 lg:top-8">
                ×
              </Dialog.Close>

              <div className="lg:grid lg:grid-cols-[1fr_1.15fr] lg:items-start lg:gap-16">
                <div>
                  <div className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-accent">
                    COLECCIÓN 20◆20
                  </div>
                  <Dialog.Title asChild>
                    <h2 className="mt-3 font-serif text-[32px] uppercase leading-[0.95] lg:text-[42px]">
                      {product.name}
                    </h2>
                  </Dialog.Title>
                  <div className="my-4 h-1 w-[70px] bg-accent" />
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-serif text-[28px] leading-none text-accent">${product.priceMxn}</span>
                    <span className="text-[10px] font-extrabold tracking-[0.12em] text-neutral-600">MXN</span>
                  </div>
                  <p className="mt-4 text-[13px] leading-[1.7] text-neutral-700">{product.description}</p>
                  <button
                    type="button"
                    onClick={() => setFavorited((v) => !v)}
                    className="mt-5 flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.14em] text-ink"
                  >
                    <svg
                      width="17"
                      height="17"
                      viewBox="0 0 24 24"
                      fill={favorited ? "var(--color-accent)" : "none"}
                      stroke={favorited ? "var(--color-accent)" : "currentColor"}
                      strokeWidth="1.8"
                    >
                      <path d="M12 20.6S3.6 14.6 3.6 9.1A4.6 4.6 0 0 1 12 6.4a4.6 4.6 0 0 1 8.4 2.7c0 5.5-8.4 11.5-8.4 11.5z" />
                    </svg>
                    {favorited ? "EN FAVORITOS" : "AÑADIR A FAVORITOS"}
                  </button>
                </div>

                <div className="mt-8 lg:mt-0">
                  <div
                    className="relative mx-auto h-[300px] w-[240px] lg:h-[400px] lg:w-[320px]"
                    // Only the main photo (gallery index 0) is the same
                    // element the rack thumbnail represents, so only it gets
                    // the shared name — see ShopRack.tsx's setOpenIdWithTransition.
                    style={{ viewTransitionName: product && activeImage === 0 ? `shop-photo-${product.id}` : undefined }}
                  >
                    {gallery[activeImage] && (
                      <Image
                        src={gallery[activeImage]}
                        alt={product.name}
                        fill
                        sizes="320px"
                        className="object-contain drop-shadow-[0_24px_30px_rgba(32,30,29,0.28)]"
                      />
                    )}
                  </div>

                  {gallery.length > 1 && (
                    <div className="mt-6 flex items-start justify-center gap-3">
                      <div className="flex flex-none flex-col gap-2.5 pt-1.5">
                        {gallery.map((_, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => setActiveImage(i)}
                            className={`text-left text-[10px] font-extrabold tracking-[0.1em] ${
                              i === activeImage ? "border-b-2 border-accent text-accent" : "text-neutral-400"
                            }`}
                          >
                            {String(i + 1).padStart(2, "0")}
                          </button>
                        ))}
                      </div>
                      <div className="grid flex-1 grid-cols-4 gap-2">
                        {gallery.map((url, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => setActiveImage(i)}
                            className={`relative h-16 flex-none overflow-hidden border ${
                              i === activeImage ? "border-ink" : "border-neutral-300"
                            }`}
                          >
                            <Image src={url} alt="" fill sizes="80px" className="object-cover" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-8">
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
                    className="mt-4 flex items-center justify-between border-2 border-ink bg-ink px-[18px] py-4 text-[11px] font-extrabold uppercase tracking-[0.16em] text-cream"
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
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
