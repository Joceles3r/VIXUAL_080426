/**
 * VIXUAL — app/api/webhooks/stripe/route.ts
 * 
 * REDIRECTION vers la route webhook canonique.
 * 
 * URL CANONIQUE A CONFIGURER DANS STRIPE DASHBOARD:
 * https://vixual.app/api/integrations/stripe/webhooks
 * 
 * Cette route existe pour compatibilite et redirige vers la route principale.
 * NE PAS utiliser cette URL dans la configuration Stripe.
 */

import { NextRequest, NextResponse } from "next/server";

const CANONICAL_WEBHOOK_URL = "/api/integrations/stripe/webhooks";

export async function POST(request: NextRequest) {
  // Log pour tracer les appels sur la mauvaise URL
  console.warn(
    "[Stripe Webhook] Request received on deprecated /api/webhooks/stripe — " +
    "Please update Stripe webhook URL to /api/integrations/stripe/webhooks"
  );

  // Cloner la requete et la rediriger vers la route canonique
  const url = new URL(CANONICAL_WEBHOOK_URL, request.url);
  
  // Recuperer le body et les headers pour les transmettre
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  // Faire une requete interne vers la route canonique
  try {
    const response = await fetch(url.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(signature ? { "stripe-signature": signature } : {}),
      },
      body,
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("[Stripe Webhook] Redirect error:", error);
    return NextResponse.json(
      { error: "Failed to redirect to canonical webhook URL" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: "redirect",
    message: "This endpoint redirects to the canonical webhook URL",
    canonical_url: CANONICAL_WEBHOOK_URL,
    instruction: "Configure Stripe to use: https://vixual.app/api/integrations/stripe/webhooks",
    timestamp: new Date().toISOString(),
  });
}
