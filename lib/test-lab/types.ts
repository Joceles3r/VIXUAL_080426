/**
 * MODULE TEST-LAB VIXUAL — TYPES
 * Aligne sur les roles officiels VIXUAL (verrou final).
 */

export type TestRole =
  | "guest"
  | "visitor"
  | "creator"
  | "contributor"
  | "infoporteur"
  | "podcasteur"
  | "auditeur"
  | "contribu_lecteur"

export type TestContentType = "video" | "audio" | "article"

export type TestPaymentBehavior =
  | "success"
  | "failed"
  | "requires_action"
  | "refunded"

export type TestBunnyMode = "mock" | "processing" | "ready" | "error"

export interface TestUser {
  id: string
  name: string
  email: string
  role: TestRole
  behavior?: string
  walletBalance?: number
}

export interface TestProject {
  id: string
  title: string
  type: TestContentType
  creatorId: string
  url?: string
  content?: string
  bunnyStatus?: TestBunnyMode
}

export interface TestTransaction {
  id: string
  userId: string
  projectId: string
  amount: number
  status: TestPaymentBehavior
  provider: "stripe_test" | "simulation"
}

export interface TestScenarioConfig {
  name: string
  // Profils V1
  visitors: number
  creators: number
  contributors: number
  // Profils V2/V3
  infoporteurs: number
  podcasteurs: number
  auditeurs: number
  contribu_lecteurs: number
  guests: number
  // Contenus
  videos: number
  podcasts: number
  articles: number
  // Paiements
  successfulPaymentsPercent: number
  failedPaymentsPercent: number
  durationMinutes: number
  enableStripeSimulation: boolean
  enableBunnyMock: boolean
  // Modules avances (V2/V3)
  enableTrustScoreEvolution: boolean
  enableVisibilityBoostSim: boolean
  enableMonthlyCycleClose: boolean
  simulatedDaysActive: number
}

export interface TestScenarioSummary {
  usersCount: number
  projectsCount: number
  transactionsCount: number
  successfulPayments: number
  failedPayments: number
  // Metriques economiques
  totalRevenueEur: number
  vixualPlatformShareEur: number
  creatorsRevenueEur: number
  reserveTechniqueEur: number
  // Metriques par profil
  profileBreakdown: Record<TestRole, number>
  // Trust Score
  level1Count: number
  level2Count: number
  level3Count: number
  // Visibility boost
  totalVisibilityPointsSpent: number
  uniqueBoosters: number
  giniCoefficient: number
  // Cycle
  top10Creators: Array<{ creatorId: string; finalScore: number; revenueEur: number }>
  cycleClosedAt: string | null
}

export interface TestScenarioResult {
  scenarioName: string
  users: TestUser[]
  projects: TestProject[]
  transactions: TestTransaction[]
  summary: TestScenarioSummary
}

// === TYPES MODULES AVANCES (Trust Score / Boost / Cycle) ===

export interface TestUserExtended extends TestUser {
  trustScore: number
  level: 1 | 2 | 3
  vixupointsBalance: number
  daysActive: number
  contributionsMade: number
  publicationsMade: number
}

export interface TestVisibilityBoost {
  visitorId: string
  creatorId: string
  pointsSpent: number
  visibilityScore: number
  visitorTrustScore: number
}

export interface TestCycleResult {
  closedAt: string
  totalContributionsEur: number
  top10: Array<{
    creatorId: string
    creatorName: string
    finalScore: number
    contributionsCount: number
    contributionsEur: number
    visibilityBoostPoints: number
    revenueEur: number
  }>
  redistributionByContentType: {
    video: { totalEur: number; vixualEur: number; creatorsEur: number; reserveEur: number }
    podcast: { totalEur: number; vixualEur: number; creatorsEur: number; reserveEur: number }
    article: { totalEur: number; vixualEur: number; creatorsEur: number; reserveEur: number }
  }
}

// === TYPES SIMULATION TEMPS REEL ===

export type TestUserBehavior =
  | "observer"
  | "active"
  | "super_contributor"
  | "payment_fail"
  | "creator_active"

export interface RealtimeSimulationConfig {
  name: string
  users: number
  creators: number
  projects: number
  durationMinutes: number
  intensity: "low" | "medium" | "high"
  contributionsPerMinute: number
  paymentFailurePercent: number
  bunnyErrorPercent: number
}

export interface RealtimeTickResult {
  tick: number
  activeUsers: number
  pageViews: number
  contributionsCount: number
  contributionAmountTotal: number
  successfulPayments: number
  failedPayments: number
  bunnyProcessing: number
  bunnyReady: number
  bunnyError: number
}
