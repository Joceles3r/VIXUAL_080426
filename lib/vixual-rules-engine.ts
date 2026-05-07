/**
 * VIXUAL - Rules Engine V1 (Consolidation Post 9h20)
 *
 * Ce module centralise les regles metier validees :
 * - Interdiction auto-investissement (R3)
 * - VIXUAL Trust Score (R5)
 * - Limitation stockage createurs (R6)
 * - Protection medias par token temporaire (R7)
 * - Promotion externe (R9)
 * - Declaration de propriete intellectuelle (R10)
 * - Paiement mensuel batch (R1)
 * - Stripe Connect enforcement (R2)
 */

// ──────────────────────────────────────────────
// R1. PAIEMENT MENSUEL UNIQUE
// ──────────────────────────────────────────────

export type BatchStatus = "pending" | "validated" | "paid" | "blocked"

export interface MonthlyBatchEntry {
  userId: string
  role: string
  grossCents: number
  netCents: number
  status: BatchStatus
  stripeTransferId?: string
  idempotencyKey: string
  createdAt: string
}

export interface MonthlyBatchResult {
  cycleId: string
  month: string // YYYY-MM
  entries: MonthlyBatchEntry[]
  totalGrossCents: number
  totalNetCents: number
  paidCount: number
  blockedCount: number
}

/**
 * Genere un idempotency key unique pour Stripe.
 * Format : vixual_{cycleId}_{userId}_{month}
 */
export function generateIdempotencyKey(cycleId: string, userId: string, month: string): string;
export function generateIdempotencyKey(month: string): string;
export function generateIdempotencyKey(a: string, b?: string, c?: string): string {
  if (b && c) {
    return `vixual_${a}_${b}_${c}`;
  }
  return `vixual_batch_${a}`;
}

/**
 * Determine la date du prochain batch (1er du mois suivant).
 */
export function getNextBatchDate(): Date {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth() + 1, 1)
}

/**
 * Verifie si un batch peut etre lance (1er du mois).
 */
export function isBatchDay(date?: Date): boolean {
  return (date || new Date()).getDate() === 1
}

// ──────────────────────────────────────────────
// R2. STRIPE CONNECT ENFORCEMENT
// ──────────────────────────────────────────────

/** Profils qui DOIVENT avoir Stripe Connect actif pour percevoir des gains */
export const PAYABLE_ROLES = [
  "creator",      // porteur
  "infoporteur",
  "podcasteur",
  "contributor",  // investisseur films
  "contribu_lecteur", // investisseur livres
  "auditeur",     // investisseur podcasts
] as const

export type PayableRole = (typeof PAYABLE_ROLES)[number]

export interface StripeConnectStatus {
  accountId: string | null
  chargesEnabled: boolean
  payoutsEnabled: boolean
}

/**
 * Verifie si un utilisateur peut recevoir des paiements.
 * Bloque les fonctions financieres si charges_enabled ou payouts_enabled = false.
 */
export function canReceivePayouts(
  role: string,
  stripeStatus: StripeConnectStatus | null
): { allowed: boolean; reason?: string } {
  if (!PAYABLE_ROLES.includes(role as PayableRole)) {
    return { allowed: true } // Role non payable, pas besoin de Stripe
  }

  if (!stripeStatus || !stripeStatus.accountId) {
    return {
      allowed: false,
      reason: "Compte Stripe Connect non configure. L'activation d'un compte Stripe Connect est obligatoire pour tout profil susceptible de percevoir des gains.",
    }
  }

  if (!stripeStatus.chargesEnabled) {
    return {
      allowed: false,
      reason: "Votre compte Stripe Connect n'autorise pas encore les charges. Veuillez completer la verification.",
    }
  }

  if (!stripeStatus.payoutsEnabled) {
    return {
      allowed: false,
      reason: "Les versements ne sont pas encore actives sur votre compte Stripe. Veuillez completer la verification.",
    }
  }

  return { allowed: true }
}

// ──────────────────────────────────────────────
// R3. INTERDICTION AUTO-INVESTISSEMENT
// ──────────────────────────────────────────────

export interface SelfInvestCheckResult {
  allowed: boolean
  reason?: string
}

/**
 * Verifie qu'un investisseur n'investit pas dans son propre projet.
 * Regle absolue : aucun utilisateur ne peut investir dans un contenu
 * dont il est le proprietaire (porteur, infoporteur, podcasteur).
 */
export function checkSelfInvestment(
  investorId: string,
  projectOwnerId: string
): SelfInvestCheckResult {
  if (investorId === projectOwnerId) {
    return {
      allowed: false,
      reason: "Auto-soutien interdit. Vous ne pouvez pas soutenir financierement votre propre projet. Sanction possible : annulation, recalcul des votes, suspension du compte.",
    }
  }
  return { allowed: true }
}

// ──────────────────────────────────────────────
// R5. VIXUAL TRUST SCORE
// ──────────────────────────────────────────────

