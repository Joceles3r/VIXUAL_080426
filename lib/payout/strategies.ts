/**
 * VIXUAL Payout Engine V3 -- Strategy Pattern
 *
 * Refactored from monolithic payout-engine.ts into per-category strategies
 * implementing a common PayoutStrategy interface. This limits side-effects
 * when modifying one category's formula and enables isolated testing.
 *
 * Each strategy:
 * 1. Validates inputs for its category
 * 2. Computes allocations using category-specific formulas
 * 3. Returns allocations + platform fee + residuals
 */

import type {
  PayoutAllocation,
  PayoutEngineInput,
  Currency,
  PayoutCategory,
} from "./types";

import {
  FILMS_VIXUAL_BPS,
  FILMS_INVESTOR_TOP10_RANK_BPS,
  FILMS_CREATOR_TOP10_RANK_BPS,
  FILMS_INVESTOR_11_100_BPS,
  PODCASTS_POT_CREATORS_PERCENT,
  PODCASTS_POT_INVESTORS_PERCENT,
  PODCASTS_POT_VIXUAL_PERCENT,
  PODCASTS_POT_BONUS_PERCENT,
  PODCASTS_BONUS_BREAKDOWN,
  PODCASTS_ANTI_CAPTURE_MAX_VOTE_SHARE,
  VOIXINFO_POT_AUTHORS_TOP10_PERCENT,
  VOIXINFO_POT_READERS_PERCENT,
  LIVRES_POT_AUTHORS_TOP10_PERCENT,
  LIVRES_POT_INVESTIREADERS_PERCENT,
} from "./constants";

// ── Shared utilities ──

const BPS_DENOM = 10000;

export function euroFloor(cents: number): { floored: number; residual: number } {
  const floored = Math.floor(cents / 100) * 100;
  return { floored, residual: cents - floored };
}

function mulBpsFloor(amountCents: number, bps: number): number {
  return Math.floor((amountCents * bps) / BPS_DENOM);
}

function sum(arr: readonly number[]) {
  return arr.reduce((a, b) => a + b, 0);
}

/**
 * Fonction centralisée pour gérer les arrondis dans les répartitions financières.
 * Garantit que la somme des allocations est toujours égale au montant initial.
 */
function finalizeAllocations(
  allocations: PayoutAllocation[],
  residualTotal: number,
  totalAmount: number,
): PayoutAllocation[] {
  // Vérifier que la somme des allocations + résidu = total
  const sumAllocated = allocations.reduce((s, a) => s + a.amountCents, 0);
  const expectedSum = totalAmount - residualTotal;
  
  if (sumAllocated !== expectedSum) {
    console.warn(
      `[PAYOUT] Rounding discrepancy detected: allocated=${sumAllocated}, expected=${expectedSum}, diff=${expectedSum - sumAllocated}`
    );
    
    // Corriger la dernière allocation pour compenser la différence
    if (allocations.length > 0) {
      const lastAlloc = allocations[allocations.length - 1];
      lastAlloc.amountCents += (expectedSum - sumAllocated);
    }
  }
  
  return allocations;
}

// ── Strategy interface ──

export interface StrategyResult {
  allocations: PayoutAllocation[];
  platformFeeGross: number;
  residualTotal: number;
  warnings: string[];
}

export interface PayoutStrategy {
  category: PayoutCategory;
  compute(input: PayoutEngineInput, G: number, currency: Currency): StrategyResult;
}

// ── Film Strategy (40/30/7/23) ──

export class FilmStrategy implements PayoutStrategy {
  category: PayoutCategory = "films";

