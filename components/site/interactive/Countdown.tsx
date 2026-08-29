"use client";

import { useEffect, useState } from "react";

function split(target: number, now: number) {
  let ms = target - now;
  if (ms < 0) ms = 0;
  const pad = (n: number) => String(n).padStart(2, "0");
  return {
    d: pad(Math.floor(ms / 86400000)),
    h: pad(Math.floor(ms / 3600000) % 24),
    m: pad(Math.floor(ms / 60000) % 60),
  };
}

/** Ticks a D/H/M countdown to a server-provided kickoff timestamp — mirrors
 * the prototype's `tickClock()`/`countdown()`, but only the client-side
 * `Date.now()` diff runs here; the target itself is decided server-side. */
export function Countdown({ targetISO }: { targetISO: string }) {
  const target = new Date(targetISO).getTime();
  const [cd, setCd] = useState(() => split(target, Date.now()));

  useEffect(() => {
    const id = setInterval(() => setCd(split(target, Date.now())), 1000 * 30);
    return () => clearInterval(id);
  }, [target]);

  return (
    <div className="mt-[26px] px-5 pb-[30px] text-center">
      <div className="text-[9.5px] font-bold tracking-[0.24em] text-neutral-600">FALTAN</div>
      <div className="mt-3.5 flex items-start justify-center gap-2.5">
        <div>
          <div className="font-serif text-[44px] leading-none tabular-nums text-accent">{cd.d}</div>
          <div className="mt-2 text-[9px] font-bold tracking-[0.16em] text-neutral-600">DÍAS</div>
        </div>
        <div className="text-[36px] font-black leading-[1.1] text-accent/40">:</div>
        <div>
          <div className="font-serif text-[44px] leading-none tabular-nums text-accent">{cd.h}</div>
          <div className="mt-2 text-[9px] font-bold tracking-[0.16em] text-neutral-600">HORAS</div>
        </div>
        <div className="text-[36px] font-black leading-[1.1] text-accent/40">:</div>
        <div>
          <div className="font-serif text-[44px] leading-none tabular-nums text-accent">{cd.m}</div>
          <div className="mt-2 text-[9px] font-bold tracking-[0.16em] text-neutral-600">MIN</div>
        </div>
      </div>
    </div>
  );
}
