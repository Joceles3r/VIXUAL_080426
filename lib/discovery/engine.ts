/**
 * VIXUAL Discovery Engine V1
 *
 * Core scoring, wave diffusion, badge assignment, and anti-manipulation.
 * Compatible with the Rule of 100 — this engine ranks projects within a cycle
 * but does NOT replace cycle management.
 *
 * Formula (section 3):
 *   Score_VIXUAL = 40% investment + 20% engagement + 15% completion
 *                + 10% growth + 10% trust + 5% quality bonus
 */

import type {
  ProjectSignals,
  VisualScoreBreakdown,
  WaveLevel,
  ProjectBadge,
  ManipulationCheck,
  ManipulationFlag,
  DiscoveryResult,
  RankedProject,
} from "./types"
import {
  SCORE_WEIGHTS,
  WAVE_SIZES,
  WAVE_LABELS,
} from "./types"
import { ALL_CONTENTS, type Content } from "@/lib/mock-data"

// ── Score computation ──

export function computeVisualScore(signals: ProjectSignals): VisualScoreBreakdown {
  // 40% — Investment progress (how close to goal, normalized 0-100)
  const investmentScore =
    Math.min(signals.currentInvestment / Math.max(signals.investmentGoal, 1), 1) * 100

  // 20% — Engagement composite (normalised to 0-100)
  // likes 30%, comments 30%, shares 25%, favourites 15%
  const engagementRaw =
    signals.likes * 0.30 +
    signals.comments * 0.30 +
    signals.shares * 0.25 +
    signals.favourites * 0.15
  // Cap at 500 raw points for normalization
  const engagementScore = Math.min(engagementRaw / 500, 1) * 100

  // 15% — Average completion rate (already 0-1)
  const completionScore = Math.min(signals.avgCompletionRate, 1) * 100

  // 10% — Growth (recency of investments + view progression)
  // recentInvestmentEur capped at 20% of goal, viewGrowthRate 0-1
  const investGrowth = Math.min(signals.recentInvestmentEur / (signals.investmentGoal * 0.20), 1)
  const growthScore = (investGrowth * 0.6 + signals.viewGrowthRate * 0.4) * 100

  // 10% — Trust score (0-100 already)
  let trustScore = Math.min(signals.creatorTrustScore, 100)
  if (signals.creatorVerified) trustScore = Math.min(trustScore + 5, 100)
  if (signals.hasTicketGoldActive) trustScore = Math.min(trustScore + 5, 100)

  // 5% — AI quality bonus (heuristic: completeness of project signals)
  // If investor count > 10 AND completion rate > 0.5 AND trust > 60 => full bonus
  const qualityBonus =
    signals.investorCount > 10 && signals.avgCompletionRate > 0.5 && signals.creatorTrustScore > 60
      ? 100
      : signals.investorCount > 5
        ? 50
        : 0

  const total =
    investmentScore * SCORE_WEIGHTS.investment +
    engagementScore * SCORE_WEIGHTS.engagement +
    completionScore * SCORE_WEIGHTS.completion +
    growthScore * SCORE_WEIGHTS.growth +
    trustScore * SCORE_WEIGHTS.trust +
    qualityBonus * SCORE_WEIGHTS.quality

  return {
    investmentScore: Math.round(investmentScore),
    engagementScore: Math.round(engagementScore),
    completionScore: Math.round(completionScore),
    growthScore: Math.round(growthScore),
    trustScore: Math.round(trustScore),
    qualityBonus: Math.round(qualityBonus),
    total: Math.round(total * 10) / 10,
  }
}

// ── Wave progression ──

export function computeNextWave(
  currentWave: WaveLevel,
  score: number,
  investorCount: number,
): WaveLevel {
  // Thresholds to advance to next wave
  const THRESHOLDS: Record<WaveLevel, { score: number; investors: number }> = {
    1: { score: 30, investors: 5 },
    2: { score: 50, investors: 15 },
    3: { score: 70, investors: 40 },
    4: { score: 85, investors: 80 },
  }

  const threshold = THRESHOLDS[currentWave]
  if (score >= threshold.score && investorCount >= threshold.investors) {
    return Math.min(currentWave + 1, 4) as WaveLevel
  }
  // Can regress if score drops significantly
  if (score < threshold.score * 0.5 && currentWave > 1) {
    return Math.max(currentWave - 1, 1) as WaveLevel
  }
  return currentWave
}

// ── Anti-manipulation detection (section 7) ──

export function detectManipulation(signals: ProjectSignals): ManipulationCheck {
  const flags: ManipulationFlag[] = []

  // Sudden vote spike: more than 30% of totalVotes came from recent activity
  // We approximate: if recentInvestment > 50% of totalInvestment in < 3 days
  if (
    signals.daysSincePublished <= 3 &&
    signals.recentInvestmentEur > signals.currentInvestment * 0.50 &&
    signals.investorCount > 20
  ) {
    flags.push("SUDDEN_VOTE_SPIKE")
  }

  // Abnormal traffic: extremely high views but very low engagement
  if (
    signals.viewGrowthRate > 0.9 &&
    signals.likes + signals.comments < 5 &&
    signals.investorCount > 10
  ) {
    flags.push("ABNORMAL_TRAFFIC")
  }

  // Coordinated investments: very high avg investment per investor
  const avgInvestmentPerInvestor =
    signals.investorCount > 0 ? signals.currentInvestment / signals.investorCount : 0
  if (avgInvestmentPerInvestor > 15 && signals.daysSincePublished <= 7) {
    flags.push("COORDINATED_INVESTMENTS")
  }

  return {
    flagged: flags.length > 0,
    flags,
    mode: flags.length > 0 ? "analyse" : "normal",
  }
}

