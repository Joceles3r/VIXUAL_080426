import { NextRequest, NextResponse } from "next/server";
import { getStripeClient, isStripeConfiguredAsync } from "@/lib/stripe";
import { 
  TICKET_GOLD_CONFIG, 
  canPurchaseTicketGold, 
  createTicketGold,
  getStripeMetadata,
  type TicketGold 
} from "@/lib/ticket-gold/engine";
import { sql, isDatabaseConfigured } from "@/lib/db";

/**
 * GET /api/ticket-gold
 * Recuperer le statut du Ticket Gold pour un projet
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("projectId");
  const userId = searchParams.get("userId");

  if (!projectId || !userId) {
    return NextResponse.json(
      { error: "projectId et userId requis" },
      { status: 400 }
    );
  }

  // Recuperer les tickets existants depuis la DB
  let existingTickets: TicketGold[] = [];
  
  if (isDatabaseConfigured()) {
    try {
      const rows = await sql`
        SELECT id, project_id, user_id, is_active, purchased_at, activated_at, expires_at, stripe_payment_id, boost_multiplier
        FROM ticket_gold
        WHERE project_id = ${projectId} AND user_id = ${userId}
        ORDER BY purchased_at DESC
      `;
      existingTickets = rows.map((row: Record<string, unknown>) => ({
        id: row.id as string,
        projectId: row.project_id as string,
        userId: row.user_id as string,
        status: (row.is_active as boolean) ? "active" : "expired",
        isActive: row.is_active as boolean,
        purchasedAt: new Date(row.purchased_at as string),
        activatedAt: row.activated_at ? new Date(row.activated_at as string) : undefined,
        expiresAt: row.expires_at ? new Date(row.expires_at as string) : undefined,
        stripePaymentId: row.stripe_payment_id as string | undefined,
        boostMultiplier: typeof row.boost_multiplier === "string"
          ? parseFloat(row.boost_multiplier)
          : (row.boost_multiplier as number ?? 0.5),
      }));
    } catch (err) {
      console.error("[Ticket Gold] Erreur DB:", err);
    }
  }
  
  const status = canPurchaseTicketGold(projectId, userId, existingTickets);

  return NextResponse.json({
    success: true,
    status,
    config: {
      price: TICKET_GOLD_CONFIG.priceDisplay,
      duration: `${TICKET_GOLD_CONFIG.boostDurationHours}h`,
      cooldown: `${TICKET_GOLD_CONFIG.cooldownDays} jours`,
    },
  });
}

/**
 * POST /api/ticket-gold
 * Creer une session de paiement Stripe pour un Ticket Gold
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { projectId, userId, projectTitle, returnUrl } = body;

    if (!projectId || !userId) {
      return NextResponse.json(
        { error: "projectId et userId requis" },
        { status: 400 }
      );
    }

    // Verifier que Stripe est configure (DB-aware)
    if (!(await isStripeConfiguredAsync())) {
      return NextResponse.json(
        { error: "Stripe non configure - contactez un administrateur" },
        { status: 503 }
      );
    }

    // Verifier le cooldown depuis la DB
    let existingTickets: TicketGold[] = [];
    
    if (isDatabaseConfigured()) {
      try {
        const rows = await sql`
          SELECT id, project_id, user_id, is_active, purchased_at, activated_at, expires_at, stripe_payment_id, boost_multiplier
          FROM ticket_gold
          WHERE project_id = ${projectId} AND user_id = ${userId}
          ORDER BY purchased_at DESC
        `;
        existingTickets = rows.map((row: Record<string, unknown>) => ({
          id: row.id as string,
          projectId: row.project_id as string,
          userId: row.user_id as string,
          status: (row.is_active as boolean) ? "active" : "expired",
          isActive: row.is_active as boolean,
          purchasedAt: new Date(row.purchased_at as string),
          activatedAt: row.activated_at ? new Date(row.activated_at as string) : undefined,
          expiresAt: row.expires_at ? new Date(row.expires_at as string) : undefined,
          stripePaymentId: row.stripe_payment_id as string | undefined,
          boostMultiplier: typeof row.boost_multiplier === "string"
            ? parseFloat(row.boost_multiplier)
            : (row.boost_multiplier as number ?? 0.5),
        }));
      } catch (err) {
        console.error("[Ticket Gold] Erreur DB lors de POST:", err);
      }
    }
    
    const status = canPurchaseTicketGold(projectId, userId, existingTickets);

    if (!status.canPurchase) {
      return NextResponse.json(
        { error: status.reason || "Achat non autorise" },
        { status: 400 }
      );
    }

    const stripe = await getStripeClient();
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://vixual.app";

    // Creer la session Checkout Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: `${TICKET_GOLD_CONFIG.displayName} - ${projectTitle || "Projet"}`,
              description: TICKET_GOLD_CONFIG.shortDescription,
              images: [],
            },
            unit_amount: TICKET_GOLD_CONFIG.priceEurCents,
          },
          quantity: 1,
        },
      ],
      metadata: getStripeMetadata(projectId, userId),
      success_url: `${baseUrl}${returnUrl || "/dashboard/projects"}?ticket_gold=success&project=${projectId}`,
      cancel_url: `${baseUrl}${returnUrl || "/dashboard/projects"}?ticket_gold=cancelled`,
    });

    return NextResponse.json({
      success: true,
      checkoutUrl: session.url,
      sessionId: session.id,
    });
  } catch (error) {
    console.error("[Ticket Gold] Error creating checkout session:", error);
    return NextResponse.json(
      { error: "Erreur lors de la creation de la session de paiement" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/ticket-gold
 * Activer un Ticket Gold apres paiement reussi (appele par webhook)
 */
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { projectId, userId, stripePaymentId } = body;

    if (!projectId || !userId) {
      return NextResponse.json(
        { error: "projectId et userId requis" },
        { status: 400 }
      );
    }

    // Creer le ticket
    const ticket = createTicketGold(projectId, userId, stripePaymentId);

    // En production: sauvegarder en DB
    if (isDatabaseConfigured()) {
      try {
        await sql`
          INSERT INTO ticket_gold (
            id, project_id, user_id, purchased_at, activated_at, 
            expires_at, is_active, boost_multiplier, stripe_payment_id
          ) VALUES (
            ${ticket.id}, ${ticket.projectId}, ${ticket.userId},
            ${ticket.purchasedAt.toISOString()}, ${ticket.activatedAt.toISOString()},
            ${ticket.expiresAt.toISOString()}, ${ticket.isActive},
            ${ticket.boostMultiplier}, ${ticket.stripePaymentId || null}
          )
        `;
      } catch (dbError) {
        console.error("[Ticket Gold] DB insert error:", dbError);
        // Continuer meme si DB echoue en dev
      }
    }

    return NextResponse.json({
      success: true,
      ticket,
      message: `Ticket Gold active! Boost de ${TICKET_GOLD_CONFIG.boostDurationHours}h en cours.`,
    });
  } catch (error) {
    console.error("[Ticket Gold] Error activating ticket:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'activation du Ticket Gold" },
      { status: 500 }
    );
  }
}
