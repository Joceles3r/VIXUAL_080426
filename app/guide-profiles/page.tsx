"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrafficLight } from "@/components/traffic-light"
import {
  ArrowLeft, Users, Crown, Film, TrendingUp, Heart, Lock, Unlock,
  Play, Gift, Zap, CheckCircle, AlertCircle, ArrowRight, BookOpen, Mic, Headphones, LogIn, Target
} from "lucide-react"

type ProfileKey = "guest" | "visitor" | "creator" | "infoporteur" | "podcasteur" | "contributor" | "contribu_lecteur" | "auditeur"

const PROFILES = {
  guest: {
    title: "Invité",
    subtitle: "Exploration gratuite",
    icon: Users,
    color: "bg-slate-500/20 border-slate-500/40",
    textColor: "text-slate-300",
    description: "Naviguez librement sur VIXUAL sans inscription. Découvrez les contenus gratuits et les extraits.",
    features: [
      "Accès à tous les extraits de contenu",
      "Visionnage des contenus gratuits",
      "Exploration de la plateforme sans limite",
      "Consultation des fiches projets",
      "Pas d'inscription obligatoire"
    ],
    restrictions: [
      "Pas accès au paiement hybride",
      "Pas accès à Vixual Social",
      "Pas d'accès aux contenus payants",
      "Pas de VIXUpoints à gagner",
      "Pas de profil créateur"
    ],
    cta: "Rester comme invité",
    nextStep: "Inscrivez-vous pour débloquer tous les avantages!"
  },

  visitor: {
    title: "Visiteur",
    subtitle: "Découvrir, accumuler, débloquer, progresser",
    icon: Crown,
    color: "bg-emerald-500/20 border-emerald-500/40",
    textColor: "text-emerald-300",
    description: "Votre parcours VIXUAL en quatre temps : découvrir les contenus, accumuler des VIXUpoints, débloquer votre Pass Découverte, progresser jusqu'à la conversion en euros.",
    features: [
      "Découvrir : accès libre à tous les extraits",
      "Accumuler : gagner des VIXUpoints en participant",
      "Débloquer : Pass Découverte quotidien (1 contenu complet gratuit)",
      "Progresser : conversion à partir de 2 500 VIXUpoints (= 25€)",
    ],
    restrictions: [
      "Pas de création de contenu (devenir Porteur/Infoporteur/Podcasteur)",
      "Plafond VIXUpoints en caisse selon votre profil",
      "Gains directs de projets réservés aux profils Contributeurs",
    ],
    cta: "Commencer l'aventure Visiteur",
    nextStep: "Découvrez, accumulez et progressez à votre rythme",
    advantage: "Un parcours simple : regarder des extraits, participer, débloquer du contenu gratuit, convertir vos points en euros"
  },

  creator: {
    title: "Porteur",
    subtitle: "Créateur de contenu audiovisuel",
    icon: Film,
    color: "bg-rose-500/20 border-rose-500/40",
    textColor: "text-rose-300",
    description: "Publiez vos films et vidéos pour toucher des royalties et monétiser votre talent.",
    features: [
      "Dépôt de contenu audiovisuel (films, vidéos)",
      "Fixez vous-même le prix de vente",
      "Accès à tous les outils de promotion",
      "Partage de liens projets sur réseaux sociaux",
      "Participation aux royalties si TOP 10",
      "Retrait des gains via Stripe Connect",
      "Caution initiale: 10€ (remboursable)"
    ],
    restrictions: [
      "Dépôt obligatoire d'une vidéo/film de qualité",
      "Respect des conditions de contenu",
      "Gains seulement si dans TOP 10 sur 100",
      "Distribution des gains le 1er du mois suivant"
    ],
    cta: "Devenir Porteur",
    nextStep: "Déposez votre premier projet audiovisuel",
    advantage: "Gagnez entre 5% et 40% des contributions selon votre classement"
  },

  infoporteur: {
    title: "Infoporteur",
    subtitle: "Créateur de contenu littéraire",
    icon: BookOpen,
    color: "bg-sky-500/20 border-sky-500/40",
    textColor: "text-sky-300",
    description: "Publiez vos livres et articles pour construire votre audience et générer des revenus.",
    features: [
      "Dépôt de contenus écrits (livres, articles)",
      "Fixez vous-même le prix de vente",
      "Promotion via Vixual Social",
      "Partage de liens projets sur réseaux sociaux",
      "Participation aux royalties si TOP 10",
      "Retrait des gains via Stripe Connect",
      "Caution initiale: 10€ (remboursable)"
    ],
    restrictions: [
      "Contenu écrit de qualité exigé",
      "Respect des conditions de contenu",
      "Gains seulement si dans TOP 10 sur 100",
      "Distribution des gains le 1er du mois suivant"
    ],
    cta: "Devenir Infoporteur",
    nextStep: "Déposez votre premier contenu littéraire",
    advantage: "Touchez des Contribu-lecteurs qui aiment votre style"
  },

  podcasteur: {
    title: "Podcasteur",
    subtitle: "Créateur de contenu audio",
    icon: Mic,
    color: "bg-violet-500/20 border-violet-500/40",
    textColor: "text-violet-300",
    description: "Publiez et monétisez vos podcasts auprès de votre audience fidèle.",
    features: [
      "Dépôt de fichiers audio (podcasts)",
      "Fixez vous-même le prix de vente",
      "Promotion via Vixual Social",
      "Partage de liens projets sur réseaux sociaux",
      "Participation aux royalties si TOP 10",
      "Retrait des gains via Stripe Connect",
      "Caution initiale: 10€ (remboursable)"
    ],
    restrictions: [
      "Qualité audio minimale exigée",
      "Respect des conditions de contenu",
      "Gains seulement si dans TOP 10 sur 100",
      "Distribution des gains le 1er du mois suivant"
    ],
    cta: "Devenir Podcasteur",
    nextStep: "Déposez votre premier podcast",
    advantage: "Construisez une audience d'auditeurs engagés"
  },

  contributor: {
    title: "Contributeur",
    subtitle: "Soutenant de contenu audiovisuel",
    icon: TrendingUp,
    color: "bg-emerald-500/20 border-emerald-500/40",
    textColor: "text-emerald-300",
    description: "Découvrez et soutenez les meilleurs projets audiovisuels. Potentiellement gagnant si dans TOP 10.",
    features: [
      "Sélection de contenus audiovisuels à soutenir",
      "Contribution de 2€ à 20€ par projet",
      "Paiement hybride: 30% euros + 70% VIXUpoints",
      "Visionnage d'extraits avant achat",
      "Consultation des résumés complets",
      "Gains potentiels si dans TOP 10 contributeurs",
      "Retrait des gains via Stripe Connect",
      "Caution initiale: 20€ (remboursable)"
    ],
    restrictions: [
      "Contribution minimale 2€ par projet",
      "Gains seulement si dans TOP 10 ou 11-100",
      "Distribution des gains le 1er du mois suivant"
    ],
    cta: "Devenir Contributeur",
    nextStep: "Commencez à soutenir vos projets vidéo préférés",
    advantage: "Gagnez entre 1% et 40% des pools de contribution selon votre classement"
  },

  contribu_lecteur: {
    title: "Contribu-lecteur",
    subtitle: "Soutenant de contenu littéraire",
    icon: Heart,
    color: "bg-amber-500/20 border-amber-500/40",
    textColor: "text-amber-300",
    description: "Soutenez les auteurs en contribuant à leurs projets littéraires et potentiellement gagnant.",
    features: [
      "Sélection de contenus littéraires à soutenir",
      "Contribution de 2€ à 20€ par projet",
      "Paiement hybride: 30% euros + 70% VIXUpoints",
      "Lecture d'extraits avant achat",
      "Consultation des résumés complets",
      "Gains potentiels si dans TOP 10 contribu-lecteurs",
      "Retrait des gains via Stripe Connect",
      "Caution initiale: 20€ (remboursable)"
    ],
    restrictions: [
      "Contribution minimale 2€ par projet",
      "Gains seulement si dans TOP 10 ou 11-100",
      "Distribution des gains le dernier jour du mois"
    ],
    cta: "Devenir Contribu-lecteur",
    nextStep: "Commencez à soutenir vos auteurs préférés",
    advantage: "Gagnez entre 1% et 40% en soutenant les meilleurs contenus littéraires"
  },

  auditeur: {
    title: "Auditeur",
    subtitle: "Soutenant de contenu audio",
    icon: Headphones,
    color: "bg-violet-500/20 border-violet-500/40",
    textColor: "text-violet-300",
    description: "Soutenez les podcasteurs en contribuant à leurs projets audio et potentiellement gagnant.",
    features: [
      "Sélection de podcasts à soutenir",
      "Contribution de 2€ à 20€ par podcast",
      "Paiement hybride: 30% euros + 70% VIXUpoints",
      "Écoute d'extraits avant achat",
      "Consultation des résumés complets",
      "Gains potentiels si dans TOP 10 auditeurs",
      "Retrait des gains via Stripe Connect",
      "Caution initiale: 20€ (remboursable)"
    ],
    restrictions: [
      "Contribution minimale 2€ par podcast",
      "Gains seulement si dans TOP 10 ou 11-100",
      "Distribution des gains le dernier jour du mois"
    ],
    cta: "Devenir Auditeur",
    nextStep: "Commencez à soutenir vos podcasts préférés",
    advantage: "Gagnez entre 1% et 40% en soutenant les meilleurs podcasts"
  }
}

