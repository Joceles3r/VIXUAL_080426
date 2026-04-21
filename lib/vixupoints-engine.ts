/**
 * VIXUAL - VIXUpoints Engine
 *
 * DEFINITION: Les VIXUpoints sont des points de participation attribues aux utilisateurs
 * pour leur activite positive sur la plateforme VIXUAL.
 *
 * CONVERSION OFFICIELLE: 100 VIXUpoints = 1 EUR
 *
 * Les VIXUpoints permettent:
 * - d'acceder a des contenus
 * - d'encourager la participation communautaire
 * - de soutenir indirectement les createurs
 *
 * Les VIXUpoints ne constituent PAS une monnaie, ni un produit financier.
 *
 * REGLES PAR PROFIL:
 * - Visiteur mineur: VIXUpoints UNIQUEMENT (pas d'euros, pas de paiement hybride)
 * - Visiteur majeur: VIXUpoints + Euros + Paiement hybride
 * - Contributeur: Euros UNIQUEMENT (pas de VIXUpoints, pas de paiement hybride)
 * - Contribu-lecteur: VIXUpoints + Euros + Paiement hybride
 * - Auditeur: VIXUpoints + Euros + Paiement hybride
 * - Porteur/Infoporteur/Podcasteur: NE beneficient PAS des VIXUpoints ni du paiement hybride
 *
 * LIMITES ANTI-ABUS:
 * - Maximum 100 VIXUpoints par jour
 * - Maximum 500 VIXUpoints par semaine
 * - Plafond mineur: 10 000 VIXUpoints
 * - Plafond visiteur majeur: 2 500 VIXUpoints
 */

// ─── Types ───

export type ParentConsentStatus =
  | "not_required"
  | "required"
  | "pending"
  | "verified"
  | "rejected"

export interface ParentConsent {
  status: ParentConsentStatus
  acceptedByGuardian: boolean
  acceptedAt?: string
  guardianEmail?: string
  guardianName?: string
  documentUrl?: string
  documentType?: "id" | "family_record_book" | "court_order" | "other"
  verificationNote?: string
  verifiedAt?: string
  verifiedBy?: string
}

export interface UserVixupointsProfile {
  userId: string
  birthDate?: string
  isMinor: boolean
  vixupointsBalance: number
  vixupointsCap: number
  parentConsent: ParentConsent
  kycVerified: boolean
}

// ─── Constants ───

/** Conversion officielle: 100 VIXUpoints = 1 EUR - source unique depuis payout/constants */
import { VIXUPOINTS_PER_EUR } from "@/lib/payout/constants"
export { VIXUPOINTS_PER_EUR }

export const MINOR_VIXUPOINTS_CAP = 10_000
export const ADULT_VISITOR_CAP = 2_500
export const MINOR_MIN_AGE = 16
export const MAJORITY_AGE = 18

/** Limites anti-abus */
export const DAILY_VIXUPOINTS_CAP = 100    // Max 100 VIXUpoints par jour
export const WEEKLY_VIXUPOINTS_CAP = 500   // Max 500 VIXUpoints par semaine

/** Actions pour gagner des VIXUpoints (visiteurs mineurs) */
export const VIXUPOINTS_ACTIONS = {
  viewExcerpt: 5,           // Visionner un extrait
  viewFullContent: 15,      // Visionner un contenu complet
  usefulComment: 5,         // Commentaire utile sur Vixual Social
  appreciatedComment: 10,   // Commentaire apprecie
  shareContent: 10,         // Partage d'un contenu VIXUAL
  referralSignup: 40,       // Inscription via partage
} as const

