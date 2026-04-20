/**
 * VIXUAL -- Risk Gate Engine
 *
 * Central decision engine: "can this user do this action right now?"
 *
 * Used by every monetary API route (invest, buy, withdraw, payout, create).
 * Returns a GateDecision with allowed/blocked + reason code + UX message.
 */

import type { UserSecurityDoc } from "./types";
import { hasAnonymisedConnection, hasRecentStepUp } from "./types";

// ── Action kinds gated by this engine ──
export type ActionKind =
  | "INVEST"
  | "BUY_EUR"
  | "CREATE_PROJECT"
  | "REQUEST_WITHDRAWAL"
  | "RECEIVE_PAYOUT";

// ── Gate decision ──
export type GateReasonCode =
  | "NOT_AUTHENTICATED"
  | "EMAIL_NOT_VERIFIED"
  | "NEED_LEVEL_1"
  | "NEED_LEVEL_2"
  | "VPN_STEP_UP_REQUIRED"
  | "WITHDRAWAL_REVIEW_REQUIRED"
  | "KYC_RESTRICTED";

export interface GateDecision {
  allowed: boolean;
  reasonCode?: GateReasonCode;
  /** Human-readable French message safe to show in the UI */
  message: string;
  /** Optional: recommended action for the frontend */
  suggestedAction?: "VERIFY_EMAIL" | "STEP_UP" | "KYC" | "DISABLE_VPN" | "WAIT";
}

// ── Thresholds ──
const LARGE_WITHDRAWAL_CENTS = 100_000; // 1 000 EUR
const DEFAULT_HOLD_HOURS = 72;

// ── Engine ──

export function gateAction(
  user: UserSecurityDoc | null,
  action: ActionKind,
  amountCents?: number
): GateDecision {
  // ─ Not authenticated ─
  if (!user) {
    return {
      allowed: false,
      reasonCode: "NOT_AUTHENTICATED",
      message: "Connexion requise.",
      suggestedAction: "VERIFY_EMAIL",
    };
  }

  // ─ Email not verified ─
  if (!user.emailVerified) {
    return {
      allowed: false,
      reasonCode: "EMAIL_NOT_VERIFIED",
      message: "Veuillez verifier votre adresse email avant de continuer.",
      suggestedAction: "VERIFY_EMAIL",
    };
  }

  const vpn = hasAnonymisedConnection(user.riskFlags);
  const level = user.verificationLevel ?? 0;

  // ─ Level 1 required for all monetary / creator actions ─
  const needsLevel1: ActionKind[] = [
    "INVEST", "BUY_EUR", "CREATE_PROJECT", "REQUEST_WITHDRAWAL", "RECEIVE_PAYOUT",
  ];
  if (needsLevel1.includes(action) && level < 1) {
    return {
      allowed: false,
      reasonCode: "NEED_LEVEL_1",
      message:
        "Verification standard requise (telephone ou 2FA) avant cette action.",
      suggestedAction: "STEP_UP",
    };
  }

  // ─ VPN + money action => require fresh step-up ─
  const moneyActions: ActionKind[] = ["INVEST", "BUY_EUR", "REQUEST_WITHDRAWAL"];
  if (vpn && moneyActions.includes(action) && !hasRecentStepUp(user.stepUp)) {
    return {
      allowed: false,
      reasonCode: "VPN_STEP_UP_REQUIRED",
      message:
        "Pour securiser les paiements, certaines connexions anonymisees necessitent une verification renforcee. Desactivez votre VPN ou validez votre compte.",
      suggestedAction: "STEP_UP",
    };
  }

  // ─ Withdrawal-specific rules ─
  if (action === "REQUEST_WITHDRAWAL") {
    const holdHours =
      user.withdrawalPolicy?.largeWithdrawalHoldHours ?? DEFAULT_HOLD_HOURS;
    const isLarge = (amountCents ?? 0) >= LARGE_WITHDRAWAL_CENTS;

    if (isLarge && level < 2) {
      return {
        allowed: false,
        reasonCode: "NEED_LEVEL_2",
        message:
          "Verification forte requise (KYC Stripe) pour les retraits superieurs ou egaux a 1000 EUR.",
        suggestedAction: "KYC",
      };
    }

    if (isLarge) {
      return {
        allowed: true,
        reasonCode: "WITHDRAWAL_REVIEW_REQUIRED",
        message: `Retrait accepte : mise en verification automatique (jusqu'a ${holdHours}h) avant declenchement.`,
        suggestedAction: "WAIT",
      };
    }

    // Small withdrawal + VPN => allowed but flagged for review
    if (vpn) {
      return {
        allowed: true,
        reasonCode: "WITHDRAWAL_REVIEW_REQUIRED",
        message:
          "Pour votre securite, ce retrait est mis en verification. Delai habituel : jusqu'a 72h.",
        suggestedAction: "WAIT",
      };
    }
  }

  // ─ Receive payout requires Level 2 + active Stripe ─
  if (action === "RECEIVE_PAYOUT") {
    if (level < 2) {
      return {
        allowed: false,
        reasonCode: "NEED_LEVEL_2",
        message: "KYC requis via Stripe Connect pour recevoir des paiements.",
        suggestedAction: "KYC",
      };
    }
    const status = user.stripeConnect?.status ?? "none";
    if (status === "restricted") {
      return {
        allowed: false,
        reasonCode: "KYC_RESTRICTED",
        message:
          "Votre compte de paiement est restreint. Veuillez completer la verification Stripe.",
        suggestedAction: "KYC",
      };
    }
  }

  // ─ All checks passed ─
  return { allowed: true, message: "OK" };
}

// ── Utility: build a UserSecurityDoc from request-user + DB fields ──
// This bridges the existing RequestUser with the new security type system.
export function buildSecurityDoc(opts: {
  uid: string;
  email?: string;
  emailVerified?: boolean;
  roles?: string[];
  kycVerified?: boolean;
  trustScore?: number;
  riskFlags?: UserSecurityDoc["riskFlags"];
  stepUp?: UserSecurityDoc["stepUp"];
  stripeConnect?: UserSecurityDoc["stripeConnect"];
  withdrawalPolicy?: UserSecurityDoc["withdrawalPolicy"];
}): UserSecurityDoc {
  // Derive verification level from existing fields
  let verificationLevel: 0 | 1 | 2 = 0;
  if (opts.stepUp?.phoneVerified || opts.stepUp?.totpEnabled) {
    verificationLevel = 1;
  }
  if (opts.kycVerified || opts.stripeConnect?.status === "verified") {
    verificationLevel = 2;
  }

  const score = opts.trustScore ?? 50;
  let label: UserSecurityDoc["trustScore"]["label"] = "correct";
  if (score >= 80) label = "excellent";
  else if (score >= 60) label = "profil serieux";
  else if (score >= 40) label = "correct";
  else if (score >= 20) label = "a surveiller";
  else label = "debutant";

  return {
    uid: opts.uid,
    email: opts.email,
    emailVerified: opts.emailVerified ?? true,
    roles: opts.roles ?? [],
    verificationLevel,
    riskFlags: opts.riskFlags,
    stepUp: opts.stepUp,
    stripeConnect: opts.stripeConnect,
    trustScore: { score, label },
    withdrawalPolicy: opts.withdrawalPolicy,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
