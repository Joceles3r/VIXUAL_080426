/**
 * VIXUAL Trust Score -- Type Definitions
 *
 * 4-level system based on a 0-100 score.
 */

export type TrustLevel = "newcomer" | "member" | "trusted" | "verified";

export interface TrustProfile {
  userId: string;
  score: number;
  level: TrustLevel;
  lastUpdate: string | null;
}

export interface TrustEvent {
  id?: string;
  userId: string;
  eventType: TrustEventType;
  delta: number;
  reason: string;
  metadata?: Record<string, unknown>;
  createdAt?: string;
}

export type TrustEventType =
  // Positive events
  | "email_verified"
  | "phone_verified"
  | "kyc_verified"
  | "first_investment"
  | "content_validated"
  | "regular_login"
  | "streak_7_days"
  | "streak_30_days"
  | "guardian_approved"
  | "profile_completed"
  | "referral_success"
  // Negative events
  | "fraud_detected"
  | "chargeback"
  | "spam_reported"
  | "abuse_reported"
  | "payment_failed"
  | "content_rejected"
  | "suspension_warning"
  | "suspension_temporary"
  | "suspension_permanent"
  | "inactivity_90_days"
  // Admin events
  | "admin_boost"
  | "admin_penalty";

export const TRUST_LEVEL_THRESHOLDS: Record<TrustLevel, { min: number; max: number }> = {
  newcomer: { min: 0, max: 29 },
  member: { min: 30, max: 59 },
  trusted: { min: 60, max: 79 },
  verified: { min: 80, max: 100 },
};

export const TRUST_LEVEL_LABELS: Record<TrustLevel, string> = {
  newcomer: "Nouveau",
  member: "Membre",
  trusted: "Fiable",
  verified: "Verifie",
};

export function scoreToLevel(score: number): TrustLevel {
  if (score >= 80) return "verified";
  if (score >= 60) return "trusted";
  if (score >= 30) return "member";
  return "newcomer";
}

// ── Extended Types (from trust-system.ts consolidation) ──

export type TrustScoreLevel = "exemplary" | "very_reliable" | "correct" | "to_watch" | "at_risk";

/**
 * Full TrustScore with detailed components (for display)
 */
export interface TrustScore {
  userId: string;
  score: number; // 0-100
  level: TrustScoreLevel;
  lastUpdated: string;
  components: {
    identityVerified: number; // 25% max
    transactionHistory: number; // 20% max
    communityParticipation: number; // 15% max
    seniority: number; // 15% max
    socialBehavior: number; // 10% max
    financialReliability: number; // 10% max
    communityBonus: number; // 5% max
  };
  badges: BadgeType[];
  warnings: string[];
  riskFlags: string[];
}

export type BadgeType =
  | "identity_verified"
  | "active_contributor"
  | "recognized_creator"
  | "top_contributor"
  | "project_promising"
  | "elite_creator"
  | "premium_contributor"
  | "vixual_ambassador";

export interface TrustBadge {
  id: BadgeType;
  displayName: string;
  description: string;
  icon: string;
  color: string;
  rarity: "common" | "uncommon" | "rare" | "legendary";
  requirements: string[];
}

export const TRUST_BADGES: Record<BadgeType, TrustBadge> = {
  identity_verified: {
    id: "identity_verified",
    displayName: "Identite verifiee",
    description: "Email, telephone et Stripe Connect confirmes",
    icon: "CheckCircle",
    color: "text-emerald-400",
    rarity: "common",
    requirements: ["Email confirme", "Telephone confirme", "Stripe Connect valide"],
  },
  active_contributor: {
    id: "active_contributor",
    displayName: "Contributeur actif",
    description: "Participation reguliere a la communaute",
    icon: "Flame",
    color: "text-orange-400",
    rarity: "uncommon",
    requirements: ["5+ contributions", "Score >= 60", "Aucun litige"],
  },
  recognized_creator: {
    id: "recognized_creator",
    displayName: "Createur reconnu",
    description: "Createur avec contenu valorise par la communaute",
    icon: "Star",
    color: "text-amber-400",
    rarity: "uncommon",
    requirements: ["10+ contenus", "Score >= 70", "Aucun probleme signale"],
  },
  top_contributor: {
    id: "top_contributor",
    displayName: "Top Contributeur",
    description: "Classe dans le TOP 10 des contributeurs",
    icon: "Trophy",
    color: "text-amber-300",
    rarity: "rare",
    requirements: ["TOP 10 des contributions", "Score >= 80", "Historique clean"],
  },
  project_promising: {
    id: "project_promising",
    displayName: "Projet prometteur",
    description: "Projet avec fort potentiel et engagement communautaire",
    icon: "Rocket",
    color: "text-sky-400",
    rarity: "uncommon",
    requirements: ["TOP 20 des projets", "100+ contributeurs", "Score >= 70"],
  },
  elite_creator: {
    id: "elite_creator",
    displayName: "Createur elite",
    description: "Createur d'exception avec reconnaissance etablie",
    icon: "Crown",
    color: "text-purple-400",
    rarity: "rare",
    requirements: ["50+ contenus reussis", "Score >= 85", "TOP 10 historique"],
  },
  premium_contributor: {
    id: "premium_contributor",
    displayName: "Contributeur premium",
    description: "Contributeur fidele avec un historique de soutiens exemplaire",
    icon: "Gem",
    color: "text-pink-400",
    rarity: "rare",
    requirements: ["1000+ EUR contribues", "Score >= 85", "Aucun litige"],
  },
  vixual_ambassador: {
    id: "vixual_ambassador",
    displayName: "Ambassadeur VIXUAL",
    description: "Acteur cle de la communaute VIXUAL",
    icon: "Users",
    color: "text-teal-400",
    rarity: "legendary",
    requirements: ["Score >= 90", "Contribution communautaire exceptionnelle", "Validation VIXUAL"],
  },
};

/**
 * Get detailed level from score (5-level system for display)
 */
export function scoreToDetailedLevel(score: number): TrustScoreLevel {
  if (score >= 90) return "exemplary";
  if (score >= 75) return "very_reliable";
  if (score >= 60) return "correct";
  if (score >= 40) return "to_watch";
  return "at_risk";
}

export const TRUST_SCORE_RANGES = {
  exemplary: { min: 90, max: 100, label: "Profil exemplaire", color: "text-emerald-400" },
  very_reliable: { min: 75, max: 89, label: "Profil tres fiable", color: "text-teal-400" },
  correct: { min: 60, max: 74, label: "Profil correct", color: "text-blue-400" },
  to_watch: { min: 40, max: 59, label: "Profil en meilleure progression", color: "text-amber-400" },
  at_risk: { min: 0, max: 39, label: "Profil doit faire ses preuves", color: "text-rose-400" },
} as const;
