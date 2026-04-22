/**
 * VIXUAL Creator Progression Module
 * 
 * Systeme de progression pour les profils createurs (porteur/infoporteur/podcasteur)
 * Sans recompense financiere - uniquement visibilite, prestige et statut
 */

// ─── Types ───

// VERROU FINAL: cles officielles
export type CreatorType = "creator" | "infoporteur" | "podcasteur"

export type CreatorLevelKey = "starter" | "active" | "confirmed" | "influential" | "elite"

export interface CreatorLevel {
  level: number
  key: CreatorLevelKey
  name: string
  badge: string
  badgeColor: string
  boost: number
  minScore: number
  description: string
}

export interface CreatorStats {
  views: number
  engagement: number
  contributions: number
  regularity: number
  reliability: number
  growth: number
  totalContents: number
  weeklyPublications: number
  interactions: number
}

export interface CreatorProgressState {
  userId: string
  creatorType: CreatorType
  level: number
  levelKey: CreatorLevelKey
  score: number
  badge: string
  badgeColor: string
  proUnlocked: boolean
  lastUpdated: string
}

export interface ProgressGoal {
  id: string
  label: string
  current: number
  target: number
  progress: number
  priority: "high" | "medium" | "low"
  icon: string
}

export interface ContentImpact {
  contentId: string
  contentTitle: string
  pointsToday: number
  pointsTotal: number
  message: string
  trend: "up" | "stable" | "down"
}

export interface ProgressHistory {
  id: string
  date: string
  scoreBefore: number
  scoreAfter: number
  levelBefore: number
  levelAfter: number
  reason: string
  contentId?: string
}

export type ProgressUpdateReason =
  | "publication_validated"
  | "engagement_increase"
  | "contribution_increase"
  | "daily_batch"
  | "manual_admin_recalc"
  | "week_activity_bonus"

// ─── Constants ───

export const CREATOR_LEVELS: CreatorLevel[] = [
  { 
    level: 1, 
    key: "starter", 
    name: "Createur Debutant", 
    badge: "Nouveau", 
    badgeColor: "emerald",
    boost: 1.0,
    minScore: 0,
    description: "Bienvenue ! Commencez a publier pour progresser."
  },
  { 
    level: 2, 
    key: "active", 
    name: "Createur Actif", 
    badge: "Actif", 
    badgeColor: "sky",
    boost: 1.1,
    minScore: 100,
    description: "Votre activite reguliere porte ses fruits."
  },
  { 
    level: 3, 
    key: "confirmed", 
    name: "Createur Confirme", 
    badge: "Confirme", 
    badgeColor: "purple",
    boost: 1.25,
    minScore: 300,
    description: "Votre presence est reconnue par la communaute."
  },
  { 
    level: 4, 
    key: "influential", 
    name: "Createur Influant", 
    badge: "Influant", 
    badgeColor: "amber",
    boost: 1.5,
    minScore: 600,
    description: "Votre impact sur la plateforme est significatif."
  },
  { 
    level: 5, 
    key: "elite", 
    name: "Elite VIXUAL", 
    badge: "Elite VIXUAL", 
    badgeColor: "rose",
    boost: 2.0,
    minScore: 1000,
    description: "Vous faites partie des meilleurs createurs de VIXUAL !"
  },
]

// Score weights for progression calculation
export const SCORE_WEIGHTS = {
  views: 0.20,
  engagement: 0.25,
  contributions: 0.25,
  regularity: 0.10,
  reliability: 0.10,
  growth: 0.10,
}

// ─── Core Functions ───

/**
 * Calculate creator progress score from stats
 */
export function calculateCreatorProgressScore(stats: CreatorStats): number {
  return Math.round(
    stats.views * SCORE_WEIGHTS.views +
    stats.engagement * SCORE_WEIGHTS.engagement +
    stats.contributions * SCORE_WEIGHTS.contributions +
    stats.regularity * SCORE_WEIGHTS.regularity +
    stats.reliability * SCORE_WEIGHTS.reliability +
    stats.growth * SCORE_WEIGHTS.growth
  )
}

/**
 * Get creator level from score
 */
export function calculateCreatorLevel(score: number): number {
  if (score >= 1000) return 5
  if (score >= 600) return 4
  if (score >= 300) return 3
  if (score >= 100) return 2
  return 1
}

/**
 * Get level info from level number
 */
export function getLevelInfo(level: number): CreatorLevel {
  return CREATOR_LEVELS[Math.min(Math.max(level - 1, 0), CREATOR_LEVELS.length - 1)]
}