/** Profile-based caps and permissions - VERROU FINAL: cles officielles */
export const PROFILE_VIXUPOINTS_CONFIG: Record<string, {
  canUseVixupoints: boolean
  canPayEuros: boolean
  canUseHybrid: boolean
  cap: number
  capType: "total" | "monthly"
}> = {
  guest: { canUseVixupoints: false, canPayEuros: false, canUseHybrid: false, cap: 0, capType: "total" },
  visitor_minor: { canUseVixupoints: true, canPayEuros: false, canUseHybrid: false, cap: 10_000, capType: "total" },
  visitor_adult: { canUseVixupoints: true, canPayEuros: true, canUseHybrid: true, cap: 2_500, capType: "total" },
  visitor: { canUseVixupoints: true, canPayEuros: true, canUseHybrid: true, cap: 2_500, capType: "total" },
  creator: { canUseVixupoints: false, canPayEuros: false, canUseHybrid: false, cap: 0, capType: "total" },
  contributor: { canUseVixupoints: false, canPayEuros: true, canUseHybrid: false, cap: 0, capType: "total" },
  infoporteur: { canUseVixupoints: false, canPayEuros: false, canUseHybrid: false, cap: 0, capType: "total" },
  podcasteur: { canUseVixupoints: false, canPayEuros: false, canUseHybrid: false, cap: 0, capType: "total" },
  auditeur: { canUseVixupoints: true, canPayEuros: true, canUseHybrid: true, cap: 2_500, capType: "total" },
  contribu_lecteur: { canUseVixupoints: true, canPayEuros: true, canUseHybrid: true, cap: 2_500, capType: "total" },
}

/** Message pedagogique VIXUAL */
export const VIXUPOINTS_PEDAGOGIC_MESSAGE = "Les VIXUpoints recompensent votre participation a la communaute VIXUAL. Decouvrez les contenus, encouragez les createurs et utilisez vos points pour acceder a de nouvelles experiences."

/** Message limite proche */
export const VIXUPOINTS_LIMIT_WARNING = "Vous approchez de la limite de VIXUpoints. Decouvrez de nouveaux contenus pour les utiliser."

// ─── Compatibility Exports ───
// These are aliases for backward compatibility with existing code

export const VIXUPOINTS_CONVERSION_THRESHOLD = 2500
export const VIXUPOINTS_MAX_DAILY = DAILY_VIXUPOINTS_CAP
export const VIXUPOINTS_PROFILE_CAPS = {
  visitor_minor: { cap: 10_000, maxDaily: 100, canWithdraw: false },
  visitor_adult: { cap: 2_500, maxDaily: 100, canWithdraw: false },
  visitor: { cap: 2_500, maxDaily: 100, canWithdraw: false },
  auditeur: { cap: 2_500, maxDaily: 100, canWithdraw: true },
  contribu_lecteur: { cap: 2_500, maxDaily: 100, canWithdraw: true },
} as const

/** Alias pour compatibilite avec creditVisupointsCapped */
export const PROFILE_CAPS: Record<string, { cap: number }> = {
  visitor_minor: { cap: 10_000 },
  visitor_adult: { cap: 2_500 },
  visitor: { cap: 2_500 },
  auditeur: { cap: 2_500 },
  contribu_lecteur: { cap: 2_500 },
}

// ─── Micro-Packs VIXUpoints ───

export interface VixupointsPack {
  id: string
  name: string
  priceEur: number
  basePoints: number
  bonusPercent: number
  totalPoints: number
  popular?: boolean
  description: string
}

/** Micro-packs officiels VIXUpoints */
export const VIXUPOINTS_PACKS: VixupointsPack[] = [
  {
    id: "micro",
    name: "Micro Pack",
    priceEur: 5,
    basePoints: 500,
    bonusPercent: 10,
    totalPoints: 550,
    description: "Ideal pour debloquer quelques contenus"
  },
  {
    id: "starter",
    name: "Starter Pack",
    priceEur: 10,
    basePoints: 1000,
    bonusPercent: 15,
    totalPoints: 1150,
    popular: true,
    description: "Le choix populaire pour les visiteurs actifs"
  },
  {
    id: "creator",
    name: "Creator Pack",
    priceEur: 20,
    basePoints: 2000,
    bonusPercent: 20,
    totalPoints: 2400,
    description: "Pour soutenir vos createurs preferes"
  },
  {
    id: "community",
    name: "Community Pack",
    priceEur: 50,
    basePoints: 5000,
    bonusPercent: 30,
    totalPoints: 6500,
    description: "Maximum de valeur pour les passionnes"
  },
]

/** Profils autorises a acheter des micro-packs - cles officielles */
export const MICROPACKS_ELIGIBLE_PROFILES = [
  "visitor_minor",
  "visitor_adult",
  "visitor",
  "auditeur",
  "contribu_lecteur",
] as const

/** Verifie si un profil peut acheter des micro-packs */
export function canBuyMicropacks(profile: string): boolean {
  return MICROPACKS_ELIGIBLE_PROFILES.includes(profile as any)
}

