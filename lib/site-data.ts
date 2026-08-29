import { prisma } from "./db";
import type { DerivedMatch, DerivedPlayer } from "./derived";
import type { KitType } from "./types";

export async function getSiteSettings() {
  const settings = await prisma.siteSettings.findUnique({ where: { id: 1 } });
  if (!settings) {
    throw new Error("SiteSettings row (id=1) is missing — run `pnpm exec tsx prisma/seed.ts`.");
  }
  return settings;
}

export async function getAllMatches(): Promise<DerivedMatch[]> {
  const matches = await prisma.match.findMany({
    include: { rival: true, goals: true },
    orderBy: { jornada: "asc" },
  });
  return matches.map((m) => ({
    id: m.id,
    jornada: m.jornada,
    jornadaLabel: m.jornadaLabel,
    kickoffAt: m.kickoffAt,
    status: m.status,
    rival: { name: m.rival.name, crestUrl: m.rival.crestUrl },
    crestOverrideUrl: m.crestOverrideUrl,
    heroCrestUrl: m.heroCrestUrl,
    venue: m.venue,
    goals: m.goals,
  }));
}

export async function getRoster(): Promise<DerivedPlayer[]> {
  const players = await prisma.player.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });
  return players.map((p) => ({
    id: p.id,
    name: p.name,
    dorsal: p.dorsal,
    photoUrl: p.photoUrl,
    pj: p.pj,
    assists: p.assists,
  }));
}

export async function getFullRoster() {
  return prisma.player.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } });
}

export async function getAllGoals() {
  return prisma.goal.findMany();
}

export async function getShopProducts() {
  return prisma.shopProduct.findMany({ orderBy: { sortOrder: "asc" } });
}

export async function getKitImages(): Promise<{ id: string; type: KitType; title: string; imageUrl: string | null }[]> {
  const kits = await prisma.kitImage.findMany();
  return kits.map((k) => ({ ...k, type: k.type as KitType }));
}
