/**
 * GET /api/visupoints/balance?userId=...
 *
 * Returns full VIXUpoints status: balance, daily/profile caps, abuse flags.
 */

import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { apiError, ErrorCodes, withErrorHandler } from "@/lib/api-errors";
import {
  DAILY_VIXUPOINTS_CAP,
  PROFILE_VIXUPOINTS_CONFIG,
  MINOR_VIXUPOINTS_CAP,
  canWithdraw,
  canConvertVixupoints,
  detectVixupointsAbuse,
} from "@/lib/vixupoints-engine";

export const GET = withErrorHandler(async (req: Request) => {
  const url = new URL(req.url);
  const userId = url.searchParams.get("userId");

  if (!userId) {
    return apiError(ErrorCodes.ERR_MISSING_FIELD, "userId query param required", 400);
  }

  const users = await sql`
    SELECT id, role, is_minor, visupoints_balance, kyc_verified, account_status, created_at
    FROM users WHERE id = ${userId} LIMIT 1
  `;
  if (!users || users.length === 0) {
    return apiError(ErrorCodes.ERR_USER_NOT_FOUND, "User not found", 404);
  }

  const user = users[0];
  const balance = Number(user.visupoints_balance || 0);
  const isMinor = user.is_minor ?? false;
  const role = user.role || "visitor";

  // Daily usage
  const today = new Date().toISOString().slice(0, 10);
  const dailyRows = await sql`
    SELECT COALESCE(SUM(points), 0) as total
    FROM visupoints_transactions
    WHERE user_id = ${userId} AND DATE(created_at) = ${today} AND type = 'credit'
  `;
  const dailyEarned = Number(dailyRows[0]?.total || 0);

  // Profile cap
  const profileKey = isMinor ? "visitor_minor" : (role === "visitor" ? "visitor_adult" : role);
  const profileConfig = PROFILE_VIXUPOINTS_CONFIG[profileKey] || PROFILE_VIXUPOINTS_CONFIG.visitor_adult;

  // Weekly data for abuse detection
  const weekRows = await sql`
    SELECT DATE(created_at) as day, COALESCE(SUM(points), 0) as total
    FROM visupoints_transactions
    WHERE user_id = ${userId} AND type = 'credit' AND created_at > NOW() - INTERVAL '7 days'
    GROUP BY DATE(created_at) ORDER BY day DESC
  `;
  const dailyEarnings = weekRows.map(r => Number(r.total));

  const accountAgeDays = Math.floor(
    (Date.now() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24)
  );

  const abuse = detectVixupointsAbuse(dailyEarnings, balance, accountAgeDays);

  const withdrawCheck = canWithdraw(isMinor, user.kyc_verified ?? false);
  const convertCheck = canConvertVixupoints(isMinor);

  return NextResponse.json({
    userId,
    balance,
    isMinor,
    role,
    caps: {
      daily: { limit: DAILY_VIXUPOINTS_CAP, used: dailyEarned, remaining: Math.max(0, DAILY_VIXUPOINTS_CAP - dailyEarned) },
      profile: { capType: profileConfig.capType, limit: profileConfig.cap === Infinity ? null : profileConfig.cap, remaining: profileConfig.cap === Infinity ? null : Math.max(0, profileConfig.cap - balance) },
      minor: isMinor ? { limit: MINOR_VIXUPOINTS_CAP, remaining: Math.max(0, MINOR_VIXUPOINTS_CAP - balance) } : null,
    },
    permissions: {
      canUseVixupoints: profileConfig.canUseVixupoints,
      canPayEuros: profileConfig.canPayEuros,
      canUseHybrid: profileConfig.canUseHybrid,
    },
    canWithdraw: withdrawCheck,
    canConvert: convertCheck,
    abuseDetection: abuse.riskScore >= 30 ? { riskScore: abuse.riskScore, flags: abuse.flags } : null,
  });
});
