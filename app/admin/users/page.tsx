"use client"

import { useState, useCallback } from "react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search, CheckCircle2, XCircle } from "lucide-react"

export default function UsersSearchPage() {
  const { user } = useAuth()
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<Record<string, unknown>[]>([])
  const [loading, setLoading] = useState(false)

  const handleSearch = useCallback(async (q: string) => {
    if (!user?.email || q.trim().length < 2) {
      setResults([])
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/users/search?q=${encodeURIComponent(q)}`, {
        headers: { "x-admin-email": user.email },
      })
      const data = await res.json()
      setResults(data.users ?? [])
    } finally {
      setLoading(false)
    }
  }, [user?.email])

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Recherche utilisateurs</h1>
        <p className="text-white/55 text-sm mb-8">{"Recherchez par email, nom d'affichage ou ID"}</p>

        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
          <Input
            type="text"
            placeholder="Email, nom, ou ID utilisateur..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              handleSearch(e.target.value)
            }}
            className="pl-12 h-14 bg-white/[0.03] border-white/10 text-white text-lg"
          />
        </div>

        {loading && (
          <p className="text-center text-white/50 text-sm">Recherche en cours...</p>
        )}

        {!loading && query.length >= 2 && results.length === 0 && (
          <Card className="bg-white/[0.03] border-white/10 p-8 text-center">
            <p className="text-white/55">{"Aucun utilisateur trouve pour"} &quot;{query}&quot;</p>
          </Card>
        )}

        {results.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-widest text-white/40 mb-2">
              {results.length} resultat{results.length > 1 ? "s" : ""}
            </p>
            {results.map((u: any) => (
              <Link key={u.id} href={`/admin/users/${u.id}`}>
                <Card className="bg-white/[0.03] border-white/10 p-4 hover:bg-white/[0.06] transition-colors cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-fuchsia-500 to-violet-600 flex items-center justify-center font-bold">
                      {u.display_name?.[0]?.toUpperCase() ?? "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold truncate">{u.display_name ?? "—"}</h3>
                        {u.email_verified ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                        ) : (
                          <XCircle className="h-4 w-4 text-amber-400 shrink-0" />
                        )}
                      </div>
                      <p className="text-white/55 text-sm truncate">{u.email}</p>
                    </div>
                    <div className="text-right hidden sm:block">
                      <span className="text-xs px-2 py-1 rounded bg-white/10 text-white/70">{u.role}</span>
                      <p className="text-white/40 text-xs mt-1">L{u.level ?? 1}</p>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
