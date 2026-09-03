"use client";

import { useState } from "react";
import Image from "next/image";
import * as Collapsible from "@radix-ui/react-collapsible";
import type { PodiumCategory, PodiumPlace } from "@/lib/derived";

/** One leaderboard entry's bar. Rank 1 gets the tall accent-red bar with the
 * player's photo baked in bottom-right and a bigger numeral; ranks 2-3 get
 * shorter ink bars with no photo. A rank-1/rank-2 tie flattens all three
 * bars to the same neutral-gray height per the prototype's tie rule. */
function PodiumColumn({ place }: { place: PodiumPlace }) {
  const { player, value, rank, isFirst, isTie } = place;

  if (!player) {
    return (
      <div className="flex flex-col items-center gap-1.5 text-center">
        <div className="h-[13px] w-full truncate text-[11px] font-extrabold uppercase tracking-[0.04em] text-neutral-400">—</div>
        <div className="text-[9px] font-extrabold text-neutral-400">—</div>
        <div className="flex w-full items-end justify-center border-2 border-dashed border-neutral-300" style={{ height: 52 }}>
          <span className="pb-2 text-[10px] font-semibold text-neutral-400">N/D</span>
        </div>
      </div>
    );
  }

  const barHeight = isTie ? 70 : rank === 1 ? 150 : rank === 2 ? 70 : 52;
  const barBg = isTie ? "bg-neutral-500" : isFirst ? "bg-accent" : "bg-ink";

  return (
    <div className="flex flex-col items-center gap-1.5 text-center">
      <div className="w-full truncate text-[11px] font-extrabold uppercase tracking-[0.04em]">{player.name}</div>
      <div className="text-[9px] font-extrabold text-accent">{player.dorsal}</div>
      <div className={`relative w-full overflow-hidden ${barBg}`} style={{ height: barHeight }}>
        {isFirst && player.photoUrl && (
          <div className="absolute bottom-0 right-0 h-full w-[68%]">
            <Image src={player.photoUrl} alt={player.name} fill sizes="120px" className="object-cover object-top opacity-90" />
          </div>
        )}
        <span
          className={`absolute left-2 top-1.5 font-serif leading-none text-cream ${isFirst ? "text-[34px]" : "text-[18px]"}`}
        >
          {value}
        </span>
        <span className="absolute bottom-1.5 left-2 text-[9px] font-extrabold text-cream/80">{rank}</span>
      </div>
    </div>
  );
}

function PodiumBoard({ category }: { category: PodiumCategory }) {
  const isTie = category.places[0]?.isTie ?? false;

  return (
    <div className="mt-[34px] border-t-2 border-ink pt-4">
      <div className="flex items-baseline gap-2.5">
        <span className="text-[10.5px] font-extrabold uppercase tracking-[0.18em]">{category.label}</span>
        <span className="h-px flex-1 bg-ink/15" />
        <span className="text-[9px] font-bold uppercase tracking-[0.12em] text-neutral-600">{category.hint}</span>
      </div>
      <div className={`mt-4 grid items-end gap-3 ${isTie ? "grid-cols-3" : "grid-cols-[1.5fr_1fr_1fr]"}`}>
        {category.places.map((place) => (
          <PodiumColumn key={place.rank} place={place} />
        ))}
      </div>
    </div>
  );
}

export function PodiosDisclosure({ categories }: { categories: PodiumCategory[] }) {
  const [open, setOpen] = useState(true);

  return (
    <Collapsible.Root open={open} onOpenChange={setOpen}>
      <Collapsible.Trigger className="flex w-full items-start justify-between gap-3 text-left">
        <h2 className="font-dynamic text-[clamp(26px,7.6vw,34px)] font-normal uppercase leading-none">
          LOS NÚMEROS
          <br />
          DE LA TEMPORADA
        </h2>
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.5}
          className={`mt-1.5 flex-none text-accent transition-transform duration-300 ${open ? "rotate-180" : ""}`}
        >
          <path d="M5 9l7 7 7-7" />
        </svg>
      </Collapsible.Trigger>
      <Collapsible.Content className="overflow-hidden data-[state=open]:animate-[podios-open_300ms_ease-out] data-[state=closed]:animate-[podios-close_300ms_ease-out]">
        {categories.map((cat) => (
          <PodiumBoard key={cat.key} category={cat} />
        ))}
      </Collapsible.Content>
    </Collapsible.Root>
  );
}
