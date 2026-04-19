"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Users,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  ExternalLink,
  Send,
  Pause,
  Play,
  Eye,
  Building2,
  Wallet,
  Receipt,
  BarChart3,
  AlertCircle,
  Filter,
  Search,
  ChevronRight,
  ChevronDown,
  Banknote,
  ShieldAlert,
  TrendingUp,
  ArrowRight,
} from "lucide-react"

// ── Types ───────────────────────────────────────────────────────────────────

interface ConnectAccountSummary {
  id: string
  userId: string
  email: string
  displayName: string
  status: "none" | "pending" | "restricted" | "verified" | "disabled"
  chargesEnabled: boolean
  payoutsEnabled: boolean
  createdAt: string
  country: string
  pendingAmount: number
  totalPaid: number
  requirementsDue: number
}

interface PaymentSummary {
  id: string
  userId: string
  userEmail: string
  contentId: string
  contentTitle: string
  amount: number
  status: "pending" | "succeeded" | "failed" | "refunded"
  createdAt: string
  stripePaymentIntentId: string
}

interface PayoutLedgerEntry {
  id: string
  userId: string
  userEmail: string
  amount: number
  category: string
  status: "pending" | "processing" | "paid" | "failed" | "frozen"
  stripeTransferId?: string
  createdAt: string
  cycleId?: string
}

interface StripeConnectStats {
  totalAccounts: number
  verifiedAccounts: number
  pendingAccounts: number
  restrictedAccounts: number
  disabledAccounts: number
  totalPayments: number
  successfulPayments: number
  failedPayments: number
  totalPaymentsVolume: number
  pendingPayouts: number
  pendingPayoutsAmount: number
  completedPayouts: number
  completedPayoutsAmount: number
  frozenPayouts: number
  frozenPayoutsAmount: number
  lastSyncAt: string
}

// ── Mock data pour dev ────────────────────────────────────────────────────────

const MOCK_STATS: StripeConnectStats = {
  totalAccounts: 156,
  verifiedAccounts: 89,
  pendingAccounts: 42,
  restrictedAccounts: 18,
  disabledAccounts: 7,
  totalPayments: 1247,
  successfulPayments: 1189,
  failedPayments: 58,
  totalPaymentsVolume: 45678.50,
  pendingPayouts: 23,
  pendingPayoutsAmount: 3450.00,
  completedPayouts: 312,
  completedPayoutsAmount: 28945.75,
  frozenPayouts: 4,
  frozenPayoutsAmount: 890.00,
  lastSyncAt: new Date().toISOString(),
}

const MOCK_ACCOUNTS: ConnectAccountSummary[] = [
  { id: "acct_1", userId: "u1", email: "creator1@example.com", displayName: "Jean Createur", status: "verified", chargesEnabled: true, payoutsEnabled: true, createdAt: "2024-01-15", country: "FR", pendingAmount: 150.00, totalPaid: 2340.50, requirementsDue: 0 },
  { id: "acct_2", userId: "u2", email: "creator2@example.com", displayName: "Marie Artiste", status: "pending", chargesEnabled: false, payoutsEnabled: false, createdAt: "2024-02-20", country: "FR", pendingAmount: 0, totalPaid: 0, requirementsDue: 3 },
  { id: "acct_3", userId: "u3", email: "creator3@example.com", displayName: "Paul Podcasteur", status: "restricted", chargesEnabled: true, payoutsEnabled: false, createdAt: "2024-01-28", country: "BE", pendingAmount: 450.00, totalPaid: 890.00, requirementsDue: 2 },
  { id: "acct_4", userId: "u4", email: "creator4@example.com", displayName: "Sophie Ecrivain", status: "disabled", chargesEnabled: false, payoutsEnabled: false, createdAt: "2023-12-10", country: "FR", pendingAmount: 0, totalPaid: 560.00, requirementsDue: 5 },
]

