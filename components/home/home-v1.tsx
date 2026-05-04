"use client"

import Link from "next/link"
import {
  ArrowRight,
  Eye,
  Heart,
  Upload,
  Compass,
  LogIn,
  Shield,
  ChevronRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { VisualHeader } from "@/components/vixual-header"
import { Footer } from "@/components/footer"
import { VisualSlogan } from "@/components/vixual-slogan"
import { ContentCard } from "@/components/content-card"
import { TrafficLight } from "@/components/traffic-light"
import { QuickExplainer } from "@/components/onboarding/quick-explainer"
import { ProgressiveHints } from "@/components/onboarding/progressive-hints"
import { useAuth } from "@/lib/auth-context"
import { ALL_CONTENTS } from "@/lib/mock-data"

/**
 * Page d'accueil V1 simplifiee.
 *
 * Principes :
 *  - Compréhension en moins de 10 secondes.
 *  - Aucun choix de profil au demarrage.
 *  - 3 actions universelles : Regarder / Soutenir / Creer.
 *  - Vocabulaire grand public : "soutenir", "participer", "gagner".
 *  - Bandeau de rassurance permanent.
 *  - Onboarding progressif via hints contextuels.
 *
 * V2 / V3 ne passent JAMAIS par ce composant : leur layout reste
 * inchange dans `app/page.tsx`.
 */
const FEATURED_CONTENTS = ALL_CONTENTS.slice(0, 4)

export function HomeV1() {
  const { roles, isAuthed } = useAuth()

  return (
    <div className="min-h-screen bg-slate-950">
      <VisualHeader />

      <main>
        {/* HERO V1 — clair, rassurant, 3 CTA */}
        <section className="relative pt-32 pb-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-fuchsia-900/15 via-slate-950 to-slate-950" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-fuchsia-500/10 rounded-full blur-3xl" />

          <div className="container mx-auto px-4 relative">
            <div className="max-w-3xl mx-auto text-center">
              <div className="flex items-center justify-center gap-4 mb-6">
                <TrafficLight size="lg" className="hidden sm:flex" />
                <h1
                  className="text-4xl md:text-6xl font-bold text-white text-balance"
                  style={{
                    textShadow:
                      "0 0 12px rgba(217, 70, 239, 0.18), 0 0 24px rgba(217, 70, 239, 0.08)",
                  }}
                >
                  Contribuez aux{" "}
                  <span
                    className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-300 to-purple-300"
                    style={{
                      filter:
                        "drop-shadow(0 0 4px rgba(217, 70, 239, 0.15))",
                    }}
                  >
                    talents de demain
                  </span>
                </h1>
                <TrafficLight size="lg" className="hidden sm:flex" />
              </div>

              <div className="mb-4">
                <VisualSlogan size="base" opacity="high" withLines />
              </div>

              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-fuchsia-500/10 border border-fuchsia-500/30 text-fuchsia-200 text-xs font-medium vx-pulse mb-6">
                Phase de lancement - 4 profils essentiels, activation automatique
              </span>

              <p className="text-xl text-white/75 mb-8 max-w-2xl mx-auto text-pretty leading-relaxed">
                VIXUAL est la premiere plateforme participative pour soutenir
                les talents de demain. Tu regardes, tu choisis, tu participes.
              </p>

              {/* 3 CTA universels - aucune notion de profil */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
                <Link href="/explore">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-fuchsia-600 to-rose-600 hover:from-fuchsia-500 hover:to-rose-500 text-white px-8 h-12 text-base font-semibold shadow-lg shadow-fuchsia-900/30 w-full sm:w-auto"
                  >
                    <Eye className="mr-2 h-5 w-5" />
                    Explorer les projets
                  </Button>
                </Link>
                <a href="#comprendre">
                  <Button
                    size="lg"
                    variant="outline"
                    className="bg-transparent border-white/25 text-white hover:bg-white/10 px-8 h-12 text-base w-full sm:w-auto"
                  >
                    Comprendre en 30 secondes
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </a>
                {!isAuthed && (
                  <Link href="/login">
                    <Button
                      size="lg"
                      variant="outline"
                      className="bg-transparent border-white/25 text-white/80 hover:bg-white/5 px-8 h-12 text-base w-full sm:w-auto"
                    >
                      <LogIn className="mr-2 h-4 w-4" />
                      Se connecter
                    </Button>
                  </Link>
                )}
              </div>

              <p className="text-white/40 text-sm">
                Pas besoin de choisir un profil. Ton role evolue avec tes actions.
              </p>
            </div>
          </div>
        </section>

        {/* MESSAGE DE RASSURANCE - Bandeau permanent V1 */}
        <section className="py-4 border-y border-fuchsia-500/15 bg-fuchsia-500/5">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-center gap-3 text-white/70 text-sm flex-wrap text-center">
              <Shield className="h-4 w-4 text-fuchsia-300 shrink-0" />
              <span>
                <span className="text-fuchsia-200 font-medium">Pas de hasard.</span>
                {" "}Regles transparentes. Tu restes maitre de tes actions.
              </span>
            </div>
          </div>
        </section>

        {/* COMPRENDRE EN 30 SECONDES */}
        <div id="comprendre">
          <QuickExplainer />
        </div>

        {/* PROJETS EN VEDETTE - simple grille avec CTA "Soutenir" */}
        <section className="py-16 bg-slate-900/30">
          <div className="container mx-auto px-4">
            <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-2 text-balance">
                  A decouvrir cette semaine
                </h2>
                <p className="text-white/60">
                  Clique sur un projet pour le decouvrir et le soutenir.
                </p>
              </div>
              <Link href="/explore">
                <Button
                  variant="outline"
                  className="bg-transparent border-white/20 text-white hover:bg-white/10"
                >
                  Voir tous les projets
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {FEATURED_CONTENTS.map((content) => (
                <ContentCard key={content.id} content={content} />
              ))}
            </div>
          </div>
        </section>

        {/* 3 ACTIONS POSSIBLES - aucune mention de profil */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-3 text-balance">
                Que veux-tu faire sur VIXUAL ?
              </h2>
              <p className="text-white/60 max-w-2xl mx-auto">
                Trois actions, une plateforme. Pas de choix complexe : ton role s'active tout seul.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              <Card className="bg-slate-900/60 border-fuchsia-500/30 hover:border-fuchsia-400/60 transition-colors group">
                <CardContent className="p-6 flex flex-col h-full">
                  <div className="h-12 w-12 rounded-xl bg-fuchsia-500/15 flex items-center justify-center mb-4 group-hover:bg-fuchsia-500/25 transition-colors">
                    <Eye className="h-6 w-6 text-fuchsia-300" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Regarder
                  </h3>
                  <p className="text-white/60 text-sm leading-relaxed mb-5 flex-1">
                    Decouvre des projets uniques. Aucune inscription requise pour explorer.
                  </p>
                  <Link href="/explore">
                    <Button
                      variant="outline"
                      className="w-full bg-transparent border-fuchsia-500/30 text-fuchsia-200 hover:bg-fuchsia-500/10"
                    >
                      <Compass className="mr-2 h-4 w-4" />
                      Explorer
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/60 border-rose-500/30 hover:border-rose-400/60 transition-colors group">
                <CardContent className="p-6 flex flex-col h-full">
                  <div className="h-12 w-12 rounded-xl bg-rose-500/15 flex items-center justify-center mb-4 group-hover:bg-rose-500/25 transition-colors">
                    <Heart className="h-6 w-6 text-rose-300" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Soutenir
                  </h3>
                  <p className="text-white/60 text-sm leading-relaxed mb-5 flex-1">
                    Aide les projets que tu aimes. De 2 a 20 EUR. Tu deviens automatiquement contributeur.
                  </p>
                  <Link href="/explore">
                    <Button
                      variant="outline"
                      className="w-full bg-transparent border-rose-500/30 text-rose-200 hover:bg-rose-500/10"
                    >
                      <Heart className="mr-2 h-4 w-4" />
                      Choisir un projet
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/60 border-purple-500/30 hover:border-purple-400/60 transition-colors group">
                <CardContent className="p-6 flex flex-col h-full">
                  <div className="h-12 w-12 rounded-xl bg-purple-500/15 flex items-center justify-center mb-4 group-hover:bg-purple-500/25 transition-colors">
                    <Upload className="h-6 w-6 text-purple-300" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Creer
                  </h3>
                  <p className="text-white/60 text-sm leading-relaxed mb-5 flex-1">
                    Publie ton projet et recois le soutien de la communaute. Tu deviens createur.
                  </p>
                  <Link href={isAuthed ? "/upload" : "/signup"}>
                    <Button
                      variant="outline"
                      className="w-full bg-transparent border-purple-500/30 text-purple-200 hover:bg-purple-500/10"
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Publier un projet
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA FINAL - simple */}
        <section className="py-16 bg-gradient-to-r from-fuchsia-900/25 to-rose-900/25 border-t border-fuchsia-500/15">
          <div className="container mx-auto px-4 text-center max-w-2xl">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 text-balance">
              Pret a rejoindre VIXUAL ?
            </h2>
            <p className="text-white/70 mb-6">
              Inscription gratuite. Aucune information bancaire demandee a la creation du compte.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {!isAuthed && (
                <Link href="/signup">
                  <Button
                    size="lg"
                    className="bg-white text-slate-900 hover:bg-white/90 px-8 h-12 text-base font-semibold w-full sm:w-auto"
                  >
                    Creer mon compte
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              )}
              <Link href="/explore">
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-transparent border-white/30 text-white hover:bg-white/10 px-8 h-12 text-base w-full sm:w-auto"
                >
                  Continuer en tant qu&apos;invite
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <Footer />
      </main>

      {/* Onboarding progressif : un seul hint a la fois, dismissable */}
      <ProgressiveHints roles={roles} />
    </div>
  )
}
