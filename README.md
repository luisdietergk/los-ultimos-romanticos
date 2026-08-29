# Los Últimos Románticos

Production rebuild of the "Los Últimos Románticos" Claude Design prototype — a fan-hub site for an amateur 7-a-side soccer team in Torreón, Coahuila. Next.js 16 (App Router, TypeScript, Tailwind v4), Prisma + Postgres, Auth.js, Vercel Blob.

## Deploying on Vercel

1. **Database**: create a free project at [neon.tech](https://neon.tech), copy its connection string.
2. **Import this repo into Vercel** (vercel.com → Add New → Project → pick this GitHub repo).
3. **Set environment variables** in the Vercel project (Settings → Environment Variables), for both Production and Preview:
   - `DATABASE_URL` — the Neon connection string from step 1.
   - `AUTH_SECRET` — any long random string (e.g. run `openssl rand -base64 32` somewhere, or just mash the keyboard for 40+ characters).
   - `ADMIN_SEED_EMAIL` / `ADMIN_SEED_PASSWORD` — whatever you want the first admin login to be. Safe to leave set permanently — the seed script only creates this account once.
   - `NEXT_PUBLIC_WHATSAPP_NUMBER` / `NEXT_PUBLIC_INSTAGRAM_URL` — optional; the footer/shop buttons stay hidden until these are set.
4. **Attach Vercel Blob storage**: in the same project, go to the **Storage** tab → **Create Database** → **Blob** → connect it to this project. Vercel injects `BLOB_READ_WRITE_TOKEN` automatically — nothing to copy by hand.
5. **Deploy.** The build runs `prisma generate && prisma db push && tsx prisma/seed.ts && next build` automatically — it creates the tables and loads the real roster/schedule/shop content into your new database the first time, and is a safe no-op on every deploy after that.
6. Visit the deployed URL, then `/admin` to log in with the email/password from step 3.

## Local development

Needs a real Postgres connection too (Neon's free tier works fine for this — either the same database as production, or a separate Neon project/branch for dev).

```bash
cp .env.example .env   # fill in DATABASE_URL, AUTH_SECRET, ADMIN_SEED_EMAIL/PASSWORD
pnpm install
npx prisma db push
pnpm exec tsx prisma/seed.ts
pnpm dev
```

Visit `http://localhost:3000` for the public site, `http://localhost:3000/admin` for the admin panel. Without `BLOB_READ_WRITE_TOKEN` set, admin photo/video uploads fall back to writing into `public/uploads/` — fine for local dev, not for Vercel (see below).

## Data & storage

- **Database**: Postgres via Prisma (`prisma/schema.prisma`). Match/goal/kit/status fields are real Postgres `enum`s (see `lib/types.ts` for the re-exported TS types).
- **Uploads**: `lib/storage.ts` uses Vercel Blob when `BLOB_READ_WRITE_TOKEN` is set, otherwise writes to `public/uploads/<category>/` for local dev. Every admin upload form goes through this one function.
- **Auth**: Auth.js (NextAuth v5), Credentials provider against the `AdminUser` table (bcrypt-hashed passwords). `/admin/**` (except `/admin/login`) is gated by `app/admin/(protected)/layout.tsx`.
- **Seeding**: `prisma/seed.ts` is idempotent — it upserts `SiteSettings`/`AdminUser` every run, but only seeds the roster/matches/shop/kits once (checks `player.count()` first), so it's safe to run automatically on every deploy without duplicating data or overwriting edits made through `/admin`.

## Content still to fill in via `/admin`

6 of 8 shop product photos, most rival crests (only ~9 of 18 were captured in the original design session), and the WhatsApp number / Instagram handle (env vars above). The schedule's rival order, sample goals on jornadas 1-4, and roster stats were all invented placeholders during design — correct them whenever real data is available.

## Scope notes

- Tabla de posiciones, a real photo gallery, and a Contacto/Únete section were never finished in the original design (still a "SIGUE EN CAMINO" placeholder — see `components/site/ComingSoon.tsx`) and are out of scope for this build.
- All editable content (matches, goals, roster, shop, kits, site settings) is a real Postgres-backed admin panel, replacing the original prototype's browser-only `localStorage` "Edit Mode."
