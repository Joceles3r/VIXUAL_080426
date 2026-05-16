"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, XCircle, AlertCircle, RefreshCw, Database, CreditCard, Film, Mail, Shield } from "lucide-react"

export default function HealthPage() {
  const { user } = useAuth()
  const [stripeHealth, setStripeHealth] = useState<Record<string, unknown> | null>(null)
  const [integrationsHealth, setIntegrationsHealth] = useState<Record<string, unknown> | null>(null)
  const [briefingData, setBriefingData] = useState<Record<string, unknown> | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchAll = async () => {
    if (!user?.email) return
    setLoading(true)
    const headers = { "x-admin-email": user.email }
    const [stripe, integrations, briefing] = await Promise.all([
      fetch("/api/admin/stripe-health", { headers }).then((r) => r.ok ? r.json() : null).catch(() => null),
      fetch("/api/integrations/health").then((r) => r.ok ? r.json() : null).catch(() => null),
      fetch("/api/admin/briefing/data", { headers }).then((r) => r.ok ? r.json() : null).catch(() => null),
    ])
    setStripeHealth(stripe)
    setIntegrationsHealth(integrations)
    setBriefingData(briefing?.data ?? null)
    setLoading(false)
  }

  useEffect(() => { fetchAll() }, [user?.email])

  const health = briefingData as Record<string, unknown> | null
  const stripeConnected = (integrationsHealth as any)?.health?.stripe?.connected
  const stripeMode = (integrationsHealth as any)?.health?.stripe?.mode
  const stripeWebhooks = (integrationsHealth as any)?.health?.stripe?.webhooksConfigured
  const bunnyValid = (integrationsHealth as any)?.health?.bunny?.env?.valid
  const resendOk = !!(health as any)?.health?.resend
  const dbOk = !!(health as any)?.health?.db

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-1">Sante de la plateforme</h1>
            <p className="text-white/55 text-sm">Diagnostic complet en temps reel</p>
          </div>
          <Button onClick={fetchAll} variant="outline" size="sm" disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Actualiser
          </Button>
        </div>

        {/* Base de donnees */}
        <h2 className="text-xs uppercase tracking-widest text-white/40 mb-3">{"Stockage & donnees"}</h2>
        <Card className="bg-white/[0.03] border-white/10 p-5 mb-8">
          <div className="flex items-start gap-4">
            <Database className="h-6 w-6 text-fuchsia-400 mt-1" />
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">PostgreSQL (Neon)</h3>
                <StatusBadge ok={dbOk} />
              </div>
              <p className="text-white/55 text-sm">
                {dbOk ? "Connectee et operationnelle." : "Connexion a la base impossible. Verifiez DATABASE_URL."}
              </p>
            </div>
          </div>
        </Card>

        {/* Integrations */}
        <h2 className="text-xs uppercase tracking-widest text-white/40 mb-3">Integrations externes</h2>
        <div className="space-y-3 mb-8">
          <IntegrationCard
            icon={CreditCard}
            name="Stripe"
            ok={stripeConnected}
            mode={stripeMode}
            details={
              stripeConnected
                ? `Mode ${stripeMode}, webhooks ${stripeWebhooks ? "OK" : "non configures"}`
                : "Variables d&apos;environnement Stripe non renseignees."
            }
          />
          <IntegrationCard
            icon={Film}
            name="Bunny.net"
            ok={bunnyValid}
            details={
              bunnyValid
                ? "Storage Zone configuree. Uploads operationnels."
                : "Variables Bunny manquantes (BUNNY_STORAGE_API_KEY, BUNNY_CDN_HOSTNAME, etc.)."
            }
          />
          <IntegrationCard
            icon={Mail}
            name="Emails Resend"
            ok={resendOk}
            details={
              resendOk
                ? "API Resend configuree."
                : "RESEND_API_KEY manquante. Aucun email ne partira."
            }
          />
          <IntegrationCard
            icon={Shield}
            name="Cloudflare Turnstile"
            ok={!!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
            details="Anti-bot pour signup. Optionnel mais recommande."
            optional
          />
        </div>

        {/* Activite aujourd'hui */}
        <h2 className="text-xs uppercase tracking-widest text-white/40 mb-3">Activite du jour</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <MiniStat label="Inscriptions" value={(health as any)?.activity?.newUsers ?? 0} />
          <MiniStat label="Contenus" value={(health as any)?.activity?.newContents ?? 0} />
          <MiniStat label="Contributions" value={(health as any)?.activity?.contributions ?? 0} />
          <MiniStat label="Revenus" value={`${(health as any)?.activity?.revenueEur ?? 0}EUR`} accent="emerald" />
        </div>
      </div>
    </div>
  )
}

function StatusBadge({ ok }: { ok: boolean | undefined }) {
  if (ok === undefined) return <AlertCircle className="h-5 w-5 text-amber-400" />
  return ok ? <CheckCircle2 className="h-5 w-5 text-emerald-400" /> : <XCircle className="h-5 w-5 text-red-400" />
}

function IntegrationCard({ icon: Icon, name, ok, mode, details, optional }: { icon: React.ComponentType<{ className?: string }>; name: string; ok?: boolean; mode?: string; details: string; optional?: boolean }) {
  return (
    <Card className="bg-white/[0.03] border-white/10 p-5">
      <div className="flex items-start gap-4">
        <Icon className="h-6 w-6 text-fuchsia-400 mt-1" />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-semibold">{name}</h3>
            {mode && <span className="text-xs px-2 py-0.5 rounded bg-white/10 text-white/70">{mode}</span>}
            {optional && <span className="text-xs px-2 py-0.5 rounded bg-white/5 text-white/40">Optionnel</span>}
            <div className="ml-auto"><StatusBadge ok={ok} /></div>
          </div>
          <p className="text-white/55 text-sm">{details}</p>
        </div>
      </div>
    </Card>
  )
}

function MiniStat({ label, value, accent }: { label: string; value: string | number; accent?: string }) {
  return (
    <Card className="bg-white/[0.03] border-white/10 p-4">
      <div className={`text-2xl font-bold ${accent === "emerald" ? "text-emerald-400" : "text-white"}`}>{value}</div>
      <p className="text-white/55 text-xs">{label}</p>
    </Card>
  )
}
