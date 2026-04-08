/**
 * VIXUAL Feature Flags System
 * 
 * Controle centralisé des fonctionnalités par version.
 * Permet d'activer/désactiver des features sans redéploiement.
 * 
 * Versions:
 * - V1: Core platform (contribution, cycles, payouts)
 * - V2: Advanced features (VIXUpoints, hybrid payments)
 * - V3: Social & AI features
 */

// ─── Feature Flag Types ───

export type FeatureFlag = 
  | "referralSystem"
  | "youtubeAuto"
  | "watermark"
  | "vixupoints"
  | "hybridPayment"
  | "socialFeatures"
  | "aiModeration"
  | "hubSpoke"
  | "promoEmail"
  | "trustScore"
  | "ticketGold"
  | "minorProtection"

export type FeatureVersion = "V1" | "V2" | "V3"

export interface FeatureConfig {
  enabled: boolean
  version: FeatureVersion
  description: string
  rolloutPercentage?: number // 0-100 for gradual rollout
}

// ─── Feature Flags Configuration ───

export const FEATURES: Record<FeatureFlag, FeatureConfig> = {
  // V1 - Core Features (Actifs)
  referralSystem: {
    enabled: true,
    version: "V1",
    description: "Systeme de parrainage et liens de partage",
  },
  promoEmail: {
    enabled: true,
    version: "V1",
    description: "Emails promotionnels et reengagement",
  },
  trustScore: {
    enabled: true,
    version: "V1",
    description: "Score de confiance utilisateur",
  },
  minorProtection: {
    enabled: true,
    version: "V1",
    description: "Protection et restrictions pour les mineurs",
  },
  watermark: {
    enabled: true,
    version: "V1",
    description: "Watermark 'Propulse par VIXUAL' sur les contenus",
  },
  
  // V2 - Advanced Features (VIXUpoints + Hybrid Payment)
  vixupoints: {
    enabled: true,
    version: "V2",
    description: "Systeme de points VIXUpoints",
  },
  hybridPayment: {
    enabled: true,
    version: "V2",
    description: "Paiement hybride EUR + VIXUpoints",
  },
  youtubeAuto: {
    enabled: false,
    version: "V2",
    description: "Publication automatique sur YouTube",
    rolloutPercentage: 0,
  },
  hubSpoke: {
    enabled: false,
    version: "V2",
    description: "Hub & Spoke - Contenu utilisateur amplifie",
    rolloutPercentage: 0,
  },
  
  // V3 - Ticket Gold + Social Features
  ticketGold: {
    enabled: true,
    version: "V3",
    description: "Ticket Gold - boost visibilite temporaire 48h (1x/mois/projet)",
  },
  socialFeatures: {
    enabled: false,
    version: "V3",
    description: "Fonctionnalites sociales avancees",
  },
  aiModeration: {
    enabled: false,
    version: "V3",
    description: "Moderation automatique par IA",
  },
}

// ─── Feature Flag Helpers ───

/**
 * Check if a feature is enabled
 */
export function isFeatureEnabled(flag: FeatureFlag): boolean {
  const config = FEATURES[flag]
  if (!config) return false
  
  // Check rollout percentage if defined
  if (config.rolloutPercentage !== undefined && config.rolloutPercentage < 100) {
    // For gradual rollout, use a deterministic check based on user
    // In real implementation, this would use user ID hash
    return config.enabled && Math.random() * 100 < config.rolloutPercentage
  }
  
  return config.enabled
}

/**
 * Check if a feature is enabled for a specific user (for gradual rollout)
 */
export function isFeatureEnabledForUser(flag: FeatureFlag, userId: string): boolean {
  const config = FEATURES[flag]
  if (!config || !config.enabled) return false
  
  if (config.rolloutPercentage !== undefined && config.rolloutPercentage < 100) {
    // Use user ID hash for deterministic rollout
    const hash = hashUserId(userId)
    return hash < config.rolloutPercentage
  }
  
  return true
}

/**
 * Get all features for a specific version
 */
export function getFeaturesByVersion(version: FeatureVersion): Record<FeatureFlag, FeatureConfig> {
  return Object.fromEntries(
    Object.entries(FEATURES).filter(([, config]) => config.version === version)
  ) as Record<FeatureFlag, FeatureConfig>
}

/**
 * Get all enabled features
 */
export function getEnabledFeatures(): FeatureFlag[] {
  return Object.entries(FEATURES)
    .filter(([, config]) => config.enabled)
    .map(([flag]) => flag as FeatureFlag)
}

// ─── Utility Functions ───

function hashUserId(userId: string): number {
  let hash = 0
  for (let i = 0; i < userId.length; i++) {
    const char = userId.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  return Math.abs(hash % 100)
}

// ─── React Hook for Feature Flags ───

export function useFeatureFlag(flag: FeatureFlag): boolean {
  return isFeatureEnabled(flag)
}

// ─── Admin Feature Flag Management ───

export interface FeatureFlagUpdate {
  flag: FeatureFlag
  enabled: boolean
  rolloutPercentage?: number
}

/**
 * Update feature flag (admin only)
 * In production, this would persist to database
 */
export function updateFeatureFlag(update: FeatureFlagUpdate): boolean {
  if (!FEATURES[update.flag]) return false
  
  FEATURES[update.flag].enabled = update.enabled
  if (update.rolloutPercentage !== undefined) {
    FEATURES[update.flag].rolloutPercentage = update.rolloutPercentage
  }
  
  return true
}
