import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { adminGuard } from "@/lib/admin-guard";
import { ErrorCodes, apiError, withErrorHandler } from "@/lib/api-errors";

// GET: list pending withdrawal reviews (admin only)
export const GET = withErrorHandler(async (req: Request) => {
  const guard = await adminGuard(req as NextRequest);
  if (!guard.authorized) {
    return apiError(ErrorCodes.ERR_FORBIDDEN, "Acces admin requis", 403);
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") || "pending";

  const rows = await sql`
    SELECT
      wr.id::text as id,
      wr.user_id::text as user_id,
      u.name as user_name,
      u.email as user_email,
      wr.amount_cents,
      wr.status,
      wr.review_status,
      wr.hold_until,
      wr.reviewed_at,
      wr.reviewed_by,
      wr.review_note,
      wr.created_at
    FROM withdrawal_requests wr
    JOIN users u ON u.id = wr.user_id
    WHERE wr.review_status = ${status}
    ORDER BY wr.created_at ASC
    LIMIT 100
  `;

  return NextResponse.json({ success: true, data: rows });
});

// POST: approve or reject a withdrawal (admin only)
export const POST = withErrorHandler(async (req: Request) => {
  const guard = await adminGuard(req as NextRequest);
  if (!guard.authorized) {
    return apiError(ErrorCodes.ERR_FORBIDDEN, "Acces admin requis", 403);
  }

  const body = await (req as NextRequest).json();
  const { withdrawalId, decision, note } = body as {
    withdrawalId?: string;
    decision?: "approved" | "rejected";
    note?: string;
  };

  if (!withdrawalId || !decision) {
    return apiError(ErrorCodes.ERR_MISSING_FIELD, "withdrawalId et decision requis", 400);
  }

  if (!["approved", "rejected"].includes(decision)) {
    return apiError(ErrorCodes.ERR_INVALID_INPUT, "decision doit etre 'approved' ou 'rejected'", 400);
  }

  // Check withdrawal exists and is pending
  const existing = await sql`
    SELECT id, review_status, amount_cents, user_id::text as user_id
    FROM withdrawal_requests
    WHERE id = ${withdrawalId}::uuid
    LIMIT 1
  `;

  if (!existing.length) {
    return apiError(ErrorCodes.ERR_WITHDRAW_NOT_FOUND, "Retrait introuvable", 404);
  }

  const wr = existing[0] as { id: string; review_status: string; amount_cents: number; user_id: string };
  if (wr.review_status !== "pending") {
    return apiError(
      ErrorCodes.ERR_WITHDRAW_REVIEW_PENDING,
      `Ce retrait a deja ete traite (statut: ${wr.review_status})`,
      409
    );
  }

  // Update the review
  await sql`
    UPDATE withdrawal_requests
    SET review_status = ${decision},
        reviewed_at = now(),
        reviewed_by = ${guard.adminEmail || "admin"},
        review_note = ${note || null}
    WHERE id = ${withdrawalId}::uuid
  `;

  // If rejected, refund the hold amount back to wallet
  if (decision === "rejected") {
    await sql`
      UPDATE wallets
      SET available_cents = available_cents + ${wr.amount_cents},
          updated_at = now()
      WHERE user_id = ${wr.user_id}::uuid
    `;

    // Update the wallet transaction
    await sql`
      UPDATE wallet_transactions
      SET status = 'refunded', description = 'Retrait rejete -- montant recredite'
      WHERE reference_id = ${withdrawalId} AND type = 'withdrawal_hold'
    `;
  }

  const amountEur = wr.amount_cents / 100;

  return NextResponse.json({
    success: true,
    message: decision === "approved"
      ? `Retrait de ${amountEur} EUR approuve. Le virement sera execute.`
      : `Retrait de ${amountEur} EUR rejete. Le montant a ete recredite.`,
    decision,
    withdrawalId,
  });
});
