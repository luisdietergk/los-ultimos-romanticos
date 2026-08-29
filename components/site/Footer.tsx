import Image from "next/image";

export function Footer({ crestUrl }: { crestUrl: string | null }) {
  const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
  const instagram = process.env.NEXT_PUBLIC_INSTAGRAM_URL;

  return (
    <footer className="relative z-10 bg-ink px-6 pb-[60px] pt-[52px] text-cream lg:px-16">
      <div className="lg:flex lg:items-center lg:justify-between">
        <div className="flex items-center gap-5">
          <div className="h-[86px] w-[72px] flex-none">
            {crestUrl && <Image src={crestUrl} alt="Escudo" width={144} height={172} className="h-full w-full object-contain" />}
          </div>
          <div>
            <div className="text-[17px] font-black uppercase leading-[1.05]">
              LOS ÚLTIMOS
              <br />
              ROMÁNTICOS
            </div>
            <div className="mt-3 text-[11px] font-bold tracking-[0.24em] text-accent">FUNDADOS EN 2020</div>
          </div>
        </div>

        <div className="mt-9 flex flex-col gap-3 lg:mt-0 lg:w-72">
          {instagram && (
            <a
              href={instagram}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 border-2 border-cream px-5 py-[18px] text-xs font-extrabold uppercase tracking-[0.12em] text-cream"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="2" width="20" height="20" />
                <circle cx="12" cy="12" r="4.2" />
              </svg>
              INSTAGRAM
            </a>
          )}
          {whatsapp && (
            <a
              href={`https://wa.me/${whatsapp}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 bg-accent px-5 py-[18px] text-xs font-extrabold uppercase tracking-[0.12em] text-cream"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12a9 9 0 1 1-4.2-7.6L21 3l-1.4 4.2A8.9 8.9 0 0 1 21 12z" />
              </svg>
              WHATSAPP
            </a>
          )}
        </div>
      </div>
    </footer>
  );
}
