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
  visitors: number
  creators: number
  contributors: number
  videos: number
  podcasts: number
  articles: number
  successfulPaymentsPercent: number
  failedPaymentsPercent: number
  durationMinutes: number
  enableStripeSimulation: boolean
  enableBunnyMock: boolean
}

export interface TestScenarioSummary {
  usersCount: number
  projectsCount: number
  transactionsCount: number
  successfulPayments: number
  failedPayments: number
}

export interface TestScenarioResult {
  scenarioName: string
  users: TestUser[]
  projects: TestProject[]
  transactions: TestTransaction[]
  summary: TestScenarioSummary
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
