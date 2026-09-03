import Image from "next/image";

export function Footer({
  crestUrl,
  tiktokUrl,
  instagramUrl,
  gmailAddress,
}: {
  crestUrl: string | null;
  tiktokUrl: string | null;
  instagramUrl: string | null;
  gmailAddress: string | null;
}) {
  const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;

  return (
    <footer className="relative z-10 bg-ink px-6 pb-8 pt-7 text-cream lg:px-16">
      <div className="lg:flex lg:items-center lg:justify-between">
        <div className="flex items-center gap-5">
          <div className="h-[62px] w-[52px] flex-none">
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

        <div className="mt-6 flex flex-col gap-4 lg:mt-0 lg:w-72 lg:items-end">
          {(tiktokUrl || instagramUrl || gmailAddress) && (
            <div className="flex items-center gap-5">
              {tiktokUrl && (
                <a href={tiktokUrl} target="_blank" rel="noreferrer" aria-label="TikTok" className="text-cream opacity-90 hover:opacity-100">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M16.6 5.2c-.7-.7-1.1-1.7-1.1-2.7h-3v12.4a2.6 2.6 0 1 1-1.9-2.5v-3a5.6 5.6 0 1 0 4.9 5.5V9.1a6.9 6.9 0 0 0 3.6 1v-3a3.9 3.9 0 0 1-2.5-1.9z" />
                  </svg>
                </a>
              )}
              {instagramUrl && (
                <a href={instagramUrl} target="_blank" rel="noreferrer" aria-label="Instagram" className="text-cream opacity-90 hover:opacity-100">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="2" width="20" height="20" />
                    <circle cx="12" cy="12" r="4.2" />
                  </svg>
                </a>
              )}
              {gmailAddress && (
                <a href={`mailto:${gmailAddress}`} aria-label="Gmail" className="text-cream opacity-90 hover:opacity-100">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="4" width="20" height="16" />
                    <path d="M3 6l9 7 9-7" />
                  </svg>
                </a>
              )}
            </div>
          )}
          {whatsapp && (
            <a
              href={`https://wa.me/${whatsapp}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 bg-accent px-5 py-3 text-xs font-extrabold uppercase tracking-[0.12em] text-cream"
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
