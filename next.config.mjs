/** @type {import('next').NextConfig} */
const nextConfig = {
  // Turbopack configuration for Next.js 16+
  turbopack: {
    root: import.meta.dirname,
  },

  // Production hardening
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,

  // Strip console.* en production (sauf error/warn pour le monitoring)
  compiler: {
    removeConsole:
      process.env.NODE_ENV === "production"
        ? { exclude: ["error", "warn"] }
        : false,
  },

  typescript: {
    // VIXUAL compile à 0 erreur — toute régression doit faire échouer le build
    ignoreBuildErrors: false,
  },

  // ── Images: Bunny.net + Vercel Blob + Unsplash (dev only) ─────────────────

  images: {
    remotePatterns: [
      // CDN principal VIXUAL en production
      {
        protocol: "https",
        hostname: "cdn.bunny.net",
      },
      {
        protocol: "https",
        hostname: "*.b-cdn.net",
      },
      // Vercel Blob (images uploadées via v0/admin)
      {
        protocol: "https",
        hostname: "hebbkx1anhila5yf.public.blob.vercel-storage.com",
      },
      // DEV ONLY — Images mock pour le Labo Tests et le seed homepage.
      // À supprimer dès que tous les contenus passent par Bunny.net.
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: process.env.NODE_ENV === "production" ? 3600 : 60,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // ── Security headers: CSP minimale + cache ────────────────────────────────

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-DNS-Prefetch-Control", value: "on" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self';",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com;",
              "style-src 'self' 'unsafe-inline';",
              "img-src 'self' data: blob: https://cdn.bunny.net https://*.b-cdn.net https://hebbkx1anhila5yf.public.blob.vercel-storage.com https://images.unsplash.com;",
              "connect-src 'self' https://api.stripe.com https://js.stripe.com;",
              "frame-src https://js.stripe.com https://hooks.stripe.com;",
              "font-src 'self' data:;",
              "object-src 'none';",
              "base-uri 'self';",
              "form-action 'self';",
            ].join(" "),
          },
        ],
      },
      {
        source: "/_next/static/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/images/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, stale-while-revalidate=604800",
          },
        ],
      },
      {
        source: "/fonts/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },

  // Experimental features
  experimental: {
    // Optimize package imports
    optimizePackageImports: ["lucide-react", "@radix-ui/react-icons"],
  },
};

export default nextConfig;
