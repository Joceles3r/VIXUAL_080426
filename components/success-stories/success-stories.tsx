"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Quote, Film, BookOpen, Mic, CheckCircle2 } from "lucide-react"

/**
 * Module "Success Stories" — humanise VIXUAL en mettant en avant
 * la dimension creative et le lien direct entre soutien et creation.
 *
 * V1.1 : chaque story expose desormais un resultat concret et une
 * progression visible pour renforcer l'impact emotionnel et la
 * credibilite communautaire.
 *
 * Compatible V1 / V2 / V3. Volontairement simple, emotionnel, sans
 * chiffres financiers ni jargon. Les temoignages sont des compositions
 * editoriales representatives (pas des donnees personnelles reelles).
 */

type Story = {
  id: string
  category: "video" | "book" | "podcast"
  title: string
  quote: string
  author: string
  /** Resultat concret du projet (V1.1 humanisation). */
  result: string
  /** Progression visible du projet en pourcentage (0-100). */
  progress: number
}

const STORIES: Story[] = [
  {
    id: "court-metrage",
    category: "video",
    title: "Un court-metrage finalise grace a la communaute",
    quote:
      "Sans les soutiens recus sur VIXUAL, nous n'aurions jamais pu finir le montage. Aujourd'hui le film tourne en festival.",
    author: "Realisatrice independante",
    result: "Diffuse en festival - tournee en cours",
    progress: 100,
  },
  {
    id: "podcast-doc",
    category: "podcast",
    title: "Une serie audio documentaire enfin produite",
    quote:
      "La communaute VIXUAL a cru au projet avant tout le monde. Chaque soutien nous a aide a continuer, episode apres episode.",
    author: "Podcasteur",
    result: "8 episodes publies - saison 2 en preparation",
    progress: 92,
  },
  {
    id: "premier-roman",
    category: "book",
    title: "Un premier roman publie en independant",
    quote:
      "J'ecrivais ce livre depuis des annees. Le soutien direct des lecteurs sur VIXUAL m'a permis de le finaliser et de le publier.",
    author: "Autrice",
    result: "Roman publie - 3 800 lecteurs touches",
    progress: 100,
  },
]

const CATEGORY_META = {
  video: {
    icon: Film,
    label: "Film",
    color: "fuchsia",
    border: "border-fuchsia-500/30",
    bg: "bg-fuchsia-500/8",
    iconBg: "bg-fuchsia-500/15 border-fuchsia-500/30",
    iconColor: "text-fuchsia-300",
  },
  book: {
    icon: BookOpen,
    label: "Livre",
    color: "amber",
    border: "border-amber-500/30",
    bg: "bg-amber-500/8",
    iconBg: "bg-amber-500/15 border-amber-500/30",
    iconColor: "text-amber-300",
  },
  podcast: {
    icon: Mic,
    label: "Podcast",
    color: "teal",
    border: "border-teal-500/30",
    bg: "bg-teal-500/8",
    iconBg: "bg-teal-500/15 border-teal-500/30",
    iconColor: "text-teal-300",
  },
} as const

export function SuccessStories() {
  return (
    <section className="py-16 bg-slate-950">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3 text-balance">
            Projets soutenus par la communaute
          </h2>
          <p className="text-white/60 leading-relaxed">
            Chaque soutien aide directement des createurs a concretiser leurs projets :
            films, podcasts, livres et contenus independants.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto">
          {STORIES.map((story) => {
            const meta = CATEGORY_META[story.category]
            const Icon = meta.icon
            return (
              <Card
                key={story.id}
                className={`${meta.bg} ${meta.border} flex flex-col`}
              >
                <CardContent className="p-6 flex flex-col h-full">
                  <div className="flex items-center gap-2 mb-4">
                    <div
                      className={`h-9 w-9 rounded-lg border flex items-center justify-center ${meta.iconBg}`}
                    >
                      <Icon className={`h-4 w-4 ${meta.iconColor}`} />
                    </div>
                    <span className="text-xs uppercase tracking-wider text-white/50 font-medium">
                      {meta.label}
                    </span>
                  </div>

                  <h3 className="text-base font-semibold text-white mb-3 leading-snug">
                    {story.title}
                  </h3>

                  <Quote className="h-4 w-4 text-white/30 mb-2" />
                  <p className="text-white/75 text-sm italic leading-relaxed mb-4 flex-1">
                    &ldquo;{story.quote}&rdquo;
                  </p>

                  {/* Resultat concret - V1.1 humanisation */}
                  <div className={`flex items-start gap-2 px-3 py-2.5 rounded-lg border ${meta.iconBg} mb-3`}>
                    <CheckCircle2 className={`h-4 w-4 ${meta.iconColor} shrink-0 mt-0.5`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] uppercase tracking-wider text-white/50 font-medium mb-0.5">
                        Resultat concret
                      </p>
                      <p className="text-white/85 text-xs leading-snug">
                        {story.result}
                      </p>
                    </div>
                  </div>

                  {/* Progression visible - V1.1 jauge communautaire */}
                  <div className="space-y-1.5 mb-3">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-white/55">Progression du projet</span>
                      <span className={`${meta.iconColor} font-semibold tabular-nums`}>
                        {story.progress}%
                      </span>
                    </div>
                    <Progress value={story.progress} className="h-1.5 bg-slate-800" />
                  </div>

                  <p className="text-white/50 text-xs">
                    &mdash; {story.author}
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <p className="text-center text-white/45 text-xs mt-8 max-w-xl mx-auto leading-relaxed">
          Temoignages representatifs. Chaque soutien compte pour les createurs independants.
        </p>
      </div>
    </section>
  )
}
