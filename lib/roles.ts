/**
 * VIXUAL Roles - Terminologie officielle des profils
 * 
 * Ce fichier re-exporte les configurations du catalogue unifie
 * et fournit des aliases pour la compatibilite ascendante.
 * 
 * Nomenclature officielle FR:
 * - invite (guest)
 * - visiteur (visitor)
 * - porteur (creator)
 * - contributeur (contributor)
 * - infoporteur (infoporteur)
 * - podcasteur (podcasteur)
 * - auditeur (auditeur)
 * - contribu-lecteur (contribu_lecteur)
 */

import {
  PROFILE_KEYS,
  PROFILE_LABELS_FR,
  PROFILE_LABELS_EN,
  PROFILE_DESCRIPTIONS_FR,
  PROFILE_COLORS,
  PROFILE_PAYMENT_RULES,
  getProfileLabel,
  getProfileDescription,
  canUseHybridPayment,
  canPayInEuros,
  canUseVixupoints,
  type ProfileKey,
} from "@/lib/profiles/catalog"

// Re-export du catalogue
export { PROFILE_KEYS, type ProfileKey }

// Labels officiels des profils (affichage UI) - VERROU FINAL: plus d'anciens alias
export const ROLE_LABELS: Record<string, string> = {
  guest: PROFILE_LABELS_FR.guest,
  visitor: PROFILE_LABELS_FR.visitor,
  creator: PROFILE_LABELS_FR.creator,
  contributor: PROFILE_LABELS_FR.contributor,
  infoporteur: PROFILE_LABELS_FR.infoporteur,
  podcasteur: PROFILE_LABELS_FR.podcasteur,
  auditeur: PROFILE_LABELS_FR.auditeur,
  contribu_lecteur: PROFILE_LABELS_FR.contribu_lecteur,
}

// Descriptions des profils - VERROU FINAL
export const ROLE_DESCRIPTIONS: Record<string, string> = {
  guest: PROFILE_DESCRIPTIONS_FR.guest,
  visitor: PROFILE_DESCRIPTIONS_FR.visitor,
  creator: PROFILE_DESCRIPTIONS_FR.creator,
  contributor: PROFILE_DESCRIPTIONS_FR.contributor,
  infoporteur: PROFILE_DESCRIPTIONS_FR.infoporteur,
  podcasteur: PROFILE_DESCRIPTIONS_FR.podcasteur,
  auditeur: PROFILE_DESCRIPTIONS_FR.auditeur,
  contribu_lecteur: PROFILE_DESCRIPTIONS_FR.contribu_lecteur,
}

// Couleurs des badges par profil - VERROU FINAL
export const ROLE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  guest: PROFILE_COLORS.guest,
  visitor: PROFILE_COLORS.visitor,
  creator: PROFILE_COLORS.creator,
  contributor: PROFILE_COLORS.contributor,
  infoporteur: PROFILE_COLORS.infoporteur,
  podcasteur: PROFILE_COLORS.podcasteur,
  auditeur: PROFILE_COLORS.auditeur,
  contribu_lecteur: PROFILE_COLORS.contribu_lecteur,
}

// Regles de paiement par profil - VERROU FINAL
export const ROLE_PAYMENT_RULES: Record<string, { vixupoints: boolean; euros: boolean; hybrid: boolean }> = {
  guest: { vixupoints: false, euros: false, hybrid: false },
  visitor_minor: { vixupoints: true, euros: false, hybrid: false },
  visitor: { vixupoints: true, euros: true, hybrid: true },
  creator: { vixupoints: false, euros: false, hybrid: false },
  contributor: { vixupoints: false, euros: true, hybrid: false },
  infoporteur: { vixupoints: false, euros: false, hybrid: false },
  podcasteur: { vixupoints: false, euros: false, hybrid: false },
  auditeur: { vixupoints: true, euros: true, hybrid: true },
  contribu_lecteur: { vixupoints: true, euros: true, hybrid: true },
}

// Fonction utilitaire pour obtenir le label d'un role
export function getRoleLabel(roleKey: string): string {
  return ROLE_LABELS[roleKey] || getProfileLabel(roleKey as ProfileKey) || roleKey
}

// Re-export des fonctions utilitaires
export { canUseHybridPayment, canPayInEuros, canUseVixupoints }
