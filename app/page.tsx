"use client"

import Link from "next/link"
import { ArrowRight, Film, FileText, Mic, Users, TrendingUp, Shield, Star, Award, CreditCard, Wallet, Upload, Eye, Heart, Sparkles, Flame } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { VisualHeader } from "@/components/vixual-header"
import { Footer } from "@/components/footer"
import { VisualSlogan } from "@/components/vixual-slogan"
import { ContentCard } from "@/components/content-card"
import { TrafficLight } from "@/components/traffic-light"
import { ALL_CONTENTS } from "@/lib/mock-data"
import { usePlatformVersion } from "@/hooks/use-platform-version"
import { HomeV1 } from "@/components/home/home-v1"

const FEATURED_CONTENTS = ALL_CONTENTS.slice(0, 4)

const FEATURES = [
  {
    icon: Film,
    title: "Audiovisuel",
    description: "Courts et longs metrages, documentaires, clips musicaux et animations",
    color: "text-red-400",
    bgColor: "bg-red-500/10",
  },
  {
    icon: FileText,
    title: "Litteraire",
    description: "Romans, nouvelles, essais, poesies et articles",
    color: "text-amber-400",
    bgColor: "bg-amber-500/10",
  },
  {
    icon: Mic,
    title: "Podcast",
    description: "Podcasts, voix de l'info, emissions audio et documentaires sonores",
    color: "text-purple-400",
    bgColor: "bg-purple-500/10",
  },
  {
    icon: TrendingUp,
    title: "Contribution",
    description: "De 2EUR a 20EUR par projet, recevez des retours sur vos contributions",
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
  },
  {
    icon: Shield,
    title: "Securise",
    description: "Caution remboursable, paiements via Stripe Connect",
    color: "text-sky-400",
    bgColor: "bg-sky-500/10",
  },
]

const STATS = [
  { value: "12,500+", label: "Utilisateurs" },
  { value: "850+", label: "Projets financés" },
  { value: "2.5M€", label: "Contribués" },
  { value: "89%", label: "Projets réussis" },
]

