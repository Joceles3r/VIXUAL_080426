/**
 * VIXUAL — app/api/checkout/free-support/route.ts
 *
 * Soutien libre (module 5.6) — paiement ponctuel vers un créateur.
 *
 * Règles métier :
 *   - Montants libres (5/10/20/50€ en pré-selection ; custom accepté)
 *   - Commission VIXUAL 7%
 *   - N'IMPACTE PAS le classement des projets
 *   - Type distinct : "free_support" (ne pas confondre avec contribution)
 *   - Nécessite Stripe Connect côté créateur pour transfer direct
 *
 * Chaîne :
 *   POST /api/checkout/free-support
 *     → Checkout Session avec transfer_data.destination (Connect)
 *     → application_fee_amount = 7%
 */

import { NextRequest, NextResponse } from "next/server";
import { getStripeClient, isStripeConfiguredAsync, logStripeEvent } from "@/lib/stripe";
import { sql, isDatabaseConfigured } from "@/lib/db";

// ── Configuration ──────────────────────────────────────────────────────────

const FREE_SUPPORT_CONFIG = {
  minAmountCents: 100, // 1€ minimum
  maxAmountCents: 50000, // 500€ maximum (protection contre erreurs UI)
  platformFeePercent: 7,
  allowedPresets: [500, 1000, 2000, 5000] as const, // 5€, 10€, 20€, 50€
} as const;

// ── Helpers ────────────────────────────────────────────────────────────────

function computePlatformFee(amountCents: number): number {
  return Math.round(amountCents * (FREE_SUPPORT_CONFIG.platformFeePercent / 100));
}

async function getCreatorStripeAccount(creatorId: string): Promise<{
  accountId: string | null;
  payoutsEnabled: boolean;
  email?: string;
  displayName?: string;
}> {
  if (!isDatabaseConfigured()) {
    return { accountId: null, payoutsEnabled: false };
  }

  try {
    const rows = await sql`
      SELECT id, email, display_name, stripe_account_id, stripe_account_status, stripe_account_details
      FROM users
      WHERE id = ${creatorId}
      LIMIT 1
    `;

    if (rows.length === 0) {
      return { accountId: null, payoutsEnabled: false };
    }

    const user = rows[0] as {
      email?: string;
      display_name?: string;
      stripe_account_id?: string;
      stripe_account_status?: string;
      stripe_account_details?: Record<string, unknown>;
    };

    const payoutsEnabled = Boolean(user.stripe_account_details?.payoutsEnabled);
    return {
      accountId: user.stripe_account_id || null,
      payoutsEnabled,
      email: user.email,
      displayName: user.display_name,
    };
  } catch (err) {
    console.error("[Free Support] DB error:", err);
    return { accountId: null, payoutsEnabled: false };
  }
}

// ── POST — créer la Checkout Session ───────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      creatorId,
      userId, // supporter's user id (optional — can be anonymous)
      amountCents,
      message,
      returnUrl,
    } = body as {
      creatorId?: string;
      userId?: string;
      amountCents?: number;
      message?: string;
      returnUrl?: string;
    };

    if (!creatorId) {
      return NextResponse.json(
        { error: "creatorId requis" },
        { status: 400 }
      );
    }

    const amount = Number(amountCents);
    if (!Number.isFinite(amount) || amount < FREE_SUPPORT_CONFIG.minAmountCents) {
      return NextResponse.json(
        { error: `Montant minimum : ${FREE_SUPPORT_CONFIG.minAmountCents / 100}€` },
        { status: 400 }
      );
    }
    if (amount > FREE_SUPPORT_CONFIG.maxAmountCents) {
      return NextResponse.json(
        { error: `Montant maximum : ${FREE_SUPPORT_CONFIG.maxAmountCents / 100}€` },
        { status: 400 }
      );
    }

    // Stripe prêt ?
    if (!(await isStripeConfiguredAsync())) {
      return NextResponse.json(
        { error: "Stripe non configuré - contactez un administrateur" },
        { status: 503 }
      );
    }

    // Créateur a-t-il un Stripe Connect actif ?
    const creator = await getCreatorStripeAccount(creatorId);
    if (!creator.accountId) {
      return NextResponse.json(
        {
          error:
            "Ce créateur n'a pas encore finalisé son compte Stripe. Le soutien n'est pas disponible pour le moment.",
          code: "ERR_CREATOR_NO_STRIPE",
        },
        { status: 400 }
      );
    }
    if (!creator.payoutsEnabled) {
      return NextResponse.json(
        {
          error:
            "Le compte Stripe du créateur n'est pas encore vérifié. Réessayez plus tard.",
          code: "ERR_CREATOR_PAYOUTS_DISABLED",
        },
        { status: 400 }
      );
    }

    const stripe = await getStripeClient();
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://vixual.app";
    const platformFee = computePlatformFee(amount);
    const creatorName = creator.displayName || creator.email?.split("@")[0] || "le créateur";

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: `Soutien libre à ${creatorName}`,
              description: message
                ? `Message : ${message.slice(0, 200)}`
                : "Soutien libre VIXUAL (ne compte pas dans le classement)",
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      payment_intent_data: {
        // Commission plateforme VIXUAL : 7 %
        application_fee_amount: platformFee,
        transfer_data: {
          destination: creator.accountId,
        },
        metadata: {
          platform: "vixual",
          payment_type: "free_support",
          creator_id: creatorId,
          user_id: userId || "anonymous",
          amount_cents: String(amount),
          platform_fee_cents: String(platformFee),
        },
      },
      metadata: {
        platform: "vixual",
        product_type: "free_support",
        creator_id: creatorId,
        user_id: userId || "anonymous",
        amount_cents: String(amount),
      },
      success_url: `${baseUrl}${returnUrl || "/"}?free_support=success&creator=${creatorId}`,
      cancel_url: `${baseUrl}${returnUrl || "/"}?free_support=cancelled`,
    });

    logStripeEvent("Free support checkout created", {
      creatorId,
      userId: userId || "anonymous",
      amountCents: amount,
      platformFeeCents: platformFee,
      sessionId: session.id,
    });

    return NextResponse.json({
      success: true,
      checkoutUrl: session.url,
      sessionId: session.id,
      amountCents: amount,
      platformFeeCents: platformFee,
      creatorReceivesCents: amount - platformFee,
    });
  } catch (error) {
    console.error("[Free Support] Error creating checkout:", error);
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    return NextResponse.json(
      { error: `Erreur de paiement: ${message}` },
      { status: 500 }
    );
  }
}

// ── GET — lister les presets + config ──────────────────────────────────────

export async function GET() {
  return NextResponse.json({
    config: {
      presets: FREE_SUPPORT_CONFIG.allowedPresets.map(cents => ({
        amountCents: cents,
        display: `${cents / 100}€`,
      })),
      minAmountCents: FREE_SUPPORT_CONFIG.minAmountCents,
      maxAmountCents: FREE_SUPPORT_CONFIG.maxAmountCents,
      platformFeePercent: FREE_SUPPORT_CONFIG.platformFeePercent,
    },
  });
}
