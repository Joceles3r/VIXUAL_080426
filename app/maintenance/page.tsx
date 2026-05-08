"use client"

import { Button } from "@/components/ui/button"
import { RefreshCw, Settings, Mail, ExternalLink } from "lucide-react"
import Link from "next/link"

export default function MaintenancePage() {
  const handleRetry = () => {
    window.location.reload()
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
      <div className="max-w-lg w-full text-center">
        {/* Animated Icon */}
        <div className="relative mb-8">
          <div className="w-24 h-24 mx-auto rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center animate-pulse">
            <Settings className="h-12 w-12 text-amber-400 animate-spin" style={{ animationDuration: '4s' }} />
          </div>
          <div className="absolute inset-0 w-24 h-24 mx-auto rounded-full border-2 border-amber-500/20 animate-ping" style={{ animationDuration: '2s' }} />
        </div>

        {/* Logo */}
        <div className="mb-6">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
            VIXUAL
          </h1>
          <p className="text-white/40 text-sm mt-1">Regarde - Soutiens - Participe</p>
        </div>

        {/* Main Message */}
        <div className="bg-slate-900/50 border border-amber-500/30 rounded-2xl p-8 mb-6">
          <h2 className="text-2xl font-bold text-white mb-4">
            Maintenance en cours
          </h2>
          <p className="text-white/70 leading-relaxed mb-6">
            Nos equipes ameliorent actuellement la plateforme afin de vous offrir une meilleure experience.
            Certaines fonctionnalites sont momentanement indisponibles.
          </p>

          {/* Status Indicator */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-amber-400 text-sm font-medium">En cours de maintenance</span>
          </div>

          {/* Info Box */}
          <div className="bg-slate-800/50 rounded-lg p-4 text-left">
            <p className="text-white/50 text-sm">
              <span className="text-white/70 font-medium">Duree estimee:</span> Variable selon les travaux
            </p>
            <p className="text-white/50 text-sm mt-1">
              <span className="text-white/70 font-medium">Services affectes:</span> Contributions, Achats, Retraits
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
          <Button 
            onClick={handleRetry}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Reessayer
          </Button>
          <Button 
            variant="outline"
            className="border-white/20 text-white hover:bg-white/10"
            asChild
          >
            <Link href="mailto:support@vixual.fr">
              <Mail className="h-4 w-4 mr-2" />
              Contacter le support
            </Link>
          </Button>
        </div>

        {/* Footer */}
        <div className="text-white/40 text-sm">
          <p>Merci pour votre patience et votre comprehension.</p>
          <div className="flex items-center justify-center gap-4 mt-4">
            <Link href="/faq" className="text-emerald-400 hover:underline flex items-center gap-1">
              FAQ <ExternalLink className="h-3 w-3" />
            </Link>
            <span>-</span>
            <Link href="/contact" className="text-emerald-400 hover:underline flex items-center gap-1">
              Contact <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
        </div>

        {/* VIXUAL Signature */}
        <div className="mt-12 pt-6 border-t border-white/10">
          <p className="text-white/30 text-xs">
            VIXUAL SAS - Plateforme de financement participatif audiovisuel, litteraire et podcast
          </p>
        </div>
      </div>
    </div>
  )
}
