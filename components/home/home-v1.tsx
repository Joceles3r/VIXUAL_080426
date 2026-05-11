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
import { V1DiscoveryIntro } from "@/components/home/v1-discovery-intro"
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

              <div className="mb-5 vx-rise-in vx-rise-in--delay-2">
                <VisualSlogan size="base" opacity="high" withLines />
              </div>

              {/* Pitch officiel VIXUAL — visible sans scroll, lisible en 5 secondes */}
              <p className="text-lg md:text-xl text-white/90 mb-4 max-w-3xl mx-auto text-pretty leading-relaxed vx-rise-in vx-rise-in--delay-2">
                <span className="text-white font-semibold">VIXUAL</span>{" "}
                <span className="text-white/70">:</span> la plateforme ou vous{" "}
                <span className="text-fuchsia-200 font-medium">decouvrez</span>{" "}
                et{" "}
                <span className="text-fuchsia-200 font-medium">soutenez directement</span>{" "}
                les createurs independants que vous aimez.
                <span className="block mt-2 text-white/60 text-base md:text-lg italic">
                  Sans intermediaire.
                </span>
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

        {/* PARCOURS EN 3 ETAPES - simplicite immediate, juste sous le hero */}
        <section className="relative py-16 overflow-hidden">
          {/* Halo accent doux */}
          <div
            className="vx-halo vx-halo--accent"
            style={{ width: "560px", height: "320px", top: "10%", left: "50%", transform: "translateX(-50%)" }}
            aria-hidden="true"
          />

          <div className="container mx-auto px-4 relative">
            <div className="max-w-2xl mx-auto text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-3 text-balance vx-text-glow">
                Comment ca marche
              </h2>
              <p className="text-white/65 text-base md:text-lg">
                Tu progresses a ton rythme. Aucun engagement.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto">
              {/* Etape 1 — Decouvre */}
              <Card className="vx-cinema-card bg-slate-900/50 border-fuchsia-500/20 hover:border-fuchsia-400/50 group">
                <CardContent className="p-7 text-center">
                  <div className="relative mb-5 inline-flex items-center justify-center">
                    <div className="absolute -inset-2 rounded-2xl bg-fuchsia-500/15 blur-xl opacity-60 group-hover:opacity-100 transition-opacity" />
                    <div className="relative h-14 w-14 rounded-2xl bg-fuchsia-500/15 border border-fuchsia-400/40 flex items-center justify-center backdrop-blur-md">
                      <Compass className="h-7 w-7 text-fuchsia-200" />
                    </div>
                  </div>
                  <span className="block text-[11px] uppercase tracking-[0.18em] text-fuchsia-300/80 font-semibold mb-2">
                    Etape 1
                  </span>
                  <h3 className="text-xl font-bold text-white mb-3">Decouvre</h3>
                  <p className="text-white/70 text-sm leading-relaxed">
                    Explore librement films, podcasts, livres et creations originales.
                    <span className="block text-white/50 text-xs mt-2">
                      Aucun compte requis pour regarder.
                    </span>
                  </p>
                </CardContent>
              </Card>

              {/* Etape 2 — Soutiens */}
              <Card className="vx-cinema-card bg-slate-900/50 border-rose-500/20 hover:border-rose-400/50 group">
                <CardContent className="p-7 text-center">
                  <div className="relative mb-5 inline-flex items-center justify-center">
                    <div className="absolute -inset-2 rounded-2xl bg-rose-500/15 blur-xl opacity-60 group-hover:opacity-100 transition-opacity" />
                    <div className="relative h-14 w-14 rounded-2xl bg-rose-500/15 border border-rose-400/40 flex items-center justify-center backdrop-blur-md">
                      <Heart className="h-7 w-7 text-rose-200" />
                    </div>
                  </div>
                  <span className="block text-[11px] uppercase tracking-[0.18em] text-rose-300/80 font-semibold mb-2">
                    Etape 2
                  </span>
                  <h3 className="text-xl font-bold text-white mb-3">Soutiens</h3>
                  <p className="text-white/70 text-sm leading-relaxed">
                    Contribue de 2 EUR a 20 EUR aux createurs que tu apprecies.
                    <span className="block text-white/50 text-xs mt-2">
                      Tu choisis toujours le montant.
                    </span>
                  </p>
                </CardContent>
              </Card>

              {/* Etape 3 — Accede */}
              <Card className="vx-cinema-card bg-slate-900/50 border-emerald-500/20 hover:border-emerald-400/50 group">
                <CardContent className="p-7 text-center">
                  <div className="relative mb-5 inline-flex items-center justify-center">
                    <div className="absolute -inset-2 rounded-2xl bg-emerald-500/15 blur-xl opacity-60 group-hover:opacity-100 transition-opacity" />
                    <div className="relative h-14 w-14 rounded-2xl bg-emerald-500/15 border border-emerald-400/40 flex items-center justify-center backdrop-blur-md">
                      <Sparkles className="h-7 w-7 text-emerald-200" />
                    </div>
                  </div>
                  <span className="block text-[11px] uppercase tracking-[0.18em] text-emerald-300/80 font-semibold mb-2">
                    Etape 3
                  </span>
                  <h3 className="text-xl font-bold text-white mb-3">Accede</h3>
                  <p className="text-white/70 text-sm leading-relaxed">
                    Debloque progressivement avantages, recompenses et acces exclusifs.
                    <span className="block text-white/50 text-xs mt-2">
                      Ton role evolue avec tes actions.
                    </span>
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Fenetre explicative "Mode Decouverte" — ancree visuellement sous la carte Soutiens (Etape 2) */}
            <V1DiscoveryIntro />

            {/* Trust strip - rassure sur la legitimite */}
            <div className="mt-12 flex items-center justify-center gap-3 text-white/55 text-sm flex-wrap text-center max-w-2xl mx-auto">
              <Heart className="h-4 w-4 text-fuchsia-300/80 shrink-0" />
              <span>
                <span className="text-fuchsia-200/90 font-medium">Une communaute creative.</span>
                {" "}Tes soutiens aident directement les createurs independants.
              </span>
            </div>
          </div>
        </section>

        {/* PROGRESSION VIXUAL — ancre du CTA "Debloquer plus de fonctionnalites" */}
        <section
          id="vixual-progression"
          className="relative py-14 scroll-mt-24"
        >
          <div
            className="vx-halo vx-halo--accent absolute inset-x-0 top-0 mx-auto pointer-events-none"
            style={{ width: "520px", height: "260px" }}
            aria-hidden="true"
          />
          <div className="container mx-auto px-4 relative">
            <div className="max-w-3xl mx-auto text-center">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-fuchsia-500/10 border border-fuchsia-400/30 text-fuchsia-200 text-[11px] font-semibold uppercase tracking-[0.14em] mb-5">
                <Sparkles className="h-3 w-3" />
                Votre progression
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 text-balance vx-text-glow">
                Evoluez progressivement dans VIXUAL
              </h2>
              <p className="text-white/70 text-base md:text-lg leading-relaxed max-w-2xl mx-auto">
                En participant positivement a la plateforme, vous decouvrez de
                nouvelles fonctionnalites, de nouveaux contenus et de nouveaux
                espaces creatifs.
              </p>
              <p className="text-white/45 text-sm mt-4 italic">
                Decouvreur &middot; Contributeur &middot; Createur — chacun a sa
                place sur VIXUAL.
              </p>
            </div>
          </div>
        </section>

        {/* BLOCS DE CONFIANCE — reponses aux 2 questions cles */}
        <section className="py-14 bg-slate-950">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-3 text-balance">
                Tes questions, nos reponses
              </h2>
              <p className="text-white/55 text-sm md:text-base">
                Avant meme de commencer, on leve les doutes.
              </p>
            </div>

            {/* 2 cartes objections - vocabulaire humain */}
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
