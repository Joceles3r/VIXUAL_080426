"use client"

/**
 * Admin PATRON : moderation des demandes de chaines + toggle module ON/OFF.
 */

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import {
  Tv,
  Loader2,
  Check,
  X,
  ShieldCheck,
  AlertCircle,
} from "lucide-react"

interface PendingRequest {
  id: string
  creatorId: string
  channelSlug: string | null
  channelName: string
  channelBio: string | null
  trustScoreAtRequest: number
  createdAt: string
  creatorEmail?: string
  creatorDisplayName?: string
}

interface ModuleState {
  isEnabled: boolean
  enabledAt: string | null
  enabledBy: string | null
}

export default function AdminCreatorChannelsPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [requests, setRequests] = useState<PendingRequest[]>([])
  const [moduleState, setModuleState] = useState<ModuleState | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [reviewNotes, setReviewNotes] = useState<Record<string, string>>({})
  const [busyId, setBusyId] = useState<string | null>(null)
  const [togglingModule, setTogglingModule] = useState(false)

  const authHeaders = useCallback((): HeadersInit => {
    if (!user) return { "Content-Type": "application/json" }
    return {
      "Content-Type": "application/json",
      "x-vixual-user-id": user.id,
      "x-vixual-user-email": user.email,
    }
  }, [user])

  const refresh = useCallback(async () => {
    if (!user) return
    setLoading(true)
    setError(null)
    try {
      const [reqRes, stateRes] = await Promise.all([
        fetch("/api/admin/channels/requests", { headers: authHeaders() }),
        fetch("/api/admin/channels/state", { headers: authHeaders() }),
      ])
      if (reqRes.status === 403 || stateRes.status === 403) {
        setError("Acces reserve au PATRON")
        return
      }
      const reqData = await reqRes.json()
      const stateData = await stateRes.json()
      setRequests(reqData.requests ?? [])
      setModuleState(stateData.state ?? null)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur de chargement")
    } finally {
      setLoading(false)
    }
  }, [user, authHeaders])

  useEffect(() => {
    if (user) refresh()
  }, [user, refresh])

  const handleReview = async (id: string, decision: "approved" | "rejected") => {
    setBusyId(id)
    setError(null)
    try {
      const res = await fetch(`/api/admin/channels/requests/${id}/review`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          decision,
          reviewNote: reviewNotes[id] || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Erreur de moderation")
      await refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur inconnue")
    } finally {
      setBusyId(null)
    }
  }

  const toggleModule = async () => {
    if (!moduleState) return
    setTogglingModule(true)
    setError(null)
    try {
      const res = await fetch("/api/admin/channels/state", {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ enabled: !moduleState.isEnabled }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Erreur toggle")
      setModuleState(data.state)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur inconnue")
    } finally {
      setTogglingModule(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-5xl">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <Tv className="h-7 w-7 text-fuchsia-400" />
          Chaines createurs
        </h1>
        <p className="text-white/60 text-sm">
          Module reserve au PATRON. Active/desactive le module et valide les
          demandes des createurs.
        </p>
      </header>

      {error && (
        <Card className="bg-rose-900/20 border-rose-500/30 mb-6">
          <CardContent className="p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-rose-300 shrink-0 mt-0.5" />
            <p className="text-rose-200 text-sm">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Toggle module */}
      <Card className="bg-slate-900/60 border-white/10 mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ShieldCheck className="h-5 w-5 text-fuchsia-300" />
            Etat du module
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-white font-medium mb-1">
                Module :{" "}
                <span
                  className={
                    moduleState?.isEnabled ? "text-emerald-300" : "text-amber-300"
                  }
                >
                  {moduleState?.isEnabled ? "ACTIF" : "DESACTIVE"}
                </span>
              </p>
              {moduleState?.enabledAt && moduleState.isEnabled && (
                <p className="text-xs text-white/45">
                  Active le{" "}
                  {new Date(moduleState.enabledAt).toLocaleDateString("fr-FR")}{" "}
                  par {moduleState.enabledBy}
                </p>
              )}
            </div>
            <Switch
              checked={moduleState?.isEnabled ?? false}
              onCheckedChange={toggleModule}
              disabled={togglingModule || !moduleState}
            />
          </div>
        </CardContent>
      </Card>

      {/* Demandes en attente */}
      <h2 className="text-xl font-semibold mb-4">
        Demandes en attente ({requests.length})
      </h2>

      {loading ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin text-fuchsia-400" />
        </div>
      ) : requests.length === 0 ? (
        <Card className="bg-slate-900/50 border-white/10">
          <CardContent className="p-8 text-center text-white/55">
            Aucune demande en attente.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {requests.map((r) => (
            <Card key={r.id} className="bg-slate-900/50 border-white/10">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg">{r.channelName}</h3>
                    <p className="text-xs text-white/55 mb-2">
                      par {r.creatorDisplayName || r.creatorEmail || r.creatorId}
                    </p>
                    {r.channelSlug && (
                      <p className="text-xs text-fuchsia-300 font-mono mb-2">
                        /channels/{r.channelSlug}
                      </p>
                    )}
                    {r.channelBio && (
                      <p className="text-sm text-white/70 leading-relaxed">
                        {r.channelBio}
                      </p>
                    )}
                  </div>
                  <Badge className="bg-fuchsia-500/15 text-fuchsia-200 border-fuchsia-500/30 shrink-0">
                    Trust {r.trustScoreAtRequest}
                  </Badge>
                </div>

                <Textarea
                  placeholder="Note de moderation (optionnelle)..."
                  value={reviewNotes[r.id] || ""}
                  onChange={(e) =>
                    setReviewNotes((prev) => ({
                      ...prev,
                      [r.id]: e.target.value,
                    }))
                  }
                  rows={2}
                  className="text-sm"
                />

                <div className="flex gap-2">
                  <Button
                    onClick={() => handleReview(r.id, "approved")}
                    disabled={busyId === r.id}
                    className="bg-emerald-600 hover:bg-emerald-500 flex-1"
                  >
                    {busyId === r.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Check className="h-4 w-4 mr-1.5" /> Approuver
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => handleReview(r.id, "rejected")}
                    disabled={busyId === r.id}
                    variant="destructive"
                    className="flex-1"
                  >
                    <X className="h-4 w-4 mr-1.5" /> Rejeter
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
