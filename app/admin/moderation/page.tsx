"use client"

import { useEffect, useState, useCallback } from "react"
import { useAuth } from "@/lib/auth-context"
import { CheckCircle, XCircle, ArrowUpCircle, Loader2, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Alert {
  id: string
  type: string
  severity: "critical" | "important" | "standard" | "info"
  title: string
  description: string
  suggestedAction: string | null
  context: Record<string, unknown> | null
  createdAt: string
  userId: string | null
}

const SEVERITY_STYLE: Record<
  Alert["severity"],
  { bg: string; border: string; text: string; label: string }
> = {
  critical: { bg: "bg-red-500/10", border: "border-red-500/40", text: "text-red-300", label: "Critique" },
  important: {
    bg: "bg-amber-500/10",
    border: "border-amber-500/40",
    text: "text-amber-300",
    label: "Important",
  },
  standard: { bg: "bg-sky-500/10", border: "border-sky-500/40", text: "text-sky-300", label: "Standard" },
  info: { bg: "bg-slate-500/10", border: "border-slate-500/40", text: "text-slate-300", label: "Info" },
}

const FILTER_LABELS: Record<string, string> = {
  all: "Toutes",
  critical: "Critique",
  important: "Important",
  standard: "Standard",
  info: "Info",
}

export default function ModerationPage() {
  const { user } = useAuth()
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>("all")
  const [resolving, setResolving] = useState<string | null>(null)

  const reload = useCallback(async () => {
    if (!user?.email) return
    setLoading(true)
    try {
      const res = await fetch("/api/admin/moderation/alerts?status=pending", {
        headers: { "x-admin-email": user.email },
      })
      const data = await res.json()
      setAlerts(Array.isArray(data.alerts) ? data.alerts : [])
    } catch (e) {
      console.error("[moderation page] reload failed", e)
      setAlerts([])
    } finally {
      setLoading(false)
    }
  }, [user?.email])

  useEffect(() => {
    if (user?.email) reload()
  }, [user?.email, reload])

  const resolve = async (id: string, status: "approved" | "rejected" | "escalated") => {
    if (!user?.email) return
    setResolving(id)
    try {
      await fetch(`/api/admin/moderation/alerts/${id}/resolve`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-email": user.email },
        body: JSON.stringify({ status, note: null }),
      })
    } finally {
      setResolving(null)
      reload()
    }
  }

  const filtered = filter === "all" ? alerts : alerts.filter((a) => a.severity === filter)

  return (
    <div className="container mx-auto px-4 py-10 max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Modération &amp; Alertes</h1>
          <p className="text-white/55 text-sm">
            {alerts.length} alerte(s) en attente — triées par priorité
          </p>
        </div>
        <Button onClick={reload} variant="outline" size="sm" className="border-white/15">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Rafraîchir"}
        </Button>
      </div>

      {/* Filtres */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        <Filter className="h-4 w-4 text-white/40" />
        {(["all", "critical", "important", "standard", "info"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              filter === f
                ? "bg-fuchsia-500/20 text-fuchsia-200 border border-fuchsia-500/40"
                : "bg-white/5 text-white/60 hover:bg-white/10 border border-transparent"
            }`}
          >
            {FILTER_LABELS[f]}
          </button>
        ))}
      </div>

      {/* Liste alertes */}
      <div className="flex flex-col gap-3">
        {loading && <p className="text-white/40 text-sm text-center py-8">Chargement…</p>}
        {!loading && filtered.length === 0 && (
          <p className="text-white/40 text-sm text-center py-12">Aucune alerte en attente.</p>
        )}
        {filtered.map((alert) => {
          const style = SEVERITY_STYLE[alert.severity]
          return (
            <div key={alert.id} className={`rounded-xl p-5 ${style.bg} border ${style.border}`}>
              <div className="flex items-start justify-between gap-4 mb-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-xs font-semibold ${style.text}`}>{style.label}</span>
                    <span className="text-white/30 text-xs">
                      {new Date(alert.createdAt).toLocaleString("fr-FR")}
                    </span>
                  </div>
                  <h3 className="text-white font-semibold text-base mb-1 text-pretty">{alert.title}</h3>
                  <p className="text-white/65 text-sm leading-relaxed">{alert.description}</p>
                  {alert.suggestedAction && (
                    <p className="text-white/45 text-xs mt-2 italic">
                      <strong>Action suggérée :</strong> {alert.suggestedAction}
                    </p>
                  )}
                  {alert.context && (
                    <details className="mt-2">
                      <summary className="text-white/40 text-xs cursor-pointer hover:text-white/60">
                        Voir le contexte
                      </summary>
                      <pre className="text-white/50 text-[10px] bg-slate-950/50 p-2 rounded mt-1 overflow-x-auto">
                        {JSON.stringify(alert.context, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 mt-4 pt-3 border-t border-white/10 flex-wrap">
                <Button
                  onClick={() => resolve(alert.id, "approved")}
                  disabled={resolving === alert.id}
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-500"
                >
                  <CheckCircle className="h-4 w-4 mr-1" /> Approuver
                </Button>
                <Button
                  onClick={() => resolve(alert.id, "rejected")}
                  disabled={resolving === alert.id}
                  size="sm"
                  variant="outline"
                  className="border-red-500/30 text-red-300 hover:bg-red-500/10"
                >
                  <XCircle className="h-4 w-4 mr-1" /> Rejeter
                </Button>
                <Button
                  onClick={() => resolve(alert.id, "escalated")}
                  disabled={resolving === alert.id}
                  size="sm"
                  variant="outline"
                  className="border-white/15"
                >
                  <ArrowUpCircle className="h-4 w-4 mr-1" /> Escalader
                </Button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
