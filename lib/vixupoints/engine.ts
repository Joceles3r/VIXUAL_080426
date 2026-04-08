/**
 * VIXUAL - VIXUpoints Engine V1
 * 
 * Module officiel pour le systeme de points d'engagement VIXUAL.
 * Conforme au MODULE ACCES GRATUIT VIXUAL V1.
 * 
 * PRINCIPES:
 * - Le contenu reste payant
 * - L'acces gratuit est merite, limite et controle
 * - VIXUpoints = mesure d'engagement (pas une monnaie)
 * 
 * PROFILS BENEFICIAIRES:
 * - visiteurs majeurs
 * - visiteurs mineurs
 * - contribu-lecteurs
 * - auditeurs
 * 
 * PROFILS NON CONCERNES:
 * - porteurs
 * - infoporteurs
 * - podcasteurs
 */

// ── Mode V1 ──
export const VIXUPOINTS_MODE = "V1" as const;

// En V1: accumulation OK, utilisation limitee, retrait interdit
export const VIXUPOINTS_V1_RULES = {
  accumulation: true,
  utilization: "limited", // Pass Decouverte uniquement
  withdrawal: false,
} as const;

// ── Conversion affichee (non active en V1) ──
export const VIXUPOINTS_PER_EUR = 100; // 100 VIXUpoints = 1 EUR (affichage uniquement)

// ── Limites anti-abus ──
export const DAILY_VIXUPOINTS_CAP = 100;  // Max 100 pts/jour
export const WEEKLY_VIXUPOINTS_CAP = 500; // Max 500 pts/semaine

// ── Gains d'engagement ──
export const VIXUPOINTS_GAINS = {
  signup: 50,              // Inscription
  activeViewing: 5,        // Visionnage actif (extrait)
  fullContentView: 15,     // Contenu complet (via Pass)
  interaction: 10,         // Like/commentaire
  share: 15,               // Partage
  contribution: 20,        // Contribution financiere (bonus %)
  dailyLogin: 3,           // Connexion quotidienne
  referral: 40,            // Parrainage reussi
} as const;

// ── Profils beneficiaires ──
export const ELIGIBLE_PROFILES = [
  "visitor",
  "visitor_minor",
  "visitor_adult",
  "contribureader",
  "auditor",
] as const;

export const INELIGIBLE_PROFILES = [
  "porter",
  "infoporter",
  "podcaster",
  "contributor", // Contributeur = euros uniquement
] as const;

export type EligibleProfile = (typeof ELIGIBLE_PROFILES)[number];
export type IneligibleProfile = (typeof INELIGIBLE_PROFILES)[number];

// ── Configuration par profil ──
export interface ProfileVixupointsConfig {
  canEarnVixupoints: boolean;
  canUseDiscoveryPass: boolean;
  dailyCap: number;
  totalCap: number | null; // null = pas de plafond
  canConvertToEuros: boolean; // Toujours false en V1
}

export const PROFILE_CONFIG: Record<string, ProfileVixupointsConfig> = {
  visitor: {
    canEarnVixupoints: true,
    canUseDiscoveryPass: true,
    dailyCap: DAILY_VIXUPOINTS_CAP,
    totalCap: 5000,
    canConvertToEuros: false,
  },
  visitor_adult: {
    canEarnVixupoints: true,
    canUseDiscoveryPass: true,
    dailyCap: DAILY_VIXUPOINTS_CAP,
    totalCap: 5000,
    canConvertToEuros: false,
  },
  visitor_minor: {
    canEarnVixupoints: true,
    canUseDiscoveryPass: true,
    dailyCap: DAILY_VIXUPOINTS_CAP,
    totalCap: 10000,
    canConvertToEuros: false,
  },
  contribureader: {
    canEarnVixupoints: true,
    canUseDiscoveryPass: true,
    dailyCap: DAILY_VIXUPOINTS_CAP,
    totalCap: 5000,
    canConvertToEuros: false,
  },
  auditor: {
    canEarnVixupoints: true,
    canUseDiscoveryPass: true,
    dailyCap: DAILY_VIXUPOINTS_CAP,
    totalCap: 5000,
    canConvertToEuros: false,
  },
  porter: {
    canEarnVixupoints: false,
    canUseDiscoveryPass: false,
    dailyCap: 0,
    totalCap: null,
    canConvertToEuros: false,
  },
  infoporter: {
    canEarnVixupoints: false,
    canUseDiscoveryPass: false,
    dailyCap: 0,
    totalCap: null,
    canConvertToEuros: false,
  },
  podcaster: {
    canEarnVixupoints: false,
    canUseDiscoveryPass: false,
    dailyCap: 0,
    totalCap: null,
    canConvertToEuros: false,
  },
  contributor: {
    canEarnVixupoints: false,
    canUseDiscoveryPass: false,
    dailyCap: 0,
    totalCap: null,
    canConvertToEuros: false,
  },
};

