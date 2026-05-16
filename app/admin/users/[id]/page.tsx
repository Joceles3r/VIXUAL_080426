"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { Card } from "@/components/ui/card"
import { ArrowLeft, Mail, Calendar, Shield, TrendingUp, AlertTriangle, Film, CreditCard } from "lucide-react"

export default function UserDetailPage() {
  const { user: admin } = useAuth()
  const params = useParams()
  const id = params?.id as string
  const [data, setData] = useState<Record<string, unknown> | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!admin?.email || !id) return
    fetch(`/api/admin/users/${id}`, { headers: { "x-admin-email": admin.email } })
      .then((r) => r.ok ? r.json() : null)
      .then(setData)
      .finally(() => setLoading(false))
  }, [admin?.email, id])

  if (loading) return <div className="min-h-screen bg-slate-950 text-white p-6">{"Chargement..."}</div>
  if (!data || !(data as any).user) return <div className="min-h-screen bg-slate-950 text-white p-6">Utilisateur introuvable.</div>

  const u = (data as any).user
  const stats = (data as any).stats ?? {}

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <Link href="/admin/users" className="text-white/60 hover:text-white text-sm mb-4 inline-flex items-center">
          <ArrowLeft className="h-4 w-4 mr-1" /> Retour a la recherche
        </Link>

        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-fuchsia-500 to-violet-600 flex items-center justify-center text-2xl font-bold">
            {u.display_name?.[0]?.toUpperCase() ?? "?"}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{u.display_name ?? "—"}</h1>
            <p className="text-white/55">{u.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Card className="bg-white/[0.03] border-white/10 p-5">
            <h3 className="text-xs uppercase tracking-widest text-white/40 mb-3">Profil</h3>
            <div className="space-y-2 text-sm">
              <Row icon={Shield} label="Role" value={u.role ?? "—"} />
              <Row icon={TrendingUp} label="Niveau" value={`L${u.level ?? 1}`} />
              <Row icon={Mail} label="Email verifie" value={u.email_verified ? "Oui" : "Non"} />
              <Row icon={Calendar} label="Inscrit le" value={new Date(u.created_at).toLocaleDateString("fr-FR")} />
            </div>
          </Card>

          <Card className="bg-white/[0.03] border-white/10 p-5">
            <h3 className="text-xs uppercase tracking-widest text-white/40 mb-3">Activite</h3>
            <div className="space-y-2 text-sm">
              <Row icon={CreditCard} label="Contributions" value={stats.contributions ?? 0} />
              <Row icon={Film} label="Contenus publies" value={stats.contents ?? 0} />
              <Row icon={AlertTriangle} label="Alertes moderation" value={stats.alerts ?? 0} highlight={stats.alerts > 0} />
            </div>
          </Card>
        </div>

        <Card className="bg-white/[0.02] border-white/5 p-4">
          <p className="text-white/50 text-xs leading-relaxed">
            <strong className="text-white/70">ID :</strong> <code className="font-mono">{u.id}</code>
          </p>
        </Card>
      </div>
    </div>
  )
}

function Row({ icon: Icon, label, value, highlight }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string | number; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="flex items-center gap-2 text-white/55">
        <Icon className="h-4 w-4" />
        {label}
      </span>
      <span className={`font-medium ${highlight ? "text-amber-400" : "text-white"}`}>{String(value)}</span>
    </div>
  )
}
