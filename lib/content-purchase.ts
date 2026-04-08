/**
 * VIXUAL - Systeme d'Achat de Contenu avec Paiement Hybride
 *
 * PAIEMENT HYBRIDE: Permet de payer un contenu avec VIXUpoints + Euros
 *
 * Exemple pour un contenu a 3 EUR:
 * - 3 EUR (100% euros)
 * - 200 VIXUpoints + 1 EUR
 * - 100 VIXUpoints + 2 EUR
 *
 * REGLES PAR PROFIL (mise a jour 12/03/2026):
 * | Profil           | VIXUpoints | Euros | Hybride |
 * |------------------|------------|-------|---------|
 * | Visiteur mineur  | Oui        | Non   | Non     |
 * | Visiteur majeur  | Oui        | Oui   | Oui     |
 * | Contributeur     | Non        | Oui   | Non     |
 * | Contribu-lecteur | Oui        | Oui   | Oui     |
 * | Auditeur         | Oui        | Oui   | Oui     |
 * | Porteur          | Non        | Non   | Non     |
 * | Infoporteur      | Non        | Non   | Non     |
 * | Podcasteur       | Non        | Non   | Non     |
 *
 * Regle importante: Un createur ne peut pas acheter son propre contenu.
 *
 * @since 2026-03-12
 */

import { VISUPOINTS_PER_EUR } from "./payout/constants"

// ─── Types ───

export type CreatorProfile = "porter" | "infoporter" | "podcaster"
export type BuyerProfile = "visitor" | "auditor" | "contribureader" | "contributor" | "porter" | "infoporter" | "podcaster"

/** Profils autorises a utiliser le paiement hybride */
export type HybridPaymentProfile = "visitor_adult" | "contribureader" | "auditor"

/** Profils devant payer 100% en euros (pas de paiement hybride) */
export type CashOnlyProfile = "contributor" | "porter" | "infoporter" | "podcaster"

/** Profils mineurs (VIXUpoints uniquement, systeme tres encadre) */
export type MinorProfile = "visitor_minor"

export interface ContentItem {
  id: string
  title: string
  price: number // en euros
  priceCents: number // en centimes
  creatorId: string
  category: "video" | "text" | "podcast"
  type: "project" | "episode" | "article"
}

export interface HybridPaymentOption {
  cashEur: number
  pointsUsed: number
  totalCost: number
  isValid: boolean
  reason?: string
}

export interface PurchaseResult {
  success: boolean
  purchaseId?: string
  message: string
  remainingPoints?: number
  bonusEarned?: number
}

// ─── Constants ───

/** Part minimum en euros (cash) - 30% */
export const HYBRID_MIN_CASH_RATIO = 0.30

/** Part maximum en VIXUpoints - 70% */
export const HYBRID_MAX_POINTS_RATIO = 0.70

/** Bonus d'utilisation des VIXUpoints - 5% des points dépensés */
export const HYBRID_BONUS_RATE = 0.05

/** Plafond mensuel du bonus en points */
export const HYBRID_BONUS_MONTHLY_CAP = 200

/** Profils autorises a acheter du contenu */
export const BUYER_PROFILES: BuyerProfile[] = [
  "visitor",
  "auditor",
  "contribureader",
  "contributor",
  "porter",
  "infoporter",
  "podcaster",
]

/** Profils pouvant utiliser le paiement hybride (VIXUpoints + Euros) */
export const HYBRID_PAYMENT_PROFILES: HybridPaymentProfile[] = [
  "visitor_adult",
  "contribureader",
  "auditor",
]

/** Profils devant payer 100% en euros (pas de paiement hybride) */
export const CASH_ONLY_PROFILES: CashOnlyProfile[] = [
  "contributor",
  "porter",
  "infoporter",
  "podcaster",
]

/** Profils créateurs autorisés à acheter du contenu */
export const CREATOR_BUYER_PROFILES: CreatorProfile[] = [
  "porter",
  "infoporter",
  "podcaster",
]

// ─── Validations ───

/**
 * Vérifie si l'utilisateur peut acheter du contenu.
 */
export function canBuyContent(
  userProfile: BuyerProfile,
  userPoints: number,
  contentPrice: number
): { allowed: boolean; reason?: string } {
  // Vérifier que le profil est autorisé
  if (!BUYER_PROFILES.includes(userProfile)) {
    return {
      allowed: false,
      reason: `Le profil "${userProfile}" n'est pas autorisé à acheter du contenu.`,
    }
  }

  // Vérifier que l'utilisateur a assez de ressources
  const minCashNeeded = contentPrice * HYBRID_MIN_CASH_RATIO
  const maxPointsNeeded = contentPrice * HYBRID_MAX_POINTS_RATIO

  // Cas 1 : Paiement 100% cash
  if (userPoints === 0) {
    return {
      allowed: true,
    }
  }

  // Cas 2 : Paiement hybride possible
  const pointsCanUse = Math.min(maxPointsNeeded, userPoints)
  const cashNeeded = contentPrice - pointsCanUse

  if (cashNeeded < 0 || cashNeeded > contentPrice) {
    return {
      allowed: false,
      reason: "Erreur de calcul du paiement hybride.",
    }
  }

  return { allowed: true }
}

