/**
 * VIXUAL -- Security & Identity Verification Types
 *
 * Levels:
 *   0 = basique (email verifie + anti-bot)
 *   1 = standard (telephone OTP / 2FA TOTP + identite privee)
 *   2 = fort (KYC via Stripe Connect -- reception de paiements)
 *
 * VPN/Proxy/Tor are treated as *risk signals*, not hard blocks.
 */

// ── Verification level ──
export type UserVerificationLevel = 0 | 1 | 2;

// ── KYC status (Stripe Connect) ──
export type UserKycStatus = "none" | "pending" | "verified" | "restricted";

// ── Risk flags (IP reputation signals) ──
export interface RiskFlags {
  vpnSuspected?: boolean;
  proxySuspected?: boolean;
  torSuspected?: boolean;
  datacenterIp?: boolean;
  /** IP country does not match user-declared country */
  countryMismatch?: boolean;
  /** Fingerprint / heuristic suggests multiple accounts */
  multiAccountSuspected?: boolean;
}

// ── Step-up authentication state ──
export interface StepUpAuth {
  phoneVerified?: boolean;
  totpEnabled?: boolean;
  /** ISO date of the last successful step-up challenge */
  lastStepUpAt?: string;
  trustedDevices?: Array<{
    deviceId: string;
    label?: string;
    firstSeenAt: string;
    lastSeenAt: string;
  }>;
}

// ── Private identity fields (NEVER exposed publicly) ──
export interface UserIdentityPrivate {
  legalFirstName?: string;
  legalLastName?: string;
  /** YYYY-MM-DD */
  birthDate?: string;
  /** ISO 3166-1 alpha-2 ("FR", "ES" ...) */
  country?: string;
  city?: string;
}

// ── Stripe Connect sub-document ──
export interface StripeConnectDoc {
  accountId?: string;
  status?: UserKycStatus;
  lastSyncAt?: string;
}

// ── Withdrawal policy ──
export interface WithdrawalPolicy {
  /** Hours to hold large withdrawals (default 72) */
  largeWithdrawalHoldHours?: number;
  lastWithdrawalRequestAt?: string;
}

// ── Full user document (security-enhanced) ──
export interface UserSecurityDoc {
  uid: string;
  email?: string;
  emailVerified?: boolean;

  roles: string[];
  verificationLevel: UserVerificationLevel;

  /** Private identity -- NEVER exposed publicly */
  identityPrivate?: UserIdentityPrivate;
  stepUp?: StepUpAuth;

  riskFlags?: RiskFlags;
  stripeConnect?: StripeConnectDoc;

  trustScore?: {
    score: number;
    label: "debutant" | "a surveiller" | "correct" | "profil serieux" | "excellent";
  };

  withdrawalPolicy?: WithdrawalPolicy;

  createdAt: string;
  updatedAt: string;
}

// ── Helpers ──

/** Returns true when ANY anonymisation risk flag is active */
export function hasAnonymisedConnection(flags?: RiskFlags): boolean {
  if (!flags) return false;
  return !!(flags.vpnSuspected || flags.proxySuspected || flags.torSuspected);
}

/** Returns true when a step-up is fresh enough (default 7 days) */
export function hasRecentStepUp(
  stepUp?: StepUpAuth,
  maxAgeMinutes = 60 * 24 * 7
): boolean {
  const last = stepUp?.lastStepUpAt ? Date.parse(stepUp.lastStepUpAt) : 0;
  if (!last) return false;
  return (Date.now() - last) / 60_000 <= maxAgeMinutes;
}
