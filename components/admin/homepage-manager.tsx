"use client"

/**
 * VIXUAL — Module ADMIN/PATRON "Gestion Homepage"
 *
 * Permet de modifier les visuels de la homepage V1 (Hero + carrousels).
 * Phase 1 : chemins d'images (URL externe ou /uploads/...) + aperçu.
 * Phase future : upload réel via API + Bunny.
 *
 * Accès :
 *   - ADMIN/PATRON : tout
 *   - Employés avec permission `manage_homepage` : tout sauf permissions
 */

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import { useAuth } from "@/lib/auth-context"
import { isPatronEmail } from "@/lib/admin/launch-permissions"
import {
  type HomepageConfigV1,
  type HomepageRow,
  type HomepageCard,
  getHomepageConfig,
  saveHomepageConfig,
  resetHomepageConfig,
  DEFAULT_HOMEPAGE_CONFIG,
} from "@/lib/homepage-config"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import {
  Save,
  RotateCcw,
  Eye,
  Image as ImageIcon,
  Layers,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Lock,
} from "lucide-react"
import Link from "next/link"

export function HomepageManager() {
  const { user } = useAuth()
  const isPatron = isPatronEmail(user?.email)
  // VERROU : Phase 1, on autorise PATRON par défaut.
  // En Phase 2 : brancher la vraie permission manage_homepage via API employés.
  const canEdit = isPatron

  const [config, setConfig] = useState<HomepageConfigV1>(DEFAULT_HOMEPAGE_CONFIG)
  const [loaded, setLoaded] = useState(false)
  const [savedFlash, setSavedFlash] = useState(false)
  const [openRowId, setOpenRowId] = useState<string | null>("row-films")

  // Chargement initial côté client (localStorage)
  useEffect(() => {
    setConfig(getHomepageConfig())
    setLoaded(true)
  }, [])

  const handleSave = () => {
    const next = saveHomepageConfig(config, user?.email ?? "anonymous")
    setConfig(next)
    setSavedFlash(true)
    setTimeout(() => setSavedFlash(false), 2500)
  }

  const handleReset = () => {
    if (!confirm("Réinitialiser la homepage avec les valeurs par défaut ?")) return
    const next = resetHomepageConfig()
    setConfig(next)
  }

  const updateHero = <K extends keyof HomepageConfigV1["hero"]>(
    key: K,
    value: HomepageConfigV1["hero"][K],
  ) => {
    setConfig((c) => ({ ...c, hero: { ...c.hero, [key]: value } }))
  }

  const updateRow = (rowId: string, patch: Partial<HomepageRow>) => {
    setConfig((c) => ({
      ...c,
      rows: c.rows.map((r) => (r.id === rowId ? { ...r, ...patch } : r)),
    }))
  }

  const updateCard = (rowId: string, cardId: string, patch: Partial<HomepageCard>) => {
    setConfig((c) => ({
      ...c,
      rows: c.rows.map((r) =>
        r.id === rowId
          ? { ...r, items: r.items.map((it) => (it.id === cardId ? { ...it, ...patch } : it)) }
          : r,
      ),
    }))
  }

  const moveCard = (rowId: string, cardId: string, direction: "up" | "down") => {
    setConfig((c) => ({
      ...c,
      rows: c.rows.map((r) => {
        if (r.id !== rowId) return r
        const idx = r.items.findIndex((it) => it.id === cardId)
        if (idx < 0) return r
        const target = direction === "up" ? idx - 1 : idx + 1
        if (target < 0 || target >= r.items.length) return r
        const items = [...r.items]
        const [moved] = items.splice(idx, 1)
        items.splice(target, 0, moved)
        return { ...r, items: items.map((it, i) => ({ ...it, order: i })) }
      }),
    }))
  }

  const lastUpdated = useMemo(() => {
    try {
      const d = new Date(config.updatedAt)
      if (Number.isNaN(d.getTime()) || d.getTime() === 0) return "Jamais modifiée"
      return d.toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" })
    } catch {
      return "—"
    }
  }, [config.updatedAt])

  // ─── Accès refusé ───
  if (!canEdit) {
    return (
      <Card className="bg-slate-900/60 border-red-500/30">
        <CardContent className="p-8 text-center">
          <Lock className="h-10 w-10 text-red-400 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-white mb-2">Accès refusé</h2>
          <p className="text-white/60 text-sm">
            Seul l&apos;ADMIN/PATRON ou un employé avec la permission{" "}
            <code className="px-1.5 py-0.5 bg-white/5 rounded text-amber-400">manage_homepage</code>{" "}
            peut accéder à ce module.
          </p>
        </CardContent>
      </Card>
    )
  }

  if (!loaded) {
    return (
      <div className="text-white/40 text-sm p-4">Chargement de la configuration…</div>
    )
  }

  return (
    <div className="space-y-6">
      {/* ─── Toolbar header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 text-xs text-white/40">
            <Layers className="h-3.5 w-3.5" />
            <span>Dernière mise à jour : {lastUpdated}</span>
            {config.updatedBy !== "system" && (
              <Badge variant="outline" className="border-white/15 text-white/50 text-[10px]">
                par {config.updatedBy}
              </Badge>
            )}
          </div>
          <p className="text-white/50 text-sm mt-1">
            Modifiez Hero et carrousels. Les changements sont stockés localement (Phase 1).
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Link href="/" target="_blank">
            <Button
              variant="outline"
              size="sm"
              className="border-white/15 text-white/70 hover:bg-white/5"
            >
              <Eye className="h-4 w-4 mr-1.5" />
              Prévisualiser
              <ExternalLink className="h-3 w-3 ml-1.5" />
            </Button>
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
          >
            <RotateCcw className="h-4 w-4 mr-1.5" />
            Réinitialiser
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            className="bg-emerald-600 hover:bg-emerald-500 text-white"
          >
            <Save className="h-4 w-4 mr-1.5" />
            Enregistrer
          </Button>
        </div>
      </div>

      {savedFlash && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm">
          <CheckCircle2 className="h-4 w-4" />
          Configuration enregistrée. La homepage utilisera ces visuels au prochain chargement.
        </div>
      )}

      {/* ─── HERO EDITOR ─── */}
      <Card className="bg-slate-900/60 border-white/10">
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <CardTitle className="text-white flex items-center gap-2">
            <ImageIcon className="h-5 w-5 text-amber-400" />
            Hero principal V1
          </CardTitle>
          <div className="flex items-center gap-2">
            <Label htmlFor="hero-enabled" className="text-xs text-white/50">
              Actif
            </Label>
            <Switch
              id="hero-enabled"
              checked={config.hero.enabled}
              onCheckedChange={(v) => updateHero("enabled", v)}
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Aperçu image */}
          <div className="relative aspect-[16/7] rounded-lg overflow-hidden border border-white/10 bg-black/40">
            {config.hero.image ? (
              <Image
                src={config.hero.image || "/placeholder.svg"}
                alt="Aperçu Hero"
                fill
                className="object-cover"
                unoptimized
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-white/30 text-sm">
                Aucune image
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 max-w-md">
              <span className="text-[10px] uppercase tracking-wider text-amber-400 font-bold">
                {config.hero.category}
              </span>
              <h3 className="text-2xl font-bold text-white mt-1 line-clamp-2">
                {config.hero.title || "(titre vide)"}
              </h3>
              <p className="text-sm text-white/80 mt-1 line-clamp-2">
                {config.hero.description || "(description vide)"}
              </p>
            </div>
          </div>

          {/* Champs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label className="text-xs text-white/60 mb-1.5 block">Image (URL ou chemin local)</Label>
              <Input
                value={config.hero.image}
                onChange={(e) => updateHero("image", e.target.value)}
                placeholder="https://... ou /uploads/homepage/hero-v1.webp"
                className="bg-black/30 border-white/10 text-white"
              />
              <p className="text-[10px] text-white/30 mt-1">
                Format recommandé : 1920×1080 .webp, max 600 Ko.
              </p>
            </div>
            <div>
              <Label className="text-xs text-white/60 mb-1.5 block">Catégorie</Label>
              <Input
                value={config.hero.category}
                onChange={(e) => updateHero("category", e.target.value)}
                placeholder="DOCUMENTAIRE EXCLUSIF"
                className="bg-black/30 border-white/10 text-white"
              />
            </div>
            <div>
              <Label className="text-xs text-white/60 mb-1.5 block">Titre</Label>
              <Input
                value={config.hero.title}
                onChange={(e) => updateHero("title", e.target.value)}
                placeholder="Titre principal"
                className="bg-black/30 border-white/10 text-white"
              />
            </div>
            <div className="md:col-span-2">
              <Label className="text-xs text-white/60 mb-1.5 block">Description</Label>
              <Textarea
                value={config.hero.description}
                onChange={(e) => updateHero("description", e.target.value)}
                placeholder="Phrase d'accroche..."
                rows={3}
                className="bg-black/30 border-white/10 text-white resize-none"
              />
            </div>
            <div>
              <Label className="text-xs text-white/60 mb-1.5 block">Texte du bouton CTA</Label>
              <Input
                value={config.hero.ctaLabel}
                onChange={(e) => updateHero("ctaLabel", e.target.value)}
                placeholder="Commencer gratuitement"
                className="bg-black/30 border-white/10 text-white"
              />
            </div>
            <div>
              <Label className="text-xs text-white/60 mb-1.5 block">Lien du bouton CTA</Label>
              <Input
                value={config.hero.ctaHref}
                onChange={(e) => updateHero("ctaHref", e.target.value)}
                placeholder="/explore"
                className="bg-black/30 border-white/10 text-white font-mono text-sm"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ─── ROWS EDITOR ─── */}
      <Card className="bg-slate-900/60 border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Layers className="h-5 w-5 text-purple-400" />
            Carrousels homepage
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {config.rows.map((row) => {
            const isOpen = openRowId === row.id
            return (
              <div
                key={row.id}
                className="rounded-lg border border-white/10 bg-black/20 overflow-hidden"
              >
                {/* Row header */}
                <button
                  type="button"
                  onClick={() => setOpenRowId(isOpen ? null : row.id)}
                  className="w-full flex items-center justify-between gap-3 p-4 text-left hover:bg-white/[0.02] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-white font-medium">{row.title}</span>
                    <Badge
                      variant="outline"
                      className={
                        row.enabled
                          ? "border-emerald-500/40 text-emerald-400 text-[10px]"
                          : "border-white/15 text-white/40 text-[10px]"
                      }
                    >
                      {row.enabled ? "Actif" : "Masqué"}
                    </Badge>
                    <span className="text-xs text-white/40">
                      {row.items.filter((i) => i.enabled).length}/{row.items.length} cartes
                    </span>
                  </div>
                  <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                    <Switch
                      checked={row.enabled}
                      onCheckedChange={(v) => updateRow(row.id, { enabled: v })}
                    />
                    {isOpen ? (
                      <ChevronUp className="h-4 w-4 text-white/40" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-white/40" />
                    )}
                  </div>
                </button>

                {/* Row content (cartes) */}
                {isOpen && (
                  <div className="p-4 border-t border-white/10 space-y-3">
                    <div>
                      <Label className="text-xs text-white/60 mb-1.5 block">
                        Titre de la rangée
                      </Label>
                      <Input
                        value={row.title}
                        onChange={(e) => updateRow(row.id, { title: e.target.value })}
                        className="bg-black/30 border-white/10 text-white max-w-md"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {row.items.map((card, idx) => (
                        <CardEditor
                          key={card.id}
                          card={card}
                          index={idx}
                          total={row.items.length}
                          onChange={(patch) => updateCard(row.id, card.id, patch)}
                          onMoveUp={() => moveCard(row.id, card.id, "up")}
                          onMoveDown={() => moveCard(row.id, card.id, "down")}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* ─── Note sécurité ─── */}
      <div className="flex items-start gap-3 p-4 rounded-lg bg-amber-500/5 border border-amber-500/20 text-sm">
        <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
        <div className="text-white/60">
          <strong className="text-amber-300">Phase 1 :</strong> configuration sauvegardée
          localement dans votre navigateur. La Phase 2 brancher l&apos;upload Bunny et la
          synchronisation Neon. Ce module ne touche jamais Stripe, Auth, ni les règles
          financières.
        </div>
      </div>
    </div>
  )
}

/* ───────────────────────────── CardEditor ───────────────────────────── */
function CardEditor({
  card,
  index,
  total,
  onChange,
  onMoveUp,
  onMoveDown,
}: {
  card: HomepageCard
  index: number
  total: number
  onChange: (patch: Partial<HomepageCard>) => void
  onMoveUp: () => void
  onMoveDown: () => void
}) {
  return (
    <div className="flex gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/5">
      {/* Aperçu image */}
      <div className="relative w-20 h-28 shrink-0 rounded-md overflow-hidden bg-black/40 border border-white/10">
        {card.image ? (
          <Image
            src={card.image || "/placeholder.svg"}
            alt={card.title}
            fill
            className="object-cover"
            sizes="80px"
            unoptimized
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-white/30 text-[10px]">
            no img
          </div>
        )}
        {!card.enabled && <div className="absolute inset-0 bg-black/70" />}
      </div>

      {/* Champs */}
      <div className="flex-1 min-w-0 space-y-2">
        <div className="flex items-center gap-2">
          <Input
            value={card.title}
            onChange={(e) => onChange({ title: e.target.value })}
            placeholder="Titre"
            className="bg-black/30 border-white/10 text-white text-sm h-8 flex-1"
          />
          <span className="text-[10px] text-white/30 font-mono shrink-0">#{index + 1}</span>
        </div>
        <Input
          value={card.image}
          onChange={(e) => onChange({ image: e.target.value })}
          placeholder="URL image ou /uploads/..."
          className="bg-black/30 border-white/10 text-white/80 text-xs h-7 font-mono"
        />
        <Input
          value={card.href}
          onChange={(e) => onChange({ href: e.target.value })}
          placeholder="/video/xyz"
          className="bg-black/30 border-white/10 text-white/80 text-xs h-7 font-mono"
        />
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Switch
              checked={card.enabled}
              onCheckedChange={(v) => onChange({ enabled: v })}
            />
            <span className="text-[10px] text-white/40">
              {card.enabled ? "Visible" : "Masquée"}
            </span>
          </div>
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={onMoveUp}
              disabled={index === 0}
              className="h-7 w-7 p-0 text-white/40 hover:text-white disabled:opacity-30"
              aria-label="Monter"
            >
              <ChevronUp className="h-3.5 w-3.5" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={onMoveDown}
              disabled={index === total - 1}
              className="h-7 w-7 p-0 text-white/40 hover:text-white disabled:opacity-30"
              aria-label="Descendre"
            >
              <ChevronDown className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
