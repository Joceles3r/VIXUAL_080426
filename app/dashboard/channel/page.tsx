"use client"

/**
 * Dashboard createur : gestion de sa chaine.
 * - Si pas eligible : affiche raison + criteres.
 * - Si eligible et pas de chaine : formulaire de demande.
 * - Si demande pending : statut.
 * - Si chaine active : edition bio + lien vers la chaine publique.
 */

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tv, ExternalLink, Loader2, AlertCircle, CheckCircle2, Clock } from "lucide-react"
import { normalizeSlug } from "@/lib/channels/slug"
import type { CreatorEligibilitySnapshot } from "@/lib/channels/service"

interface ChannelInfo {
  id: string
  slug: string
  name: string
  bio: string | null
  bannerUrl: string | null
  viewCount: number
}

interface RequestInfo {
  id: string
  status: "pending" | "approved" | "rejected"
  channelSlug: string | null
  channelName: string
  reviewNote: string | null
  createdAt: string
}

export default function DashboardChannelPage() {
  const { user, isAuthed } = useAuth()
  const [loading, setLoading] = useState(true)
  const [eligibility, setEligibility] = useState<CreatorEligibilitySnapshot | null>(null)
  const [request, setRequest] = useState<RequestInfo | null>(null)
  const [channel, setChannel] = useState<ChannelInfo | null>(null)
  const [moduleDisabled, setModuleDisabled] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [slug, setSlug] = useState("")
  const [name, setName] = useState("")
  const [bio, setBio] = useState("")

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
      const [eligRes, reqRes] = await Promise.all([
        fetch("/api/channels/eligibility", { headers: authHeaders() }),
        fetch("/api/channels/requests", { headers: authHeaders() }),
      ])

      if (eligRes.status === 403) {
        setModuleDisabled(true)
        return
      }
      const eligData = await eligRes.json()
      setEligibility(eligData.eligibility ?? null)

      if (reqRes.ok) {
        const reqData = await reqRes.json()
        setRequest(reqData.request ?? null)
        if (reqData.request?.status === "approved" && reqData.request.channelSlug) {
          const ch = await fetch(`/api/channels/${reqData.request.channelSlug}`, {
            headers: authHeaders(),
          })
          if (ch.ok) {
            const chData = await ch.json()
            setChannel(chData.channel ?? null)
          }
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur de chargement")
    } finally {
      setLoading(false)
    }
  }, [user, authHeaders])

  useEffect(() => {
    if (isAuthed && user) refresh()
    else setLoading(false)
  }, [isAuthed, user, refresh])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch("/api/channels/requests", {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          channelSlug: normalizeSlug(slug),
          channelName: name.trim(),
          channelBio: bio.trim() || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Erreur lors de la demande")
      setSlug("")
      setName("")
      setBio("")
      await refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur inconnue")
    } finally {
      setSubmitting(false)
    }
  }

  if (!isAuthed) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <Card className="bg-slate-900/50 border-white/10">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-8 w-8 mx-auto text-amber-400 mb-3" />
            <p className="text-white/70 mb-4">
              Connecte-toi pour gerer ta chaine creator.
            </p>
            <Link href="/login">
              <Button>Se connecter</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-fuchsia-400" />
      </div>
    )
  }

  if (moduleDisabled) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <Card className="bg-slate-900/50 border-white/10">
          <CardContent className="p-8 text-center">
            <Tv className="h-10 w-10 mx-auto text-fuchsia-400 mb-3" />
            <h2 className="text-xl font-semibold mb-2">Module non disponible</h2>
            <p className="text-white/65 leading-relaxed">
              Les chaines createurs sont actuellement desactivees. Cette
              fonctionnalite sera ouverte progressivement.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-3xl">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <Tv className="h-7 w-7 text-fuchsia-400" />
          Ma chaine creator
        </h1>
        <p className="text-white/60">
          Construis ton univers creatif personnel sur VIXUAL.
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

      {channel ? (
        <Card className="bg-emerald-900/15 border-emerald-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-emerald-300">
              <CheckCircle2 className="h-5 w-5" />
              Chaine active
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-lg font-semibold">{channel.name}</p>
            {channel.bio && <p className="text-sm text-white/70">{channel.bio}</p>}
            <p className="text-xs text-white/50">{channel.viewCount} vues</p>
            <Link
              href={`/channels/${channel.slug}`}
              className="inline-flex items-center gap-1.5 text-fuchsia-300 hover:text-fuchsia-200 text-sm"
            >
              Voir ma chaine publique <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </CardContent>
        </Card>
      ) : request?.status === "pending" ? (
        <Card className="bg-amber-900/15 border-amber-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-200">
              <Clock className="h-5 w-5" />
              Demande en attente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-white/75 mb-1">
              Ta demande pour <strong>{request.channelName}</strong> est en cours
              de validation par l&apos;equipe VIXUAL.
            </p>
            <p className="text-xs text-white/45">
              Soumise le {new Date(request.createdAt).toLocaleDateString("fr-FR")}
            </p>
          </CardContent>
        </Card>
      ) : request?.status === "rejected" ? (
        <Card className="bg-rose-900/15 border-rose-500/30 mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-rose-200">
              <AlertCircle className="h-5 w-5" />
              Demande refusee
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {request.reviewNote && (
              <p className="text-sm text-white/70">
                Motif : {request.reviewNote}
              </p>
            )}
            <p className="text-xs text-white/50">
              Tu pourras soumettre une nouvelle demande apres correction.
            </p>
          </CardContent>
        </Card>
      ) : null}

      {!channel && (!request || request.status === "rejected") && eligibility && (
        <Card className="bg-slate-900/50 border-white/10 mt-6">
          <CardHeader>
            <CardTitle>Demander ta chaine</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-lg border border-white/10 bg-white/5">
              <Badge
                className={
                  eligibility.eligible
                    ? "bg-emerald-500/15 text-emerald-200 border-emerald-500/30"
                    : "bg-amber-500/15 text-amber-200 border-amber-500/30"
                }
              >
                Trust Score : {eligibility.trustScore}
              </Badge>
              <span className="text-sm text-white/65">{eligibility.reason}</span>
            </div>

            {eligibility.eligible && (
              <form onSubmit={onSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="ch-name">Nom de la chaine</Label>
                  <Input
                    id="ch-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    maxLength={120}
                    placeholder="Ex: Studio Lumiere"
                  />
                </div>
                <div>
                  <Label htmlFor="ch-slug">URL de la chaine</Label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-white/45">vixual.app/channels/</span>
                    <Input
                      id="ch-slug"
                      value={slug}
                      onChange={(e) => setSlug(normalizeSlug(e.target.value))}
                      required
                      pattern="[a-z0-9-]+"
                      maxLength={60}
                      placeholder="studio-lumiere"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="ch-bio">Description (optionnelle)</Label>
                  <Textarea
                    id="ch-bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={4}
                    maxLength={500}
                    placeholder="Presente brievement ton univers creatif..."
                  />
                </div>
                <Button type="submit" disabled={submitting} className="w-full">
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Envoi...
                    </>
                  ) : (
                    "Soumettre ma demande"
                  )}
                </Button>
                <p className="text-xs text-white/45 text-center">
                  Ta demande sera examinee manuellement par l&apos;equipe VIXUAL.
                </p>
              </form>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
