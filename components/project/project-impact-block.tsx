"use client"

import { Film, Target, Sparkles } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

/**
 * Bloc emotionnel V1 affiche sur les fiches projets.
 *
 * Objectif (V1.1 Human Impact & Participation Clarity) :
 *   - donner un impact concret et humain au soutien,
 *   - presenter la progression communautaire sans vocabulaire financier,
 *   - humaniser les createurs via un objectif actuel clair.
 *
 * Aucune mention de rentabilite, ROI ou rendement : la jauge est
 * volontairement nommee "Progression du projet".
 *
 * Compose de trois sous-blocs emotionnels :
 *   1. Impact du soutien (a quoi sert l'argent)
 *   2. Progression du projet (jauge communautaire)
 *   3. Objectif actuel du createur
 */

export interface ProjectImpactBlockProps {
  /** Pourcentage de progression du projet (0-100). */
  progressPercent: number
  /** Nombre de soutiens recus (affichage qualitatif uniquement). */
  supportersCount?: number
  /**
   * Objectif actuel du createur (texte court).
   * Exemples : "Finaliser le montage du documentaire",
   * "Achat du materiel audio", "Production du podcast", etc.
   */
  creatorObjective?: string
  /**
   * Categorie du contenu (utilisee pour adapter les exemples d'usage du soutien).
   * Defaut : "video".
   */
  category?: "video" | "audio" | "book" | "podcast"
  className?: string
}

const IMPACT_EXAMPLES: Record<NonNullable<ProjectImpactBlockProps["category"]>, string> = {
  video: "tournage, montage, materiel, diffusion ou production",
  audio: "enregistrement, mixage, materiel ou diffusion",
  book: "ecriture, edition, illustration ou diffusion",
  podcast: "enregistrement, montage audio, materiel ou diffusion",
}

export function ProjectImpactBlock({
  progressPercent,
  supportersCount,
  creatorObjective,
  category = "video",
  className = "",
}: ProjectImpactBlockProps) {
  const safePercent = Math.max(0, Math.min(100, Math.round(progressPercent)))
  const impactDetail = IMPACT_EXAMPLES[category]

  return (
    <div className={`space-y-4 ${className}`}>
      {/* 1. Impact du soutien */}
      <Card className="bg-gradient-to-br from-rose-500/10 to-fuchsia-500/10 border-rose-500/25">
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-9 w-9 rounded-lg bg-rose-500/15 border border-rose-500/30 flex items-center justify-center">
              <Film className="h-4 w-4 text-rose-300" />
            </div>
            <h3 className="text-white font-semibold text-sm">
              Impact du soutien
            </h3>
          </div>
          <p className="text-white/75 text-sm leading-relaxed">
            Chaque soutien aide ce projet a evoluer concretement&nbsp;:{" "}
            <span className="text-white/90">{impactDetail}</span>.
          </p>
        </CardContent>
      </Card>

      {/* 2. Progression du projet (jauge communautaire) */}
      <Card className="bg-slate-900/40 border-white/10">
        <CardContent className="p-5 space-y-3">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-lg bg-fuchsia-500/15 border border-fuchsia-500/30 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-fuchsia-300" />
            </div>
            <h3 className="text-white font-semibold text-sm flex-1">
              Progression du projet
            </h3>
            <span className="text-fuchsia-200 font-bold text-sm tabular-nums">
              {safePercent}%
            </span>
          </div>

          <Progress value={safePercent} className="h-3 bg-slate-800" />

          <p className="text-xs text-white/60 leading-relaxed">
            {supportersCount && supportersCount > 0 ? (
              <>
                Grace aux soutiens de{" "}
                <span className="text-white/85 font-medium">
                  {supportersCount.toLocaleString("fr-FR")}{" "}
                  {supportersCount > 1 ? "membres" : "membre"}
                </span>{" "}
                de la communaute VIXUAL.
              </>
            ) : (
              <>Grace aux soutiens de la communaute VIXUAL.</>
            )}
          </p>
        </CardContent>
      </Card>

      {/* 3. Objectif actuel du createur (humanisation) */}
      {creatorObjective && (
        <Card className="bg-amber-500/5 border-amber-500/25">
          <CardContent className="p-5">
            <div className="flex items-start gap-3">
              <div className="h-9 w-9 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shrink-0">
                <Target className="h-4 w-4 text-amber-300" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-semibold text-sm mb-1">
                  Objectif actuel
                </h3>
                <p className="text-white/75 text-sm leading-relaxed">
                  {creatorObjective}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
