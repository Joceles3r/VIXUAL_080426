import { NextResponse } from "next/server";
import { getUserTrustProfile, recordTrustEvent } from "@/lib/trust/engine";
import { getTrustHistory } from "@/lib/trust/repository";
import { apiError, ErrorCodes, withErrorHandler } from "@/lib/api-errors";
import { isAdmin } from "@/lib/admin-guard";
import type { TrustEventType } from "@/lib/trust/types";

/**
 * GET /api/trust?userId=xxx
 * Public: returns trust profile for a user.
 */
export const GET = withErrorHandler(async (req: Request) => {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  if (!userId) return apiError(ErrorCodes.ERR_MISSING_FIELD, "userId required", 400);

  const profile = await getUserTrustProfile(userId);
  const history = await getTrustHistory(userId, 10);

  return NextResponse.json({ profile, recentEvents: history });
});

/**
 * POST /api/trust
 * Admin only: manually record a trust event (boost or penalty).
 */
export const POST = withErrorHandler(async (req: Request) => {
  const body = await req.json();
  const { adminId, userId, eventType, reason, delta } = body as {
    adminId?: string;
    userId?: string;
    eventType?: TrustEventType;
    reason?: string;
    delta?: number;
  };

  if (!adminId || !userId || !eventType) {
    return apiError(ErrorCodes.ERR_MISSING_FIELD, "adminId, userId, eventType required", 400);
  }

  const admin = await isAdmin(adminId);
  if (!admin) return apiError(ErrorCodes.ERR_FORBIDDEN, "Admin only", 403);

  const validAdminTypes: TrustEventType[] = ["admin_boost", "admin_penalty"];
  if (!validAdminTypes.includes(eventType)) {
    return apiError(ErrorCodes.ERR_TRUST_EVENT_INVALID, "Only admin_boost and admin_penalty are allowed via this endpoint", 400);
  }

  const profile = await recordTrustEvent(
    userId,
    eventType,
    reason ?? `Admin action: ${eventType}`,
    { adminId },
    delta
  );

  return NextResponse.json({ success: true, profile });
});
