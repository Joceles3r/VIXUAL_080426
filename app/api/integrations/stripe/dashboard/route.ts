import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { stripeConnectService } from "@/lib/integrations/stripe/stripe-connect-service";
import { apiError, ErrorCodes } from "@/lib/api-errors";

/**
 * POST /api/integrations/stripe/dashboard
 * Generate a Stripe Express Dashboard login link
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId } = body;
    
    if (!userId) {
      return apiError(ErrorCodes.ERR_MISSING_FIELD, "userId is required", 400);
    }
    
    const users = await sql`
      SELECT id, stripe_account_id, stripe_account_status
      FROM users WHERE id = ${userId}
    `;
    
    if (users.length === 0) {
      return apiError(ErrorCodes.ERR_USER_NOT_FOUND, "User not found", 404);
    }
    
    const user = users[0];
    
    if (!user.stripe_account_id) {
      return apiError(
        ErrorCodes.ERR_STRIPE_ACCOUNT_MISSING,
        "User has no Stripe Connect account",
        400
      );
    }
    
    if (user.stripe_account_status !== "verified") {
      return apiError(
        ErrorCodes.ERR_STRIPE_ACCOUNT_NOT_VERIFIED,
        "Stripe account is not yet verified. Complete onboarding first.",
        400
      );
    }
    
    const dashboardUrl = await stripeConnectService.createDashboardLink(
      user.stripe_account_id as string
    );
    
    return NextResponse.json({
      url: dashboardUrl,
      message: "Dashboard link generated - valid for single use",
    });
    
  } catch (error) {
    console.error("[Stripe Dashboard] Error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return apiError(ErrorCodes.ERR_INTERNAL, message, 500);
  }
}
