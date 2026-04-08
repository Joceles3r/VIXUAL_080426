/**
 * VIXUAL Financial Brain
 * Centre de pilotage economique et antifraude
 * 
 * Missions:
 * 1. Controle des repartitions
 * 2. Anti-gaming avance
 * 3. Detection multi-comptes
 * 4. Surveillance manipulation VIXUpoints
 * 5. Monitoring temps reel des cycles financiers
 * 
 * Principe: IA analyse — humains decident — systeme trace
 */

import type { AdminRole } from "@/lib/admin/roles"

// ─── Types ───

export type PaymentStatus = "green" | "orange" | "red" | "critical"
export type ClusterLevel = "low" | "medium" | "high" | "critical"
export type { AdminRole }

export interface DistributionKey {
  creators: number       // 40%
  contributors: number   // 30%
  community: number      // 7%  (rang 11-100)
  platform: number       // 23% (VIXUAL)
}

export interface CycleHealth {
  score: number          // 0-100
  status: "healthy" | "correct" | "fragile" | "critical"
  factors: {
    mathematicalCoherence: number
    fraudAbsence: number
    distributionStability: number
    suspectAccountsPresence: number
    vixupointsHealth: number
    payoutBugAbsence: number
    profileRulesRespect: number
  }
}

export interface DistributionComparison {
  element: string
  theoretical: number
  calculated: number
  gap: number
  status: "ok" | "verify" | "blocked"
}

export interface SuspectAccount {
  userId: string
  username: string
  clusterLevel: ClusterLevel
  signals: string[]
  lastActivity: string
  totalContributions: number
  relatedAccounts: string[]
  recommendedAction: string
}

export interface PaymentReview {
  id: string
  projectId: string
  projectName: string
  amount: number
  recipientId: string
  recipientName: string
  status: PaymentStatus
  aiScore: number
  alerts: string[]
  requiresValidation: AdminRole[]
  createdAt: string
}

export interface CycleOverview {
  cycleId: string
  cycleName: string
  totalCollected: number
  totalToDistribute: number
  winningProjects: number
  winningProfiles: number
  excludedAccounts: number
  openAlerts: number
  healthScore: number
  pendingPayments: number
  frozenWithdrawals: number
  vixupointsActivityToday: number
}

export interface AIAuditLog {
  id: string
  timestamp: string
  cycle: string
  project: string | null
  user: string | null
  aiScore: number | null
  anomaly: string | null
  humanDecision: string
  oldValue: string | null
  newValue: string | null
  decidedBy: string
  role: AdminRole
}

// ─── Official Distribution Key ───

export const OFFICIAL_DISTRIBUTION_KEY: DistributionKey = {
  creators: 40,
  contributors: 30,
  community: 23,
  platform: 7,
}

// ─── Health Score Interpretation ───

export function interpretHealthScore(score: number): CycleHealth["status"] {
  if (score >= 90) return "healthy"
  if (score >= 75) return "correct"
  if (score >= 50) return "fragile"
  return "critical"
}

export function getHealthColor(status: CycleHealth["status"]): string {
  switch (status) {
    case "healthy": return "text-emerald-400"
    case "correct": return "text-sky-400"
    case "fragile": return "text-amber-400"
    case "critical": return "text-rose-400"
  }
}

export function getHealthBg(status: CycleHealth["status"]): string {
  switch (status) {
    case "healthy": return "bg-emerald-500/10"
    case "correct": return "bg-sky-500/10"
    case "fragile": return "bg-amber-500/10"
    case "critical": return "bg-rose-500/10"
  }
}

// ─── Payment Status Helpers ───

export function getPaymentStatusColor(status: PaymentStatus): string {
  switch (status) {
    case "green": return "text-emerald-400"
    case "orange": return "text-amber-400"
    case "red": return "text-rose-400"
    case "critical": return "text-rose-600"
  }
}

