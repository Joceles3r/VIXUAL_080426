"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Database, RefreshCw, Info } from "lucide-react"

export default function BackupsPage() {
  const { user } = useAuth()
  const [summary, setSummary] = useState<Record<string, unknown> | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchData = () => {
    if (!user?.email) return
    setLoading(true)
    fetch("/api/admin/backups/status", { headers: { "x-admin-email": user.email } })
      .then((r) => r.ok ? r.json() : null)
      .then((d) => setSummary(d))
      .finally(() => setLoading(false))
  }

  useEffect(fetchData, [user?.email])

  const tables = (summary as any)?.summary?.tables as Record<string, number> | undefined
  const totalRows = (summary as any)?.summary?.totalRows ?? 0
  const neonNote = (summary as any)?.neonBackupNote

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-1">{"Sauvegardes & donnees"}</h1>
            <p className="text-white/55 text-sm">{"Etat des tables et strategie de sauvegarde"}</p>
          </div>
          <Button onClick={fetchData} variant="outline" size="sm" disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} /> Actualiser
          </Button>
        </div>

        <Card className="bg-blue-500/10 border-blue-500/30 p-5 mb-6">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-400 mt-0.5" />
            <div>
              <h3 className="font-semibold text-white mb-1">Sauvegardes automatiques Neon</h3>
              <p className="text-white/70 text-sm leading-relaxed">
                {neonNote ?? "Neon PostgreSQL assure des sauvegardes Point-in-Time Recovery (PITR) sur 7 jours en standard."}
                {" "}{"Pour recuperer un etat anterieur, utilisez l'interface Neon → Branches → Create from timestamp."}
              </p>
              <a href="https://console.neon.tech" target="_blank" rel="noopener noreferrer" className="text-blue-300 text-sm hover:underline mt-2 inline-block">
                {"Console Neon →"}
              </a>
            </div>
          </div>
        </Card>

        <h2 className="text-xs uppercase tracking-widest text-white/40 mb-3">Etat des tables principales</h2>
        {tables && (
          <Card className="bg-white/[0.03] border-white/10 p-5">
            <div className="space-y-2">
              {Object.entries(tables).map(([table, count]) => (
                <div key={table} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                  <div className="flex items-center gap-3">
                    <Database className="h-4 w-4 text-white/40" />
                    <span className="font-mono text-sm">{table}</span>
                  </div>
                  <span className={`font-mono text-sm font-bold ${Number(count) === -1 ? "text-red-400" : "text-emerald-400"}`}>
                    {Number(count) === -1 ? "ERR" : `${count} lignes`}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-white/10">
              <p className="text-white/55 text-sm">
                Total : <span className="text-white font-bold">{totalRows} lignes</span> dans la plateforme
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
