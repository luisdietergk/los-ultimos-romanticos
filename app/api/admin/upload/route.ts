import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

// Backs the admin panel's direct-to-Blob uploads (components/admin/MediaUploadField.tsx).
// The browser talks to this route only to get a short-lived upload token — the
// actual photo/video bytes go straight from the browser to Vercel Blob, never
// through this server function, which is what lets uploads exceed Vercel's
// ~4.5MB serverless request body ceiling (a phone photo/video routinely does).
export async function POST(request: Request): Promise<NextResponse> {
  // Everything (including the auth check) is inside this try/catch so any
  // failure reason — missing session, a Blob config problem, whatever — comes
  // back as real JSON the client can read, instead of surfacing as an
  // unhandled 500 with no body.
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = (await request.json()) as HandleUploadBody;
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: ["image/*", "video/*"],
        addRandomSuffix: true,
      }),
    });
    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "No se pudo generar el token de subida." },
      { status: 400 }
    );
  }
}
