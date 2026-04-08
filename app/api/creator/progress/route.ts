import { NextRequest, NextResponse } from "next/server"
import {
  type CreatorType,
  type CreatorStats,
  type ProgressUpdateReason,
  calculateCreatorProgressScore,
  calculateCreatorLevel,
  getLevelInfo,
  buildCreatorGoals,
  generateCreatorTips,
  getMockCreatorStats,
  getMockCreatorProgress,
  getMockContentImpacts,
  getMockProgressHistory,
  canAccessCreatorProPage,
} from "@/lib/creator-progression"

/**
 * GET /api/creator/progress
 * 
 * Get creator progression data including:
 * - Current level and score
 * - Progress to next level
 * - Dynamic goals
 * - Content impacts
 * - AI tips
 * - History
 * 
 * Query params:
 * - userId: string (required)
 * - creatorType: porter | infoporter | podcaster (required)
 * - include: comma-separated list of sections to include
 *   (progress, stats, goals, tips, contents, history)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const creatorType = searchParams.get("creatorType") as CreatorType | null
    const include = searchParams.get("include")?.split(",") || ["progress", "stats", "goals"]

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      )
    }

    if (!creatorType || !["porter", "infoporter", "podcaster"].includes(creatorType)) {
      return NextResponse.json(
        { error: "creatorType must be porter, infoporter, or podcaster" },
        { status: 400 }
      )
    }

    // In production, this would fetch from database
    // For now, using mock data
    const response: Record<string, unknown> = {}

    if (include.includes("progress")) {
      response.progress = getMockCreatorProgress(userId, creatorType)
    }

    if (include.includes("stats")) {
      response.stats = getMockCreatorStats(userId, creatorType)
    }

    if (include.includes("goals")) {
      const stats = getMockCreatorStats(userId, creatorType)
      const progress = getMockCreatorProgress(userId, creatorType)
      response.goals = buildCreatorGoals(stats, progress.level)
    }

    if (include.includes("tips")) {
      const stats = getMockCreatorStats(userId, creatorType)
      const progress = getMockCreatorProgress(userId, creatorType)
      response.tips = generateCreatorTips(stats, progress.level)
    }

    if (include.includes("contents")) {
      response.contents = getMockContentImpacts(userId)
    }

    if (include.includes("history")) {
      response.history = getMockProgressHistory(userId)
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Error fetching creator progress:", error)
    return NextResponse.json(
      { error: "Failed to fetch creator progress" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/creator/progress
 * 
 * Trigger a progress recalculation for a creator
 * 
 * Body:
 * - userId: string (required)
 * - creatorType: porter | infoporter | podcaster (required)
 * - reason: ProgressUpdateReason (required)
 * - contentId?: string (optional, for content-specific updates)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, creatorType, reason, contentId } = body

    if (!userId || !creatorType || !reason) {
      return NextResponse.json(
        { error: "userId, creatorType, and reason are required" },
        { status: 400 }
      )
    }

    if (!["porter", "infoporter", "podcaster"].includes(creatorType)) {
      return NextResponse.json(
        { error: "creatorType must be porter, infoporter, or podcaster" },
        { status: 400 }
      )
    }

    const validReasons: ProgressUpdateReason[] = [
      "publication_validated",
      "engagement_increase",
      "contribution_increase",
      "daily_batch",
      "manual_admin_recalc",
      "week_activity_bonus",
    ]

    if (!validReasons.includes(reason)) {
      return NextResponse.json(
        { error: `reason must be one of: ${validReasons.join(", ")}` },
        { status: 400 }
      )
    }

    // In production, this would:
    // 1. Fetch current stats from database
    // 2. Recalculate score
    // 3. Update user record
    // 4. Log to history table
    // 5. Check for level up and trigger notifications

    // Mock response
    const previousProgress = getMockCreatorProgress(userId, creatorType)
    const stats = getMockCreatorStats(userId, creatorType)
    
    // Simulate score increase based on reason
    let scoreIncrease = 0
    switch (reason) {
      case "publication_validated":
        scoreIncrease = 15 + Math.floor(Math.random() * 10)
        break
      case "engagement_increase":
        scoreIncrease = 5 + Math.floor(Math.random() * 10)
        break
      case "contribution_increase":
        scoreIncrease = 8 + Math.floor(Math.random() * 7)
        break
      case "daily_batch":
        scoreIncrease = 2 + Math.floor(Math.random() * 5)
        break
      case "week_activity_bonus":
        scoreIncrease = 10 + Math.floor(Math.random() * 10)
        break
      case "manual_admin_recalc":
        scoreIncrease = 0 // Just recalculate, no bonus
        break
    }

    const newScore = previousProgress.score + scoreIncrease
    const newLevel = calculateCreatorLevel(newScore)
    const levelInfo = getLevelInfo(newLevel)
    const leveledUp = newLevel > previousProgress.level

    const result = {
      success: true,
      previousState: {
        score: previousProgress.score,
        level: previousProgress.level,
      },
      newState: {
        score: newScore,
        level: newLevel,
        levelKey: levelInfo.key,
        badge: levelInfo.badge,
        badgeColor: levelInfo.badgeColor,
        proUnlocked: canAccessCreatorProPage(newLevel),
      },
      scoreIncrease,
      leveledUp,
      reason,
      contentId,
      timestamp: new Date().toISOString(),
    }

    // In production, we would also:
    // - Send level-up notification if leveledUp is true
    // - Update visibility boost if level changed
    // - Trigger page PRO unlock if reached level 5

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error updating creator progress:", error)
    return NextResponse.json(
      { error: "Failed to update creator progress" },
      { status: 500 }
    )
  }
}
