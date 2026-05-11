import React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import "./cinematic.css"
import { AuthProvider } from "@/lib/auth-context"
import { StripeModeBanner } from "@/components/stripe-mode-banner"
import { CookieConsentBanner } from "@/components/cookie-consent"
import { MinorClientGuard } from "@/components/minors/minor-client-guard"
import { SoundProvider } from "@/components/sound-provider"
import { ResizeObserverFix } from "@/components/resize-observer-fix"
import { ErrorBoundaryClient } from "@/components/error-boundary-client"
import { VersionThemeProvider } from "@/components/version-theme-provider"
import { LanguageProvider } from "@/hooks/use-language"
import { EnglishModeBanner } from "@/components/i18n/english-mode-banner"
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
    <html lang="fr" className="dark" translate="no">
      <head>
        {/* Bloque Google Translate / Bing Translator qui manipulent le DOM
            et provoquent l'erreur React "Failed to execute removeChild on Node" */}
        <meta name="google" content="notranslate" />
      </head>
      <body
        className={`${inter.className} notranslate antialiased bg-slate-950 text-white`}
        suppressHydrationWarning
      >
        <VersionThemeProvider>
          <ResizeObserverFix />
          <ErrorBoundaryClient>
            <StripeModeBanner />
            <AuthProvider>
              <LanguageProvider>
                <EnglishModeBanner />
                <SoundProvider>
                  <MinorClientGuard />
                  {children}
                </SoundProvider>
              </LanguageProvider>
            </AuthProvider>
            <CookieConsentBanner />
          </ErrorBoundaryClient>
          <Analytics />
        </VersionThemeProvider>
      </body>
    </html>
  )
}
