/**
 * VIXUAL VISIBILITY ENGINE
 * Version: V1
 * 
 * Moteur de récompense par la visibilité.
 * Slogan: VIXUAL — Regarde-Soutiens-Participe
 * 
 * La visibilité devient une récompense:
 * - plus saine que l'argent
 * - plus alignée avec l'écosystème VIXUAL
 * - plus utile aux créateurs et aux profils actifs
 */

// ── Types ──

export type VisibilityLevel = "base" | "boosted" | "strong" | "premium";

export type VisibilityProfile = {
  userId: string;
  role: string;
  visibilityScore: number;
  visibilityLevel: VisibilityLevel;
  trustScore: number;
  engagementScore: number;
  promotionScore: number;
  consistencyScore: number;
  contentPerformanceScore: number;
  isBoostBlocked: boolean;
  blockReason?: string;
  badges: VisibilityBadge[];
  updatedAt: Date;
};

export type VisibilityBadge = {
  id: string;
  name: string;
  icon: "star" | "rocket" | "fire" | "crown";
  level: VisibilityLevel;
  awardedAt: Date;
};

export type VisibilityBoost = {
  id: string;
  targetId: string;
  targetType: "profile" | "project" | "content";
  boostType: "explorer" | "trending" | "discover" | "homepage" | "seo_social";
  startedAt: Date;
  expiresAt: Date;
  isActive: boolean;
};

export type AntiGamingAlert = {
  id: string;
  userId: string;
  alertType: "fake_shares" | "artificial_clicks" | "empty_comments" | "multi_account" | "spike_interactions" | "artificial_push" | "score_inflation";
  severity: "low" | "medium" | "high" | "critical";
  description: string;
  detectedAt: Date;
  resolved: boolean;
};

// ── Constants ──

export const VISIBILITY_LEVELS: Record<VisibilityLevel, { min: number; max: number; label: string; color: string }> = {
  base: { min: 0, max: 24, label: "Base", color: "slate" },
  boosted: { min: 25, max: 49, label: "Boostée", color: "emerald" },
  strong: { min: 50, max: 69, label: "Forte", color: "amber" },
  premium: { min: 70, max: 100, label: "Premium", color: "violet" },
};

export const VISIBILITY_WEIGHTS = {
  engagement: 0.35,
  trust: 0.30,
  promotion: 0.20,
  consistency: 0.10,
  performance: 0.05,
} as const;

export const VISIBILITY_BADGES: Record<VisibilityLevel, { name: string; icon: VisibilityBadge["icon"] }> = {
  base: { name: "Visible", icon: "star" },
  boosted: { name: "En progression", icon: "rocket" },
  strong: { name: "Tendance", icon: "fire" },
  premium: { name: "Élite VIXUAL", icon: "crown" },
};

export const TRUST_SCORE_THRESHOLDS = {
  minForBoosted: 50,
  minForStrong: 70,
  minForPremium: 85,
  criticalBlock: 30,
} as const;

// ── Score Calculation ──

/**
 * Calcule le score de visibilité selon la formule officielle:
 * Visibility Score = (Engagement × 35%) + (Trust × 30%) + (Promotion × 20%) + (Régularité × 10%) + (Performance × 5%)
 */
export function computeVisibilityScore(input: {
  engagement: number;
  trust: number;
  promotion: number;
  consistency: number;
  performance: number;
}): number {
  const raw =
    input.engagement * VISIBILITY_WEIGHTS.engagement +
    input.trust * VISIBILITY_WEIGHTS.trust +
    input.promotion * VISIBILITY_WEIGHTS.promotion +
    input.consistency * VISIBILITY_WEIGHTS.consistency +
    input.performance * VISIBILITY_WEIGHTS.performance;

  return Math.round(Math.min(100, Math.max(0, raw)));
}

/**
 * Détermine le niveau de visibilité à partir du score
 */
export function getVisibilityLevel(score: number): VisibilityLevel {
  if (score >= 70) return "premium";
  if (score >= 50) return "strong";
  if (score >= 25) return "boosted";
  return "base";
}

/**
 * Vérifie si un profil peut bénéficier d'un niveau de visibilité donné
 * en fonction de son Trust Score
 */
export function canAccessVisibilityLevel(
  targetLevel: VisibilityLevel,
  trustScore: number
): { allowed: boolean; reason?: string } {
  if (trustScore < TRUST_SCORE_THRESHOLDS.criticalBlock) {
    return {
      allowed: false,
      reason: "Trust Score critique - visibilité bloquée",
    };
  }

  if (targetLevel === "premium" && trustScore < TRUST_SCORE_THRESHOLDS.minForPremium) {
    return {
      allowed: false,
      reason: `Trust Score insuffisant pour Premium (requis: ${TRUST_SCORE_THRESHOLDS.minForPremium})`,
    };
  }

  if (targetLevel === "strong" && trustScore < TRUST_SCORE_THRESHOLDS.minForStrong) {
    return {
      allowed: false,
      reason: `Trust Score insuffisant pour Forte (requis: ${TRUST_SCORE_THRESHOLDS.minForStrong})`,
    };
  }

  if (targetLevel === "boosted" && trustScore < TRUST_SCORE_THRESHOLDS.minForBoosted) {
    return {
      allowed: false,
      reason: `Trust Score insuffisant pour Boostée (requis: ${TRUST_SCORE_THRESHOLDS.minForBoosted})`,
    };
  }

  return { allowed: true };
}

