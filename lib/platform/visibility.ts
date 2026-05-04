/**
 * Helpers de visibilite des fonctionnalites par version de plateforme.
 * Permet de gater de maniere coherente les modules V2 et V3
 * sans dupliquer la logique d'ordre des versions.
 */

import type { PlatformVersion } from "@/lib/platform/version"

const ORDER: Record<PlatformVersion, number> = {
  V1: 1,
  V2: 2,
  V3: 3,
}

/**
 * Renvoie true si la version active permet d'afficher une fonctionnalite
 * dont la version minimale requise est `required`.
 */
export function canShowVersionFeature(
  current: PlatformVersion,
  required: PlatformVersion,
): boolean {
  return ORDER[current] >= ORDER[required]
}

/**
 * Liste centrale des features V3-only.
 * Utiliser cette liste plutot que de recoder les conditions dans chaque page.
 */
export const V3_ONLY_FEATURES = [
  "ticketGold",
  "vixualSocial",
  "trustScore",
  "iaSupport",
  "advancedArchives",
  "walletV3",
  "topContributors",
] as const

export type V3OnlyFeature = (typeof V3_ONLY_FEATURES)[number]

export function isV3OnlyFeature(feature: string): feature is V3OnlyFeature {
  return (V3_ONLY_FEATURES as readonly string[]).includes(feature)
}

/**
 * Liste centrale des features V2+ (disponibles des V2).
 */
export const V2_PLUS_FEATURES = [
  "ecrits",
  "podcasts",
  "comments",
  "notifications",
  "hybridPayment",
  "oauth",
  "topContributors",
] as const

export type V2PlusFeature = (typeof V2_PLUS_FEATURES)[number]

export function isV2PlusFeature(feature: string): feature is V2PlusFeature {
  return (V2_PLUS_FEATURES as readonly string[]).includes(feature)
}

/**
 * Renvoie la version minimale requise pour une feature donnee,
 * ou null si elle est dispo des la V1.
 */
export function getRequiredVersionForFeature(feature: string): PlatformVersion | null {
  if (isV3OnlyFeature(feature)) return "V3"
  if (isV2PlusFeature(feature)) return "V2"
  return null
}
