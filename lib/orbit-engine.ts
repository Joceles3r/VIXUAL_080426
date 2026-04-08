/**
 * VIXUAL ORBIT ENGINE
 * Le moteur central de fonctionnement de la plateforme VIXUAL
 * 
 * Missions:
 * 1. Selection des projets
 * 2. Classement des projets
 * 3. Calcul des votes
 * 4. Determination des gagnants
 * 5. Redistribution des gains
 * 6. Surveillance des contributions
 * 7. Controle anti-gaming
 * 8. Coherence economique et juridique
 * 
 * Ce moteur constitue le cerveau mathematique et economique de VIXUAL.
 * 
 * IMPORTANT: Toutes les formules officielles sont centralisees dans /lib/formulas.ts
 */

import {
  DISTRIBUTION_KEY as FORMULAS_DISTRIBUTION_KEY,
  CONTRIBUTION_TO_VOTES as FORMULAS_CONTRIBUTION_TO_VOTES,
  SCORE_WEIGHTS as FORMULAS_SCORE_WEIGHTS,
  CYCLE_THRESHOLD as FORMULAS_CYCLE_THRESHOLD,
  TOP_WINNERS as FORMULAS_TOP_WINNERS,
  calculateUserGain,
  calculateProjectScore as formulasCalculateProjectScore,
  getRankCategory,
  isWinningRank,
  isCommunityRank,
  validateAllFormulas,
} from "./formulas"
import type { Universe } from "@/lib/rules/rule-of-100"

// ─── Types de base ───

export type { Universe }
export type CycleStatus = "open" | "closing" | "closed" | "distributed"
export type ProjectRank = "top10" | "participant" | "unranked"

// ─── Constantes officielles (re-exportees depuis formulas.ts) ───

/** Nombre de projets par cycle */
export const CYCLE_THRESHOLD = FORMULAS_CYCLE_THRESHOLD

/** Nombre de projets gagnants (TOP 10) */
export const TOP_WINNERS = FORMULAS_TOP_WINNERS

/** Cle de repartition officielle */
export const DISTRIBUTION_KEY = FORMULAS_DISTRIBUTION_KEY

/** Table de conversion contribution -> votes */
export const CONTRIBUTION_TO_VOTES = FORMULAS_CONTRIBUTION_TO_VOTES

/** Poids du score projet */
export const SCORE_WEIGHTS = FORMULAS_SCORE_WEIGHTS

// ─── Interfaces ───

export interface Contribution {
  id: string
  userId: string
  projectId: string
  amountEuros: number
  votes: number
  timestamp: string
}

export interface ProjectEngagement {
  views: number
  watchTimeMinutes: number
  reads: number
  listens: number
  interactions: number // likes, comments, shares
}

export interface Project {
  id: string
  title: string
  creatorId: string
  universe: Universe
  cycleId: string
  totalContributions: number
  totalVotes: number
  engagement: ProjectEngagement
  createdAt: string
}

export interface ProjectScore {
  projectId: string
  votesScore: number      // 0-100, normalise
  fundingScore: number    // 0-100, normalise
  engagementScore: number // 0-100, normalise
  globalScore: number     // Score final pondere
  rank: number
  rankCategory: ProjectRank
}

export interface Cycle {
  id: string
  universe: Universe
  status: CycleStatus
  projectCount: number
  totalFunds: number
  openedAt: string
  closedAt: string | null
  distributedAt: string | null
}

export interface GainAllocation {
  recipientId: string
  recipientType: "creator" | "contributor" | "community"
  projectId: string
  amountEuros: number
  percentage: number
}

export interface CycleDistribution {
  cycleId: string
  totalFunds: number
  creatorsShare: number
  contributorsShare: number
  communityShare: number
  platformShare: number
  allocations: GainAllocation[]
}

export interface AntiGamingAlert {
  type: "concentration" | "spike" | "multi_account" | "vixupoints_abuse" | "suspect_behavior"
  severity: "low" | "medium" | "high" | "critical"
  description: string
  affectedUserIds: string[]
  affectedProjectIds: string[]
  detectedAt: string
  resolved: boolean
}

// ─── Fonctions du moteur ───

