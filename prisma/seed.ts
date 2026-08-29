// One-time migration: pulls the real assets and structured content out of
// the Claude Design prototype bundle (../../project relative to this file)
// and seeds the local dev database + local asset storage. Run via:
//   pnpm exec tsx prisma/seed.ts
// (also wired as `prisma.seed` in package.json, so `prisma db seed` works)

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { readFile } from "fs/promises";
import path from "path";
import { saveAsset, saveDataUri } from "../lib/storage";
import { generateSeasonFixtures } from "../lib/schedule";
import { ROSTER, RIVALS18, SHOP, HISTORIA, SAMPLE_GOAL_SETS } from "./seed-data";

const prisma = new PrismaClient();

const BUNDLE_DIR = path.join(__dirname, "..", "..", "project");
const SLOTS_JSON = path.join(BUNDLE_DIR, ".image-slots.state.json");
const UPLOADS_DIR = path.join(BUNDLE_DIR, "uploads");

function slugify(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .toLowerCase()
    .replace(/^-+|-+$/g, "");
}

async function main() {
  console.log("Reading .image-slots.state.json ...");
  const raw = await readFile(SLOTS_JSON, "utf-8");
  const slots: Record<string, { u: string }> = JSON.parse(raw);

  const slotUrl = new Map<string, string>();
  for (const [key, value] of Object.entries(slots)) {
    const dataUri = value.u;
    if (!dataUri || !dataUri.startsWith("data:")) continue;
    const ext = dataUri.startsWith("data:image/webp") ? ".webp" : dataUri.startsWith("data:image/png") ? ".png" : ".jpg";
    const { url } = await saveDataUri(dataUri, "slots", `${key}${ext}`);
    slotUrl.set(key, url);
  }
  console.log(`Migrated ${slotUrl.size} images from .image-slots.state.json`);

  // --- SiteSettings singleton -------------------------------------------------
  console.log("Copying hero video + background pattern ...");
  const heroVideoBuf = await readFile(path.join(UPLOADS_DIR, "shot-1-20260826-2149.mp4"));
  const { url: heroVideoUrl } = await saveAsset(heroVideoBuf, "site", "hero-video.mp4");
  const patternBuf = await readFile(path.join(UPLOADS_DIR, "patron.png"));
  const { url: patternUrl } = await saveAsset(patternBuf, "site", "pattern.png");

  // The team's own crest IS a real, finished logo already captured in the
  // prototype (header/footer/match slots) — not a missing placeholder.
  const teamCrestUrl = slotUrl.get("lur-escudo-match") ?? slotUrl.get("lur-escudo-header") ?? null;

  await prisma.siteSettings.upsert({
    where: { id: 1 },
    create: {
      id: 1,
      heroVideoUrl,
      patternUrl,
      teamCrestUrl,
      historiaP1: HISTORIA.p1,
      historiaP2: HISTORIA.p2,
    },
    update: {
      heroVideoUrl,
      patternUrl,
      teamCrestUrl,
      historiaP1: HISTORIA.p1,
      historiaP2: HISTORIA.p2,
    },
  });

  // --- Rivals ------------------------------------------------------------------
  console.log("Seeding rivals ...");
  const rivalByName = new Map<string, string>(); // name -> Rival.id
  for (const name of RIVALS18) {
    const crestUrl = slotUrl.get(`lur-escudo-rival-${slugify(name)}`) ?? null;
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
    const photoUrl = slotUrl.get(`lur-foto-${p.slotId}`) ?? null;
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
        assists: p.a,
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
      const rival = await prisma.rival.upsert({
        where: { name: rivalName },
        create: { name: rivalName },
        update: {},
      });
      rivalId = rival.id;
      rivalByName.set(rivalName, rivalId);
    }
    const crestOverrideUrl = slotUrl.get(`lur-escudo-m-j${fx.jornada}`) ?? null;
    const heroCrestUrl = slotUrl.get(`lur-escudo-hero-j${fx.jornada}`) ?? null;
    const match = await prisma.match.upsert({
      where: { jornada: fx.jornada },
      create: {
        jornada: fx.jornada,
        jornadaLabel: fx.jornadaLabel,
        rivalId,
        kickoffAt: fx.kickoffAt,
        crestOverrideUrl,
        heroCrestUrl,
      },
      update: {
        jornadaLabel: fx.jornadaLabel,
        rivalId,
        kickoffAt: fx.kickoffAt,
        crestOverrideUrl,
        heroCrestUrl,
      },
    });
    matchIdByJornada.set(fx.jornada, match.id);
  }

  // --- Sample goals (jornadas 1-4, ported from the prototype's own example data) ---
  console.log("Seeding sample goals for jornadas 1-4 ...");
  for (const [i, goalSet] of SAMPLE_GOAL_SETS.entries()) {
    const jornada = i + 1;
    const matchId = matchIdByJornada.get(jornada);
    if (!matchId) continue;
    const existing = await prisma.goal.count({ where: { matchId } });
    if (existing > 0) continue; // don't duplicate on re-seed
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
    const photoUrl = slotUrl.get(`lur-shop-${item.slotId}-main`) ?? null;
    await prisma.shopProduct.upsert({
      where: { id: item.slotId },
      create: {
        id: item.slotId,
        name: item.name,
        sizesCsv: item.sizesCsv,
        priceMxn: item.priceMxn,
        description: item.description,
        photoUrl,
        sortOrder: i,
      },
      update: {
        photoUrl,
      },
    });
  }

  // --- Kit images --------------------------------------------------------------
  console.log("Seeding kit images ...");
  const kits: { type: string; title: string; slot: string }[] = [
    { type: "LOCAL", title: "LOCAL", slot: "lur-kit-local" },
    { type: "VISITA", title: "VISITANTE", slot: "lur-kit-visita" },
    { type: "PORTERO", title: "PORTERO", slot: "lur-kit-portero" },
  ];
  for (const k of kits) {
    await prisma.kitImage.upsert({
      where: { type: k.type },
      create: { type: k.type, title: k.title, imageUrl: slotUrl.get(k.slot) ?? null },
      update: { imageUrl: slotUrl.get(k.slot) ?? null },
    });
  }

  // --- Admin user ----------------------------------------------------------
  const adminEmail = process.env.ADMIN_SEED_EMAIL;
  const adminPassword = process.env.ADMIN_SEED_PASSWORD;
  if (adminEmail && adminPassword) {
    console.log(`Seeding admin user ${adminEmail} ...`);
    const passwordHash = await bcrypt.hash(adminPassword, 10);
    await prisma.adminUser.upsert({
      where: { email: adminEmail },
      create: { email: adminEmail, passwordHash },
      update: { passwordHash },
    });
  } else {
    console.warn("ADMIN_SEED_EMAIL/ADMIN_SEED_PASSWORD not set — skipping admin user seed.");
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
