import React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { AuthProvider } from "@/lib/auth-context"
import { StripeModeBanner } from "@/components/stripe-mode-banner"
import { CookieConsentBanner } from "@/components/cookie-consent"
import { MinorClientGuard } from "@/components/minors/minor-client-guard"
import { SoundProvider } from "@/components/sound-provider"
import { ResizeObserverFix } from "@/components/resize-observer-fix"
import { ErrorBoundary } from "@/components/error-boundary"
import { APP_NAME, APP_DESCRIPTION } from "@/lib/branding"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: `${APP_NAME} - Contribution Participative Audiovisuel, Litteraire & Podcast`,
  description: APP_DESCRIPTION,
  generator: "v0.app",
  keywords: [
    "contribution participative",
    "audiovisuel",
    "litteraire",
    "podcast",
    "createurs",
    "streaming",
    "regarde participe gagne",
  ],
}

export const viewport: Viewport = {
  themeColor: "#0f172a",
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr" className="dark">
      <body className={`${inter.className} antialiased bg-slate-950 text-white`}>
        <ResizeObserverFix />
        <ErrorBoundary
          onError={(error, errorInfo) => {
            // Log to external service in production (Sentry, LogRocket, etc.)
            if (process.env.NODE_ENV === "production") {
              console.error("[VIXUAL] Global error:", error.message);
              // TODO: Send to error tracking service
            }
          }}
        >
          <StripeModeBanner />
          <AuthProvider>
            <SoundProvider>
              <MinorClientGuard />
              {children}
            </SoundProvider>
          </AuthProvider>
          <CookieConsentBanner />
        </ErrorBoundary>
        <Analytics />
      </body>
    </html>
  )
}
