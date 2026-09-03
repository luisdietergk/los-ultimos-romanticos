// One-time data seed, safe to re-run on every deploy (idempotent — see
// `alreadySeeded` guard below). Unlike the original migration script, this
// does NOT read from the sibling `../../project` design bundle — it points
// directly at the real assets already committed under `public/uploads/slots/`
// and `public/uploads/site/`, so it works in any environment that just has
// this repo checked out (e.g. a Vercel build), not only this sandbox.
//
// Run via: pnpm exec tsx prisma/seed.ts
// (also wired as `prisma.seed` in package.json, so `prisma db seed` works)

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { existsSync } from "fs";
import path from "path";
import { generateSeasonFixtures } from "../lib/schedule";
import { ROSTER, RIVALS18, SHOP, HISTORIA, SAMPLE_GOAL_SETS } from "./seed-data";

const prisma = new PrismaClient();

const SLOTS_DIR = path.join(__dirname, "..", "public", "uploads", "slots");
const SITE_DIR = path.join(__dirname, "..", "public", "uploads", "site");

/** Returns the public URL for a slot image if the file is actually
 * committed to the repo, else null (renders as an empty upload slot on the
 * public site / admin instead of a broken image). */
function slotUrl(filename: string): string | null {
  return existsSync(path.join(SLOTS_DIR, filename)) ? `/uploads/slots/${filename}` : null;
}

function slugify(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .toLowerCase()
    .replace(/^-+|-+$/g, "");
}

