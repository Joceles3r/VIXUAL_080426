import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getStripeClient, isStripeConfiguredAsync, getWebhookSecret, logStripeEvent } from "@/lib/stripe";
import { sql } from "@/lib/db";
import { stripeConnectService } from "@/lib/integrations/stripe/stripe-connect-service";

/**
 * POST /api/integrations/stripe/webhooks
 * Handle Stripe Connect webhooks with idempotency
 * Uses async DB-based Stripe configuration
 */
export async function POST(req: NextRequest) {
  // Fail-fast if Stripe is not configured (async check)
  const isConfigured = await isStripeConfiguredAsync();
  if (!isConfigured) {
    console.error("[Stripe Webhook] Stripe is not configured");
    return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
  }
  
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");
  const webhookSecret = await getWebhookSecret();
  
  if (!signature || !webhookSecret) {
    console.error("[Stripe Webhook] Missing signature or webhook secret");
    return NextResponse.json({ error: "Missing signature or secret" }, { status: 400 });
  }
  
  let event: Stripe.Event;
  const stripe = await getStripeClient();
  
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("[Stripe Webhook] Signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }
  
  // Idempotence atomique : INSERT ... ON CONFLICT DO NOTHING.
  // Si une insertion retourne 0 ligne, c'est un doublon → on sort proprement.
  const inserted = await sql`
    INSERT INTO stripe_events_log (id, event_type, livemode, payload, processing_status)
    VALUES (${event.id}, ${event.type}, ${event.livemode}, ${JSON.stringify(event.data)}, 'processing')
    ON CONFLICT (id) DO NOTHING
    RETURNING id
  `;
  
  if (inserted.length === 0) {
    logStripeEvent("Duplicate webhook ignored (idempotency)", { 
      eventId: event.id, 
      type: event.type,
    });
    return NextResponse.json({ received: true, duplicate: true });
  }
  
  try {
    // Process event based on type
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;
        
      case "payment_intent.succeeded":
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;
        
      case "payment_intent.payment_failed":
        await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
        break;
        
      case "charge.refunded":
        await handleChargeRefunded(event.data.object as Stripe.Charge);
        break;
        
      case "transfer.created":
        await handleTransferCreated(event.data.object as Stripe.Transfer);
        break;
        
      case "transfer.reversed":
        await handleTransferFailed(event.data.object as Stripe.Transfer);
        break;
        
      case "account.updated":
        await handleAccountUpdated(event.data.object as Stripe.Account);
        break;
        
      case "account.application.deauthorized":
        await handleAccountDeauthorized(event.data.object as unknown as Stripe.Application);
        break;
        
      case "payout.paid":
        await handlePayoutPaid(event.data.object as Stripe.Payout);
        break;
        
      case "payout.failed":
        await handlePayoutFailed(event.data.object as Stripe.Payout);
        break;
        
      default:
        logStripeEvent("Unhandled webhook event", { type: event.type });
    }
    
    // Mark event as processed successfully
    await sql`
      UPDATE stripe_events_log 
      SET processing_status = 'processed', processed_at = NOW() 
      WHERE id = ${event.id}
    `;
    
    return NextResponse.json({ received: true });
    
  } catch (error) {
    // Record error but return 200 (Stripe will retry on 5xx)
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    await sql`
      UPDATE stripe_events_log 
      SET processing_status = 'failed', error_message = ${errorMessage}
      WHERE id = ${event.id}
    `;
    
    console.error("[Stripe Webhook] Processing error:", error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// ── Event Handlers ──

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  logStripeEvent("Payment Intent succeeded", { 
    id: paymentIntent.id, 
    amount: paymentIntent.amount 
  });
  
  const metadata = paymentIntent.metadata;
  
  if (metadata.type === "investment" && metadata.vixual_user_id) {
    // Update investment status
    await sql`
      UPDATE investments 
      SET status = 'completed', completed_at = NOW()
      WHERE stripe_payment_intent_id = ${paymentIntent.id}
    `;
    
    // VERROU FINAL: credit VIXUpoints au contributeur (colonne DB visupoints_balance conservee)
    const vixupointsGranted = parseInt(metadata.vixupoints_granted || metadata.visupoints_granted || "0", 10);
    if (vixupointsGranted > 0) {
      await sql`
        UPDATE users 
        SET visupoints_balance = COALESCE(visupoints_balance, 0) + ${vixupointsGranted}
        WHERE id = ${metadata.vixual_user_id}
      `;
    }
    
    // Update content funding
    if (metadata.vixual_content_id) {
      await sql`
        UPDATE contents 
        SET current_investment = COALESCE(current_investment, 0) + ${paymentIntent.amount}
        WHERE id = ${metadata.vixual_content_id}
      `;
    }
  }
}

async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  logStripeEvent("Payment Intent failed", { 
    id: paymentIntent.id, 
    error: paymentIntent.last_payment_error?.message 
  });
  
  await sql`
    UPDATE investments 
    SET status = 'failed', error = ${paymentIntent.last_payment_error?.message || 'Payment failed'}
    WHERE stripe_payment_intent_id = ${paymentIntent.id}
  `;
}

async function handleChargeRefunded(charge: Stripe.Charge) {
  logStripeEvent("Charge refunded", { 
    id: charge.id, 
    amount: charge.amount_refunded 
  });
  
  // Find original transaction and create refund record
  const paymentIntentId = typeof charge.payment_intent === "string" 
    ? charge.payment_intent 
    : charge.payment_intent?.id;
    
  if (paymentIntentId) {
    await sql`
      UPDATE investments 
      SET status = 'refunded', refunded_at = NOW()
      WHERE stripe_payment_intent_id = ${paymentIntentId}
    `;
  }
}

async function handleTransferCreated(transfer: Stripe.Transfer) {
  logStripeEvent("Transfer created", { 
    id: transfer.id, 
    destination: transfer.destination,
    amount: transfer.amount,
  });
  
  // Mark payout as processing in payout_ledger if the transfer matches
  await sql`
    UPDATE payout_ledger 
    SET status = 'processing', updated_at = NOW()
    WHERE stripe_transfer_id = ${transfer.id}
      AND status IN ('pending', 'processing')
  `.catch(() => {});
}

async function handleTransferFailed(transfer: Stripe.Transfer) {
  logStripeEvent("Transfer failed", { 
    id: transfer.id, 
    destination: transfer.destination 
  });
  
  // Update payout_ledger status (canonical table - payouts is legacy)
  await sql`
    UPDATE payout_ledger 
    SET status = 'failed', 
        metadata = COALESCE(metadata, '{}'::jsonb) || ${JSON.stringify({ error: "Transfer failed", failedAt: new Date().toISOString() })}::jsonb,
        updated_at = NOW()
    WHERE stripe_transfer_id = ${transfer.id}
  `.catch(() => {});
}

async function handleAccountUpdated(account: Stripe.Account) {
  logStripeEvent("Account updated", { 
    id: account.id, 
    chargesEnabled: account.charges_enabled,
    payoutsEnabled: account.payouts_enabled
  });
  
  // Find user with this account
  const users = await sql`
    SELECT id FROM users WHERE stripe_account_id = ${account.id}
  `;
  
  if (users.length > 0) {
    await stripeConnectService.syncAccountStatus(account.id, users[0].id as string);
  }
}

async function handleAccountDeauthorized(app: Stripe.Application) {
  logStripeEvent("Account deauthorized", { id: app.id });
  
  // Disable the account in our system
  await sql`
    UPDATE users 
    SET stripe_account_status = 'disabled'
    WHERE stripe_account_id = ${app.id}
  `;
}

async function handlePayoutPaid(payout: Stripe.Payout) {
  logStripeEvent("Payout paid", { 
    id: payout.id, 
    amount: payout.amount 
  });
  
  // Update payout status if we have a record
  // Note: This is for account-level payouts, not our transfers
}

async function handlePayoutFailed(payout: Stripe.Payout) {
  logStripeEvent("Payout failed", { 
    id: payout.id, 
    failureMessage: payout.failure_message 
  });
  
  // TODO: Notify admin and affected user
}

/**
 * Handle Checkout Session completed (Ticket Gold, etc.)
 */
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  logStripeEvent("Checkout session completed", { 
    id: session.id,
    paymentStatus: session.payment_status,
    metadata: session.metadata
  });
  
  const metadata = session.metadata || {};
  
  // ── Priority Reintegration 25€ ────────────────────────────────────
  if (metadata.product_type === "priority_reintegration") {
    const projectId = metadata.project_id;
    const userId = metadata.user_id;
    if (projectId && userId) {
      await sql`
        UPDATE projects
        SET status = 'prioritized',
            priority_reintegrated_at = NOW(),
            priority_payment_id = ${session.payment_intent || session.id}
        WHERE id = ${projectId}
      `.catch((err) => {
        console.error("[Webhook/PriorityReintegration] UPDATE failed:", err);
      });
      logStripeEvent("Priority reintegration activated", { projectId, userId });
    }
    return;
  }
  
  // ── Free Support (soutien libre) ──────────────────────────────────
  if (metadata.product_type === "free_support") {
    const creatorId = metadata.creator_id;
    const userId = metadata.user_id;
    const amountCents = parseInt(metadata.amount_cents || "0", 10);
    if (creatorId && amountCents > 0) {
      // Journalise dans payments (pour historique)
      await sql`
        INSERT INTO payments (
          user_id, stripe_checkout_session_id, stripe_payment_intent_id,
          amount_cents, status, payment_type, metadata
        ) VALUES (
          ${userId === "anonymous" ? null : userId},
          ${session.id},
          ${session.payment_intent as string | null},
          ${amountCents},
          'succeeded',
          'free_support',
          ${JSON.stringify({ creator_id: creatorId, platform_fee_cents: metadata.platform_fee_cents })}::jsonb
        )
        ON CONFLICT (stripe_checkout_session_id) DO NOTHING
      `.catch((err) => {
        console.error("[Webhook/FreeSupport] INSERT failed:", err);
      });
      logStripeEvent("Free support recorded", { creatorId, amountCents });
    }
    return;
  }
  
  // Handle Ticket Gold purchase
  if (metadata.product_type === "ticket_gold") {
    const projectId = metadata.project_id;
    const userId = metadata.user_id;
    
    if (projectId && userId) {
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 48 * 60 * 60 * 1000); // 48 hours
      
      // Insert ticket_gold record - aligned with migration 025 schema
      // Schema uses: is_active, stripe_payment_id (not status, stripe_session_id)
      const ticketId = `tg_${projectId}_${Date.now()}`;
      await sql`
        INSERT INTO ticket_gold (
          id, project_id, user_id, purchased_at, activated_at, expires_at, 
          is_active, boost_multiplier, stripe_payment_id
        ) VALUES (
          ${ticketId}, ${projectId}, ${userId}, NOW(), NOW(), ${expiresAt.toISOString()}, 
          TRUE, 0.50, ${session.payment_intent || session.id}
        )
      `;
      
      // Update project visibility boost
      await sql`
        UPDATE projects 
        SET visibility_boost = COALESCE(visibility_boost, 0) + 50,
            ticket_gold_active = true,
            ticket_gold_expires_at = ${expiresAt.toISOString()}
        WHERE id = ${projectId}
      `;
      
      logStripeEvent("Ticket Gold activated", { projectId, userId, expiresAt });
    }
  }
}
