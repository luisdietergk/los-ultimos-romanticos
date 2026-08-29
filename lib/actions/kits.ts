"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireString, nullableString } from "./util";

export async function updateKit(formData: FormData): Promise<void> {
  const id = requireString(formData, "id");
  const title = requireString(formData, "title").trim();
  const imageUrl = nullableString(formData, "imageUrl");

  await prisma.kitImage.update({
    where: { id },
    data: { title, imageUrl },
  });
  redirect("/admin/kits");
}
