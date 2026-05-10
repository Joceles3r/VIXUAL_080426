"use client"

import Link from "next/link"
import {
  ArrowRight,
  Eye,
  Heart,
  Upload,
  Compass,
  LogIn,
  ChevronRight,
  Scale,
  Flame,
  Sparkles,
  Lock,
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
import { SuccessStories } from "@/components/success-stories/success-stories"
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
        {/* HERO V1 — Streaming premium cinematic */}
        <section className="vx-cinema-hero relative pt-32 pb-24">
          {/* Couche 1 : orbes lumineux drift cinema */}
          <div className="vx-orb-bg" aria-hidden="true" />

          {/* Couche 2 : voile sombre cinema (par-dessus les orbes) */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "linear-gradient(180deg, rgba(10,1,24,0) 0%, rgba(10,1,24,0.35) 65%, rgba(10,1,24,0.85) 100%)",
            }}
            aria-hidden="true"
          />

          <div className="container mx-auto px-4 relative">
            <div className="max-w-3xl mx-auto text-center">
              {/* Badge premium au-dessus du titre */}
              <div className="flex justify-center mb-7 vx-rise-in">
                <span className="vx-pill">
                  <Sparkles className="h-3 w-3" />
                  Streaming creatif premium
                </span>
              </div>

              <div className="flex items-center justify-center gap-4 mb-6 vx-rise-in vx-rise-in--delay-1">
                <TrafficLight size="lg" className="hidden sm:flex" />
                <h1 className="text-5xl md:text-7xl font-bold text-white text-balance leading-[1.05] vx-text-glow">
                  Regarde{" "}
                  <span className="text-white/35 font-light">&middot;</span>{" "}
                  <span
                    className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-200 via-fuchsia-300 to-purple-300"
                    style={{
                      filter: "drop-shadow(0 0 18px rgba(217, 70, 239, 0.45))",
                    }}
                  >
                    Soutiens
                  </span>{" "}
                  <span className="text-white/35 font-light">&middot;</span>{" "}
                  Participe
                </h1>
                <TrafficLight size="lg" className="hidden sm:flex" />
              </div>

              <div className="mb-7 vx-rise-in vx-rise-in--delay-2">
                <VisualSlogan size="base" opacity="high" withLines />
              </div>

              <p className="text-xl text-white/90 mb-3 max-w-2xl mx-auto text-pretty leading-relaxed vx-rise-in vx-rise-in--delay-2">
                Soutiens des createurs independants et participe a une
                communaute creative moderne.
              </p>

              <p className="text-base text-white/65 mb-3 max-w-xl mx-auto leading-relaxed vx-rise-in vx-rise-in--delay-3">
                Chaque soutien aide des projets a evoluer concretement.
              </p>

              <p className="text-sm text-white/45 mb-10 max-w-2xl mx-auto vx-rise-in vx-rise-in--delay-3 tracking-wide">
                Films <span className="text-white/25">&middot;</span> Podcasts{" "}
                <span className="text-white/25">&middot;</span> Livres{" "}
                <span className="text-white/25">&middot;</span> Creations originales
              </p>

              {/* 3 CTA universels - cinematic shimmer */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center mb-7 vx-rise-in vx-rise-in--delay-4">
                <Link href="/explore">
                  <Button
                    size="lg"
                    className="vx-shimmer relative bg-gradient-to-r from-fuchsia-600 via-fuchsia-500 to-rose-500 hover:from-fuchsia-500 hover:to-rose-400 text-white px-8 h-12 text-base font-semibold w-full sm:w-auto"
                    style={{
                      boxShadow:
                        "0 8px 32px -8px rgba(217, 70, 239, 0.55), 0 0 0 1px rgba(240, 171, 252, 0.25) inset",
                    }}
                  >
                    <Eye className="mr-2 h-5 w-5" />
                    Explorer les projets
                  </Button>
                </Link>
                <a href="#comprendre">
                  <Button
                    size="lg"
                    variant="outline"
                    className="bg-white/[0.03] backdrop-blur-md border-white/20 text-white hover:bg-white/[0.08] hover:border-white/35 px-8 h-12 text-base w-full sm:w-auto transition-all"
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
                      className="bg-transparent border-white/15 text-white/75 hover:bg-white/5 hover:text-white px-8 h-12 text-base w-full sm:w-auto"
                    >
                      <LogIn className="mr-2 h-4 w-4" />
                      Se connecter
                    </Button>
                  </Link>
                )}
              </div>

              <p className="text-white/40 text-sm flex items-center justify-center gap-2 flex-wrap vx-rise-in vx-rise-in--delay-4">
                <Lock className="h-3.5 w-3.5 text-white/35" />
                <span>
                  Tu gardes le controle - Aucun engagement force - Ton role evolue avec tes actions
                </span>
              </p>
            </div>
          </div>
        </section>

        {/* POURQUOI VIXUAL ? — bloc emotionnel humain, juste sous le hero */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto text-center space-y-4">
              <h2 className="text-2xl md:text-3xl font-semibold text-white text-balance">
                Pourquoi VIXUAL ?
              </h2>
              <p className="text-white/80 text-base md:text-lg leading-relaxed">
                Chaque soutien aide directement des createurs a concretiser leurs projets.
              </p>
              <p className="text-white/65 text-base leading-relaxed">
                Films, podcasts, livres, documentaires, creations originales et contenus
                independants.
              </p>
              <p className="text-white/45 text-sm leading-relaxed pt-2">
                Certaines participations peuvent aussi etre recompensees selon les regles
                officielles de VIXUAL.
              </p>
            </div>
          </div>
        </section>

        {/* MESSAGE DE RASSURANCE - Bandeau humain et communautaire */}
        <section className="py-4 border-y border-fuchsia-500/15 bg-fuchsia-500/5">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-center gap-3 text-white/70 text-sm flex-wrap text-center">
              <Heart className="h-4 w-4 text-fuchsia-300 shrink-0" />
              <span>
                <span className="text-fuchsia-200 font-medium">Une communaute creative.</span>
                {" "}Tes soutiens aident directement les createurs independants.
              </span>
            </div>
          </div>
        </section>

        {/* BLOCS DE CONFIANCE — reponses immediates aux 4 freins */}
        <section className="py-12 bg-slate-950">
          <div className="container mx-auto px-4">
            {/* Comment ca marche - 4 etapes immediates, pas de scroll */}
            <div className="max-w-2xl mx-auto text-center mb-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-fuchsia-500/10 border border-fuchsia-500/25 text-fuchsia-200 text-xs font-medium mb-4">
                <Sparkles className="h-3.5 w-3.5" />
                Comprendre en 5 secondes
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 text-balance">
                Comment ca marche ?
              </h2>

              <ol className="space-y-3 text-left max-w-md mx-auto">
                {[
                  "Tu regardes des contenus creatifs",
                  "Tu soutiens les createurs que tu apprecies",
                  "Tu aides les projets a evoluer",
                  "Tu participes a une communaute creative",
                ].map((step, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/5"
                  >
                    <span className="flex-shrink-0 h-7 w-7 rounded-full bg-fuchsia-500/15 border border-fuchsia-500/30 text-fuchsia-200 text-sm font-semibold flex items-center justify-center">
                      {i + 1}
                    </span>
                    <span className="text-white/85 text-sm leading-relaxed pt-0.5">
                      {step}
                    </span>
                  </li>
                ))}
              </ol>

              <p className="text-xs text-white/45 mt-5 leading-relaxed max-w-sm mx-auto">
                Certaines participations peuvent egalement etre recompensees
                selon les regles officielles VIXUAL.
              </p>
            </div>

            {/* Soutenir + Decouvrir - cartes emotionnelles, vocabulaire humain */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-3xl mx-auto">
              {/* A quoi sert mon soutien ? */}
              <Card className="vx-cinema-card bg-emerald-500/5 border-emerald-500/25">
                <CardContent className="p-6 text-center">
                  <div className="h-10 w-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto mb-3">
                    <Heart className="h-5 w-5 text-emerald-300" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-3">
                    A quoi sert mon soutien ?
                  </h3>
                  <p className="text-white/80 text-sm leading-relaxed mb-2">
                    Les soutiens aident directement les createurs a developper leurs projets.
                  </p>
                  <p className="text-white/80 text-sm leading-relaxed mb-3">
                    Tu rejoins une communaute qui valorise la creation independante.
                  </p>
                  <p className="text-xs text-emerald-200/70">
                    Tu choisis toujours combien tu participes.
                  </p>
                </CardContent>
              </Card>

              {/* Suis-je libre ? */}
              <Card className="vx-cinema-card bg-amber-500/5 border-amber-500/25">
                <CardContent className="p-6 text-center">
                  <div className="h-10 w-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center mx-auto mb-3">
                    <Scale className="h-5 w-5 text-amber-300" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-3">
                    Est-ce que je reste libre ?
                  </h3>
                  <p className="text-white/80 text-sm leading-relaxed mb-2">
                    Oui. Aucun engagement force, aucun abonnement masque.
                  </p>
                  <p className="text-white/80 text-sm leading-relaxed mb-3">
                    Le soutien reste avant tout une aide aux createurs, pas une garantie de retour.
                  </p>
                  <p className="text-xs text-amber-200/70">
                    Tu decides toujours du montant que tu engages.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* COMPRENDRE EN 30 SECONDES - explication detaillee (deeper dive) */}
        <div id="comprendre">
          <QuickExplainer />
        </div>

        {/* SUCCESS STORIES - humanisation, lien direct avec les createurs */}
        <SuccessStories />

        {/* PROJETS EN VEDETTE — rail cinema premium */}
        <section className="relative py-20 overflow-hidden bg-slate-900/30">
          {/* Halos lumineux en arriere-plan */}
          <div
            className="vx-halo vx-halo--accent"
            style={{ width: "440px", height: "440px", top: "-150px", left: "10%" }}
            aria-hidden="true"
          />
          <div
            className="vx-halo vx-halo--secondary"
            style={{ width: "520px", height: "520px", bottom: "-200px", right: "5%" }}
            aria-hidden="true"
          />

          <div className="container mx-auto px-4 relative">
            <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
              <div>
                <span className="vx-pill mb-3">
                  <Flame className="h-3 w-3" />
                  En vedette
                </span>
                <h2 className="text-3xl md:text-5xl font-bold text-white mb-3 text-balance vx-text-glow">
                  A decouvrir cette semaine
                </h2>
                <p className="text-white/65 text-base md:text-lg max-w-xl">
                  Clique sur un projet pour le decouvrir et le soutenir.
                </p>
              </div>
              <Link href="/explore">
                <Button
                  variant="outline"
                  className="bg-white/[0.03] backdrop-blur-md border-white/20 text-white hover:bg-white/[0.08] hover:border-white/35 transition-all"
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
                Decouvrir, soutenir, creer. Trois actions, une plateforme. Pas de choix
                complexe : ton role s&apos;active tout seul au fil de tes envies.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              <Card className="vx-cinema-card bg-slate-900/60 border-fuchsia-500/30 hover:border-fuchsia-400/60 group">
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

              <Card className="vx-cinema-card bg-slate-900/60 border-rose-500/30 hover:border-rose-400/60 group">
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
                    <Button className="w-full bg-orange-500 hover:bg-orange-400 text-white font-semibold shadow-lg shadow-orange-900/30">
                      <Flame className="mr-2 h-4 w-4" />
                      Je soutiens un projet
                    </Button>
                  </Link>
                  <p className="text-xs text-white/45 mt-2 text-center">
                    Aucun engagement force
                  </p>
                </CardContent>
              </Card>

              <Card className="vx-cinema-card bg-slate-900/60 border-purple-500/30 hover:border-purple-400/60 group">
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
