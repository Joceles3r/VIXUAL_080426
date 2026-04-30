import { sql } from "@/lib/db"

export type PlatformVersion = "V1" | "V2" | "V3"

// ─── Profils par Version ───
export const VERSION_PROFILES = {
  V1: ["guest", "visitor", "creator", "contributor"] as const,           // 4 profils Lancement
  V2: ["guest", "visitor", "creator", "contributor", "infoporteur", "podcasteur", "auditeur", "contribu_lecteur"] as const, // 8 profils
  V3: ["guest", "visitor", "creator", "contributor", "infoporteur", "podcasteur", "auditeur", "contribu_lecteur"] as const, // + features avancees
} as const

// ─── Features par Version ───
export const VERSION_FEATURES = {
  V1: {
    profiles: 4,
    contentTypes: ["video"],
    discoveryPass: true,
    visibilityBoost: true,
    vixualSocial: false,
    ticketGold: false,
    trustScoreVisible: false,
    iaSupport: false,
    freeSupport: false,
    archives: false,
    oauth: false,
    comments: false,
    notifications: false,
    hybridPayment: false,
    podcasts: false,
    ecrits: false,
  },
  V2: {
    profiles: 8,
    contentTypes: ["video", "ecrit", "podcast"],
    discoveryPass: true,
    visibilityBoost: true,
    vixualSocial: false,
    ticketGold: false,
    trustScoreVisible: false,
    iaSupport: false,
    freeSupport: false,
    archives: false,
    oauth: true,
    comments: true,
    notifications: true,
    hybridPayment: true,
    podcasts: true,
    ecrits: true,
  },
  V3: {
    profiles: 8,
    contentTypes: ["video", "ecrit", "podcast"],
    discoveryPass: true,
    visibilityBoost: true,
    vixualSocial: true,
    ticketGold: true,
    trustScoreVisible: true,
    iaSupport: true,
    freeSupport: true,
    archives: true,
    oauth: true,
    comments: true,
    notifications: true,
    hybridPayment: true,
    podcasts: true,
    ecrits: true,
  },
} as const

let cachedVersion: PlatformVersion | null = null
let cacheExpiry = 0
const CACHE_TTL_MS = 30_000

// Version actuelle par defaut: V3 (Pleine puissance)
const DEFAULT_VERSION: PlatformVersion = "V3"

export async function getPlatformVersion(): Promise<PlatformVersion> {
  const now = Date.now()
  if (cachedVersion && now < cacheExpiry) return cachedVersion
  try {
    const rows = await sql`SELECT current_version FROM platform_version WHERE id = 1 LIMIT 1`
    const v = (rows[0]?.current_version as PlatformVersion) ?? DEFAULT_VERSION
    cachedVersion = v
    cacheExpiry = now + CACHE_TTL_MS
    return v
  } catch {
    return DEFAULT_VERSION
  }
}

export function invalidatePlatformVersionCache() {
  cachedVersion = null
  cacheExpiry = 0
}

export async function setPlatformVersion(
  newVersion: PlatformVersion,
  changedBy: string,
  reason: string
): Promise<void> {
  const current = await getPlatformVersion()
  await sql`UPDATE platform_version SET current_version = ${newVersion}, updated_by = ${changedBy}, updated_at = NOW(), reason = ${reason} WHERE id = 1`
  await sql`INSERT INTO platform_version_history (from_version, to_version, changed_by, reason) VALUES (${current}, ${newVersion}, ${changedBy}, ${reason})`
  invalidatePlatformVersionCache()
}

export function isVersionAtLeast(current: PlatformVersion, required: PlatformVersion): boolean {
  const order = { V1: 1, V2: 2, V3: 3 }
  return order[current] >= order[required]
}

// ─── Feature Checks ───

export function getVersionFeatures(version: PlatformVersion) {
  return VERSION_FEATURES[version]
}

export function getVersionProfiles(version: PlatformVersion) {
  return VERSION_PROFILES[version]
}

export function isFeatureEnabled(version: PlatformVersion, feature: keyof typeof VERSION_FEATURES["V1"]): boolean {
  return !!VERSION_FEATURES[version][feature]
}

export function isProfileAvailable(version: PlatformVersion, profile: string): boolean {
  return (VERSION_PROFILES[version] as readonly string[]).includes(profile)
}

// ─── Transitions Automatiques (Trust Score) ───

export interface AutoTransitionCriteria {
  minTrustScore: number
  minContributions: number
  minDaysActive: number
  minVerifiedIdentity: boolean
}

export const AUTO_TRANSITION_RULES: Record<string, AutoTransitionCriteria> = {
  "guest_to_visitor": { minTrustScore: 0, minContributions: 0, minDaysActive: 0, minVerifiedIdentity: false },
  "visitor_to_contributor": { minTrustScore: 30, minContributions: 1, minDaysActive: 7, minVerifiedIdentity: false },
  "visitor_to_creator": { minTrustScore: 50, minContributions: 0, minDaysActive: 14, minVerifiedIdentity: true },
}

export function canAutoTransition(
  fromProfile: string,
  toProfile: string,
  userStats: { trustScore: number; contributions: number; daysActive: number; verifiedIdentity: boolean }
): boolean {
  const key = `${fromProfile}_to_${toProfile}`
  const criteria = AUTO_TRANSITION_RULES[key]
  if (!criteria) return false
  return (
    userStats.trustScore >= criteria.minTrustScore &&
    userStats.contributions >= criteria.minContributions &&
    userStats.daysActive >= criteria.minDaysActive &&
    (!criteria.minVerifiedIdentity || userStats.verifiedIdentity)
  )
}
