"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireString, intOrDefault, nullableString } from "./util";

/** Edits the SiteSettings singleton (id=1). NEXT_PUBLIC_WHATSAPP_NUMBER is
 * still an environment variable, not a DB column — the settings page only
 * displays its current value read-only. TikTok/Instagram/Gmail links, by
 * contrast, are real editable fields here (the footer icons read them). */
export async function updateSettings(formData: FormData): Promise<void> {
  const taglineHtml = requireString(formData, "taglineHtml");
  const historiaP1 = requireString(formData, "historiaP1");
  const historiaP2 = requireString(formData, "historiaP2");
  const ligaNombre = requireString(formData, "ligaNombre").trim();
  const seasonYear = intOrDefault(formData, "seasonYear", 2026);

  const heroVideoUrl = nullableString(formData, "heroVideoUrl");
  const patternUrl = nullableString(formData, "patternUrl");
  const teamCrestUrl = nullableString(formData, "teamCrestUrl");
  const tiktokUrl = nullableString(formData, "tiktokUrl");
  const instagramUrl = nullableString(formData, "instagramUrl");
  const gmailAddress = nullableString(formData, "gmailAddress");

  await prisma.siteSettings.upsert({
    where: { id: 1 },
    create: {
      id: 1,
      taglineHtml,
      historiaP1,
      historiaP2,
      ligaNombre,
      seasonYear,
      heroVideoUrl,
      patternUrl,
      teamCrestUrl,
      tiktokUrl,
      instagramUrl,
      gmailAddress,
    },
    update: {
      taglineHtml,
      historiaP1,
      historiaP2,
      ligaNombre,
      seasonYear,
      heroVideoUrl,
      patternUrl,
      teamCrestUrl,
      tiktokUrl,
      instagramUrl,
      gmailAddress,
    },
  });
  redirect("/admin/settings");
}