export interface TrustScoreInput {
  /** Nombre de jours depuis l'inscription */
  accountAgeDays: number
  /** Nombre de signalements recus (tous types) */
  reportsReceived: number
  /** Nombre de violations confirmees */
  confirmedViolations: number
  /** Nombre d'interactions positives (posts, reactions, votes) */
  positiveInteractions: number
  /** Nombre de contenus publies */
  contentsPublished: number
  /** Investissements realises (nombre) */
  investmentsMade: number
}

export interface TrustScoreResult {
  /** Score de 0 a 5 (granularite 0.5) */
  score: number
  /** Etoiles pleines (0-5) */
  stars: number
  /** Demi-etoile */
  halfStar: boolean
  /** Niveau textuel */
  level: "debutant" | "fiable" | "confirme" | "expert" | "elite"
  /** Impacts */
  visibilityBoost: number // multiplicateur (1.0 = normal)
  eligibleForBonus: boolean
}

/**
 * Calcule le VIXUAL Trust Score sur 5 etoiles.
 *
 * Criteres ponderes :
 * - Anciennete (25%) : 0-5 selon jours (30j=1, 90j=2, 180j=3, 365j=4, 730j+=5)
 * - Signalements (25%) : 5 - (reports * 0.5), min 0
 * - Respect des regles (25%) : 5 - (violations * 2), min 0
 * - Activite (25%) : interactions + contenus + investissements normalises
 */
export function computeTrustScore(input: TrustScoreInput): TrustScoreResult {
  // Anciennete (25%)
  let ageScore: number
  if (input.accountAgeDays >= 730) ageScore = 5
  else if (input.accountAgeDays >= 365) ageScore = 4
  else if (input.accountAgeDays >= 180) ageScore = 3
  else if (input.accountAgeDays >= 90) ageScore = 2
  else if (input.accountAgeDays >= 30) ageScore = 1
  else ageScore = 0.5

  // Signalements (25%)
  const reportScore = Math.max(0, 5 - input.reportsReceived * 0.5)

  // Respect des regles (25%)
  const violationScore = Math.max(0, 5 - input.confirmedViolations * 2)

  // Activite (25%)
  const activityRaw = Math.min(
    5,
    (Math.min(input.positiveInteractions, 100) / 20) +
    (Math.min(input.contentsPublished, 20) / 5) +
    (Math.min(input.investmentsMade, 10) / 3)
  )

  // Score final pondere
  const rawScore = (ageScore * 0.25) + (reportScore * 0.25) + (violationScore * 0.25) + (activityRaw * 0.25)

  // Arrondi a 0.5 pres
  const score = Math.round(rawScore * 2) / 2

  const stars = Math.floor(score)
  const halfStar = score % 1 !== 0

  let level: TrustScoreResult["level"]
  if (score >= 4.5) level = "elite"
  else if (score >= 3.5) level = "expert"
  else if (score >= 2.5) level = "confirme"
  else if (score >= 1.5) level = "fiable"
  else level = "debutant"

  // Boost de visibilite : 1.0 a 1.5 selon score
  const visibilityBoost = 1.0 + (score / 10)

  return {
    score,
    stars,
    halfStar,
    level,
    visibilityBoost,
    eligibleForBonus: score >= 3.5,
  }
}

// ──────────────────────────────────────────────
// R6. LIMITATION STOCKAGE CREATEURS
// ──────────────────────────────────────────────

export const STORAGE_LIMITS = {
  creator: {
    label: "Porteur (videos)",
    maxPerYear: 10,
    overagePriceEurCents: 100, // 1 EUR/video
    unit: "video",
  },
  podcasteur: {
    label: "Podcasteur (episodes)",
    maxPerYear: 20,
    overagePriceEurCents: 50, // 0.50 EUR/episode
    unit: "episode",
  },
} as const

export type StorageLimitRole = keyof typeof STORAGE_LIMITS

export interface StorageCheckResult {
  allowed: boolean
  withinQuota: boolean
  used: number
  limit: number
  overageRequired: boolean
  overagePriceCents: number
  reason?: string
}

/**
 * Verifie si un createur peut publier un nouveau contenu.
 * Si le quota annuel est depasse, un paiement est requis.
 */
export function checkStorageLimit(
  role: StorageLimitRole,
  usedThisYear: number
): StorageCheckResult {
  const config = STORAGE_LIMITS[role]
  const withinQuota = usedThisYear < config.maxPerYear

  if (withinQuota) {
    return {
      allowed: true,
      withinQuota: true,
      used: usedThisYear,
      limit: config.maxPerYear,
      overageRequired: false,
      overagePriceCents: 0,
    }
  }

  return {
    allowed: true, // Autorise mais avec paiement
    withinQuota: false,
    used: usedThisYear,
    limit: config.maxPerYear,
    overageRequired: true,
    overagePriceCents: config.overagePriceEurCents,
    reason: `Quota annuel atteint (${config.maxPerYear} ${config.unit}s/an). Publication supplementaire : ${(config.overagePriceEurCents / 100).toFixed(2)} EUR par ${config.unit}.`,
  }
}

