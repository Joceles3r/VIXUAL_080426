/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Errors should be fixed progressively - set to false for production
    ignoreBuildErrors: false,
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
      // NE PAS ajouter hebbkx1anhila5yf.public.blob.vercel-storage.com
      // Toutes les images pédagogiques doivent être dans /public/images/
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
    ]
  },
}

export default nextConfig
