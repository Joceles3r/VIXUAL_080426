/**
 * VIXUAL Discovery Engine V1 - Types
 *
 * Defines all types used by the Discovery Engine scoring and wave diffusion system.
 */

// ── Diffusion wave levels (section 2) ──

export type WaveLevel = 1 | 2 | 3 | 4

export const WAVE_SIZES: Record<WaveLevel, number> = {
  1: 50,
  2: 200,
  3: 1000,
  4: 5000,
}

export const WAVE_LABELS: Record<WaveLevel, string> = {
  1: "Phase decouverte",
  2: "Diffusion elargie",
  3: "Tendance montante",
  4: "Projet populaire",
}

// ── Score VISUAL (section 3) ──

export interface VisualScoreBreakdown {
  /** 40% — investissements recus vs objectif */
  investmentScore: number
  /** 20% — engagement (likes, commentaires, partages, favoris, duree visionnage) */
  engagementScore: number
  /** 15% — taux de visionnage complet */
  completionScore: number
  /** 10% — croissance (vitesse investissements + progression vues) */
  growthScore: number
  /** 10% — Trust Score du createur */
  trustScore: number
  /** 5% — bonus qualite IA */
  qualityBonus: number
  /** Score final 0-100 */
  total: number
}

export const SCORE_WEIGHTS = {
  investment: 0.40,
  engagement: 0.20,
  completion: 0.15,
  growth: 0.10,
  trust: 0.10,
  quality: 0.05,
} as const

// ── Project signals (input to engine) ──

export interface ProjectSignals {
  contentId: string
  contentType: "video" | "text" | "podcast"
  /** Current investment in EUR */
  currentInvestment: number
  /** Investment goal in EUR */
  investmentGoal: number
  /** Number of investors */
  investorCount: number
  /** Total votes */
  totalVotes: number
  /** Likes count */
  likes: number
  /** Comments count */
  comments: number
  /** Shares count */
  shares: number
  /** Favourites count */
  favourites: number
  /** Average watch/listen completion ratio (0-1) */
  avgCompletionRate: number
  /** Days since publication */
  daysSincePublished: number
  /** Investment received in last 7 days in EUR */
  recentInvestmentEur: number
  /** View count growth rate (0-1 normalized) */
  viewGrowthRate: number
  /** Creator's trust score (0-100) */
  creatorTrustScore: number
  /** Creator is verified */
  creatorVerified: boolean
  /** Creator has active Ticket Gold boost */
  hasTicketGoldActive: boolean
  /** Current wave level */
  currentWave: WaveLevel
}

// ── Anti-manipulation (section 7) ──

export type ManipulationFlag =
  | "SUDDEN_VOTE_SPIKE"
  | "RECENT_ACCOUNTS_BULK"
  | "COORDINATED_INVESTMENTS"
  | "ABNORMAL_TRAFFIC"

export interface ManipulationCheck {
  flagged: boolean
  flags: ManipulationFlag[]
  mode: "normal" | "analyse"
}

// ── Project badges (sections 12-13) ──

export type ProjectBadge =
  | "NOUVEAU"         // < 7 days old
  | "EN_HAUSSE"       // growing fast
  | "PROMETTEUR"      // crosses promising thresholds
  | "PROJET_STAR"     // top popularity
  | "EN_ANALYSE"      // under manipulation review
  | "TOP_100"         // in the current TOP 100

// ── Discovery result ──

export interface DiscoveryResult {
  contentId: string
  score: VisualScoreBreakdown
  wave: WaveLevel
  waveLabel: string
  waveSize: number
  badges: ProjectBadge[]
  manipulation: ManipulationCheck
  /** Rank within universe (1-based, null if unranked) */
  rank: number | null
  /** Distance to TOP 100 entry */
  distanceToTop100: number | null
  /** Motivational message for UI */
  motivationalMessage: string | null
  computedAt: string
}

// ── Ranked project for leaderboard ──

export interface RankedProject {
  rank: number
  contentId: string
  title: string
  creatorName: string
  contentType: "video" | "text" | "podcast"
  coverUrl: string
  score: number | VisualScoreBreakdown
  wave: WaveLevel
  badges: ProjectBadge[]
  currentInvestment: number
  investmentGoal: number
  investorCount: number
  totalVotes: number
  progressPct: number
  distanceToTop100: number | null
  motivationalMessage: string | null
  isFree: boolean
}