export function getPaymentStatusBg(status: PaymentStatus): string {
  switch (status) {
    case "green": return "bg-emerald-500/15"
    case "orange": return "bg-amber-500/15"
    case "red": return "bg-rose-500/15"
    case "critical": return "bg-rose-600/20"
  }
}

export function getPaymentStatusLabel(status: PaymentStatus): string {
  switch (status) {
    case "green": return "Valide"
    case "orange": return "A verifier"
    case "red": return "Anomalie"
    case "critical": return "Bloque"
  }
}

export function getRequiredValidation(status: PaymentStatus, amount: number): AdminRole[] {
  if (status === "critical") return ["patron"]
  if (status === "red") return ["patron"]
  if (status === "orange") return ["adjoint", "patron"]
  if (amount > 1000) return ["moderator", "adjoint"] // Double validation > 1000€
  return []
}

// ─── AI Confidence Score ───

export function interpretAIScore(score: number): { label: string; color: string } {
  if (score >= 90) return { label: "Distribution saine", color: "text-emerald-400" }
  if (score >= 75) return { label: "Distribution correcte", color: "text-sky-400" }
  if (score >= 50) return { label: "Distribution a verifier", color: "text-amber-400" }
  return { label: "Distribution bloquee", color: "text-rose-400" }
}

// ─── Distribution Verification ───

export function verifyDistributionKey(
  calculated: DistributionKey
): DistributionComparison[] {
  const theoretical = OFFICIAL_DISTRIBUTION_KEY
  
  return [
    {
      element: "Part createurs",
      theoretical: theoretical.creators,
      calculated: calculated.creators,
      gap: calculated.creators - theoretical.creators,
      status: Math.abs(calculated.creators - theoretical.creators) <= 0.5 ? "ok" : 
              Math.abs(calculated.creators - theoretical.creators) <= 2 ? "verify" : "blocked"
    },
    {
      element: "Part contributeurs",
      theoretical: theoretical.contributors,
      calculated: calculated.contributors,
      gap: calculated.contributors - theoretical.contributors,
      status: Math.abs(calculated.contributors - theoretical.contributors) <= 0.5 ? "ok" :
              Math.abs(calculated.contributors - theoretical.contributors) <= 2 ? "verify" : "blocked"
    },
    {
      element: "Part communaute",
      theoretical: theoretical.community,
      calculated: calculated.community,
      gap: calculated.community - theoretical.community,
      status: Math.abs(calculated.community - theoretical.community) <= 0.5 ? "ok" :
              Math.abs(calculated.community - theoretical.community) <= 2 ? "verify" : "blocked"
    },
    {
      element: "Part plateforme",
      theoretical: theoretical.platform,
      calculated: calculated.platform,
      gap: calculated.platform - theoretical.platform,
      status: Math.abs(calculated.platform - theoretical.platform) <= 0.5 ? "ok" :
              Math.abs(calculated.platform - theoretical.platform) <= 2 ? "verify" : "blocked"
    },
  ]
}

// ─── Anti-Gaming Detection ───

export interface GamingAlert {
  type: string
  severity: "low" | "medium" | "high" | "critical"
  description: string
  affectedAccounts: string[]
  detectedAt: string
}

export const GAMING_PATTERNS = [
  "fractionnement_contributions",
  "accumulation_avant_cloture",
  "comptes_coordonnes",
  "contribution_circulaire",
  "boosting_projet",
  "usage_detourne_mineurs",
  "exploitation_micropacks",
  "palier_repetitif",
  "concentration_projet_unique",
] as const

