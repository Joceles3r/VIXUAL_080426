import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { stripeConnectService } from "@/lib/integrations/stripe/stripe-connect-service";
import { apiError, ErrorCodes } from "@/lib/api-errors";

/**
 * POST /api/integrations/stripe/connect
 * Create a new Stripe Connect account for the authenticated user
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, country, type } = body;
    
    if (!userId) {
      return apiError(ErrorCodes.ERR_MISSING_FIELD, "userId is required", 400);
    }
    
    // Verify user exists and get email
    const users = await sql`
      SELECT id, email, stripe_account_id, stripe_account_status
      FROM users WHERE id = ${userId}
    `;
    
    if (users.length === 0) {
      return apiError(ErrorCodes.ERR_USER_NOT_FOUND, "User not found", 404);
    }
    
    const user = users[0];
    
    // Check if user already has a Connect account
    if (user.stripe_account_id && user.stripe_account_status !== "none") {
      // Return existing account status instead of creating new
      const status = await stripeConnectService.getAccountStatus(user.stripe_account_id as string);
      
      // If account needs onboarding refresh, generate new link
      if (status.status === "pending" || status.status === "restricted") {
        const onboardingUrl = await stripeConnectService.refreshOnboardingLink(user.stripe_account_id as string);
        return NextResponse.json({
          accountId: user.stripe_account_id,
          status: status.status,
          onboardingUrl,
          message: "Existing account - refresh onboarding link generated",
        });
      }
      
      return NextResponse.json({
        accountId: user.stripe_account_id,
        status: status.status,
        chargesEnabled: status.chargesEnabled,
        payoutsEnabled: status.payoutsEnabled,
        message: "Account already exists",
      });
    }
    
    // Create new Connect account
    const result = await stripeConnectService.createConnectAccount({
      userId,
      email: user.email as string,
      country: country || "FR",
      type: type || "express",
    });
    
    return NextResponse.json({
      accountId: result.accountId,
      onboardingUrl: result.onboardingUrl,
      status: result.status,
      message: "Connect account created - redirect user to onboarding URL",
    });
    
  } catch (error) {
    console.error("[Stripe Connect] Error creating account:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return apiError(ErrorCodes.ERR_INTERNAL, message, 500);
  }
}

/**
 * GET /api/integrations/stripe/connect?userId=xxx
 * Get Stripe Connect account status
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    
    if (!userId) {
      return apiError(ErrorCodes.ERR_MISSING_FIELD, "userId query param is required", 400);
    }
    
    const users = await sql`
      SELECT id, stripe_account_id, stripe_account_status, stripe_account_details
      FROM users WHERE id = ${userId}
    `;
    
    if (users.length === 0) {
      return apiError(ErrorCodes.ERR_USER_NOT_FOUND, "User not found", 404);
    }
    
    const user = users[0];
    
    if (!user.stripe_account_id) {
      return NextResponse.json({
        hasAccount: false,
        status: "none",
        message: "User has no Stripe Connect account",
      });
    }
    
    // Fetch fresh status from Stripe
    const status = await stripeConnectService.getAccountStatus(user.stripe_account_id as string);
    
    // Sync to database
    await stripeConnectService.syncAccountStatus(user.stripe_account_id as string, userId);
    
    const { accountId: _ignored, ...statusRest } = status as unknown as Record<string, unknown>;
    return NextResponse.json({
      hasAccount: true,
      accountId: user.stripe_account_id,
      ...statusRest,
    });
    
  } catch (error) {
    console.error("[Stripe Connect] Error getting status:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return apiError(ErrorCodes.ERR_INTERNAL, message, 500);
  }
}
