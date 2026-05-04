/**
 * VIXUAL — app/api/webhooks/stripe/route.ts
 *
 * Route DEPRECATED - alias de la route canonique.
 *
 * URL CANONIQUE (à configurer dans le dashboard Stripe) :
 *   https://vixual.app/api/integrations/stripe/webhooks
 *
 * Note importante : un redirect HTTP ne peut pas être utilisé ici car
 * la signature Stripe doit être vérifiée sur le body *original*. À la place,
 * on réexporte le handler canonique pour que les anciens webhooks continuent
 * de fonctionner en attendant la mise à jour Stripe Dashboard.
 *
 * À SUPPRIMER une fois tous les endpoints Stripe mis à jour côté Stripe Dashboard.
 */

import { POST as canonicalPOST } from "@/app/api/integrations/stripe/webhooks/route";
import { NextRequest, NextResponse } from "next/server";

const CANONICAL_WEBHOOK_URL = "/api/integrations/stripe/webhooks";

/**
 * Délègue directement au handler canonique (pas de redirection HTTP).
 * La signature Stripe est ainsi préservée.
 */
export async function POST(request: NextRequest): Promise<Response> {
  console.warn(
    "[Stripe Webhook] Appel reçu sur l'ancien endpoint /api/webhooks/stripe — " +
    "Mettre à jour l'URL dans le Dashboard Stripe vers : " +
    CANONICAL_WEBHOOK_URL
  );

  // Délégation directe - préserve headers, body et signature
  return canonicalPOST(request);
}

export async function GET() {
  return NextResponse.json({
    status: "deprecated",
    message: "This endpoint is deprecated. Stripe webhooks should target the canonical URL.",
    canonical_url: CANONICAL_WEBHOOK_URL,
    instruction: "Dans Stripe Dashboard → Webhooks → Update URL to use the canonical endpoint.",
    timestamp: new Date().toISOString(),
  });
}