export function detectGamingPattern(
  pattern: typeof GAMING_PATTERNS[number]
): { label: string; severity: GamingAlert["severity"] } {
  const patterns: Record<string, { label: string; severity: GamingAlert["severity"] }> = {
    fractionnement_contributions: { label: "Fractionnement artificiel des contributions", severity: "high" },
    accumulation_avant_cloture: { label: "Accumulation optimisee avant cloture", severity: "medium" },
    comptes_coordonnes: { label: "Utilisation coordonnee de comptes secondaires", severity: "critical" },
    contribution_circulaire: { label: "Contribution circulaire detectee", severity: "critical" },
    boosting_projet: { label: "Boosting artificiel d'un projet", severity: "high" },
    usage_detourne_mineurs: { label: "Usage detourne de profils mineurs", severity: "critical" },
    exploitation_micropacks: { label: "Exploitation abusive des micro-packs", severity: "medium" },
    palier_repetitif: { label: "Usage repetitif d'un palier optimal", severity: "medium" },
    concentration_projet_unique: { label: "Activite anormale concentree sur un seul projet", severity: "high" },
  }
  return patterns[pattern] || { label: "Pattern inconnu", severity: "low" }
}

// ─── Multi-Account Detection ───

export const MULTICOUNT_SIGNALS = [
  "device_identique",
  "ip_identique",
  "navigateur_identique",
  "email_lie",
  "paiement_lie",
  "activite_synchronisee",
  "horaires_identiques",
  "style_commentaire",
  "comportement_contribution",
  "contenus_promus_identiques",
] as const

export function getClusterColor(level: ClusterLevel): string {
  switch (level) {
    case "low": return "text-sky-400"
    case "medium": return "text-amber-400"
    case "high": return "text-orange-400"
    case "critical": return "text-rose-400"
  }
}

export function getClusterAction(level: ClusterLevel): string {
  switch (level) {
    case "low": return "Surveillance simple"
    case "medium": return "Verification d'identite"
    case "high": return "Gel des gains"
    case "critical": return "Exclusion du calcul + Enquete"
  }
}

// ─── Role Permissions ───

export interface RolePermissions {
  canValidateGreen: boolean
  canValidateOrange: boolean
  canValidateRed: boolean
  canValidateCritical: boolean
  canFreezePayment: boolean
  canUnfreezePayment: boolean
  canRecalculate: boolean
  canExcludeAccount: boolean
  canModifyRules: boolean
  canDeleteUser: boolean
  canModifyPercentages: boolean
  canViewLogs: boolean
  canOpenInvestigation: boolean
}

export const ROLE_PERMISSIONS: Record<AdminRole, RolePermissions> = {
  patron: {
    canValidateGreen: true,
    canValidateOrange: true,
    canValidateRed: true,
    canValidateCritical: true,
    canFreezePayment: true,
    canUnfreezePayment: true,
    canRecalculate: true,
    canExcludeAccount: true,
    canModifyRules: true,
    canDeleteUser: true,
    canModifyPercentages: true,
    canViewLogs: true,
    canOpenInvestigation: true,
  },
  adjoint: {
    canValidateGreen: true,
    canValidateOrange: true,
    canValidateRed: false,
    canValidateCritical: false,
    canFreezePayment: true,
    canUnfreezePayment: false,
    canRecalculate: true,
    canExcludeAccount: true,
    canModifyRules: false,
    canDeleteUser: false,
    canModifyPercentages: false,
    canViewLogs: true,
    canOpenInvestigation: true,
  },
  moderator: {
    canValidateGreen: false,
    canValidateOrange: false,
    canValidateRed: false,
    canValidateCritical: false,
    canFreezePayment: false,
    canUnfreezePayment: false,
    canRecalculate: false,
    canExcludeAccount: false,
    canModifyRules: false,
    canDeleteUser: false,
    canModifyPercentages: false,
    canViewLogs: true,
    canOpenInvestigation: false,
  },
  support: {
    canValidateGreen: false,
    canValidateOrange: false,
    canValidateRed: false,
    canValidateCritical: false,
    canFreezePayment: false,
    canUnfreezePayment: false,
    canRecalculate: false,
    canExcludeAccount: false,
    canModifyRules: false,
    canDeleteUser: false,
    canModifyPercentages: false,
    canViewLogs: false,
    canOpenInvestigation: false,
  },
}

