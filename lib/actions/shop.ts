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

export async function createProduct(formData: FormData): Promise<void> {
  const name = requireString(formData, "name").trim();
  const sizesCsv = requireString(formData, "sizesCsv").trim();
  const priceMxn = requireInt(formData, "priceMxn");
  const description = requireString(formData, "description").trim();
  const photoUrl = nullableString(formData, "photoUrl");

  // Appends to the end of the shop rack — the rack renders products in
  // sortOrder, so a new one needs a higher value than every existing product.
  const last = await prisma.shopProduct.findFirst({ orderBy: { sortOrder: "desc" } });
  const sortOrder = (last?.sortOrder ?? -1) + 1;

  await prisma.shopProduct.create({
    data: { name, sizesCsv, priceMxn, description, photoUrl, sortOrder },
  });
  redirect("/admin/shop");
}
