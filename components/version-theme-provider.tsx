"use client"

import { useEffect } from "react"
import { usePlatformVersion } from "@/hooks/use-platform-version"

/**
 * Applique automatiquement l'attribut data-version sur <html>
 * pour activer les variables CSS du theme correspondant.
 *
 * A placer une seule fois dans le layout racine.
 */
export function VersionThemeProvider({ children }: { children: React.ReactNode }) {
  const platformVersion = usePlatformVersion()

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-version", platformVersion)
    }
  }, [platformVersion])

  return <>{children}</>
}
