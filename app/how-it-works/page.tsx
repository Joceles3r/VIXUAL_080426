"use client"

import Link from "next/link"
import { VisualSlogan } from "@/components/vixual-slogan"
import { TrafficLight } from "@/components/traffic-light"
import {
  User,
  Eye,
  Layers,
  Shield,
  TrendingUp,
  Film,
  FileText,
  Mic,
  Headphones,
  Wallet,
  ArrowRight,
  Check,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { VisualHeader } from "@/components/visual-header"
import { Footer } from "@/components/footer"
import { InvestSimulator } from "@/components/invest-simulator"
import { usePlatformVersion } from "@/hooks/use-platform-version"

const STEPS = [
  {
    step: 1,
    title: "Explorez en tant qu'invite ou creez votre compte",
    description:
      "Commencez a naviguer immediatement sur VIXUAL en tant qu'invite : decouvrez les contenus gratuits et les extraits sans inscription. Pour debloquer toutes les fonctionnalites, inscrivez-vous gratuitement et devenez Visiteur.",
    icon: User,
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/20",
  },
  {
    step: 2,
    title: "Choisissez votre role",
    description:
      "Devenez Porteur (video), Infoporteur (ecrit), Podcasteur (podcast) pour creer du contenu, ou Contributeur, Contribu-lecteur, Auditeur pour soutenir des projets.",
    icon: Layers,
    color: "text-teal-400",
    bgColor: "bg-teal-500/20",
  },
  {
    step: 3,
    title: "Payez votre caution",
    description:
      "Dix euros pour les createurs (Porteur, Infoporteur, Podcasteur), vingt euros pour les contributeurs (Contributeur, Contribu-lecteur, Auditeur). Caution unique remboursable a la resiliation.",
    icon: Shield,
    color: "text-sky-400",
    bgColor: "bg-sky-500/20",
  },
  {
    step: 4,
    title: "Participez et gagnez",
    description:
      "Créez ou contribuez dans des projets. Suivez vos statistiques et retirez vos gains via Stripe Connect.",
    icon: TrendingUp,
    color: "text-indigo-400",
    bgColor: "bg-indigo-500/20",
  },
]

const ROLES = [
  {
    title: "Invite",
    subtitle: "Sans inscription",
    description:
      "Naviguez librement sur VIXUAL sans creer de compte. Acces limite aux contenus gratuits et extraits uniquement.",
    features: [
      "Acces aux contenus gratuits et extraits",
      "Navigation libre sur la plateforme",
    ],
    restrictions: [
      "Aucun VIXUpoint",
      "Aucun gain ni investissement",
      "Pas de participation a la communaute",
      "Pas de favoris ni de commentaires",
    ],
    caution: null,
    icon: Eye,
    color: "border-slate-500/30",
  },
  {
    title: "Visiteur",
    subtitle: "Gratuit (inscription requise)",
    description:
      "Parcourez la plateforme, gagnez des VIXUpoints, promouvez VIXUAL",
    features: [
      "Acces aux contenus gratuits",
      "VIXUpoints et badges",
      "Favoris et suivis",
      "Commentaires et partages",
      "Beneficier du paiement hybride (majeurs uniquement)",
    ],
    restrictions: [],
    caution: null,
    icon: User,
    color: "border-white/20",
  },
  {
    title: "Porteur",
    subtitle: "Createur audiovisuel",
    description: "Deposez vos videos et visuels, recevez des investissements",
    features: [
      "Depot de contenu video",
      "Statistiques detaillees",
      "Gestion des projets",
      "Retrait des gains",
    ],
    restrictions: [],
    caution: "Dix euros",
    icon: Film,
    color: "border-red-500/50",
  },
  {
    title: "Contributeur",
    subtitle: "Audiovisuel",
    description: "Contribuez à des projets video et recevez des retours",
    features: [
      "Contribution de deux à vingt euros",
      "Portefeuille de projets",
      "Historique des gains",
      "Retrait via Stripe",
    ],
    restrictions: [],
    caution: "Vingt euros",
    icon: TrendingUp,
    color: "border-emerald-500/50",
  },
  {
    title: "Infoporteur",
    subtitle: "Createur litteraire",
    description:
      "Publiez vos ecrits : articles, histoires, livres, et plus encore",
    features: [
      "Depot de contenu ecrit",
      "Statistiques de lecture",
      "Gestion des publications",
      "Retrait des gains",
    ],
    restrictions: [],
    caution: "Dix euros",
    icon: FileText,
    color: "border-amber-500/50",
  },
  {
    title: "Contribu-lecteur",
    subtitle: "Contributeur litteraire",
    description: "Contribuez a des contenus ecrits et soutenez les auteurs",
    features: [
      "Contribution de deux a vingt euros",
      "Portefeuille litteraire",
      "Historique des gains",
      "Retrait via Stripe",
      "Beneficier du paiement hybride",
    ],
    restrictions: [],
    caution: "Vingt euros",
    icon: Wallet,
    color: "border-amber-500/50",
  },
  {
    title: "Podcasteur",
    subtitle: "Createur podcast",
    description: "Deposez vos podcasts, emissions audio et documentaires sonores",
    features: [
      "Depot de contenu podcast",
      "Statistiques d'ecoute",
      "Gestion des episodes",
      "Retrait des gains",
    ],
    restrictions: [],
    caution: "Dix euros",
    icon: Mic,
    color: "border-purple-500/50",
  },
  {
    title: "Auditeur",
    subtitle: "Contributeur podcast",
    description: "Contribuez a des podcasts et soutenez les podcasteurs",
    features: [
      "Contribution de deux a vingt euros",
      "Portefeuille podcasts",
      "Historique des gains",
      "Retrait via Stripe",
      "Beneficier du paiement hybride",
    ],
    restrictions: [],
    caution: "Vingt euros",
    icon: Headphones,
    color: "border-purple-500/50",
  },
]

// Profils visibles selon la version active
const V1_ROLE_TITLES = new Set<string>(["Invite", "Visiteur", "Porteur", "Contributeur"])

function getVisibleRoles(version: "V1" | "V2" | "V3") {
  if (version === "V1") {
    return ROLES.filter(r => V1_ROLE_TITLES.has(r.title))
  }
  return ROLES
}

export default function HowItWorksPage() {
  const platformVersion = usePlatformVersion()
  const visibleRoles = getVisibleRoles(platformVersion)

  return (
    <div className="min-h-screen bg-slate-950">
      <VisualHeader />

      <main className="pt-28 pb-20">
        {/* Hero */}
        <section className="container mx-auto px-4 mb-20 cinema-section">
          <div className="max-w-3xl mx-auto text-center">
            <div className="flex items-center justify-center gap-4 md:gap-6 mb-3">
              <TrafficLight size="lg" />
              <h1 className="text-4xl md:text-5xl font-bold text-white">
                {"Comment ça marche ?"}
              </h1>
              <TrafficLight size="lg" />
            </div>
            <div className="mb-6">
              <VisualSlogan size="sm" opacity="high" withLines />
            </div>
            <p className="text-xl text-white/70">
              {"VIXUAL simplifie la contribution participative dans les projets audiovisuels, littéraires et podcasts. Découvrez comment devenir acteur de la création."}
            </p>
          </div>
        </section>

        {/* Steps */}
        <section className="container mx-auto px-4 mb-20">
          <div className="max-w-4xl mx-auto">
            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-emerald-500 via-teal-500 to-indigo-500 hidden md:block" />

              <div className="space-y-12">
                {STEPS.map((step, index) => (
                  <div key={step.step} className="relative flex gap-6">
                    {/* Step number */}
                    <div
                      className={`shrink-0 w-16 h-16 rounded-full ${step.bgColor} flex items-center justify-center z-10`}
                    >
                      <step.icon className={`h-8 w-8 ${step.color}`} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 pb-8">
                      <div className="text-sm text-emerald-400 font-medium mb-1">
                        Étape {step.step}
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-3">
                        {step.title}
                      </h3>
                      <p className="text-white/70 text-lg">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Roles Section */}
        <section className="py-20 bg-slate-900/30 cinema-section">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Les profils VIXUAL
              </h2>
              <p className="text-white/60 max-w-2xl mx-auto">
                Choisissez le rôle qui vous correspond. Vous pouvez cumuler
                plusieurs rôles sur la plateforme.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
              {visibleRoles.map((role) => (
                <Card
                  key={role.title}
                  className={`bg-slate-900/50 ${role.color} hover:border-emerald-500/50 transition-colors`}
                >
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                        <role.icon className="h-5 w-5 text-emerald-400" />
                      </div>
                      {role.caution && (
                        <span className="text-sm text-emerald-400 bg-emerald-500/20 px-2 py-1 rounded">
                          Caution : {role.caution}
                        </span>
                      )}
                    </div>
                    <CardTitle className="text-white">{role.title}</CardTitle>
                    <p className="text-sm text-white/60">{role.subtitle}</p>
                  </CardHeader>
                  <CardContent>
                    <p className="text-white/70 mb-4">{role.description}</p>
                    <ul className="space-y-2">
                      {role.features.map((feature) => (
                        <li
                          key={feature}
                          className="flex items-center gap-2 text-sm text-white/80"
                        >
                          <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                          {feature}
                        </li>
                      ))}
                      {role.restrictions?.map((restriction) => (
                        <li
                          key={restriction}
                          className="flex items-center gap-2 text-sm text-red-400/80"
                        >
                          <X className="h-4 w-4 text-red-400 shrink-0" />
                          {restriction}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Investment Info */}
        <section className="py-20 cinema-section">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-8 text-center">
                La contribution sur VIXUAL
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-slate-900/50 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Shield className="h-5 w-5 text-emerald-400" />
                      La caution
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-white/70 space-y-3">
                    <p>
                      La caution est un depot unique qui garantit votre
                      engagement sur la plateforme.
                    </p>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <span className="text-emerald-400">•</span>
                        <span>{"Dix euros pour les cr\u00e9ateurs (Porteur, Infoporteur, Podcasteur)"}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-emerald-400">•</span>
                        <span>{"Vingt euros pour les contributeurs (Contributeur, Contribu-lecteur, Auditeur)"}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-emerald-400">•</span>
                        <span>Remboursable en cas de resiliation du compte</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="bg-slate-900/50 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Wallet className="h-5 w-5 text-emerald-400" />
                      Les gains
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-white/70 space-y-3">
                    <p>
                      {"Vos gains sont consultables dans votre Wallet personnel et retirables via Stripe Connect."}
                    </p>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <span className="text-emerald-400">{"•"}</span>
                        <span>{"Contribuez de deux euros à vingt euros par projet"}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-emerald-400">{"•"}</span>
                        <span>{"Reversement de tous les gains : le premier de chaque mois via Stripe Connect"}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-emerald-400">{"•"}</span>
                        <span>{"Retrait possible une fois par semaine (d\u00e9lai de sept jours entre deux demandes)"}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-emerald-400">{"•"}</span>
                        <span>{"Retrait sup\u00e9rieur ou \u00e9gal \u00e0 mille euros : d\u00e9lai de v\u00e9rification de soixante-douze heures"}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-emerald-400">{"•"}</span>
                        <span>{"Minimum : solde positif requis pour toute demande de retrait"}</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>

              <div className="mt-8 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                    <p className="text-amber-200 text-sm text-center">
                  Attention : Contribuer comporte des risques. Les gains ne sont
                  pas garantis. VIXUAL n'est pas un jeu de hasard.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Distribution par categorie */}
        <section className="py-20 bg-slate-900/30 cinema-section">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 text-center">
                Repartition des gains par categorie
              </h2>
              <p className="text-white/60 text-center mb-12 max-w-2xl mx-auto">
                Chaque categorie de contenu a ses propres regles de repartition et frequences de cloture.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Films */}
                <Card className="bg-slate-900/50 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Film className="h-5 w-5 text-red-400" />
                      Films / Videos / Documentaires
                    </CardTitle>
                    <p className="text-sm text-white/50">Cloture configurable (admin)</p>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between text-sm"><span className="text-emerald-400">Contributeurs TOP 10</span><span className="text-white font-semibold">40%</span></div>
                    <div className="flex justify-between text-sm"><span className="text-teal-400">Porteurs TOP 10</span><span className="text-white font-semibold">30%</span></div>
                    <div className="flex justify-between text-sm"><span className="text-sky-400">Contributeurs rangs 11-100</span><span className="text-white font-semibold">7%</span></div>
                    <div className="flex justify-between text-sm"><span className="text-white/50">VIXUAL (plateforme)</span><span className="text-white font-semibold">23%</span></div>
                    <div className="border-t border-white/10 my-2" />
                    <p className="text-white/50 text-xs">
                      <span className="text-red-400 font-medium">{"Cl\u00f4ture : "}</span>
                      {"Par d\u00e9cision administrative ou automatiquement lorsque 100 \u0153uvres sont valid\u00e9es dans l'univers audiovisuel (R\u00e8gle des 100)."}
                    </p>
                  </CardContent>
                </Card>

                {/* Voix de l'Info */}
                <Card className="bg-slate-900/50 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <FileText className="h-5 w-5 text-amber-400" />
                      Voix de l'Info (articles)
                    </CardTitle>
                    <p className="text-sm text-white/50">Vente 70/30 + Pot mensuel</p>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-xs text-white/40 mb-1">Vente unitaire :</p>
                    <div className="flex justify-between text-sm"><span className="text-amber-400">Auteur</span><span className="text-white font-semibold">70%</span></div>
                    <div className="flex justify-between text-sm"><span className="text-white/50">VIXUAL</span><span className="text-white font-semibold">30%</span></div>
                    <div className="border-t border-white/10 my-2" />
                    <p className="text-xs text-white/40 mb-1">Pot mensuel :</p>
                    <div className="flex justify-between text-sm"><span className="text-amber-400">Auteurs TOP 10</span><span className="text-white font-semibold">60%</span></div>
                    <div className="flex justify-between text-sm"><span className="text-sky-400">Contribu-lecteurs gagnants</span><span className="text-white font-semibold">40%</span></div>
                  </CardContent>
                </Card>

                {/* Livres */}
                <Card className="bg-slate-900/50 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <FileText className="h-5 w-5 text-amber-400" />
                      Livres
                    </CardTitle>
                    <p className="text-sm text-white/50">Vente 70/30 + Pot mensuel</p>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-xs text-white/40 mb-1">Vente unitaire :</p>
                    <div className="flex justify-between text-sm"><span className="text-amber-400">Auteur</span><span className="text-white font-semibold">70%</span></div>
                    <div className="flex justify-between text-sm"><span className="text-white/50">VIXUAL</span><span className="text-white font-semibold">30%</span></div>
                    <div className="border-t border-white/10 my-2" />
                    <p className="text-xs text-white/40 mb-1">Pot mensuel :</p>
                    <div className="flex justify-between text-sm"><span className="text-amber-400">Auteurs TOP 10</span><span className="text-white font-semibold">60%</span></div>
                    <div className="flex justify-between text-sm"><span className="text-sky-400">Contribu-lecteurs gagnants</span><span className="text-white font-semibold">40%</span></div>
                  </CardContent>
                </Card>

                {/* Podcasts */}
                <Card className="bg-slate-900/50 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Mic className="h-5 w-5 text-purple-400" />
                      Podcasts
                    </CardTitle>
                    <p className="text-sm text-white/50">Vente 70/30 + Pot mensuel</p>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-xs text-white/40 mb-1">Vente episode :</p>
                    <div className="flex justify-between text-sm"><span className="text-purple-400">Podcasteur</span><span className="text-white font-semibold">70%</span></div>
                    <div className="flex justify-between text-sm"><span className="text-white/50">VIXUAL</span><span className="text-white font-semibold">30%</span></div>
                    <div className="border-t border-white/10 my-2" />
                    <p className="text-xs text-white/40 mb-1">Pot mensuel :</p>
                    <div className="flex justify-between text-sm"><span className="text-purple-400">Podcasteurs</span><span className="text-white font-semibold">40%</span></div>
                    <div className="flex justify-between text-sm"><span className="text-emerald-400">Auditeurs (contributeurs)</span><span className="text-white font-semibold">30%</span></div>
                    <div className="flex justify-between text-sm"><span className="text-white/50">VIXUAL (plateforme)</span><span className="text-white font-semibold">20%</span></div>
                    <div className="flex justify-between text-sm"><span className="text-amber-400">Bonus Pool</span><span className="text-white font-semibold">10%</span></div>
                    <div className="pl-4 mt-1 space-y-1 border-l-2 border-amber-400/30">
                      <div className="flex justify-between text-xs"><span className="text-amber-300/70">Primes perf. TOP 10</span><span className="text-white/70">6%</span></div>
                      <div className="flex justify-between text-xs"><span className="text-white/40">Reserve technique</span><span className="text-white/70">2%</span></div>
                      <div className="flex justify-between text-xs"><span className="text-white/40">Reserve evenementielle</span><span className="text-white/70">2%</span></div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-gradient-to-r from-emerald-900/30 to-teal-900/30 cinema-section">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Prêt à commencer ?
            </h2>
            <p className="text-white/70 mb-8 max-w-xl mx-auto">
              Créez votre compte gratuitement et explorez des milliers de projets
              créatifs
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-8"
                >
                  Créer mon compte
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/explore">
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-transparent border-white/20 text-white hover:bg-white/10 px-8"
                >
                  Explorer les projets
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Simulateur d'investissement */}
      <section className="py-16 cinema-section">
        <div className="container mx-auto px-4 max-w-xl">
          <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-8 text-balance">
            {"Simulez votre investissement"}
          </h2>
          <InvestSimulator />
        </div>
      </section>

      <Footer />
    </div>
  )
}
