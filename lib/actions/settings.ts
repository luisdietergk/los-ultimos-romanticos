"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireString, intOrDefault, nullableString } from "./util";

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

  const heroVideoUrl = nullableString(formData, "heroVideoUrl");
  const patternUrl = nullableString(formData, "patternUrl");
  const teamCrestUrl = nullableString(formData, "teamCrestUrl");

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
    },
  });
  redirect("/admin/settings");
}
