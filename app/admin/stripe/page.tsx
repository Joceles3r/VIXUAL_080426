"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  CreditCard,
  Key,
  Eye,
  EyeOff,
  Save,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Zap,
  Shield,
  Lock,
  Unlock,
  ArrowRightLeft,
  ExternalLink,
  Copy,
  Webhook,
  Building2,
  Database,
  HardDrive,
} from "lucide-react"

// ── Types ─────────────────────────────────────────────────────────────────────

interface StripeConfigState {
  configured: boolean
  active_mode: "test" | "live"
  updated_by?: string
  updated_at?: string
  test_secret_key_masked?: string
  test_publishable_key?: string
  test_webhook_secret_masked?: string
  live_secret_key_masked?: string
  live_publishable_key?: string
  live_webhook_secret_masked?: string
  connect_client_id?: string
  has_test_secret?: boolean
  has_live_secret?: boolean
  has_test_webhook?: boolean
  has_live_webhook?: boolean
  source?: "database" | "memory"
}

interface FormData {
  test_secret_key: string
  test_publishable_key: string
  test_webhook_secret: string
  live_secret_key: string
  live_publishable_key: string
  live_webhook_secret: string
  connect_client_id: string
}

// ── Composant champ de saisie sécurisé ────────────────────────────────────────

const MASKED_PLACEHOLDER = "••••••••••••••••"

