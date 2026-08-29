// Asset storage for admin uploads (photos, kit images, hero video, etc.).
//
// Uses Vercel Blob when a token is configured (BLOB_READ_WRITE_TOKEN — set
// automatically once a Blob store is attached to a Vercel project), and
// falls back to writing into public/uploads/<category>/ for local dev
// (there's no Blob store to talk to on a laptop, and Next.js already
// serves public/ as static files, so a local URL works the same way a
// Blob URL would from every call site's point of view).

import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";

export interface StoredAsset {
  url: string;
}

function extFromMime(mime: string): string {
  if (mime.includes("webp")) return ".webp";
  if (mime.includes("png")) return ".png";
  if (mime.includes("jpeg") || mime.includes("jpg")) return ".jpg";
  if (mime.includes("gif")) return ".gif";
  if (mime.includes("mp4")) return ".mp4";
  return "";
}

async function saveLocal(buffer: Buffer, category: string, filename: string): Promise<StoredAsset> {
  const safeCategory = category.replace(/[^a-z0-9-_]/gi, "");
  const safeFilename = filename.replace(/[^a-z0-9.\-_]/gi, "");
  const dir = path.join(process.cwd(), "public", "uploads", safeCategory);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, safeFilename), buffer);
  return { url: `/uploads/${safeCategory}/${safeFilename}` };
}

async function saveToBlob(buffer: Buffer, category: string, filename: string, contentType?: string): Promise<StoredAsset> {
  const { put } = await import("@vercel/blob");
  const blob = await put(`${category}/${filename}`, buffer, {
    access: "public",
    addRandomSuffix: false,
    contentType,
  });
  return { url: blob.url };
}

export async function saveAsset(buffer: Buffer, category: string, filename: string, contentType?: string): Promise<StoredAsset> {
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    return saveToBlob(buffer, category, filename, contentType);
  }
  return saveLocal(buffer, category, filename);
}

/** Used by admin upload forms: takes a browser File from FormData, writes it
 * under a random name in the given category, returns its public URL. */
export async function saveUploadedFile(file: File, category: string): Promise<StoredAsset> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const ext = path.extname(file.name) || extFromMime(file.type);
  const filename = `${crypto.randomUUID()}${ext}`;
  return saveAsset(buffer, category, filename, file.type || undefined);
}
