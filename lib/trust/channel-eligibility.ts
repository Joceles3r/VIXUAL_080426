/**
 * VIXUAL Channel Eligibility (V3)
 *
 * Module pur (client + server) calculant le statut d'eligibilite
 * d'un createur a une chaine VIXUAL en V3 a partir de son Trust Score.
 *
 * Grille officielle (PATCH FRAICHEUR & RENOVATION) :
 *   < 85   -> non eligible
 *   85+    -> eligible
 *   90+    -> prioritaire
 *   95+    -> premium confirme
 *
 * IMPORTANT : l'eligibilite n'est PAS automatique cote acces. Elle
 * doit etre completee par : activite positive, respect du reglement
 * et validation ADMIN/PATRON. Voir feature-flag `creatorChannels`.
 */

export type ChannelEligibilityStatus =
  | "not_eligible"
  | "eligible"
  | "priority"
  | "premium_confirmed"

export interface ChannelEligibility {
  status: ChannelEligibilityStatus
  /** Libelle court adapte a l'UI VIXUAL (frontoffice). */
  label: string
  /** Score requis pour atteindre le palier suivant (null si deja max). */
  nextThreshold: number | null
  /** Le createur peut-il pretendre a une chaine (sous reserve validation patron). */
  canApply: boolean
}

/**
 * Calcule l'eligibilite d'un createur en fonction de son Trust Score.
 * Implementation deterministe, pure, sans effet de bord.
 */
export function getChannelEligibility(score: number): ChannelEligibility {
  if (score >= 95) {
    return {
      status: "premium_confirmed",
      label: "Premium confirme",
      nextThreshold: null,
      canApply: true,
    }
  }
  if (score >= 90) {
    return {
      status: "priority",
      label: "Prioritaire",
      nextThreshold: 95,
      canApply: true,
    }
  }
  if (score >= 85) {
    return {
      status: "eligible",
      label: "Eligible",
      nextThreshold: 90,
      canApply: true,
    }
  }
  return {
    status: "not_eligible",
    label: "Non eligible",
    nextThreshold: 85,
    canApply: false,
  }
}
