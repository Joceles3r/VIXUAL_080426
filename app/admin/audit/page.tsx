"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, RefreshCw, Shield, AlertCircle, CheckCircle2 } from "lucide-react"

interface AuditEntry {
  id: string
  event_type: string
  severity: "info" | "warn" | "critical"
  user_id: string | null
  ip_address: string | null
  action: string
  resource: string | null
  outcome: string
  context: Record<string, unknown> | null
  created_at: string
}

const SEVERITY_COLORS = {
  info: "text-blue-400 bg-blue-500/10 border-blue-500/30",
  warn: "text-amber-400 bg-amber-500/10 border-amber-500/30",
  critical: "text-red-400 bg-red-500/10 border-red-500/30",
}

export default function AuditPage() {
  const { user } = useAuth()
  const [entries, setEntries] = useState<AuditEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "info" | "warn" | "critical">("all")

  useEffect(() => {
    if (!user?.email) return
    setLoading(true)
    fetch(`/api/admin/audit?severity=${filter}`, {
      headers: { "x-admin-email": user.email },
    })
      .then((r) => (r.ok ? r.json() : { entries: [] }))
      .then((d) => setEntries(d.entries ?? []))
      .finally(() => setLoading(false))
  }, [user?.email, filter])

  const refresh = () => {
    if (!user?.email) return
    setLoading(true)
    fetch(`/api/admin/audit?severity=${filter}`, {
      headers: { "x-admin-email": user.email },
    })
      .then((r) => (r.ok ? r.json() : { entries: [] }))
      .then((d) => setEntries(d.entries ?? []))
      .finally(() => setLoading(false))
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-6xl mx-auto">
        <Link href="/admin" className="text-white/60 hover:text-white text-sm mb-4 inline-flex items-center">
          <ArrowLeft className="h-4 w-4 mr-1" /> Retour admin
        </Link>

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Shield className="h-6 w-6 text-fuchsia-400" />
            <div>
              <h1 className="text-3xl font-bold">{"Journal d'audit securite"}</h1>
              <p className="text-white/55 text-sm">Toutes les actions sensibles tracees par le moteur de securite</p>
            </div>
          </div>
          <Button onClick={refresh} variant="outline" size="sm" disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} /> Actualiser
          </Button>
        </div>

        <div className="flex gap-2 mb-6">
          {(["all", "critical", "warn", "info"] as const).map((s) => (
            <Button
              key={s}
              variant={filter === s ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(s)}
              className={filter === s ? "bg-fuchsia-500 hover:bg-fuchsia-600" : ""}
            >
              {s === "all" ? "Tous" : s === "critical" ? "Critiques" : s === "warn" ? "Avertissements" : "Info"}
            </Button>
          ))}
        </div>

        {entries.length === 0 && !loading ? (
          <Card className="bg-white/[0.03] border-white/10 p-12 text-center">
            <CheckCircle2 className="h-10 w-10 text-emerald-400 mx-auto mb-3" />
            <p className="text-white/60">Aucun evenement enregistre pour ce filtre.</p>
            <p className="text-white/40 text-xs mt-1">{"C'est plutot une bonne nouvelle."}</p>
          </Card>
        ) : (
          <div className="space-y-2">
            {entries.map((e) => (
              <Card key={e.id} className={`border p-4 ${SEVERITY_COLORS[e.severity]}`}>
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    <span className="font-mono text-sm font-bold">{e.event_type}</span>
                    <span className="text-xs uppercase tracking-wider opacity-70">{e.severity}</span>
                  </div>
                  <span className="text-xs text-white/50">
                    {new Date(e.created_at).toLocaleString("fr-FR")}
                  </span>
                </div>
                <p className="text-sm">{e.action} {"\u2014"} {e.outcome}</p>
                {e.ip_address && (
                  <p className="text-xs text-white/50 mt-1 font-mono">IP: {e.ip_address}</p>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
