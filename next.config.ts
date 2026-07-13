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

  // Collapse the apex -> www redirect into a single hop. www is the canonical
  // host (see siteConfig.domain); any request that reaches this app on the bare
  // apex is 308-redirected straight to the www origin.
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "topuseai.com" }],
        destination: "https://www.topuseai.com/:path*",
        permanent: true,
      },
    ];
  },

  // Security + SEO response headers for every route. Hardens the site (HSTS,
  // MIME-sniffing, clickjacking, referrer/permissions) without a strict CSP,
  // which would risk breaking the inlined theme <style> and third-party embeds.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
          },
          { key: "X-DNS-Prefetch-Control", value: "on" },
        ],
      },
    ];
  },
};

export default nextConfig;
