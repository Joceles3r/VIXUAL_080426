"use client"
import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, Rocket, Users, Sparkles } from "lucide-react"

const VERSIONS = [
  { id: "V1", title: "V1 — Lancement", desc: "4 profils (Invite/Visiteur/Porteur/Contributeur), videos uniquement, Pass Decouverte, boost visibilite visiteur→createur", icon: Rocket, color: "emerald" },
  { id: "V2", title: "V2 — Croissance", desc: "8 profils, paiement hybride 30%/70%, ecrits + podcasts, OAuth, commentaires, notifications", icon: Users, color: "amber" },
  { id: "V3", title: "V3 — Pleine puissance", desc: "Vixual Social complet, Ticket Gold, Trust Score visible, IA support, soutien libre, archives", icon: Sparkles, color: "violet" },
] as const

export default function PlatformStatePage() {
  const { user } = useAuth()
  const [current, setCurrent] = useState<string>("V1")
  const [pendingChange, setPendingChange] = useState<string | null>(null)
  const [reason, setReason] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch("/api/platform/version").then(r => r.json()).then(d => setCurrent(d.version)).catch(() => {})
  }, [])

  const apply = async () => {
    if (!pendingChange || !reason.trim()) return
    setLoading(true)
    try {
      const res = await fetch("/api/platform/version", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-email": user?.email ?? "" },
        body: JSON.stringify({ version: pendingChange, reason }),
      })
      if (res.ok) { setCurrent(pendingChange); setPendingChange(null); setReason(""); }
    } finally { setLoading(false) }
  }

  const colorClasses: Record<string, { border: string; badge: string; icon: string }> = {
    emerald: { border: "border-emerald-500/50", badge: "bg-emerald-500/20 text-emerald-300", icon: "text-emerald-400" },
    amber: { border: "border-amber-500/50", badge: "bg-amber-500/20 text-amber-300", icon: "text-amber-400" },
    violet: { border: "border-violet-500/50", badge: "bg-violet-500/20 text-violet-300", icon: "text-violet-400" },
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-3xl">
      <h1 className="text-2xl font-bold text-white mb-2">Etat de la plateforme</h1>
      <p className="text-white/55 text-sm mb-8">Bascule entre versions de VIXUAL. Affecte tous les utilisateurs immediatement (cache 30s).</p>

      <div className="space-y-3">
        {VERSIONS.map(v => {
          const Icon = v.icon
          const isCurrent = current === v.id
          const colors = colorClasses[v.color]
          return (
            <Card key={v.id} className={`bg-slate-900/60 border ${isCurrent ? colors.border : "border-white/10"}`}>
              <CardContent className="p-5 flex items-start gap-4">
                <Icon className={`h-6 w-6 ${colors.icon} shrink-0 mt-0.5`} />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-white">{v.title}</span>
                    {isCurrent && <span className={`text-[10px] px-2 py-0.5 rounded-full ${colors.badge} uppercase tracking-wider`}>Actuelle</span>}
                  </div>
                  <p className="text-white/55 text-sm">{v.desc}</p>
                </div>
                {!isCurrent && <Button variant="outline" size="sm" onClick={() => setPendingChange(v.id)}>Basculer</Button>}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {pendingChange && (
        <Card className="bg-red-500/10 border-red-500/30 mt-6">
          <CardHeader><CardTitle className="text-red-300 flex items-center gap-2 text-base"><AlertTriangle className="h-5 w-5" />Confirmer la bascule {current} → {pendingChange}</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <textarea
              className="w-full bg-slate-900 border border-white/10 rounded p-3 text-sm text-white"
              placeholder="Raison de la bascule (obligatoire pour audit)..."
              value={reason} onChange={e => setReason(e.target.value)} rows={3}
            />
            <div className="flex gap-2">
              <Button onClick={apply} disabled={!reason.trim() || loading} className="bg-red-600 hover:bg-red-500">{loading ? "Application..." : "Confirmer"}</Button>
              <Button variant="ghost" onClick={() => { setPendingChange(null); setReason(""); }}>Annuler</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