/**
 * Convertit une contribution en euros en nombre de votes
 * Utilise la table officielle de conversion
 */
export function calculateVotes(contributionEuros: number): number {
  // Trouve la valeur la plus proche dans la table
  const amounts = Object.keys(CONTRIBUTION_TO_VOTES)
    .map(Number)
    .sort((a, b) => b - a)
  
  for (const amount of amounts) {
    if (contributionEuros >= amount) {
      return CONTRIBUTION_TO_VOTES[amount]
    }
  }
  
  // Contribution inferieure au minimum (2€)
  return 0
}

/**
 * Calcule le score d'engagement normalise (0-100)
 */
export function calculateEngagementScore(engagement: ProjectEngagement, universe: Universe): number {
  let score = 0
  
  switch (universe) {
    case "audiovisual":
      // Pour les videos: vues + temps de visionnage + interactions
      score = (
        Math.min(engagement.views / 1000, 40) +
        Math.min(engagement.watchTimeMinutes / 500, 40) +
        Math.min(engagement.interactions / 100, 20)
      )
      break
    case "literary":
      // Pour les livres: lectures + interactions
      score = (
        Math.min(engagement.reads / 500, 60) +
        Math.min(engagement.interactions / 50, 40)
      )
      break
    case "podcast":
      // Pour les podcasts: ecoutes + temps d'ecoute + interactions
      score = (
        Math.min(engagement.listens / 800, 40) +
        Math.min(engagement.watchTimeMinutes / 400, 40) +
        Math.min(engagement.interactions / 80, 20)
      )
      break
  }
  
  return Math.min(Math.round(score), 100)
}

/**
 * Calcule le score global d'un projet selon la formule officielle:
 * Score = (Votes * 50%) + (Financement * 30%) + (Engagement * 20%)
 */
export function calculateProjectScore(
  project: Project,
  maxVotes: number,
  maxFunding: number
): ProjectScore {
  // Normalisation des scores (0-100)
  const votesScore = maxVotes > 0 
    ? Math.round((project.totalVotes / maxVotes) * 100) 
    : 0
  
  const fundingScore = maxFunding > 0 
    ? Math.round((project.totalContributions / maxFunding) * 100) 
    : 0
  
  const engagementScore = calculateEngagementScore(project.engagement, project.universe)
  
  // Score global pondere
  const globalScore = Math.round(
    (votesScore * SCORE_WEIGHTS.votes) +
    (fundingScore * SCORE_WEIGHTS.funding) +
    (engagementScore * SCORE_WEIGHTS.engagement)
  )
  
  return {
    projectId: project.id,
    votesScore,
    fundingScore,
    engagementScore,
    globalScore,
    rank: 0, // Sera defini lors du classement
    rankCategory: "unranked",
  }
}

/**
 * Classe les projets d'un cycle et determine les gagnants
 */
export function rankProjects(projects: Project[]): ProjectScore[] {
  if (projects.length === 0) return []
  
  // Calculer les maximums pour la normalisation
  const maxVotes = Math.max(...projects.map(p => p.totalVotes))
  const maxFunding = Math.max(...projects.map(p => p.totalContributions))
  
  // Calculer les scores
  const scores = projects.map(p => calculateProjectScore(p, maxVotes, maxFunding))
  
  // Trier par score decroissant
  scores.sort((a, b) => b.globalScore - a.globalScore)
  
  // Attribuer les rangs et categories
  scores.forEach((score, index) => {
    score.rank = index + 1
    if (index < TOP_WINNERS) {
      score.rankCategory = "top10"
    } else if (index < CYCLE_THRESHOLD) {
      score.rankCategory = "participant"
    } else {
      score.rankCategory = "unranked"
    }
  })
  
  return scores
}

/**
 * Calcule la repartition des gains d'un cycle
 */
