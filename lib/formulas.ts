/**
 * VIXUAL — Formules Mathematiques Officielles
 * 
 * Ce fichier centralise TOUTES les formules officielles de VIXUAL.
 * Source de verite unique pour eviter les doublons et incoherences.
 * 
 * Version: 1.0 (16/03/2026)
 */

// ════════════════════════════════════════════════════════════════════════════
// 1. REPARTITION GLOBALE DES GAINS
// ════════════════════════════════════════════════════════════════════════════

/**
 * Cle de repartition officielle VIXUAL
 * - 40% → Createurs gagnants (TOP 10)
 * - 30% → Contributeurs gagnants (ayant soutenu un projet TOP 10)
 * - 7%  → Communaute (rangs 11 a 100)
 * - 23% → VIXUAL (plateforme)
 * 
 * Total: 100%
 */
export const DISTRIBUTION_KEY = {
  creators: 0.40,       // 40%
  contributors: 0.30,   // 30%
  community: 0.07,      // 7%
  platform: 0.23,       // 23%
} as const

/** Verification: somme = 1 (100%) */
export function verifyDistributionKey(): boolean {
  const sum = DISTRIBUTION_KEY.creators + 
              DISTRIBUTION_KEY.contributors + 
              DISTRIBUTION_KEY.community + 
              DISTRIBUTION_KEY.platform
  return Math.abs(sum - 1) < 0.0001
}

// ════════════════════════════════════════════════════════════════════════════
// 2. GAIN INDIVIDUEL
// ════════════════════════════════════════════════════════════════════════════

/**
 * Formule de gain individuel:
 * Gain = (contribution utilisateur / total contributions gagnantes) × enveloppe
 * 
 * @param userContribution - Contribution de l'utilisateur en euros
 * @param totalWinningContributions - Total des contributions gagnantes en euros
 * @param envelope - Enveloppe a distribuer en euros
 * @returns Gain en euros
 */
export function calculateUserGain(
  userContribution: number,
  totalWinningContributions: number,
  envelope: number
): number {
  if (totalWinningContributions <= 0) return 0
  return (userContribution / totalWinningContributions) * envelope
}

// ════════════════════════════════════════════════════════════════════════════
// 3. STRUCTURE DU CYCLE
// ════════════════════════════════════════════════════════════════════════════

/**
 * Un cycle = 100 projets evalues
 * 
 * Flux:
 * Contributions → Fonds du cycle → Repartition 40/30/7/23
 */
export const CYCLE_THRESHOLD = 100
export const TOP_WINNERS = 10        // TOP 10 = gagnants
export const COMMUNITY_START = 11    // Rang 11 = debut communaute
export const COMMUNITY_END = 100     // Rang 100 = fin communaute

// ════════════════════════════════════════════════════════════════════════════
// 4. CONVERSION € → VOTES
// ════════════════════════════════════════════════════════════════════════════

/**
 * Table de conversion officielle contribution -> votes
 * 
 * Principe fondamental VIXUAL:
 * - Les VOTES servent au CLASSEMENT
 * - Les EUROS servent au calcul des GAINS
 */
export const CONTRIBUTION_TO_VOTES: Record<number, number> = {
  2: 1,
  3: 2,
  4: 3,
  5: 4,
  6: 5,
  8: 7,
  10: 8,
  12: 10,
  15: 13,
  20: 15,
}

/** Montants de contribution autorises */
export const CONTRIBUTION_AMOUNTS = [2, 3, 4, 5, 6, 8, 10, 12, 15, 20] as const

/**
 * Convertit un montant en euros en nombre de votes
 * @param euros - Montant de la contribution
 * @returns Nombre de votes
 */
export function getVotesFromContribution(euros: number): number {
  return CONTRIBUTION_TO_VOTES[euros] ?? 0
}

/**
 * Trouve le montant de contribution correspondant le plus proche
 * @param euros - Montant approximatif
 * @returns Montant officiel le plus proche
 */
export function findClosestContributionTier(euros: number): number {
  const amounts = [...CONTRIBUTION_AMOUNTS]
  return amounts.reduce((prev, curr) => 
    Math.abs(curr - euros) < Math.abs(prev - euros) ? curr : prev
  )
}

// ════════════════════════════════════════════════════════════════════════════
// 5. SCORE PROJET
// ════════════════════════════════════════════════════════════════════════════

/**
 * Formule du Score Projet:
 * Score = (Votes × 50%) + (Financement × 30%) + (Engagement × 20%)
 */
export const SCORE_WEIGHTS = {
  votes: 0.50,       // 50%
  funding: 0.30,     // 30%
  engagement: 0.20,  // 20%
} as const