// ── Verifications eligibilite ──

export function isEligibleForVixupoints(profile: string): boolean {
  return ELIGIBLE_PROFILES.includes(profile as EligibleProfile);
}

export function getProfileConfig(profile: string): ProfileVixupointsConfig {
  return PROFILE_CONFIG[profile] || PROFILE_CONFIG.visitor;
}

// ── Credit VIXUpoints avec plafonds ──

export interface CreditResult {
  success: boolean;
  newBalance: number;
  pointsCredited: number;
  pointsLost: number;
  dailyCapHit: boolean;
  totalCapHit: boolean;
  message: string;
}

export function creditVixupoints(
  currentBalance: number,
  pointsToAdd: number,
  dailyEarnedToday: number,
  profile: string
): CreditResult {
  const config = getProfileConfig(profile);
  
  if (!config.canEarnVixupoints) {
    return {
      success: false,
      newBalance: currentBalance,
      pointsCredited: 0,
      pointsLost: pointsToAdd,
      dailyCapHit: false,
      totalCapHit: false,
      message: "Ce profil ne peut pas gagner de VIXUpoints.",
    };
  }
  
  let remaining = pointsToAdd;
  let dailyCapHit = false;
  let totalCapHit = false;
  
  // 1. Verifier plafond journalier
  const dailyRoom = Math.max(0, config.dailyCap - dailyEarnedToday);
  if (remaining > dailyRoom) {
    remaining = dailyRoom;
    dailyCapHit = true;
  }
  
  // 2. Verifier plafond total
  if (config.totalCap !== null) {
    const totalRoom = Math.max(0, config.totalCap - currentBalance);
    if (remaining > totalRoom) {
      remaining = totalRoom;
      totalCapHit = true;
    }
  }
  
  const pointsCredited = Math.max(0, remaining);
  const newBalance = currentBalance + pointsCredited;
  const pointsLost = pointsToAdd - pointsCredited;
  
  let message = `+${pointsCredited} VIXUpoints`;
  if (dailyCapHit) message += " (plafond journalier atteint)";
  if (totalCapHit) message += " (plafond total atteint)";
  
  return {
    success: pointsCredited > 0,
    newBalance,
    pointsCredited,
    pointsLost,
    dailyCapHit,
    totalCapHit,
    message,
  };
}

// ══════════════════════════════════════════════════
// PASS DECOUVERTE VIXUAL
// ══════════════════════════════════════════════════

export interface DiscoveryPassStatus {
  isUnlocked: boolean;
  isUsed: boolean;
  canUnlock: boolean;
  unlockProgress: number; // 0-100
  unlockRequirements: {
    excerptViews: { current: number; required: number };
    vixupoints: { current: number; required: number };
    interactions: { current: number; required: number };
  };
  resetAt: Date; // Minuit
}

// Conditions de deblocage du Pass
export const DISCOVERY_PASS_REQUIREMENTS = {
  excerptViews: 2,    // Regarder 2 extraits
  vixupoints: 20,     // OU gagner 20 VIXUpoints
  interactions: 1,    // OU interagir (like/commentaire)
} as const;

/**
 * Verifie si l'utilisateur peut debloquer son Pass Decouverte
 */
