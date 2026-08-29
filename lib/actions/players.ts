"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireString, nullableString, intOrDefault } from "./util";

/** Dorsal, name, position, nationality, apodo, quote, description, pj,
 * assists, and photo are all real stored columns — editable here. Goal
 * count is intentionally absent: it's derived from Goal rows (see
 * lib/derived.ts `playerGoalCount`) and shown read-only on the roster list. */
export async function updatePlayer(formData: FormData): Promise<void> {
  const id = requireString(formData, "id");
  const dorsal = requireString(formData, "dorsal").trim();
  const name = requireString(formData, "name").trim();
  const position = requireString(formData, "position").trim();
  const nationality = requireString(formData, "nationality").trim();
  const apodo = nullableString(formData, "apodo");
  const quote = nullableString(formData, "quote");
  const description = nullableString(formData, "description");
  const pj = intOrDefault(formData, "pj", 0);
  const assists = intOrDefault(formData, "assists", 0);

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
      description,
      pj,
      assists,
      photoUrl,
    },
  });
  redirect("/admin/players");
}
