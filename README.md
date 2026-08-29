# Los Últimos Románticos

Production rebuild of the "Los Últimos Románticos" Claude Design prototype (`../project/Los Ultimos Romanticos.dc.html`) — a fan-hub site for an amateur 7-a-side soccer team in Torreón, Coahuila. Next.js 16 (App Router, TypeScript, Tailwind v4), Prisma, Auth.js.

## Local development

```bash
pnpm install
pnpm exec tsx prisma/seed.ts   # one-time: migrates real assets/content from ../project into the local DB + public/uploads
pnpm dev
```

Visit `http://localhost:3000` for the public site, `http://localhost:3000/admin` for the admin panel. Admin login credentials come from `.env`'s `ADMIN_SEED_EMAIL`/`ADMIN_SEED_PASSWORD` (seeded by the script above).

## Data & storage

- **Database**: SQLite locally (`prisma/dev.db`, via `DATABASE_URL` in `.env`) — this sandbox has no Postgres/Docker available. `prisma/schema.prisma` uses plain `String` columns instead of native `enum`s (SQLite has no enum support) so the schema is a drop-in fit for Postgres later; see `lib/types.ts` for the TS-side union types those columns hold.
- **Uploads**: `lib/storage.ts` writes to `public/uploads/<category>/` and returns a public URL. There's no cloud storage configured here — every admin upload form and the seed script both go through this one function, so swapping to real object storage later is a one-file change.
- **Auth**: Auth.js (NextAuth v5), Credentials provider against the `AdminUser` table (bcrypt-hashed passwords). `/admin/**` (except `/admin/login`) is gated by `app/admin/(protected)/layout.tsx`.

## Moving to production

1. **Postgres**: in `prisma/schema.prisma`, change `provider = "sqlite"` to `provider = "postgresql"` and point `DATABASE_URL` at a real instance (Neon is a good fit for this traffic level). Run `prisma migrate dev` again. Optionally promote the `String` status/team/kit-type columns to real Postgres `enum`s at that point — not required, just cleaner.
2. **Asset storage**: replace `saveAsset`/`saveUploadedFile` in `lib/storage.ts` with a call to your object storage of choice (e.g. Vercel Blob's `put()`), returning its public URL instead of writing to `public/`. No other file needs to change.
3. **Env vars to set for real**: `AUTH_SECRET` (a real random secret), `NEXT_PUBLIC_WHATSAPP_NUMBER`, `NEXT_PUBLIC_INSTAGRAM_URL` (the footer/shop WhatsApp and Instagram buttons stay hidden until these are set — see `components/site/Footer.tsx` and `components/site/interactive/ProductSheetModal.tsx`), `ADMIN_SEED_EMAIL`/`ADMIN_SEED_PASSWORD` (only read once, at seed time).
4. **Content still to fill in via `/admin`**: 6 of 8 shop product photos, most rival crests (only ~9 of 18 were captured in the original design session), and any content the team wants to correct (schedule invented rival order, sample goals on jornadas 1-4, roster stats).

## Scope notes

- Tabla de posiciones, a real photo gallery, and a Contacto/Únete section were never finished in the original design (still a "SIGUE EN CAMINO" placeholder — see `components/site/ComingSoon.tsx`) and are out of scope for this build.
- All editable content (matches, goals, roster, shop, kits, site settings) is now a real Postgres/SQLite-backed admin panel, replacing the prototype's browser-only `localStorage` "Edit Mode."
