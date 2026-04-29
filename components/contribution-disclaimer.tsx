import { Info } from "lucide-react"

export function ContributionDisclaimer({ compact = false }: { compact?: boolean }) {
  if (compact) return (
    <p className="text-white/35 text-[10px] flex items-start gap-1"><Info className="h-3 w-3 shrink-0 mt-0.5" />Le gain n&apos;est pas garanti et depend du classement final. Cette contribution n&apos;est pas un investissement au sens de l&apos;AMF.</p>
  )
  return (
    <div className="bg-slate-900/40 border border-white/10 rounded-lg p-3 flex items-start gap-2">
      <Info className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
      <p className="text-white/55 text-xs leading-relaxed">
        <strong className="text-white/75">Information legale.</strong> Votre contribution permet de soutenir un projet creatif.
        Si l&apos;oeuvre se classe dans le <strong>TOP 10 sur 100</strong> a la cloture du cycle, vous recevrez une part des gains
        redistribues (1<sup>er</sup> du mois suivant). Sinon, votre contribution finance le createur sans retour financier.
        <strong> Le gain n&apos;est pas garanti.</strong> Cette contribution n&apos;est pas un investissement financier au sens de l&apos;AMF.
      </p>
    </div>
  )
}
