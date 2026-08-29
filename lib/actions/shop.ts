"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { saveUploadedFile } from "@/lib/storage";
import { requireString, requireInt, fileOrNull } from "./util";

export async function updateProduct(formData: FormData): Promise<void> {
  const id = requireString(formData, "id");
  const name = requireString(formData, "name").trim();
  const sizesCsv = requireString(formData, "sizesCsv").trim();
  const priceMxn = requireInt(formData, "priceMxn");
  const description = requireString(formData, "description").trim();

  const photo = fileOrNull(formData, "photo");
  const photoUrl = photo ? (await saveUploadedFile(photo, "shop")).url : undefined;

  await prisma.shopProduct.update({
    where: { id },
    data: {
      name,
      sizesCsv,
      priceMxn,
      description,
      ...(photoUrl ? { photoUrl } : {}),
    },
  });
  redirect("/admin/shop");
}
