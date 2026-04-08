"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  CreditCard,
  Wallet,
  Shield,
  Clock,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  Smartphone,
  Building2,
  Lock,
  Zap,
  HelpCircle,
  Users,
  XCircle,
  ExternalLink,
  AlertCircle,
} from "lucide-react"
import { VisualHeader } from "@/components/visual-header"
import { Footer } from "@/components/footer"

const PAYER_STEPS = [
  {
    icon: CreditCard,
    title: "Carte bancaire",
    description: "Visa, Mastercard, American Express acceptees",
    detail: "Paiement securise via Stripe",
  },
  {
    icon: Smartphone,
    title: "Pas de compte Stripe",
    description: "Aucune inscription requise pour payer",
    detail: "Vous payez directement avec votre carte",
  },
  {
    icon: Zap,
    title: "Instantane",
    description: "Votre contribution est creditee immediatement",
    detail: "Confirmation par email",
  },
]

const RECEVOIR_STEPS = [
  {
    icon: Building2,
    title: "Compte Stripe Connect",
    description: "Creation en 2 minutes",
    detail: "Identite verifiee une seule fois",
  },
  {
    icon: Wallet,
    title: "Virement bancaire",
    description: "Vers votre compte personnel",
    detail: "Delai: 2-7 jours ouvrables",
  },
]

const SECURITY_POINTS = [
  {
    icon: Lock,
    title: "Chiffrement SSL/TLS",
    description: "Toutes les donnees sont chiffrees",
  },
  {
    icon: Shield,
    title: "Certifie PCI-DSS",
    description: "Stripe respecte les normes bancaires les plus strictes",
  },
  {
    icon: CheckCircle,
    title: "Zero stockage sur VIXUAL",
    description: "Vos donnees bancaires ne transitent jamais par nos serveurs",
  },
]

// Profils concernes par l'obligation Stripe
const PROFILS_STRIPE_OBLIGATOIRE = [
  { name: "Porteur", description: "Pour recevoir les revenus de vos projets video" },
  { name: "Infoporteur", description: "Pour recevoir les revenus de vos ecrits" },
  { name: "Podcasteur", description: "Pour recevoir les revenus de vos podcasts" },
  { name: "Contributeur", description: "Pour percevoir vos gains eventuels" },
  { name: "ContribuLecteur", description: "Pour percevoir vos gains de lecture" },
  { name: "Auditeur", description: "Pour percevoir vos gains d'ecoute" },
]

const PROFILS_STRIPE_NON_REQUIS = [
  { name: "Invite", description: "Acces limite, pas de gains possibles" },
  { name: "Visiteur", description: "Consultation uniquement, pas de gains" },
]

const STRIPE_ONBOARDING_STEPS = [
  { step: 1, title: "Cliquez sur \"Activer Stripe\"", description: "Depuis votre dashboard ou wallet" },
  { step: 2, title: "Remplissez vos informations", description: "Identite + coordonnees bancaires (2 min)" },
  { step: 3, title: "Validez votre compte", description: "Verification automatique par Stripe" },
  { step: 4, title: "Recevez vos gains", description: "Versements automatiques sur votre compte" },
]

