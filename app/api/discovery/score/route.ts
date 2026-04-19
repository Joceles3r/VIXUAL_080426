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
    const { searchParams } = request.nextUrl;
    const contentId = searchParams.get("contentId");

    if (!contentId) {
      return apiError(ErrorCodes.ERR_INVALID_INPUT, "contentId query param required", 400);
    }

    // Find content in mock data
    const content = ALL_CONTENTS.find((c) => c.id === contentId);
    if (!content) {
      return apiError(ErrorCodes.ERR_CONTENT_NOT_FOUND, "Content not found", 404);
    }

    // Compute VIXUAL Score
    const score = computeVisualScore(content);

    // Upsert into discovery_scores table
    await sql`
      INSERT INTO discovery_scores (
        content_id, visual_score, score_investment, score_engagement, score_longevity,
        score_momentum, score_community, score_creator, wave_level, badge, rank,
        is_top_100, detected_manipulation, snapshot_data, computed_at
      )
      VALUES (
        ${contentId}, ${score.visualScore}, ${score.scores.investment},
        ${score.scores.engagement}, ${score.scores.longevity}, ${score.scores.momentum},
        ${score.scores.community}, ${score.scores.creator}, ${score.waveLevel},
        ${score.badge}, ${score.rank || null}, ${score.isTop100},
        ${score.detectedManipulation}, ${JSON.stringify(score)}, NOW()
      )
      ON CONFLICT (content_id) DO UPDATE SET
        visual_score = EXCLUDED.visual_score,
        score_investment = EXCLUDED.score_investment,
        score_engagement = EXCLUDED.score_engagement,
        score_longevity = EXCLUDED.score_longevity,
        score_momentum = EXCLUDED.score_momentum,
        score_community = EXCLUDED.score_community,
        score_creator = EXCLUDED.score_creator,
        wave_level = EXCLUDED.wave_level,
        badge = EXCLUDED.badge,
        rank = EXCLUDED.rank,
        is_top_100 = EXCLUDED.is_top_100,
        detected_manipulation = EXCLUDED.detected_manipulation,
        snapshot_data = EXCLUDED.snapshot_data,
        computed_at = NOW(),
        updated_at = NOW()
    `;

    return NextResponse.json({
      success: true,
      contentId,
      ...score,
    });
  } catch (error: unknown) {
    console.error("[VIXUAL API] Discovery score error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return apiError(ErrorCodes.ERR_INTERNAL, message, 500);
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
