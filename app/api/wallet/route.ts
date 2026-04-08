import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { apiError, ErrorCodes } from "@/lib/api-errors";

// GET: Fetch wallet data for a user
export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId");

  if (!userId) {
    return apiError(ErrorCodes.ERR_MISSING_FIELD, "userId is required", 400);
  }

  try {
    // Verify user exists — FIX B : inclure visupoints_balance pour l'affichage wallet
    const users = await sql`SELECT id, account_status, visupoints_balance FROM users WHERE id = ${userId}`;
    if (users.length === 0) {
      return apiError(ErrorCodes.ERR_USER_NOT_FOUND, "User not found", 404);
    }

    // Get or create wallet
    let wallets = await sql`SELECT * FROM wallets WHERE user_id = ${userId}`;
    if (wallets.length === 0) {
      wallets = await sql`
        INSERT INTO wallets (user_id) VALUES (${userId})
        RETURNING *
      `;
    }
    const wallet = wallets[0];

    // Get recent transactions
    const transactions = await sql`
      SELECT * FROM wallet_transactions
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
      LIMIT 20
    `;

    // Get Stripe Connect status
    const stripeAccounts = await sql`
      SELECT status, charges_enabled, payouts_enabled, stripe_account_id
      FROM stripe_accounts WHERE user_id = ${userId}
    `;

    const stripeStatus = stripeAccounts.length > 0
      ? {
          status: stripeAccounts[0].status,
          chargesEnabled: stripeAccounts[0].charges_enabled,
          payoutsEnabled: stripeAccounts[0].payouts_enabled,
          hasAccount: !!stripeAccounts[0].stripe_account_id,
        }
      : { status: "not_started", chargesEnabled: false, payoutsEnabled: false, hasAccount: false };

    // Get pending withdrawal requests
    const pendingWithdrawals = await sql`
      SELECT * FROM withdrawal_requests
      WHERE user_id = ${userId} AND status IN ('pending', 'processing')
      ORDER BY requested_at DESC
    `;

    // Flag if account is suspended (read-only wallet access)
    const accountStatus = users[0].account_status || "active";

    // FIX B — Calculer le solde VIXUpoints réel depuis la DB
    const vixupointsBalance = Number(users[0].visupoints_balance || 0);
    const VIXUPOINTS_MAX_CONVERSION = 2500; // 25 € max (100 pts = 1 €)

    return NextResponse.json({
      wallet: {
        availableCents: wallet.available_cents,
        pendingCents: wallet.pending_cents,
        totalEarnedCents: wallet.total_earned_cents,
        totalWithdrawnCents: wallet.total_withdrawn_cents,
      },
      transactions: transactions.map((t: Record<string, unknown>) => ({
        id: t.id,
        type: t.type,
        amountCents: t.amount_cents,
        description: t.description,
        status: t.status,
        createdAt: t.created_at,
      })),
      stripeConnect: stripeStatus,
      pendingWithdrawals: pendingWithdrawals.map((w: Record<string, unknown>) => ({
        id: w.id,
        amountCents: w.amount_cents,
        status: w.status,
        requestedAt: w.requested_at,
      })),
      // FIX B — Champ visupoints désormais présent (plus de fallback MOCK côté frontend)
      visupoints: {
        balance: vixupointsBalance,
        cap: VIXUPOINTS_MAX_CONVERSION,
        todayEarned: 0, // À enrichir ultérieurement avec une table visupoints_transactions
      },
      accountStatus,
      isFinanciallyBlocked: accountStatus === "suspended" || accountStatus === "banned",
    });
  } catch (error: unknown) {
    console.error("Wallet fetch error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return apiError(ErrorCodes.ERR_INTERNAL, message, 500);
  }
}