/**
 * Calcule le profil de visibilité complet d'un utilisateur
 */
export function computeVisibilityProfile(input: {
  userId: string;
  role: string;
  engagement: number;
  trust: number;
  promotion: number;
  consistency: number;
  performance: number;
}): VisibilityProfile {
  const score = computeVisibilityScore({
    engagement: input.engagement,
    trust: input.trust,
    promotion: input.promotion,
    consistency: input.consistency,
    performance: input.performance,
  });

  const rawLevel = getVisibilityLevel(score);
  const accessCheck = canAccessVisibilityLevel(rawLevel, input.trust);

  // Si le Trust Score bloque, réduire le niveau
  let finalLevel = rawLevel;
  let isBlocked = false;
  let blockReason: string | undefined;

  if (!accessCheck.allowed) {
    isBlocked = true;
    blockReason = accessCheck.reason;
    // Réduire au niveau autorisé
    if (input.trust < TRUST_SCORE_THRESHOLDS.criticalBlock) {
      finalLevel = "base";
    } else if (input.trust < TRUST_SCORE_THRESHOLDS.minForBoosted) {
      finalLevel = "base";
    } else if (input.trust < TRUST_SCORE_THRESHOLDS.minForStrong) {
      finalLevel = "boosted";
    } else if (input.trust < TRUST_SCORE_THRESHOLDS.minForPremium) {
      finalLevel = "strong";
    }
  }

  // Attribution du badge correspondant
  const badgeInfo = VISIBILITY_BADGES[finalLevel];
  const badges: VisibilityBadge[] = [
    {
      id: `badge-${finalLevel}-${input.userId}`,
      name: badgeInfo.name,
      icon: badgeInfo.icon,
      level: finalLevel,
      awardedAt: new Date(),
    },
  ];

  return {
    userId: input.userId,
    role: input.role,
    visibilityScore: score,
    visibilityLevel: finalLevel,
    trustScore: input.trust,
    engagementScore: input.engagement,
    promotionScore: input.promotion,
    consistencyScore: input.consistency,
    contentPerformanceScore: input.performance,
    isBoostBlocked: isBlocked,
    blockReason,
    badges,
    updatedAt: new Date(),
  };
}

// ── Anti-Gaming Detection ──

export type GamingIndicators = {
  shareVelocity: number; // partages/heure
  clickPattern: "organic" | "suspicious" | "artificial";
  commentQuality: number; // 0-100
  accountAge: number; // jours
  interactionSpike: boolean;
  multiAccountSignals: boolean;
  engagementWithoutContent: boolean;
};

/**
 * Détecte les comportements de gaming potentiels
 */
export function detectGamingBehavior(indicators: GamingIndicators): AntiGamingAlert | null {
  const alerts: { type: AntiGamingAlert["alertType"]; severity: AntiGamingAlert["severity"]; desc: string }[] = [];

  // Faux partages (vélocité anormale)
  if (indicators.shareVelocity > 20) {
    alerts.push({
      type: "fake_shares",
      severity: indicators.shareVelocity > 50 ? "critical" : "high",
      desc: `Vélocité de partage anormale: ${indicators.shareVelocity}/h`,
    });
  }

  // Clics artificiels
  if (indicators.clickPattern === "artificial") {
    alerts.push({
      type: "artificial_clicks",
      severity: "high",
      desc: "Pattern de clics détecté comme artificiel",
    });
  } else if (indicators.clickPattern === "suspicious") {
    alerts.push({
      type: "artificial_clicks",
      severity: "medium",
      desc: "Pattern de clics suspect",
    });
  }

  // Commentaires vides ou répétés
  if (indicators.commentQuality < 20) {
    alerts.push({
      type: "empty_comments",
      severity: indicators.commentQuality < 10 ? "high" : "medium",
      desc: `Qualité des commentaires très faible: ${indicators.commentQuality}/100`,
    });
  }

  // Multi-comptes
  if (indicators.multiAccountSignals) {
    alerts.push({
      type: "multi_account",
      severity: "critical",
      desc: "Signaux de multi-comptes coordonnés détectés",
    });
  }

  // Pics anormaux d'interactions
  if (indicators.interactionSpike) {
    alerts.push({
      type: "spike_interactions",
      severity: "medium",
      desc: "Pic anormal d'interactions détecté",
    });
  }

  // Inflation de score sans engagement réel
  if (indicators.engagementWithoutContent) {
    alerts.push({
      type: "score_inflation",
      severity: "high",
      desc: "Inflation de score sans contenu/engagement réel",
    });
  }

  // Retourner l'alerte la plus sévère
  if (alerts.length === 0) return null;

  const severityOrder: AntiGamingAlert["severity"][] = ["critical", "high", "medium", "low"];
  const sorted = alerts.sort(
    (a, b) => severityOrder.indexOf(a.severity) - severityOrder.indexOf(b.severity)
  );

  const worst = sorted[0];
  return {
    id: `alert-${Date.now()}`,
    userId: "", // à remplir par l'appelant
    alertType: worst.type,
    severity: worst.severity,
    description: worst.desc,
    detectedAt: new Date(),
    resolved: false,
  };
}