export function checkDiscoveryPassUnlock(
  excerptViewsToday: number,
  vixupointsEarnedToday: number,
  interactionsToday: number
): { canUnlock: boolean; progress: number; method: string | null } {
  // Methode 1: 2 extraits
  if (excerptViewsToday >= DISCOVERY_PASS_REQUIREMENTS.excerptViews) {
    return { canUnlock: true, progress: 100, method: "excerpts" };
  }
  
  // Methode 2: 20 VIXUpoints
  if (vixupointsEarnedToday >= DISCOVERY_PASS_REQUIREMENTS.vixupoints) {
    return { canUnlock: true, progress: 100, method: "vixupoints" };
  }
  
  // Methode 3: 1 interaction
  if (interactionsToday >= DISCOVERY_PASS_REQUIREMENTS.interactions) {
    return { canUnlock: true, progress: 100, method: "interaction" };
  }
  
  // Calculer la progression
  const excerptProgress = (excerptViewsToday / DISCOVERY_PASS_REQUIREMENTS.excerptViews) * 100;
  const vixupointsProgress = (vixupointsEarnedToday / DISCOVERY_PASS_REQUIREMENTS.vixupoints) * 100;
  const interactionProgress = (interactionsToday / DISCOVERY_PASS_REQUIREMENTS.interactions) * 100;
  
  const maxProgress = Math.max(excerptProgress, vixupointsProgress, interactionProgress);
  
  return { canUnlock: false, progress: Math.min(maxProgress, 99), method: null };
}

/**
 * Statut complet du Pass Decouverte pour un utilisateur
 */
export function getDiscoveryPassStatus(
  isUnlocked: boolean,
  isUsed: boolean,
  excerptViewsToday: number,
  vixupointsEarnedToday: number,
  interactionsToday: number
): DiscoveryPassStatus {
  const unlockCheck = checkDiscoveryPassUnlock(
    excerptViewsToday,
    vixupointsEarnedToday,
    interactionsToday
  );
  
  // Reset a minuit
  const now = new Date();
  const resetAt = new Date(now);
  resetAt.setHours(24, 0, 0, 0);
  
  return {
    isUnlocked,
    isUsed,
    canUnlock: !isUnlocked && !isUsed && unlockCheck.canUnlock,
    unlockProgress: unlockCheck.progress,
    unlockRequirements: {
      excerptViews: {
        current: excerptViewsToday,
        required: DISCOVERY_PASS_REQUIREMENTS.excerptViews,
      },
      vixupoints: {
        current: vixupointsEarnedToday,
        required: DISCOVERY_PASS_REQUIREMENTS.vixupoints,
      },
      interactions: {
        current: interactionsToday,
        required: DISCOVERY_PASS_REQUIREMENTS.interactions,
      },
    },
    resetAt,
  };
}

/**
 * Debloquer le Pass Decouverte
 */
export function unlockDiscoveryPass(
  excerptViewsToday: number,
  vixupointsEarnedToday: number,
  interactionsToday: number
): { success: boolean; method: string | null } {
  const check = checkDiscoveryPassUnlock(
    excerptViewsToday,
    vixupointsEarnedToday,
    interactionsToday
  );
  return { success: check.canUnlock, method: check.method };
}

/**
 * Consommer le Pass Decouverte (acces a 1 contenu complet)
 */
export function consumeDiscoveryPass(isUnlocked: boolean, isUsed: boolean): {
  success: boolean;
  message: string;
} {
  if (!isUnlocked) {
    return { success: false, message: "Pass non debloque. Completez les objectifs du jour." };
  }
  if (isUsed) {
    return { success: false, message: "Pass deja utilise aujourd'hui. Revenez demain !" };
  }
  return { success: true, message: "Pass consomme ! Profitez de votre contenu gratuit." };
}

// ══════════════════════════════════════════════════
// ANTI-ABUS
// ══════════════════════════════════════════════════

export interface AbuseDetectionResult {
  riskScore: number; // 0-100
  flags: string[];
  blocked: boolean;
  message: string | null;
}