// ── Badge assignment ──

export function assignBadges(
  signals: ProjectSignals,
  score: number,
  rank: number | null,
  manipulation: ManipulationCheck,
): ProjectBadge[] {
  const badges: ProjectBadge[] = []

  if (manipulation.flagged) {
    badges.push("EN_ANALYSE")
    return badges // No other badges while under review
  }

  if (signals.daysSincePublished <= 7) badges.push("NOUVEAU")

  if (signals.viewGrowthRate > 0.6 || signals.recentInvestmentEur > signals.investmentGoal * 0.15) {
    badges.push("EN_HAUSSE")
  }

  // Promising: crosses thresholds (section 12)
  const investPct = signals.currentInvestment / Math.max(signals.investmentGoal, 1)
  if (
    investPct >= 0.4 &&
    signals.avgCompletionRate >= 0.5 &&
    signals.investorCount >= 10
  ) {
    badges.push("PROMETTEUR")
  }

  // Star: very high popularity (section 13)
  if (score >= 80 && signals.totalVotes >= 300 && signals.investorCount >= 50) {
    badges.push("PROJET_STAR")
  }

  if (rank !== null && rank <= 100) badges.push("TOP_100")

  return badges
}

// ── Motivational messages (section 10) ──

export function getMotivationalMessage(
  signals: ProjectSignals,
  rank: number | null,
  badges: ProjectBadge[],
): string | null {
  if (badges.includes("EN_ANALYSE")) return null

  if (badges.includes("PROJET_STAR")) {
    return "Ce projet est une etoile VIXUAL. Rejoignez la communaute de soutien !"
  }

  if (rank !== null && rank <= 10) {
    return `Ce projet est dans le TOP ${rank} VIXUAL. Il pourrait changer de categorie tres bientot.`
  }

  if (rank !== null && rank > 10 && rank <= 100) {
    const distTo10 = rank - 10
    return `Encore ${distTo10} place${distTo10 > 1 ? "s" : ""} pour entrer dans le TOP 10.`
  }

  if (rank !== null && rank > 100) {
    const distTo100 = rank - 100
    return `Encore ${distTo100} investissement${distTo100 > 1 ? "s" : ""} pour entrer dans le TOP 100.`
  }

  if (badges.includes("EN_HAUSSE")) {
    return "Ce projet est en train de monter. Ne manquez pas cette opportunite."
  }

  if (badges.includes("PROMETTEUR")) {
    return "Projet prometteur : il attire de nouveaux soutiens chaque jour."
  }

  const investPct = signals.currentInvestment / Math.max(signals.investmentGoal, 1)
  if (investPct >= 0.8) {
    return "Ce projet approche de son objectif. Il reste peu de temps pour le soutenir."
  }

  return null
}

// ── Full discovery evaluation ──

export function evaluateProject(
  signals: ProjectSignals,
  rank: number | null,
  totalProjectsInUniverse: number,
): DiscoveryResult {
  const score = computeVisualScore(signals)
  const manipulation = detectManipulation(signals)
  const nextWave = manipulation.flagged
    ? signals.currentWave
    : computeNextWave(signals.currentWave, score.total, signals.investorCount)
  const badges = assignBadges(signals, score.total, rank, manipulation)
  const distanceToTop100 =
    rank !== null && rank > 100 ? rank - 100 : rank !== null && rank <= 100 ? 0 : null
  const motivationalMessage = getMotivationalMessage(signals, rank, badges)

  return {
    contentId: signals.contentId,
    score,
    wave: nextWave,
    waveLabel: WAVE_LABELS[nextWave],
    waveSize: WAVE_SIZES[nextWave],
    badges,
    manipulation,
    rank,
    distanceToTop100,
    motivationalMessage,
    computedAt: new Date().toISOString(),
  }
}

// ── Rank all projects in a universe from mock data (client-safe) ──

