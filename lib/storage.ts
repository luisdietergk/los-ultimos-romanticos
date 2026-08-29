// Local filesystem-backed asset storage for this sandbox (no Vercel Blob /
// S3 credentials available here). Files land in public/uploads/<category>/
// and are served by Next.js's static file handling, so callers get back a
// plain URL exactly as they would from a real object-storage `put()` call.
//
// To move to production storage: replace the body of `saveAsset` with a
// call to e.g. `@vercel/blob`'s `put()` (returning its public URL instead of
// writing to disk) — every call site only depends on this function's
// signature, not on the filesystem.

import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";

const UPLOAD_ROOT = path.join(process.cwd(), "public", "uploads");

export interface StoredAsset {
  url: string;
}

export async function saveAsset(buffer: Buffer, category: string, filename: string): Promise<StoredAsset> {
  const safeCategory = category.replace(/[^a-z0-9-_]/gi, "");
  const safeFilename = filename.replace(/[^a-z0-9.\-_]/gi, "");
  const dir = path.join(UPLOAD_ROOT, safeCategory);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, safeFilename), buffer);
  return { url: `/uploads/${safeCategory}/${safeFilename}` };
}

function extFromMime(mime: string): string {
  if (mime.includes("webp")) return ".webp";
  if (mime.includes("png")) return ".png";
  if (mime.includes("jpeg") || mime.includes("jpg")) return ".jpg";
  if (mime.includes("gif")) return ".gif";
  if (mime.includes("mp4")) return ".mp4";
  return "";
}

/** Used by admin upload forms: takes a browser File from FormData, writes it
 * under a random name in the given category, returns its public URL. */
export async function saveUploadedFile(file: File, category: string): Promise<StoredAsset> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const ext = path.extname(file.name) || extFromMime(file.type);
  const filename = `${crypto.randomUUID()}${ext}`;
  return saveAsset(buffer, category, filename);
}

/** Used by the one-time seed script: decodes a `data:<mime>;base64,...` URI
 * (the format `.image-slots.state.json` stores) into a real file. */
export async function saveDataUri(dataUri: string, category: string, filename: string): Promise<StoredAsset> {
  const match = /^data:([^;]+);base64,([\s\S]*)$/.exec(dataUri);
  if (!match) throw new Error("Not a base64 data URI");
  const buffer = Buffer.from(match[2], "base64");
  return saveAsset(buffer, category, filename);
}
