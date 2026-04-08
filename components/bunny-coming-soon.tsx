"use client"

import { useState } from "react"
import { Play, Upload, Check, Clock, Mail, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"

interface BunnyComingSoonProps {
  type: "upload" | "stream"
  contentTitle?: string
  className?: string
}

export function BunnyComingSoon({ type, contentTitle, className = "" }: BunnyComingSoonProps) {
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || submitted) return
    setLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setSubmitted(true)
    setLoading(false)
  }

  const Icon = type === "upload" ? Upload : Play
  const title = type === "upload" ? "Upload bientot disponible" : "Streaming bientot disponible"
  const description = type === "upload"
    ? "Le module d'upload de contenus est en cours d'activation. Vous pourrez bientot publier vos creations."
    : "Le module de streaming est en cours d'activation. Revenez tres bientot pour visionner ce contenu."

  return (
    <Card className={`bg-slate-900/70 border-emerald-500/20 ${className}`}>
      <CardContent className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mb-4 border border-emerald-500/30">
            <Icon className="h-8 w-8 text-emerald-400" />
          </div>
          <h3 className="text-white font-bold text-xl mb-2">{title}</h3>
          {contentTitle && (
            <p className="text-white/50 text-sm mb-2">{contentTitle}</p>
          )}
          <p className="text-white/60 text-sm max-w-sm">{description}</p>
        </div>

        {/* Checklist */}
        <div className="space-y-3 bg-slate-800/50 rounded-lg p-4 border border-white/5">
          <p className="text-white/50 text-xs uppercase tracking-wider mb-3">Progression du lancement</p>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <Check className="h-3.5 w-3.5 text-emerald-400" />
              </div>
              <span className="text-white/70 text-sm">Plateforme VIXUAL</span>
              <span className="ml-auto text-emerald-400 text-xs font-medium">Active</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <Check className="h-3.5 w-3.5 text-emerald-400" />
              </div>
              <span className="text-white/70 text-sm">Systeme de paiement Stripe</span>
              <span className="ml-auto text-emerald-400 text-xs font-medium">Actif</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center">
                <Clock className="h-3.5 w-3.5 text-amber-400 animate-pulse" />
              </div>
              <span className="text-white/70 text-sm">Module Bunny.net</span>
              <span className="ml-auto text-amber-400 text-xs font-medium">En attente</span>
            </div>
          </div>
        </div>

        {/* Notification form */}
        <div className="space-y-3">
          <p className="text-white/50 text-xs text-center">Etre notifie au lancement</p>
          {submitted ? (
            <div className="flex items-center justify-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
              <Check className="h-4 w-4 text-emerald-400" />
              <span className="text-emerald-400 text-sm">Vous serez notifie par email</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex gap-2">
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                <Input
                  type="email"
                  placeholder="Votre email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-slate-800/50 border-white/10 text-white placeholder:text-white/40 focus:border-emerald-500/50"
                  required
                />
              </div>
              <Button 
                type="submit" 
                disabled={loading}
                className="bg-emerald-600 hover:bg-emerald-500 text-white"
              >
                {loading ? (
                  <Clock className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </form>
          )}
        </div>

        {/* Badge */}
        <div className="flex justify-center">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-emerald-400 text-sm font-medium">Lancement imminent</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
