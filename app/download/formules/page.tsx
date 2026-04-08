"use client"

import { FileDown, FileText, CheckCircle2, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { VisualSlogan } from "@/components/visual-slogan"

export default function DownloadFormulesPage() {
  const fileName = "VISUAL_Formules_Repartitions_V2.fodt"
  const fileUrl = `/${fileName}`

  return (
    <main className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white/80 transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          {"Retour à l'accueil"}
        </Link>

        <div className="bg-slate-900/70 border border-white/10 rounded-2xl p-8 cinema-panel">
          {/* Icon + Slogan */}
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <FileText className="h-8 w-8 text-emerald-400" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-white text-center mb-2">
            Document des Formules
          </h1>
          <div className="text-center mb-2">
            <VisualSlogan size="xs" opacity="medium" />
          </div>
          <p className="text-white/50 text-center text-sm mb-8">
            {"Répartitions complètes des gains VISUAL V2"}
          </p>

          {/* File info */}
          <div className="bg-slate-800/50 rounded-xl p-4 mb-6 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/40">Fichier</span>
              <span className="text-white font-mono text-xs">{fileName}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/40">Format</span>
              <span className="text-white">Flat ODT (LibreOffice / Word / Google Docs)</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/40">Date</span>
              <span className="text-white">20 fevrier 2026</span>
            </div>
          </div>

          {/* Content summary */}
          <div className="mb-8 space-y-2">
            <p className="text-xs text-white/30 uppercase tracking-wider font-semibold mb-3">
              Contenu du document
            </p>
            {[
              "8 profils : Invite, Visiteur, Porteur, Infoporteur, Podcasteur, Contributeur, Contribu-lecteur, Auditeur",
              "Films/Videos/Docs : 40 / 30 / 7 / 23",
              "Voix de l'Info : vente 70/30 + pot mensuel 60/40",
              "Livres : vente 70/30 + pot mensuel 60/40",
              "Podcasts : vente 70/30 + pot mensuel 40/30/20/10",
              "Baremes votes, VIXUpoints, cautions, quotas createurs",
            ].map((item) => (
              <div key={item} className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
                <span className="text-sm text-white/70">{item}</span>
              </div>
            ))}
          </div>

          {/* Download button */}
          <a
            href={fileUrl}
            download={fileName}
            className="flex items-center justify-center gap-3 w-full py-4 px-6 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl transition-colors text-base"
          >
            <FileDown className="h-5 w-5" />
            Telecharger le document (.fodt)
          </a>

          <p className="text-xs text-white/30 text-center mt-4">
            Ouvrez ce fichier avec LibreOffice, Microsoft Word ou Google Docs.
            <br />
            Vous pouvez le re-enregistrer en .odt ou .docx depuis ces logiciels.
          </p>
        </div>
      </div>
    </main>
  )
}