const MOCK_PAYMENTS: PaymentSummary[] = [
  { id: "pay_1", userId: "u5", userEmail: "contrib1@example.com", contentId: "c1", contentTitle: "Film Documentaire XYZ", amount: 25.00, status: "succeeded", createdAt: "2024-03-15T10:30:00Z", stripePaymentIntentId: "pi_xxx1" },
  { id: "pay_2", userId: "u6", userEmail: "contrib2@example.com", contentId: "c2", contentTitle: "Podcast Innovation", amount: 10.00, status: "succeeded", createdAt: "2024-03-15T09:15:00Z", stripePaymentIntentId: "pi_xxx2" },
  { id: "pay_3", userId: "u7", userEmail: "contrib3@example.com", contentId: "c1", contentTitle: "Film Documentaire XYZ", amount: 50.00, status: "pending", createdAt: "2024-03-15T08:45:00Z", stripePaymentIntentId: "pi_xxx3" },
  { id: "pay_4", userId: "u8", userEmail: "contrib4@example.com", contentId: "c3", contentTitle: "Roman Graphique", amount: 15.00, status: "failed", createdAt: "2024-03-14T22:00:00Z", stripePaymentIntentId: "pi_xxx4" },
]

const MOCK_PAYOUTS: PayoutLedgerEntry[] = [
  { id: "payout_1", userId: "u1", userEmail: "creator1@example.com", amount: 500.00, category: "creator_gain", status: "pending", createdAt: "2024-03-14T12:00:00Z", cycleId: "cycle_march_2024" },
  { id: "payout_2", userId: "u3", userEmail: "creator3@example.com", amount: 230.00, category: "creator_gain", status: "frozen", createdAt: "2024-03-13T15:30:00Z", cycleId: "cycle_march_2024" },
  { id: "payout_3", userId: "u1", userEmail: "creator1@example.com", amount: 890.00, category: "creator_gain", status: "paid", stripeTransferId: "tr_xxx1", createdAt: "2024-02-28T10:00:00Z", cycleId: "cycle_feb_2024" },
]

// ── Status helpers ────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  none: { label: "Non demarré", color: "bg-slate-500/20 text-slate-400 border-slate-500/30", icon: Clock },
  pending: { label: "En cours", color: "bg-amber-500/20 text-amber-400 border-amber-500/30", icon: Clock },
  restricted: { label: "Restreint", color: "bg-orange-500/20 text-orange-400 border-orange-500/30", icon: AlertTriangle },
  verified: { label: "Verifié", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30", icon: CheckCircle },
  disabled: { label: "Desactivé", color: "bg-red-500/20 text-red-400 border-red-500/30", icon: XCircle },
} as const

