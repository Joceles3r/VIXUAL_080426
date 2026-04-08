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

// Labels officiels des profils (affichage UI) - compatibilite ascendante
export const ROLE_LABELS: Record<string, string> = {
  guest: PROFILE_LABELS_FR.guest,
  visitor: PROFILE_LABELS_FR.visitor,
  contributor: PROFILE_LABELS_FR.contributor,
  contribu_lecteur: PROFILE_LABELS_FR.contribu_lecteur,
  contribu_reader: PROFILE_LABELS_FR.contribu_lecteur, // Alias
  auditeur: PROFILE_LABELS_FR.auditeur,
  listener: PROFILE_LABELS_FR.auditeur, // Alias EN -> FR
  creator: PROFILE_LABELS_FR.creator,
  porter: PROFILE_LABELS_FR.creator, // Alias ancien nom
  infoporteur: PROFILE_LABELS_FR.infoporteur,
  infoporter: PROFILE_LABELS_FR.infoporteur, // Alias EN
  podcasteur: PROFILE_LABELS_FR.podcasteur,
  podcaster: PROFILE_LABELS_FR.podcasteur, // Alias EN
}

// Descriptions des profils
export const ROLE_DESCRIPTIONS: Record<string, string> = {
  guest: PROFILE_DESCRIPTIONS_FR.guest,
  visitor: PROFILE_DESCRIPTIONS_FR.visitor,
  contributor: PROFILE_DESCRIPTIONS_FR.contributor,
  contribu_lecteur: PROFILE_DESCRIPTIONS_FR.contribu_lecteur,
  contribu_reader: PROFILE_DESCRIPTIONS_FR.contribu_lecteur,
  auditeur: PROFILE_DESCRIPTIONS_FR.auditeur,
  listener: PROFILE_DESCRIPTIONS_FR.auditeur,
  creator: PROFILE_DESCRIPTIONS_FR.creator,
  porter: PROFILE_DESCRIPTIONS_FR.creator,
  infoporteur: PROFILE_DESCRIPTIONS_FR.infoporteur,
  infoporter: PROFILE_DESCRIPTIONS_FR.infoporteur,
  podcasteur: PROFILE_DESCRIPTIONS_FR.podcasteur,
  podcaster: PROFILE_DESCRIPTIONS_FR.podcasteur,
}

// Couleurs des badges par profil
export const ROLE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  guest: PROFILE_COLORS.guest,
  visitor: PROFILE_COLORS.visitor,
  contributor: PROFILE_COLORS.contributor,
  contribu_lecteur: PROFILE_COLORS.contribu_lecteur,
  contribu_reader: PROFILE_COLORS.contribu_lecteur,
  auditeur: PROFILE_COLORS.auditeur,
  listener: PROFILE_COLORS.auditeur,
  creator: PROFILE_COLORS.creator,
  porter: PROFILE_COLORS.creator,
  infoporteur: PROFILE_COLORS.infoporteur,
  infoporter: PROFILE_COLORS.infoporteur,
  podcasteur: PROFILE_COLORS.podcasteur,
  podcaster: PROFILE_COLORS.podcasteur,
}

// Regles de paiement par profil
export const ROLE_PAYMENT_RULES: Record<string, { vixupoints: boolean; euros: boolean; hybrid: boolean }> = {
  visitor_minor: { vixupoints: true, euros: false, hybrid: false },
  visitor: { vixupoints: true, euros: true, hybrid: true },
  contributor: { vixupoints: false, euros: true, hybrid: false },
  contribu_lecteur: { vixupoints: true, euros: true, hybrid: true },
  contribu_reader: { vixupoints: true, euros: true, hybrid: true },
  auditeur: { vixupoints: true, euros: true, hybrid: true },
  listener: { vixupoints: true, euros: true, hybrid: true },
  creator: { vixupoints: false, euros: false, hybrid: false },
  porter: { vixupoints: false, euros: false, hybrid: false },
  infoporteur: { vixupoints: false, euros: false, hybrid: false },
  infoporter: { vixupoints: false, euros: false, hybrid: false },
  podcasteur: { vixupoints: false, euros: false, hybrid: false },
  podcaster: { vixupoints: false, euros: false, hybrid: false },
}

// Fonction utilitaire pour obtenir le label d'un role
export function getRoleLabel(roleKey: string): string {
  return ROLE_LABELS[roleKey] || getProfileLabel(roleKey as ProfileKey) || roleKey
}

// Re-export des fonctions utilitaires
export { canUseHybridPayment, canPayInEuros, canUseVixupoints }