/**
 * Vérifie qu'un créateur ne peut pas acheter son propre contenu.
 */
export function isOwnContent(
  buyerId: string,
  contentCreatorId: string,
  buyerProfile: BuyerProfile
): boolean {
  // Règle : un créateur ne peut pas acheter son propre contenu
  return CREATOR_BUYER_PROFILES.includes(buyerProfile as CreatorProfile) &&
    buyerId === contentCreatorId
}

// ─── Calculs ───

/**
 * Calcule les options de paiement hybride pour un contenu.
 *
 * @param contentPrice Prix du contenu en euros
 * @param userPoints VIXUpoints disponibles
 * @returns Options de paiement possibles
 */
export function calculateHybridPaymentOptions(
  contentPrice: number,
  userPoints: number
): HybridPaymentOption[] {
  const options: HybridPaymentOption[] = []

  // Option 1 : 100% cash
  options.push({
    cashEur: contentPrice,
    pointsUsed: 0,
    totalCost: contentPrice,
    isValid: true,
  })

  // Option 2 : Paiement hybride optimal
  const minCashRequired = contentPrice * HYBRID_MIN_CASH_RATIO
  const maxPointsAvailable = contentPrice * HYBRID_MAX_POINTS_RATIO

  const pointsToUse = Math.min(maxPointsAvailable, userPoints)
  const cashNeeded = contentPrice - pointsToUse

  if (cashNeeded >= minCashRequired && cashNeeded >= 0 && pointsToUse > 0) {
    options.push({
      cashEur: Number(cashNeeded.toFixed(2)),
      pointsUsed: Math.round(pointsToUse),
      totalCost: contentPrice,
      isValid: true,
    })
  }

  // Option 3 : Maximum VIXUpoints (si utilisateur en a assez)
  if (userPoints >= maxPointsAvailable * 1.1) {
    const maxPointsOption = Math.round(maxPointsAvailable)
    const minCashOption = contentPrice - (maxPointsOption / 100) // 100 pts = 1 EUR

    options.push({
      cashEur: Number(minCashOption.toFixed(2)),
      pointsUsed: maxPointsOption,
      totalCost: contentPrice,
      isValid: minCashOption >= minCashRequired,
      reason: minCashOption < minCashRequired
        ? `Minimum ${minCashRequired.toFixed(2)}€ requis en cash.`
        : undefined,
    })
  }

  return options
}

/**
 * Exécute un paiement hybride et calcule le bonus.
 *
 * @param contentPrice Prix en euros
 * @param pointsUsed Points utilisés pour le paiement
 * @param currentMonthlyBonus Bonus utilisé ce mois-ci
 * @returns Détails du paiement et du bonus
 */
export function executePurchase(
  contentPrice: number,
  pointsUsed: number,
  currentMonthlyBonus: number = 0
): {
  cashCharged: number
  pointsDeducted: number
  bonusEarned: number
  remainingMonthlyBonusCap: number
} {
  // Bonus = 5% des points dépensés
  const rawBonus = Math.floor(pointsUsed * HYBRID_BONUS_RATE)

  // Plafonner le bonus à 200/mois
  const remainingMonthlyBonusCap = Math.max(0, HYBRID_BONUS_MONTHLY_CAP - currentMonthlyBonus)
  const bonusEarned = Math.min(rawBonus, remainingMonthlyBonusCap)

  // Cash à charger = totalPrice - points
  const cashCharged = contentPrice - (pointsUsed / VISUPOINTS_PER_EUR)

  return {
    cashCharged: Number(cashCharged.toFixed(2)),
    pointsDeducted: pointsUsed,
    bonusEarned,
    remainingMonthlyBonusCap: remainingMonthlyBonusCap - bonusEarned,
  }
}

// ─── Display Utils ───

/**
 * Génère un texte d'affichage pour les options de paiement.
 *
 * @example
 * "Acheter : 4€" ou "2€ + 200 VIXUpoints"
 */
export function formatPaymentOption(option: HybridPaymentOption): string {
  if (option.pointsUsed === 0) {
    return `Acheter : ${option.cashEur}€`
  }

  return `${option.cashEur}€ + ${option.pointsUsed} VIXUpoints`
}

/**
 * Génère un message d'explication pour le paiement hybride.
 */
export function getHybridPaymentExplanation(): string {
  return `Le paiement hybride permet d'utiliser jusqu'à 70% de VIXUpoints (max) et de 30% en euros (min) pour acheter du contenu.
Chaque achat vous fait gagner 5% des points dépensés en bonus (max 200 points/mois).`
}

/**
 * Génère un tableau de recommandation pour chaque prix.
 */
export function getPriceGuideTable(): Array<{
  price: number
  minCash: number
  maxPoints: number
  recommendedPoints: number
}> {
  const prices = [1, 2, 3, 4, 5, 8, 10, 15, 20]

  return prices.map((price) => ({
    price,
    minCash: Number((price * HYBRID_MIN_CASH_RATIO).toFixed(2)),
    maxPoints: Math.round(price * HYBRID_MAX_POINTS_RATIO * VISUPOINTS_PER_EUR),
    recommendedPoints: Math.round(price * 0.5 * VISUPOINTS_PER_EUR), // 50% comme recommandation
  }))
}
