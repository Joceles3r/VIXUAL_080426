/**
 * VISUAL - Batch Payout Module
 *
 * Orchestrates monthly batch payouts across all categories.
 * Flow: simulate -> review -> execute
 *
 * Each batch:
 * 1. Identifies all eligible contents in each category
 * 2. Runs the Strategy-based payout engine for each
 * 3. Aggregates simulations
 * 4. On execute: writes ledger entries + credits wallets
 */

import { sql } from "@/lib/db";
import { computePayoutAllocations } from "./payout-engine";
import type { PayoutSimulation } from "./payout-engine";
import type { PayoutCategory, PayoutEngineInput } from "./types";
import { generateIdempotencyKey, isBatchDay } from "@/lib/visual-rules-engine";

// ── Types ──

export interface BatchSimulationResult {
  batchId: string;
  month: string; // YYYY-MM
  categories: CategorySimulation[];
  totalGrossCents: number;
  totalUserPayoutCents: number;
  totalPlatformTakeCents: number;
  totalAllocations: number;
  allIntegrityPassed: boolean;
  warnings: string[];
  simulatedAt: string;
}

export interface CategorySimulation {
  category: PayoutCategory;
  contentCount: number;
  grossEligibleCents: number;
  userPayoutCents: number;
  platformTakeCents: number;
  allocationsCount: number;
  integrityPassed: boolean;
  simulations: PayoutSimulation[];
  warnings: string[];
}

export type BatchStatus = "pending" | "simulated" | "executing" | "completed" | "failed";

// ── Simulation ──

/**
 * Simulates a full monthly batch payout without committing anything.
 * Returns detailed breakdown per category + integrity checks.
 */
export async function simulateBatch(month: string): Promise<BatchSimulationResult> {
  const batchId = `batch_${month}_${Date.now()}`;
  const idemKey = generateIdempotencyKey(month);
  const warnings: string[] = [];
  const categories: CategorySimulation[] = [];

  // Check if a batch was already executed this month
  const existingBatch = await sql`
    SELECT id FROM payout_cycles
    WHERE idempotency_key = ${idemKey} AND status = 'completed'
    LIMIT 1
  `;
  if (existingBatch && existingBatch.length > 0) {
    warnings.push(`A batch was already executed for ${month}. Re-simulation is informational only.`);
  }

  const allCategories: PayoutCategory[] = ["films", "podcasts", "voix_info", "livres"];

  for (const category of allCategories) {
    const catSim = await simulateCategory(batchId, category, month);
    categories.push(catSim);
    warnings.push(...catSim.warnings);
  }

  const totalGross = categories.reduce((s, c) => s + c.grossEligibleCents, 0);
  const totalUserPayout = categories.reduce((s, c) => s + c.userPayoutCents, 0);
  const totalPlatformTake = categories.reduce((s, c) => s + c.platformTakeCents, 0);
  const totalAllocations = categories.reduce((s, c) => s + c.allocationsCount, 0);
  const allIntegrity = categories.every(c => c.integrityPassed);

  return {
    batchId,
    month,
    categories,
    totalGrossCents: totalGross,
    totalUserPayoutCents: totalUserPayout,
    totalPlatformTakeCents: totalPlatformTake,
    totalAllocations,
    allIntegrityPassed: allIntegrity,
    warnings,
    simulatedAt: new Date().toISOString(),
  };
}