/** Limites anti-abus pour les achats de micro-packs */
export const MICROPACKS_LIMITS = {
  maxPurchasePerDay: 2,           // Max 2 achats par jour
  maxPointsPerDay: 3000,          // Max 3000 VIXUpoints achetes par jour
  maxPurchasePerWeek: 5,          // Max 5 achats par semaine
  maxPointsPerWeek: 10000,        // Max 10000 VIXUpoints achetes par semaine
  minorMaxPerMonth: 2,            // Mineurs: max 2 achats par mois
  minorMaxPointsPerMonth: 1100,   // Mineurs: max 1100 VIXUpoints par mois
} as const

export const DEFAULT_PARENT_CONSENT: ParentConsent = {
  status: "not_required",
  acceptedByGuardian: false,
}

export const MINOR_PARENT_CONSENT: ParentConsent = {
  status: "required",
  acceptedByGuardian: false,
}

// ─── Utilitaires ───

/** Calcule l'age a partir de la date de naissance */
export function computeAge(birthDate: string): number {
  const today = new Date()
  const birth = new Date(birthDate)
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  return age
}

/** Determine si l'utilisateur est mineur */
export function isMinor(birthDate: string): boolean {
  return computeAge(birthDate) < MAJORITY_AGE
}

/** Determine si l'age est suffisant pour s'inscrire (>= 16) */
export function isEligibleForSignup(birthDate: string): boolean {
  const age = computeAge(birthDate)
  return age >= MINOR_MIN_AGE
}

// ─── VIXUpoints operations ───

/** Credite des VIXUpoints en respectant le plafond mineur */
export function creditVixupoints(
  currentBalance: number,
  points: number,
  userIsMinor: boolean
): { newBalance: number; capped: boolean; pointsLost: number } {
  if (userIsMinor) {
    const newBalance = Math.min(currentBalance + points, MINOR_VIXUPOINTS_CAP)
    const actualGain = newBalance - currentBalance
    return {
      newBalance,
      capped: actualGain < points,
      pointsLost: points - actualGain,
    }
  }
  return {
    newBalance: currentBalance + points,
    capped: false,
    pointsLost: 0,
  }
}

/**
 * Credits VIXUpoints with daily cap, profile cap, and minor cap enforcement.
 * Returns the actual points credited and any cap hit.
 */
export function creditVixupointsCapped(
  currentBalance: number,
  pointsToAdd: number,
  dailyEarnedToday: number,
  profile: string,
  userIsMinor: boolean
): {
  newBalance: number;
  actualCredited: number;
  dailyCapHit: boolean;
  profileCapHit: boolean;
  minorCapHit: boolean;
} {
  let remaining = pointsToAdd;

  // 1. Daily cap
  const dailyRoom = Math.max(0, DAILY_VIXUPOINTS_CAP - dailyEarnedToday);
  if (remaining > dailyRoom) remaining = dailyRoom;
  const dailyCapHit = remaining < pointsToAdd;

  // 2. Profile cap
  const profileConfig = PROFILE_CAPS[userIsMinor ? "visitor_minor" : profile] || PROFILE_CAPS.visitor;
  let profileCapHit = false;
  if (profileConfig.cap !== Infinity) {
    const profileRoom = Math.max(0, profileConfig.cap - currentBalance);
    if (remaining > profileRoom) {
      remaining = profileRoom;
      profileCapHit = true;
    }
  }

  // 3. Minor absolute cap
  let minorCapHit = false;
  if (userIsMinor) {
    const minorRoom = Math.max(0, MINOR_VIXUPOINTS_CAP - currentBalance);
    if (remaining > minorRoom) {
      remaining = minorRoom;
      minorCapHit = true;
    }
  }

  const actualCredited = Math.max(0, remaining);

  return {
    newBalance: currentBalance + actualCredited,
    actualCredited,
    dailyCapHit,
    profileCapHit,
    minorCapHit,
  };
}

/**
 * Anti-abuse: detects suspicious VIXUpoints accumulation patterns.
 * Returns a risk score 0-100 and flags.
 */