const PAYMENT_STATUS_CONFIG = {
  pending: { label: "En attente", color: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
  succeeded: { label: "Reussi", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
  failed: { label: "Echoué", color: "bg-red-500/20 text-red-400 border-red-500/30" },
  refunded: { label: "Remboursé", color: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
} as const

const PAYOUT_STATUS_CONFIG = {
  pending: { label: "En attente", color: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
  processing: { label: "En cours", color: "bg-sky-500/20 text-sky-400 border-sky-500/30" },
  paid: { label: "Payé", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
  failed: { label: "Echoué", color: "bg-red-500/20 text-red-400 border-red-500/30" },
  frozen: { label: "Gelé", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
} as const

// ── Page principale ────────────────────────────────────────────────────────────

export default function StripeConnectDashboardPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [stats, setStats] = useState<StripeConnectStats>(MOCK_STATS)
  const [accounts, setAccounts] = useState<ConnectAccountSummary[]>(MOCK_ACCOUNTS)
  const [payments, setPayments] = useState<PaymentSummary[]>(MOCK_PAYMENTS)
  const [payouts, setPayouts] = useState<PayoutLedgerEntry[]>(MOCK_PAYOUTS)
  const [activeTab, setActiveTab] = useState<"overview" | "accounts" | "payments" | "payouts">("overview")
  const [accountFilter, setAccountFilter] = useState<string>("all")
  const [expandedAccount, setExpandedAccount] = useState<string | null>(null)

  // Fetch data from real Admin API (falls back to mocks if unauthenticated)
  const fetchData = useCallback(async () => {
    if (!user?.email) {
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const emailParam = encodeURIComponent(user.email)
      const [statsRes, accountsRes, paymentsRes, payoutsRes] = await Promise.all([
        fetch(`/api/admin/stripe-connect?email=${emailParam}&action=stats`, { cache: "no-store" }),
        fetch(`/api/admin/stripe-connect?email=${emailParam}&action=accounts`, { cache: "no-store" }),
        fetch(`/api/admin/stripe-connect?email=${emailParam}&action=payments`, { cache: "no-store" }),
        fetch(`/api/admin/stripe-connect?email=${emailParam}&action=payouts`, { cache: "no-store" }),
      ])

      if (statsRes.ok) {
        const data = await statsRes.json()
        if (data?.stats) setStats({ ...MOCK_STATS, ...data.stats })
      }
      if (accountsRes.ok) {
        const data = await accountsRes.json()
        if (Array.isArray(data?.accounts)) setAccounts(data.accounts)
      }
      if (paymentsRes.ok) {
        const data = await paymentsRes.json()
        if (Array.isArray(data?.payments)) setPayments(data.payments)
      }
      if (payoutsRes.ok) {
        const data = await payoutsRes.json()
        if (Array.isArray(data?.payouts)) setPayouts(data.payouts)
      }
    } catch (error) {
      console.error("[Admin/StripeConnect] Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }, [user?.email])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Sync all accounts with Stripe
  const handleSyncAll = async () => {
    if (!user?.email) return
    setSyncing(true)
    try {
      await fetch("/api/admin/stripe-connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email, action: "sync-all" }),
      })
      await fetchData()
    } catch (error) {
      console.error("[Admin/StripeConnect] Sync error:", error)
    } finally {
      setSyncing(false)
    }
  }

  // Execute pending payouts
  const handleExecutePayouts = async () => {
    if (!user?.email) return
    if (!confirm("Executer tous les paiements en attente ? Cette action est irreversible.")) return
    try {
      const res = await fetch("/api/admin/stripe-connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email, action: "execute-payouts" }),
      })
      const data = await res.json()
      if (data?.message) alert(data.message)
      await fetchData()
    } catch (error) {
      console.error("[Admin/StripeConnect] Execute payouts error:", error)
    }
  }

  // Freeze/unfreeze a payout
  const handleToggleFreeze = async (payoutId: string, currentStatus: string) => {
    if (!user?.email) return
    const newStatus = currentStatus === "frozen" ? "pending" : "frozen"
    try {
      const res = await fetch("/api/admin/stripe-connect", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email, payoutId, status: newStatus }),
      })
      if (res.ok) {
        setPayouts(prev => prev.map(p => p.id === payoutId ? { ...p, status: newStatus as "frozen" | "pending" } : p))
      }
    } catch (error) {
      console.error("[Admin/StripeConnect] Toggle freeze error:", error)
    }
  }

  // Resend onboarding link
  const handleResendOnboarding = async (accountId: string) => {
    if (!user?.email) return
    try {
      const res = await fetch("/api/admin/stripe-connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email, action: "resend-onboarding", accountId }),
      })
      const data = await res.json()
      if (data?.url) {
        window.open(data.url, "_blank")
      } else {
        alert("Impossible de generer le lien d'onboarding")
      }
    } catch (error) {
      console.error("[Admin/StripeConnect] Resend onboarding error:", error)
    }
  }

  // Filter accounts
  const filteredAccounts = accounts.filter(a => {
    if (accountFilter === "all") return true
    return a.status === accountFilter
  })

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-3">
          <RefreshCw className="h-10 w-10 text-violet-400 animate-spin mx-auto" />
          <p className="text-white/50 text-sm">Chargement du dashboard Stripe Connect...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/30 to-indigo-500/20 border border-violet-500/40 flex items-center justify-center">
              <Building2 className="h-5 w-5 text-violet-400" />
            </div>
            Stripe Connect Dashboard
          </h1>
          <p className="text-white/40 text-sm mt-1 pl-13">
            Gestion des comptes Connect, paiements et redistributions — ADMIN/PATRON
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={handleSyncAll}
            disabled={syncing}
            variant="outline"
            className="border-white/10 text-white/70 hover:bg-white/5 gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${syncing ? "animate-spin" : ""}`} />
            Synchroniser Stripe
          </Button>
          <a
            href="https://dashboard.stripe.com/connect/accounts/overview"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-violet-500/20 hover:bg-violet-500/30 border border-violet-500/40 rounded-lg text-violet-300 text-sm transition-colors"
          >
            <ExternalLink className="h-4 w-4" />
            Dashboard Stripe
          </a>
        </div>
      </div>

      {/* ── Tabs ─────────────────────────────────────────────────────── */}
      <div className="flex gap-2 border-b border-white/10 pb-2">
        {[
          { id: "overview", label: "Vue d'ensemble", icon: BarChart3 },
          { id: "accounts", label: "Comptes Connect", icon: Users },
          { id: "payments", label: "Paiements", icon: CreditCard },
          { id: "payouts", label: "Redistributions", icon: Banknote },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? "bg-violet-500/20 text-violet-300 border border-violet-500/40"
                : "text-white/50 hover:text-white/80 hover:bg-white/5"
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Overview Tab ─────────────────────────────────────────────────────── */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-slate-900/60 border-white/10">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-violet-500/15 flex items-center justify-center">
                    <Users className="h-5 w-5 text-violet-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{stats.totalAccounts}</p>
                    <p className="text-white/40 text-xs">Comptes Connect</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2 text-xs">
                  <span className="text-emerald-400">{stats.verifiedAccounts} verifiés</span>
                  <span className="text-white/20">|</span>
                  <span className="text-amber-400">{stats.pendingAccounts} en cours</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/60 border-white/10">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center">
                    <CreditCard className="h-5 w-5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{stats.totalPaymentsVolume.toLocaleString("fr-FR")} EUR</p>
                    <p className="text-white/40 text-xs">Volume total</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2 text-xs">
                  <span className="text-emerald-400">{stats.successfulPayments} reussis</span>
                  <span className="text-white/20">|</span>
                  <span className="text-red-400">{stats.failedPayments} echoués</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/60 border-white/10">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center">
                    <Clock className="h-5 w-5 text-amber-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{stats.pendingPayoutsAmount.toLocaleString("fr-FR")} EUR</p>
                    <p className="text-white/40 text-xs">Redistrib. en attente</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2 text-xs">
                  <span className="text-amber-400">{stats.pendingPayouts} paiements</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/60 border-white/10">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-sky-500/15 flex items-center justify-center">
                    <Banknote className="h-5 w-5 text-sky-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{stats.completedPayoutsAmount.toLocaleString("fr-FR")} EUR</p>
                    <p className="text-white/40 text-xs">Total redistribué</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2 text-xs">
                  <span className="text-sky-400">{stats.completedPayouts} transferts</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Alerts */}
          {(stats.restrictedAccounts > 0 || stats.frozenPayouts > 0) && (
            <Card className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border-orange-500/30">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <ShieldAlert className="h-5 w-5 text-orange-400 mt-0.5" />
                  <div>
                    <h3 className="text-white font-medium">Actions requises</h3>
                    <ul className="mt-2 space-y-1 text-sm text-white/60">
                      {stats.restrictedAccounts > 0 && (
                        <li className="flex items-center gap-2">
                          <AlertTriangle className="h-3 w-3 text-orange-400" />
                          {stats.restrictedAccounts} compte(s) avec informations manquantes
                        </li>
                      )}
                      {stats.disabledAccounts > 0 && (
                        <li className="flex items-center gap-2">
                          <XCircle className="h-3 w-3 text-red-400" />
                          {stats.disabledAccounts} compte(s) desactivé(s)
                        </li>
                      )}
                      {stats.frozenPayouts > 0 && (
                        <li className="flex items-center gap-2">
                          <Pause className="h-3 w-3 text-blue-400" />
                          {stats.frozenPayouts} paiement(s) gele(s) - {stats.frozenPayoutsAmount.toLocaleString("fr-FR")} EUR
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              onClick={handleExecutePayouts}
              className="h-auto py-4 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300"
            >
              <div className="flex flex-col items-center gap-2">
                <Send className="h-6 w-6" />
                <span>Executer les redistributions</span>
                <span className="text-xs text-emerald-400/70">{stats.pendingPayouts} en attente</span>
              </div>
            </Button>

            <Button
              onClick={() => setActiveTab("accounts")}
              variant="outline"
              className="h-auto py-4 border-white/10 text-white/70 hover:bg-white/5"
            >
              <div className="flex flex-col items-center gap-2">
                <Users className="h-6 w-6" />
                <span>Gerer les comptes Connect</span>
                <span className="text-xs text-white/40">{stats.pendingAccounts} onboarding en cours</span>
              </div>
            </Button>

            <Button
              onClick={() => setActiveTab("payments")}
              variant="outline"
              className="h-auto py-4 border-white/10 text-white/70 hover:bg-white/5"
            >
              <div className="flex flex-col items-center gap-2">
                <Receipt className="h-6 w-6" />
                <span>Voir les paiements</span>
                <span className="text-xs text-white/40">{stats.totalPayments} transactions</span>
              </div>
            </Button>
          </div>
        </div>
      )}

      {/* ── Accounts Tab ─────────────────────────────────────────────────────── */}
      {activeTab === "accounts" && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-900/60 border border-white/10 rounded-lg px-3 py-2">
              <Filter className="h-4 w-4 text-white/40" />
              <select
                value={accountFilter}
                onChange={(e) => setAccountFilter(e.target.value)}
                className="bg-transparent text-white/70 text-sm outline-none"
              >
                <option value="all">Tous les comptes</option>
                <option value="verified">Verifiés</option>
                <option value="pending">En cours</option>
                <option value="restricted">Restreints</option>
                <option value="disabled">Desactivés</option>
              </select>
            </div>
            <span className="text-white/40 text-sm">{filteredAccounts.length} compte(s)</span>
          </div>

          {/* Accounts List */}
          <div className="space-y-3">
            {filteredAccounts.map(account => {
              const statusCfg = STATUS_CONFIG[account.status]
              const isExpanded = expandedAccount === account.id
              
              return (
                <Card key={account.id} className="bg-slate-900/60 border-white/10 overflow-hidden">
                  <CardContent className="p-0">
                    <button
                      onClick={() => setExpandedAccount(isExpanded ? null : account.id)}
                      className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500/30 to-indigo-500/20 flex items-center justify-center">
                          <span className="text-white font-bold text-sm">
                            {account.displayName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="text-left">
                          <p className="text-white font-medium">{account.displayName}</p>
                          <p className="text-white/40 text-sm">{account.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge className={statusCfg.color}>
                          <statusCfg.icon className="h-3 w-3 mr-1" />
                          {statusCfg.label}
                        </Badge>
                        {account.requirementsDue > 0 && (
                          <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
                            {account.requirementsDue} info(s) requise(s)
                          </Badge>
                        )}
                        {isExpanded ? (
                          <ChevronDown className="h-5 w-5 text-white/40" />
                        ) : (
                          <ChevronRight className="h-5 w-5 text-white/40" />
                        )}
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="px-4 pb-4 pt-2 border-t border-white/5 space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-white/40">Pays</p>
                            <p className="text-white">{account.country}</p>
                          </div>
                          <div>
                            <p className="text-white/40">Créé le</p>
                            <p className="text-white">{new Date(account.createdAt).toLocaleDateString("fr-FR")}</p>
                          </div>
                          <div>
                            <p className="text-white/40">En attente</p>
                            <p className="text-white">{account.pendingAmount.toLocaleString("fr-FR")} EUR</p>
                          </div>
                          <div>
                            <p className="text-white/40">Total payé</p>
                            <p className="text-white">{account.totalPaid.toLocaleString("fr-FR")} EUR</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-sm">
                          <span className={`flex items-center gap-1 ${account.chargesEnabled ? "text-emerald-400" : "text-red-400"}`}>
                            {account.chargesEnabled ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                            Charges
                          </span>
                          <span className="text-white/20">|</span>
                          <span className={`flex items-center gap-1 ${account.payoutsEnabled ? "text-emerald-400" : "text-red-400"}`}>
                            {account.payoutsEnabled ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                            Payouts
                          </span>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleResendOnboarding(account.id)}
                            variant="outline"
                            size="sm"
                            className="border-white/10 text-white/70 hover:bg-white/5"
                          >
                            <Send className="h-3 w-3 mr-1" />
                            Renvoyer onboarding
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-white/10 text-white/70 hover:bg-white/5"
                          >
                            <RefreshCw className="h-3 w-3 mr-1" />
                            Actualiser statut
                          </Button>
                          <a
                            href={`https://dashboard.stripe.com/connect/accounts/${account.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm border border-white/10 rounded-lg text-white/70 hover:bg-white/5"
                          >
                            <ExternalLink className="h-3 w-3" />
                            Voir sur Stripe
                          </a>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Payments Tab ─────────────────────────────────────────────────────── */}
      {activeTab === "payments" && (
        <div className="space-y-4">
          <Card className="bg-slate-900/60 border-white/10">
            <CardHeader>
              <CardTitle className="text-white text-base">Paiements recents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {payments.map(payment => {
                  const statusCfg = PAYMENT_STATUS_CONFIG[payment.status]
                  return (
                    <div key={payment.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-emerald-500/15 flex items-center justify-center">
                          <CreditCard className="h-5 w-5 text-emerald-400" />
                        </div>
                        <div>
                          <p className="text-white font-medium">{payment.contentTitle}</p>
                          <p className="text-white/40 text-sm">{payment.userEmail}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-white font-bold">{payment.amount.toLocaleString("fr-FR")} EUR</p>
                          <p className="text-white/40 text-xs">{new Date(payment.createdAt).toLocaleString("fr-FR")}</p>
                        </div>
                        <Badge className={statusCfg.color}>{statusCfg.label}</Badge>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── Payouts Tab ─────────────────────────────────────────────────────── */}
      {activeTab === "payouts" && (
        <div className="space-y-4">
          {/* Execute button */}
          <div className="flex justify-between items-center">
            <h3 className="text-white font-medium">Ledger de redistribution</h3>
            <Button
              onClick={handleExecutePayouts}
              className="bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 gap-2"
            >
              <Send className="h-4 w-4" />
              Executer les paiements en attente
            </Button>
          </div>

          <Card className="bg-slate-900/60 border-white/10">
            <CardContent className="p-0">
              <div className="divide-y divide-white/5">
                {payouts.map(payout => {
                  const statusCfg = PAYOUT_STATUS_CONFIG[payout.status]
                  return (
                    <div key={payout.id} className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-sky-500/15 flex items-center justify-center">
                          <Banknote className="h-5 w-5 text-sky-400" />
                        </div>
                        <div>
                          <p className="text-white font-medium">{payout.userEmail}</p>
                          <p className="text-white/40 text-sm">{payout.category} - {payout.cycleId || "N/A"}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-white font-bold">{payout.amount.toLocaleString("fr-FR")} EUR</p>
                          <p className="text-white/40 text-xs">{new Date(payout.createdAt).toLocaleString("fr-FR")}</p>
                        </div>
                        <Badge className={statusCfg.color}>{statusCfg.label}</Badge>
                        {(payout.status === "pending" || payout.status === "frozen") && (
                          <Button
                            onClick={() => handleToggleFreeze(payout.id, payout.status)}
                            variant="ghost"
                            size="sm"
                            className="text-white/50 hover:text-white"
                          >
                            {payout.status === "frozen" ? (
                              <Play className="h-4 w-4" />
                            ) : (
                              <Pause className="h-4 w-4" />
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <div className="text-center text-white/30 text-xs pt-4 border-t border-white/5">
        Derniere synchronisation : {new Date(stats.lastSyncAt).toLocaleString("fr-FR")}
      </div>
    </div>
  )
}