function SecretField({
  label,
  id,
  value,
  onChange,
  placeholder,
  masked,
  hasValue,
  required,
  helpText,
  isSecret = true,
}: {
  label: string
  id: keyof FormData
  value: string
  onChange: (id: keyof FormData, val: string) => void
  placeholder: string
  masked?: string
  hasValue?: boolean
  required?: boolean
  helpText?: string
  isSecret?: boolean
}) {
  const [visible, setVisible] = useState(false)
  const [copied, setCopied] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  const handleCopy = () => {
    if (value) {
      navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    }
  }

  // Si cle secrete configuree et pas en mode edition, afficher le placeholder masque
  const displayValue = isSecret && hasValue && !isEditing && !value ? MASKED_PLACEHOLDER : value
  const showConfiguredBadge = hasValue && !value && !isEditing

  const handleFocus = () => {
    if (isSecret && hasValue && !value) {
      setIsEditing(true)
    }
  }

  const handleBlur = () => {
    if (isSecret && !value) {
      setIsEditing(false)
    }
  }

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-white/70 uppercase tracking-wider">
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
        {showConfiguredBadge && (
          <Badge className="text-xs bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
            <CheckCircle className="h-3 w-3 mr-1" />
            Configuree
          </Badge>
        )}
      </div>
      <div className="relative flex items-center gap-2">
        <div className="relative flex-1">
          <input
            type={visible ? "text" : "password"}
            value={displayValue}
            onChange={(e) => {
              const newVal = e.target.value
              // Si l'utilisateur efface le placeholder masque, vider le champ
              if (newVal === MASKED_PLACEHOLDER.slice(0, -1) || newVal === "") {
                onChange(id, "")
              } else if (newVal !== MASKED_PLACEHOLDER) {
                onChange(id, newVal)
              }
            }}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={masked || placeholder}
            className={`w-full bg-slate-900/80 border rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/30 font-mono pr-10 ${
              showConfiguredBadge ? "border-emerald-500/30" : "border-white/10"
            }`}
          />
          <button
            type="button"
            onClick={() => setVisible(!visible)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors"
          >
            {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {value && (
          <button
            type="button"
            onClick={handleCopy}
            className="p-2.5 rounded-lg bg-slate-800 border border-white/10 text-white/40 hover:text-white/80 hover:bg-slate-700 transition-all"
            title="Copier"
          >
            {copied ? <CheckCircle className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
          </button>
        )}
      </div>
      {helpText && <p className="text-xs text-white/30 pl-1">{helpText}</p>}
      {showConfiguredBadge && (
        <p className="text-xs text-emerald-400/60 pl-1">
          Cle deja configuree. Laissez vide pour conserver, ou saisissez une nouvelle cle pour remplacer.
        </p>
      )}
    </div>
  )
}

// ── Page principale ────────────────────────────────────────────────────────────

export default function StripeConfigPage() {
  const { user } = useAuth()
  const [config, setConfig] = useState<StripeConfigState | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toggling, setToggling] = useState(false)
  const [testingHealth, setTestingHealth] = useState(false)
  const [healthResult, setHealthResult] = useState<{
    ok: boolean;
    source: string;
    mode: string;
    can_process_payments: boolean;
    warnings: string[];
    errors: string[];
  } | null>(null)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [activeSection, setActiveSection] = useState<"test" | "live">("test")

  const [form, setForm] = useState<FormData>({
    test_secret_key: "",
    test_publishable_key: "",
    test_webhook_secret: "",
    live_secret_key: "",
    live_publishable_key: "",
    live_webhook_secret: "",
    connect_client_id: "",
  })

  const updateField = useCallback((id: keyof FormData, val: string) => {
    setForm((f) => ({ ...f, [id]: val }))
  }, [])

  const fetchConfig = useCallback(async () => {
    if (!user?.email) return
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/stripe-config?email=${encodeURIComponent(user.email)}`, {
        headers: { "x-admin-email": user.email },
        cache: "no-store",   // FIX #3 — empêche le cache navigateur de servir d'anciennes données
      })
      if (res.ok) {
        const data = await res.json()
        setConfig(data)
        // FIX #1 — toujours réhydrater les clés publiques (visibles) dans le form, sans condition
        setForm(prev => ({
          ...prev,
          test_publishable_key: data.test_publishable_key || prev.test_publishable_key,
          live_publishable_key: data.live_publishable_key || prev.live_publishable_key,
          connect_client_id: data.connect_client_id || prev.connect_client_id,
        }))
      }
    } catch {
      setMessage({ type: "error", text: "Impossible de charger la configuration." })
    } finally {
      setLoading(false)
    }
  }, [user?.email])

  useEffect(() => {
    fetchConfig()
  }, [fetchConfig])

  const handleSave = async () => {
    if (!user?.email) return
    setSaving(true)
    setMessage(null)

    // Only send fields that have been filled
    const payload: Record<string, string> = { email: user.email }
    if (form.test_secret_key) payload.test_secret_key = form.test_secret_key
    if (form.test_publishable_key) payload.test_publishable_key = form.test_publishable_key
    if (form.test_webhook_secret) payload.test_webhook_secret = form.test_webhook_secret
    if (form.live_secret_key) payload.live_secret_key = form.live_secret_key
    if (form.live_publishable_key) payload.live_publishable_key = form.live_publishable_key
    if (form.live_webhook_secret) payload.live_webhook_secret = form.live_webhook_secret
    // FIX #2 — n'envoyer connect_client_id que si non-vide pour ne pas écraser la valeur DB
    if (form.connect_client_id) payload.connect_client_id = form.connect_client_id

    try {
      const res = await fetch("/api/admin/stripe-config", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-admin-email": user.email 
        },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (res.ok) {
        setMessage({ type: "success", text: data.message || "Cles sauvegardees avec succes." })
        // Clear only secret fields after save, keep visible ones
        setForm(prev => ({
          ...prev,
          test_secret_key: "",
          test_webhook_secret: "",
          live_secret_key: "",
          live_webhook_secret: "",
          // Keep publishable keys and connect_client_id visible
        }))
        fetchConfig()
      } else {
        setMessage({ type: "error", text: data.error || "Erreur lors de la sauvegarde." })
      }
    } catch {
      setMessage({ type: "error", text: "Erreur réseau." })
    } finally {
      setSaving(false)
    }
  }

  const handleTestHealth = async () => {
    setTestingHealth(true)
    setHealthResult(null)
    setMessage(null)
    try {
      const res = await fetch("/api/admin/stripe-health")
      const data = await res.json()
      setHealthResult(data)
      
      if (data.stripe_connection_ok && data.ok) {
        const accountInfo = data.stripe_account?.id ? ` (Compte: ${data.stripe_account.id})` : ""
        setMessage({ type: "success", text: `Connexion Stripe reussie${accountInfo} - Pret pour les paiements` })
      } else if (data.stripe_connection_ok && !data.ok) {
        setMessage({ type: "error", text: "Connexion Stripe OK mais configuration incomplete: " + (data.errors?.[0] || data.warnings?.[0] || "Verifiez les cles") })
      } else if (!data.stripe_connection_ok && data.errors?.length > 0) {
        setMessage({ type: "error", text: data.errors[0] })
      } else if (!data.has_secret_key) {
        setMessage({ type: "error", text: "Aucune cle secrete Stripe configuree - entrez votre cle sk_test_..." })
      } else {
        setMessage({ type: "error", text: "Echec du test de connexion Stripe" })
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Erreur inconnue"
      setMessage({ type: "error", text: `Impossible de tester la connexion Stripe: ${errorMsg}` })
    } finally {
      setTestingHealth(false)
    }
  }

  const handleToggleMode = async () => {
    if (!user?.email || !config) return
    const newMode = config.active_mode === "test" ? "live" : "test"

    if (newMode === "live" && !config.has_live_secret) {
      setMessage({ type: "error", text: "Configurez d'abord les clés LIVE avant de basculer en mode production !" })
      return
    }

    if (!confirm(`Basculer en mode ${newMode.toUpperCase()} ?\n\n${newMode === "live" ? "⚠️  ATTENTION : Les transactions seront RÉELLES." : "Retour en mode test — aucune transaction réelle."}`)) {
      return
    }

    setToggling(true)
    setMessage(null)
    try {
      const res = await fetch("/api/admin/stripe-config", {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          "x-admin-email": user.email 
        },
        body: JSON.stringify({ email: user.email, mode: newMode }),
      })
      const data = await res.json()
      if (res.ok) {
        setMessage({ type: "success", text: data.message })
        fetchConfig()
      } else {
        setMessage({ type: "error", text: data.error })
      }
    } catch {
      setMessage({ type: "error", text: "Erreur réseau." })
    } finally {
      setToggling(false)
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-3">
          <RefreshCw className="h-10 w-10 text-amber-400 animate-spin mx-auto" />
          <p className="text-white/50 text-sm">Chargement de la configuration Stripe...</p>
        </div>
      </div>
    )
  }

  const isLiveMode = config?.active_mode === "live"
  const hasAnyKey = config?.has_test_secret || config?.has_live_secret

  return (
    <div className="p-6 lg:p-8 max-w-4xl space-y-6">

      {/* ── En-tête ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/30 to-indigo-500/20 border border-violet-500/40 flex items-center justify-center">
              <CreditCard className="h-5 w-5 text-violet-400" />
            </div>
            Configuration Stripe
          </h1>
          <p className="text-white/40 text-sm mt-1 pl-13">
            Gestion des clés API Stripe — ADMIN/PATRON uniquement
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/admin/stripe-connect"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm hover:bg-emerald-500/20 transition-colors"
          >
            <Building2 className="h-4 w-4" />
            Stripe Connect
          </Link>
          <a
            href="https://dashboard.stripe.com/apikeys"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-500/10 border border-violet-500/30 text-violet-400 text-sm hover:bg-violet-500/20 transition-colors"
          >
            <ExternalLink className="h-4 w-4" />
            Dashboard Stripe
          </a>
        </div>
      </div>

      {/* ── Statut du mode ──────────────────────────────────────────────── */}
      <Card className="bg-slate-900/60 border-white/10">
        <CardContent className="p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border ${
                isLiveMode
                  ? "bg-rose-500/20 border-rose-500/40"
                  : "bg-emerald-500/20 border-emerald-500/40"
              }`}>
                {isLiveMode
                  ? <Unlock className="h-7 w-7 text-rose-400" />
                  : <Lock className="h-7 w-7 text-emerald-400" />
                }
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-white font-semibold text-lg">
                    Mode {isLiveMode ? "LIVE" : "TEST"} actif
                  </span>
                  <Badge className={isLiveMode
                    ? "bg-rose-500/20 text-rose-400 border-rose-500/30"
                    : "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                  }>
                    {isLiveMode ? "PRODUCTION" : "DÉVELOPPEMENT"}
                  </Badge>
                </div>
                <p className="text-white/40 text-sm mt-0.5">
                  {isLiveMode
                    ? "⚠️ Transactions financières réelles en cours"
                    : "Aucune transaction réelle — environnement sécurisé"
                  }
                </p>
                {config?.updated_by && (
                  <p className="text-white/25 text-xs mt-1">
                    Dernière modif. par {config.updated_by} — {config.updated_at ? new Date(config.updated_at).toLocaleString("fr-FR") : ""}
                  </p>
                )}
              </div>
            </div>

            <Button
              onClick={handleToggleMode}
              disabled={toggling}
              className={`gap-2 shrink-0 ${
                isLiveMode
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                  : "bg-rose-600/80 hover:bg-rose-700 text-white"
              }`}
            >
              {toggling
                ? <RefreshCw className="h-4 w-4 animate-spin" />
                : <ArrowRightLeft className="h-4 w-4" />
              }
              Basculer en {isLiveMode ? "TEST" : "LIVE"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ── Banniere critique si mode memoire ────────────────────────────────── */}
      {config?.source === "memory" && (
        <div className="p-4 rounded-xl bg-red-950/50 border-2 border-red-500/50 space-y-2">
          <div className="flex items-center gap-2 text-red-400">
            <AlertTriangle className="h-5 w-5" />
            <span className="font-bold">Configuration Stripe temporaire en memoire seulement</span>
          </div>
          <p className="text-red-300/80 text-sm">
            Elle sera perdue au redemarrage du serveur. Les vrais tests Stripe durables exigent une base de donnees configuree.
          </p>
          <p className="text-red-400/60 text-xs font-mono">
            Tests Stripe serieux interdits tant que source !== database
          </p>
        </div>
      )}

      {/* ── Indicateur de source de stockage ────────────────────────────────── */}
      {config?.source && (
        <div className={`flex items-center gap-3 p-4 rounded-lg border ${
          config.source === "database"
            ? "bg-emerald-500/5 border-emerald-500/20"
            : "bg-amber-500/10 border-amber-500/30"
        }`}>
          {config.source === "database" ? (
            <>
              <Database className="h-5 w-5 text-emerald-400" />
              <div>
                <span className="text-emerald-400 font-medium">Stockage Database</span>
                <p className="text-emerald-400/60 text-xs">Configuration sauvegardee en base de donnees (persistante)</p>
              </div>
            </>
          ) : (
            <>
              <HardDrive className="h-5 w-5 text-amber-400" />
              <div className="flex-1">
                <span className="text-amber-400 font-medium">Mode Memoire Volatile</span>
                <p className="text-amber-400/60 text-xs">Configuration temporaire - sera perdue au redemarrage serveur</p>
              </div>
              <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Action requise
              </Badge>
            </>
          )}
        </div>
      )}

      {/* ── Bouton Test Connexion Stripe ────────────────────────────────────── */}
      <div className="flex items-center gap-4">
        <Button
          onClick={handleTestHealth}
          disabled={testingHealth}
          variant="outline"
          className="border-white/20 hover:bg-white/5"
        >
          {testingHealth ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Test en cours...
            </>
          ) : (
            <>
              <Zap className="h-4 w-4 mr-2" />
              Tester la connexion Stripe
            </>
          )}
        </Button>
        {healthResult && (
          <span className={`text-sm ${healthResult.ok ? "text-emerald-400" : "text-rose-400"}`}>
            {healthResult.ok ? "Pret pour les paiements" : "Configuration incomplete"}
          </span>
        )}
      </div>

      {/* ── Statut des clés ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Clé TEST", ok: config?.has_test_secret, icon: Key },
          { label: "Webhook TEST", ok: config?.has_test_webhook, icon: Webhook },
          { label: "Clé LIVE", ok: config?.has_live_secret, icon: Key },
          { label: "Webhook LIVE", ok: config?.has_live_webhook, icon: Webhook },
        ].map((item) => (
          <div
            key={item.label}
            className={`p-3 rounded-xl border flex flex-col items-center gap-2 text-center ${
              item.ok
                ? "bg-emerald-500/10 border-emerald-500/30"
                : "bg-slate-900/60 border-white/10"
            }`}
          >
            <item.icon className={`h-5 w-5 ${item.ok ? "text-emerald-400" : "text-white/20"}`} />
            <span className={`text-xs font-medium ${item.ok ? "text-emerald-300" : "text-white/30"}`}>
              {item.label}
            </span>
            {item.ok
              ? <CheckCircle className="h-4 w-4 text-emerald-400" />
              : <XCircle className="h-4 w-4 text-white/20" />
            }
          </div>
        ))}
      </div>

      {/* ── Message feedback ─────────────────────────────────────────────── */}
      {message && (
        <div className={`flex items-start gap-3 p-4 rounded-xl border ${
          message.type === "success"
            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
            : "bg-rose-500/10 border-rose-500/30 text-rose-300"
        }`}>
          {message.type === "success"
            ? <CheckCircle className="h-5 w-5 shrink-0 mt-0.5" />
            : <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
          }
          <span className="text-sm">{message.text}</span>
        </div>
      )}

      {/* ── Tabs TEST / LIVE ─────────────────────────────────────────────── */}
      <div className="flex rounded-xl bg-slate-900/60 border border-white/10 p-1 gap-1">
        {(["test", "live"] as const).map((section) => (
          <button
            key={section}
            onClick={() => setActiveSection(section)}
            className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all ${
              activeSection === section
                ? section === "live"
                  ? "bg-rose-600 text-white shadow-lg"
                  : "bg-emerald-600 text-white shadow-lg"
                : "text-white/40 hover:text-white/70"
            }`}
          >
            {section === "test" ? "🧪 Clés TEST" : "🔴 Clés LIVE"}
          </button>
        ))}
      </div>

      {/* ── Formulaire TEST ──────────────────────────────────────────────── */}
      {activeSection === "test" && (
        <Card className="bg-slate-900/60 border-emerald-500/20">
          <CardHeader className="pb-4">
            <CardTitle className="text-base text-emerald-300 flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Clés TEST — Développement & Validation
            </CardTitle>
            <p className="text-white/40 text-xs mt-1">
              Trouvez vos clés sur{" "}
              <a href="https://dashboard.stripe.com/test/apikeys" target="_blank" rel="noopener noreferrer" className="text-emerald-400 underline">
                dashboard.stripe.com/test/apikeys
              </a>
            </p>
          </CardHeader>
          <CardContent className="space-y-5">
            <SecretField
              label="Clé secrète TEST"
              id="test_secret_key"
              value={form.test_secret_key}
              onChange={updateField}
              placeholder="sk_test_..."
              masked={config?.test_secret_key_masked}
              hasValue={config?.has_test_secret}
              required
              helpText="Commence par sk_test_ — ne la partagez jamais"
            />
            <SecretField
              label="Cle publique TEST (Publishable Key)"
              id="test_publishable_key"
              value={form.test_publishable_key}
              onChange={updateField}
              placeholder="pk_test_..."
              hasValue={!!config?.test_publishable_key}
              helpText="Commence par pk_test_ — utilisee cote client"
              isSecret={false}
            />
            <SecretField
              label="Secret Webhook TEST"
              id="test_webhook_secret"
              value={form.test_webhook_secret}
              onChange={updateField}
              placeholder="whsec_..."
              masked={config?.test_webhook_secret_masked}
              hasValue={config?.has_test_webhook}
              helpText="Trouvé dans Stripe Dashboard → Webhooks → Signing secret"
            />

            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-2">
              <p className="text-amber-300 text-xs font-semibold flex items-center gap-2">
                <Webhook className="h-4 w-4" />
                URL Webhook à configurer dans Stripe
              </p>
              <code className="text-amber-200/80 text-xs block bg-black/30 px-3 py-2 rounded-lg">
                {typeof window !== "undefined" ? window.location.origin : "https://votre-domaine.com"}
                /api/integrations/stripe/webhooks
              </code>
              <p className="text-white/30 text-xs">
                Événements requis : payment_intent.succeeded, payment_intent.payment_failed, account.updated, charge.refunded, transfer.failed, payout.paid, payout.failed
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Formulaire LIVE ──────────────────────────────────────────────── */}
      {activeSection === "live" && (
        <Card className="bg-slate-900/60 border-rose-500/20">
          <CardHeader className="pb-4">
            <CardTitle className="text-base text-rose-300 flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Clés LIVE — Production réelle
            </CardTitle>
            <div className="flex items-start gap-2 mt-2 p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
              <p className="text-rose-300/80 text-xs">
                Ces clés déclenchent de vraies transactions financières. Configurez-les uniquement
                quand VIXUAL est prêt pour la production.
              </p>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <SecretField
              label="Clé secrète LIVE"
              id="live_secret_key"
              value={form.live_secret_key}
              onChange={updateField}
              placeholder="sk_live_..."
              masked={config?.live_secret_key_masked}
              hasValue={config?.has_live_secret}
              helpText="Commence par sk_live_ — accès complet à votre compte Stripe"
            />
            <SecretField
              label="Cle publique LIVE (Publishable Key)"
              id="live_publishable_key"
              value={form.live_publishable_key}
              onChange={updateField}
              placeholder="pk_live_..."
              hasValue={!!config?.live_publishable_key}
              helpText="Commence par pk_live_ — utilisee cote client"
              isSecret={false}
            />
            <SecretField
              label="Secret Webhook LIVE"
              id="live_webhook_secret"
              value={form.live_webhook_secret}
              onChange={updateField}
              placeholder="whsec_..."
              masked={config?.live_webhook_secret_masked}
              hasValue={config?.has_live_webhook}
              helpText="Créez un endpoint webhook séparé pour la production"
            />
          </CardContent>
        </Card>
      )}

      {/* ── Stripe Connect ───────────────────────────────────────────────── */}
      <Card className="bg-slate-900/60 border-violet-500/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-violet-300 flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Stripe Connect (Paiements créateurs)
          </CardTitle>
          <p className="text-white/30 text-xs mt-1">
            Optionnel — nécessaire pour les virements directs vers les créateurs
          </p>
        </CardHeader>
        <CardContent>
          <SecretField
            label="Client ID Connect"
            id="connect_client_id"
            value={form.connect_client_id}
            onChange={updateField}
            placeholder="ca_..."
            hasValue={!!config?.connect_client_id}
            helpText="Trouvé dans Stripe Dashboard → Connect → Settings"
          />
        </CardContent>
      </Card>

      {/* ── Bouton de sauvegarde ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4 pt-2">
        <div className="flex items-center gap-2 text-white/30 text-xs">
          <Shield className="h-4 w-4" />
          Les clés secrètes sont chiffrées (AES-256-GCM) avant stockage en base
        </div>
        <Button
          onClick={handleSave}
          disabled={saving || !hasAnyKey && !form.test_secret_key && !form.live_secret_key}
          className="bg-amber-500 hover:bg-amber-600 text-black font-bold gap-2 px-6"
          size="lg"
        >
          {saving
            ? <><RefreshCw className="h-4 w-4 animate-spin" /> Sauvegarde...</>
            : <><Save className="h-4 w-4" /> Sauvegarder les clés</>
          }
        </Button>
      </div>

      {/* ── Guide rapide ─────────────────────────────────────────────────── */}
      <Card className="bg-slate-900/40 border-white/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm text-white/50 font-semibold">
            📋 Guide de mise en place rapide
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-2 text-xs text-white/40">
            <li className="flex gap-3"><span className="text-amber-400 font-bold shrink-0">1.</span> Créez un compte sur <a href="https://stripe.com" target="_blank" rel="noopener noreferrer" className="text-amber-400 underline">stripe.com</a> et activez votre compte.</li>
            <li className="flex gap-3"><span className="text-amber-400 font-bold shrink-0">2.</span> Allez dans <strong className="text-white/60">Dashboard → Développeurs → Clés API</strong> et copiez vos clés TEST.</li>
            <li className="flex gap-3"><span className="text-amber-400 font-bold shrink-0">3.</span> Collez les clés TEST dans les champs ci-dessus et cliquez sur <strong className="text-white/60">Sauvegarder</strong>.</li>
            <li className="flex gap-3"><span className="text-amber-400 font-bold shrink-0">4.</span> Dans Stripe Dashboard → Webhooks, créez un endpoint avec l&apos;URL affichée ci-dessus et copiez le <em>Signing Secret</em>.</li>
            <li className="flex gap-3"><span className="text-amber-400 font-bold shrink-0">5.</span> Exécutez le script <code className="bg-black/30 px-1.5 py-0.5 rounded text-amber-300/80">node scripts/014-stripe-config-table.js</code> pour créer la table en base.</li>
            <li className="flex gap-3"><span className="text-amber-400 font-bold shrink-0">6.</span> Quand VIXUAL est en production, ajoutez les clés LIVE et basculez le mode via le bouton ci-dessus.</li>
          </ol>
        </CardContent>
      </Card>

    </div>
  )
}