export function calculateDistribution(
  cycleId: string,
  totalFunds: number,
  rankedProjects: ProjectScore[],
  contributions: Contribution[]
): CycleDistribution {
  const allocations: GainAllocation[] = []
  
  // Parts globales
  const creatorsShare = totalFunds * DISTRIBUTION_KEY.creators
  const contributorsShare = totalFunds * DISTRIBUTION_KEY.contributors
  const communityShare = totalFunds * DISTRIBUTION_KEY.community
  const platformShare = totalFunds * DISTRIBUTION_KEY.platform
  
  // Projets TOP 10 (gagnants)
  const top10Projects = rankedProjects.filter(p => p.rankCategory === "top10")
  const totalTop10Score = top10Projects.reduce((sum, p) => sum + p.globalScore, 0)
  
  // Projets 11-100 (communaute)
  const communityProjects = rankedProjects.filter(p => p.rankCategory === "participant")
  const totalCommunityScore = communityProjects.reduce((sum, p) => sum + p.globalScore, 0)
  
  // 1. Repartition pour les createurs gagnants (40%)
  if (totalTop10Score > 0) {
    top10Projects.forEach(project => {
      const share = (project.globalScore / totalTop10Score) * creatorsShare
      allocations.push({
        recipientId: project.projectId, // Le createur recevra via son projet
        recipientType: "creator",
        projectId: project.projectId,
        amountEuros: Math.round(share * 100) / 100,
        percentage: (project.globalScore / totalTop10Score) * DISTRIBUTION_KEY.creators * 100,
      })
    })
  }
  
  // 2. Repartition pour les contributeurs des projets gagnants (30%)
  const top10ProjectIds = new Set(top10Projects.map(p => p.projectId))
  const winningContributions = contributions.filter(c => top10ProjectIds.has(c.projectId))
  const totalWinningContributions = winningContributions.reduce((sum, c) => sum + c.amountEuros, 0)
  
  if (totalWinningContributions > 0) {
    winningContributions.forEach(contribution => {
      const share = (contribution.amountEuros / totalWinningContributions) * contributorsShare
      allocations.push({
        recipientId: contribution.userId,
        recipientType: "contributor",
        projectId: contribution.projectId,
        amountEuros: Math.round(share * 100) / 100,
        percentage: (contribution.amountEuros / totalWinningContributions) * DISTRIBUTION_KEY.contributors * 100,
      })
    })
  }
  
  // 3. Repartition pour la communaute (rang 11-100) (7%)
  if (totalCommunityScore > 0) {
    communityProjects.forEach(project => {
      const share = (project.globalScore / totalCommunityScore) * communityShare
      allocations.push({
        recipientId: project.projectId,
        recipientType: "community",
        projectId: project.projectId,
        amountEuros: Math.round(share * 100) / 100,
        percentage: (project.globalScore / totalCommunityScore) * DISTRIBUTION_KEY.community * 100,
      })
    })
  }
  
  return {
    cycleId,
    totalFunds,
    creatorsShare: Math.round(creatorsShare * 100) / 100,
    contributorsShare: Math.round(contributorsShare * 100) / 100,
    communityShare: Math.round(communityShare * 100) / 100,
    platformShare: Math.round(platformShare * 100) / 100,
    allocations,
  }
}

/**
 * Verifie si un cycle doit etre cloture (100 projets atteints)
 */
export function shouldCloseCycle(projectCount: number): boolean {
  return projectCount >= CYCLE_THRESHOLD
}

/**
 * Detecte les alertes anti-gaming
 */
