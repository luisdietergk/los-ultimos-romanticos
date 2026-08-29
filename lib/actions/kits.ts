"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { saveUploadedFile } from "@/lib/storage";
import { requireString, fileOrNull } from "./util";

export async function updateKit(formData: FormData): Promise<void> {
  const id = requireString(formData, "id");
  const title = requireString(formData, "title").trim();

  const image = fileOrNull(formData, "image");
  const imageUrl = image ? (await saveUploadedFile(image, "kits")).url : undefined;

  await prisma.kitImage.update({
    where: { id },
    data: {
      title,
      ...(imageUrl ? { imageUrl } : {}),
    },
  });
  redirect("/admin/kits");
}