async function simulateCategory(
  batchId: string,
  category: PayoutCategory,
  month: string
): Promise<CategorySimulation> {
  const warnings: string[] = [];
  const simulations: PayoutSimulation[] = [];
  let totalGross = 0;
  let totalUserPayout = 0;
  let totalPlatformTake = 0;
  let totalAllocations = 0;
  let allIntegrity = true;

  // Find eligible contents for this category in this month
  const contents = await sql`
    SELECT c.id, c.category,
      COALESCE(SUM(i.amount_cents), 0) as gross_cents,
      COUNT(DISTINCT i.user_id) as investor_count
    FROM contents c
    LEFT JOIN investments i ON i.content_id = c.id AND i.status = 'completed'
    WHERE c.category = ${category}
      AND c.status = 'funded'
      AND TO_CHAR(c.created_at, 'YYYY-MM') <= ${month}
    GROUP BY c.id, c.category
    HAVING COALESCE(SUM(i.amount_cents), 0) > 0
  `;

  if (!contents || contents.length === 0) {
    warnings.push(`No eligible contents for category ${category} in ${month}.`);
    return {
      category,
      contentCount: 0,
      grossEligibleCents: 0,
      userPayoutCents: 0,
      platformTakeCents: 0,
      allocationsCount: 0,
      integrityPassed: true,
      simulations: [],
      warnings,
    };
  }

  for (const content of contents) {
    const grossCents = Number(content.gross_cents);
    if (grossCents <= 0) continue;

    // Get top investors for this content
    const investors = await sql`
      SELECT user_id, role, SUM(amount_cents) as total
      FROM investments
      WHERE content_id = ${content.id} AND status = 'completed'
      GROUP BY user_id, role
      ORDER BY total DESC
      LIMIT 100
    `;

    const top10Investors = investors.slice(0, 10).map((inv: Record<string, unknown>) => ({
      userId: inv.user_id as string,
      role: (inv.role as string) || "investor",
    }));
    const inv11to100 = investors.slice(10, 100).map((inv: Record<string, unknown>) => ({
      userId: inv.user_id as string,
      role: (inv.role as string) || "investor",
    }));

    // Get top creators
    const creators = await sql`
      SELECT user_id, role FROM content_creators
      WHERE content_id = ${content.id}
      ORDER BY rank ASC
      LIMIT 10
    `;
    const top10Creators = creators.length > 0
      ? creators.map((c: Record<string, unknown>) => ({
          userId: c.user_id as string,
          role: (c.role as string) || "porter",
        }))
      : [{ userId: "unknown-creator", role: "porter" as const }];

    // Pad arrays to 10 if needed
    while (top10Investors.length < 10 && investors.length > 0) {
      top10Investors.push(top10Investors[top10Investors.length - 1]);
    }
    while (top10Creators.length < 10 && creators.length > 0) {
      top10Creators.push(top10Creators[top10Creators.length - 1]);
    }

    const cycleId = `${batchId}_${content.id}`;

    try {
      const engineInput: PayoutEngineInput = {
        cycleId,
        category,
        grossEligibleCents: grossCents,
        top10Investors: top10Investors as PayoutEngineInput["top10Investors"],
        top10Creators: top10Creators as PayoutEngineInput["top10Creators"],
        investors11to100: inv11to100 as PayoutEngineInput["investors11to100"],
        closedAtIso: new Date().toISOString(),
      };

      const result = computePayoutAllocations(engineInput);
      simulations.push(result.simulation);

      totalGross += result.grossEligibleCents;
      totalUserPayout += result.totalUserPayoutCents;
      totalPlatformTake += result.platformTakeCents;
      totalAllocations += result.allocations.length;

      if (!result.simulation.integrityCheck) {
        allIntegrity = false;
        warnings.push(`Integrity check FAILED for content ${content.id} in ${category}.`);
      }
      warnings.push(...result.warnings);
    } catch (err) {
      warnings.push(`Engine error for content ${content.id}: ${err instanceof Error ? err.message : "unknown"}`);
      allIntegrity = false;
    }
  }

  return {
    category,
    contentCount: contents.length,
    grossEligibleCents: totalGross,
    userPayoutCents: totalUserPayout,
    platformTakeCents: totalPlatformTake,
    allocationsCount: totalAllocations,
    integrityPassed: allIntegrity,
    simulations,
    warnings,
  };
}

/**
 * Check if today is batch day (1st of the month).
 */
export function isTodayBatchDay(): boolean {
  const now = new Date();
  return isBatchDay(now);
}

/**
 * Get current month string.
 */
export function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}
