export type Currency = "eur";

export type Role =
  | "contributor"
  | "contribureader"
  | "listener"
  | "porter"
  | "infoporter"
  | "podcaster"
  | "vixual_platform"
  // Deprecated aliases - maintain for DB compatibility
  | "investor"
  | "investireader";

/** Category determines which formula set applies */
export type PayoutCategory = "films" | "voix_info" | "livres" | "podcasts";

export type Bucket =
  | "INV_TOP10"
  | "PORTEUR_TOP10"
  | "INV_11_100"
  | "VIXUAL_FEE"
  | "VIXUAL_RESIDUAL"
  // Podcasts-specific buckets
  | "PODCAST_CREATORS"
  | "PODCAST_INVESTORS"
  | "PODCAST_VIXUAL"
  | "PODCAST_BONUS"
  // Voix Info / Livres buckets
  | "AUTHORS_TOP10"
  | "READERS_GAGNANTS";

export type PayoutAllocation = {
  userId: string;
  role: Role;
  bucket: Bucket;
  /** Amount that VISUAL should credit to the user's internal wallet (in cents). */
  amountCents: number;
  /** Amount before euro-floor rounding (in cents). */
  grossCents: number;
  /** Cents removed by euro-floor rounding (captured by VISUAL as residual). */
  roundingResidualCents: number;
  currency: Currency;
  meta: Record<string, unknown>;
};

export type LedgerEntryType =
  | "platform_fee"
  | "platform_residual"
  | "wallet_credit_gain"
  | "wallet_debit_withdraw_queue";

export type LedgerStatus = "posted" | "queued";

export type LedgerEntry = {
  entryId: string;
  type: LedgerEntryType;
  /** Optional: userId for user wallet entries. Platform entries omit it. */
  userId?: string;
  amountCents: number; // positive for credits to that wallet/entity, negative for debits
  currency: Currency;
  status: LedgerStatus;
  occurredAt: string; // ISO
  meta: Record<string, unknown>;
};

export type PayoutEngineInput = {
  cycleId: string;

  /** Category determines which formula set to apply */
  category: PayoutCategory;

  /**
   * Alias for category (backward compat with README payout-engine V2).
   * "podcast" maps to category "podcasts", "film" maps to "films".
   * If both `model` and `category` are set, `category` takes precedence.
   */
  model?: "film" | "podcast" | "voix_info" | "livres";

  /** Gross eligible amount for the cycle, AFTER refunds/chargebacks, in cents. */
  grossEligibleCents: number;

  /**
   * TOP10 winners in rank order. Length must be 10.
   * For films: role = investor / porter.
   * For literary: role = investireader / infoporter.
   * For podcasts: role = listener / podcaster.
   */
  top10Investors: { userId: string; role: "investor" | "investireader" | "listener" }[];
  top10Creators: { userId: string; role: "porter" | "infoporter" | "podcaster" }[];

  /**
   * Eligible investors in ranks 11–100 (unique users).
   * Films: 7% pool for ranks 11–100.
   * Podcasts: included in the 30% investor pool (pro-rata).
   * Voix Info / Livres: readers/investi-lecteurs gagnants.
   */
  investors11to100: { userId: string; role: "investor" | "investireader" | "listener" }[];

  /**
   * Podcast-specific: listen_score per investor for weighting.
   * Key = userId, value = listen_score (0-1).
   */
  listenScores?: Record<string, number>;

  /**
   * Podcast-specific: total global votes this month (for anti-capture cap).
   */
  totalGlobalVotes?: number;

  /**
   * Business date (ISO) when this cycle is considered closed, used for ledger timestamps.
   * If omitted, the engine uses current date-time.
   */
  closedAtIso?: string;

  /**
   * Optional: minimum cents to allow a withdraw request later (UI-level).
   * Not used in pure allocation, kept for downstream validation.
   */
  minWithdrawCents?: number;
};

export type PayoutEngineOutput = {
  cycleId: string;
  currency: Currency;

  grossEligibleCents: number;

  /** VISUAL total take in cents (fee + residuals + anything undistributed) */
  platformTakeCents: number;
  /** VISUAL base fee (7% of grossEligible) before adding rounding residuals. */
  platformFeeCents: number;
  /** Sum of euro-floor rounding residuals captured by VISUAL. */
  platformResidualCents: number;

  /** Sum of all credited user amounts (rounded) in cents. */
  totalUserPayoutCents: number;

  allocations: PayoutAllocation[];
  ledgerEntries: LedgerEntry[];

  /** Warnings that do not prevent distribution but should be reviewed. */
  warnings: string[];
};