export default function HomePage() {
  const rawVersion = usePlatformVersion()

  // V1 utilise un layout simplifie dedie (onboarding intelligent,
  // 3 actions universelles, vocabulaire grand public). V2/V3 conservent
  // leur layout historique ci-dessous.
  if (rawVersion === "V1") {
    return <HomeV1 />
  }

  // Cast apres l'early return : preserve le type union complet pour le rendu V2/V3
  // et empeche le narrowing destructeur sur les comparaisons internes.
  const platformVersion = rawVersion as "V1" | "V2" | "V3"

  return (
    <div className="min-h-screen bg-slate-950">
      <VisualHeader />

      <main>
        {/* Hero Section — Streaming premium cinematic V2/V3 */}
        <section className="vx-cinema-hero relative pt-32 pb-24">
          {/* Couche 1 : orbes lumineux drift cinema */}
          <div className="vx-orb-bg" aria-hidden="true" />

          {/* Couche 2 : voile sombre cinema */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "linear-gradient(180deg, rgba(10,1,24,0) 0%, rgba(10,1,24,0.35) 65%, rgba(10,1,24,0.85) 100%)",
            }}
            aria-hidden="true"
          />

          <div className="container mx-auto px-4 relative">
            <div className="max-w-4xl mx-auto text-center">
              {/* Badge premium contextuel par version */}
              <div className="flex justify-center mb-7 vx-rise-in">
                <span className="vx-pill">
                  {platformVersion === "V2" ? (
                    <>
                      <span className="vx-live-dot" aria-hidden="true" />
                      Communaute creative active
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-3 w-3" />
                      Univers createurs prestigieux
                    </>
                  )}
                </span>
              </div>

              <div className="flex items-center justify-center gap-4 md:gap-6 mb-6 vx-rise-in vx-rise-in--delay-1">
                <TrafficLight size="lg" className="hidden sm:flex" />
                <h1 className="text-5xl md:text-7xl font-bold text-white text-balance leading-[1.05] vx-text-glow">
                  Contribuez aux{" "}
                  <span
                    className={
                      platformVersion === "V2"
                        ? "text-transparent bg-clip-text bg-gradient-to-r from-rose-200 via-red-300 to-rose-400"
                        : "text-transparent bg-clip-text bg-gradient-to-r from-emerald-200 via-teal-300 to-emerald-400"
                    }
                    style={{
                      filter:
                        platformVersion === "V2"
                          ? "drop-shadow(0 0 18px rgba(244, 63, 94, 0.45))"
                          : "drop-shadow(0 0 18px rgba(52, 211, 153, 0.45))",
                    }}
                  >
                    talents de demain
                  </span>
                </h1>
                <TrafficLight size="lg" className="hidden sm:flex" />
              </div>

              {/* Slogan signature */}
              <div className="mb-4 vx-rise-in vx-rise-in--delay-2">
                <VisualSlogan size="base" opacity="high" withLines />
              </div>
              <p className="text-white/45 text-sm italic mb-6 vx-rise-in vx-rise-in--delay-2">
                Vois-les avant tout le monde.
              </p>

              {platformVersion === "V2" && (
                <div className="mb-6 vx-rise-in vx-rise-in--delay-3">
                  <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500/10 border border-red-500/30 text-red-200 text-xs font-medium backdrop-blur-md">
                    Phase de croissance - createurs video, ecrits et podcasts desormais disponibles
                  </span>
                </div>
              )}

              <p className="text-xl text-white/85 mb-10 max-w-2xl mx-auto text-pretty leading-relaxed vx-rise-in vx-rise-in--delay-3">
                VIXUAL, la premiere plateforme de streaming participative pour les films, ecrits et podcasts. Soutenez les createurs en contribuant a leur succes.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center vx-rise-in vx-rise-in--delay-4">
                <Link href="/signup">
                  <Button
                    size="lg"
                    className={`vx-shimmer relative text-white px-8 h-12 text-lg font-semibold ${
                      platformVersion === "V2"
                        ? "bg-gradient-to-r from-rose-600 via-red-500 to-rose-500 hover:from-rose-500 hover:to-rose-400"
                        : "bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-500 hover:from-emerald-500 hover:to-teal-400"
                    }`}
                    style={{
                      boxShadow:
                        platformVersion === "V2"
                          ? "0 8px 32px -8px rgba(244, 63, 94, 0.55), 0 0 0 1px rgba(252, 165, 165, 0.25) inset"
                          : "0 8px 32px -8px rgba(16, 185, 129, 0.55), 0 0 0 1px rgba(110, 231, 183, 0.25) inset",
                    }}
                  >
                    Commencer gratuitement
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/explore">
                  <Button
                    size="lg"
                    variant="outline"
                    className="bg-white/[0.03] backdrop-blur-md border-white/20 text-white hover:bg-white/[0.08] hover:border-white/35 px-8 h-12 text-lg transition-all"
                  >
                    Explorer les projets
                  </Button>
                </Link>
              </div>
              <p className="text-white/40 text-sm mt-4">
                Pas encore pret ?{" "}
                <Link href="/explore" className="text-white/60 underline underline-offset-4 hover:text-white/80 transition-colors">
                  Continuez en tant qu'invite
                </Link>
                {" "}- acces aux contenus gratuits, sans inscription
              </p>

              {/* Bloc Comment fonctionne - 3 etapes simples (cache en V1, allege en V2) */}
              {platformVersion !== "V1" && (
              <div className="mt-12 p-6 rounded-2xl bg-gradient-to-r from-slate-900/80 via-emerald-900/20 to-slate-900/80 border border-emerald-500/20">
                <h3 className="text-lg font-semibold text-white mb-4">Comment fonctionne VIXUAL :</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50">
                    <div className="h-10 w-10 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                      <Film className="h-5 w-5 text-emerald-400" />
                    </div>
                    <span className="text-white/80 text-sm">Regardez des contenus</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50">
                    <div className="h-10 w-10 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0">
                      <CreditCard className="h-5 w-5 text-amber-400" />
                    </div>
                    <span className="text-white/80 text-sm">Participez aux projets</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50">
                    <div className="h-10 w-10 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0">
                      <TrendingUp className="h-5 w-5 text-purple-400" />
                    </div>
                    <span className="text-white/80 text-sm">Gagnez selon votre implication</span>
                  </div>
                </div>
              </div>

              )}

              {/* Bandeau gains potentiels - V2/V3 uniquement */}
              {platformVersion !== "V1" && (
                <div className="mt-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
                  <p className="text-amber-200 text-sm text-center">
                    <Wallet className="h-4 w-4 inline-block mr-2" />
                    Certains utilisateurs peuvent generer des gains selon leur participation et les performances des projets.
                  </p>
                </div>
              )}

              {/* Entrees rapides */}
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Link href="/explore">
                  <Button variant="outline" className="bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20">
                    <Film className="h-4 w-4 mr-2" />
                    Decouvrir
                  </Button>
                </Link>
                <Link href="/guide-profiles">
                  <Button variant="outline" className="bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Participer
                  </Button>
                </Link>
                <Link href="/dashboard/projects">
                  <Button variant="outline" className="bg-purple-500/10 border-purple-500/30 text-purple-300 hover:bg-purple-500/20">
                    <Upload className="h-4 w-4 mr-2" />
                    Publier
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-12 border-y border-white/10 bg-slate-900/30 cinema-section">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {STATS.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-emerald-400">
                    {stat.value}
                  </div>
                  <div className="text-white/60 mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section Pedagogique - Comprendre VIXUAL */}
        <section className="py-20 bg-gradient-to-b from-slate-950 via-emerald-950/10 to-slate-950 cinema-section">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 mb-4">
                Nouveau sur VIXUAL ?
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Comprendre VIXUAL en 3 points
              </h2>
              <p className="text-white/60 max-w-2xl mx-auto">
                Une plateforme simple, transparente et equitable pour tous
              </p>
            </div>

            {/* Les 3 cartes explicatives avec images - Palette VIXUAL Streaming */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              
              {/* Carte 1: Les 3 Familles */}
              <Card className="vx-cinema-card overflow-hidden hover:shadow-xl hover:shadow-[#7A00FF]/20 border-[#7A00FF]/30" style={{ background: 'linear-gradient(to bottom, rgba(10, 77, 255, 0.15), rgba(122, 0, 255, 0.1))' }}>
                <CardContent className="p-5 pb-3">
                  <h3 className="text-lg font-bold mb-2 select-text" style={{ color: '#F5F7FF' }}>
                    {"Les 3 Familles VIXUAL - Createurs, Participants, Public"}
                  </h3>
                </CardContent>
                <div className="aspect-[16/10] relative overflow-hidden px-5">
                  <img 
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ChatGPT%20Image%201_%2030%20mars%202026%2C%2023_09_33-9Xo4IW2tIXTNo2g4E6zzRf2R1yRqDK.png" 
                    alt="Les 3 familles VIXUAL - Createurs, Participants, Public" 
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
                <CardContent className="p-5 pt-3">
                  <p className="text-sm leading-relaxed select-text" style={{ color: 'rgba(245, 247, 255, 0.7)' }}>
                    {"Les 3 Familles : "}
                    <span style={{ color: '#00E5FF' }} className="font-medium">{"Createurs"}</span>
                    {" publient des oeuvres, "}
                    <span style={{ color: '#00E5FF' }} className="font-medium">{"Participants"}</span>
                    {" soutiennent financierement, "}
                    <span style={{ color: '#00E5FF' }} className="font-medium">{"Public"}</span>
                    {" decouvre/participe/partage."}
                  </p>
                </CardContent>
              </Card>

              {/* Carte 2: Comment ca fonctionne */}
              <Card className="vx-cinema-card overflow-hidden hover:shadow-xl hover:shadow-[#0A4DFF]/20 border-[#0A4DFF]/30" style={{ background: 'linear-gradient(to bottom, rgba(122, 0, 255, 0.15), rgba(10, 77, 255, 0.1))' }}>
                <CardContent className="p-5 pb-3">
                  <h3 className="text-lg font-bold mb-2 select-text" style={{ color: '#F5F7FF' }}>
                    {"Comment fonctionne VIXUAL - Selectionnez, Participez, Gagnez"}
                  </h3>
                </CardContent>
                <div className="aspect-[16/10] relative overflow-hidden px-5">
                  <img 
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ChatGPT%20Image%202_31%20mars%202026%2C%2015_14_36-JiBG5wIrJPtS9tXb07HiZwDZHhAcgx.png" 
                    alt="Comment fonctionne VIXUAL - Selectionnez, Participez, Gagnez" 
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
                <CardContent className="p-5 pt-3">
                  <p className="text-sm leading-relaxed select-text" style={{ color: 'rgba(245, 247, 255, 0.7)' }}>
                    {"Comment ca fonctionne : Createur publie, participants soutiennent, votes classent, meilleurs gagnent, gains redistribues equitablement."}
                  </p>
                </CardContent>
              </Card>

              {/* Carte 3: Principe des gains */}
              <Card className="vx-cinema-card overflow-hidden hover:shadow-xl hover:shadow-[#00E5FF]/20 border-[#00E5FF]/30" style={{ background: 'linear-gradient(to bottom, rgba(0, 229, 255, 0.1), rgba(122, 0, 255, 0.1))' }}>
                <CardContent className="p-5 pb-3">
                  <h3 className="text-lg font-bold mb-2 select-text" style={{ color: '#F5F7FF' }}>
                    {"Votez pour vos projets preferes"}
                  </h3>
                </CardContent>
                <div className="aspect-[16/10] relative overflow-hidden px-5">
                  <img 
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ChatGPT%20Image%203%20avr.%202026%2C%2022_38_13-YXCdE4BieypUDI1D3stcttWcES4TQG.png" 
                    alt="Votez pour vos projets preferes" 
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
                <CardContent className="p-5 pt-3">
                  <p className="text-sm leading-relaxed select-text" style={{ color: 'rgba(245, 247, 255, 0.7)' }}>
                    {"Principe des gains : Les votes classent les projets. Les gains sont calcules au prorata de votre contribution financiere reelle."}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Slogan et VIXUpoints */}
            <div className="mt-12 max-w-3xl mx-auto">
              <div className="bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-emerald-500/10 rounded-2xl p-6 border border-emerald-500/20">
                <div className="text-center mb-4">
                  <p className="text-2xl font-bold inline-flex items-baseline gap-2">
                    <span className="text-red-500">Regarde</span>
                    <span className="text-white/40">—</span>
                    <span className="text-amber-400">Soutiens</span>
                    <span className="text-white/40">—</span>
                    <span className="text-emerald-400">Participe</span>
                  </p>
                </div>
                <div className={`grid grid-cols-1 ${platformVersion !== "V1" ? "md:grid-cols-2" : ""} gap-4 text-sm`}>
                  <div className="bg-slate-900/50 rounded-lg p-4">
                    <p className="text-amber-400 font-semibold mb-1">VIXUpoints</p>
                    <p className="text-white/60 text-xs">Debloquez des contenus, soutenez la plateforme, achetez des micro-contenus. Ils ne servent jamais a influencer les gains.</p>
                  </div>
                  {platformVersion !== "V1" && (
                    <div className="bg-slate-900/50 rounded-lg p-4">
                      <p className="text-emerald-400 font-semibold mb-1">Paiement hybride</p>
                      <p className="text-white/60 text-xs">Selon votre profil: euros uniquement, VIXUpoints + euros, ou VIXUpoints seuls. Equitable et transparent.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 cinema-section">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Trois univers, une plateforme
              </h2>
              <p className="text-white/60 max-w-2xl mx-auto">
                Explorez et contribuez a des projets audiovisuels,
                litteraires et podcasts uniques
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
              {FEATURES.map((feature) => (
                <Card
                  key={feature.title}
                  className="vx-cinema-card bg-slate-900/50 border-white/10 hover:border-emerald-500/30"
                >
                  <CardContent className="p-6">
                    <div
                      className={`w-12 h-12 rounded-lg ${feature.bgColor} flex items-center justify-center mb-4`}
                    >
                      <feature.icon className={`h-6 w-6 ${feature.color}`} />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-white/60">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
              
              {/* Encart special - Regarde Soutiens Participe */}
              <Card className="vx-cinema-card bg-slate-900/50 border-white/10 hover:border-white/30">
                <CardContent className="p-6 flex flex-col items-center justify-center h-full">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-red-500/15 flex items-center justify-center">
                      <Eye className="h-5 w-5 text-red-400" />
                    </div>
                    <div className="w-10 h-10 rounded-full bg-amber-500/15 flex items-center justify-center">
                      <Heart className="h-5 w-5 text-amber-400" />
                    </div>
                    <div className="w-10 h-10 rounded-full bg-emerald-500/15 flex items-center justify-center">
                      <Users className="h-5 w-5 text-emerald-400" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-red-400 text-center mb-1">
                    Regarde
                  </h3>
                  <h3 className="text-lg font-semibold text-amber-400 text-center mb-1">
                    Soutiens
                  </h3>
                  <h3 className="text-lg font-semibold text-emerald-400 text-center">
                    Participe
                  </h3>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Featured Projects — rail cinema premium */}
        <section className="relative py-20 overflow-hidden bg-slate-900/30 cinema-section">
          {/* Halos lumineux */}
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
            <div className="flex justify-between items-end mb-10 flex-wrap gap-4">
              <div>
                <span className="vx-pill mb-3">
                  <Flame className="h-3 w-3" />
                  En vedette
                </span>
                <h2 className="text-3xl md:text-5xl font-bold text-white mb-2 vx-text-glow">
                  Projets en vedette
                </h2>
                <p className="text-white/65 text-base md:text-lg max-w-xl">
                  Decouvrez les projets les plus populaires du moment
                </p>
              </div>
              <Link href="/explore">
                <Button
                  variant="outline"
                  className="hidden md:flex bg-white/[0.03] backdrop-blur-md border-white/20 text-white hover:bg-white/[0.08] hover:border-white/35 transition-all"
                >
                  Voir tout
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {FEATURED_CONTENTS.map((content) => (
                <ContentCard key={content.id} content={content} />
              ))}
            </div>

            <div className="mt-8 text-center md:hidden">
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
          </div>
        </section>

        {/* How It Works Preview */}
        <section className="py-20 cinema-section">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Comment ça fonctionne ?
              </h2>
            <p className="text-white/60 mb-12 max-w-2xl mx-auto">
              En quelques etapes simples, devenez contributeur de la creation
              audiovisuelle, litteraire et podcast
            </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mb-4">
                    <Users className="h-8 w-8 text-emerald-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    1. Créez votre compte
                  </h3>
                  <p className="text-white/60">
                    Inscription gratuite et accès immédiat à la plateforme
                  </p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full bg-teal-500/20 flex items-center justify-center mb-4">
                    <Film className="h-8 w-8 text-teal-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    2. Explorez les projets
                  </h3>
                  <p className="text-white/60">
                    Decouvrez des creations uniques en video, ecrit et podcast
                  </p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full bg-sky-500/20 flex items-center justify-center mb-4">
                    <Star className="h-8 w-8 text-sky-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    3. Soutenez et participez
                  </h3>
                  <p className="text-white/60">
                    Soutenez les createurs que vous appreciez et rejoignez la communaute
                  </p>
                </div>
              </div>

              <Link href="/how-it-works" className="inline-block mt-12">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white"
                >
                  En savoir plus
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* CTA Section — cinematic premium */}
        <section className="relative py-24 overflow-hidden bg-gradient-to-r from-emerald-900/30 to-teal-900/30 cinema-section">
          <div
            className="vx-halo vx-halo--accent"
            style={{ width: "600px", height: "600px", top: "-250px", left: "50%", transform: "translateX(-50%)" }}
            aria-hidden="true"
          />
          <div className="container mx-auto px-4 text-center relative">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 vx-text-glow text-balance">
              Pret a rejoindre VIXUAL ?
            </h2>
            <p className="text-white/75 mb-8 max-w-xl mx-auto text-base md:text-lg leading-relaxed">
              Creez votre compte gratuitement et commencez a explorer des
              milliers de projets creatifs.
            </p>
            <Link href="/signup">
              <Button
                size="lg"
                className="vx-shimmer relative bg-white text-slate-900 hover:bg-white/95 px-10 h-12 text-lg font-semibold"
                style={{
                  boxShadow:
                    "0 8px 32px -8px rgba(255, 255, 255, 0.45), 0 0 0 1px rgba(255, 255, 255, 0.2) inset",
                }}
              >
                Creer mon compte
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </section>
        {/* Guide des Profils CTA */}
        <section className="py-16 bg-gradient-to-r from-slate-900 via-teal-900/20 to-slate-900 border-y border-slate-800/50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                <div>
                  <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">
                    Découvrez votre profil idéal
                  </h3>
                  <p className="text-white/60 mb-4">
                    {platformVersion === "V1"
                      ? "4 profils differents, 4 facons de participer a VIXUAL. Lequel vous correspond?"
                      : "8 profils differents, 8 facons de participer a VIXUAL. Lequel vous correspond?"}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge className="bg-slate-500/20 text-slate-300 border-slate-500/30">Invite</Badge>
                    <Badge className="bg-teal-500/20 text-teal-300 border-teal-500/30">Visiteur</Badge>
                    <Badge className="bg-rose-500/20 text-rose-300 border-rose-500/30">Porteur</Badge>
                    <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">Contributeur</Badge>
                    {platformVersion !== "V1" && (
                      <>
                        <Badge className="bg-sky-500/20 text-sky-300 border-sky-500/30">Infoporteur</Badge>
                        <Badge className="bg-violet-500/20 text-violet-300 border-violet-500/30">Podcasteur</Badge>
                        <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30">Contribu-lecteur</Badge>
                        <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">Auditeur</Badge>
                      </>
                    )}
                  </div>
                </div>
                <Link href="/guide-profiles">
                  <Button size="lg" className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 whitespace-nowrap">
                    Consulter le guide
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </main>
    </div>
  )
}
