"use client"

import { Eye, Heart, Users, Sparkles } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

/**
 * Module "Comprendre VIXUAL en 30 secondes".
 * Affiche par defaut sur la home V1 pour dissiper toute confusion.
 *
 * 4 etapes simples (V1 simplification & first contact UX) :
 *   1. Tu regardes des contenus creatifs
 *   2. Tu soutiens les createurs que tu apprecies
 *   3. Tu aides les projets a evoluer
 *   4. Tu participes a une communaute creative
 *
 * Aucune mention de TOP 100, de cycles, de coefficients ou de gains :
 * vocabulaire emotionnel et humain uniquement. La logique financiere
 * detaillee reste reservee a V2 / V3.
 */
export function QuickExplainer({
  className = "",
}: {
  className?: string
}) {
  const steps = [
    {
      icon: Eye,
      title: "Tu regardes des contenus creatifs",
      description: "Films, ecrits, podcasts. Acces libre, sans inscription.",
      color: "text-fuchsia-300",
      bg: "bg-fuchsia-500/10",
      border: "border-fuchsia-500/30",
    },
    {
      icon: Heart,
      title: "Tu soutiens les createurs que tu apprecies",
      description: "Tu choisis le projet, tu choisis le montant.",
      color: "text-rose-300",
      bg: "bg-rose-500/10",
      border: "border-rose-500/30",
    },
    {
      icon: Sparkles,
      title: "Tu aides les projets a evoluer",
      description: "Chaque soutien aide directement un createur a continuer.",
      color: "text-amber-300",
      bg: "bg-amber-500/10",
      border: "border-amber-500/30",
    },
    {
      icon: Users,
      title: "Tu rejoins une communaute creative",
      description: "Decouvre, partage, encourage les talents independants.",
      color: "text-emerald-300",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/30",
    },
  ]

  return (
    <section className={`py-16 ${className}`}>
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-fuchsia-500/10 border border-fuchsia-500/30 text-fuchsia-300 text-xs font-medium mb-4">
              Comprendre VIXUAL en 30 secondes
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-white text-balance mb-3">
              Comment fonctionne VIXUAL ?
            </h2>
            <p className="text-white/60 text-base md:text-lg max-w-2xl mx-auto text-pretty">
              Une plateforme creative ou tes soutiens font la difference.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {steps.map((step, i) => (
              <Card
                key={step.title}
                className={`bg-slate-900/60 ${step.border} hover:bg-slate-900/80 transition-colors`}
              >
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className={`h-10 w-10 rounded-lg ${step.bg} flex items-center justify-center shrink-0`}
                    >
                      <step.icon className={`h-5 w-5 ${step.color}`} />
                    </div>
                    <span className="text-white/40 text-sm font-mono tabular-nums">
                      0{i + 1}
                    </span>
                  </div>
                  <h3 className="text-white font-semibold text-base mb-1.5 text-balance">
                    {step.title}
                  </h3>
                  <p className="text-white/55 text-sm leading-relaxed text-pretty">
                    {step.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <p className="text-center text-white/45 text-sm mt-8 italic max-w-md mx-auto leading-relaxed">
            Certaines participations peuvent egalement etre recompensees selon
            les regles officielles VIXUAL.
          </p>
        </div>
      </div>
    </section>
  )
}