// ── Boost Management ──

/**
 * Détermine les zones de boost disponibles pour un niveau de visibilité
 */
export function getAvailableBoostZones(level: VisibilityLevel): VisibilityBoost["boostType"][] {
  switch (level) {
    case "premium":
      return ["explorer", "trending", "discover", "homepage", "seo_social"];
    case "strong":
      return ["explorer", "trending", "discover"];
    case "boosted":
      return ["explorer", "discover"];
    case "base":
    default:
      return ["explorer"];
  }
}

/**
 * Calcule les critères manquants pour atteindre le niveau suivant
 */
export function getMissingCriteria(profile: VisibilityProfile): string[] {
  const missing: string[] = [];
  const nextLevel = getNextLevel(profile.visibilityLevel);

  if (!nextLevel) return ["Niveau maximum atteint"];

  const requiredScore = VISIBILITY_LEVELS[nextLevel].min;
  const scoreGap = requiredScore - profile.visibilityScore;

  if (scoreGap > 0) {
    missing.push(`Augmenter le score de ${scoreGap} points`);
  }

  // Vérifier Trust Score requis
  const trustRequired =
    nextLevel === "premium"
      ? TRUST_SCORE_THRESHOLDS.minForPremium
      : nextLevel === "strong"
      ? TRUST_SCORE_THRESHOLDS.minForStrong
      : TRUST_SCORE_THRESHOLDS.minForBoosted;

  if (profile.trustScore < trustRequired) {
    missing.push(`Trust Score > ${trustRequired} (actuel: ${profile.trustScore})`);
  }

  // Suggestions d'amélioration
  if (profile.engagementScore < 70) {
    missing.push("Générer plus d'engagement réel");
  }
  if (profile.promotionScore < 50) {
    missing.push("Partager du contenu de qualité");
  }
  if (profile.consistencyScore < 60) {
    missing.push("Maintenir une activité régulière");
  }

  return missing;
}

function getNextLevel(current: VisibilityLevel): VisibilityLevel | null {
  const order: VisibilityLevel[] = ["base", "boosted", "strong", "premium"];
  const idx = order.indexOf(current);
  return idx < order.length - 1 ? order[idx + 1] : null;
}

// ── Ticket Gold Boost ──

export interface TicketGoldBoost {
  isActive: boolean;
  expiresAt?: Date;
  boostMultiplier: number;
}

/**
 * Calcule le score de visibilite avec boost Ticket Gold
 * Formule: visibility = base + engagement + freshness + boost
 * boost = base * 0.5 (si Ticket Gold actif)
 */
export function computeVisibilityWithTicketGold(
  baseScore: number,
  engagementBonus: number,
  freshnessBonus: number,
  ticketGold?: TicketGoldBoost
): { finalScore: number; boostApplied: number; hasTicketGold: boolean } {
  const baseWithBonuses = baseScore + engagementBonus + freshnessBonus;
  
  let boostApplied = 0;
  let hasTicketGold = false;
  
  if (ticketGold?.isActive && ticketGold.expiresAt && new Date(ticketGold.expiresAt) > new Date()) {
    boostApplied = Math.round(baseScore * ticketGold.boostMultiplier);
    hasTicketGold = true;
  }
  
  const finalScore = Math.min(100, baseWithBonuses + boostApplied);
  
  return { finalScore, boostApplied, hasTicketGold };
}

// ── UI Helpers ──

export function getVisibilityLevelColor(level: VisibilityLevel): string {
  return VISIBILITY_LEVELS[level].color;
}

export function getVisibilityLevelLabel(level: VisibilityLevel): string {
  return VISIBILITY_LEVELS[level].label;
}

export function getBadgeIcon(icon: VisibilityBadge["icon"]): string {
  switch (icon) {
    case "star":
      return "Star";
    case "rocket":
      return "Rocket";
    case "fire":
      return "Flame";
    case "crown":
      return "Crown";
  }
}

// ── Explorer Labels ──

export const EXPLORER_LABELS = {
  progression: "Ce profil gagne en visibilité",
  project: "Projet en progression",
  supported: "Très soutenu cette semaine",
  recommended: "Contenu recommandé par la communauté",
  trending: "Tendance",
  discover: "À découvrir",
  spotlight: "Mis en lumière par VIXUAL",
} as const;

// ── Dashboard Messages ──

export const UI_MESSAGES = {
  profileProgression: "Votre visibilité progresse grâce à votre activité et à votre fiabilité.",
  projectProgression: "Ce projet gagne en visibilité grâce à l'engagement de la communauté.",
  creatorTip: "La visibilité est une récompense méritée : plus votre projet est sain, utile et suivi, plus il remonte.",
} as const;