/**
 * Calcule le score global d'un projet
 * @param votesScore - Score des votes (0-100, normalise)
 * @param fundingScore - Score du financement (0-100, normalise)
 * @param engagementScore - Score de l'engagement (0-100, normalise)
 * @returns Score global (0-100)
 */
export function calculateProjectScore(
  votesScore: number,
  fundingScore: number,
  engagementScore: number
): number {
  return (
    votesScore * SCORE_WEIGHTS.votes +
    fundingScore * SCORE_WEIGHTS.funding +
    engagementScore * SCORE_WEIGHTS.engagement
  )
}

/** Verification: somme des poids = 1 (100%) */
export function verifyScoreWeights(): boolean {
  const sum = SCORE_WEIGHTS.votes + SCORE_WEIGHTS.funding + SCORE_WEIGHTS.engagement
  return Math.abs(sum - 1) < 0.0001
}

// ════════════════════════════════════════════════════════════════════════════
// 6. CLASSEMENT
// ════════════════════════════════════════════════════════════════════════════

export type RankCategory = "top10" | "community" | "unranked"

/**
 * Determine la categorie d'un rang
 * @param rank - Position dans le classement (1-100)
 */
export function getRankCategory(rank: number): RankCategory {
  if (rank >= 1 && rank <= TOP_WINNERS) return "top10"
  if (rank >= COMMUNITY_START && rank <= COMMUNITY_END) return "community"
  return "unranked"
}

/**
 * Verifie si un rang est gagnant (TOP 10)
 */
export function isWinningRank(rank: number): boolean {
  return rank >= 1 && rank <= TOP_WINNERS
}

/**
 * Verifie si un rang est dans la communaute (11-100)
 */
export function isCommunityRank(rank: number): boolean {
  return rank >= COMMUNITY_START && rank <= COMMUNITY_END
}

// ════════════════════════════════════════════════════════════════════════════
// 7. VIXUPOINTS
// ════════════════════════════════════════════════════════════════════════════

/**
 * Conversion officielle: 100 VIXUpoints = 1 EUR - source unique depuis payout/constants
 */
import { VIXUPOINTS_PER_EUR } from "@/lib/payout/constants"
export { VIXUPOINTS_PER_EUR }

/**
 * Convertit des VIXUpoints en euros
 */
export function vixupointsToEuros(points: number): number {
  return points / VIXUPOINTS_PER_EUR
}

/**
 * Convertit des euros en VIXUpoints
 */
export function eurosToVixupoints(euros: number): number {
  return euros * VIXUPOINTS_PER_EUR
}

// ════════════════════════════════════════════════════════════════════════════
// 8. MICRO-PACKS
// ════════════════════════════════════════════════════════════════════════════

/**
 * Micro-packs officiels VIXUpoints
 * Chaque pack offre un bonus progressif
 */
export const MICRO_PACKS = {
  pack_5: { priceEur: 5, basePoints: 500, bonusPercent: 10, totalPoints: 550 },
  pack_10: { priceEur: 10, basePoints: 1000, bonusPercent: 15, totalPoints: 1150 },
  pack_20: { priceEur: 20, basePoints: 2000, bonusPercent: 20, totalPoints: 2400 },
  pack_50: { priceEur: 50, basePoints: 5000, bonusPercent: 30, totalPoints: 6500 },
} as const

/**
 * Calcule les VIXUpoints pour un micro-pack
 */
export function calculatePackPoints(priceEur: number): number {
  const pack = Object.values(MICRO_PACKS).find(p => p.priceEur === priceEur)
  return pack?.totalPoints ?? 0
}

// ════════════════════════════════════════════════════════════════════════════
// 9. PAIEMENT HYBRIDE
// ════════════════════════════════════════════════════════════════════════════

/**
 * Paiement hybride: Prix = € + VIXUpoints
 * 
 * Regles:
 * - Minimum 30% en euros
 * - Maximum 70% en VIXUpoints
 */
export const HYBRID_MIN_CASH_RATIO = 0.30   // 30% minimum en euros
export const HYBRID_MAX_POINTS_RATIO = 0.70 // 70% maximum en VIXUpoints

/**
 * Calcule le split hybride pour un prix donne
 */
