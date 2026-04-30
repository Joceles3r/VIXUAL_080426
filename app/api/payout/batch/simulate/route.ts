/**
 * POST /api/payout/batch/simulate
 *
 * Runs a full batch simulation without committing.
 * Admin-only. Returns detailed breakdown per category.
 */

import { NextResponse } from "next/server";
import { adminGuard } from "@/lib/admin-guard";
import { apiError, ErrorCodes, withErrorHandler } from "@/lib/api-errors";
import { simulateBatch, getCurrentMonth } from "@/lib/payout/batch";

export const POST = withErrorHandler(async (req: any): Promise<any> => {
  const body = await req.json();
  const { email, month } = body;

  const denied = adminGuard(email);
  if (denied) return denied;

  const targetMonth = month || getCurrentMonth();
  const result = await simulateBatch(targetMonth);

  return NextResponse.json({
    success: true,
    simulation: result,
  });
});
