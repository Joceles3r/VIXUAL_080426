/**
 * VIXUAL Minors Module -- Route Guards
 *
 * These guards return a NextResponse error if the action is blocked,
 * or null if the action is allowed.
 */

import { NextResponse } from "next/server";
import { isUserMinor } from "./rules";
import { apiError, ErrorCodes } from "@/lib/api-errors";

type MinorAction = "invest" | "withdraw" | "stripe_connect" | "visupoints_spend";

const BLOCKED_ACTIONS: Record<MinorAction, { code: string; message: string }> = {
  invest: {
    code: ErrorCodes.ERR_MINOR_NO_EURO,
    message: "Les utilisateurs mineurs ne peuvent pas effectuer de soutien financier en euros. Seuls les VIXUpoints sont disponibles.",
  },
  withdraw: {
    code: ErrorCodes.ERR_MINOR_WITHDRAW_BLOCKED,
    message: "Les retraits ne sont pas disponibles pour les utilisateurs mineurs.",
  },
  stripe_connect: {
    code: ErrorCodes.ERR_MINOR_NO_EURO,
    message: "Stripe Connect n'est pas disponible pour les utilisateurs mineurs.",
  },
  visupoints_spend: {
    code: ErrorCodes.ERR_MINOR_GUARDIAN_REQUIRED,
    message: "Action bloquee : autorisation parentale requise ou expiree.",
  },
};

/**
 * Guard: blocks an action if the user is a minor and the action is restricted.
 *
 * Returns a NextResponse error if blocked, null if allowed.
 */
export async function guardMinorAction(
  userId: string,
  action: MinorAction
): Promise<NextResponse | null> {
  const status = await isUserMinor(userId);

  // Not a minor -- always allowed
  if (!status.isMinor) return null;

  // Minor attempting euro-related actions -- always blocked
  if (action === "invest" || action === "withdraw" || action === "stripe_connect") {
    const config = BLOCKED_ACTIONS[action];
    return apiError(config.code as any, config.message, 403);
  }

  // VIXUpoints actions require valid guardian approval
  if (action === "visupoints_spend") {
    if (!status.hasGuardianApproval) {
      return apiError(
        ErrorCodes.ERR_MINOR_GUARDIAN_REQUIRED,
        "Autorisation parentale requise pour utiliser les VIXUpoints.",
        403
      );
    }
    if (status.guardianExpired) {
      return apiError(
        ErrorCodes.ERR_MINOR_GUARDIAN_EXPIRED,
        "L'autorisation parentale a expire. Veuillez la renouveler.",
        403
      );
    }
  }

  return null;
}