export function calculateHybridSplit(
  totalPriceEur: number,
  pointsToUse: number
): { cashEur: number; pointsUsed: number; isValid: boolean } {
  const maxPointsValue = totalPriceEur * HYBRID_MAX_POINTS_RATIO
  const maxPoints = eurosToVixupoints(maxPointsValue)
  
  const pointsUsed = Math.min(pointsToUse, maxPoints)
  const pointsValueEur = vixupointsToEuros(pointsUsed)
  const cashEur = totalPriceEur - pointsValueEur
  
  const isValid = cashEur >= totalPriceEur * HYBRID_MIN_CASH_RATIO
  
  return { cashEur, pointsUsed, isValid }
}

// ════════════════════════════════════════════════════════════════════════════
// 10. ANTI-ABUS VIXUPOINTS
// ════════════════════════════════════════════════════════════════════════════

/**
 * Formule anti-abus:
 * VIXUpoints gagnes = connexion valide × action utilisateur reelle
 * 
 * Conditions:
 * - Connexion valide (authentifie, session active)
 * - Action reelle (visionnage, lecture, interaction utile, partage reel)
 */
export const VIXUPOINTS_EARNING_ACTIONS = {
  viewExcerpt: 5,           // Visionner un extrait
  viewFullContent: 15,      // Visionner un contenu complet
  usefulComment: 5,         // Commentaire utile
  appreciatedComment: 10,   // Commentaire apprecie
  shareContent: 10,         // Partage d'un contenu
  referralSignup: 40,       // Inscription via partage
} as const

/**
 * Limites anti-abus
 */
export const VIXUPOINTS_LIMITS = {
  maxPerDay: 100,           // Max 100 VIXUpoints par jour
  maxPerWeek: 500,          // Max 500 VIXUpoints par semaine
  minorTotalCap: 10_000,    // Plafond mineur: 10 000 VIXUpoints
  adultVisitorCap: 2_500,   // Plafond visiteur majeur: 2 500 VIXUpoints
} as const

/**
 * Verifie si un gain de VIXUpoints est valide
 */
export function isValidVixupointsEarning(
  isConnected: boolean,
  hasRealAction: boolean
): boolean {
  return isConnected && hasRealAction
}

// ════════════════════════════════════════════════════════════════════════════
// 11. REGLE CLE VIXUAL
// ════════════════════════════════════════════════════════════════════════════

/**
 * REGLE FONDAMENTALE:
 * - VOTES = CLASSEMENT (determinent le TOP 10)
 * - EUROS = GAINS (calculent les redistributions)
 * 
 * Les votes et les euros sont dissocies intentionnellement
 * pour garantir l'equite du systeme.
 */
export const VIXUAL_RULE = {
  votesUsedFor: "classement",
  eurosUsedFor: "gains",
} as const

// ════════════════════════════════════════════════════════════════════════════
// 12. SCHEMA GLOBAL
// ════════════════════════════════════════════════════════════════════════════

/**
 * Flux complet d'un cycle VIXUAL:
 * 
 * Contribution € → Votes → Score → Classement → Repartition → Gains
 * 
 * 1. L'utilisateur contribue en euros
 * 2. La contribution genere des votes (table officielle)
 * 3. Le projet accumule un score (votes 50% + financement 30% + engagement 20%)
 * 4. Les projets sont classes par score
 * 5. Le fonds est reparti (40% createurs, 30% contributeurs, 7% communaute, 23% VIXUAL)
 * 6. Les gains sont calcules au prorata des contributions en euros
 */
export const CYCLE_FLOW = [
  "contribution_eur",
  "votes",
  "score",
  "classement",
  "repartition",
  "gains",
] as const

// ════════════════════════════════════════════════════════════════════════════
// VALIDATION GLOBALE
// ════════════════════════════════════════════════════════════════════════════

/**
 * Verifie l'integrite de toutes les formules
 * @returns true si toutes les formules sont coherentes
 */
export function validateAllFormulas(): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []
  
  // 1. Verifier cle de repartition
  if (!verifyDistributionKey()) {
    errors.push("Distribution key does not sum to 100%")
  }
  
  // 2. Verifier poids du score
  if (!verifyScoreWeights()) {
    errors.push("Score weights do not sum to 100%")
  }
  
  // 3. Verifier table de votes
  for (const amount of CONTRIBUTION_AMOUNTS) {
    if (!(amount in CONTRIBUTION_TO_VOTES)) {
      errors.push(`Missing vote conversion for ${amount} EUR`)
    }
  }
  
  // 4. Verifier micro-packs
  for (const [name, pack] of Object.entries(MICRO_PACKS)) {
    const expectedPoints = pack.basePoints * (1 + pack.bonusPercent / 100)
    if (Math.abs(pack.totalPoints - expectedPoints) > 1) {
      errors.push(`Micro-pack ${name} has incorrect total points`)
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  }
}
