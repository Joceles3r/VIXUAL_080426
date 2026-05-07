"use client"

import { useState, useCallback, useMemo } from "react"
import useSWR from "swr"
import {
  Wallet, ArrowUpRight, ArrowDownRight, CreditCard, Shield, Clock,
  Check, AlertCircle, Loader2, TrendingUp, Star, Target, Zap,
  BarChart3, ArrowRight, Sparkles, Award, ChevronRight, Lock,
  Filter, DollarSign, Landmark, PiggyBank, Lightbulb,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/lib/auth-context"
import {
  CAUTION_EUR, STRIPE_CONFIG, VIXUPOINTS_PER_EUR,
  VIXUPOINTS_CONVERSION_THRESHOLD,
} from "@/lib/payout/constants"
import { SecurityGate } from "@/components/security/security-gate"
import { VerificationBadges } from "@/components/security/verification-badges"
import { useSounds } from "@/lib/sounds"
import { useToast } from "@/components/ui/use-toast"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

function formatCents(cents: number): string {
  return (cents / 100).toFixed(2).replace(".", ",")
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "2-digit", month: "2-digit", year: "numeric",
  })
}

function ProgressBar({ value, max, color = "emerald" }: { value: number; max: number; color?: string }) {
  const pct = Math.min(100, Math.round((value / Math.max(1, max)) * 100))
  const colorMap: Record<string, string> = {
    emerald: "bg-emerald-500", amber: "bg-amber-500", cyan: "bg-cyan-500",
    purple: "bg-purple-500", sky: "bg-sky-500", red: "bg-red-500",
  }
  return (
    <div className="w-full bg-white/5 rounded-full h-2.5 overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-700 ${colorMap[color] || colorMap.emerald}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

const TX_LABELS: Record<string, string> = {
  investment: "Contribution", return: "Retour de gain", caution: "Caution",
  caution_refund: "Remboursement caution", withdrawal: "Retrait bancaire",
  visupoints_conversion: "Conversion VIXUpoints", article_sale: "Vente d'article",
  video_sale: "Vente vid\u00e9o", podcast_sale: "Vente podcast",
}

const TX_ICONS: Record<string, string> = {
  investment: "out", return: "in", caution: "out", caution_refund: "in",
  withdrawal: "out", visupoints_conversion: "in", article_sale: "in",
  video_sale: "in", podcast_sale: "in",
}

// Mock data for demo
const MOCK_WALLET = {
  availableCents: 18_42, pendingCents: 4_50, totalEarnedCents: 156_80, totalWithdrawnCents: 45_00,
}
// VERROU FINAL: mock VIXUpoints (alias UI)
const MOCK_VIXUPOINTS = { balance: 1200, cap: 5000, todayEarned: 15 }
const MOCK_TRANSACTIONS = [
  { id: "tx1", type: "video_sale", amountCents: 1000, description: "Vente vid\u00e9o : L'Odyss\u00e9e des \u00c9toiles", status: "completed", createdAt: "2026-03-03" },
  { id: "tx2", type: "return", amountCents: 400, description: "Retour contribution : Murmures de la For\u00eat", status: "completed", createdAt: "2026-03-02" },
  { id: "tx3", type: "investment", amountCents: -500, description: "Contribution : M\u00e9tropolis 2050", status: "completed", createdAt: "2026-03-01" },
  { id: "tx4", type: "article_sale", amountCents: 350, description: "Vente article : R\u00e9flexions sur l'IA", status: "completed", createdAt: "2026-02-28" },
  { id: "tx5", type: "withdrawal", amountCents: -2000, description: "Retrait bancaire", status: "completed", createdAt: "2026-02-25" },
  { id: "tx6", type: "podcast_sale", amountCents: 280, description: "Vente podcast : Les Voix de la Nuit", status: "completed", createdAt: "2026-02-22" },
  { id: "tx7", type: "caution", amountCents: -1000, description: "Caution Cr\u00e9ateur", status: "completed", createdAt: "2026-01-15" },
  { id: "tx8", type: "return", amountCents: 650, description: "Retour contribution : Jazz \u00e0 Minuit", status: "completed", createdAt: "2026-02-20" },
]
const MOCK_PENDING_WITHDRAWALS = [
  { id: "w1", amountCents: 4_50, requestDate: "2026-03-03", status: "processing" as const, holdEnd: null },
]
const MOCK_MONTHLY_DATA = [
  { month: "Oct", earned: 8_20, spent: 3_00 },
  { month: "Nov", earned: 12_50, spent: 5_00 },
  { month: "Dec", earned: 18_00, spent: 8_00 },
  { month: "Jan", earned: 22_30, spent: 10_00 },
  { month: "F\u00e9v", earned: 34_60, spent: 12_00 },
  { month: "Mar", earned: 42_80, spent: 7_00 },
]
const MOCK_REVENUE_BY_TYPE = [
  { type: "Vid\u00e9os", amount: 68_00, color: "bg-red-500", pct: 43 },
  { type: "Podcasts", amount: 42_00, color: "bg-purple-500", pct: 27 },
  { type: "\u00c9crits", amount: 28_00, color: "bg-sky-500", pct: 18 },
  { type: "Soutiens", amount: 18_80, color: "bg-emerald-500", pct: 12 },
]
const MOCK_INSIGHTS = [
  "Vos gains ont augment\u00e9 de vingt-quatre pour cent ce mois.",
  "Les projets podcasts g\u00e9n\u00e8rent plus de revenus pour vous.",
  "Vous pourriez atteindre cinquante euros d'ici deux semaines.",
]

export default function WalletPage() {
  const { user } = useAuth()
  const [connectLoading, setConnectLoading] = useState(false)
  const [cautionLoading, setCautionLoading] = useState<string | null>(null)
  const [withdrawLoading, setWithdrawLoading] = useState(false)
  const [txFilter, setTxFilter] = useState<"all" | "in" | "out">("all")
  const [financialGoal, setFinancialGoal] = useState(100_00) // 100 EUR in cents
  const { playWin, playSuccess, playError } = useSounds()
  const { toast } = useToast()

  const { data, error, mutate } = useSWR(
    user ? `/api/wallet?userId=${user.id}` : null,
    fetcher, { refreshInterval: 30000 }
  )

  const wallet = data?.wallet || MOCK_WALLET
  const transactions = data?.transactions || MOCK_TRANSACTIONS
  const stripeConnect = data?.stripeConnect || { status: "not_started", chargesEnabled: false, payoutsEnabled: false, hasAccount: false }
  const visupoints = data?.visupoints || MOCK_VIXUPOINTS
  const pendingWithdrawals = data?.pendingWithdrawals || MOCK_PENDING_WITHDRAWALS
  const isLoading = !data && !error && !!user

  const withdrawThresholdCents = STRIPE_CONFIG.minWithdrawCents
  const withdrawProgress = Math.min(100, Math.round((wallet.availableCents / withdrawThresholdCents) * 100))
  const withdrawRemaining = Math.max(0, withdrawThresholdCents - wallet.availableCents)

  const goalProgress = Math.min(100, Math.round((wallet.totalEarnedCents / financialGoal) * 100))
  const goalRemaining = Math.max(0, financialGoal - wallet.totalEarnedCents)

  const filteredTx = useMemo(() => {
    if (txFilter === "all") return transactions
    return transactions.filter((tx: { amountCents: number }) =>
      txFilter === "in" ? tx.amountCents >= 0 : tx.amountCents < 0
    )
  }, [transactions, txFilter])

  const passiveEstimate = useMemo(() => {
    const monthlyData = MOCK_MONTHLY_DATA
    if (monthlyData.length < 2) return 0
    const lastThree = monthlyData.slice(-3)
    return Math.round(lastThree.reduce((s, m) => s + m.earned, 0) / lastThree.length)
  }, [])

  const handleConnectStripe = useCallback(async () => {
    if (!user) return
    setConnectLoading(true)
    try {
      const res = await fetch("/api/stripe/connect", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      })
      const result = await res.json()
      if (result.url) window.open(result.url, "_blank")
      mutate()
    } catch { /* silent */ } finally { setConnectLoading(false) }
  }, [user, mutate])

  const handlePayCaution = useCallback(async (cautionType: "creator" | "contributor") => {
    if (!user) return
    setCautionLoading(cautionType)
    try {
      const res = await fetch("/api/stripe/caution", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, cautionType }),
      })
      const result = await res.json()
      if (result.error) {
        toast({ title: "Erreur", description: result.error, variant: "destructive" })
      } else {
        // Si l'API retourne une URL de checkout Stripe, on redirige
        if (result.url) {
          window.location.href = result.url
          return
        }
        toast({ title: "Caution initialisee", description: `Caution ${cautionType === "creator" ? "Createur" : "Contributeur"} : paiement en cours de traitement.` })
        mutate()
      }
    } catch { /* silent */ } finally { setCautionLoading(null) }
  }, [user, mutate])

  const handleWithdraw = useCallback(async () => {
    if (!user || !wallet) return
    const available = wallet.availableCents
    if (available < STRIPE_CONFIG.minWithdrawCents) return
    setWithdrawLoading(true)
    try {
      const res = await fetch("/api/stripe/withdraw", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, amountCents: available }),
      })
      const result = await res.json()
      if (result.error) {
        playError()
        toast({ title: "Erreur de retrait", description: result.error, variant: "destructive" })
      } else {
        playWin()
        toast({ title: "Retrait effectue", description: `${formatCents(available)} € en cours de virement vers votre compte bancaire.` })
        mutate()
      }
    } catch { /* silent */ } finally { setWithdrawLoading(false) }
  }, [user, wallet, mutate, playError, playWin, toast])

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <Wallet className="h-5 w-5 text-emerald-400" />
            </div>
            {"Mon Wallet"}
          </h1>
          <p className="text-white/50 mt-1">{"Centre financier VIXUAL \u2014 g\u00e9rez vos gains, soutiens et retraits"}</p>
        </div>
        <VerificationBadges
          verificationLevel={user?.kycVerified ? 2 : 0}
          vpnSuspected={false}
          isVerifiedCreator={user?.kycVerified && user?.roles?.includes("creator")}
          withdrawalPending72h={pendingWithdrawals.some((w: { status: string }) => w.status === "held" || w.status === "processing")}
        />
      </div>

      {/* Security Gate -- VPN / verification warnings */}
      <SecurityGate
        blocked={!user?.kycVerified && (wallet.availableCents >= STRIPE_CONFIG.minWithdrawCents)}
        title="Verification requise pour les retraits"
        message="Pour securiser vos transactions, completez la verification d'identite (KYC) via Stripe Connect avant de pouvoir retirer vos gains."
        variant="warning"
        ctaLabel="Verifier mon identite"
        onCta={handleConnectStripe}
        suggestedAction="KYC"
      />

      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
          <span className="ml-3 text-white/60">{"Chargement du wallet..."}</span>
        </div>
      )}

      {/* SECTION 1 : RESUME FINANCIER (4 cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Disponible", value: wallet.availableCents, icon: Wallet, color: "emerald", trend: "+12%" },
          { label: "En attente", value: wallet.pendingCents, icon: Clock, color: "amber", trend: null },
          { label: "Total gagn\u00e9", value: wallet.totalEarnedCents, icon: TrendingUp, color: "cyan", trend: "+24%" },
          { label: "Total retir\u00e9", value: wallet.totalWithdrawnCents, icon: Landmark, color: "purple", trend: null },
        ].map((card) => (
          <Card key={card.label} className={`bg-${card.color}-500/5 border-${card.color}-500/20 hover:border-${card.color}-500/40 transition-colors`}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-lg bg-${card.color}-500/15 flex items-center justify-center`}>
                  <card.icon className={`h-5 w-5 text-${card.color}-400`} />
                </div>
                {card.trend && (
                  <span className="text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">{card.trend}</span>
                )}
              </div>
              <p className="text-white/50 text-xs font-medium uppercase tracking-wider">{card.label}</p>
              <p className={`text-2xl font-bold text-${card.color}-400 mt-1`}>
                {formatCents(card.value)}{" \u20ac"}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* SECTION 2 : BARRE PROGRESSION RETRAIT */}
      <Card className="bg-slate-900/50 border-white/10">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-emerald-400" />
              <span className="text-white font-medium text-sm">{"Seuil de retrait"}</span>
            </div>
            <span className="text-white/60 text-sm">{withdrawProgress}{" %"}</span>
          </div>
          <ProgressBar value={wallet.availableCents} max={withdrawThresholdCents} color="emerald" />
          <p className="text-white/40 text-xs mt-2">
            {withdrawRemaining > 0
              ? `Encore ${formatCents(withdrawRemaining)} \u20ac pour pouvoir effectuer un retrait.`
              : "Vous pouvez effectuer un retrait."
            }
          </p>
        </CardContent>
      </Card>

      {/* SECTION 3 + 4 : ACTIONS RAPIDES + STRIPE CONNECT */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Actions rapides */}
        <Card className="bg-slate-900/50 border-white/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-white flex items-center gap-2 text-base">
              <Zap className="h-5 w-5 text-amber-400" />
              {"Actions rapides"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white justify-between h-12"
              onClick={handleWithdraw}
              disabled={withdrawLoading || wallet.availableCents < STRIPE_CONFIG.minWithdrawCents}
            >
              <span className="flex items-center gap-2">
                {withdrawLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowUpRight className="h-4 w-4" />}
                {"Retirer mon solde"}
              </span>
              <ChevronRight className="h-4 w-4 opacity-60" />
            </Button>
            {wallet.availableCents >= 1000_00 && (
              <div className="flex items-center gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                <Lock className="h-4 w-4 text-amber-400 shrink-0" />
                <p className="text-amber-400/80 text-xs">{"Retrait plac\u00e9 en v\u00e9rification s\u00e9curit\u00e9 (soixante-douze heures)"}</p>
              </div>
            )}
            <Button
              variant="outline"
              className="w-full border-white/10 bg-white/5 hover:bg-white/10 text-white justify-between h-12"
              onClick={handleConnectStripe}
              disabled={connectLoading}
            >
              <span className="flex items-center gap-2">
                {connectLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
                {stripeConnect.status === "verified" ? "G\u00e9rer Stripe Connect" : "Configurer Stripe Connect"}
              </span>
              <ChevronRight className="h-4 w-4 opacity-60" />
            </Button>
          </CardContent>
        </Card>

        {/* Stripe Connect Status */}
        <Card className="bg-slate-900/50 border-white/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-white flex items-center gap-2 text-base">
              <CreditCard className="h-5 w-5 text-emerald-400" />
              {"Statut Stripe Connect"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {stripeConnect.status === "verified" ? (
              <div className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <Check className="h-5 w-5 text-emerald-400" />
                </div>
                <div>
                  <p className="font-semibold text-emerald-400">{"Compte v\u00e9rifi\u00e9"}</p>
                  <p className="text-sm text-white/50">{"Retraits activ\u00e9s, paiements possibles"}</p>
                </div>
              </div>
            ) : stripeConnect.status === "pending" ? (
              <div className="flex items-center gap-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-amber-400 animate-pulse" />
                </div>
                <div>
                  <p className="font-semibold text-amber-400">{"V\u00e9rification en cours"}</p>
                  <p className="text-sm text-white/50">{"Stripe examine votre compte (24-48h)"}</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-slate-800/50 border border-white/5 rounded-xl">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                    <AlertCircle className="h-5 w-5 text-white/30" />
                  </div>
                  <div>
                    <p className="font-semibold text-white/70">{"Recevoir mes gains"}</p>
                    <p className="text-sm text-white/40">{"Configurez Stripe Connect pour retirer vos gains"}</p>
                  </div>
                </div>
                {/* Etapes Stripe Connect */}
                <div className="p-4 bg-[#635BFF]/5 border border-[#635BFF]/20 rounded-xl">
                  <p className="text-[#635BFF] text-sm font-medium mb-3">{"Etapes pour recevoir vos gains :"}</p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-6 h-6 rounded-full bg-[#635BFF]/20 flex items-center justify-center text-xs font-bold text-[#635BFF]">1</div>
                      <span className="text-white/70">{"Creer votre compte Stripe"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-6 h-6 rounded-full bg-[#635BFF]/20 flex items-center justify-center text-xs font-bold text-[#635BFF]">2</div>
                      <span className="text-white/70">{"Verifier votre identite (KYC)"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-6 h-6 rounded-full bg-[#635BFF]/20 flex items-center justify-center text-xs font-bold text-[#635BFF]">3</div>
                      <span className="text-white/70">{"Activer les paiements"}</span>
                    </div>
                  </div>
                  <Button onClick={handleConnectStripe} className="w-full mt-4 bg-[#635BFF] hover:bg-[#5851DB] text-white">
                    <CreditCard className="h-4 w-4 mr-2" />
                    {"Connecter mon compte Stripe"}
                  </Button>
                </div>
              </div>
            )}

            {/* Caution section */}
            <div className="space-y-2 pt-2">
              <p className="text-white/50 text-xs font-medium uppercase tracking-wider">{"Cautions"}</p>
              {(["creator", "contributor"] as const).map((type) => {
                const paid = type === "creator"
                  ? data?.cautions?.creatorPaid
                  : (data?.cautions?.contributorPaid ?? data?.cautions?.investorPaid)
                const label = type === "creator" ? "Cr\u00e9ateur" : "Contributeur"
                const sub = type === "creator" ? "Porteur / Infoporteur / Podcasteur" : "Contributeur / Contribu-lecteur / Auditeur"
                const amount = CAUTION_EUR[type]
                return (
                  <div key={type} className="flex items-center justify-between p-3 bg-slate-800/40 rounded-lg">
                    <div className="flex items-center gap-3">
                      {paid ? <Check className="h-4 w-4 text-emerald-400" /> : <Shield className="h-4 w-4 text-amber-400" />}
                      <div>
                        <p className="text-white text-sm font-medium">{"Caution "}{label}</p>
                        <p className="text-white/30 text-xs">{sub}{" \u2014 "}{amount}{" \u20ac"}</p>
                      </div>
                    </div>
                    {paid ? (
                      <span className="text-xs text-emerald-400 font-medium px-2.5 py-1 bg-emerald-500/10 rounded-full">{"Pay\u00e9e"}</span>
                    ) : (
                      <Button size="sm" className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs h-8" onClick={() => handlePayCaution(type)} disabled={cautionLoading === type}>
                        {cautionLoading === type && <Loader2 className="h-3 w-3 animate-spin mr-1" />}
                        {"Payer "}{amount}{" \u20ac"}
                      </Button>
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* SECTION 5 : RETRAITS EN ATTENTE */}
      {pendingWithdrawals.length > 0 && (
        <Card className="bg-slate-900/50 border-amber-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-white flex items-center gap-2 text-base">
              <Clock className="h-5 w-5 text-amber-400" />
              {"Retraits en attente"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {pendingWithdrawals.map((w: { id: string; amountCents: number; requestDate: string; status: "processing" | "held" | "completed"; holdEnd: string | null }) => (
                <div key={w.id} className="flex items-center justify-between p-3 bg-slate-800/40 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-2.5 h-2.5 rounded-full ${w.status === "processing" ? "bg-amber-400 animate-pulse" : w.status === "held" ? "bg-red-400" : "bg-emerald-400"}`} />
                    <div>
                      <p className="text-white text-sm font-medium">{formatCents(w.amountCents)}{" \u20ac"}</p>
                      <p className="text-white/30 text-xs">{"Demand\u00e9 le "}{formatDate(w.requestDate)}</p>
                    </div>
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                    w.status === "processing" ? "bg-amber-500/10 text-amber-400" :
                    w.status === "held" ? "bg-red-500/10 text-red-400" :
                    "bg-emerald-500/10 text-emerald-400"
                  }`}>
                    {w.status === "processing" ? "En cours" : w.status === "held" ? "V\u00e9rification" : "Termin\u00e9"}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* SECTION 6 + 7 : VIXUPOINTS + GRAPHIQUES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* VIXUpoints */}
        <Card className="bg-gradient-to-br from-amber-900/10 to-amber-800/5 border-amber-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-white flex items-center gap-2 text-base">
              <Star className="h-5 w-5 text-amber-400" />
              {"VIXUpoints"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-amber-400">{visupoints.balance.toLocaleString("fr-FR")}</span>
              <span className="text-white/40 text-sm">{"/ "}{visupoints.cap.toLocaleString("fr-FR")}{" VP"}</span>
            </div>
            <ProgressBar value={visupoints.balance} max={visupoints.cap} color="amber" />
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-black/20 rounded-lg p-3 text-center">
                <p className="text-amber-400 font-bold text-lg">{"+"}{ visupoints.todayEarned}</p>
                <p className="text-white/40 text-xs">{"gagn\u00e9s aujourd'hui"}</p>
              </div>
              <div className="bg-black/20 rounded-lg p-3 text-center">
                <p className="text-white font-bold text-lg">{VIXUPOINTS_CONVERSION_THRESHOLD.toLocaleString("fr-FR")}</p>
                <p className="text-white/40 text-xs">{"seuil conversion"}</p>
              </div>
            </div>
            {visupoints.balance >= VIXUPOINTS_CONVERSION_THRESHOLD && (
              <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                <Sparkles className="h-4 w-4 text-emerald-400" />
                <p className="text-emerald-400 text-xs font-medium">{"Conversion disponible : "}{Math.floor(visupoints.balance / VIXUPOINTS_PER_EUR)}{" \u20ac"}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Revenus par type */}
        <Card className="bg-slate-900/50 border-white/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-white flex items-center gap-2 text-base">
              <BarChart3 className="h-5 w-5 text-cyan-400" />
              {"Revenus par type"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {MOCK_REVENUE_BY_TYPE.map((rev) => (
              <div key={rev.type} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-white/70 text-sm">{rev.type}</span>
                  <span className="text-white font-medium text-sm">{formatCents(rev.amount)}{" \u20ac"}</span>
                </div>
                <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
                  <div className={`h-full rounded-full ${rev.color}`} style={{ width: `${rev.pct}%` }} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* SECTION 8 : GRAPHIQUE MENSUEL */}
      <Card className="bg-slate-900/50 border-white/10">
        <CardHeader className="pb-3">
          <CardTitle className="text-white flex items-center gap-2 text-base">
            <TrendingUp className="h-5 w-5 text-cyan-400" />
            {"Gains mensuels"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-3 h-40">
            {MOCK_MONTHLY_DATA.map((m, i) => {
              const maxVal = Math.max(...MOCK_MONTHLY_DATA.map((d) => d.earned))
              const hPct = Math.max(8, (m.earned / maxVal) * 100)
              const isLast = i === MOCK_MONTHLY_DATA.length - 1
              return (
                <div key={m.month} className="flex-1 flex flex-col items-center gap-1.5">
                  <span className="text-white/50 text-xs">{formatCents(m.earned)}</span>
                  <div className="w-full flex justify-center">
                    <div
                      className={`w-full max-w-10 rounded-t-lg transition-all ${isLast ? "bg-emerald-500" : "bg-emerald-500/30"}`}
                      style={{ height: `${hPct}%`, minHeight: "8px" }}
                    />
                  </div>
                  <span className="text-white/40 text-[10px]">{m.month}</span>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* SECTION 9 + 10 : REVENUS PASSIFS + OBJECTIF */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenus passifs */}
        <Card className="bg-gradient-to-br from-cyan-900/10 to-teal-800/5 border-cyan-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-white flex items-center gap-2 text-base">
              <PiggyBank className="h-5 w-5 text-cyan-400" />
              {"Revenus passifs estim\u00e9s"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-center py-4">
              <p className="text-white/40 text-xs mb-1">{"Estimation mensuelle"}</p>
              <p className="text-4xl font-bold text-cyan-400">{"~ "}{formatCents(passiveEstimate)}{" \u20ac"}</p>
              <p className="text-white/30 text-xs mt-1">{"par mois"}</p>
            </div>
            <p className="text-white/40 text-xs text-center">{"Bas\u00e9 sur votre historique de soutiens et recompenses moyennes des trois derniers mois."}</p>
          </CardContent>
        </Card>

        {/* Objectif financier */}
        <Card className="bg-slate-900/50 border-white/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-white flex items-center gap-2 text-base">
              <Target className="h-5 w-5 text-emerald-400" />
              {"Objectif financier"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-white/50 text-sm">{"Progression"}</span>
              <span className="text-emerald-400 font-bold">{goalProgress}{" %"}</span>
            </div>
            <ProgressBar value={wallet.totalEarnedCents} max={financialGoal} color="emerald" />
            <div className="flex items-center justify-between text-xs text-white/40">
              <span>{formatCents(wallet.totalEarnedCents)}{" \u20ac gagn\u00e9s"}</span>
              <span>{"Objectif : "}{formatCents(financialGoal)}{" \u20ac"}</span>
            </div>
            {goalRemaining > 0 && (
              <p className="text-white/40 text-xs text-center bg-white/5 rounded-lg p-2">
                {"Encore "}{formatCents(goalRemaining)}{" \u20ac pour atteindre votre objectif."}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* SECTION 11 : AI INSIGHTS */}
      <Card className="bg-gradient-to-br from-purple-900/10 to-indigo-800/5 border-purple-500/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-white flex items-center gap-2 text-base">
            <Lightbulb className="h-5 w-5 text-purple-400" />
            {"Insights intelligents"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {MOCK_INSIGHTS.map((insight, i) => (
              <div key={i} className="bg-black/20 border border-purple-500/10 rounded-xl p-4 flex items-start gap-3">
                <Sparkles className="h-4 w-4 text-purple-400 shrink-0 mt-0.5" />
                <p className="text-white/60 text-sm leading-relaxed">{insight}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* SECTION 12 : CLASSEMENT */}
      <Card className="bg-slate-900/50 border-white/10">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/15 flex items-center justify-center">
                <Award className="h-5 w-5 text-amber-400" />
              </div>
              <div>
                <p className="text-white font-medium text-sm">{"Classement VIXUAL"}</p>
                <p className="text-white/40 text-xs">{"Top contributeurs ce mois"}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-amber-400 font-bold text-2xl">{"#12"}</p>
              <p className="text-white/30 text-xs">{"ce mois"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SECTION 13 : ACTIVITE FINANCIERE */}
      <Card className="bg-slate-900/50 border-white/10">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2 text-base">
              <DollarSign className="h-5 w-5 text-emerald-400" />
              {"Activit\u00e9 financi\u00e8re"}
            </CardTitle>
            <div className="flex gap-1">
              {(["all", "in", "out"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setTxFilter(f)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    txFilter === f ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-white/5 text-white/40 border border-transparent hover:bg-white/10"
                  }`}
                >
                  {f === "all" ? "Tout" : f === "in" ? "Entr\u00e9es" : "Sorties"}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredTx.length === 0 ? (
            <p className="text-center text-white/30 py-8">{"Aucune transaction pour le moment"}</p>
          ) : (
            <div className="space-y-2">
              {filteredTx.map((tx: { id: string; type: string; amountCents: number; description: string; status: string; createdAt: string }) => (
                <div key={tx.id} className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg hover:bg-slate-800/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${tx.amountCents >= 0 ? "bg-emerald-500/15" : "bg-slate-700/50"}`}>
                      {tx.amountCents >= 0
                        ? <ArrowDownRight className="h-4 w-4 text-emerald-400" />
                        : <ArrowUpRight className="h-4 w-4 text-white/50" />
                      }
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">{tx.description || TX_LABELS[tx.type] || tx.type}</p>
                      <p className="text-white/30 text-xs">{formatDate(tx.createdAt)}</p>
                    </div>
                  </div>
                  <span className={`font-semibold text-sm ${tx.amountCents >= 0 ? "text-emerald-400" : "text-white/60"}`}>
                    {tx.amountCents >= 0 ? "+" : ""}{formatCents(tx.amountCents)}{" \u20ac"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* SECTION 14 : SECURITE + LEGAL */}
      <Card className="bg-slate-800/20 border-white/5">
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="h-4 w-4 text-emerald-400" />
            <span className="text-white/60 text-xs font-semibold uppercase tracking-wider">{"S\u00e9curit\u00e9 et informations l\u00e9gales"}</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-white/35">
            <div className="flex items-start gap-2">
              <Lock className="h-3.5 w-3.5 mt-0.5 shrink-0 text-white/20" />
              <span>{"Blocage automatique du wallet en cas de suspension de compte."}</span>
            </div>
            <div className="flex items-start gap-2">
              <Clock className="h-3.5 w-3.5 mt-0.5 shrink-0 text-white/20" />
              <span>{"V\u00e9rification de soixante-douze heures pour tout retrait sup\u00e9rieur ou \u00e9gal \u00e0 mille euros."}</span>
            </div>
            <div className="flex items-start gap-2">
              <CreditCard className="h-3.5 w-3.5 mt-0.5 shrink-0 text-white/20" />
              <span>{"V\u00e9rification d'identit\u00e9 (KYC) requise via Stripe Connect pour recevoir un paiement."}</span>
            </div>
            <div className="flex items-start gap-2">
              <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0 text-white/20" />
              <span>{"Gains non garantis. Les retours d\u00e9pendent de la performance des projets soutenus. VIXUAL n'est pas un jeu de hasard."}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
