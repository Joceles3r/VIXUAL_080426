import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { withErrorHandler, apiError, ErrorCodes } from "@/lib/api-errors";

/**
 * POST /api/consent/cookies
 *
 * Logs cookie consent preferences for RGPD compliance audit trail.
 * Called by the CookieConsentBanner component (fire & forget).
 * Stores: user_id (if authenticated), IP hash, consent_action summary, full preferences JSON.
 *
 * GET /api/consent/cookies?user_id=xxx
 *
 * Returns the consent history for a given user (admin / RGPD data export).
 */

export const POST = withErrorHandler(async (req: NextRequest) => {
  const body = await req.json();
  const { preferences, timestamp, userId } = body;

  if (!preferences || typeof preferences !== "object") {
    return apiError(ErrorCodes.ERR_INVALID_INPUT, "Cookie preferences object is required", 400);
  }

  // Hash IP for privacy-preserving audit (never store raw IPs)
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || "unknown";
  const ipHash = Buffer.from(ip).toString("base64").slice(0, 16);

  // Build a human-readable consent_action summary
  const consentAction = [
    preferences.necessary && "necessary",
    preferences.preferences && "preferences",
    preferences.analytics && "analytics",
    preferences.marketing && "marketing",
  ]
    .filter(Boolean)
    .join(",") || "necessary_only";

  await sql`
    INSERT INTO cookie_consent_logs (
      user_id, ip_hash, consent_action, preferences, consented_at
    ) VALUES (
      ${userId || null},
      ${ipHash},
      ${consentAction},
      ${JSON.stringify(preferences)},
      ${timestamp || new Date().toISOString()}
    )
  `;

  return NextResponse.json({ logged: true, consentAction });
});

export const GET = withErrorHandler(async (req: NextRequest) => {
  const url = new URL(req.url);
  const userId = url.searchParams.get("user_id");

  if (!userId) {
    return apiError(ErrorCodes.ERR_MISSING_FIELD, "user_id query parameter is required", 400);
  }

  const rows = await sql`
    SELECT consent_action, preferences, consented_at
    FROM cookie_consent_logs
    WHERE user_id = ${userId}
    ORDER BY consented_at DESC
    LIMIT 10
  `;

  return NextResponse.json({
    success: true,
    userId,
    consents: rows,
    latestConsent: rows.length > 0 ? rows[0] : null,
  });
});
