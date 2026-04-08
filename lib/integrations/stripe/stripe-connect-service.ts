import "server-only";
import Stripe from "stripe";
import { getStripeClient, isStripeConfiguredAsync, logStripeEvent } from "@/lib/stripe";
import { sql } from "@/lib/db";
import { 
  STRIPE_CONNECT_CONFIG, 
  calculateStripeFees,
  type StripeConnectAccountStatus 
} from "../config";

// Re-export for convenience
export { getStripeClient, isStripeConfiguredAsync, logStripeEvent };

/**
 * VIXUAL Platform - Stripe Connect Service
 * Complete service for managing Stripe Connect accounts, payments, and payouts
 */

// ── Types ──
export interface CreateConnectAccountParams {
  userId: string;
  email: string;
  country?: string;
  type?: typeof STRIPE_CONNECT_CONFIG.accountTypes[number];
  businessType?: "individual" | "company";
}

export interface CreateConnectAccountResult {
  accountId: string;
  onboardingUrl: string;
  status: StripeConnectAccountStatus;
}

export interface AccountStatus {
  accountId: string;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  detailsSubmitted: boolean;
  requirements: {
    currentlyDue: string[];
    eventuallyDue: string[];
    pendingVerification: string[];
  };
  status: StripeConnectAccountStatus;
}

export interface PaymentIntentParams {
  amount: number; // in EUR
  userId: string;
  contentId: string;
  contentTitle: string;
  creatorAccountId?: string; // For direct transfers
  metadata?: Record<string, string>;
}

export interface PayoutParams {
  userId: string;
  accountId: string;
  amount: number; // in cents
  category: string;
  cycleId?: string;
}

// ── Service Class ──
class StripeConnectService {
  
  // ── Account Management ──
  
  /**
   * Create a new Stripe Connect account for a creator
   */
  async createConnectAccount(params: CreateConnectAccountParams): Promise<CreateConnectAccountResult> {
    const { userId, email, country = "FR", type = "express", businessType = "individual" } = params;
    
    logStripeEvent("Creating Connect account", { userId, email, country, type });
    
    try {
      const stripe = await getStripeClient();
      // Create Stripe Connect account
      const account = await stripe.accounts.create({
        type,
        country,
        email,
        business_type: businessType,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        metadata: {
          vixual_user_id: userId,
          platform: "vixual",
        },
      });
      
      // Generate onboarding link
      const accountLink = await stripe.accountLinks.create({
        account: account.id,
        refresh_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/wallet?stripe_refresh=true`,
        return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/wallet?stripe_success=true`,
        type: "account_onboarding",
      });
      
      // Store in database
      await sql`
        UPDATE users 
        SET 
          stripe_account_id = ${account.id},
          stripe_account_status = 'pending',
          stripe_account_details = ${JSON.stringify({
            type,
            country,
            createdAt: new Date().toISOString(),
          })}
        WHERE id = ${userId}
      `;
      
      logStripeEvent("Connect account created", { 
        userId, 
        accountId: account.id,
        status: "pending" 
      });
      
      return {
        accountId: account.id,
        onboardingUrl: accountLink.url,
        status: "pending",
      };
    } catch (error) {
      logStripeEvent("Connect account creation failed", { 
        userId, 
        error: error instanceof Error ? error.message : "Unknown error" 
      });
      throw error;
    }
  }
  
  /**
   * Get account status and requirements
   */
  async getAccountStatus(accountId: string): Promise<AccountStatus> {
    const stripe = await getStripeClient();
    const account = await stripe.accounts.retrieve(accountId);
    
    let status: StripeConnectAccountStatus = "none";
    if (account.charges_enabled && account.payouts_enabled) {
      status = "verified";
    } else if (account.details_submitted) {
      status = "pending";
    } else if (account.requirements?.disabled_reason) {
      status = "disabled";
    } else {
      status = "restricted";
    }
    
    return {
      accountId,
      chargesEnabled: account.charges_enabled || false,
      payoutsEnabled: account.payouts_enabled || false,
      detailsSubmitted: account.details_submitted || false,
      requirements: {
        currentlyDue: account.requirements?.currently_due || [],
        eventuallyDue: account.requirements?.eventually_due || [],
        pendingVerification: account.requirements?.pending_verification || [],
      },
      status,
    };
  }
  
  /**
   * Generate dashboard login link for creator
   */
  async createDashboardLink(accountId: string): Promise<string> {
    const stripe = await getStripeClient();
    const loginLink = await stripe.accounts.createLoginLink(accountId);
    return loginLink.url;
  }
  
