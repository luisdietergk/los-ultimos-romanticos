import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Admin-uploaded photos/video now live on Vercel Blob (an external host),
    // not under public/ — next/image refuses to optimize any external URL
    // whose host isn't explicitly allowed here, so without this every one of
    // those images renders as a broken image on the public site.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.public.blob.vercel-storage.com",
      },
    ],
  },
};

export default nextConfig;
