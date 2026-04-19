/**
 * VIXUAL — app/api/checkout/priority-reintegration/route.ts
 *
 * Route de paiement pour la Réintégration Prioritaire 25€ (module 5.5).
 *
 * Règles métier :
 *   - Prix fixe : 25,00 EUR
 *   - Fenêtre d'éligibilité : 1 heure après élimination du projet
 *   - Après paiement validé par webhook → le projet passe en statut
 *     "prioritized" et est réintégré dans la sélection en priorité.
 *
 * Chaîne :
 *   POST /api/checkout/priority-reintegration
 *     → créer Checkout Session Stripe
 *     → retourner l'URL de checkout
 *   Webhook checkout.session.completed (metadata.product_type === "priority_reintegration")
 *     → marquer le projet comme prioritaire
 */

import { NextRequest, NextResponse } from "next/server";
import { getStripeClient, isStripeConfiguredAsync, logStripeEvent } from "@/lib/stripe";
import { sql, isDatabaseConfigured } from "@/lib/db";

// ── Configuration ──────────────────────────────────────────────────────────

const PRIORITY_REINTEGRATION_CONFIG = {
  priceEurCents: 2500, // 25.00 EUR
  eligibilityWindowMinutes: 60,
  productName: "Réintégration Prioritaire VIXUAL",
  productDescription: "Réintégration prioritaire de votre projet dans la sélection (fenêtre 1h)",
} as const;

// ── Helper : vérifier l'éligibilité du projet ──────────────────────────────

async function checkEligibility(
  projectId: string,
  userId: string
): Promise<{ eligible: boolean; reason?: string }> {
  if (!isDatabaseConfigured()) {
    return { eligible: true }; // Best-effort en dev
  }

  try {
    const rows = await sql`
      SELECT id, owner_id, status, eliminated_at
      FROM projects
      WHERE id = ${projectId}
      LIMIT 1
    `;

    if (rows.length === 0) {
      return { eligible: false, reason: "Projet introuvable" };
    }

    const project = rows[0];
    if (project.owner_id !== userId) {
      return { eligible: false, reason: "Vous n'êtes pas le porteur de ce projet" };
    }

    if (project.status === "prioritized") {
      return { eligible: false, reason: "Projet déjà réintégré en priorité" };
    }

    // Vérifier la fenêtre d'une heure
    if (project.eliminated_at) {
      const eliminatedAt = new Date(project.eliminated_at as string);
      const nowMs = Date.now();
      const windowMs = PRIORITY_REINTEGRATION_CONFIG.eligibilityWindowMinutes * 60 * 1000;
      const elapsed = nowMs - eliminatedAt.getTime();

      if (elapsed > windowMs) {
        return {
          eligible: false,
          reason: `Fenêtre de réintégration expirée (${PRIORITY_REINTEGRATION_CONFIG.eligibilityWindowMinutes} min après élimination)`,
        };
      }
    }

    return { eligible: true };
  } catch (err) {
    console.error("[Priority Reintegration] DB error:", err);
    // En cas d'erreur DB, autoriser (best-effort) mais logger
    return { eligible: true };
  }
}

// ── POST — créer la Checkout Session ───────────────────────────────────────

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

    // Stripe disponible ?
    if (!(await isStripeConfiguredAsync())) {
      return NextResponse.json(
        { error: "Stripe non configuré - contactez un administrateur" },
        { status: 503 }
      );
    }

    // Éligibilité ?
    const eligibility = await checkEligibility(projectId, userId);
    if (!eligibility.eligible) {
      return NextResponse.json(
        { error: eligibility.reason || "Non éligible" },
        { status: 400 }
      );
    }

    const stripe = await getStripeClient();
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://vixual.app";
    const displayTitle = projectTitle ? ` - ${projectTitle}` : "";

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: `${PRIORITY_REINTEGRATION_CONFIG.productName}${displayTitle}`,
              description: PRIORITY_REINTEGRATION_CONFIG.productDescription,
            },
            unit_amount: PRIORITY_REINTEGRATION_CONFIG.priceEurCents,
          },
          quantity: 1,
        },
      ],
      metadata: {
        platform: "vixual",
        product_type: "priority_reintegration",
        project_id: projectId,
        user_id: userId,
        created_at: new Date().toISOString(),
      },
      success_url: `${baseUrl}${returnUrl || "/dashboard/projects"}?priority_reintegration=success&project=${projectId}`,
      cancel_url: `${baseUrl}${returnUrl || "/dashboard/projects"}?priority_reintegration=cancelled`,
      // Expirer rapidement pour rester cohérent avec la fenêtre d'éligibilité
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60, // 30 min
    });

    logStripeEvent("Priority reintegration checkout created", {
      projectId,
      userId,
      sessionId: session.id,
    });

    return NextResponse.json({
      success: true,
      checkoutUrl: session.url,
      sessionId: session.id,
      priceEurCents: PRIORITY_REINTEGRATION_CONFIG.priceEurCents,
      eligibilityWindowMinutes: PRIORITY_REINTEGRATION_CONFIG.eligibilityWindowMinutes,
    });
  } catch (error) {
    console.error("[Priority Reintegration] Error creating checkout:", error);
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    return NextResponse.json(
      { error: `Erreur de paiement: ${message}` },
      { status: 500 }
    );
  }
}

// ── GET — vérifier l'éligibilité sans payer ────────────────────────────────

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

  const eligibility = await checkEligibility(projectId, userId);

  return NextResponse.json({
    ...eligibility,
    config: {
      priceEurCents: PRIORITY_REINTEGRATION_CONFIG.priceEurCents,
      priceDisplay: "25,00 €",
      eligibilityWindowMinutes: PRIORITY_REINTEGRATION_CONFIG.eligibilityWindowMinutes,
    },
  });
}