  /**
   * Refresh onboarding link (if expired)
   */
  async refreshOnboardingLink(accountId: string): Promise<string> {
    const stripe = await getStripeClient();
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/wallet?stripe_refresh=true`,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/wallet?stripe_success=true`,
      type: "account_onboarding",
    });
    return accountLink.url;
  }
  
  // ── Payments ──
  
  /**
   * Create a payment intent with optional Connect destination
   */
  async createPaymentIntent(params: PaymentIntentParams): Promise<Stripe.PaymentIntent> {
    const { amount, userId, contentId, contentTitle, creatorAccountId, metadata = {} } = params;
    const stripe = await getStripeClient();
    
    const amountCents = Math.round(amount * 100);
    const fees = calculateStripeFees(amountCents);
    
    const paymentIntentParams: Stripe.PaymentIntentCreateParams = {
      amount: amountCents,
      currency: "eur",
      metadata: {
        type: "investment",
        vixual_user_id: userId,
        vixual_content_id: contentId,
        content_title: contentTitle,
        platform: "vixual",
        ...metadata,
      },
    };
    
    // If creator has Connect account, set up direct transfer
    if (creatorAccountId) {
      paymentIntentParams.transfer_data = {
        destination: creatorAccountId,
      };
      paymentIntentParams.application_fee_amount = fees.platformFee;
    }
    
    const paymentIntent = await stripe.paymentIntents.create(paymentIntentParams);
    
    logStripeEvent("Payment Intent created", {
      paymentIntentId: paymentIntent.id,
      amount: amountCents,
      userId,
      contentId,
      hasConnectDestination: !!creatorAccountId,
    });
    
    return paymentIntent;
  }
  
  /**
   * Confirm payment intent
   */
  async confirmPaymentIntent(paymentIntentId: string, paymentMethodId: string): Promise<Stripe.PaymentIntent> {
    const stripe = await getStripeClient();
    return stripe.paymentIntents.confirm(paymentIntentId, {
      payment_method: paymentMethodId,
    });
  }
  
  // ── Payouts ──
  
  /**
   * Create a payout to a Connect account
   */
  async createPayout(params: PayoutParams): Promise<Stripe.Transfer> {
    const { userId, accountId, amount, category, cycleId } = params;
    const stripe = await getStripeClient();
    
    // Verify account can receive payouts
    const status = await this.getAccountStatus(accountId);
    if (!status.payoutsEnabled) {
      throw new Error("Account is not enabled for payouts");
    }
    
    const transfer = await stripe.transfers.create({
      amount,
      currency: "eur",
      destination: accountId,
      metadata: {
        vixual_user_id: userId,
        category,
        cycle_id: cycleId || "",
        type: "creator_payout",
        platform: "vixual",
      },
    });
    
    // Record in database
    await sql`
      INSERT INTO payouts (user_id, amount_cents, category, cycle_id, stripe_transfer_id, status)
      VALUES (${userId}, ${amount}, ${category}, ${cycleId || null}, ${transfer.id}, 'pending')
    `;
    
    logStripeEvent("Payout created", {
      transferId: transfer.id,
      userId,
      amount,
      accountId,
    });
    
    return transfer;
  }
  
  /**
   * Batch payouts for multiple creators
   */
  async createBatchPayouts(payouts: PayoutParams[]): Promise<{
    successful: Stripe.Transfer[];
    failed: { params: PayoutParams; error: string }[];
  }> {
    const successful: Stripe.Transfer[] = [];
    const failed: { params: PayoutParams; error: string }[] = [];
    
    for (const payout of payouts) {
      try {
        const transfer = await this.createPayout(payout);
        successful.push(transfer);
      } catch (error) {
        failed.push({
          params: payout,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }
    
    logStripeEvent("Batch payouts completed", {
      total: payouts.length,
      successful: successful.length,
      failed: failed.length,
    });
    
    return { successful, failed };
  }
  
  // ── Refunds ──
  
  /**
   * Create a refund for a payment
   */
  async createRefund(paymentIntentId: string, reason?: string): Promise<Stripe.Refund> {
    const stripe = await getStripeClient();
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      reason: "requested_by_customer",
      metadata: {
        visual_reason: reason || "User requested refund",
        platform: "vixual",
      },
    });
    
    logStripeEvent("Refund created", {
      refundId: refund.id,
      paymentIntentId,
      amount: refund.amount,
    });
    
    return refund;
  }
  
  // ── Utilities ──
  
  /**
   * Check if an account can receive payouts
   */
  async canReceivePayouts(accountId: string): Promise<boolean> {
    try {
      const status = await this.getAccountStatus(accountId);
      return status.payoutsEnabled;
    } catch {
      return false;
    }
  }
  
  /**
   * Get balance for a Connect account
   */
  async getAccountBalance(accountId: string): Promise<Stripe.Balance> {
    const stripe = await getStripeClient();
    return stripe.balance.retrieve({
      stripeAccount: accountId,
    });
  }
  
  /**
   * List recent transfers to an account
   */
  async listTransfers(accountId: string, limit = 10): Promise<Stripe.Transfer[]> {
    const stripe = await getStripeClient();
    const transfers = await stripe.transfers.list({
      destination: accountId,
      limit,
    });
    return transfers.data;
  }
  
  /**
   * Sync account status from Stripe to database
   */
  async syncAccountStatus(accountId: string, userId: string): Promise<void> {
    const status = await this.getAccountStatus(accountId);
    
    await sql`
      UPDATE users 
      SET 
        stripe_account_status = ${status.status},
        stripe_account_details = ${JSON.stringify({
          chargesEnabled: status.chargesEnabled,
          payoutsEnabled: status.payoutsEnabled,
          requirements: status.requirements,
          lastSyncedAt: new Date().toISOString(),
        })}
      WHERE id = ${userId}
    `;
    
    logStripeEvent("Account status synced", { userId, accountId, status: status.status });
  }
}

// ── Export singleton ──
export const stripeConnectService = new StripeConnectService();
