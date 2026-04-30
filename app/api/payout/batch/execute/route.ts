/**
 * POST /api/payout/batch/execute
 *
 * Executes a full monthly batch payout.
 * Flow: simulate -> integrity check -> commit ledger entries -> credit wallets.
 * Admin-only. Idempotent (one batch per month).
 */

import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { adminGuard } from "@/lib/admin-guard";
import { apiError, ErrorCodes, withErrorHandler } from "@/lib/api-errors";
import { simulateBatch, getCurrentMonth, isTodayBatchDay } from "@/lib/payout/batch";
import { generateIdempotencyKey } from "@/lib/vixual-rules-engine";

export const POST = withErrorHandler(async (req: any): Promise<any> => {
  const body = await req.json();
  const { email, month, forceExecution } = body;

  const denied = adminGuard(email);
  if (denied) return denied;

  const targetMonth = month || getCurrentMonth();

  // Check if today is batch day (unless forced)
  if (!forceExecution && !isTodayBatchDay()) {
    return apiError(
      ErrorCodes.ERR_INVALID_INPUT,
      `Today is not batch day (1st of month). Use forceExecution=true to override.`,
      400
    );
  }

  // Idempotency: check if this month's batch was already executed
  const idemKey = generateIdempotencyKey(targetMonth);
  const existing = await sql`
    SELECT id, status FROM payout_cycles
    WHERE idempotency_key = ${idemKey} AND status = 'completed'
    LIMIT 1
  `;
  if (existing && existing.length > 0) {
    return apiError(
      ErrorCodes.ERR_PAYOUT_ALREADY_DISTRIBUTED,
      `Batch for ${targetMonth} was already executed (cycle: ${existing[0].id}).`,
      409
    );
  }

  // Step 1: Simulate
  const simulation = await simulateBatch(targetMonth);

  // Step 2: Integrity gate
  if (!simulation.allIntegrityPassed) {
    return apiError(
      ErrorCodes.ERR_PAYOUT_INTEGRITY,
      `Batch integrity check failed. ${simulation.warnings.length} warnings. Review simulation before executing.`,
      422,
      JSON.stringify(simulation.warnings.slice(0, 10))
    );
  }

  // Step 3: Commit -- create batch record
  const batchRow = await sql`
    INSERT INTO payout_cycles (id, idempotency_key, month, status, total_gross_cents, total_user_payout_cents, total_platform_take_cents, allocations_count, created_at)
    VALUES (${simulation.batchId}, ${idemKey}, ${targetMonth}, 'executing', ${simulation.totalGrossCents}, ${simulation.totalUserPayoutCents}, ${simulation.totalPlatformTakeCents}, ${simulation.totalAllocations}, NOW())
    RETURNING id
  `;

  // Step 4: Log all simulations
  for (const cat of simulation.categories) {
    for (const sim of cat.simulations) {
      await sql`
        INSERT INTO payout_simulations (
          simulation_id, cycle_id, category, gross_eligible_cents,
          total_user_payout_cents, platform_take_cents,
          allocations_count, integrity_check, warnings, allocation_snapshot, computed_at
        ) VALUES (
          ${sim.simulationId}, ${sim.cycleId}, ${sim.category},
          ${sim.grossEligibleCents}, ${sim.totalUserPayoutCents}, ${sim.platformTakeCents},
          ${sim.allocationsCount}, ${sim.integrityCheck},
          ${JSON.stringify(sim.warnings)},
          ${JSON.stringify(sim.allocationSnapshot)},
          ${sim.computedAt}
        )
      `;
    }
  }

  // Step 5: Credit wallets (aggregate per user across all categories)
  const userCredits = new Map<string, number>();
  for (const cat of simulation.categories) {
    for (const sim of cat.simulations) {
      for (const alloc of sim.allocationSnapshot) {
        const current = userCredits.get(alloc.userId) || 0;
        userCredits.set(alloc.userId, current + alloc.amountCents);
      }
    }
  }

  let creditedCount = 0;
  for (const [userId, amountCents] of userCredits) {
    if (amountCents <= 0) continue;
    await sql`
      UPDATE wallets
      SET balance_cents = balance_cents + ${amountCents},
          updated_at = NOW()
      WHERE user_id = ${userId}
    `;
    await sql`
      INSERT INTO wallet_transactions (wallet_id, type, amount_cents, description, created_at)
      SELECT id, 'credit', ${amountCents}, ${`Batch payout ${targetMonth}`}, NOW()
      FROM wallets WHERE user_id = ${userId}
    `;
    creditedCount++;
  }

  // Step 6: Mark batch as completed
  await sql`
    UPDATE payout_cycles SET status = 'completed', completed_at = NOW()
    WHERE id = ${simulation.batchId}
  `;

  return NextResponse.json({
    success: true,
    batchId: simulation.batchId,
    month: targetMonth,
    totalGrossCents: simulation.totalGrossCents,
    totalUserPayoutCents: simulation.totalUserPayoutCents,
    totalPlatformTakeCents: simulation.totalPlatformTakeCents,
    totalAllocations: simulation.totalAllocations,
    usersCredited: creditedCount,
    categorySummary: simulation.categories.map(c => ({
      category: c.category,
      contentCount: c.contentCount,
      grossCents: c.grossEligibleCents,
      userPayoutCents: c.userPayoutCents,
    })),
    warnings: simulation.warnings,
  });
});