/**
 * Calculate progress to next level (0-100%)
 */
export function calculateProgressToNextLevel(score: number, currentLevel: number): number {
  if (currentLevel >= 5) return 100 // Already at max level
  
  const currentLevelInfo = getLevelInfo(currentLevel)
  const nextLevelInfo = getLevelInfo(currentLevel + 1)
  
  const scoreInCurrentLevel = score - currentLevelInfo.minScore
  const scoreNeededForNext = nextLevelInfo.minScore - currentLevelInfo.minScore
  
  return Math.min(100, Math.round((scoreInCurrentLevel / scoreNeededForNext) * 100))
}

/**
 * Calculate points needed to reach next level
 */
export function getPointsToNextLevel(score: number, currentLevel: number): number {
  if (currentLevel >= 5) return 0
  
  const nextLevelInfo = getLevelInfo(currentLevel + 1)
  return Math.max(0, nextLevelInfo.minScore - score)
}

/**
 * Check if creator can access PRO page
 */
export function canAccessCreatorProPage(creatorLevel: number): boolean {
  return creatorLevel >= 5
}

/**
 * Build dynamic goals for creator progression
 */
export function buildCreatorGoals(stats: CreatorStats, currentLevel: number): ProgressGoal[] {
  const goals: ProgressGoal[] = []
  
  // Publication goal
  if (stats.weeklyPublications < 2) {
    goals.push({
      id: "weekly_publication",
      label: "Publier au moins 2 contenus cette semaine",
      current: stats.weeklyPublications,
      target: 2,
      progress: Math.round((stats.weeklyPublications / 2) * 100),
      priority: "high",
      icon: "upload"
    })
  }
  
  // Interaction goal
  const interactionTarget = currentLevel < 3 ? 50 : currentLevel < 5 ? 100 : 200
  if (stats.interactions < interactionTarget) {
    goals.push({
      id: "interactions",
      label: `Atteindre ${interactionTarget} interactions`,
      current: stats.interactions,
      target: interactionTarget,
      progress: Math.round((stats.interactions / interactionTarget) * 100),
      priority: stats.interactions < interactionTarget * 0.5 ? "high" : "medium",
      icon: "message-circle"
    })
  }
  
  // Contribution goal
  const contributionTarget = currentLevel < 3 ? 10 : currentLevel < 5 ? 30 : 50
  if (stats.contributions < contributionTarget) {
    goals.push({
      id: "contributions",
      label: `Recevoir ${contributionTarget} soutiens`,
      current: stats.contributions,
      target: contributionTarget,
      progress: Math.round((stats.contributions / contributionTarget) * 100),
      priority: "medium",
      icon: "heart"
    })
  }
  
  // Views goal
  const viewsTarget = currentLevel < 3 ? 500 : currentLevel < 5 ? 2000 : 5000
  if (stats.views < viewsTarget) {
    goals.push({
      id: "views",
      label: `Atteindre ${viewsTarget.toLocaleString()} vues`,
      current: stats.views,
      target: viewsTarget,
      progress: Math.round((stats.views / viewsTarget) * 100),
      priority: "low",
      icon: "eye"
    })
  }
  
  // Regularity goal
  if (stats.regularity < 80) {
    goals.push({
      id: "regularity",
      label: "Maintenir une regularite de publication",
      current: Math.round(stats.regularity),
      target: 80,
      progress: Math.round((stats.regularity / 80) * 100),
      priority: "medium",
      icon: "calendar"
    })
  }
  
  return goals.slice(0, 4) // Max 4 goals displayed
}

/**
 * Get impact message for content
 */
export function getContentImpactMessage(impact: ContentImpact): string {
  if (impact.trend === "up" && impact.pointsToday > 10) {
    return "Ce contenu booste fortement votre progression !"
  }
  if (impact.trend === "up") {
    return "Ce contenu contribue positivement a votre progression."
  }
  if (impact.trend === "stable" && impact.pointsTotal > 50) {
    return "Ce contenu est un pilier stable de votre profil."
  }
  if (impact.trend === "down") {
    return "L'engagement sur ce contenu diminue."
  }
  return "Continuez a promouvoir ce contenu pour progresser."
}

/**
 * Generate AI-like tips based on stats
 */