  compute(input: PayoutEngineInput, G: number, currency: Currency): StrategyResult {
    const warnings: string[] = [];
    const allocations: PayoutAllocation[] = [];
    let residualTotal = 0;

    if (input.top10Investors.length !== 10) {
      warnings.push(`top10Investors must have length 10, got ${input.top10Investors.length}.`);
    }
    if (input.top10Creators.length !== 10) {
      warnings.push(`top10Creators must have length 10, got ${input.top10Creators.length}.`);
    }

    const totalBps = sum(FILMS_INVESTOR_TOP10_RANK_BPS) + sum(FILMS_CREATOR_TOP10_RANK_BPS) + FILMS_INVESTOR_11_100_BPS + FILMS_VIXUAL_BPS;
    if (totalBps !== BPS_DENOM) warnings.push(`Films total BPS expected 10000, got ${totalBps}.`);

    const platformFeeGross = mulBpsFloor(G, FILMS_VIXUAL_BPS);

    // Contributeurs TOP10 (40% rank-weighted)
    for (let r = 0; r < Math.min(10, input.top10Investors.length); r++) {
      const winner = input.top10Investors[r];
      const gross = mulBpsFloor(G, FILMS_INVESTOR_TOP10_RANK_BPS[r]);
      const { floored, residual } = euroFloor(gross);
      residualTotal += residual;
      allocations.push({
        userId: winner.userId, role: winner.role, bucket: "INV_TOP10",
        amountCents: floored, grossCents: gross, roundingResidualCents: residual,
        currency, meta: { cycleId: input.cycleId, rank: r + 1, bps: FILMS_INVESTOR_TOP10_RANK_BPS[r], category: this.category },
      });
    }

    // Porteurs TOP10 (30% rank-weighted)
    for (let r = 0; r < Math.min(10, input.top10Creators.length); r++) {
      const winner = input.top10Creators[r];
      const gross = mulBpsFloor(G, FILMS_CREATOR_TOP10_RANK_BPS[r]);
      const { floored, residual } = euroFloor(gross);
      residualTotal += residual;
      allocations.push({
        userId: winner.userId, role: winner.role, bucket: "PORTEUR_TOP10",
        amountCents: floored, grossCents: gross, roundingResidualCents: residual,
        currency, meta: { cycleId: input.cycleId, rank: r + 1, bps: FILMS_CREATOR_TOP10_RANK_BPS[r], category: this.category },
      });
    }

    // Contributeurs rangs 11-100 (7% equal split)
    const eligible = input.investors11to100 ?? [];
    const pool11_100Gross = mulBpsFloor(G, FILMS_INVESTOR_11_100_BPS);

    if (eligible.length === 0) {
      residualTotal += pool11_100Gross;
      warnings.push("No eligible investors11to100 provided; 7% pool captured by VIXUAL.");
    } else {
      const perUserGross = Math.floor(pool11_100Gross / eligible.length);
      for (const u of eligible) {
        const { floored, residual } = euroFloor(perUserGross);
        residualTotal += residual;
        allocations.push({
          userId: u.userId, role: u.role, bucket: "INV_11_100",
          amountCents: floored, grossCents: perUserGross, roundingResidualCents: residual,
          currency, meta: { cycleId: input.cycleId, group: "11-100", category: this.category },
        });
      }
      const divRemainder = pool11_100Gross - perUserGross * eligible.length;
      if (divRemainder > 0) residualTotal += divRemainder;
    }

    return { allocations, platformFeeGross, residualTotal, warnings };
  }
}

// ── Podcast Strategy (40/30/20/10) ──

export class PodcastStrategy implements PayoutStrategy {
  category: PayoutCategory = "podcasts";

