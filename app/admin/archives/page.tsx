"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { ArrowLeft, RotateCcw, Trash2, Archive } from "lucide-react"

interface ArchiveItem {
  id: string
  original_table: string
  original_id: string
  payload: Record<string, unknown>
  archived_by: string
  archived_at: string
  reason: string | null
  status: "archived" | "restored" | "purged"
}

export default function AdminArchivesPage() {
  const { user } = useAuth()
  const [items, setItems] = useState<ArchiveItem[]>([])
  const [filter, setFilter] = useState<"archived" | "restored" | "purged" | "all">("archived")
  const [loading, setLoading] = useState(true)
  const [working, setWorking] = useState<string | null>(null)

  const adminEmail = (user as { email?: string } | null)?.email ?? ""

  async function load() {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/archives?status=${filter}`, {
        headers: { "x-admin-email": adminEmail },
        cache: "no-store",
      })
      const json = await res.json()
      setItems(json.items ?? [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (adminEmail) load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, adminEmail])

  async function act(id: string, action: "restore" | "purge") {
    if (action === "purge" && !confirm("Purger definitivement cette archive ? Cette action est irreversible.")) return
    setWorking(id)
    try {
      await fetch("/api/admin/archives", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-admin-email": adminEmail },
        body: JSON.stringify({ id, action }),
      })
      await load()
    } finally {
      setWorking(null)
    }
  }

  return (
    <div className="min-h-screen bg-[#020203] text-white p-6">
      <div className="max-w-6xl mx-auto">
        <Link href="/admin" className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-6">
          <ArrowLeft className="h-4 w-4" /> Retour ADMIN
        </Link>

        <header className="flex items-center gap-3 mb-6">
          <Archive className="h-7 w-7 text-fuchsia-400" />
          <div>
            <h1 className="text-3xl font-bold">Archives VIXUAL</h1>
            <p className="text-white/55 text-sm">Suppressions reversibles. Restaure ou purge sur demande.</p>
          </div>
        </header>

        <div className="flex gap-2 mb-5">
          {(["archived", "restored", "purged", "all"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-md text-xs uppercase tracking-wider font-bold transition ${
                filter === s
                  ? "bg-fuchsia-500/20 border border-fuchsia-400/50 text-fuchsia-200"
                  : "bg-white/5 border border-white/10 text-white/60 hover:bg-white/10"
              }`}
            >
              {s}
            </button>
          ))}
          <button
            onClick={load}
            className="ml-auto px-3 py-1.5 rounded-md bg-white/5 border border-white/10 text-xs text-white/70 hover:bg-white/10"
          >
            Rafraichir
          </button>
        </div>

        {loading ? (
          <p className="text-white/50 text-sm">Chargement...</p>
        ) : items.length === 0 ? (
          <p className="text-white/40 text-sm py-12 text-center">Aucune archive dans cette categorie.</p>
        ) : (
          <div className="rounded-xl border border-white/10 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-white/5 text-white/60 text-xs uppercase tracking-wider">
                <tr>
                  <th className="text-left p-3">Table</th>
                  <th className="text-left p-3">ID</th>
                  <th className="text-left p-3">Par</th>
                  <th className="text-left p-3">Date</th>
                  <th className="text-left p-3">Statut</th>
                  <th className="text-right p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((it) => (
                  <tr key={it.id} className="border-t border-white/5 hover:bg-white/[0.02]">
                    <td className="p-3 font-mono text-xs text-white/80">{it.original_table}</td>
                    <td className="p-3 font-mono text-xs text-white/60 truncate max-w-[140px]">{it.original_id}</td>
                    <td className="p-3 text-white/70 text-xs">{it.archived_by}</td>
                    <td className="p-3 text-white/50 text-xs">{new Date(it.archived_at).toLocaleString("fr-FR")}</td>
                    <td className="p-3">
                      <span className={`text-[10px] uppercase px-2 py-0.5 rounded font-bold ${
                        it.status === "archived" ? "bg-amber-500/20 text-amber-200" :
                        it.status === "restored" ? "bg-emerald-500/20 text-emerald-200" :
                        "bg-rose-500/20 text-rose-200"
                      }`}>{it.status}</span>
                    </td>
                    <td className="p-3 text-right">
                      {it.status === "archived" && (
                        <div className="inline-flex gap-1">
                          <button
                            onClick={() => act(it.id, "restore")}
                            disabled={working === it.id}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 text-xs disabled:opacity-50"
                          >
                            <RotateCcw className="h-3 w-3" /> Restaurer
                          </button>
                          <button
                            onClick={() => act(it.id, "purge")}
                            disabled={working === it.id}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 text-xs disabled:opacity-50"
                          >
                            <Trash2 className="h-3 w-3" /> Purger
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
