/**
 * VIXUAL Trust System - Central Index
 * 
 * Consolidation of trust-system.ts and lib/trust/* modules.
 * Import: import { ... } from "@/lib/trust"
 */

// ── Types ──
export {
  type TrustLevel,
  type TrustProfile,
  type TrustScore,
  type TrustEvent,
  type TrustEventType,
  type TrustScoreLevel,
  type BadgeType,
  type TrustBadge,
  TRUST_LEVEL_THRESHOLDS,
  TRUST_LEVEL_LABELS,
  TRUST_BADGES,
  TRUST_SCORE_RANGES,
  scoreToLevel,
  scoreToDetailedLevel,
} from "./types";

// ── Engine ──
export {
  recordTrustEvent,
  getUserTrustProfile,
} from "./engine";

// ── Weights ──
export {
  TRUST_WEIGHTS,
  TRUST_LEVELS,
  TRUST_INITIAL_SCORE,
} from "./weights";

// ── Repository ──
export {
  getTrustProfile,
  updateTrustScore,
  insertTrustEvent,
  getTrustHistory,
} from "./repository";
