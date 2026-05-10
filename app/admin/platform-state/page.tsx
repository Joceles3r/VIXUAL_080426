"use client"
import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Rocket, Users, Sparkles, Check, X, Video, BookOpen, Mic, Tv } from "lucide-react"
import Link from "next/link"

const VERSIONS = [
  {
    id: "V1",
    title: "V1 — Lancement",
    desc: "4 profils (Invite/Visiteur/Porteur/Contributeur), videos uniquement, Pass Decouverte, boost visibilite visiteur→createur",
    icon: Rocket,
    color: "emerald",
    profiles: ["Invite", "Visiteur", "Porteur", "Contributeur"],
    features: { videos: true, ecrits: false, podcasts: false, passDecouverte: true, boostVisibilite: true, oauth: false, vixualSocial: false, ticketGold: false, trustScoreVisible: false, iaSupport: false },
  },
  {
    id: "V2",
    title: "V2 — Croissance",
    desc: "8 profils, paiement hybride 30%/70%, ecrits + podcasts, OAuth, commentaires, notifications",
    icon: Users,
    color: "amber",
    profiles: ["Invite", "Visiteur", "Porteur", "Contributeur", "Infoporteur", "Podcasteur", "Auditeur", "Contribu-lecteur"],
    features: { videos: true, ecrits: true, podcasts: true, passDecouverte: true, boostVisibilite: true, oauth: true, vixualSocial: false, ticketGold: false, trustScoreVisible: false, iaSupport: false },
  },
  {
    id: "V3",
    title: "V3 — Pleine puissance",
    desc: "Vixual Social complet, Ticket Gold, Trust Score visible, IA support, soutien libre, archives",
    icon: Sparkles,
    color: "violet",
    profiles: ["Invite", "Visiteur", "Porteur", "Contributeur", "Infoporteur", "Podcasteur", "Auditeur", "Contribu-lecteur"],
    features: { videos: true, ecrits: true, podcasts: true, passDecouverte: true, boostVisibilite: true, oauth: true, vixualSocial: true, ticketGold: true, trustScoreVisible: true, iaSupport: true },
  },
] as const