export function generateCreatorTips(stats: CreatorStats, level: number): string[] {
  const tips: string[] = []
  
  if (stats.regularity < 50) {
    tips.push("Votre progression est freinee par un manque de regularite. Essayez de publier plus souvent.")
  }
  
  if (stats.engagement > stats.views * 0.1) {
    tips.push("Votre taux d'engagement est excellent ! Continuez ainsi.")
  } else if (stats.views > 100 && stats.engagement < stats.views * 0.05) {
    tips.push("Votre contenu attire des vues mais peu d'engagement. Travaillez l'interactivite.")
  }
  
  if (stats.contributions > 0 && stats.totalContents > 1) {
    const avgContributions = stats.contributions / stats.totalContents
    if (avgContributions > 5) {
      tips.push("Vos contenus attirent beaucoup de soutiens. Vous etes sur la bonne voie !")
    }
  }
  
  if (stats.growth > 20) {
    tips.push("Votre croissance recente est impressionnante. Maintenez ce rythme !")
  } else if (stats.growth < 0) {
    tips.push("Votre activite a diminue recemment. Un nouveau contenu pourrait relancer votre progression.")
  }
  
  if (level < 5 && stats.weeklyPublications >= 2) {
    tips.push("Votre regularite de publication est excellente cette semaine !")
  }
  
  return tips.slice(0, 3) // Max 3 tips
}

/**
 * Get trend icon based on percentage change
 */
export function getTrendInfo(change: number): { direction: "up" | "down" | "stable"; color: string; label: string } {
  if (change > 5) return { direction: "up", color: "emerald", label: `+${change}%` }
  if (change < -5) return { direction: "down", color: "red", label: `${change}%` }
  return { direction: "stable", color: "slate", label: "stable" }
}

// ─── Mock Data Functions ───

export function getMockCreatorStats(userId: string, creatorType: CreatorType): CreatorStats {
  // Simulated stats based on user ID hash
  const seed = userId.charCodeAt(0) + userId.charCodeAt(userId.length - 1)
  
  return {
    views: 250 + (seed * 23) % 2000,
    engagement: 30 + (seed * 7) % 150,
    contributions: 5 + (seed * 3) % 40,
    regularity: 40 + (seed * 2) % 60,
    reliability: 60 + (seed % 40),
    growth: -10 + (seed % 40),
    totalContents: 2 + (seed % 8),
    weeklyPublications: seed % 4,
    interactions: 20 + (seed * 5) % 100,
  }
}

export function getMockCreatorProgress(userId: string, creatorType: CreatorType): CreatorProgressState {
  const stats = getMockCreatorStats(userId, creatorType)
  const score = calculateCreatorProgressScore(stats)
  const level = calculateCreatorLevel(score)
  const levelInfo = getLevelInfo(level)
  
  return {
    userId,
    creatorType,
    level,
    levelKey: levelInfo.key,
    score,
    badge: levelInfo.badge,
    badgeColor: levelInfo.badgeColor,
    proUnlocked: canAccessCreatorProPage(level),
    lastUpdated: new Date().toISOString(),
  }
}

export function getMockContentImpacts(userId: string): ContentImpact[] {
  return [
    {
      contentId: "content_1",
      contentTitle: "Mon premier film",
      pointsToday: 14,
      pointsTotal: 87,
      message: "Ce contenu booste fortement votre progression !",
      trend: "up"
    },
    {
      contentId: "content_2", 
      contentTitle: "Making-of du tournage",
      pointsToday: 6,
      pointsTotal: 42,
      message: "Ce contenu contribue positivement.",
      trend: "stable"
    },
    {
      contentId: "content_3",
      contentTitle: "Teaser du projet",
      pointsToday: 2,
      pointsTotal: 28,
      message: "L'engagement diminue sur ce contenu.",
      trend: "down"
    },
  ]
}

export function getMockProgressHistory(userId: string): ProgressHistory[] {
  const now = new Date()
  return [
    {
      id: "h1",
      date: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      scoreBefore: 280,
      scoreAfter: 305,
      levelBefore: 2,
      levelAfter: 3,
      reason: "Passage au niveau Confirme !",
    },
    {
      id: "h2",
      date: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      scoreBefore: 265,
      scoreAfter: 280,
      levelBefore: 2,
      levelAfter: 2,
      reason: "Nouveau contenu publie",
      contentId: "content_1"
    },
    {
      id: "h3",
      date: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      scoreBefore: 240,
      scoreAfter: 265,
      levelBefore: 2,
      levelAfter: 2,
      reason: "Pic d'engagement",
    },
    {
      id: "h4",
      date: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      scoreBefore: 95,
      scoreAfter: 110,
      levelBefore: 1,
      levelAfter: 2,
      reason: "Passage au niveau Actif !",
    },
  ]
}
