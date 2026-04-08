"use client"

import { useState } from "react"
import {
  Package, Star, Zap, Gift, CheckCircle2, Sparkles, ShieldCheck,
  CreditCard, ArrowRight, Crown, TrendingUp, Info,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  VIXUPOINTS_PACKS,
  VIXUPOINTS_PER_EUR,
  canBuyMicropacks,
  MICROPACKS_LIMITS,
  type VixupointsPack,
} from "@/lib/vixupoints-engine"

interface MicropacksShopProps {
  userProfile: string
  currentBalance: number
  isMinor?: boolean
  onPurchase?: (pack: VixupointsPack) => void
}

export function MicropacksShop({
  userProfile,
  currentBalance,
  isMinor = false,
  onPurchase,
}: MicropacksShopProps) {
  const [selectedPack, setSelectedPack] = useState<string | null>(null)
  const [isPurchasing, setIsPurchasing] = useState(false)

  const canBuy = canBuyMicropacks(userProfile)

  // Filtrer les packs pour les mineurs (seulement micro et starter)
  const availablePacks = isMinor
    ? VIXUPOINTS_PACKS.filter(p => p.priceEur <= 10)
    : VIXUPOINTS_PACKS

  const handlePurchase = async (pack: VixupointsPack) => {
    setIsPurchasing(true)
    setSelectedPack(pack.id)
    
    // Simuler l'achat (en production, appeler l'API Stripe)
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    onPurchase?.(pack)
    setIsPurchasing(false)
    setSelectedPack(null)
  }

  if (!canBuy) {
    return (
      <Card className="bg-slate-800/50 border-slate-700/50">
        <CardContent className="p-6 text-center">
          <ShieldCheck className="h-10 w-10 text-slate-500 mx-auto mb-3" />
          <p className="text-white/60 text-sm">
            Les micro-packs VIXUpoints ne sont pas disponibles pour votre profil.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center">
            <Package className="h-5 w-5 text-amber-400" />
          </div>
          <div>
            <h3 className="text-white font-semibold">Acheter des VIXUpoints</h3>
            <p className="text-white/50 text-xs">Micro-packs avec bonus inclus</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-amber-400 font-bold text-lg">{currentBalance.toLocaleString()}</p>
          <p className="text-white/40 text-xs">VIXUpoints actuels</p>
        </div>
      </div>

      {/* Conversion reminder */}
      <div className="bg-sky-500/10 border border-sky-500/30 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-sky-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-white/80 text-sm font-medium">Conversion: 100 VIXUpoints = 1 EUR</p>
            <p className="text-white/50 text-xs mt-1">
              Les VIXUpoints servent a debloquer des contenus, soutenir des projets et effectuer des micro-transactions.
            </p>
          </div>
        </div>
      </div>

      {/* Packs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {availablePacks.map((pack) => (
          <Card
            key={pack.id}
            className={`relative overflow-hidden transition-all cursor-pointer ${
              selectedPack === pack.id
                ? "bg-amber-500/20 border-amber-500/50 ring-2 ring-amber-500/30"
                : pack.popular
                ? "bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/30 hover:border-amber-500/50"
                : "bg-slate-800/50 border-slate-700/50 hover:border-slate-600"
            }`}
            onClick={() => setSelectedPack(pack.id)}
          >
            {/* Popular badge */}
            {pack.popular && (
              <div className="absolute top-0 right-0">
                <div className="bg-amber-500 text-black text-xs font-bold px-3 py-1 rounded-bl-lg">
                  POPULAIRE
                </div>
              </div>
            )}

            <CardContent className="p-5">
              {/* Pack header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h4 className="text-white font-semibold">{pack.name}</h4>
                  <p className="text-white/50 text-xs mt-0.5">{pack.description}</p>
                </div>
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  pack.popular ? "bg-amber-500/20" : "bg-slate-700/50"
                }`}>
                  {pack.id === "micro" && <Star className="h-5 w-5 text-slate-400" />}
                  {pack.id === "starter" && <Zap className="h-5 w-5 text-amber-400" />}
                  {pack.id === "creator" && <Sparkles className="h-5 w-5 text-purple-400" />}
                  {pack.id === "community" && <Crown className="h-5 w-5 text-emerald-400" />}
                </div>
              </div>

              {/* Points info */}
              <div className="bg-black/20 rounded-lg p-3 mb-4">
                <div className="flex items-baseline justify-between mb-2">
                  <span className="text-white/60 text-sm">Base</span>
                  <span className="text-white/80">{pack.basePoints.toLocaleString()} pts</span>
                </div>
                <div className="flex items-baseline justify-between mb-2">
                  <span className="text-emerald-400 text-sm flex items-center gap-1">
                    <Gift className="h-3 w-3" /> Bonus +{pack.bonusPercent}%
                  </span>
                  <span className="text-emerald-400">+{(pack.totalPoints - pack.basePoints).toLocaleString()} pts</span>
                </div>
                <div className="border-t border-white/10 pt-2 mt-2">
                  <div className="flex items-baseline justify-between">
                    <span className="text-white font-semibold">Total</span>
                    <span className="text-amber-400 font-bold text-lg">{pack.totalPoints.toLocaleString()} pts</span>
                  </div>
                </div>
              </div>

              {/* Price and CTA */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-bold text-xl">{pack.priceEur} EUR</p>
                  <p className="text-white/40 text-xs">{(pack.totalPoints / pack.priceEur).toFixed(0)} pts/EUR</p>
                </div>
                <Button
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    handlePurchase(pack)
                  }}
                  disabled={isPurchasing}
                  className={`${
                    pack.popular
                      ? "bg-amber-500 hover:bg-amber-600 text-black"
                      : "bg-white/10 hover:bg-white/20 text-white"
                  }`}
                >
                  {isPurchasing && selectedPack === pack.id ? (
                    <>Achat...</>
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4 mr-1.5" />
                      Acheter
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Minor warning */}
      {isMinor && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <ShieldCheck className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-white/80 text-sm font-medium">Achat encadre pour les mineurs</p>
              <p className="text-white/50 text-xs mt-1">
                Maximum {MICROPACKS_LIMITS.minorMaxPerMonth} achats par mois ({MICROPACKS_LIMITS.minorMaxPointsPerMonth.toLocaleString()} VIXUpoints).
                Autorisation parentale requise.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Security info */}
      <div className="flex items-center justify-center gap-4 text-white/40 text-xs">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="h-4 w-4" />
          <span>Paiement securise</span>
        </div>
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="h-4 w-4" />
          <span>Credit instantane</span>
        </div>
      </div>
    </div>
  )
}

/** Composant compact pour afficher dans le dashboard */
export function MicropacksQuickBuy({
  userProfile,
  currentBalance,
  isMinor = false,
}: {
  userProfile: string
  currentBalance: number
  isMinor?: boolean
}) {
  const canBuy = canBuyMicropacks(userProfile)
  const starterPack = VIXUPOINTS_PACKS.find(p => p.id === "starter")

  if (!canBuy || !starterPack) return null

  return (
    <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/30">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
              <Package className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <p className="text-white font-semibold text-sm">Besoin de VIXUpoints ?</p>
              <p className="text-white/50 text-xs">
                {starterPack.name}: {starterPack.totalPoints.toLocaleString()} pts pour {starterPack.priceEur} EUR
              </p>
            </div>
          </div>
          <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-black">
            <Zap className="h-4 w-4 mr-1" />
            Acheter
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
