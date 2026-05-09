/** @type {import('next').NextConfig} */
const nextConfig = {
  // Turbopack configuration for Next.js 16
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

  eslint: {
    // ESLint reste tolérant pendant la phase de stabilisation
    ignoreDuringBuilds: true,
  },

  images: {
    // Enable Next.js image optimization for better LCP
    remotePatterns: [
      // CDN principal VIXUAL (activer lors du branchement Bunny.net)
      {
        protocol: "https",
        hostname: "cdn.bunny.net",
      },
      {
        protocol: "https",
        hostname: "*.b-cdn.net",
      },
      // DEV ONLY — Images mock pour le Labo Tests et le seed homepage.
      // À supprimer dès que tous les contenus passent par Bunny.net.
      // Ne PAS retirer avant migration des mock-data vers du contenu réel.
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60,
  },

  // Security headers (additional to middleware)
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-DNS-Prefetch-Control", value: "on" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
        ],
      },
    ];
  },

  // Experimental features
  experimental: {
    // Optimize package imports
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },
};

export default nextConfig;
