"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Users, Crown, Film, BookOpen, Mic, TrendingUp, ArrowRight, X } from "lucide-react"

interface OnboardingProps {
  isOpen: boolean
  onClose: () => void
}

export function OnboardingProfileGuide({ isOpen, onClose }: OnboardingProps) {
  const [step, setStep] = useState(1)

  const steps = [
    {
      title: "Bienvenue sur VIXUAL",
      description: "Découvrez comment participer à la plateforme selon votre profil",
      icon: Users,
      content: "VIXUAL propose 8 profils : 1 Invite (non inscrit) + 7 inscrits (Visiteur, Porteur, Infoporteur, Podcasteur, Contributeur, Contribu-lecteur, Auditeur). Chacun offre des avantages uniques!"
    },
    {
      title: "Invité ou Visiteur?",
      description: "Choisissez votre mode d'accès initial",
      icon: Crown,
      content: "En tant qu'Invité, explorez VIXUAL librement. En tant que Visiteur, débloquez le paiement hybride (30% euros + 70% VIXUpoints) et Vixual Social!"
    },
    {
      title: "Vous créez du contenu?",
      description: "Devenez créateur et monétisez votre talent",
      icon: Film,
      content: "Porteur (vidéos), Infoporteur (livres/articles) ou Podcasteur (podcasts) - Déposez votre contenu, fixez le prix, et gagnez via royalties si vous êtes TOP 10!"
    },
    {
      title: "Vous soutinez des projets?",
      description: "Devenez Contributeur et potentiellement gagnant",
      icon: TrendingUp,
      content: "Soutenez des projets audiovisuels de 2€ à 20€. Gagnez entre 1% et 40% selon votre classement si vous êtes TOP 10 ou 11-100!"
    },
    {
      title: "Commencez maintenant",
      description: "Choisissez votre chemin sur VIXUAL",
      icon: ArrowRight,
      content: "Consultez notre guide complet des profils pour comprendre en détail tous les avantages et responsabilités de chaque rôle."
    }
  ]

  const currentStep = steps[step - 1]
  const Icon = currentStep.icon

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-slate-900 border-slate-800">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-2xl text-white">{currentStep.title}</DialogTitle>
              <DialogDescription className="text-sm text-slate-400 mt-2">
                {currentStep.description}
              </DialogDescription>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Icon & Content */}
          <div className="flex flex-col items-center text-center">
            <div className="p-4 rounded-full bg-teal-500/20 mb-4">
              <Icon className="h-8 w-8 text-teal-400" />
            </div>
            <p className="text-white/70">{currentStep.content}</p>
          </div>

          {/* Progress Indicator */}
          <div className="flex items-center justify-center gap-2">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-2 w-2 rounded-full transition-all ${
                  i < step ? "bg-teal-500 w-6" : i === step - 1 ? "bg-teal-400" : "bg-slate-700"
                }`}
              />
            ))}
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            {step > 1 && (
              <Button
                variant="outline"
                onClick={() => setStep(step - 1)}
                className="flex-1"
              >
                Précédent
              </Button>
            )}
            {step < steps.length ? (
              <Button
                onClick={() => setStep(step + 1)}
                className="flex-1 bg-teal-600 hover:bg-teal-700"
              >
                Suivant
              </Button>
            ) : (
              <Link href="/guide-profiles" onClick={onClose} className="flex-1">
                <Button className="w-full bg-teal-600 hover:bg-teal-700">
                  Voir le guide complet
                </Button>
              </Link>
            )}
          </div>

          {/* Skip Option */}
          <button
            onClick={onClose}
            className="w-full text-sm text-slate-400 hover:text-white transition-colors py-2"
          >
            Ignorer ce guide
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Quick Profile Cards Component
export function ProfileQuickCards() {
  const profiles = [
    { icon: Users, title: "Invité", desc: "Explore gratuitement", color: "from-slate-500 to-slate-600" },
    { icon: Crown, title: "Visiteur", desc: "Accès complet", color: "from-emerald-500 to-teal-600" },
    { icon: Film, title: "Porteur", desc: "Créateur vidéo", color: "from-rose-500 to-pink-600" },
    { icon: BookOpen, title: "Infoporteur", desc: "Créateur littéraire", color: "from-sky-500 to-cyan-600" },
    { icon: Mic, title: "Podcasteur", desc: "Créateur audio", color: "from-violet-500 to-purple-600" },
    { icon: TrendingUp, title: "Contributeur", desc: "Soutien de projets", color: "from-emerald-500 to-green-600" },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {profiles.map((profile, i) => {
        const Icon = profile.icon
        return (
          <Card key={i} className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 hover:border-teal-500/50 transition-all group cursor-pointer">
            <CardContent className="p-6 text-center">
              <div className={`p-3 rounded-lg bg-gradient-to-br ${profile.color} w-fit mx-auto mb-3`}>
                <Icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold text-white mb-1 group-hover:text-teal-300 transition-colors">
                {profile.title}
              </h3>
              <p className="text-xs text-slate-400">{profile.desc}</p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