export function detectVixupointsAbuse(
  dailyEarnings: number[],  // last 7 days of earnings
  totalBalance: number,
  accountAgeDays: number
): {
  riskScore: number;
  flags: string[];
} {
  const flags: string[] = [];
  let riskScore = 0;

  // Flag 1: Hitting daily cap every day for 7 days
  const daysAtCap = dailyEarnings.filter(d => d >= DAILY_VIXUPOINTS_CAP).length;
  if (daysAtCap >= 7) {
    riskScore += 30;
    flags.push("daily_cap_consecutive_7d");
  } else if (daysAtCap >= 5) {
    riskScore += 15;
    flags.push("daily_cap_frequent_5d");
  }

  // Flag 2: Abnormally high balance for account age
  const expectedMaxPerDay = DAILY_VIXUPOINTS_CAP;
  const expectedMax = accountAgeDays * expectedMaxPerDay;
  if (totalBalance > expectedMax * 0.9 && accountAgeDays > 7) {
    riskScore += 25;
    flags.push("balance_near_theoretical_max");
  }

  // Flag 3: Very new account with high balance
  if (accountAgeDays < 3 && totalBalance > 150) {
    riskScore += 20;
    flags.push("new_account_high_balance");
  }

  // Flag 4: Constant earnings (bot-like pattern)
  const uniqueValues = new Set(dailyEarnings.filter(d => d > 0)).size;
  if (dailyEarnings.filter(d => d > 0).length >= 5 && uniqueValues <= 2) {
    riskScore += 25;
    flags.push("constant_earning_pattern");
  }

  return { riskScore: Math.min(100, riskScore), flags };
}

/** Verifie si un utilisateur peut retirer ses gains */
export function canWithdraw(userIsMinor: boolean, kycVerified: boolean): {
  allowed: boolean
  reason?: string
} {
  if (userIsMinor) {
    return {
      allowed: false,
      reason: "Les retraits sont bloqu\u00e9s jusqu'\u00e0 la majorit\u00e9 (18 ans). Vos VIXUpoints seront convertibles \u00e0 vos 18 ans.",
    }
  }
  if (!kycVerified) {
    return {
      allowed: false,
      reason: "V\u00e9rification d'identit\u00e9 (KYC) requise avant tout retrait. Connectez Stripe pour v\u00e9rifier votre identit\u00e9.",
    }
  }
  return { allowed: true }
}

/** Verifie si un utilisateur peut investir */
export function canInvest(userIsMinor: boolean): {
  allowed: boolean
  reason?: string
} {
  if (userIsMinor) {
    return {
      allowed: false,
      reason: "L'investissement n'est pas autoris\u00e9 pour les utilisateurs mineurs (moins de 18 ans).",
    }
  }
  return { allowed: true }
}

/** Verifie si un utilisateur peut convertir ses VIXUpoints en euros */
export function canConvertVixupoints(userIsMinor: boolean): {
  allowed: boolean
  reason?: string
} {
  if (userIsMinor) {
    return {
      allowed: false,
      reason: "La conversion de VIXUpoints en euros n'est pas autoris\u00e9e avant 18 ans.",
    }
  }
  return { allowed: true }
}

// ─── Engagement Redirect Engine ───

export type EngagementRedirectLevel = "none" | "info" | "warning" | "critical"

export interface EngagementRedirectResult {
  level: EngagementRedirectLevel
  title: string
  message: string
  showPathA: boolean // Chemin A : consommer du contenu
  showPathB: boolean // Chemin B : evoluer vers profil avance
}

const ENGAGEMENT_INFO_THRESHOLD = 2_000
const ENGAGEMENT_WARNING_THRESHOLD = 2_300
const ENGAGEMENT_CRITICAL_THRESHOLD = 2_450

/**
 * Moteur d'incitation a l'engagement.
 * Se declenche uniquement pour les Visiteurs majeurs
 * avec 2000+ VIXUpoints.
 *
 * Deux chemins proposes :
 * A) Consommer du contenu (paiement hybride 30% cash min / 70% VIXUpoints max)
 * B) Evoluer vers un profil avance (Investisseur, Auditeur, etc.)
 */
