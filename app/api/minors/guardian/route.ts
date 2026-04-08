import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { apiError, ErrorCodes, withErrorHandler } from "@/lib/api-errors";
import { isUserMinor, calculateAge, MIN_AGE, ADULT_AGE } from "@/lib/minors/rules";

/**
 * POST /api/minors/guardian
 * Submit a parental authorization request.
 * Body: { minorUserId, guardianName, guardianEmail, guardianPhone, consentText }
 */
export const POST = withErrorHandler(async (req: Request) => {
  const body = await req.json();
  const { minorUserId, guardianName, guardianEmail, guardianPhone, consentText } = body;

  if (!minorUserId || !guardianName || !guardianEmail) {
    return apiError(ErrorCodes.ERR_MISSING_FIELD, "minorUserId, guardianName, guardianEmail required", 400);
  }

  // Verify user is indeed a minor
  const status = await isUserMinor(minorUserId);
  if (!status.isMinor) {
    return NextResponse.json({ error: "L'utilisateur n'est pas mineur." }, { status: 400 });
  }

  if (status.age !== null && status.age < MIN_AGE) {
    return apiError(ErrorCodes.ERR_MINOR_NO_EURO, `L'inscription est reservee aux utilisateurs de ${MIN_AGE} ans et plus.`, 403);
  }

  // Check for pending request
  const pending = await sql`
    SELECT id FROM minor_guardian_verifications
    WHERE minor_user_id = ${minorUserId}::uuid AND status = 'pending'
  `;
  if (pending.length > 0) {
    return NextResponse.json({ error: "Une demande d'autorisation est deja en cours." }, { status: 409 });
  }

  // Insert new guardian verification request
  await sql`
    INSERT INTO minor_guardian_verifications (
      minor_user_id, guardian_name, guardian_email, guardian_phone,
      consent_text, status
    ) VALUES (
      ${minorUserId}::uuid, ${guardianName}, ${guardianEmail},
      ${guardianPhone || null}, ${consentText || "Autorisation parentale standard VISUAL"},
      'pending'
    )
  `;

  // Update user minor_status
  await sql`
    UPDATE users SET minor_status = 'pending_guardian' WHERE id = ${minorUserId}::uuid
  `;

  return NextResponse.json({
    success: true,
    message: "Demande d'autorisation parentale soumise. Un administrateur la validera sous 48h.",
  });
});

/**
 * GET /api/minors/guardian?userId=xxx
 * Check guardian status for a minor user.
 */
export const GET = withErrorHandler(async (req: Request) => {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  if (!userId) return apiError(ErrorCodes.ERR_MISSING_FIELD, "userId required", 400);

  const status = await isUserMinor(userId);

  const requests = await sql`
    SELECT id::text, guardian_name, guardian_email, status, submitted_at, approved_at
    FROM minor_guardian_verifications
    WHERE minor_user_id = ${userId}::uuid
    ORDER BY submitted_at DESC LIMIT 5
  `;

  return NextResponse.json({
    isMinor: status.isMinor,
    age: status.age,
    hasGuardianApproval: status.hasGuardianApproval,
    guardianExpired: status.guardianExpired,
    requests,
  });
});