export function detectAbuse(
  dailyEarnings: number[], // 7 derniers jours
  totalBalance: number,
  accountAgeDays: number,
  deviceFingerprint: string | null,
  ipAddress: string | null
): AbuseDetectionResult {
  const flags: string[] = [];
  let riskScore = 0;
  
  // Flag 1: Plafond journalier atteint tous les jours
  const daysAtCap = dailyEarnings.filter(d => d >= DAILY_VIXUPOINTS_CAP).length;
  if (daysAtCap >= 7) {
    riskScore += 30;
    flags.push("daily_cap_7_consecutive_days");
  } else if (daysAtCap >= 5) {
    riskScore += 15;
    flags.push("daily_cap_5_days");
  }
  
  // Flag 2: Balance elevee pour un compte recent
  if (accountAgeDays < 7 && totalBalance > 400) {
    riskScore += 25;
    flags.push("new_account_high_balance");
  }
  
  // Flag 3: Pattern constant (bot)
  const uniqueValues = new Set(dailyEarnings.filter(d => d > 0)).size;
  if (dailyEarnings.filter(d => d > 0).length >= 5 && uniqueValues <= 2) {
    riskScore += 25;
    flags.push("bot_like_pattern");
  }
  
  // Flag 4: Multi-compte potentiel (si IP/device deja vu)
  // Note: Cette verification necessite une BDD externe
  
  const blocked = riskScore >= 70;
  const message = blocked 
    ? "Activite suspecte detectee. Contactez le support."
    : riskScore >= 40 
      ? "Votre activite est surveillee."
      : null;
  
  return {
    riskScore: Math.min(100, riskScore),
    flags,
    blocked,
    message,
  };
}

// ══════════════════════════════════════════════════
// EXTRAITS ETENDUS
// ══════════════════════════════════════════════════

export type ExtractType = "short" | "extended";

export function getExtractType(
  isActive: boolean, // Utilisateur actif aujourd'hui
  hasInteracted: boolean
): ExtractType {
  if (isActive || hasInteracted) {
    return "extended";
  }
  return "short";
}

export const EXTRACT_DURATION = {
  short: 30,      // 30 secondes
  extended: 90,   // 90 secondes (1min30)
} as const;

// ══════════════════════════════════════════════════
// MESSAGES PEDAGOGIQUES
// ══════════════════════════════════════════════════

export const PEDAGOGIC_MESSAGES = {
  welcome: "Gagnez des VIXUpoints en explorant VIXUAL",
  passUnlock: "Debloquez chaque jour un acces gratuit",
  engagement: "Decouvrez plus en vous impliquant",
  conversion: "100 VIXUpoints = 1 EUR (utilisation future en V2)",
} as const;

// ══════════════════════════════════════════════════
// OBJECTIFS QUOTIDIENS
// ══════════════════════════════════════════════════

export interface DailyObjective {
  id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  reward: number; // VIXUpoints
  completed: boolean;
}

export function getDailyObjectives(
  excerptViewsToday: number,
  interactionsToday: number,
  passUnlocked: boolean
): DailyObjective[] {
  return [
    {
      id: "watch_excerpts",
      title: "Regarder 2 contenus",
      description: "Visionnez 2 extraits de projets",
      target: 2,
      current: excerptViewsToday,
      reward: 10,
      completed: excerptViewsToday >= 2,
    },
    {
      id: "interact",
      title: "Interagir 1 fois",
      description: "Likez ou commentez un contenu",
      target: 1,
      current: interactionsToday,
      reward: 10,
      completed: interactionsToday >= 1,
    },
    {
      id: "unlock_pass",
      title: "Debloquer votre Pass",
      description: "Completez les objectifs pour obtenir un acces gratuit",
      target: 1,
      current: passUnlocked ? 1 : 0,
      reward: 15,
      completed: passUnlocked,
    },
  ];
}

// ══════════════════════════════════════════════════
// EVOLUTION V2/V3 (non active)
// ══════════════════════════════════════════════════

export const FUTURE_FEATURES = {
  V2: {
    partialUtilization: "Utilisation partielle VIXUpoints pour achats",
    hybridAccess: "Acces hybride (VIXUpoints + euros)",
    contributionBonus: "Bonus VIXUpoints sur contributions",
  },
  V3: {
    fullEconomy: "Economie complete VIXUpoints",
    withdrawals: "Retraits actives (conversion euros)",
    advancedSystem: "Systeme avance de recompenses",
  },
} as const;
