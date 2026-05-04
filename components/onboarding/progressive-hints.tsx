"use client"

import { useEffect, useState } from "react"
import { X, Heart, Upload, Sparkles } from "lucide-react"
import type { VixualRole } from "@/components/navigation"

/**
 * Onboarding progressif V1 :
 * - Affiche un hint discret en bas a droite, en fonction du role courant.
 * - Visiteur => "Tu peux soutenir un projet en cliquant sur le coeur"
 * - Contributeur => "Tu peux aussi creer ton propre projet"
 * - Createur engage => felicitations, plus de hint.
 *
 * Le hint est dismissable et son etat est memorise dans localStorage
 * (cle dediee, jamais utilisee pour de la donnee metier).
 */

type HintKey = "visitor-can-support" | "contributor-can-create" | null

function pickHint(roles: readonly VixualRole[]): HintKey {
  const isCreator = roles.includes("creator") || roles.includes("infoporteur") || roles.includes("podcasteur")
  const isContributor =
    roles.includes("contributor") ||
    roles.includes("contribu_lecteur") ||
    roles.includes("auditeur")

  if (!isCreator && isContributor) return "contributor-can-create"
  if (!isContributor && !isCreator && roles.includes("visitor")) {
    return "visitor-can-support"
  }
  return null
}

export function ProgressiveHints({
  roles,
  show = true,
}: {
  roles: readonly VixualRole[]
  show?: boolean
}) {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    try {
      const raw = localStorage.getItem("vixual:dismissed-hints")
      if (raw) setDismissed(new Set(JSON.parse(raw)))
    } catch {
      // localStorage indispo (SSR ou prive) : pas grave, on n'a rien a restaurer.
    }
  }, [])

  if (!mounted || !show) return null

  const hint = pickHint(roles)
  if (!hint || dismissed.has(hint)) return null

  const config = {
    "visitor-can-support": {
      icon: Heart,
      title: "Tu peux soutenir un projet",
      description: "Clique sur le coeur d'un projet pour l'aider a monter au TOP.",
      color: "text-rose-300",
      bg: "bg-rose-500/10",
      border: "border-rose-500/30",
    },
    "contributor-can-create": {
      icon: Upload,
      title: "Tu peux aussi creer ton propre projet",
      description: "Publie un film ou un projet et recois le soutien de la communaute.",
      color: "text-purple-300",
      bg: "bg-purple-500/10",
      border: "border-purple-500/30",
    },
  }[hint]

  function dismiss() {
    if (!hint) return
    const next = new Set(dismissed)
    next.add(hint)
    setDismissed(next)
    try {
      localStorage.setItem("vixual:dismissed-hints", JSON.stringify(Array.from(next)))
    } catch {
      // pas grave
    }
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed bottom-4 right-4 z-40 max-w-sm rounded-xl border ${config.border} ${config.bg} bg-slate-950/90 backdrop-blur p-4 shadow-2xl shadow-black/40`}
    >
      <button
        onClick={dismiss}
        aria-label="Fermer le conseil"
        className="absolute top-2 right-2 p-1 rounded-md text-white/40 hover:text-white/80 hover:bg-white/5 transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
      <div className="flex items-start gap-3 pr-6">
        <div className={`h-9 w-9 rounded-lg ${config.bg} flex items-center justify-center shrink-0`}>
          <config.icon className={`h-4 w-4 ${config.color}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-semibold text-sm flex items-center gap-1.5 mb-0.5">
            <Sparkles className="h-3.5 w-3.5 text-amber-300" />
            {config.title}
          </p>
          <p className="text-white/60 text-xs leading-relaxed text-pretty">
            {config.description}
          </p>
        </div>
      </div>
    </div>
  )
}
