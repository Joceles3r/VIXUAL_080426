/**
 * VIXUAL — Homepage Config V1
 *
 * Configuration légère pour gérer la homepage V1 depuis l'ADMIN.
 * Phase 1 : stockage localStorage (simple, fonctionnel, zéro API upload).
 * Phase future : remplacer getHomepageConfig / saveHomepageConfig par
 * un fetch vers une vraie API + Bunny pour les uploads.
 *
 * Fallback obligatoire : si aucune config sauvegardée, on retourne
 * la configuration par défaut dérivée des mocks (mock-data-v1.ts).
 * La homepage ne casse jamais.
 */

import { V1_FEATURED, V1_SECTIONS, V1_SAVOIR_CULTURE } from "@/lib/mock-data-v1"

const findSection = (id: string) => V1_SECTIONS.find((s) => s.id === id)?.items ?? []
const FILMS = findSection("sect-films")
const PODCASTS = findSection("sect-podcasts")
const LIVRES = findSection("sect-livres")

// ─── TYPES ───
export type HomepageRowType = "film" | "podcast" | "livre" | "savoir-culture"

export interface HomepageCard {
  id: string
  title: string
  type: HomepageRowType
  image: string
  href: string
  enabled: boolean
  order: number
}

export interface HomepageRow {
  id: string
  title: string
  enabled: boolean
  items: HomepageCard[]
}

export interface HomepageHero {
  title: string
  description: string
  image: string
  video?: string  // Video Hero optionnelle (autoplay muted loop + fallback image)
  category: string
  ctaLabel: string
  ctaHref: string
  enabled: boolean
}

export interface HomepageConfigV1 {
  hero: HomepageHero
  rows: HomepageRow[]
  updatedAt: string
  updatedBy: string
}

// ─── DEFAULT CONFIG (dérivée des mocks V1) ───
// La homepage utilise cette config si rien n'a été sauvegardé.
export const DEFAULT_HOMEPAGE_CONFIG: HomepageConfigV1 = {
  hero: {
    title: V1_FEATURED.title,
    description:
      "Découvrez les créateurs indépendants autrement. Films, podcasts, écrits et contenus culturels à explorer dans un univers streaming participatif.",
    image: V1_FEATURED.thumbnail,
    category: V1_FEATURED.genres?.[0]?.toUpperCase() ?? "DOCUMENTAIRE EXCLUSIF",
    ctaLabel: "Commencer gratuitement",
    ctaHref: "/explore",
    enabled: true,
  },
  rows: [
    {
      id: "row-films",
      title: "Films & Vidéos",
      enabled: true,
      items: FILMS.map((c, i) => ({
        id: c.id,
        title: c.title,
        type: "film" as const,
        image: c.thumbnail,
        href: `/video/${c.id}`,
        enabled: true,
        order: i,
      })),
    },
    {
      id: "row-podcasts",
      title: "Podcasts",
      enabled: true,
      items: PODCASTS.map((c, i) => ({
        id: c.id,
        title: c.title,
        type: "podcast" as const,
        image: c.thumbnail,
        href: `/video/${c.id}`,
        enabled: true,
        order: i,
      })),
    },
    {
      id: "row-livres",
      title: "Littérature à Découvrir",
      enabled: true,
      items: LIVRES.map((c, i) => ({
        id: c.id,
        title: c.title,
        type: "livre" as const,
        image: c.thumbnail,
        href: `/video/${c.id}`,
        enabled: true,
        order: i,
      })),
    },
    {
      id: "row-savoir",
      title: "Savoir & Culture",
      enabled: true,
      items: V1_SAVOIR_CULTURE.map((c, i) => ({
        id: c.id,
        title: c.title,
        type: "savoir-culture" as const,
        image: c.thumbnail,
        href: `/explore?tab=savoir&id=${c.id}`,
        enabled: true,
        order: i,
      })),
    },
  ],
  updatedAt: new Date(0).toISOString(),
  updatedBy: "system",
}

// ─── STORAGE (localStorage, Phase 1) ───
const STORAGE_KEY = "vixual_homepage_config_v1"

/**
 * Lit la config depuis localStorage côté client.
 * Retourne la config par défaut si absent / corrompu / côté serveur.
 */
export function getHomepageConfig(): HomepageConfigV1 {
  if (typeof window === "undefined") return DEFAULT_HOMEPAGE_CONFIG
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_HOMEPAGE_CONFIG
    const parsed = JSON.parse(raw) as Partial<HomepageConfigV1>
    if (!parsed || !parsed.hero || !Array.isArray(parsed.rows)) {
      return DEFAULT_HOMEPAGE_CONFIG
    }
    // Fusion défensive : on garde la shape attendue
    return {
      hero: { ...DEFAULT_HOMEPAGE_CONFIG.hero, ...parsed.hero },
      rows: parsed.rows.map((r) => ({
        id: r.id ?? `row-${Math.random().toString(36).slice(2, 8)}`,
        title: r.title ?? "",
        enabled: r.enabled ?? true,
        items: Array.isArray(r.items) ? r.items : [],
      })),
      updatedAt: parsed.updatedAt ?? new Date().toISOString(),
      updatedBy: parsed.updatedBy ?? "unknown",
    }
  } catch {
    return DEFAULT_HOMEPAGE_CONFIG
  }
}

/**
 * Sauvegarde côté client. Met à jour updatedAt + updatedBy.
 * Log léger pour traçabilité (employee_logs côté serveur en Phase 2).
 */
export function saveHomepageConfig(
  config: HomepageConfigV1,
  updatedByEmail: string,
): HomepageConfigV1 {
  if (typeof window === "undefined") return config
  const next: HomepageConfigV1 = {
    ...config,
    updatedAt: new Date().toISOString(),
    updatedBy: updatedByEmail,
  }
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    console.log("[v0] homepage-config saved by", updatedByEmail)
  } catch (err) {
    console.error("[v0] homepage-config save failed", err)
  }
  return next
}

/**
 * Réinitialise la config (efface localStorage, retour aux mocks).
 */
export function resetHomepageConfig(): HomepageConfigV1 {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(STORAGE_KEY)
  }
  return DEFAULT_HOMEPAGE_CONFIG
}
