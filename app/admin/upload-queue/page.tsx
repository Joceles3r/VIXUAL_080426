"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { ArrowLeft, UploadCloud, AlertCircle, CheckCircle2, Loader2, Clock } from "lucide-react"

interface UploadJob {
  id: string
  user_id: string
  file_name: string
  file_size: number
  file_type: string
  provider: string
  status: "pending" | "uploading" | "completed" | "error" | "cancelled"
  progress: number
  retry_count: number
  error_message: string | null
  created_at: string
}

interface QueueData {
  items: UploadJob[]
  stats: Record<string, number>
}

const statusConfig: Record<string, { color: string; label: string; Icon: typeof Clock }> = {
  pending:    { color: "bg-amber-500/20 text-amber-200",     label: "En attente", Icon: Clock },
  uploading:  { color: "bg-blue-500/20 text-blue-200",       label: "En cours",   Icon: Loader2 },
  completed:  { color: "bg-emerald-500/20 text-emerald-200", label: "Termine",    Icon: CheckCircle2 },
  error:      { color: "bg-rose-500/20 text-rose-200",       label: "Erreur",     Icon: AlertCircle },
  cancelled:  { color: "bg-white/10 text-white/50",          label: "Annule",     Icon: AlertCircle },
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} o`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`
}

export default function AdminUploadQueuePage() {
  const { user } = useAuth()
  const [data, setData] = useState<QueueData | null>(null)
  const [loading, setLoading] = useState(true)
  const adminEmail = (user as { email?: string } | null)?.email ?? ""

  async function load() {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/upload-queue", {
        headers: { "x-admin-email": adminEmail },
        cache: "no-store",
      })
      setData(await res.json())
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!adminEmail) return
    load()
    const id = setInterval(load, 5000) // refresh 5s
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adminEmail])

  return (
    <div className="min-h-screen bg-[#020203] text-white p-6">
      <div className="max-w-6xl mx-auto">
        <Link href="/admin" className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-6">
          <ArrowLeft className="h-4 w-4" /> Retour ADMIN
        </Link>

        <header className="flex items-center gap-3 mb-6">
          <UploadCloud className="h-7 w-7 text-blue-400" />
          <div>
            <h1 className="text-3xl font-bold">File d&apos;attente Uploads</h1>
            <p className="text-white/55 text-sm">Suivi temps reel des uploads (local / Bunny / Blob).</p>
          </div>
        </header>

        {/* Stats */}
        {data?.stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
            {Object.entries(statusConfig).map(([key, cfg]) => (
              <div key={key} className="rounded-lg border border-white/10 bg-white/[0.02] p-3">
                <p className="text-[10px] uppercase tracking-wider text-white/50">{cfg.label}</p>
                <p className="text-2xl font-bold mt-1">{data.stats[key] ?? 0}</p>
              </div>
            ))}
          </div>
        )}

        {loading && !data ? (
          <p className="text-white/50 text-sm">Chargement...</p>
        ) : !data?.items?.length ? (
          <p className="text-white/40 text-sm py-12 text-center">Aucun upload dans les 7 derniers jours.</p>
        ) : (
          <div className="rounded-xl border border-white/10 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-white/5 text-white/60 text-xs uppercase tracking-wider">
                <tr>
                  <th className="text-left p-3">Fichier</th>
                  <th className="text-left p-3">Taille</th>
                  <th className="text-left p-3">Provider</th>
                  <th className="text-left p-3">Progression</th>
                  <th className="text-left p-3">Statut</th>
                  <th className="text-left p-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((it) => {
                  const cfg = statusConfig[it.status] ?? statusConfig.pending
                  const Icon = cfg.Icon
                  return (
                    <tr key={it.id} className="border-t border-white/5 hover:bg-white/[0.02]">
                      <td className="p-3">
                        <p className="text-white/90 truncate max-w-[260px]" title={it.file_name}>{it.file_name}</p>
                        <p className="text-[10px] text-white/40 font-mono">{it.file_type}</p>
                      </td>
                      <td className="p-3 text-white/70 text-xs">{formatSize(Number(it.file_size))}</td>
                      <td className="p-3">
                        <span className="text-[10px] uppercase px-2 py-0.5 rounded bg-white/5 text-white/70 font-mono">
                          {it.provider}
                        </span>
                      </td>
                      <td className="p-3 w-40">
                        <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-fuchsia-500 to-blue-500 transition-all"
                            style={{ width: `${it.progress}%` }}
                          />
                        </div>
                        <p className="text-[10px] text-white/40 mt-1">{it.progress}%</p>
                      </td>
                      <td className="p-3">
                        <span className={`inline-flex items-center gap-1 text-[10px] uppercase px-2 py-0.5 rounded font-bold ${cfg.color}`}>
                          <Icon className={`h-3 w-3 ${it.status === "uploading" ? "animate-spin" : ""}`} />
                          {cfg.label}
                          {it.retry_count > 0 && <span className="ml-1 opacity-60">(x{it.retry_count})</span>}
                        </span>
                        {it.error_message && (
                          <p className="text-[10px] text-rose-300/80 mt-1 truncate max-w-[200px]" title={it.error_message}>
                            {it.error_message}
                          </p>
                        )}
                      </td>
                      <td className="p-3 text-white/50 text-xs">
                        {new Date(it.created_at).toLocaleString("fr-FR", {
                          day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit",
                        })}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
