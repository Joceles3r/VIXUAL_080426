/**
 * GET /api/stripe/config/public
 * 
 * Route publique pour récupérer la clé Stripe publiable.
 * NE JAMAIS exposer la clé secrète côté client.
 */
import { NextResponse } from "next/server";
import { getStripeConfig } from "@/lib/stripe-config";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const config = await getStripeConfig();

    // Ne retourner que les informations publiques
    return NextResponse.json({
      mode: config.mode,
      publishableKey: config.publishableKey || null,
      configured: !!config.publishableKey && !!config.secretKey,
      source: config.source,
    });
  } catch (error) {
    console.error("[Stripe Config Public] Error:", error);
    return NextResponse.json(
      {
        mode: "test",
        publishableKey: null,
        configured: false,
        error: "Unable to load Stripe configuration",
      },
      { status: 500 }
    );
  }
}
