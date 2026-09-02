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
  // Printables created remotely through HQ live in Supabase Storage rather than
  // in this repo. A `fallback` rewrite only runs when no static file matched, so
  // the printables committed under public/printables keep being served straight
  // from the CDN, and only the ones that aren't there fall through to storage.
  // Both end up at /printables/<slug>.pdf, so the split is invisible to visitors
  // and no printable ever needs a commit or a redeploy.
  async rewrites() {
    return {
      fallback: [
        {
          source: "/printables/:path*",
          destination:
            "https://ruucexzgebbehjcrinhj.supabase.co/storage/v1/object/public/printables/explained-ai-tools/:path*",
        },
      ],
    };
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            // Pragmatic CSP: locks down framing, base-uri, objects, and form
            // targets while allowing the inlined theme <style>, Next hydration
            // scripts, JSON-LD, and Supabase-hosted images/queries the app uses.
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "img-src 'self' data: https://*.supabase.co",
              "script-src 'self' 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline'",
              "font-src 'self' data:",
              "connect-src 'self' https://*.supabase.co",
              "frame-ancestors 'self'",
              "base-uri 'self'",
              "form-action 'self'",
              "object-src 'none'",
              "upgrade-insecure-requests",
            ].join("; "),
          },
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