export function engagementRedirectEngine(
  role: string,
  vixupoints: number,
  isUserMinor: boolean
): EngagementRedirectResult | null {
  // Ne s'applique qu'aux visiteurs majeurs
  if (role !== "visitor" || isUserMinor) return null
  if (vixupoints < ENGAGEMENT_INFO_THRESHOLD) return null

  if (vixupoints >= ENGAGEMENT_CRITICAL_THRESHOLD) {
    return {
      level: "critical",
      title: "Vous approchez du plafond de 2 500 pts !",
      message: "Il est temps d'utiliser vos VIXUpoints : consommez du contenu ou passez au niveau sup\u00e9rieur pour d\u00e9bloquer plus de fonctionnalit\u00e9s.",
      showPathA: true,
      showPathB: true,
    }
  }
  if (vixupoints >= ENGAGEMENT_WARNING_THRESHOLD) {
    return {
      level: "warning",
      title: "Vos VIXUpoints s'accumulent !",
      message: "Profitez-en pour acc\u00e9der \u00e0 du contenu premium ou explorez de nouveaux r\u00f4les sur VIXUAL.",
      showPathA: true,
      showPathB: true,
    }
  }
  return {
    level: "info",
    title: "Vous avez d\u00e9j\u00e0 2 000 VIXUpoints !",
    message: "Saviez-vous que vous pouvez utiliser vos points pour acc\u00e9der \u00e0 du contenu ? D\u00e9couvrez les possibilit\u00e9s.",
    showPathA: true,
    showPathB: false,
  }
}

/**
 * Calcule le paiement hybride pour l'achat de contenu (Chemin A).
 * Minimum 30% en euros, maximum 70% en VIXUpoints.
 * Bonus : 5% des points depenses sont regagnes (max 200/mois).
 */
export function computeHybridPurchase(
  priceCents: number,
  userPoints: number,
  bonusUsedThisMonth: number = 0
): {
  cashCents: number
  pointsUsed: number
  bonusEarned: number
  remainingPoints: number
} {
  const cashMinCents = Math.ceil(priceCents * 0.30)
  const pointsPartCents = priceCents - cashMinCents
  // 1 point = 1 centime (100 pts = 1 EUR)
  const pointsNeeded = pointsPartCents
  const pointsUsed = Math.min(pointsNeeded, userPoints)
  const cashCents = priceCents - pointsUsed

  // Bonus 5% plafonné à 200/mois
  const rawBonus = Math.floor(pointsUsed * 0.05)
  const bonusCap = Math.max(0, 200 - bonusUsedThisMonth)
  const bonusEarned = Math.min(rawBonus, bonusCap)

  return {
    cashCents,
    pointsUsed,
    bonusEarned,
    remainingPoints: userPoints - pointsUsed,
  }
}

/** Deblocage automatique a la majorite (a appeler au login) */
export function checkMajorityUnlock(
  profile: UserVixupointsProfile
): UserVixupointsProfile {
  if (!profile.birthDate) return profile
  if (!profile.isMinor) return profile

  if (!isMinor(profile.birthDate)) {
    return {
      ...profile,
      isMinor: false,
      vixupointsCap: Infinity,
      parentConsent: {
        ...profile.parentConsent,
        status: "not_required",
      },
    }
  }
  return profile
}

// ═══════════════════════════════════════════════════════════════════════════
// PASS DÉCOUVERTE — Fonctions et constantes pour le système de discovery pass
// ═══════════════════════════════════════════════════════════════════════════

/** Alias de VIXUPOINTS_ACTIONS pour les composants qui utilisent VIXUPOINTS_GAINS */
export const VIXUPOINTS_GAINS = {
  activeViewing: VIXUPOINTS_ACTIONS.viewExcerpt,        // 5 pts — extrait visionné
  fullContentView: VIXUPOINTS_ACTIONS.viewFullContent,  // 15 pts — contenu complet
  interaction: VIXUPOINTS_ACTIONS.usefulComment,        // 5 pts — interaction
  share: VIXUPOINTS_ACTIONS.shareContent,               // 10 pts — partage
  contribution: 20,                                     // 20 pts — contribution financière
} as const;

/** Messages pédagogiques pour l'UI VIXUpoints */
export const PEDAGOGIC_MESSAGES = {
  welcome: "Bienvenue ! Regardez des extraits, interagissez et accumulez des VIXUpoints.",
  conversion: "100 VIXUpoints = 1 €. Convertissables a partir de 2 500 points (= 25 EUR)",
  dailyCap: "Plafond quotidien atteint. Revenez demain pour continuer a accumuler.",
  passUnlocked: "Pass Decouverte debloque ! Regardez un contenu complet aujourd'hui.",
  passUsed: "Pass utilise aujourd'hui. Revenez demain pour un nouveau pass.",
  /** Alias for passUnlocked - used by visitor page */
  passUnlock: "Completez les objectifs pour debloquer votre acces gratuit quotidien",
  /** Message d'engagement */
  engagement: "Decouvrez des contenus exclusifs",
} as const;