function FeatureItem({ label, enabled, icon }: { label: string; enabled: boolean; icon?: React.ReactNode }) {
  return (
    <div className={`flex items-center gap-1.5 px-2 py-1 rounded ${enabled ? "bg-emerald-500/10 text-emerald-300" : "bg-slate-800/50 text-white/30"}`}>
      {enabled ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
      {icon}
      <span>{label}</span>
    </div>
  )
}

export default function PlatformStatePage() {
  const { user } = useAuth()
  const [current, setCurrent] = useState<string>("V3")
  const [pendingChange, setPendingChange] = useState<string | null>(null)
  const [reason, setReason] = useState("")
  const [loading, setLoading] = useState(false)

  // Etat du module Chaines createurs (V3 only, OFF par defaut)
  const [channelsEnabled, setChannelsEnabled] = useState<boolean>(false)
  const [channelsLoading, setChannelsLoading] = useState<boolean>(false)

  useEffect(() => {
    fetch("/api/platform/version").then(r => r.json()).then(d => setCurrent(d.version)).catch(() => {})
    fetch("/api/admin/channels/state", { headers: { "x-admin-email": user?.email ?? "" } })
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.state && typeof d.state.isEnabled === "boolean") setChannelsEnabled(d.state.isEnabled) })
      .catch(() => {})
  }, [user?.email])

  const toggleChannels = async () => {
    setChannelsLoading(true)
    try {
      const res = await fetch("/api/admin/channels/state", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-email": user?.email ?? "" },
        body: JSON.stringify({ enabled: !channelsEnabled }),
      })
      if (res.ok) {
        const d = await res.json()
        if (d?.state && typeof d.state.isEnabled === "boolean") setChannelsEnabled(d.state.isEnabled)
      }
    } finally { setChannelsLoading(false) }
  }

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

      <div className="space-y-4">
        {VERSIONS.map(v => {
          const Icon = v.icon
          const isCurrent = current === v.id
          const colors = colorClasses[v.color]
          return (
            <Card key={v.id} className={`bg-slate-900/60 border-2 transition-all ${isCurrent ? `${colors.border} shadow-lg` : "border-white/10 hover:border-white/20"}`}>
              <CardContent className="p-5">
                <div className="flex items-start gap-4 mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    v.color === "emerald" ? "bg-emerald-500/20" :
                    v.color === "amber" ? "bg-amber-500/20" : "bg-violet-500/20"
                  }`}>
                    <Icon className={`h-6 w-6 ${colors.icon}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-white text-lg">{v.title}</span>
                      {isCurrent && <Badge className={`${colors.badge} text-[10px] uppercase tracking-wider`}>Actuelle</Badge>}
                    </div>
                    <p className="text-white/55 text-sm">{v.desc}</p>
                  </div>
                  {!isCurrent && (
                    <Button 
                      onClick={() => setPendingChange(v.id)} 
                      className={`${
                        v.color === "emerald" ? "bg-emerald-600 hover:bg-emerald-500" :
                        v.color === "amber" ? "bg-amber-600 hover:bg-amber-500" : "bg-violet-600 hover:bg-violet-500"
                      } text-white`}
                    >
                      Basculer vers {v.id}
                    </Button>
                  )}
                </div>

                {/* Profils disponibles */}
                <div className="mb-3">
                  <span className="text-xs text-white/40 uppercase tracking-wider">Profils ({v.profiles.length})</span>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {v.profiles.map(p => (
                      <Badge key={p} variant="outline" className="text-xs border-white/20 text-white/70">{p}</Badge>
                    ))}
                  </div>
                </div>

                {/* Features */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  <FeatureItem label="Videos" enabled={v.features.videos} icon={<Video className="h-3 w-3" />} />
                  <FeatureItem label="Ecrits" enabled={v.features.ecrits} icon={<BookOpen className="h-3 w-3" />} />
                  <FeatureItem label="Podcasts" enabled={v.features.podcasts} icon={<Mic className="h-3 w-3" />} />
                  <FeatureItem label="Pass Decouverte" enabled={v.features.passDecouverte} />
                  <FeatureItem label="Boost Visibilite" enabled={v.features.boostVisibilite} />
                  <FeatureItem label="OAuth" enabled={v.features.oauth} />
                  <FeatureItem label="Vixual Social" enabled={v.features.vixualSocial} />
                  <FeatureItem label="Ticket Gold" enabled={v.features.ticketGold} />
                  <FeatureItem label="Trust Score" enabled={v.features.trustScoreVisible} />
                  <FeatureItem label="IA Support" enabled={v.features.iaSupport} />
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Modules V3 — Chaines createurs */}
      <Card className="bg-slate-900/60 border-2 border-violet-500/20 mt-6">
        <CardContent className="p-5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-violet-500/20 shrink-0">
              <Tv className="h-6 w-6 text-violet-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="font-bold text-white text-lg">Chaines createurs</span>
                <Badge className="bg-violet-500/20 text-violet-300 text-[10px] uppercase tracking-wider">V3 only</Badge>
                {channelsEnabled ? (
                  <Badge className="bg-emerald-500/20 text-emerald-300 text-[10px] uppercase tracking-wider">Actif</Badge>
                ) : (
                  <Badge variant="outline" className="border-white/20 text-white/50 text-[10px] uppercase tracking-wider">Desactive</Badge>
                )}
              </div>
              <p className="text-white/55 text-sm mb-3">
                Univers creatifs merites pour createurs Trust Score &gt;= 85. Module independant des versions de la plateforme,
                desactive par defaut. Validation patron requise pour chaque demande.
              </p>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  onClick={toggleChannels}
                  disabled={channelsLoading}
                  className={channelsEnabled
                    ? "bg-red-600/80 hover:bg-red-500 text-white"
                    : "bg-violet-600 hover:bg-violet-500 text-white"}
                >
                  {channelsLoading ? "..." : channelsEnabled ? "Desactiver" : "Activer"}
                </Button>
                <Button asChild size="sm" variant="outline" className="border-white/20 text-white/70 hover:text-white">
                  <Link href="/admin/creator-channels">Moderer les demandes</Link>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

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
