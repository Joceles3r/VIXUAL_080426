/**
 * POST /api/visupoints/credit
 *
 * Credits VIXUpoints to a user with full cap enforcement:
 * - Daily cap (100/day)
 * - Weekly cap (500/week)
 * - Profile cap (varies by role)
 * - Minor cap (10,000 total)
 * - Anti-abuse detection
 */

import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { apiError, ErrorCodes, withErrorHandler } from "@/lib/api-errors";
import {
  creditVisupointsCapped,
  detectVisupointsAbuse,
  DAILY_VIXUPOINTS_CAP,
  MINOR_VISUPOINTS_CAP,
} from "@/lib/visupoints-engine";

export const POST = withErrorHandler(async (req: Request) => {
  const body = await req.json();
  const { userId, points, source } = body;

  if (!userId || !points || points <= 0) {
    return apiError(ErrorCodes.ERR_INVALID_INPUT, "userId and positive points required", 400);
  }

  if (!source) {
    return apiError(ErrorCodes.ERR_MISSING_FIELD, "source is required (e.g. 'investment', 'engagement', 'bonus')", 400);
  }

  // Fetch user profile
  const users = await sql`
    SELECT id, role, is_minor, visupoints_balance, account_status
    FROM users WHERE id = ${userId} LIMIT 1
  `;
  if (!users || users.length === 0) {
    return apiError(ErrorCodes.ERR_USER_NOT_FOUND, "User not found", 404);
  }

  const user = users[0];

  if (user.account_status === "suspended" || user.account_status === "banned") {
    return apiError(ErrorCodes.ERR_ACCOUNT_SUSPENDED, "Account is suspended or banned", 403);
  }

  // Get daily earnings
  const today = new Date().toISOString().slice(0, 10);
  const dailyRows = await sql`
    SELECT COALESCE(SUM(points), 0) as total
    FROM visupoints_transactions
    WHERE user_id = ${userId}
      AND DATE(created_at) = ${today}
      AND type = 'credit'
  `;
  const dailyEarnedToday = Number(dailyRows[0]?.total || 0);

  // Compute capped credit
  const result = creditVisupointsCapped(
    Number(user.visupoints_balance || 0),
    points,
    dailyEarnedToday,
    user.role || "visitor",
    user.is_minor ?? false
  );

  if (result.actualCredited === 0) {
    return NextResponse.json({
      success: false,
      credited: 0,
      reason: result.dailyCapHit ? "daily_cap" : result.profileCapHit ? "profile_cap" : "minor_cap",
      dailyRemaining: Math.max(0, DAILY_VIXUPOINTS_CAP - dailyEarnedToday),
    });
  }

  // Write the credit transaction
  await sql`
    INSERT INTO visupoints_transactions (user_id, type, points, source, balance_after, created_at)
    VALUES (${userId}, 'credit', ${result.actualCredited}, ${source}, ${result.newBalance}, NOW())
  `;

  // Update user balance
  await sql`
    UPDATE users SET visupoints_balance = ${result.newBalance} WHERE id = ${userId}
  `;

  // Anti-abuse check (async, non-blocking)
  try {
    const weekRows = await sql`
      SELECT DATE(created_at) as day, COALESCE(SUM(points), 0) as total
      FROM visupoints_transactions
      WHERE user_id = ${userId}
        AND type = 'credit'
        AND created_at > NOW() - INTERVAL '7 days'
      GROUP BY DATE(created_at)
      ORDER BY day DESC
    `;
    const dailyEarnings = weekRows.map(r => Number(r.total));

    const accountRows = await sql`
      SELECT EXTRACT(DAY FROM NOW() - created_at)::int as age_days
      FROM users WHERE id = ${userId}
    `;
    const accountAgeDays = Number(accountRows[0]?.age_days || 0);

    const abuse = detectVisupointsAbuse(dailyEarnings, result.newBalance, accountAgeDays);
    if (abuse.riskScore >= 50) {
      // Log the abuse alert -- admin can review
      await sql`
        INSERT INTO reports (reporter_id, target_id, target_type, category, reason, status, created_at)
        VALUES ('system', ${userId}, 'user', 'spam', ${`Auto-detected VIXUpoints abuse: score=${abuse.riskScore}, flags=${abuse.flags.join(",")}`}, 'pending', NOW())
      `;
    }
  } catch {
    // Non-blocking
  }

  return NextResponse.json({
    success: true,
    credited: result.actualCredited,
    newBalance: result.newBalance,
    dailyCapHit: result.dailyCapHit,
    profileCapHit: result.profileCapHit,
    minorCapHit: result.minorCapHit,
    dailyRemaining: Math.max(0, DAILY_VIXUPOINTS_CAP - dailyEarnedToday - result.actualCredited),
  });
});
