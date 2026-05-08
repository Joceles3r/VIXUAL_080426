import { Coins, DollarSign, Zap } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  calculateHybridPaymentOptions,
  formatPaymentOption,
  HYBRID_MAX_POINTS_RATIO,
  HYBRID_MIN_CASH_RATIO,
} from "@/lib/content-purchase"

interface HybridPaymentDisplayProps {
  contentPrice: number
  userVIXUpoints: number
  onSelectPayment?: (cashAmount: number, pointsUsed: number) => void
  disabled?: boolean
}

export function HybridPaymentDisplay({
  contentPrice,
  userVIXUpoints,
  onSelectPayment,
  disabled = false,
}: HybridPaymentDisplayProps) {
  const options = calculateHybridPaymentOptions(contentPrice, userVIXUpoints)
  const selectedIndex = options.length > 1 ? 1 : 0

  return (
    <div className="space-y-4">
      {/* Header with explanation */}
      <div className="bg-gradient-to-r from-teal-500/10 to-emerald-500/10 border border-teal-500/30 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Zap className="h-5 w-5 text-teal-400 mt-0.5 shrink-0" />
          <div>
            <h3 className="font-semibold text-white mb-1">Paiement hybride VIXUAL</h3>
            <p className="text-sm text-white/70">
              Regle officielle : 70% en euros + 30% en VIXUpoints. Cela permet d&apos;utiliser tes points tout en gardant une participation reelle et equilibree. Bonus : 5% des points depenses sont regagnes.
            </p>
          </div>
        </div>
      </div>

      {/* Payment options */}
      <div className="space-y-2">
        {options.map((option, idx) => (
          <Card
            key={idx}
            className={`cursor-pointer transition-all ${
              idx === selectedIndex
                ? "border-teal-500/50 bg-teal-500/10"
                : "border-slate-700/50 hover:border-slate-600/50"
            } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
            onClick={() => {
              if (!disabled && onSelectPayment) {
                onSelectPayment(option.cashEur, option.pointsUsed)
              }
            }}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-4">
                {/* Payment method visualization */}
                <div className="flex items-center gap-3 flex-1">
                  {option.pointsUsed > 0 ? (
                    <>
                      <div className="flex items-center gap-1 px-3 py-1.5 bg-amber-500/20 border border-amber-500/30 rounded-lg">
                        <Coins className="h-4 w-4 text-amber-400" />
                        <span className="text-sm font-semibold text-amber-300">
                          {option.pointsUsed} pts
                        </span>
                      </div>
                      <span className="text-slate-500">+</span>
                      <div className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500/20 border border-emerald-500/30 rounded-lg">
                        <DollarSign className="h-4 w-4 text-emerald-400" />
                        <span className="text-sm font-semibold text-emerald-300">
                          {option.cashEur}€
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center gap-1 px-3 py-1.5 bg-blue-500/20 border border-blue-500/30 rounded-lg">
                      <DollarSign className="h-4 w-4 text-blue-400" />
                      <span className="text-sm font-semibold text-blue-300">
                        {option.cashEur}€ (100% cash)
                      </span>
                    </div>
                  )}
                </div>

                {/* Recommendation badge */}
                {idx === selectedIndex && (
                  <Badge className="bg-teal-600/80 text-teal-100 border-teal-500/50 shrink-0">
                    Recommandé
                  </Badge>
                )}

                {/* Validity indicator */}
                {!option.isValid && (
                  <span className="text-xs text-rose-400 shrink-0">{option.reason}</span>
                )}
              </div>

              {/* Bonus info */}
              {option.pointsUsed > 0 && (
                <div className="mt-2 text-xs text-emerald-400 flex items-center gap-1">
                  <Zap className="h-3 w-3" />
                  <span>+{Math.floor(option.pointsUsed * 0.05)} bonus VIXUpoints</span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Payment rules */}
      <div className="bg-slate-800/30 rounded p-3 text-xs text-slate-400 space-y-1">
        <p>
          <span className="text-white/60 font-semibold">Regle officielle VIXUAL :</span>{" "}
          <span className="text-emerald-400 font-semibold">
            {(HYBRID_MIN_CASH_RATIO * 100).toFixed(0)}% en euros
          </span>{" "}
          +{" "}
          <span className="text-amber-400 font-semibold">
            {(HYBRID_MAX_POINTS_RATIO * 100).toFixed(0)}% en VIXUpoints
          </span>
        </p>
      </div>

      {/* CTA Button */}
      {onSelectPayment && (
        <Button
          onClick={() => onSelectPayment(options[selectedIndex].cashEur, options[selectedIndex].pointsUsed)}
          disabled={disabled || !options[selectedIndex].isValid}
          className="w-full bg-teal-600 hover:bg-teal-700 text-white"
        >
          Procéder au paiement
        </Button>
      )}
    </div>
  )
}
