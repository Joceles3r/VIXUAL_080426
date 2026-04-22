"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Coins, Euro, AlertCircle, CheckCircle, Info } from "lucide-react"
import { cn } from "@/lib/utils"
import { VIXUPOINTS_PER_EUR } from "@/lib/payout/constants"

// ─── Types (VERROU FINAL: cles officielles) ───

export type PaymentProfile = 
  | "visitor_minor" 
  | "visitor_adult" 
  | "contributor" 
  | "contribu_lecteur" 
  | "auditeur" 
  | "creator" 
  | "infoporteur" 
  | "podcasteur"

export interface HybridPaymentProps {
  priceEur: number
  userVixupoints: number
  userProfile: PaymentProfile
  onPayment: (option: PaymentOption) => void
  className?: string
}

export interface PaymentOption {
  vixupointsUsed: number
  eurosUsed: number
  isHybrid: boolean
  isValid: boolean
}

/** Configuration des profils pour le paiement - VERROU FINAL */
const PROFILE_PAYMENT_CONFIG: Record<PaymentProfile, {
  canUseVixupoints: boolean
  canPayEuros: boolean
  canUseHybrid: boolean
  label: string
}> = {
  visitor_minor: { canUseVixupoints: true, canPayEuros: false, canUseHybrid: false, label: "Visiteur mineur" },
  visitor_adult: { canUseVixupoints: true, canPayEuros: true, canUseHybrid: true, label: "Visiteur majeur" },
  contributor: { canUseVixupoints: false, canPayEuros: true, canUseHybrid: false, label: "Contributeur" },
  contribu_lecteur: { canUseVixupoints: true, canPayEuros: true, canUseHybrid: true, label: "Contribu-lecteur" },
  auditeur: { canUseVixupoints: true, canPayEuros: true, canUseHybrid: true, label: "Auditeur" },
  creator: { canUseVixupoints: false, canPayEuros: false, canUseHybrid: false, label: "Createur" },
  infoporteur: { canUseVixupoints: false, canPayEuros: false, canUseHybrid: false, label: "Infoporteur" },
  podcasteur: { canUseVixupoints: false, canPayEuros: false, canUseHybrid: false, label: "Podcasteur" },
}

// ─── Components ───