export function rankProjectsFromMock(contents: Content[]): RankedProject[] {
  // Build signals from mock data with sensible heuristics
  const signalsList: (ProjectSignals & { content: Content })[] = contents.map((c) => {
    const daysSince = Math.max(
      1,
      Math.round(
        (Date.now() - new Date(c.createdAt).getTime()) / (1000 * 60 * 60 * 24),
      ),
    )
    const investPct = c.currentInvestment / Math.max(c.investmentGoal, 1)

    const signals: ProjectSignals = {
      contentId: c.id,
      contentType: c.contentType,
      currentInvestment: c.currentInvestment,
      investmentGoal: c.investmentGoal,
      investorCount: c.investorCount,
      totalVotes: c.totalVotes,
      // Derive engagement from votes and investors (mock heuristic)
      likes: Math.round(c.totalVotes * 0.6),
      comments: Math.round(c.totalVotes * 0.15),
      shares: Math.round(c.totalVotes * 0.10),
      favourites: Math.round(c.totalVotes * 0.15),
      // Completion: correlated with free vs paid and investor count
      avgCompletionRate: c.isFree
        ? Math.min(0.3 + c.investorCount / 100, 0.85)
        : Math.min(0.5 + c.investorCount / 120, 0.95),
      daysSincePublished: daysSince,
      recentInvestmentEur: Math.round(c.currentInvestment * (daysSince <= 14 ? 0.35 : 0.15)),
      viewGrowthRate: Math.min(investPct * 0.8 + c.investorCount / 200, 1),
      creatorTrustScore: Math.min(55 + c.investorCount * 0.5, 100),
      creatorVerified: c.investorCount >= 30,
      hasTicketGoldActive: c.hasTicketGoldActive ?? false,
      currentWave:
        c.investorCount >= 80 ? 4
        : c.investorCount >= 40 ? 3
        : c.investorCount >= 15 ? 2
        : 1,
    }
    return { ...signals, content: c }
  })

  // Score all
  const scored = signalsList.map((s) => ({
    signals: s,
    content: s.content,
    score: computeVisualScore(s),
  }))

  // Sort by score descending
  scored.sort((a, b) => b.score.total - a.score.total)

  // Assign ranks + build final list
  return scored.map((item, index) => {
    const rank = index + 1
    const manipulation = detectManipulation(item.signals)
    const badges = assignBadges(item.signals, item.score.total, rank, manipulation)
    const distanceToTop100 = rank > 100 ? rank - 100 : 0
    const motivationalMessage = getMotivationalMessage(item.signals, rank, badges)
    const nextWave = manipulation.flagged
      ? item.signals.currentWave
      : computeNextWave(item.signals.currentWave, item.score.total, item.signals.investorCount)

    return {
      rank,
      contentId: item.content.id,
      title: item.content.title,
      creatorName: item.content.creatorName,
      contentType: item.content.contentType,
      coverUrl: item.content.coverUrl,
      score: item.score.total,
      wave: nextWave,
      badges,
      currentInvestment: item.content.currentInvestment,
      investmentGoal: item.content.investmentGoal,
      investorCount: item.content.investorCount,
      totalVotes: item.content.totalVotes,
      progressPct: Math.min(
        Math.round((item.content.currentInvestment / Math.max(item.content.investmentGoal, 1)) * 100),
        100,
      ),
      distanceToTop100: rank > 100 ? distanceToTop100 : null,
      motivationalMessage,
      isFree: item.content.isFree,
    } satisfies RankedProject
  })
}

// ── Get top 100 by category (for leaderboard + API) ──

export function getTop100ByCategory(
  contentType?: string,
  limit: number = 100,
): (RankedProject & { score: VisualScoreBreakdown; scores: Record<string, number> })[] {
  // Rank all projects
  let ranked = rankProjectsFromMock(ALL_CONTENTS)

  // Filter by category if specified
  if (contentType && contentType !== "all") {
    ranked = ranked.filter((p) => p.contentType === contentType)
  }

  // Return top N with extended score breakdown
  return ranked.slice(0, limit).map((p) => {
    const content = ALL_CONTENTS.find((c: Content) => c.id === p.contentId)
    const signals: ProjectSignals = {
      contentId: p.contentId,
      contentType: p.contentType,
      currentInvestment: p.currentInvestment,
      investmentGoal: p.investmentGoal,
      investorCount: p.investorCount,
      totalVotes: p.totalVotes,
      likes: Math.round(p.totalVotes * 0.6),
      comments: Math.round(p.totalVotes * 0.15),
      shares: Math.round(p.totalVotes * 0.10),
      favourites: Math.round(p.totalVotes * 0.15),
      avgCompletionRate: Math.min(0.5 + p.investorCount / 120, 0.95),
      daysSincePublished: Math.max(1, Math.round((Date.now() - new Date(content?.createdAt || Date.now()).getTime()) / (1000 * 60 * 60 * 24))),
      recentInvestmentEur: Math.round(p.currentInvestment * 0.35),
      viewGrowthRate: Math.min(p.progressPct / 100 * 0.8 + p.investorCount / 200, 1),
      creatorTrustScore: Math.min(55 + p.investorCount * 0.5, 100),
      creatorVerified: p.investorCount >= 30,
      hasTicketGoldActive: content?.hasTicketGoldActive ?? false,
      currentWave: p.wave,
    }
    const scoreBreakdown = computeVisualScore(signals)

    return {
      ...p,
      score: scoreBreakdown,
      scores: {
        investment: scoreBreakdown.investmentScore,
        engagement: scoreBreakdown.engagementScore,
        longevity: scoreBreakdown.completionScore,
        momentum: scoreBreakdown.growthScore,
        community: scoreBreakdown.trustScore,
        creator: scoreBreakdown.qualityBonus,
      }
    }
  })
}