async function main() {
  // --- SiteSettings singleton (safe to upsert every run) ---------------------
  const heroVideoUrl = existsSync(path.join(SITE_DIR, "hero-video.mp4")) ? "/uploads/site/hero-video.mp4" : null;
  const patternUrl = existsSync(path.join(SITE_DIR, "pattern.png")) ? "/uploads/site/pattern.png" : null;
  const teamCrestUrl = slotUrl("lur-escudo-match.webp") ?? slotUrl("lur-escudo-header.webp");

  await prisma.siteSettings.upsert({
    where: { id: 1 },
    create: { id: 1, heroVideoUrl, patternUrl, teamCrestUrl, historiaP1: HISTORIA.p1, historiaP2: HISTORIA.p2 },
    update: { heroVideoUrl, patternUrl, teamCrestUrl, historiaP1: HISTORIA.p1, historiaP2: HISTORIA.p2 },
  });

  // --- Admin user (safe to upsert every run) ----------------------------------
  const adminEmail = process.env.ADMIN_SEED_EMAIL;
  const adminPassword = process.env.ADMIN_SEED_PASSWORD;
  if (adminEmail && adminPassword) {
    const passwordHash = await bcrypt.hash(adminPassword, 10);
    await prisma.adminUser.upsert({
      where: { email: adminEmail },
      create: { email: adminEmail, passwordHash },
      update: { passwordHash },
    });
    console.log(`Admin user ready: ${adminEmail}`);
  } else {
    console.warn("ADMIN_SEED_EMAIL/ADMIN_SEED_PASSWORD not set — skipping admin user seed.");
  }

  // --- Default shop photos (safe to run every deploy) -------------------------
  // Unlike the roster/shop/kits seed below, this runs on every deploy — including
  // against a database that was already seeded — so committing a new default
  // photo here reaches production without going through /admin. It only ever
  // sets a photo when the product doesn't have one yet, so it can never
  // clobber a photo someone already set (via /admin or a previous backfill).
  const SHOP_DEFAULT_PHOTOS: Record<string, string> = {
    s1: "s1-jersey-local.png",
    s2: "s2-jersey-visitante.png",
    s3: "s3-jersey-portero.png",
    s6: "s6-chamarra-rompevientos.png",
  };
  const SHOP_DEFAULTS_DIR = path.join(__dirname, "..", "public", "uploads", "shop-defaults");
  for (const [slotId, filename] of Object.entries(SHOP_DEFAULT_PHOTOS)) {
    if (!existsSync(path.join(SHOP_DEFAULTS_DIR, filename))) continue;
    const product = await prisma.shopProduct.findUnique({ where: { id: slotId } });
    if (!product || product.photoUrl) continue;
    await prisma.shopProduct.update({
      where: { id: slotId },
      data: { photoUrl: `/uploads/shop-defaults/${filename}` },
    });
    console.log(`Backfilled default photo for shop product "${slotId}".`);
  }

  // --- Everything below only runs once: roster/matches/shop/kits are the -----
  // --- team's real editable content, so re-seeding on every deploy would  -----
  // --- either duplicate rows or stomp on edits made through /admin.       -----
  const alreadySeeded = (await prisma.player.count()) > 0;
  if (alreadySeeded) {
    console.log("Roster already seeded — skipping matches/players/shop/kits.");
    return;
  }

  // --- Rivals ------------------------------------------------------------------
  console.log("Seeding rivals ...");
  const rivalByName = new Map<string, string>();
  for (const name of RIVALS18) {
    const crestUrl = slotUrl(`lur-escudo-rival-${slugify(name)}.webp`);
    const rival = await prisma.rival.upsert({
      where: { name },
      create: { name, crestUrl },
      update: { crestUrl },
    });
    rivalByName.set(name, rival.id);
  }

  // --- Players -------------------------------------------------------------
  console.log("Seeding roster ...");
  const playerIdByName = new Map<string, string>();
  for (const [i, p] of ROSTER.entries()) {
    const photoUrl = slotUrl(`lur-foto-${p.slotId}.webp`);
    const player = await prisma.player.create({
      data: {
        dorsal: p.dorsal,
        name: p.name,
        position: p.pos,
        nationality: p.nac,
        apodo: p.apodo,
        quote: p.q,
        description: p.desc,
        pj: p.pj,
        photoUrl,
        sortOrder: i,
      },
    });
    playerIdByName.set(p.name, player.id);
  }

  // --- Matches (18 jornadas + semifinal + final) ----------------------------
  console.log("Seeding season schedule ...");
  const fixtures = generateSeasonFixtures(2026);
  const matchIdByJornada = new Map<number, string>();
  for (const fx of fixtures) {
    const isRegularSeason = fx.jornada <= 18;
    const rivalName = isRegularSeason ? RIVALS18[fx.jornada - 1] : "POR DEFINIR";
    let rivalId = rivalByName.get(rivalName) ?? null;
    if (!rivalId) {
      const rival = await prisma.rival.upsert({ where: { name: rivalName }, create: { name: rivalName }, update: {} });
      rivalId = rival.id;
      rivalByName.set(rivalName, rivalId);
    }
    const crestOverrideUrl = slotUrl(`lur-escudo-m-j${fx.jornada}.webp`);
    const heroCrestUrl = slotUrl(`lur-escudo-hero-j${fx.jornada}.webp`);
    const match = await prisma.match.upsert({
      where: { jornada: fx.jornada },
      create: { jornada: fx.jornada, jornadaLabel: fx.jornadaLabel, rivalId, kickoffAt: fx.kickoffAt, crestOverrideUrl, heroCrestUrl },
      update: { jornadaLabel: fx.jornadaLabel, rivalId, kickoffAt: fx.kickoffAt, crestOverrideUrl, heroCrestUrl },
    });
    matchIdByJornada.set(fx.jornada, match.id);
  }

  // --- Sample goals (jornadas 1-4, ported from the prototype's own example data) ---
  console.log("Seeding sample goals for jornadas 1-4 ...");
  for (const [i, goalSet] of SAMPLE_GOAL_SETS.entries()) {
    const matchId = matchIdByJornada.get(i + 1);
    if (!matchId) continue;
    for (const g of goalSet) {
      await prisma.goal.create({
        data: {
          matchId,
          minute: g.minute,
          team: g.team,
          playerId: g.playerName ? playerIdByName.get(g.playerName) ?? null : null,
          scorerName: g.scorerName,
          note: g.note,
          shotX: g.shotX,
          shotY: g.shotY,
          goalX: g.goalX,
          goalY: g.goalY,
        },
      });
    }
  }

  // --- Shop products ---------------------------------------------------------
  console.log("Seeding shop products ...");
  for (const [i, item] of SHOP.entries()) {
    const photoUrl = slotUrl(`lur-shop-${item.slotId}-main.webp`);
    await prisma.shopProduct.upsert({
      where: { id: item.slotId },
      create: { id: item.slotId, name: item.name, sizesCsv: item.sizesCsv, priceMxn: item.priceMxn, description: item.description, photoUrl, sortOrder: i },
      update: { photoUrl },
    });
  }

  // --- Kit images --------------------------------------------------------------
  console.log("Seeding kit images ...");
  const kits: { type: "LOCAL" | "VISITA" | "PORTERO"; title: string; slot: string }[] = [
    { type: "LOCAL", title: "LOCAL", slot: "lur-kit-local" },
    { type: "VISITA", title: "VISITANTE", slot: "lur-kit-visita" },
    { type: "PORTERO", title: "PORTERO", slot: "lur-kit-portero" },
  ];
  for (const k of kits) {
    const imageUrl = slotUrl(`${k.slot}.webp`);
    await prisma.kitImage.upsert({
      where: { type: k.type },
      create: { type: k.type, title: k.title, imageUrl },
      update: { imageUrl },
    });
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
