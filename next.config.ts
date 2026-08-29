import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Next.js caps Server Action request bodies at 1MB by default, which
      // is why admin photo/video uploads (shop, players, kits, hero video)
      // were failing outright — a typical phone photo alone is well over
      // that. Raised to just under Vercel's own ~4.5MB serverless request
      // body ceiling (a separate, platform-level limit this setting can't
      // override) — this admin panel is auth-gated to 1-2 trusted users,
      // not public, so a generous limit here isn't a real DoS risk. A
      // photo/video bigger than ~4MB still needs a direct-to-Blob upload
      // flow instead of this Server Action path — flag it if that comes up.
      bodySizeLimit: "4mb",
    },
  },
};

export default nextConfig;
