"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { put } from "@vercel/blob/client";

/** File input for admin forms that uploads straight from the browser to
 * Vercel Blob (via /api/admin/upload for the token) instead of sending the
 * file through the page's Server Action — a phone photo or the hero video
 * routinely exceeds Vercel's ~4.5MB serverless request body limit, which no
 * Next.js config can raise, so the file itself can never go through the
 * action. Only the resulting Blob URL (a hidden input the action reads
 * normally) travels through the form submit. */
export function MediaUploadField({
  name,
  category,
  currentUrl,
  accept,
  kind,
  previewClassName,
}: {
  name: string;
  category: string;
  currentUrl: string | null;
  accept: string;
  kind: "image" | "video";
  previewClassName: string;
}) {
  const [url, setUrl] = useState(currentUrl ?? "");
  const [status, setStatus] = useState<"idle" | "uploading" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setStatus("uploading");
    setErrorMsg("");
    const pathname = `${category}/${file.name}`;
    try {
      // Done as two explicit steps (instead of the SDK's all-in-one `upload()`
      // helper) so a failure here shows its *real* reason — `upload()` only
      // ever throws a generic "failed to retrieve token" regardless of what
      // the server actually said, which makes this impossible to diagnose
      // from a user's screenshot alone.
      const tokenRes = await fetch("/api/admin/upload", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          type: "blob.generate-client-token",
          payload: { pathname, clientPayload: null, multipart: false },
        }),
      });
      const tokenBody: { clientToken?: string; error?: string } | null = await tokenRes.json().catch(() => null);
      if (!tokenRes.ok || !tokenBody?.clientToken) {
        throw new Error(tokenBody?.error || `El servidor rechazó la subida (código ${tokenRes.status}).`);
      }

      const blob = await put(pathname, file, { access: "public", token: tokenBody.clientToken });
      setUrl(blob.url);
      setStatus("idle");
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "No se pudo subir el archivo.");
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="flex flex-col items-start gap-2">
      {url ? (
        kind === "video" ? (
          <video src={url} className={previewClassName} controls />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt="" className={previewClassName} />
        )
      ) : (
        <div className={`${previewClassName} bg-neutral-200`} />
      )}
      <input type="hidden" name={name} value={url} />
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        disabled={status === "uploading"}
        className="w-full text-xs"
      />
      {status === "uploading" && <p className="text-xs text-neutral-600">Subiendo…</p>}
      {status === "error" && <p className="text-xs text-red-600">{errorMsg}</p>}
    </div>
  );
}
