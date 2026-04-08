/**
 * POST /api/security/step-up
 *
 * Called AFTER a successful OTP / TOTP verification.
 * Updates the user's stepUp.lastStepUpAt timestamp so the riskGate
 * engine considers the step-up fresh for subsequent monetary actions.
 *
 * Also persists phoneVerified / totpEnabled if provided.
 */

import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getRequestUser } from "@/lib/request-user";
import { apiError, ErrorCodes, withErrorHandler } from "@/lib/api-errors";

export const POST = withErrorHandler(async (req: Request) => {
  const user = await getRequestUser(req);
  if (!user) {
    return apiError(ErrorCodes.ERR_UNAUTHORIZED, "Connexion requise.", 401);
  }

  const body = await req.json().catch(() => ({}));
  const method: "phone" | "totp" = body.method ?? "phone";
  const now = new Date().toISOString();

  // Persist step-up timestamp + method flag
  if (method === "phone") {
    await sql`
      UPDATE users
      SET step_up_phone_verified = true,
          step_up_last_at = ${now},
          verification_level = GREATEST(COALESCE(verification_level, 0), 1),
          updated_at = now()
      WHERE id = ${user.id}
    `;
  } else {
    await sql`
      UPDATE users
      SET step_up_totp_enabled = true,
          step_up_last_at = ${now},
          verification_level = GREATEST(COALESCE(verification_level, 0), 1),
          updated_at = now()
      WHERE id = ${user.id}
    `;
  }

  return NextResponse.json({
    ok: true,
    method,
    lastStepUpAt: now,
    message: "Verification renforcee validee avec succes.",
  });
});