// ─── Mock Data for Dashboard ───

export function getMockCycleOverview(): CycleOverview {
  return {
    cycleId: "cycle-mars-2026",
    cycleName: "Cycle Mars 2026",
    totalCollected: 48500,
    totalToDistribute: 45115, // 93% apres frais
    winningProjects: 12,
    winningProfiles: 156,
    excludedAccounts: 3,
    openAlerts: 7,
    healthScore: 82,
    pendingPayments: 24,
    frozenWithdrawals: 2,
    vixupointsActivityToday: 12450,
  }
}

export function getMockDistributionComparison(): DistributionComparison[] {
  return verifyDistributionKey({
    creators: 40,
    contributors: 29.8,
    community: 23,
    platform: 7.2,
  })
}

export function getMockPaymentReviews(): PaymentReview[] {
  return [
    {
      id: "pay-001",
      projectId: "proj-film-a",
      projectName: "Film A - Le Voyage",
      amount: 1240,
      recipientId: "user-001",
      recipientName: "Marie Stellaire",
      status: "green",
      aiScore: 96,
      alerts: [],
      requiresValidation: [],
      createdAt: "2026-03-15T10:00:00Z",
    },
    {
      id: "pay-002",
      projectId: "proj-podcast-b",
      projectName: "Podcast B - Ondes Urbaines",
      amount: 1100,
      recipientId: "user-004",
      recipientName: "Karim Ondes",
      status: "orange",
      aiScore: 78,
      alerts: ["Pic d'activite inhabituel avant cloture"],
      requiresValidation: ["adjoint"],
      createdAt: "2026-03-15T10:05:00Z",
    },
    {
      id: "pay-003",
      projectId: "proj-livre-c",
      projectName: "Livre C - Horizons",
      amount: 850,
      recipientId: "user-003",
      recipientName: "Pierre Michel",
      status: "red",
      aiScore: 44,
      alerts: ["Cluster multi-comptes detecte", "Repartition incoherente"],
      requiresValidation: ["patron"],
      createdAt: "2026-03-15T10:10:00Z",
    },
    {
      id: "pay-004",
      projectId: "proj-film-d",
      projectName: "Film D - Lumieres",
      amount: 2800,
      recipientId: "user-006",
      recipientName: "Lucas Nature",
      status: "green",
      aiScore: 92,
      alerts: [],
      requiresValidation: ["moderator", "adjoint"], // Double validation car > 1000€
      createdAt: "2026-03-15T10:15:00Z",
    },
  ]
}

export function getMockSuspectAccounts(): SuspectAccount[] {
  return [
    {
      userId: "user-suspect-1",
      username: "CompteSuspect1",
      clusterLevel: "high",
      signals: ["ip_identique", "activite_synchronisee", "palier_repetitif"],
      lastActivity: "2026-03-15T09:45:00Z",
      totalContributions: 580,
      relatedAccounts: ["user-suspect-2", "user-suspect-3"],
      recommendedAction: "Gel des gains + Verification identite",
    },
    {
      userId: "user-suspect-4",
      username: "CompteSuspect4",
      clusterLevel: "critical",
      signals: ["device_identique", "paiement_lie", "contribution_circulaire"],
      lastActivity: "2026-03-15T08:30:00Z",
      totalContributions: 1200,
      relatedAccounts: ["user-suspect-5"],
      recommendedAction: "Exclusion du calcul + Ouverture enquete",
    },
  ]
}

export function getMockGamingAlerts(): GamingAlert[] {
  return [
    {
      type: "palier_repetitif",
      severity: "medium",
      description: "Un groupe de 4 comptes a utilise a 95% le meme palier dans les 3 dernieres heures sur le meme projet.",
      affectedAccounts: ["user-g1", "user-g2", "user-g3", "user-g4"],
      detectedAt: "2026-03-15T08:00:00Z",
    },
    {
      type: "accumulation_avant_cloture",
      severity: "high",
      description: "Pic de contributions detecte dans les 2 heures precedant la cloture du cycle.",
      affectedAccounts: ["user-g5", "user-g6"],
      detectedAt: "2026-03-14T22:30:00Z",
    },
  ]
}

