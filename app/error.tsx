"use client"

/**
 * Fallback dedie pour la homepage.
 * Si le rendu de page.tsx ou ses children echoue,
 * Next.js monte ce composant a la place — la navigation reste
 * disponible (header/footer toujours dans le layout parent).
 *
 * Promesse : ne jamais afficher une page blanche cote utilisateur.
 */

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { AlertTriangle, RefreshCw, Home as HomeIcon } from "lucide-react"
import { useEffect } from "react"

export default function HomepageError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("[v0] Homepage rendering error", error)
  }, [error])

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="h-8 w-8 text-amber-400" />
        </div>
        <h1 className="text-3xl font-bold mb-3 text-balance">
          La page d&apos;accueil rencontre un probleme
        </h1>
        <p className="text-white/60 mb-8 leading-relaxed text-pretty">
          Nos equipes ont ete notifiees automatiquement. En attendant, vous pouvez explorer le reste de la plateforme.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={reset}
            className="bg-amber-500 hover:bg-amber-600 text-black font-bold"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Reessayer
          </Button>
          <Link href="/explore">
            <Button variant="outline" className="bg-white/[0.03] border-white/15 text-white hover:bg-white/10">
              <HomeIcon className="h-4 w-4 mr-2" />
              Explorer les projets
            </Button>
          </Link>
        </div>

        {error.digest && (
          <p className="text-xs text-white/30 mt-6 font-mono">
            Code: {error.digest}
          </p>
        )}
      </div>
    </div>
  )
}
