"use client"

import { Info } from "lucide-react"
import { usePlatformVersion } from "@/hooks/use-platform-version"

export function ContributionDisclaimer({ compact = false }: { compact?: boolean }) {
  const platformVersion = usePlatformVersion()

  if (compact) {
    return (
      <p className="text-white/35 text-[10px] flex items-start gap-1">
        <Info className="h-3 w-3 shrink-0 mt-0.5" />
        {platformVersion === "V1"
          ? "Les soutiens servent avant tout a aider les createurs. Certaines participations peuvent etre recompensees selon les regles officielles VIXUAL."
          : "Les soutiens servent avant tout a aider les createurs. Certaines participations peuvent etre recompensees selon les regles officielles VIXUAL. Ce n'est pas un produit d'investissement au sens de l'AMF."}
      </p>
    )
  }

  return (
    <div className="bg-slate-900/40 border border-white/10 rounded-lg p-3 flex items-start gap-2">
      <Info className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
      <p className="text-white/55 text-xs leading-relaxed">
        <strong className="text-white/75">Information.</strong> Votre soutien permet d&apos;aider directement un createur a developper son projet.
        Certaines participations peuvent etre recompensees selon les regles officielles VIXUAL : si l&apos;oeuvre se classe
        dans le <strong>TOP 10 sur 100</strong> a la cloture du cycle, vous recevez une part des gains redistribues
        (1<sup>er</sup> du mois suivant). Sinon, votre soutien finance le createur sans retour financier.
        <strong> Aucun gain n&apos;est garanti.</strong> Ce n&apos;est pas un produit d&apos;investissement au sens de l&apos;AMF.
      </p>
    </div>
  )
}
