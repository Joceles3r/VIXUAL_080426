/**
 * Ecran d'indisponibilite generique pour les pages V3 (ou V2)
 * affichees alors que la plateforme tourne en V1/V2.
 *
 * Utilise comme `fallback` du VersionGuard pour eviter un 404
 * et fournir un message clair a l'utilisateur.
 */

import Link from "next/link"
import { Sparkles } from "lucide-react"

export function VersionUnavailable({
  title = "Module non disponible dans cette version",
  message = "Cette fonctionnalite sera activee dans une version ulterieure de VIXUAL.",
}: {
  title?: string
  message?: string
}) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center bg-slate-950 text-white p-6">
      <div className="max-w-md text-center rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-8">
        <div className="mx-auto mb-4 w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center">
          <Sparkles className="h-6 w-6 text-emerald-300" aria-hidden="true" />
        </div>
        <h1 className="text-xl font-semibold text-balance">{title}</h1>
        <p className="text-white/60 text-sm mt-2 text-pretty">{message}</p>
        <Link
          href="/"
          className="inline-block mt-6 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium transition-colors"
        >
          Retour a l&apos;accueil
        </Link>
      </div>
    </div>
  )
}
