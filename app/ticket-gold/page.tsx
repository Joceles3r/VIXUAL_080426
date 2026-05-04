"use client"

import { VersionGuard } from "@/components/version-guard"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Rocket,
  Eye,
  TrendingUp,
  Clock,
  CheckCircle,
  ArrowLeft,
  Sparkles,
  AlertCircle,
  CreditCard,
  Shield,
  XCircle,
} from "lucide-react"
import { VisualHeader } from "@/components/vixual-header"
import { Footer } from "@/components/footer"
import { TICKET_GOLD_CONFIG, TICKET_GOLD_UI } from "@/lib/ticket-gold/engine"

const TICKET_GOLD_BENEFITS = [
  {
    icon: Eye,
    title: "Visibilite boostee +50%",
    description: "Votre projet remonte dans les recommandations et la page Explorer pendant 48h.",
    color: "text-amber-400",
    bg: "bg-amber-500/15",
  },
  {
    icon: TrendingUp,
    title: "Plus d'impressions",
    description: "Augmentez le nombre de vues qualifiees et d'interactions sur votre contenu.",
    color: "text-emerald-400",
    bg: "bg-emerald-500/15",
  },
  {
    icon: Clock,
    title: "48 heures de boost",
    description: "Le boost est actif pendant 48h a partir de l'achat, sans interruption.",
    color: "text-sky-400",
    bg: "bg-sky-500/15",
  },
  {
    icon: Sparkles,
    title: "Badge Boost Gold",
    description: "Votre projet affiche un badge distinctif pendant toute la duree du boost.",
    color: "text-violet-400",
    bg: "bg-violet-500/15",
  },
]

const TICKET_GOLD_RULES = [
  { text: "1 Ticket Gold maximum par projet par mois", allowed: true },
  { text: "Boost de visibilite uniquement, pas de modification des votes", allowed: true },
  { text: "Pas de gain financier direct lie au ticket", allowed: true },
  { text: "Fonctionne avec tous les types de contenus", allowed: true },
]

const FORBIDDEN_RULES = [
  { text: "Modification des votes ou du classement", forbidden: true },
  { text: "Gain financier direct via le ticket", forbidden: true },
  { text: "Acces gratuit massif aux contenus", forbidden: true },
  { text: "Cumul de plusieurs tickets sur un meme projet", forbidden: true },
]

export default function TicketGoldPage() {
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(false)

  const handlePurchase = async () => {
    setIsProcessing(true)
    // NOTE post-Bunny: Integrer avec Stripe pour le paiement reel
    // Pour l'instant, redirection vers la page de selection de projet
    setTimeout(() => {
      router.push("/dashboard/projects?action=ticket-gold")
      setIsProcessing(false)
    }, 1000)
  }

  return (
    <VersionGuard requiredVersion="V3">
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <VisualHeader />

      <main className="max-w-5xl mx-auto px-4 py-12">
        {/* Back button */}
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-6 text-white/60 hover:text-white hover:bg-white/10"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>

        {/* Hero Section with explanation */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center shadow-lg shadow-amber-500/30">
              <Rocket className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Ticket Gold <span className="text-amber-400">VIXUAL</span>
          </h1>
          
          {/* Explanation in 3 lines */}
          <div className="max-w-2xl mx-auto bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border border-amber-500/20 rounded-xl p-6 mb-8">
            <p className="text-white/90 text-lg leading-relaxed">
              <strong className="text-amber-400">Le Ticket Gold</strong> est un boost de visibilite temporaire pour vos projets.<br />
              Pour seulement <strong className="text-amber-400">{TICKET_GOLD_CONFIG.priceDisplay}</strong>, votre projet beneficie de +50% de visibilite pendant <strong className="text-amber-400">48 heures</strong>.<br />
              Limité a 1 ticket par mois par projet pour garantir l'equite de la plateforme.
            </p>
          </div>

          {/* Price badge */}
          <Badge className="bg-gradient-to-r from-amber-500 to-yellow-600 text-white text-xl px-6 py-3 mb-4">
            <CreditCard className="mr-2 h-5 w-5" />
            {TICKET_GOLD_CONFIG.priceDisplay} / ticket
          </Badge>
          <p className="text-white/50 text-sm">Paiement securise par Stripe</p>
        </div>

        {/* Benefits Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {TICKET_GOLD_BENEFITS.map((benefit, idx) => (
            <Card
              key={idx}
              className={`${benefit.bg} border-white/10 hover:border-amber-500/30 transition-colors`}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl ${benefit.bg}`}>
                    <benefit.icon className={`h-6 w-6 ${benefit.color}`} />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-2">{benefit.title}</h3>
                    <p className="text-white/60 text-sm">{benefit.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Rules Section */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Ce qui est inclus */}
          <Card className="bg-emerald-500/5 border-emerald-500/20">
            <CardHeader>
              <CardTitle className="text-emerald-400 flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Ce qui est inclus
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {TICKET_GOLD_RULES.map((rule, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="text-white/80 text-sm">{rule.text}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Ce qui est interdit */}
          <Card className="bg-rose-500/5 border-rose-500/20">
            <CardHeader>
              <CardTitle className="text-rose-400 flex items-center gap-2">
                <XCircle className="h-5 w-5" />
                Ce qui est interdit
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {FORBIDDEN_RULES.map((rule, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <XCircle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
                  <span className="text-white/80 text-sm">{rule.text}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* How it works */}
        <Card className="bg-white/5 border-white/10 mb-12">
          <CardHeader>
            <CardTitle className="text-white">Comment ca marche ?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto mb-3">
                  <span className="text-amber-400 font-bold">1</span>
                </div>
                <p className="text-white/80 text-sm">Selectionnez un projet dans votre dashboard</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto mb-3">
                  <span className="text-amber-400 font-bold">2</span>
                </div>
                <p className="text-white/80 text-sm">Payez {TICKET_GOLD_CONFIG.priceDisplay} par carte bancaire</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto mb-3">
                  <span className="text-amber-400 font-bold">3</span>
                </div>
                <p className="text-white/80 text-sm">Le boost s'active immediatement</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto mb-3">
                  <span className="text-amber-400 font-bold">4</span>
                </div>
                <p className="text-white/80 text-sm">Profitez de +50% de visibilite pendant 48h</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="text-center">
          <Button
            onClick={handlePurchase}
            disabled={isProcessing}
            className="bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-white text-lg px-8 py-6 h-auto"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2" />
                Traitement...
              </>
            ) : (
              <>
                <Rocket className="mr-2 h-5 w-5" />
                Acheter un Ticket Gold - {TICKET_GOLD_CONFIG.priceDisplay}
              </>
            )}
          </Button>
          <p className="text-white/40 text-sm mt-4 flex items-center justify-center gap-2">
            <Shield className="h-4 w-4" />
            Paiement 100% securise par Stripe - Aucune donnee bancaire stockee sur VIXUAL
          </p>
        </div>
      </main>

      <Footer />
    </div>
    </VersionGuard>
  )
}
