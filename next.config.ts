import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Serve modern, much smaller formats. AVIF is tried first, WebP as fallback.
    // This is the single biggest LCP win for post hero images.
    formats: ["image/avif", "image/webp"],
    // Blog images are effectively immutable, so cache optimized variants for a
    // week to avoid re-optimizing on every cold cache.
    minimumCacheTTL: 604800,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
