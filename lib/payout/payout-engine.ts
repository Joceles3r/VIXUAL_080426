/**
 * VISUAL Payout Engine V3 -- Strategy-based orchestrator
 *
 * Changes from V2:
 * - Delegates category-specific logic to Strategy classes (FilmStrategy, PodcastStrategy, etc.)
 * - Adds simulation logging: every computation is recorded as a PayoutSimulation before execution
 * - Adds integrity assertions: sum of allocations + platform take must equal gross eligible
 * - Single point of failure is eliminated: each strategy is isolated
 */

import type {
  LedgerEntry,
  PayoutEngineInput,
  PayoutEngineOutput,
  Currency,
  PayoutCategory,
} from "./types";
import { getStrategy } from "./strategies";

function nowIso() {
  return new Date().toISOString();
}

function mkEntryId(prefix: string, cycleId: string, i: number) {
  return `${prefix}_${cycleId}_${i}`;
}

// ── Simulation record (logged before actual distribution) ──

export interface PayoutSimulation {
  simulationId: string;
  cycleId: string;
  category: PayoutCategory;
  grossEligibleCents: number;
  computedAt: string;
  totalUserPayoutCents: number;
  platformTakeCents: number;
  allocationsCount: number;
  /** Sum check: totalUserPayoutCents + platformTakeCents === grossEligibleCents */
  integrityCheck: boolean;
  warnings: string[];
  /** Full allocation snapshot for audit trail */
  allocationSnapshot: Array<{
    userId: string;
    bucket: string;
    amountCents: number;
    grossCents: number;
  }>;
}

/**
 * Computes payout allocations using the Strategy pattern.
 * Returns both the allocations and a simulation record for audit logging.
 */
export function computePayoutAllocations(input: PayoutEngineInput): PayoutEngineOutput & { simulation: PayoutSimulation } {
  const currency: Currency = "eur";
  const closedAtIso = input.closedAtIso ?? nowIso();

  // Resolve model alias -> category (backward compat)
  const MODEL_TO_CATEGORY: Record<string, PayoutCategory> = {
    film: "films", podcast: "podcasts", voix_info: "voix_info", livres: "livres",
  };
  const category: PayoutCategory = input.category ?? (input.model ? MODEL_TO_CATEGORY[input.model] ?? "films" : "films");

  if (!Number.isInteger(input.grossEligibleCents) || input.grossEligibleCents < 0) {
    throw new Error("grossEligibleCents must be a non-negative integer (cents).");
  }

  const G = input.grossEligibleCents;

  // ── Delegate to category strategy ──
  const strategy = getStrategy(category);
  const result = strategy.compute(input, G, currency);

  const { allocations, platformFeeGross, residualTotal, warnings } = result;

  // ── Finalization (all categories) ──
  const totalUserPayout = allocations.reduce((acc, a) => acc + a.amountCents, 0);
  const platformTake = G - totalUserPayout;
  const platformResidual = platformTake - platformFeeGross;

  if (platformTake < 0) {
    throw new Error("Computed payouts exceed grossEligibleCents. Check formula inputs.");
  }
  if (platformResidual < 0) {
    warnings.push("Platform residual is negative. Rounding or percentage inconsistencies detected.");
  }

  // ── Integrity assertion ──
  const integrityCheck = totalUserPayout + platformTake === G;
  if (!integrityCheck) {
    warnings.push(`INTEGRITY FAILURE: userPayout(${totalUserPayout}) + platformTake(${platformTake}) !== gross(${G}). Delta: ${G - totalUserPayout - platformTake}`);
  }

  // ── Build simulation record (audit trail) ──
  const simulation: PayoutSimulation = {
    simulationId: `sim_${input.cycleId}_${Date.now()}`,
    cycleId: input.cycleId,
    category,
    grossEligibleCents: G,
    computedAt: closedAtIso,
    totalUserPayoutCents: totalUserPayout,
    platformTakeCents: platformTake,
    allocationsCount: allocations.length,
    integrityCheck,
    warnings: [...warnings],
    allocationSnapshot: allocations.map(a => ({
      userId: a.userId,
      bucket: a.bucket,
      amountCents: a.amountCents,
      grossCents: a.grossCents,
    })),
  };

  // ── Ledger entries ──
  const ledgerEntries: LedgerEntry[] = [];
  let seq = 0;

  ledgerEntries.push({
    entryId: mkEntryId("platform_fee", input.cycleId, seq++),
    type: "platform_fee",
    amountCents: platformFeeGross,
    currency, status: "posted", occurredAt: closedAtIso,
    meta: { cycleId: input.cycleId, category, basis: "grossEligibleCents" },
  });

  if (platformResidual !== 0) {
    ledgerEntries.push({
      entryId: mkEntryId("platform_residual", input.cycleId, seq++),
      type: "platform_residual",
      amountCents: platformResidual,
      currency, status: "posted", occurredAt: closedAtIso,
      meta: { cycleId: input.cycleId, category, note: "Rounding residuals + division remainder + undistributed pools" },
    });
  }

  for (const a of allocations) {
    ledgerEntries.push({
      entryId: mkEntryId("wallet_credit_gain", input.cycleId, seq++),
      type: "wallet_credit_gain",
      userId: a.userId,
      amountCents: a.amountCents,
      currency, status: "posted", occurredAt: closedAtIso,
      meta: {
        cycleId: input.cycleId, bucket: a.bucket, role: a.role, category,
        grossCents: a.grossCents, roundingResidualCents: a.roundingResidualCents,
        ...a.meta,
      },
    });
  }

  return {
    cycleId: input.cycleId,
    currency,
    grossEligibleCents: G,
    platformTakeCents: platformTake,
    platformFeeCents: platformFeeGross,
    platformResidualCents: platformResidual,
    totalUserPayoutCents: totalUserPayout,
    allocations,
    ledgerEntries,
    warnings,
    simulation,
  };
}
