"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  AlertTriangle, Users, Film, CreditCard, Tv, Database, Mail,
  CheckCircle2, XCircle, RefreshCw,
} from "lucide-react"

interface BriefingData {
  date: string
  alerts: { critical: number; warning: number; info: number }
  activity: { newUsers: number; newContents: number; contributions: number; revenueEur: number }
  pending: { channelRequests: number; promotions: number; reports: number }
  health: { db: boolean; stripe: boolean; bunny: boolean; resend: boolean }
  errors: { count24h: number }
}

export default function DailyBriefingPage() {
  const { user } = useAuth()
  const [data, setData] = useState<BriefingData | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchData = () => {
    if (!user?.email) return
    setLoading(true)
    fetch("/api/admin/briefing/data", { headers: { "x-admin-email": user.email } })
      .then((r) => r.ok ? r.json() : null)
      .then((d) => setData(d?.data ?? null))
      .finally(() => setLoading(false))
  }

  useEffect(fetchData, [user?.email])

  if (loading || !data) {
    return (
      <div className="min-h-screen bg-slate-950 text-white p-6 flex items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin text-fuchsia-400" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-1">Briefing du jour</h1>
            <p className="text-white/55 text-sm">
              {new Date(data.date).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>
          <Button onClick={fetchData} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" /> Actualiser
          </Button>
        </div>

        {/* ALERTES */}
        <h2 className="text-xs uppercase tracking-widest text-white/40 mb-3">{"A traiter aujourd'hui"}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-red-500/10 border-red-500/30 p-5">
            <div className="flex items-center justify-between mb-2">
              <AlertTriangle className="h-5 w-5 text-red-400" />
              <span className="text-3xl font-bold text-red-400">{data.alerts.critical}</span>
            </div>
            <p className="text-white/70 text-sm">Alertes critiques</p>
            {data.alerts.critical > 0 && (
              <Link href="/admin/moderation" className="text-red-300 text-xs hover:underline mt-2 inline-block">
                {"Traiter maintenant →"}
              </Link>
            )}
          </Card>
          <Card className="bg-amber-500/10 border-amber-500/30 p-5">
            <div className="flex items-center justify-between mb-2">
              <AlertTriangle className="h-5 w-5 text-amber-400" />
              <span className="text-3xl font-bold text-amber-400">{data.alerts.warning}</span>
            </div>
            <p className="text-white/70 text-sm">Alertes importantes</p>
          </Card>
          <Card className="bg-slate-500/10 border-slate-500/30 p-5">
            <div className="flex items-center justify-between mb-2">
              <AlertTriangle className="h-5 w-5 text-slate-400" />
              <span className="text-3xl font-bold text-white/70">{data.alerts.info}</span>
            </div>
            <p className="text-white/70 text-sm">Alertes standards</p>
          </Card>
        </div>

        {/* ACTIVITE */}
        <h2 className="text-xs uppercase tracking-widest text-white/40 mb-3">Activite 24 heures</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-white/[0.03] border-white/10 p-4">
            <Users className="h-5 w-5 text-fuchsia-400 mb-2" />
            <div className="text-2xl font-bold">{data.activity.newUsers}</div>
            <p className="text-white/55 text-xs">Nouveaux inscrits</p>
          </Card>
          <Card className="bg-white/[0.03] border-white/10 p-4">
            <Film className="h-5 w-5 text-blue-400 mb-2" />
            <div className="text-2xl font-bold">{data.activity.newContents}</div>
            <p className="text-white/55 text-xs">Nouveaux contenus</p>
          </Card>
          <Card className="bg-white/[0.03] border-white/10 p-4">
            <CreditCard className="h-5 w-5 text-emerald-400 mb-2" />
            <div className="text-2xl font-bold">{data.activity.contributions}</div>
            <p className="text-white/55 text-xs">Contributions</p>
          </Card>
          <Card className="bg-white/[0.03] border-white/10 p-4">
            <CreditCard className="h-5 w-5 text-emerald-400 mb-2" />
            <div className="text-2xl font-bold">{data.activity.revenueEur}EUR</div>
            <p className="text-white/55 text-xs">Revenus 24h</p>
          </Card>
        </div>

        {/* EN ATTENTE */}
        {data.pending.channelRequests > 0 && (
          <>
            <h2 className="text-xs uppercase tracking-widest text-white/40 mb-3">En attente de validation</h2>
            <div className="mb-8">
              <Link href="/admin/creator-channels">
                <Card className="bg-violet-500/10 border-violet-500/30 p-5 hover:bg-violet-500/15 transition-colors cursor-pointer">
                  <div className="flex items-center gap-4">
                    <Tv className="h-8 w-8 text-violet-400" />
                    <div className="flex-1">
                      <div className="text-xl font-bold">{data.pending.channelRequests} demande{data.pending.channelRequests > 1 ? "s" : ""} de chaine</div>
                      <p className="text-white/55 text-sm">{"Cliquez pour moderer →"}</p>
                    </div>
                  </div>
                </Card>
              </Link>
            </div>
          </>
        )}

        {/* SANTE */}
        <h2 className="text-xs uppercase tracking-widest text-white/40 mb-3">Sante technique</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <HealthCard icon={Database} label="Base de donnees" ok={data.health.db} />
          <HealthCard icon={CreditCard} label="Stripe" ok={data.health.stripe} pendingLabel="Non configure" />
          <HealthCard icon={Film} label="Bunny.net" ok={data.health.bunny} pendingLabel="Non configure" />
          <HealthCard icon={Mail} label="Emails Resend" ok={data.health.resend} />
        </div>

        <div className="text-center mt-8">
          <Link href="/admin/health" className="text-fuchsia-400 hover:text-fuchsia-300 text-sm">
            {"→ Voir le diagnostic sante complet"}
          </Link>
        </div>
      </div>
    </div>
  )
}

function HealthCard({ icon: Icon, label, ok, pendingLabel }: { icon: React.ComponentType<{ className?: string }>; label: string; ok: boolean; pendingLabel?: string }) {
  return (
    <Card className={`p-4 border ${ok ? "bg-emerald-500/5 border-emerald-500/20" : "bg-amber-500/5 border-amber-500/20"}`}>
      <div className="flex items-center justify-between mb-2">
        <Icon className={`h-5 w-5 ${ok ? "text-emerald-400" : "text-amber-400"}`} />
        {ok ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : <XCircle className="h-4 w-4 text-amber-400" />}
      </div>
      <p className="text-white/85 text-sm font-medium">{label}</p>
      <p className={`text-xs mt-1 ${ok ? "text-emerald-400" : "text-amber-400"}`}>{ok ? "Operationnel" : (pendingLabel ?? "Inactif")}</p>
    </Card>
  )
}
