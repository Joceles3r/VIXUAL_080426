import { NextResponse } from "next/server";
import { validateStripeConnectEnv, validateBunnyEnv, type IntegrationHealthCheck } from "@/lib/integrations/config";
import { getStripeMode } from "@/lib/stripe";
import { bunnyCDNService } from "@/lib/integrations/bunny/bunny-cdn-service";

/**
 * GET /api/integrations/health
 * Health check for all integrations
 */
export async function GET() {
  const stripeEnv = validateStripeConnectEnv();
  const bunnyEnv = validateBunnyEnv();
  const stripeMode = getStripeMode();
  
  let bunnyHealth = { storage: false, cdn: false, videoLibrary: false };
  
  if (bunnyEnv.valid) {
    try {
      bunnyHealth = await bunnyCDNService.healthCheck();
    } catch (error) {
      console.error("[Integrations Health] Bunny health check failed:", error);
    }
  }
  
  const health: IntegrationHealthCheck = {
    stripe: {
      connected: stripeEnv.valid,
      mode: stripeMode.isTest ? "test" : "live",
      webhooksConfigured: !!process.env.STRIPE_WEBHOOK_SECRET,
      connectEnabled: !!process.env.STRIPE_SECRET_KEY,
    },
    bunny: {
      connected: bunnyEnv.valid,
      storageConfigured: bunnyHealth.storage,
      cdnConfigured: bunnyHealth.cdn,
      videoLibraryConfigured: bunnyHealth.videoLibrary,
    },
    timestamp: new Date().toISOString(),
  };
  
  const allHealthy = health.stripe.connected && health.bunny.connected;
  
  return NextResponse.json(health, {
    status: allHealthy ? 200 : 503,
  });
}
