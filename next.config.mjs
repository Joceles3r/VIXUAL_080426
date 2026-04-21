/** @type {import('next').NextConfig} */
const nextConfig = {
  // Turbopack configuration for Next.js 16
  turbopack: {
    root: import.meta.dirname,
  },

  typescript: {
    // Ignore TypeScript errors during build - fix progressively
    ignoreBuildErrors: true,
  },

  eslint: {
    // Ignore ESLint errors during build
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
      // Images de développement uniquement — supprimer en production
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
    formats: ["image/avif", "image/webp"],
  },

  // Security headers (additional to middleware)
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-DNS-Prefetch-Control", value: "on" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
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