  compute(input: PayoutEngineInput, G: number, currency: Currency): StrategyResult {
    const warnings: string[] = [];
    const allocations: PayoutAllocation[] = [];
    let residualTotal = 0;

    const creatorsPool = Math.floor((G * PODCASTS_POT_CREATORS_PERCENT) / 100);
    const investorsPool = Math.floor((G * PODCASTS_POT_INVESTORS_PERCENT) / 100);
    const bonusPool = Math.floor((G * PODCASTS_POT_BONUS_PERCENT) / 100);
    const platformFeeGross = Math.floor((G * PODCASTS_POT_VIXUAL_PERCENT) / 100);

    // 40% Podcasteurs (rank-weighted)
    const totalWeight = 55;
    for (let r = 0; r < Math.min(10, input.top10Creators.length); r++) {
      const creator = input.top10Creators[r];
      const weight = 10 - r;
      const gross = Math.floor((creatorsPool * weight) / totalWeight);
      const { floored, residual } = euroFloor(gross);
      residualTotal += residual;
      allocations.push({
        userId: creator.userId, role: creator.role, bucket: "PODCAST_CREATORS",
        amountCents: floored, grossCents: gross, roundingResidualCents: residual,
        currency, meta: { cycleId: input.cycleId, rank: r + 1, weight, category: this.category },
      });
    }

    // 30% Auditeurs investisseurs (pro-rata with anti-capture cap)
    const allInvestors = [...input.top10Investors, ...(input.investors11to100 ?? [])];
    const totalGlobalVotes = input.totalGlobalVotes ?? allInvestors.length;
    const listenScores = input.listenScores ?? {};

    const investorWeights = allInvestors.map((inv, idx) => {
      const ls = listenScores[inv.userId] ?? 0.5;
      let effectiveVotes = idx < 10 ? (10 - idx) : 1;
      if (totalGlobalVotes > 0 && effectiveVotes / totalGlobalVotes > PODCASTS_ANTI_CAPTURE_MAX_VOTE_SHARE) {
        effectiveVotes = Math.floor(totalGlobalVotes * PODCASTS_ANTI_CAPTURE_MAX_VOTE_SHARE);
        warnings.push(`Anti-capture cap applied to ${inv.userId}.`);
      }
      return { ...inv, weight: effectiveVotes * ls };
    });
    const totalInvWeight = investorWeights.reduce((s, w) => s + w.weight, 0);

    if (totalInvWeight === 0) {
      residualTotal += investorsPool;
      warnings.push("No investor weights for podcasts; 30% pool captured by VIXUAL.");
    } else {
      for (const iw of investorWeights) {
        const gross = Math.floor((investorsPool * iw.weight) / totalInvWeight);
        const { floored, residual } = euroFloor(gross);
        residualTotal += residual;
        allocations.push({
          userId: iw.userId, role: iw.role, bucket: "PODCAST_INVESTORS",
          amountCents: floored, grossCents: gross, roundingResidualCents: residual,
          currency, meta: { cycleId: input.cycleId, weight: iw.weight, category: this.category },
        });
      }
    }

    // 10% Bonus pool (6/2/2)
    const primesPool = Math.floor((G * PODCASTS_BONUS_BREAKDOWN.performancePrimesPercent) / 100);
    const techReserve = Math.floor((G * PODCASTS_BONUS_BREAKDOWN.technicalReservePercent) / 100);
    const eventReserve = Math.floor((G * PODCASTS_BONUS_BREAKDOWN.eventReservePercent) / 100);

    for (let r = 0; r < Math.min(10, input.top10Creators.length); r++) {
      const creator = input.top10Creators[r];
      const weight = 10 - r;
      const gross = Math.floor((primesPool * weight) / totalWeight);
      const { floored, residual } = euroFloor(gross);
      residualTotal += residual;
      allocations.push({
        userId: creator.userId, role: creator.role, bucket: "PODCAST_BONUS",
        amountCents: floored, grossCents: gross, roundingResidualCents: residual,
        currency, meta: { cycleId: input.cycleId, rank: r + 1, weight, category: this.category, bonusType: "performance_prime" },
      });
    }

    const primesDistributed = allocations
      .filter(a => a.meta.bonusType === "performance_prime")
      .reduce((s, a) => s + a.grossCents, 0);
    if (primesPool - primesDistributed > 0) residualTotal += primesPool - primesDistributed;
    residualTotal += techReserve + eventReserve;
    const bonusSubTotal = primesPool + techReserve + eventReserve;
    if (bonusPool - bonusSubTotal > 0) residualTotal += bonusPool - bonusSubTotal;

    return { allocations, platformFeeGross, residualTotal, warnings };
  }
}

// ── Voix de l'Info Strategy (60/40 pot mensuel) ──

export class VoixInfoStrategy implements PayoutStrategy {
  category: PayoutCategory = "voix_info";

