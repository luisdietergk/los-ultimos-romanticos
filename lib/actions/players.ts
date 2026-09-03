"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireString, nullableString, intOrDefault } from "./util";

/** Dorsal, name, position, nationality, apodo, quote, pj, and photo are all
 * real stored columns — editable here. Goals and assists are intentionally
 * absent: both are derived from Goal rows (see lib/derived.ts
 * `playerGoalCount`/`playerAssistCount`) and shown read-only on the roster
 * list — a goal's scorer and assist are set from the shot-map editor.
 * `description` is no longer edited here — the public profile only shows
 * the quote now — but stays untouched in the database. */
export async function updatePlayer(formData: FormData): Promise<void> {
  const id = requireString(formData, "id");
  const dorsal = requireString(formData, "dorsal").trim();
  const name = requireString(formData, "name").trim();
  const position = requireString(formData, "position").trim();
  const nationality = requireString(formData, "nationality").trim();
  const apodo = nullableString(formData, "apodo");
  const quote = nullableString(formData, "quote");
  const pj = intOrDefault(formData, "pj", 0);

  const photoUrl = nullableString(formData, "photoUrl");

  await prisma.player.update({
    where: { id },
    data: {
      dorsal,
      name,
      position,
      nationality,
      apodo,
      quote,
      pj,
      photoUrl,
    },
  });
  redirect("/admin/players");
}
