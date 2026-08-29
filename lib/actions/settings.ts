"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { saveUploadedFile } from "@/lib/storage";
import { requireString, intOrDefault, fileOrNull } from "./util";

/** Edits the SiteSettings singleton (id=1). NEXT_PUBLIC_WHATSAPP_NUMBER and
 * NEXT_PUBLIC_INSTAGRAM_URL are environment variables, not DB columns, so
 * they aren't touched here — the settings page only displays their current
 * value read-only. */
export async function updateSettings(formData: FormData): Promise<void> {
  const taglineHtml = requireString(formData, "taglineHtml");
  const historiaP1 = requireString(formData, "historiaP1");
  const historiaP2 = requireString(formData, "historiaP2");
  const ligaNombre = requireString(formData, "ligaNombre").trim();
  const seasonYear = intOrDefault(formData, "seasonYear", 2026);

  const heroVideo = fileOrNull(formData, "heroVideo");
  const pattern = fileOrNull(formData, "pattern");
  const teamCrest = fileOrNull(formData, "teamCrest");

  const heroVideoUrl = heroVideo ? (await saveUploadedFile(heroVideo, "site")).url : undefined;
  const patternUrl = pattern ? (await saveUploadedFile(pattern, "site")).url : undefined;
  const teamCrestUrl = teamCrest ? (await saveUploadedFile(teamCrest, "site")).url : undefined;

  await prisma.siteSettings.upsert({
    where: { id: 1 },
    create: {
      id: 1,
      taglineHtml,
      historiaP1,
      historiaP2,
      ligaNombre,
      seasonYear,
      ...(heroVideoUrl ? { heroVideoUrl } : {}),
      ...(patternUrl ? { patternUrl } : {}),
      ...(teamCrestUrl ? { teamCrestUrl } : {}),
    },
    update: {
      taglineHtml,
      historiaP1,
      historiaP2,
      ligaNombre,
      seasonYear,
      ...(heroVideoUrl ? { heroVideoUrl } : {}),
      ...(patternUrl ? { patternUrl } : {}),
      ...(teamCrestUrl ? { teamCrestUrl } : {}),
    },
  });
  redirect("/admin/settings");
}
