import { NextRequest, NextResponse } from "next/server";
import { getStripeClient, isStripeConfiguredAsync } from "@/lib/stripe";
import { CAUTION, CAUTION_EUR } from "@/lib/payout/constants";
import { apiError, ErrorCodes, withErrorHandler } from "@/lib/api-errors";

/**
 * POST /api/stripe/caution
 *
 * Cree une session Stripe Checkout pour payer la caution VIXUAL.
 *
 * Body:
 *   - userId: string (obligatoire)
 *   - cautionType: "creator" | "contributor" (obligatoire)
 *
 * Montants:
 *   - creator     : 10 EUR (Porteur / Infoporteur / Podcasteur)
 *   - contributor : 20 EUR (Contributeur / Contribu-lecteur / Auditeur)
 */
export const POST = withErrorHandler(async (req: NextRequest) => {
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return apiError(ErrorCodes.ERR_INVALID_INPUT, "Body JSON invalide", 400);
  }

  const { userId, cautionType } = body as {
    userId?: string;
    cautionType?: "creator" | "contributor";
  };

  if (!userId) {
    return apiError(ErrorCodes.ERR_INVALID_INPUT, "userId requis", 400);
  }

  // VERROU FINAL: seules les cles officielles sont acceptees
  const normalizedType: "creator" | "contributor" = cautionType ?? "contributor";

  if (normalizedType !== "creator" && normalizedType !== "contributor") {
    return apiError(
      ErrorCodes.ERR_INVALID_INPUT,
      "cautionType doit etre 'creator' ou 'contributor'",
      400
    );
  }

  const amountCents = CAUTION[normalizedType];
  const amountEur = CAUTION_EUR[normalizedType];
  const label = normalizedType === "creator" ? "Createur" : "Contributeur";

  const configured = await isStripeConfiguredAsync();
  if (!configured) {
    return apiError(
      ErrorCodes.ERR_INTERNAL,
      "Stripe n'est pas configure (STRIPE_SECRET_KEY manquante)",
      503
    );
  }
  const stripe = await getStripeClient();

  const origin =
    req.headers.get("origin") ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    "http://localhost:3000";

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "eur",
          unit_amount: amountCents,
          product_data: {
            name: `Caution ${label} VIXUAL`,
            description:
              normalizedType === "creator"
                ? "Caution Porteur / Infoporteur / Podcasteur"
                : "Caution Contributeur / Contribu-lecteur / Auditeur",
          },
        },
        quantity: 1,
      },
    ],
    metadata: {
      user_id: userId,
      caution_type: normalizedType,
      vixual_action: "caution_payment",
    },
    success_url: `${origin}/dashboard/wallet?caution=success&type=${normalizedType}`,
    cancel_url: `${origin}/dashboard/wallet?caution=cancelled`,
  });

  return NextResponse.json({
    success: true,
    url: session.url,
    sessionId: session.id,
    amount: amountEur,
    cautionType: normalizedType,
  });
});
