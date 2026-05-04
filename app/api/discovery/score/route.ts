import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { ErrorCodes, apiError } from "@/lib/api-errors";
import { computeVisualScore, getTop100ByCategory } from "@/lib/discovery/engine";
import { ALL_CONTENTS } from "@/lib/mock-data";

/**
 * POST /api/discovery/score
 *
 * Compute or refresh VIXUAL Score for a specific project.
 * Accepts: contentId (query param)
 * Returns: updated discovery_score object with all metrics
 */
export async function POST(request: NextRequest) {
  try {
    const contentId = request.nextUrl.searchParams.get("contentId")
    if (!contentId) return apiError(ErrorCodes.ERR_INVALID_INPUT, "contentId required", 400)
    const content = ALL_CONTENTS.find(c => c.id === contentId)
    if (!content) return apiError(ErrorCodes.ERR_CONTENT_NOT_FOUND, "Content not found", 404)

    const signals: any = {
      contentId: content.id,
      contentType: content.contentType,
      currentInvestment: content.currentInvestment,
      investmentGoal: content.investmentGoal,
      investorCount: content.investorCount ?? content.contributorCount,
      totalVotes: content.totalVotes,
      likes: 0, comments: 0, shares: 0, favourites: 0,
      avgCompletionRate: 0.5,
      daysSincePublished: Math.floor((Date.now() - new Date(content.createdAt).getTime()) / 86400000),
      recentInvestmentEur: 0, viewGrowthRate: 0,
      creatorTrustScore: 60, creatorVerified: false,
      creatorGoldPass: (content as any).goldPass ?? false,
      currentWave: 1,
    }

    const score: any = computeVisualScore(signals)
    await sql`
      INSERT INTO discovery_scores (content_id, visual_score, snapshot_data, computed_at)
      VALUES (${contentId}, ${score.total ?? 0}, ${JSON.stringify(score)}, NOW())
      ON CONFLICT (content_id) DO UPDATE SET
        visual_score = EXCLUDED.visual_score,
        snapshot_data = EXCLUDED.snapshot_data,
        computed_at = NOW(),
        updated_at = NOW()
    `
    return NextResponse.json({ success: true, contentId, score })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Internal"
    return apiError(ErrorCodes.ERR_INTERNAL, msg, 500)
  }
}

/**
 * GET /api/discovery/score
 *
 * Get top 100 projects by category.
 * Accepts: category (query param, optional), limit (query param, optional, default 100)
 * Returns: array of projects with scores
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const contentType = searchParams.get("category") as any;
    const limit = Math.min(parseInt(searchParams.get("limit") || "100"), 500);

    const top100 = getTop100ByCategory(contentType, limit);

    return NextResponse.json({
      success: true,
      contentType: contentType || "all",
      count: top100.length,
      results: top100,
    });
  } catch (error: unknown) {
    console.error("[VIXUAL API] Discovery query error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return apiError(ErrorCodes.ERR_INTERNAL, message, 500);
  }
}