export function detectAntiGamingAlerts(
  contributions: Contribution[],
  projects: Project[]
): AntiGamingAlert[] {
  const alerts: AntiGamingAlert[] = []
  const now = new Date().toISOString()
  
  // 1. Detection de concentration anormale (>30% des contributions d'un projet par un seul user)
  const contributionsByProject = new Map<string, Contribution[]>()
  contributions.forEach(c => {
    const arr = contributionsByProject.get(c.projectId) || []
    arr.push(c)
    contributionsByProject.set(c.projectId, arr)
  })
  
  contributionsByProject.forEach((projectContribs, projectId) => {
    const totalForProject = projectContribs.reduce((sum, c) => sum + c.amountEuros, 0)
    const byUser = new Map<string, number>()
    
    projectContribs.forEach(c => {
      byUser.set(c.userId, (byUser.get(c.userId) || 0) + c.amountEuros)
    })
    
    byUser.forEach((amount, userId) => {
      if (amount / totalForProject > 0.30) {
        alerts.push({
          type: "concentration",
          severity: amount / totalForProject > 0.50 ? "high" : "medium",
          description: `Concentration anormale: ${Math.round(amount / totalForProject * 100)}% des contributions du projet par un seul utilisateur`,
          affectedUserIds: [userId],
          affectedProjectIds: [projectId],
          detectedAt: now,
          resolved: false,
        })
      }
    })
  })
  
  // 2. Detection de pics soudains (contributions 3x superieures a la moyenne dans les 2h)
  const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  const recentContribs = contributions.filter(c => c.timestamp > twoHoursAgo)
  const olderContribs = contributions.filter(c => c.timestamp <= twoHoursAgo)
  
  if (olderContribs.length > 0) {
    const avgOlder = olderContribs.reduce((sum, c) => sum + c.amountEuros, 0) / olderContribs.length
    const avgRecent = recentContribs.length > 0 
      ? recentContribs.reduce((sum, c) => sum + c.amountEuros, 0) / recentContribs.length 
      : 0
    
    if (avgRecent > avgOlder * 3 && recentContribs.length >= 5) {
      alerts.push({
        type: "spike",
        severity: avgRecent > avgOlder * 5 ? "critical" : "high",
        description: `Pic de contributions detecte: moyenne recente ${avgRecent.toFixed(2)}€ vs moyenne historique ${avgOlder.toFixed(2)}€`,
        affectedUserIds: [...new Set(recentContribs.map(c => c.userId))],
        affectedProjectIds: [...new Set(recentContribs.map(c => c.projectId))],
        detectedAt: now,
        resolved: false,
      })
    }
  }
  
  // 3. Detection de comportements suspects (contributions repetees avec montants identiques)
  const patternsByUser = new Map<string, number[]>()
  contributions.forEach(c => {
    const amounts = patternsByUser.get(c.userId) || []
    amounts.push(c.amountEuros)
    patternsByUser.set(c.userId, amounts)
  })
  
  patternsByUser.forEach((amounts, userId) => {
    if (amounts.length >= 5) {
      const uniqueAmounts = new Set(amounts)
      if (uniqueAmounts.size === 1) {
        alerts.push({
          type: "suspect_behavior",
          severity: "medium",
          description: `Comportement suspect: ${amounts.length} contributions identiques de ${amounts[0]}€ par le meme utilisateur`,
          affectedUserIds: [userId],
          affectedProjectIds: [],
          detectedAt: now,
          resolved: false,
        })
      }
    }
  })
  
  return alerts
}

/**
 * Valide l'integrite mathematique d'une distribution
 */
export function validateDistributionIntegrity(distribution: CycleDistribution): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []
  
  // Verification somme des parts = 100%
  const totalPercentage = DISTRIBUTION_KEY.creators + DISTRIBUTION_KEY.contributors + 
                          DISTRIBUTION_KEY.community + DISTRIBUTION_KEY.platform
  if (Math.abs(totalPercentage - 1) > 0.001) {
    errors.push(`La cle de repartition ne totalise pas 100%: ${totalPercentage * 100}%`)
  }
  
  // Verification somme des allocations
  const totalAllocated = distribution.allocations.reduce((sum, a) => sum + a.amountEuros, 0)
  const expectedUserShare = distribution.totalFunds * (1 - DISTRIBUTION_KEY.platform)
  
  if (Math.abs(totalAllocated - expectedUserShare) > 1) { // Tolerance de 1€ pour les arrondis
    errors.push(`Ecart dans les allocations: ${totalAllocated}€ vs ${expectedUserShare}€ attendus`)
  }
  
  // Verification des parts individuelles
  if (Math.abs(distribution.creatorsShare - distribution.totalFunds * DISTRIBUTION_KEY.creators) > 1) {
    errors.push("Ecart dans la part des createurs")
  }
  if (Math.abs(distribution.contributorsShare - distribution.totalFunds * DISTRIBUTION_KEY.contributors) > 1) {
    errors.push("Ecart dans la part des contributeurs")
  }
  if (Math.abs(distribution.communityShare - distribution.totalFunds * DISTRIBUTION_KEY.community) > 1) {
    errors.push("Ecart dans la part communautaire")
  }
  if (Math.abs(distribution.platformShare - distribution.totalFunds * DISTRIBUTION_KEY.platform) > 1) {
    errors.push("Ecart dans la part plateforme")
  }
  
  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Genere un rapport de cycle complet
 */
