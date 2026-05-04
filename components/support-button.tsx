/**
 * COMPOSANT STRUCTUREL VIXUAL
 * Bouton de soutien (passerelle Stripe externe).
 * Modifier avec prudence : impact paiement createurs.
 */
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Heart, Loader2, CheckCircle, AlertCircle, Info } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { loadStripe } from "@stripe/stripe-js"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

type SupportButtonProps = {
  creatorId: string
  creatorName: string
  projectId?: string
  projectTitle?: string
  variant?: "default" | "outline" | "ghost"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
}

const PRESET_AMOUNTS = [
  { value: 200, label: "2 €" },
  { value: 500, label: "5 €" },
  { value: 1000, label: "10 €" },
  { value: 2000, label: "20 €" },
]

export function SupportButton({
  creatorId,
  creatorName,
  projectId,
  projectTitle,
  variant = "outline",
  size = "default",
  className = "",
}: SupportButtonProps) {
  const { user, isAuthed } = useAuth()
  const [open, setOpen] = useState(false)
  const [selectedAmount, setSelectedAmount] = useState<number | null>(500)
  const [customAmount, setCustomAmount] = useState("")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleAmountSelect = (amount: number) => {
    setSelectedAmount(amount)
    setCustomAmount("")
  }

  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value)
    const cents = parseFloat(value) * 100
    if (!isNaN(cents) && cents >= 200) {
      setSelectedAmount(Math.round(cents))
    } else {
      setSelectedAmount(null)
    }
  }

  const handleSupport = async () => {
    if (!selectedAmount || selectedAmount < 200) {
      setError("Montant minimum: 2 €")
      return
    }

    if (!isAuthed) {
      setError("Veuillez vous connecter pour soutenir")
      return
    }

    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/stripe/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          creatorId,
          projectId,
          amountCents: selectedAmount,
          message,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors du paiement")
      }

      // Redirect to Stripe Checkout
      window.location.href = (data as any).url || `/checkout?session=${data.sessionId}`
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue")
    } finally {
      setLoading(false)
    }
  }

  const targetLabel = projectTitle
    ? `le projet "${projectTitle}"`
    : creatorName

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} size={size} className={className}>
          <Heart className="h-4 w-4 mr-2 text-rose-400" />
          Soutenir
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-slate-900 border-white/10 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <Heart className="h-5 w-5 text-rose-400" />
            Soutenir {targetLabel}
          </DialogTitle>
          <DialogDescription className="text-white/60">
            Votre soutien aide directement le createur. Ce don ne donne droit a aucun vote, classement ou gain.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Info box */}
          <div className="bg-rose-500/10 border border-rose-500/20 rounded-lg p-3 flex gap-2">
            <Info className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
            <p className="text-xs text-white/60">
              Le soutien est un don volontaire sans contrepartie. Il n'influence pas les classements et ne genere aucun gain.
            </p>
          </div>

          {/* Preset amounts */}
          <div className="space-y-2">
            <Label className="text-white/80">Choisir un montant</Label>
            <div className="grid grid-cols-4 gap-2">
              {PRESET_AMOUNTS.map((preset) => (
                <Button
                  key={preset.value}
                  type="button"
                  variant={selectedAmount === preset.value && !customAmount ? "default" : "outline"}
                  className={`${
                    selectedAmount === preset.value && !customAmount
                      ? "bg-rose-500 hover:bg-rose-600 text-white border-rose-500"
                      : "bg-transparent border-white/20 text-white hover:bg-white/10"
                  }`}
                  onClick={() => handleAmountSelect(preset.value)}
                >
                  {preset.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Custom amount */}
          <div className="space-y-2">
            <Label htmlFor="custom-amount" className="text-white/80">
              Ou montant libre (min. 2 €)
            </Label>
            <div className="relative">
              <Input
                id="custom-amount"
                type="number"
                min="2"
                step="0.01"
                placeholder="Montant personnalise"
                value={customAmount}
                onChange={(e) => handleCustomAmountChange(e.target.value)}
                className="bg-slate-800 border-white/20 text-white pr-8"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40">€</span>
            </div>
          </div>

          {/* Optional message */}
          <div className="space-y-2">
            <Label htmlFor="support-message" className="text-white/80">
              Message (optionnel)
            </Label>
            <Textarea
              id="support-message"
              placeholder="Un petit mot d'encouragement..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="bg-slate-800 border-white/20 text-white resize-none h-20"
              maxLength={200}
            />
            <p className="text-xs text-white/40 text-right">{message.length}/200</p>
          </div>

          {/* Fee breakdown */}
          {selectedAmount && selectedAmount >= 200 && (
            <div className="bg-black/30 rounded-lg p-3 space-y-1 text-sm">
              <div className="flex justify-between text-white/60">
                <span>Montant du soutien</span>
                <span>{(selectedAmount / 100).toFixed(2)} €</span>
              </div>
              <div className="flex justify-between text-white/40 text-xs">
                <span>Commission VIXUAL (15%)</span>
                <span>{((selectedAmount * 0.15) / 100).toFixed(2)} €</span>
              </div>
              <div className="flex justify-between text-emerald-400 font-medium pt-1 border-t border-white/10">
                <span>Le createur recoit</span>
                <span>{((selectedAmount * 0.85) / 100).toFixed(2)} €</span>
              </div>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="bg-rose-500/10 border border-rose-500/30 rounded-lg p-3 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-rose-400" />
              <p className="text-sm text-rose-400">{error}</p>
            </div>
          )}

          {/* Submit button */}
          <Button
            onClick={handleSupport}
            disabled={!selectedAmount || selectedAmount < 200 || loading}
            className="w-full bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-medium disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Redirection vers le paiement...
              </>
            ) : (
              <>
                <Heart className="h-4 w-4 mr-2" />
                Soutenir avec {selectedAmount ? `${(selectedAmount / 100).toFixed(2)} €` : "..."}
              </>
            )}
          </Button>

          <p className="text-xs text-white/40 text-center">
            Paiement securise par Stripe. Aucun remboursement possible.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