export function getMockAuditLogs(): AIAuditLog[] {
  return [
    {
      id: "log-001",
      timestamp: "2026-03-15T10:30:00Z",
      cycle: "Cycle Mars 2026",
      project: "Livre C",
      user: "user-suspect-1",
      aiScore: 44,
      anomaly: "Cluster multi-comptes detecte",
      humanDecision: "Exclusion du calcul",
      oldValue: "Inclus dans repartition",
      newValue: "Exclu de repartition",
      decidedBy: "jocelyndru@gmail.com",
      role: "patron",
    },
    {
      id: "log-002",
      timestamp: "2026-03-15T09:15:00Z",
      cycle: "Cycle Mars 2026",
      project: "Podcast B",
      user: null,
      aiScore: 78,
      anomaly: "Pic d'activite inhabituel",
      humanDecision: "Validation apres verification",
      oldValue: "En attente",
      newValue: "Valide",
      decidedBy: "adjoint@vixual.com",
      role: "adjoint",
    },
  ]
}

// ─── Types et fonctions manquantes pour le dashboard ───

export interface CycleAnalysis {
  id: string
  cycleName: string
  status: "pending_validation" | "validated" | "rejected"
  projectsCount: number
  totalRevenue: number
  contributorsCount: number
  aiConfidence: number
  flaggedItems: number
  closureDate: string
}

export interface FraudAlert {
  type: string
  severity: "critical" | "high" | "medium" | "low"
  description: string
  affectedAccounts: string[]
  detectedAt: string
}

export function getMockCycleAnalysis(): CycleAnalysis[] {
  return [
    {
      id: "cycle-001",
      cycleName: "Cycle Mars 2026",
      status: "pending_validation",
      projectsCount: 24,
      totalRevenue: 45800,
      contributorsCount: 312,
      aiConfidence: 94,
      flaggedItems: 3,
      closureDate: "2026-03-31T23:59:59Z",
    },
    {
      id: "cycle-002",
      cycleName: "Cycle Fevrier 2026",
      status: "validated",
      projectsCount: 18,
      totalRevenue: 32500,
      contributorsCount: 245,
      aiConfidence: 98,
      flaggedItems: 0,
      closureDate: "2026-02-28T23:59:59Z",
    },
    {
      id: "cycle-003",
      cycleName: "Cycle Janvier 2026",
      status: "validated",
      projectsCount: 15,
      totalRevenue: 28900,
      contributorsCount: 198,
      aiConfidence: 96,
      flaggedItems: 1,
      closureDate: "2026-01-31T23:59:59Z",
    },
  ]
}

export function getMockFraudAlerts(): FraudAlert[] {
  return [
    {
      type: "multi_comptes",
      severity: "critical",
      description: "Cluster de 5 comptes detectes avec correlation haute (meme IP, meme device, contributions liees)",
      affectedAccounts: ["user-001", "user-002", "user-003", "user-004", "user-005"],
      detectedAt: "2026-03-15T10:30:00Z",
    },
    {
      type: "accumulation_avant_cloture",
      severity: "high",
      description: "Pic de contributions detecte 2h avant cloture du cycle Mars",
      affectedAccounts: ["user-g5", "user-g6", "user-g7"],
      detectedAt: "2026-03-14T22:00:00Z",
    },
    {
      type: "pattern_bot",
      severity: "medium",
      description: "Comportement automatise detecte: contributions a intervalles reguliers",
      affectedAccounts: ["user-bot-1"],
      detectedAt: "2026-03-13T15:45:00Z",
    },
  ]
}