  compute(input: PayoutEngineInput, G: number, currency: Currency): StrategyResult {
    const warnings: string[] = [];
    const allocations: PayoutAllocation[] = [];
    let residualTotal = 0;

    const authorsPool = Math.floor((G * VOIXINFO_POT_AUTHORS_TOP10_PERCENT) / 100);
    const readersPool = Math.floor((G * VOIXINFO_POT_READERS_PERCENT) / 100);
    const platformFeeGross = G - authorsPool - readersPool;

    const totalRankWeight = 55;
    for (let r = 0; r < Math.min(10, input.top10Creators.length); r++) {
      const author = input.top10Creators[r];
      const weight = 10 - r;
      const gross = Math.floor((authorsPool * weight) / totalRankWeight);
      const { floored, residual } = euroFloor(gross);
      residualTotal += residual;
      allocations.push({
        userId: author.userId, role: author.role, bucket: "AUTHORS_TOP10",
        amountCents: floored, grossCents: gross, roundingResidualCents: residual,
        currency, meta: { cycleId: input.cycleId, rank: r + 1, weight, category: this.category },
      });
    }

    const readers = [...input.top10Investors, ...(input.investors11to100 ?? [])];
    if (readers.length === 0) {
      residualTotal += readersPool;
      warnings.push("No eligible readers for Voix de l'Info; 40% pool captured by VIXUAL.");
    } else {
      const perReader = Math.floor(readersPool / readers.length);
      for (const reader of readers) {
        const { floored, residual } = euroFloor(perReader);
        residualTotal += residual;
        allocations.push({
          userId: reader.userId, role: reader.role, bucket: "READERS_GAGNANTS",
          amountCents: floored, grossCents: perReader, roundingResidualCents: residual,
          currency, meta: { cycleId: input.cycleId, category: this.category },
        });
      }
      const divRem = readersPool - perReader * readers.length;
      if (divRem > 0) residualTotal += divRem;
    }

    return { allocations, platformFeeGross, residualTotal, warnings };
  }
}

// ── Livres Strategy (60/40 pot mensuel) ──

export class LivresStrategy implements PayoutStrategy {
  category: PayoutCategory = "livres";

  compute(input: PayoutEngineInput, G: number, currency: Currency): StrategyResult {
    const warnings: string[] = [];
    const allocations: PayoutAllocation[] = [];
    let residualTotal = 0;

    const authorsPool = Math.floor((G * LIVRES_POT_AUTHORS_TOP10_PERCENT) / 100);
    const investiReadersPool = Math.floor((G * LIVRES_POT_INVESTIREADERS_PERCENT) / 100);
    const platformFeeGross = G - authorsPool - investiReadersPool;

    const totalRankWeight = 55;
    for (let r = 0; r < Math.min(10, input.top10Creators.length); r++) {
      const author = input.top10Creators[r];
      const weight = 10 - r;
      const gross = Math.floor((authorsPool * weight) / totalRankWeight);
      const { floored, residual } = euroFloor(gross);
      residualTotal += residual;
      allocations.push({
        userId: author.userId, role: author.role, bucket: "AUTHORS_TOP10",
        amountCents: floored, grossCents: gross, roundingResidualCents: residual,
        currency, meta: { cycleId: input.cycleId, rank: r + 1, weight, category: this.category },
      });
    }

    const readers = [...input.top10Investors, ...(input.investors11to100 ?? [])];
    if (readers.length === 0) {
      residualTotal += investiReadersPool;
      warnings.push("No eligible contribu-lecteurs for Livres; 40% pool held in reserve for next cycle.");
    } else {
      const perReader = Math.floor(investiReadersPool / readers.length);
      for (const reader of readers) {
        const { floored, residual } = euroFloor(perReader);
        residualTotal += residual;
        allocations.push({
          userId: reader.userId, role: reader.role, bucket: "READERS_GAGNANTS",
          amountCents: floored, grossCents: perReader, roundingResidualCents: residual,
          currency, meta: { cycleId: input.cycleId, category: this.category },
        });
      }
      const divRem = investiReadersPool - perReader * readers.length;
      if (divRem > 0) residualTotal += divRem;
    }

    return { allocations, platformFeeGross, residualTotal, warnings };
  }
}

// ── Strategy Registry ──

const STRATEGY_MAP: Record<PayoutCategory, PayoutStrategy> = {
  films: new FilmStrategy(),
  podcasts: new PodcastStrategy(),
  voix_info: new VoixInfoStrategy(),
  livres: new LivresStrategy(),
};

export function getStrategy(category: PayoutCategory): PayoutStrategy {
  const strategy = STRATEGY_MAP[category];
  if (!strategy) throw new Error(`No payout strategy for category: ${category}`);
  return strategy;
}