/** Exigences pour débloquer le Pass Découverte */
export const DISCOVERY_PASS_REQUIREMENTS = {
  excerptViews: 3,   // 3 extraits vus
  interactions: 2,   // 2 interactions (commentaires, likes, partages)
  vixupoints: 15,    // 15 VIXUpoints gagnés dans la journée
} as const;

/** Configuration de profil pour l'affichage des VIXUpoints */
export interface ProfileVixupointsDisplay {
  totalCap: number | null;
  dailyCap: number;
  canConvert: boolean;
  canUseHybrid: boolean;
}

/** Retourne la config VIXUpoints d'affichage pour un profil donné */
export function getProfileConfig(profile: string): ProfileVixupointsDisplay {
  const config = PROFILE_VIXUPOINTS_CONFIG[profile] ?? PROFILE_VIXUPOINTS_CONFIG["visitor_adult"];
  return {
    totalCap: config.cap > 0 ? config.cap : null,
    dailyCap: DAILY_VIXUPOINTS_CAP,
    canConvert: config.canUseVixupoints && config.cap > 0,
    canUseHybrid: config.canUseHybrid,
  };
}

/** Vérifie si un profil est éligible aux VIXUpoints */
export function isEligibleForVixupoints(profile: string): boolean {
  const config = PROFILE_VIXUPOINTS_CONFIG[profile];
  return config?.canUseVixupoints === true;
}

/** Statut du Pass Découverte */
export interface DiscoveryPassStatus {
  canUnlock: boolean;
  isUnlocked: boolean;
  isUsed: boolean;
  progress: {
    excerpts: { current: number; required: number };
    interactions: { current: number; required: number };
    vixupoints: { current: number; required: number };
  };
  /** Alias for progress - used by visitor page */
  unlockRequirements: {
    excerptViews: { current: number; required: number };
    interactions: { current: number; required: number };
    vixupoints: { current: number; required: number };
  };
  /** Percentage progress toward unlock (0-100) */
  unlockProgress: number;
  allRequirementsMet: boolean;
}

/** Calcule le statut du Pass Découverte */
export function getDiscoveryPassStatus(
  passUnlocked: boolean,
  passUsed: boolean,
  excerptViewsToday: number,
  vixupointsEarnedToday: number,
  interactionsToday: number
): DiscoveryPassStatus {
  const excerptsOk = excerptViewsToday >= DISCOVERY_PASS_REQUIREMENTS.excerptViews;
  const interactionsOk = interactionsToday >= DISCOVERY_PASS_REQUIREMENTS.interactions;
  const pointsOk = vixupointsEarnedToday >= DISCOVERY_PASS_REQUIREMENTS.vixupoints;
  const allMet = excerptsOk && interactionsOk && pointsOk;

  // Calculate unlock progress percentage (average of all three requirements)
  const excerptProgress = Math.min(excerptViewsToday / DISCOVERY_PASS_REQUIREMENTS.excerptViews, 1) * 100;
  const interactionProgress = Math.min(interactionsToday / DISCOVERY_PASS_REQUIREMENTS.interactions, 1) * 100;
  const pointsProgress = Math.min(vixupointsEarnedToday / DISCOVERY_PASS_REQUIREMENTS.vixupoints, 1) * 100;
  const unlockProgress = Math.round((excerptProgress + interactionProgress + pointsProgress) / 3);

  return {
    canUnlock: allMet && !passUnlocked,
    isUnlocked: passUnlocked,
    isUsed: passUsed,
    allRequirementsMet: allMet,
    unlockProgress,
    progress: {
      excerpts: { current: excerptViewsToday, required: DISCOVERY_PASS_REQUIREMENTS.excerptViews },
      interactions: { current: interactionsToday, required: DISCOVERY_PASS_REQUIREMENTS.interactions },
      vixupoints: { current: vixupointsEarnedToday, required: DISCOVERY_PASS_REQUIREMENTS.vixupoints },
    },
    unlockRequirements: {
      excerptViews: { current: excerptViewsToday, required: DISCOVERY_PASS_REQUIREMENTS.excerptViews },
      interactions: { current: interactionsToday, required: DISCOVERY_PASS_REQUIREMENTS.interactions },
      vixupoints: { current: vixupointsEarnedToday, required: DISCOVERY_PASS_REQUIREMENTS.vixupoints },
    },
  };
}

