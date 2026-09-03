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
    // Next 16 restricts `quality` props to an explicit allowlist (default
    // just [75]) — any value outside it is silently coerced to the closest
    // allowed one, so a higher-quality image (e.g. SquadMarquee's enlarged
    // player photos) needs its exact value added here to actually take effect.
    qualities: [75, 90],
  },
};

export default nextConfig;
