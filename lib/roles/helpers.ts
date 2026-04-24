/**
 * VIXUAL Roles - Helpers officiels
 *
 * Source unique pour deriver dashboard, label et categorie metier
 * a partir d'une cle de role officielle.
 *
 * Ne pas reintroduire les anciens roles (porter, infoporter, podcaster,
 * listener, contribureader, investor, investireader).
 */

import { ROLE_LABELS } from "@/lib/roles"

/**
 * Roles createurs (publient du contenu).
 */
const CREATOR_ROLES = ["creator", "infoporteur", "podcasteur"] as const

/**
 * Roles participants (votent / contribuent / consomment payant).
 */
const PARTICIPANT_ROLES = ["contributor", "contribu_lecteur", "auditeur"] as const

export type CreatorRole = (typeof CREATOR_ROLES)[number]
export type ParticipantRole = (typeof PARTICIPANT_ROLES)[number]

/**
 * Retourne le label FR officiel d'un role.
 * Fallback : "invite".
 */
export function getRoleLabelFr(role: string | null | undefined): string {
  if (!role) return ROLE_LABELS.guest
  return ROLE_LABELS[role] ?? ROLE_LABELS.guest
}

/**
 * Retourne le dashboard cible pour un role donne.
 */
export function getDashboardForRole(role: string | null | undefined): string {
  switch (role) {
    case "visitor":
      return "/dashboard"
    case "creator":
    case "infoporteur":
    case "podcasteur":
      return "/dashboard/creator"
    case "contributor":
    case "contribu_lecteur":
    case "auditeur":
      return "/dashboard"
    default:
      return "/dashboard"
  }
}

/**
 * Verifie si un role est un role createur.
 */
export function isCreatorRole(role: string | null | undefined): role is CreatorRole {
  if (!role) return false
  return (CREATOR_ROLES as readonly string[]).includes(role)
}

/**
 * Verifie si un role est un role participant.
 */
export function isParticipantRole(role: string | null | undefined): role is ParticipantRole {
  if (!role) return false
  return (PARTICIPANT_ROLES as readonly string[]).includes(role)
}