/** Objectif quotidien du Pass Découverte */
export interface DailyObjective {
  id: string;
  label: string;
  /** Alias for label */
  title: string;
  /** Description detaillee */
  description: string;
  current: number;
  required: number;
  /** Alias for required */
  target: number;
  completed: boolean;
  points: number;
  /** Alias for points */
  reward: number;
}

/** Retourne la liste des objectifs quotidiens */
export function getDailyObjectives(
  excerptViewsToday: number,
  interactionsToday: number,
  passUnlocked: boolean
): DailyObjective[] {
  const excerptPoints = DISCOVERY_PASS_REQUIREMENTS.excerptViews * VIXUPOINTS_GAINS.activeViewing;
  const interactionPoints = DISCOVERY_PASS_REQUIREMENTS.interactions * VIXUPOINTS_GAINS.interaction;
  const passPoints = VIXUPOINTS_GAINS.fullContentView;

  return [
    {
      id: "excerpts",
      label: "Regarder 3 extraits",
      title: "Regarder 3 extraits",
      description: "Visionnez des extraits de contenus pour decouvrir les createurs",
      current: Math.min(excerptViewsToday, DISCOVERY_PASS_REQUIREMENTS.excerptViews),
      required: DISCOVERY_PASS_REQUIREMENTS.excerptViews,
      target: DISCOVERY_PASS_REQUIREMENTS.excerptViews,
      completed: excerptViewsToday >= DISCOVERY_PASS_REQUIREMENTS.excerptViews,
      points: excerptPoints,
      reward: excerptPoints,
    },
    {
      id: "interactions",
      label: "2 interactions",
      title: "2 interactions",
      description: "Likez, commentez ou partagez des contenus",
      current: Math.min(interactionsToday, DISCOVERY_PASS_REQUIREMENTS.interactions),
      required: DISCOVERY_PASS_REQUIREMENTS.interactions,
      target: DISCOVERY_PASS_REQUIREMENTS.interactions,
      completed: interactionsToday >= DISCOVERY_PASS_REQUIREMENTS.interactions,
      points: interactionPoints,
      reward: interactionPoints,
    },
    {
      id: "pass",
      label: "Pass Decouverte",
      title: "Pass Decouverte",
      description: "Debloquez et utilisez votre Pass pour un contenu complet gratuit",
      current: passUnlocked ? 1 : 0,
      required: 1,
      target: 1,
      completed: passUnlocked,
      points: passPoints,
      reward: passPoints,
    },
  ];
}

/** Tente de débloquer le Pass Découverte (validation côté client) */
export function unlockDiscoveryPass(
  excerptViewsToday: number,
  vixupointsEarnedToday: number,
  interactionsToday: number
): { success: boolean; reason?: string } {
  if (excerptViewsToday < DISCOVERY_PASS_REQUIREMENTS.excerptViews) {
    return { success: false, reason: `Il faut ${DISCOVERY_PASS_REQUIREMENTS.excerptViews} extraits vus (actuel: ${excerptViewsToday})` };
  }
  if (interactionsToday < DISCOVERY_PASS_REQUIREMENTS.interactions) {
    return { success: false, reason: `Il faut ${DISCOVERY_PASS_REQUIREMENTS.interactions} interactions (actuel: ${interactionsToday})` };
  }
  if (vixupointsEarnedToday < DISCOVERY_PASS_REQUIREMENTS.vixupoints) {
    return { success: false, reason: `Il faut ${DISCOVERY_PASS_REQUIREMENTS.vixupoints} VIXUpoints gagnés (actuel: ${vixupointsEarnedToday})` };
  }
  return { success: true };
}

/** Tente de consommer le Pass Découverte */
export function consumeDiscoveryPass(
  passUnlocked: boolean,
  passUsed: boolean
): { success: boolean; reason?: string } {
  if (!passUnlocked) return { success: false, reason: "Pass non débloqué" };
  if (passUsed) return { success: false, reason: "Pass déjà utilisé aujourd'hui" };
  return { success: true };
}