// ──────────────────────────────────────────────
// R7. PROTECTION MEDIAS (TOKEN TEMPORAIRE)
// ──────────────────────────────────────────────

export interface MediaToken {
  token: string
  contentId: string
  userId: string
  expiresAt: number // Unix timestamp (ms)
  issuedAt: number
}

/** Duree de validite d'un token media (4 heures) */
export const MEDIA_TOKEN_TTL_MS = 4 * 60 * 60 * 1000

/**
 * Genere un token temporaire pour l'acces a un media.
 * En production : signe via HMAC-SHA256 cote serveur.
 * Ici : generation deterministe pour le moteur.
 */
export function generateMediaToken(contentId: string, userId: string): MediaToken {
  const now = Date.now()
  const raw = `${contentId}:${userId}:${now}:${Math.random().toString(36).slice(2)}`
  // En prod : crypto.createHmac('sha256', secret).update(raw).digest('hex')
  const token = btoa(raw).replace(/[+/=]/g, (c) =>
    c === "+" ? "-" : c === "/" ? "_" : ""
  )

  return {
    token,
    contentId,
    userId,
    issuedAt: now,
    expiresAt: now + MEDIA_TOKEN_TTL_MS,
  }
}

/**
 * Verifie la validite d'un token media.
 */
export function validateMediaToken(
  token: MediaToken,
  contentId: string,
  userId: string
): { valid: boolean; reason?: string } {
  if (token.contentId !== contentId) {
    return { valid: false, reason: "Token invalide pour ce contenu." }
  }
  if (token.userId !== userId) {
    return { valid: false, reason: "Token invalide pour cet utilisateur." }
  }
  if (Date.now() > token.expiresAt) {
    return { valid: false, reason: "Token expire. Veuillez recharger la page." }
  }
  return { valid: true }
}

// ──────────────────────────────────────────────
// R9. PROMOTION EXTERNE
// ──────────────────────────────────────────────

export interface PromotionConsent {
  userId: string
  contentId: string
  consentGiven: boolean
  consentDate?: string
  platforms: ("twitter" | "instagram" | "youtube" | "tiktok" | "other")[]
}

/**
 * Verifie si un contenu peut etre promu exterieurement.
 * L'autorisation explicite de l'utilisateur est obligatoire.
 */
export function canPromoteExternally(consent: PromotionConsent | null): {
  allowed: boolean
  reason?: string
} {
  if (!consent) {
    return {
      allowed: false,
      reason: "Aucune autorisation de promotion externe enregistree pour ce contenu.",
    }
  }
  if (!consent.consentGiven) {
    return {
      allowed: false,
      reason: "L'utilisateur n'a pas autorise la promotion externe de ce contenu.",
    }
  }
  return { allowed: true }
}

// ──────────────────────────────────────────────
// R10. DECLARATION DE PROPRIETE INTELLECTUELLE
// ──────────────────────────────────────────────

export interface IPDeclaration {
  userId: string
  contentId: string
  declared: boolean
  declarationText: string
  declaredAt: string
}

/** Texte de la declaration obligatoire */
export const IP_DECLARATION_TEXT =
  "Je certifie etre titulaire des droits sur l'oeuvre deposee et autorise sa diffusion sur la plateforme VIXUAL."

/**
 * Verifie si la declaration de propriete a ete effectuee.
 * Publication impossible sans cette declaration.
 */
export function checkIPDeclaration(
  declaration: IPDeclaration | null
): { valid: boolean; reason?: string } {
  if (!declaration) {
    return {
      valid: false,
      reason: "Declaration de propriete intellectuelle obligatoire avant toute publication.",
    }
  }
  if (!declaration.declared) {
    return {
      valid: false,
      reason: "Vous devez cocher la declaration de propriete pour publier ce contenu.",
    }
  }
  return { valid: true }
}

// ──────────────────────────────────────────────
// R11. ADMIN DISTINCT (rappel)
// ──────────────────────────────────────────────

/**
 * L'administrateur VIXUAL n'est pas un profil utilisateur.
 * Il dispose de droits specifiques :
 * - Bloquer des comptes
 * - Geler des fonds en cas de fraude
 * - Supprimer du contenu
 * - Gerer les tags VIXUAL Social
 *
 * Voir lib/admin-guard.ts pour l'implementation.
 */
export const ADMIN_CAPABILITIES = [
  "block_account",
  "freeze_funds",
  "delete_content",
  "manage_tags",
  "view_reports",
  "manage_batches",
  "override_trust_score",
] as const

export type AdminCapability = (typeof ADMIN_CAPABILITIES)[number]
