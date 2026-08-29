"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireString, requireInt, nullableString } from "./util";

export async function updateProduct(formData: FormData): Promise<void> {
  const id = requireString(formData, "id");
  const name = requireString(formData, "name").trim();
  const sizesCsv = requireString(formData, "sizesCsv").trim();
  const priceMxn = requireInt(formData, "priceMxn");
  const description = requireString(formData, "description").trim();
  const photoUrl = nullableString(formData, "photoUrl");

  await prisma.shopProduct.update({
    where: { id },
    data: { name, sizesCsv, priceMxn, description, photoUrl },
  });
  redirect("/admin/shop");
}
