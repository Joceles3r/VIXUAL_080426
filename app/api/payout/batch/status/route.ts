/**
 * GET /api/payout/batch/status?month=YYYY-MM
 *
 * Returns the status of a monthly batch payout.
 * Admin-only.
 */

import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { withErrorHandler } from "@/lib/api-errors";

export const GET = withErrorHandler(async (req: Request) => {
  const url = new URL(req.url);
  const month = url.searchParams.get("month");

  // Return last 6 months of batches
  const batches = month
    ? await sql`
        SELECT id, month, status, total_gross_cents, total_user_payout_cents,
               total_platform_take_cents, allocations_count, created_at, completed_at
        FROM payout_cycles WHERE month = ${month}
        ORDER BY created_at DESC LIMIT 5
      `
    : await sql`
        SELECT id, month, status, total_gross_cents, total_user_payout_cents,
               total_platform_take_cents, allocations_count, created_at, completed_at
        FROM payout_cycles
        ORDER BY created_at DESC LIMIT 12
      `;

  // Get simulation counts per batch
  const batchIds = batches.map((b: Record<string, unknown>) => b.id);
  const simCounts = batchIds.length > 0
    ? await sql`
        SELECT cycle_id, COUNT(*) as sim_count,
               COUNT(*) FILTER (WHERE integrity_check = true) as passed,
               COUNT(*) FILTER (WHERE integrity_check = false) as failed
        FROM payout_simulations
        WHERE cycle_id = ANY(${batchIds})
        GROUP BY cycle_id
      `
    : [];

  const simMap = new Map(
    (simCounts as Array<Record<string, unknown>>).map(s => [s.cycle_id, s])
  );

  return NextResponse.json({
    batches: batches.map((b: Record<string, unknown>) => {
      const sims = simMap.get(b.id) || { sim_count: 0, passed: 0, failed: 0 };
      return {
        ...b,
        simulations: {
          total: Number((sims as Record<string, unknown>).sim_count || 0),
          passed: Number((sims as Record<string, unknown>).passed || 0),
          failed: Number((sims as Record<string, unknown>).failed || 0),
        },
      };
    }),
  });
});
