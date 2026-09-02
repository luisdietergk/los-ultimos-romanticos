"use client";

import { useEffect, useRef } from "react";

export function Hero({ heroVideoUrl, taglineHtml }: { heroVideoUrl: string | null; taglineHtml: string }) {
  const bgRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const y = window.scrollY || 0;
        if (bgRef.current) bgRef.current.style.transform = `translateY(${(y * 0.18).toFixed(1)}px)`;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    // iOS Safari only honors autoplay if `muted` is set as a real DOM
    // property before the first play attempt — React's `muted` JSX prop
    // doesn't reliably land in time, which is why the video was showing a
    // native play button instead of autoplaying. Set it imperatively and
    // kick off playback ourselves rather than waiting on the attribute.
    video.muted = true;
    video.defaultMuted = true;
    const tryPlay = () => video.play().catch(() => {});
    tryPlay();
    // Some mobile browsers still block it outright — retry once on first tap.
    document.addEventListener("touchstart", tryPlay, { once: true });
    document.addEventListener("click", tryPlay, { once: true });
    return () => {
      document.removeEventListener("touchstart", tryPlay);
      document.removeEventListener("click", tryPlay);
    };
  }, []);

  return (
    <section id="hero" className="relative z-10 min-h-[760px] overflow-hidden border-b-2 border-ink px-6 pb-[72px] pt-[52px] lg:px-16 lg:pb-24">
      {heroVideoUrl && (
        <div ref={bgRef} className="absolute inset-x-0 -inset-y-[8%] z-0 overflow-hidden will-change-transform">
          <video
            ref={videoRef}
            src={heroVideoUrl}
            autoPlay
            loop
            muted
            playsInline
            className="block h-full w-full object-cover object-[100%_center]"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to bottom, color-mix(in srgb, var(--color-cream) 78%, transparent), color-mix(in srgb, var(--color-cream) 52%, transparent) 55%, color-mix(in srgb, var(--color-cream) 84%, transparent))",
            }}
          />
        </div>
      )}

      <div className="relative z-10 lg:grid lg:grid-cols-[440px_1fr] lg:items-end lg:gap-12">
        <div className="lg:bg-cream/90 lg:p-6">
          <h1 className="mt-[150px] font-sans text-[clamp(34px,10.6vw,49px)] font-black uppercase leading-none tracking-[-0.01em] text-ink lg:mt-0 lg:text-[64px]">
            LOS
            <br />
            ÚLTIMOS
            <br />
            ROMÁNTICOS
          </h1>
          <div className="my-4 h-1 w-[104px] bg-accent" />

          <div className="flex items-baseline gap-3">
            <span className="h-2 w-2 flex-none -translate-y-[3px] bg-accent" />
            <p
              className="max-w-[220px] text-sm font-medium leading-[1.65] text-neutral-700"
              dangerouslySetInnerHTML={{ __html: taglineHtml }}
            />
          </div>

          <div className="relative z-10 my-8 flex items-center gap-3.5">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="var(--color-ink)">
              <path d="M12 21s-8-5.1-8-10.4A4.6 4.6 0 0 1 12 7.4 4.6 4.6 0 0 1 20 10.6C20 15.9 12 21 12 21z" />
            </svg>
            <span className="flex animate-[lur-heartbeat_2s_ease-in-out_infinite]">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="var(--color-accent)">
                <path d="M12 21s-8-5.1-8-10.4A4.6 4.6 0 0 1 12 7.4 4.6 4.6 0 0 1 20 10.6C20 15.9 12 21 12 21z" />
              </svg>
            </span>
            <svg width="24" height="24" viewBox="0 0 24 24">
              <path
                d="M12 21s-8-5.1-8-10.4A4.6 4.6 0 0 1 12 7.4 4.6 4.6 0 0 1 20 10.6C20 15.9 12 21 12 21z"
                fill="var(--color-cream)"
                stroke="var(--color-ink)"
                strokeWidth="1.8"
              />
            </svg>
          </div>

          <div className="relative z-10 flex flex-wrap gap-2.5">
            <a
              href="#partidos"
              className="inline-flex items-center whitespace-nowrap bg-accent px-3.5 py-2.5 text-[9px] font-extrabold uppercase tracking-[0.12em] text-cream hover:bg-accent-hover"
            >
              PRÓXIMO PARTIDO
            </a>
            <a
              href="#plantilla"
              className="inline-flex items-center whitespace-nowrap border-2 border-ink px-3.5 py-2.5 text-[9px] font-extrabold uppercase tracking-[0.12em] text-ink"
            >
              CONOCE AL EQUIPO
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
