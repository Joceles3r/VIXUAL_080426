"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Bug, RefreshCw, CheckCircle2, XCircle } from "lucide-react"

interface Report {
  id: string
  category: "bug" | "broken_content" | "other"
  message: string
  email: string | null
  path: string | null
  status: "new" | "in_progress" | "resolved" | "dismissed"
  created_at: string
}

export default function AdminSupportReportsPage() {
  const { user } = useAuth()
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState<string>("new")

  const fetchReports = () => {
    if (!user?.email) return
    setLoading(true)
    const url = filter === "all" ? "/api/admin/support-reports" : `/api/admin/support-reports?status=${filter}`
    fetch(url, { headers: { "x-admin-email": user.email } })
      .then((r) => (r.ok ? r.json() : { reports: [] }))
      .then((d) => setReports(d.reports ?? []))
      .finally(() => setLoading(false))
  }

  useEffect(fetchReports, [user?.email, filter])

  const updateStatus = async (id: string, status: Report["status"]) => {
    if (!user?.email) return
    await fetch("/api/admin/support-reports", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "x-admin-email": user.email },
      body: JSON.stringify({ id, status }),
    })
    fetchReports()
  }

  const filters: Array<{ key: string; label: string }> = [
    { key: "new", label: "Nouveaux" },
    { key: "in_progress", label: "En cours" },
    { key: "resolved", label: "Resolus" },
    { key: "all", label: "Tous" },
  ]

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Bug className="h-6 w-6 text-amber-400" />
            <h1 className="text-3xl font-bold">Rapports utilisateurs</h1>
          </div>
          <Button onClick={fetchReports} variant="outline" size="sm" disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Actualiser
          </Button>
        </div>

        <div className="flex gap-2 mb-6">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-3 py-1.5 rounded-full text-sm transition ${
                filter === f.key
                  ? "bg-amber-500 text-black font-bold"
                  : "bg-white/5 text-white/60 hover:bg-white/10"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {reports.length === 0 ? (
          <Card className="bg-white/[0.03] border-white/10 p-8 text-center text-white/55">
            Aucun rapport pour ce filtre.
          </Card>
        ) : (
          <div className="space-y-3">
            {reports.map((r) => (
              <Card key={r.id} className="bg-white/[0.03] border-white/10 p-5">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded font-bold ${
                      r.category === "bug" ? "bg-rose-500/20 text-rose-300" :
                      r.category === "broken_content" ? "bg-amber-500/20 text-amber-300" :
                      "bg-white/10 text-white/60"
                    }`}>
                      {r.category === "bug" ? "Bug" : r.category === "broken_content" ? "Contenu casse" : "Autre"}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded ${
                      r.status === "new" ? "bg-blue-500/20 text-blue-300" :
                      r.status === "in_progress" ? "bg-amber-500/20 text-amber-300" :
                      r.status === "resolved" ? "bg-emerald-500/20 text-emerald-300" :
                      "bg-white/10 text-white/40"
                    }`}>
                      {r.status}
                    </span>
                    {r.path && <span className="text-xs text-white/40 font-mono">{r.path}</span>}
                  </div>
                  <span className="text-xs text-white/40">
                    {new Date(r.created_at).toLocaleString("fr-FR")}
                  </span>
                </div>
                <p className="text-white/85 text-sm leading-relaxed mb-3 whitespace-pre-wrap">{r.message}</p>
                {r.email && <p className="text-xs text-white/45 mb-3">Contact : {r.email}</p>}
                {r.status !== "resolved" && r.status !== "dismissed" && (
                  <div className="flex gap-2">
                    {r.status !== "in_progress" && (
                      <Button size="sm" variant="outline" onClick={() => updateStatus(r.id, "in_progress")}>
                        Prendre en charge
                      </Button>
                    )}
                    <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={() => updateStatus(r.id, "resolved")}>
                      <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Resolu
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => updateStatus(r.id, "dismissed")}>
                      <XCircle className="h-3.5 w-3.5 mr-1" /> Rejeter
                    </Button>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