export function generateCycleReport(
  cycle: Cycle,
  rankedProjects: ProjectScore[],
  distribution: CycleDistribution,
  alerts: AntiGamingAlert[]
): {
  cycleId: string
  universe: Universe
  status: CycleStatus
  summary: {
    totalProjects: number
    totalFunds: number
    top10Projects: number
    participantProjects: number
    unrankedProjects: number
  }
  distribution: {
    creatorsShare: number
    contributorsShare: number
    communityShare: number
    platformShare: number
  }
  alerts: {
    total: number
    critical: number
    high: number
    unresolved: number
  }
  integrityCheck: {
    valid: boolean
    errors: string[]
  }
} {
  const top10 = rankedProjects.filter(p => p.rankCategory === "top10").length
  const participants = rankedProjects.filter(p => p.rankCategory === "participant").length
  const unranked = rankedProjects.filter(p => p.rankCategory === "unranked").length
  
  const criticalAlerts = alerts.filter(a => a.severity === "critical").length
  const highAlerts = alerts.filter(a => a.severity === "high").length
  const unresolvedAlerts = alerts.filter(a => !a.resolved).length
  
  const integrityCheck = validateDistributionIntegrity(distribution)
  
  return {
    cycleId: cycle.id,
    universe: cycle.universe,
    status: cycle.status,
    summary: {
      totalProjects: rankedProjects.length,
      totalFunds: cycle.totalFunds,
      top10Projects: top10,
      participantProjects: participants,
      unrankedProjects: unranked,
    },
    distribution: {
      creatorsShare: distribution.creatorsShare,
      contributorsShare: distribution.contributorsShare,
      communityShare: distribution.communityShare,
      platformShare: distribution.platformShare,
    },
    alerts: {
      total: alerts.length,
      critical: criticalAlerts,
      high: highAlerts,
      unresolved: unresolvedAlerts,
    },
    integrityCheck,
  }
}

// ─── Mock data pour tests ───

export function getMockCycle(universe: Universe = "audiovisual"): Cycle {
  return {
    id: `cycle-${universe}-${Date.now()}`,
    universe,
    status: "open",
    projectCount: 87,
    totalFunds: 45000,
    openedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    closedAt: null,
    distributedAt: null,
  }
}

export function getMockProjects(universe: Universe = "audiovisual", count: number = 10): Project[] {
  const projects: Project[] = []
  
  for (let i = 0; i < count; i++) {
    projects.push({
      id: `project-${i + 1}`,
      title: `Projet ${universe} #${i + 1}`,
      creatorId: `creator-${i + 1}`,
      universe,
      cycleId: `cycle-${universe}-1`,
      totalContributions: Math.floor(Math.random() * 5000) + 500,
      totalVotes: Math.floor(Math.random() * 200) + 20,
      engagement: {
        views: Math.floor(Math.random() * 2000) + 100,
        watchTimeMinutes: Math.floor(Math.random() * 1000) + 50,
        reads: Math.floor(Math.random() * 800) + 30,
        listens: Math.floor(Math.random() * 1200) + 60,
        interactions: Math.floor(Math.random() * 150) + 10,
      },
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    })
  }
  
  return projects
}

export function getMockContributions(projectIds: string[], count: number = 50): Contribution[] {
  const contributions: Contribution[] = []
  const amounts = [2, 3, 4, 5, 6, 8, 10, 12, 15, 20]
  
  for (let i = 0; i < count; i++) {
    const amount = amounts[Math.floor(Math.random() * amounts.length)]
    contributions.push({
      id: `contrib-${i + 1}`,
      userId: `user-${Math.floor(Math.random() * 30) + 1}`,
      projectId: projectIds[Math.floor(Math.random() * projectIds.length)],
      amountEuros: amount,
      votes: calculateVotes(amount),
      timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    })
  }
  
  return contributions
}