export default function GuideProfilesPage() {
  const router = useRouter()
  const [selectedProfile, setSelectedProfile] = useState<ProfileKey | null>(null)

  const profile = selectedProfile ? PROFILES[selectedProfile] : null
  const IconComponent = profile?.icon

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/50">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                if (selectedProfile) {
                  setSelectedProfile(null)
                } else {
                  router.back()
                }
              }}
              className="p-2 rounded-xl bg-slate-800/50 border border-slate-700/50 text-slate-400 hover:text-white hover:bg-slate-700/50 transition-all"
              aria-label="Retour"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">Guide des Profils VIXUAL</h1>
              <p className="text-sm text-slate-500">Découvrez le profil qui vous correspond le mieux</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {!selectedProfile ? (
          <>
            {/* Hero */}
            <div className="text-center mb-12">
              <div className="flex items-center justify-center gap-4 md:gap-6 mb-4">
                <TrafficLight size="md" />
                <h2 className="text-3xl md:text-4xl font-bold">Choisissez votre profil</h2>
                <TrafficLight size="md" />
              </div>
              <p className="text-slate-400 max-w-2xl mx-auto mb-8">
                Chaque profil offre des avantages uniques. Explorez les différentes façons de participer à VIXUAL.
              </p>
            </div>

            {/* Profile Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {Object.entries(PROFILES).map(([key, prof]) => {
                const Prof = prof.icon
                return (
                  <button
                    key={key}
                    onClick={() => setSelectedProfile(key as ProfileKey)}
                    className={`p-6 rounded-2xl border transition-all hover:shadow-lg hover:shadow-slate-900 ${prof.color} text-left group`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <Prof className={`h-8 w-8 ${prof.textColor}`} />
                      <ArrowRight className="h-4 w-4 text-slate-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-1">{prof.title}</h3>
                    <p className="text-sm text-slate-400 mb-3">{prof.subtitle}</p>
                    <p className="text-xs text-slate-500 line-clamp-2">{prof.description}</p>
                  </button>
                )
              })}
            </div>

            {/* Carte informative - 9eme carte */}
            <Card className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 border-amber-500/30 mb-6">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0">
                  <CheckCircle className="h-6 w-6 text-amber-400" />
                </div>
                <div>
                  <p className="font-semibold text-amber-100 mb-1">Information importante</p>
                  <p className="text-sm text-amber-50/80">Tous les profils peuvent bénéficier d'un accès complet sauf profil limité pour « Invité ».</p>
                </div>
              </CardContent>
            </Card>

            {/* Carte Pourquoi se specialiser */}
            <Card className="bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-purple-500/10 border-purple-500/30 mb-6">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0">
                    <Target className="h-6 w-6 text-purple-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-purple-100 mb-2">Pourquoi se specialiser ?</p>
                    <p className="text-sm text-purple-50/80 mb-3">En vous concentrant sur une categorie (Films, Ecrits ou Podcasts) :</p>
                    <ul className="space-y-2 text-sm text-white/70">
                      <li className="flex items-center gap-2">
                        <ArrowRight className="h-4 w-4 text-purple-400" />
                        Vos contributions sont plus ciblees
                      </li>
                      <li className="flex items-center gap-2">
                        <ArrowRight className="h-4 w-4 text-purple-400" />
                        Votre impact sur le classement est renforce
                      </li>
                      <li className="flex items-center gap-2">
                        <ArrowRight className="h-4 w-4 text-purple-400" />
                        Votre comprehension des projets est meilleure
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Carte Connexion - 11eme encart */}
            <Card className="bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-emerald-500/10 border-emerald-500/30 mb-12">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                      <LogIn className="h-6 w-6 text-emerald-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-emerald-100 mb-1">Pret a commencer ?</p>
                      <p className="text-sm text-emerald-50/80">Connectez-vous ou creez votre compte pour acceder a toutes les fonctionnalites.</p>
                    </div>
                  </div>
                  <Link href="/login">
                    <Button className="bg-emerald-600 hover:bg-emerald-500 text-white px-6">
                      <LogIn className="h-4 w-4 mr-2" />
                      Connexion
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          profile && (
            <>
              {/* Detail View */}
              <div className="mb-8">
                <div className={`p-8 rounded-2xl border ${profile.color} mb-8`}>
                  <div className="flex items-start gap-4 mb-4">
                    {IconComponent && <IconComponent className={`h-12 w-12 ${profile.textColor}`} />}
                    <div className="flex-1">
                      <h2 className="text-4xl font-bold text-white mb-1">{profile.title}</h2>
                      <p className="text-lg text-slate-400">{profile.subtitle}</p>
                    </div>
                  </div>
                  <p className="text-white/70 mb-6">{profile.description}</p>
                  <Link href="/dashboard">
                    <Button className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700">
                      {profile.cta}
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </div>

                {/* Advantage Box */}
                {profile.advantage && (
                  <Card className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-500/30 mb-8">
                    <CardContent className="p-6 flex items-start gap-3">
                      <Zap className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-amber-100 mb-1">Avantage clé</p>
                        <p className="text-sm text-amber-50">{profile.advantage}</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Features & Restrictions Grid */}
              <div className="grid md:grid-cols-2 gap-8 mb-8">
                {/* Features */}
                <Card className="bg-slate-800/30 border-slate-700/30">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-emerald-300">
                      <CheckCircle className="h-5 w-5" />
                      Avantages
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {profile.features.map((feature, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="h-5 w-5 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0 mt-0.5">
                          <div className="h-2 w-2 rounded-full bg-emerald-400" />
                        </div>
                        <p className="text-sm text-white/70">{feature}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Restrictions */}
                <Card className="bg-slate-800/30 border-slate-700/30">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-amber-300">
                      <AlertCircle className="h-5 w-5" />
                      À savoir
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {profile.restrictions.map((restriction, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="h-5 w-5 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0 mt-0.5">
                          <div className="h-2 w-2 rounded-full bg-amber-400" />
                        </div>
                        <p className="text-sm text-white/70">{restriction}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Next Step */}
              <Card className="bg-gradient-to-r from-teal-500/10 to-cyan-500/10 border-teal-500/30">
                <CardContent className="p-6">
                  <p className="text-sm text-slate-400 mb-2">Prochaine étape</p>
                  <p className="text-lg font-semibold text-teal-300 mb-4">{profile.nextStep}</p>
                  <Link href="/dashboard">
                    <Button className="bg-teal-600 hover:bg-teal-700 w-full">
                      Accéder au tableau de bord
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </>
          )
        )}
      </div>
    </main>
  )
}