export function HybridPaymentSelector({
  priceEur,
  userVixupoints,
  userProfile,
  onPayment,
  className,
}: HybridPaymentProps) {
  const config = PROFILE_PAYMENT_CONFIG[userProfile]
  const priceInPoints = priceEur * VIXUPOINTS_PER_EUR
  
  // Pour le paiement hybride, on utilise un slider
  const maxPointsUsable = Math.min(userVixupoints, priceInPoints)
  const [pointsToUse, setPointsToUse] = useState(config.canUseHybrid ? Math.floor(maxPointsUsable / 2) : 0)
  
  const eurosRemaining = useMemo(() => {
    const pointsValue = pointsToUse / VIXUPOINTS_PER_EUR
    return Math.max(0, priceEur - pointsValue)
  }, [pointsToUse, priceEur])

  const canAffordFullPoints = userVixupoints >= priceInPoints

  // Determine le mode de paiement disponible
  const paymentMode = useMemo(() => {
    if (!config.canUseVixupoints && !config.canPayEuros) {
      return "none"
    }
    if (config.canUseVixupoints && !config.canPayEuros) {
      return "vixupoints_only"
    }
    if (!config.canUseVixupoints && config.canPayEuros) {
      return "euros_only"
    }
    if (config.canUseHybrid) {
      return "hybrid"
    }
    return "choice"
  }, [config])

  const handlePayment = () => {
    const option: PaymentOption = {
      vixupointsUsed: pointsToUse,
      eurosUsed: eurosRemaining,
      isHybrid: pointsToUse > 0 && eurosRemaining > 0,
      isValid: true,
    }
    onPayment(option)
  }

  // Cas: Profil non autorise a acheter
  if (paymentMode === "none") {
    return (
      <Card className={cn("bg-slate-800/50 border-slate-700", className)}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3 text-amber-400">
            <AlertCircle className="h-5 w-5" />
            <p className="text-sm">Les createurs ne peuvent pas acheter de contenu.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Cas: Visiteur mineur - VIXUpoints uniquement
  if (paymentMode === "vixupoints_only") {
    const canAfford = canAffordFullPoints
    return (
      <Card className={cn("bg-slate-800/50 border-slate-700", className)}>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Coins className="h-5 w-5 text-amber-400" />
            Paiement en VIXUpoints
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-sky-500/10 border border-sky-500/30 rounded-lg p-3">
            <p className="text-sm text-sky-200">
              En tant que visiteur mineur, vous pouvez uniquement utiliser vos VIXUpoints pour acceder aux contenus.
            </p>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-white/70">Prix du contenu</span>
            <span className="text-white font-semibold">{priceInPoints} VIXUpoints</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-white/70">Votre solde</span>
            <span className={cn("font-semibold", canAfford ? "text-emerald-400" : "text-rose-400")}>
              {userVixupoints} VIXUpoints
            </span>
          </div>

          {canAfford ? (
            <Button 
              onClick={() => onPayment({ vixupointsUsed: priceInPoints, eurosUsed: 0, isHybrid: false, isValid: true })}
              className="w-full bg-amber-600 hover:bg-amber-700"
            >
              <Coins className="h-4 w-4 mr-2" />
              Payer {priceInPoints} VIXUpoints
            </Button>
          ) : (
            <div className="text-center">
              <p className="text-rose-400 text-sm mb-2">Solde insuffisant</p>
              <p className="text-white/50 text-xs">
                Il vous manque {priceInPoints - userVixupoints} VIXUpoints. Continuez a participer pour en gagner!
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  // Cas: Contributeur - Euros uniquement
  if (paymentMode === "euros_only") {
    return (
      <Card className={cn("bg-slate-800/50 border-slate-700", className)}>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Euro className="h-5 w-5 text-emerald-400" />
            Paiement en Euros
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
            <p className="text-sm text-amber-200">
              En tant que {config.label}, le paiement s'effectue uniquement en euros.
            </p>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-white/70">Prix du contenu</span>
            <span className="text-white font-semibold">{priceEur.toFixed(2)} EUR</span>
          </div>

          <Button 
            onClick={() => onPayment({ vixupointsUsed: 0, eurosUsed: priceEur, isHybrid: false, isValid: true })}
            className="w-full bg-emerald-600 hover:bg-emerald-700"
          >
            <Euro className="h-4 w-4 mr-2" />
            Payer {priceEur.toFixed(2)} EUR
          </Button>
        </CardContent>
      </Card>
    )
  }

  // Cas: Paiement hybride disponible (visitor_adult, contribureader, auditor)
  return (
    <Card className={cn("bg-slate-800/50 border-slate-700", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Coins className="h-5 w-5 text-amber-400" />
          Paiement hybride
          <Badge variant="outline" className="ml-2 text-xs border-emerald-500/50 text-emerald-300">
            VIXUpoints + EUR
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Info pedagogique */}
        <div className="bg-teal-500/10 border border-teal-500/30 rounded-lg p-3 flex items-start gap-2">
          <Info className="h-4 w-4 text-teal-400 mt-0.5 shrink-0" />
          <p className="text-xs text-teal-200">
            Utilisez vos VIXUpoints pour reduire le montant en euros. Le systeme calcule automatiquement la meilleure combinaison.
          </p>
        </div>

        {/* Prix et solde */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-700/30 rounded-lg p-3 text-center">
            <p className="text-white/50 text-xs mb-1">Prix du contenu</p>
            <p className="text-white font-semibold">{priceEur.toFixed(2)} EUR</p>
            <p className="text-white/40 text-xs">({priceInPoints} pts)</p>
          </div>
          <div className="bg-slate-700/30 rounded-lg p-3 text-center">
            <p className="text-white/50 text-xs mb-1">Votre solde</p>
            <p className="text-amber-400 font-semibold">{userVixupoints} pts</p>
            <p className="text-white/40 text-xs">({(userVixupoints / VIXUPOINTS_PER_EUR).toFixed(2)} EUR)</p>
          </div>
        </div>

        {/* Slider pour choisir la repartition */}
        {maxPointsUsable > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/70">Utiliser mes VIXUpoints</span>
              <span className="text-amber-400 font-medium">{pointsToUse} pts</span>
            </div>
            <Slider
              value={[pointsToUse]}
              onValueChange={(v) => setPointsToUse(v[0])}
              max={maxPointsUsable}
              min={0}
              step={10}
              className="py-2"
            />
            <div className="flex justify-between text-xs text-white/40">
              <span>0 pts (100% EUR)</span>
              <span>{maxPointsUsable} pts</span>
            </div>
          </div>
        )}

        {/* Recapitulatif */}
        <div className="bg-slate-900/50 rounded-lg p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-white/70">VIXUpoints utilises</span>
            <span className="text-amber-400">{pointsToUse} pts</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-white/70">A payer en euros</span>
            <span className="text-emerald-400">{eurosRemaining.toFixed(2)} EUR</span>
          </div>
          <div className="border-t border-white/10 pt-2 mt-2 flex justify-between">
            <span className="text-white font-medium">Total</span>
            <span className="text-white font-semibold">{priceEur.toFixed(2)} EUR</span>
          </div>
        </div>

        {/* Boutons de paiement */}
        <div className="space-y-2">
          {pointsToUse > 0 ? (
            <Button 
              onClick={handlePayment}
              className="w-full bg-gradient-to-r from-amber-600 to-emerald-600 hover:from-amber-700 hover:to-emerald-700"
            >
              <Coins className="h-4 w-4 mr-2" />
              Utiliser mes VIXUpoints
            </Button>
          ) : (
            <Button 
              onClick={() => onPayment({ vixupointsUsed: 0, eurosUsed: priceEur, isHybrid: false, isValid: true })}
              className="w-full bg-emerald-600 hover:bg-emerald-700"
            >
              <Euro className="h-4 w-4 mr-2" />
              Payer {priceEur.toFixed(2)} EUR
            </Button>
          )}

          {/* Option paiement complet en VIXUpoints si possible */}
          {canAffordFullPoints && pointsToUse < priceInPoints && (
            <Button 
              variant="outline"
              onClick={() => onPayment({ vixupointsUsed: priceInPoints, eurosUsed: 0, isHybrid: false, isValid: true })}
              className="w-full border-amber-500/50 text-amber-300 hover:bg-amber-500/10"
            >
              Payer 100% en VIXUpoints ({priceInPoints} pts)
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Info Component ───

export function VixupointsInfoCard({ className }: { className?: string }) {
  return (
    <Card className={cn("bg-gradient-to-br from-amber-900/20 to-slate-800/50 border-amber-500/20", className)}>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Coins className="h-5 w-5 text-amber-400" />
          <h4 className="font-semibold text-white">Qu'est-ce que les VIXUpoints?</h4>
        </div>
        <p className="text-sm text-white/70">
          Les VIXUpoints recompensent votre participation a la communaute VIXUAL. Decouvrez les contenus, encouragez les createurs et utilisez vos points pour acceder a de nouvelles experiences.
        </p>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1">
            <CheckCircle className="h-3 w-3 text-emerald-400" />
            <span className="text-white/60">100 pts = 1 EUR</span>
          </div>
          <div className="flex items-center gap-1">
            <CheckCircle className="h-3 w-3 text-emerald-400" />
            <span className="text-white/60">Gratuits et securises</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