export default function GuideStripePage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <VisualHeader />

      <main className="max-w-4xl mx-auto px-4 py-12">
        {/* Back button */}
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-6 text-white/60 hover:text-white hover:bg-white/10"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>

        {/* Hero */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
              <CreditCard className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Guide <span className="text-violet-400">Paiements</span>
          </h1>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
            Tout ce que vous devez savoir sur les paiements sur VIXUAL.<br />
            Simple, securise et transparent.
          </p>
        </div>

        {/* Section PAYER */}
        <Card className="bg-emerald-500/5 border-emerald-500/20 mb-8">
          <CardHeader>
            <CardTitle className="text-emerald-400 flex items-center gap-3 text-2xl">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-emerald-400" />
              </div>
              Comment payer (contribuer)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              {PAYER_STEPS.map((step, idx) => (
                <div key={idx} className="text-center">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 flex items-center justify-center mx-auto mb-4">
                    <step.icon className="h-7 w-7 text-emerald-400" />
                  </div>
                  <h3 className="text-white font-semibold mb-2">{step.title}</h3>
                  <p className="text-white/70 text-sm mb-1">{step.description}</p>
                  <p className="text-white/50 text-xs">{step.detail}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 p-4 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
              <p className="text-emerald-300 text-sm text-center">
                <CheckCircle className="inline h-4 w-4 mr-2" />
                Aucun compte Stripe requis pour contribuer - Payez directement avec votre carte bancaire
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Section RECEVOIR */}
        <Card className="bg-violet-500/5 border-violet-500/20 mb-8">
          <CardHeader>
            <CardTitle className="text-violet-400 flex items-center gap-3 text-2xl">
              <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center">
                <Wallet className="h-5 w-5 text-violet-400" />
              </div>
              Comment recevoir (createurs)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              {RECEVOIR_STEPS.map((step, idx) => (
                <div key={idx} className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-violet-500/15 flex items-center justify-center shrink-0">
                    <step.icon className="h-6 w-6 text-violet-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">{step.title}</h3>
                    <p className="text-white/70 text-sm mb-1">{step.description}</p>
                    <p className="text-white/50 text-xs">{step.detail}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-4 p-4 bg-violet-500/10 rounded-lg border border-violet-500/20">
              <Clock className="h-5 w-5 text-violet-400 shrink-0" />
              <div>
                <p className="text-violet-300 text-sm font-medium">Configuration unique</p>
                <p className="text-white/60 text-xs">
                  Creez votre compte Stripe Connect une seule fois (2 minutes). 
                  Ensuite, tous vos gains sont automatiquement verses sur votre compte bancaire.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section OBLIGATION STRIPE PAR PROFIL */}
        <Card className="bg-amber-500/5 border-amber-500/20 mb-8">
          <CardHeader>
            <CardTitle className="text-amber-400 flex items-center gap-3 text-2xl">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                <Users className="h-5 w-5 text-amber-400" />
              </div>
              Qui doit activer Stripe ?
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Message cle */}
            <div className="p-4 bg-amber-500/10 rounded-lg border border-amber-500/20 mb-6">
              <p className="text-amber-300 text-sm text-center font-medium">
                <AlertCircle className="inline h-4 w-4 mr-2" />
                Stripe n&apos;est PAS une contrainte - C&apos;est l&apos;outil necessaire pour recevoir vos gains
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Profils concernes */}
              <div>
                <h3 className="text-emerald-400 font-semibold mb-4 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Compte Stripe OBLIGATOIRE
                </h3>
                <div className="space-y-3">
                  {PROFILS_STRIPE_OBLIGATOIRE.map((profil, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 bg-emerald-500/5 rounded-lg border border-emerald-500/10">
                      <CheckCircle className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-white font-medium text-sm">{profil.name}</p>
                        <p className="text-white/50 text-xs">{profil.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Profils non concernes */}
              <div>
                <h3 className="text-white/60 font-semibold mb-4 flex items-center gap-2">
                  <XCircle className="h-5 w-5" />
                  Compte Stripe NON requis
                </h3>
                <div className="space-y-3">
                  {PROFILS_STRIPE_NON_REQUIS.map((profil, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 bg-white/5 rounded-lg border border-white/10">
                      <XCircle className="h-4 w-4 text-white/40 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-white/70 font-medium text-sm">{profil.name}</p>
                        <p className="text-white/40 text-xs">{profil.description}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 p-3 bg-sky-500/10 rounded-lg border border-sky-500/20">
                  <p className="text-sky-300 text-xs">
                    <CheckCircle className="inline h-3 w-3 mr-1" />
                    Stripe n&apos;est PAS obligatoire pour UTILISER VIXUAL ni pour PAYER/CONTRIBUER
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section PROCEDURE ACTIVATION */}
        <Card className="bg-violet-500/5 border-violet-500/20 mb-8">
          <CardHeader>
            <CardTitle className="text-violet-400 flex items-center gap-3 text-2xl">
              <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center">
                <Zap className="h-5 w-5 text-violet-400" />
              </div>
              Activer Stripe en 4 etapes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4 mb-6">
              {STRIPE_ONBOARDING_STEPS.map((item) => (
                <div key={item.step} className="text-center">
                  <div className="w-10 h-10 rounded-full bg-violet-500/20 flex items-center justify-center mx-auto mb-3 text-violet-400 font-bold">
                    {item.step}
                  </div>
                  <h4 className="text-white font-medium text-sm mb-1">{item.title}</h4>
                  <p className="text-white/50 text-xs">{item.description}</p>
                </div>
              ))}
            </div>

            {/* CTA Stripe officiel */}
            <div className="p-6 bg-gradient-to-r from-violet-500/10 to-purple-500/10 rounded-xl border border-violet-500/20 text-center">
              <h3 className="text-white font-semibold mb-2">Pret a recevoir vos gains ?</h3>
              <p className="text-white/60 text-sm mb-4">
                Creez votre compte Stripe gratuitement en 2 minutes
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/dashboard/wallet">
                  <Button className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white">
                    <Wallet className="mr-2 h-4 w-4" />
                    Activer depuis mon Wallet
                  </Button>
                </Link>
                <a 
                  href="https://stripe.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" className="border-violet-500/30 text-violet-300 hover:bg-violet-500/10">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Ouvrir un compte Stripe
                  </Button>
                </a>
              </div>
              <p className="text-white/40 text-xs mt-3">
                Lien officiel: stripe.com - 100% gratuit, aucun abonnement
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Section SECURITE */}
        <Card className="bg-sky-500/5 border-sky-500/20 mb-8">
          <CardHeader>
            <CardTitle className="text-sky-400 flex items-center gap-3 text-2xl">
              <div className="w-10 h-10 rounded-xl bg-sky-500/20 flex items-center justify-center">
                <Shield className="h-5 w-5 text-sky-400" />
              </div>
              Securite des paiements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              {SECURITY_POINTS.map((point, idx) => (
                <div key={idx} className="text-center p-4 bg-sky-500/5 rounded-lg">
                  <point.icon className="h-8 w-8 text-sky-400 mx-auto mb-3" />
                  <h3 className="text-white font-semibold mb-1 text-sm">{point.title}</h3>
                  <p className="text-white/60 text-xs">{point.description}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 text-center">
              <Badge className="bg-sky-500/20 text-sky-300 border-sky-500/30">
                <Shield className="h-3 w-3 mr-1" />
                Stripe est utilise par des millions d&apos;entreprises dans le monde
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* FAQ rapide */}
        <Card className="bg-white/5 border-white/10 mb-8">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-amber-400" />
              Questions frequentes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="text-white font-medium mb-1">Dois-je creer un compte Stripe ?</h4>
              <p className="text-white/60 text-sm">Oui, uniquement si vous souhaitez recevoir vos gains. Sans Stripe, les gains ne peuvent pas etre verses.</p>
            </div>
            <div>
              <h4 className="text-white font-medium mb-1">Pourquoi Stripe est obligatoire pour les gains ?</h4>
              <p className="text-white/60 text-sm">Pour recevoir vos gains, securiser vos paiements, et transferer l&apos;argent vers votre compte bancaire. C&apos;est le seul moyen legal et securise.</p>
            </div>
            <div>
              <h4 className="text-white font-medium mb-1">Puis-je payer/contribuer sans compte Stripe ?</h4>
              <p className="text-white/60 text-sm">Oui absolument ! Les contributeurs n&apos;ont pas besoin de compte Stripe. Vous payez directement avec votre carte bancaire.</p>
            </div>
            <div>
              <h4 className="text-white font-medium mb-1">Combien de temps pour creer un compte Stripe ?</h4>
              <p className="text-white/60 text-sm">Environ 2 minutes. Vous aurez besoin d&apos;une piece d&apos;identite et de vos coordonnees bancaires (IBAN).</p>
            </div>
            <div>
              <h4 className="text-white font-medium mb-1">VIXUAL a-t-il acces a mes donnees bancaires ?</h4>
              <p className="text-white/60 text-sm">Non. Toutes les donnees bancaires sont gerees exclusivement par Stripe. VIXUAL ne stocke aucune information sensible.</p>
            </div>
            <div>
              <h4 className="text-white font-medium mb-1">Quels sont les frais Stripe ?</h4>
              <p className="text-white/60 text-sm">Stripe preleve des frais standards (environ 1.4% + 0.25EUR par transaction). VIXUAL preleve sa commission selon les regles de la plateforme.</p>
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="text-center">
          <Link href="/dashboard">
            <Button className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white px-8 py-3">
              Acceder a mon dashboard
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  )
}
