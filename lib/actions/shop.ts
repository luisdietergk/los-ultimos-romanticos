"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireString, requireInt, nullableString } from "./util";

// The detail gallery has a fixed number of extra shots beyond the main photo
// (detail1..detail3 form fields — see MediaUploadField usage in the admin
// shop page), matching the reference's 4-thumbnail gallery (main + 3 detail).
const DETAIL_SLOTS = 3;

function readDetailImageUrls(formData: FormData): string[] {
  const urls: string[] = [];
  for (let i = 1; i <= DETAIL_SLOTS; i++) {
    const url = nullableString(formData, `detail${i}`);
    if (url) urls.push(url);
  }
  return urls;
}

export async function updateProduct(formData: FormData): Promise<void> {
  const id = requireString(formData, "id");
  const name = requireString(formData, "name").trim();
  const sizesCsv = requireString(formData, "sizesCsv").trim();
  const priceMxn = requireInt(formData, "priceMxn");
  const description = requireString(formData, "description").trim();
  const photoUrl = nullableString(formData, "photoUrl");
  const detailImageUrls = readDetailImageUrls(formData);

  await prisma.shopProduct.update({
    where: { id },
    data: { name, sizesCsv, priceMxn, description, photoUrl, detailImageUrls },
  });
  redirect("/admin/shop");
}

export async function createProduct(formData: FormData): Promise<void> {
  const name = requireString(formData, "name").trim();
  const sizesCsv = requireString(formData, "sizesCsv").trim();
  const priceMxn = requireInt(formData, "priceMxn");
  const description = requireString(formData, "description").trim();
  const photoUrl = nullableString(formData, "photoUrl");
  const detailImageUrls = readDetailImageUrls(formData);

  // Appends to the end of the shop rack — the rack renders products in
  // sortOrder, so a new one needs a higher value than every existing product.
  const last = await prisma.shopProduct.findFirst({ orderBy: { sortOrder: "desc" } });
  const sortOrder = (last?.sortOrder ?? -1) + 1;

  await prisma.shopProduct.create({
    data: { name, sizesCsv, priceMxn, description, photoUrl, detailImageUrls, sortOrder },
  });
  redirect("/admin/shop");
}
