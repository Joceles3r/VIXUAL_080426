/**
 * VIXUAL Payout Engine - Point d'entree
 *
 * Ce module exporte l'ensemble du moteur de calcul et des constantes
 * necessaires a la repartition des gains VIXUAL.
 * Pret pour integration Stripe Connect.
 */

// Types
export type {
  Currency,
  Role,
  Bucket,
  PayoutAllocation,
  LedgerEntryType,
  LedgerStatus,
  LedgerEntry,
  PayoutEngineInput,
  PayoutEngineOutput,
} from "./types";

// Moteur de calcul (Strategy-based V3)
export { computePayoutAllocations } from "./payout-engine";
export type { PayoutSimulation } from "./payout-engine";

// Strategies
export { getStrategy, euroFloor } from "./strategies";
export type { PayoutStrategy, StrategyResult } from "./strategies";
export {
  FilmStrategy,
  PodcastStrategy,
  VoixInfoStrategy,
  LivresStrategy,
} from "./strategies";

// Batch payout module
export { simulateBatch, isTodayBatchDay, getCurrentMonth } from "./batch";
export type { BatchSimulationResult, CategorySimulation, BatchStatus } from "./batch";

// Constantes VIXUAL V1
export {
  // Tranches
  INVESTMENT_TIERS_EUR,
  PORTER_PRICE_TIERS_EUR,
  EXTENSION_PRICE_EUR,
  // Cautions
  CAUTION,
  CAUTION_EUR,
  // Votes
  INVESTMENT_TO_VOTES,
  getVotesForInvestment,
  // VIXUpoints
  INVESTMENT_TO_VISUPOINTS,
  getVisupointsForInvestment,
  VISUPOINTS_CONVERSION_THRESHOLD,
  VISUPOINTS_PER_EUR,
  VISUPOINTS_MIN_WITHDRAW_EUR,
  convertVisupoints,
  // Repartition par categorie (nouvelles constantes)
  FILMS_INVESTOR_TOP10_PERCENT,
  FILMS_CREATOR_TOP10_PERCENT,
  FILMS_INVESTOR_11_100_PERCENT,
  FILMS_Vixual_PERCENT,
  FILMS_INVESTOR_TOP10_RANK_BPS,
  FILMS_CREATOR_TOP10_RANK_BPS,
  VOIXINFO_SALE_AUTHOR_PERCENT,
  VOIXINFO_SALE_Vixual_PERCENT,
  VOIXINFO_POT_AUTHORS_TOP10_PERCENT,
  VOIXINFO_POT_READERS_PERCENT,
  VOIXINFO_RANK_WEIGHT,
  LIVRES_SALE_AUTHOR_PERCENT,
  LIVRES_SALE_Vixual_PERCENT,
  LIVRES_POT_AUTHORS_TOP10_PERCENT,
  LIVRES_POT_INVESTIREADERS_PERCENT,
  LIVRES_RANK_WEIGHT,
  LIVRES_REPECHAGE_EUR,
  LIVRES_TARGET_AUTHORS_MONTH,
  PODCASTS_SALE_CREATOR_PERCENT,
  PODCASTS_SALE_Vixual_PERCENT,
  PODCASTS_POT_CREATORS_PERCENT,
  PODCASTS_POT_INVESTORS_PERCENT,
  PODCASTS_POT_VISUAL_PERCENT,
  PODCASTS_POT_BONUS_PERCENT,
  PODCASTS_BONUS_BREAKDOWN,
  PODCASTS_ANTI_CAPTURE_MAX_VOTE_SHARE,
  PODCASTS_LISTEN_SCORE_WEIGHTS,
  CATEGORY_SPLITS,
  CREATOR_QUOTAS,
  // Legacy aliases (backward compat)
  Vixual_FEE_PERCENT,
  Vixual_FEE_BPS,
  INVESTOR_TOP10_PERCENT,
  INVESTOR_TOP10_BPS,
  CREATOR_TOP10_PERCENT,
  CREATOR_TOP10_BPS,
  INVESTOR_11_100_PERCENT,
  INVESTOR_11_100_BPS,
  CREATOR_11_100_PERCENT,
  DISTRIBUTION_TABLE,
  INVESTOR_TOP10_DETAIL,
  CREATOR_TOP10_DETAIL,
  // Vente d'article
  ARTICLE_SALE_AUTHOR_PERCENT,
  ARTICLE_SALE_VISUAL_PERCENT,
  computeArticleSale,
  // Classement
  computeEngagementCoefficient,
  // Stripe
  STRIPE_CONFIG,
  // Mineurs
  MINOR_MIN_AGE,
  MAJORITY_AGE,
  MINOR_VISUPOINTS_CAP,
  MINOR_VISUPOINTS_CAP_EUR,
  ADULT_VISUPOINTS_CONVERSION_THRESHOLD,
  // Profils VIXUpoints
  VISUPOINTS_PROFILE_CAPS,
  VISUPOINTS_MAX_DAILY,
  // Engagement Redirect Engine
  ENGAGEMENT_THRESHOLDS,
  // Paiement hybride
  HYBRID_PAYMENT_MIN_CASH_RATIO,
  HYBRID_PAYMENT_MAX_POINTS_RATIO,
  HYBRID_BONUS_RATIO,
  HYBRID_BONUS_MONTHLY_CAP,
  computeHybridPayment,
  // Evolution profil
  INVESTOR_EVOLUTION_BONUS,
} from "./constants";

export type { VisualCategory, VisupointsProfileKey, EngagementLevel } from "./constants";

// ── Visual Rules Engine V1 (Consolidation Post 9h20) ──
export {
  // R1 - Paiement mensuel
  generateIdempotencyKey,
  getNextBatchDate,
  isBatchDay,
  // R2 - Stripe Connect enforcement
  PAYABLE_ROLES,
  canReceivePayouts,
  // R3 - Interdiction auto-investissement
  checkSelfInvestment,
  // R5 - VIXUAL Trust Score
  computeTrustScore,
  // R6 - Limitation stockage
  STORAGE_LIMITS,
  checkStorageLimit,
  // R7 - Protection medias
  MEDIA_TOKEN_TTL_MS,
  generateMediaToken,
  validateMediaToken,
  // R9 - Promotion externe
  canPromoteExternally,
  // R10 - Declaration propriete
  IP_DECLARATION_TEXT,
  checkIPDeclaration,
  // R11 - Admin capabilities
  ADMIN_CAPABILITIES,
} from "../visual-rules-engine";

export type {
  MonthlyBatchEntry,
  MonthlyBatchResult,
  PayableRole,
  StripeConnectStatus,
  SelfInvestCheckResult,
  TrustScoreInput,
  TrustScoreResult,
  StorageLimitRole,
  StorageCheckResult,
  MediaToken,
  PromotionConsent,
  IPDeclaration,
  AdminCapability,
} from "../visual-rules-engine";
