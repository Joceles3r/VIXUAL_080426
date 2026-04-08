import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { ErrorCodes, apiError, withErrorHandler } from "@/lib/api-errors";
import {
  validatePseudonym,
  getUserIdentity,
  updateUserIdentity,
  getPublicName,
} from "@/lib/user-identity";

// GET: retrieve the user's identity (name, pseudonym, display settings)
export const GET = withErrorHandler(async (req: Request) => {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  if (!userId) {
    return apiError(ErrorCodes.ERR_MISSING_FIELD, "userId is required", 400);
  }

  const identity = await getUserIdentity(userId);
  if (!identity) {
    return apiError(ErrorCodes.ERR_USER_NOT_FOUND, "Utilisateur introuvable", 404);
  }

  return NextResponse.json({
    success: true,
    data: {
      ...identity,
      publicName: getPublicName(identity),
    },
  });
});

// PUT: update pseudonym, display_name, pseudonym_enabled
export const PUT = withErrorHandler(async (req: Request) => {
  const body = await (req as NextRequest).json();
  const { userId, pseudonym, displayName, pseudonymEnabled } = body as {
    userId?: string;
    pseudonym?: string;
    displayName?: string;
    pseudonymEnabled?: boolean;
  };

  if (!userId) {
    return apiError(ErrorCodes.ERR_MISSING_FIELD, "userId is required", 400);
  }

  // Validate pseudonym if provided
  if (pseudonym !== undefined && pseudonym !== null) {
    const validation = await validatePseudonym(pseudonym, userId);
    if (!validation.valid) {
      return apiError(
        ErrorCodes.ERR_PSEUDONYM_INVALID,
        validation.reason || "Pseudonyme invalide",
        400
      );
    }
  }

  await updateUserIdentity(userId, {
    pseudonym: pseudonym ?? undefined,
    displayName: displayName ?? undefined,
    pseudonymEnabled: pseudonymEnabled ?? undefined,
  });

  const updated = await getUserIdentity(userId);

  return NextResponse.json({
    success: true,
    data: updated ? { ...updated, publicName: getPublicName(updated) } : null,
  });
});
