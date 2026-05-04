import "server-only"
import { NextResponse, type NextRequest } from "next/server"
import { stripeConnectService } from "@/lib/integrations/stripe/stripe-connect-service"
import { sql } from "@/lib/db"
import { isPatron } from "@/lib/admin/roles"
import { logStripeEvent } from "@/lib/stripe"

/**
 * VIXUAL Admin API - Stripe Connect Dashboard
 * Endpoints pour la gestion des comptes Connect, paiements et redistributions
 */

// ── GET: Fetch dashboard stats and data ─────────────────────────────────────

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams
  const adminEmail = searchParams.get("email")
  const action = searchParams.get("action") || "stats"

  // Verify admin role (PATRON for now - extend to roles when role system ready)
  if (!adminEmail) {
    return NextResponse.json({ error: "Email requis" }, { status: 401 })
  }

  if (!isPatron(adminEmail)) {
    return NextResponse.json({ error: "Acces reserve au PATRON" }, { status: 403 })
  }

  try {
    switch (action) {
      case "stats":
        return await getStripeConnectStats()
      case "accounts":
        return await getConnectAccounts()
      case "payments":
        return await getRecentPayments()
      case "payouts":
        return await getPayoutLedger()
      default:
        return NextResponse.json({ error: "Action inconnue" }, { status: 400 })
    }
  } catch (error) {
    console.error("[ADMIN] Stripe Connect GET error:", error)
    return NextResponse.json(
      { error: "Erreur lors de la recuperation des donnees" },
      { status: 500 }
    )
  }
}

// ── POST: Execute actions (sync, payouts, etc.) ─────────────────────────────

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { email, action, ...params } = body

  // Verify admin role (PATRON only for now)
  if (!email) {
    return NextResponse.json({ error: "Email requis" }, { status: 401 })
  }

  if (!isPatron(email)) {
    return NextResponse.json({ error: "Acces reserve au PATRON" }, { status: 403 })
  }

  try {
    switch (action) {
      case "sync-all":
        return await syncAllAccounts()
      case "execute-payouts":
        return await executePayouts(email)
      case "resend-onboarding":
        return await resendOnboarding(params.accountId)
      case "refresh-account":
        return await refreshAccountStatus(params.accountId, params.userId)
      case "create-account":
        return await createConnectAccount(params)
      default:
        return NextResponse.json({ error: "Action inconnue" }, { status: 400 })
    }
  } catch (error) {
    console.error("[ADMIN] Stripe Connect POST error:", error)
    return NextResponse.json(
      { error: "Erreur lors de l'execution de l'action" },
      { status: 500 }
    )
  }
}

// ── PATCH: Update payout status (freeze/unfreeze) ─────────────────────────────

export async function PATCH(req: NextRequest) {
  const body = await req.json()
  const { email, payoutId, status } = body

  // Verify admin role (PATRON only for now)
  if (!email) {
    return NextResponse.json({ error: "Email requis" }, { status: 401 })
  }

  if (!isPatron(email)) {
    return NextResponse.json({ error: "Acces reserve au PATRON" }, { status: 403 })
  }

  try {
    await sql`
      UPDATE payout_ledger 
      SET status = ${status}, updated_at = NOW()
      WHERE id = ${payoutId}
    `

    logStripeEvent("Payout status updated by admin", {
      payoutId,
      newStatus: status,
      adminEmail: email,
    })

    return NextResponse.json({ ok: true, message: `Statut mis a jour: ${status}` })
  } catch (error) {
    console.error("[ADMIN] Payout PATCH error:", error)
    return NextResponse.json(
      { error: "Erreur lors de la mise a jour" },
      { status: 500 }
    )
  }
}

// ── Helper Functions ─────────────────────────────────────────────────────────

async function getStripeConnectStats() {
  // Get account stats
  const accountStats = await sql`
    SELECT 
      COUNT(*) as total,
      COUNT(*) FILTER (WHERE stripe_account_status = 'verified') as verified,
      COUNT(*) FILTER (WHERE stripe_account_status = 'pending') as pending,
      COUNT(*) FILTER (WHERE stripe_account_status = 'restricted') as restricted,
      COUNT(*) FILTER (WHERE stripe_account_status = 'disabled') as disabled
    FROM users 
    WHERE stripe_account_id IS NOT NULL
  `

  // Get payment stats
  const paymentStats = await sql`
    SELECT 
      COUNT(*) as total,
      COUNT(*) FILTER (WHERE status = 'succeeded') as successful,
      COUNT(*) FILTER (WHERE status = 'failed') as failed,
      COALESCE(SUM(amount_cents) FILTER (WHERE status = 'succeeded'), 0) / 100.0 as total_volume
    FROM payments
  `

  // Get payout stats
  const payoutStats = await sql`
    SELECT 
      COUNT(*) FILTER (WHERE status = 'pending') as pending_count,
      COALESCE(SUM(amount_cents) FILTER (WHERE status = 'pending'), 0) / 100.0 as pending_amount,
      COUNT(*) FILTER (WHERE status = 'paid') as completed_count,
      COALESCE(SUM(amount_cents) FILTER (WHERE status = 'paid'), 0) / 100.0 as completed_amount,
      COUNT(*) FILTER (WHERE status = 'frozen') as frozen_count,
      COALESCE(SUM(amount_cents) FILTER (WHERE status = 'frozen'), 0) / 100.0 as frozen_amount
    FROM payout_ledger
  `

  const stats = {
    totalAccounts: Number(accountStats[0]?.total) || 0,
    verifiedAccounts: Number(accountStats[0]?.verified) || 0,
    pendingAccounts: Number(accountStats[0]?.pending) || 0,
    restrictedAccounts: Number(accountStats[0]?.restricted) || 0,
    disabledAccounts: Number(accountStats[0]?.disabled) || 0,
    totalPayments: Number(paymentStats[0]?.total) || 0,
    successfulPayments: Number(paymentStats[0]?.successful) || 0,
    failedPayments: Number(paymentStats[0]?.failed) || 0,
    totalPaymentsVolume: Number(paymentStats[0]?.total_volume) || 0,
    pendingPayouts: Number(payoutStats[0]?.pending_count) || 0,
    pendingPayoutsAmount: Number(payoutStats[0]?.pending_amount) || 0,
    completedPayouts: Number(payoutStats[0]?.completed_count) || 0,
    completedPayoutsAmount: Number(payoutStats[0]?.completed_amount) || 0,
    frozenPayouts: Number(payoutStats[0]?.frozen_count) || 0,
    frozenPayoutsAmount: Number(payoutStats[0]?.frozen_amount) || 0,
    lastSyncAt: new Date().toISOString(),
  }

  return NextResponse.json({ stats })
}

async function getConnectAccounts() {
  const accounts = await sql`
    SELECT 
      u.id as user_id,
      u.email,
      u.display_name,
      u.stripe_account_id,
      u.stripe_account_status,
      u.stripe_account_details,
      u.created_at,
      COALESCE(SUM(pl.amount_cents) FILTER (WHERE pl.status = 'pending'), 0) / 100.0 as pending_amount,
      COALESCE(SUM(pl.amount_cents) FILTER (WHERE pl.status = 'paid'), 0) / 100.0 as total_paid
    FROM users u
    LEFT JOIN payout_ledger pl ON u.id = pl.user_id
    WHERE u.stripe_account_id IS NOT NULL
    GROUP BY u.id, u.email, u.display_name, u.stripe_account_id, u.stripe_account_status, u.stripe_account_details, u.created_at
    ORDER BY u.created_at DESC
    LIMIT 100
  `

  const formatted = accounts.map(acc => ({
    id: acc.stripe_account_id,
    userId: acc.user_id,
    email: acc.email,
    displayName: acc.display_name || acc.email?.split("@")[0] || "Utilisateur",
    status: acc.stripe_account_status || "pending",
    chargesEnabled: acc.stripe_account_details?.chargesEnabled || false,
    payoutsEnabled: acc.stripe_account_details?.payoutsEnabled || false,
    createdAt: acc.created_at,
    country: acc.stripe_account_details?.country || "FR",
    pendingAmount: Number(acc.pending_amount) || 0,
    totalPaid: Number(acc.total_paid) || 0,
    requirementsDue: acc.stripe_account_details?.requirements?.currentlyDue?.length || 0,
  }))

  return NextResponse.json({ accounts: formatted })
}

async function getRecentPayments() {
  const payments = await sql`
    SELECT 
      p.id,
      p.user_id,
      u.email as user_email,
      p.content_id,
      c.title as content_title,
      p.amount_cents,
      p.status,
      p.created_at,
      p.stripe_payment_intent_id
    FROM payments p
    LEFT JOIN users u ON p.user_id = u.id
    LEFT JOIN contents c ON p.content_id = c.id
    ORDER BY p.created_at DESC
    LIMIT 50
  `

  const formatted = payments.map(p => ({
    id: p.id,
    userId: p.user_id,
    userEmail: p.user_email || "unknown",
    contentId: p.content_id,
    contentTitle: p.content_title || "Contenu",
    amount: Number(p.amount_cents) / 100,
    status: p.status,
    createdAt: p.created_at,
    stripePaymentIntentId: p.stripe_payment_intent_id,
  }))

  return NextResponse.json({ payments: formatted })
}

async function getPayoutLedger() {
  const payouts = await sql`
    SELECT 
      pl.id,
      pl.user_id,
      u.email as user_email,
      pl.amount_cents,
      pl.category,
      pl.status,
      pl.stripe_transfer_id,
      pl.created_at,
      pl.cycle_id
    FROM payout_ledger pl
    LEFT JOIN users u ON pl.user_id = u.id
    ORDER BY pl.created_at DESC
    LIMIT 100
  `

  const formatted = payouts.map(p => ({
    id: p.id,
    userId: p.user_id,
    userEmail: p.user_email || "unknown",
    amount: Number(p.amount_cents) / 100,
    category: p.category,
    status: p.status,
    stripeTransferId: p.stripe_transfer_id,
    createdAt: p.created_at,
    cycleId: p.cycle_id,
  }))

  return NextResponse.json({ payouts: formatted })
}

async function syncAllAccounts() {
  const accounts = await sql`
    SELECT id, stripe_account_id 
    FROM users 
    WHERE stripe_account_id IS NOT NULL
  `

  let synced = 0
  let errors = 0

  for (const account of accounts) {
    try {
      await stripeConnectService.syncAccountStatus(account.stripe_account_id, account.id)
      synced++
    } catch {
      errors++
    }
  }

  logStripeEvent("Admin sync all accounts completed", { synced, errors })

  return NextResponse.json({
    ok: true,
    message: `Synchronisation terminee: ${synced} reussis, ${errors} erreurs`,
    synced,
    errors,
  })
}

async function executePayouts(adminEmail: string) {
  // Get pending payouts
  const pendingPayouts = await sql`
    SELECT 
      pl.id,
      pl.user_id,
      u.stripe_account_id,
      pl.amount_cents,
      pl.category,
      pl.cycle_id
    FROM payout_ledger pl
    JOIN users u ON pl.user_id = u.id
    WHERE pl.status = 'pending' 
      AND u.stripe_account_id IS NOT NULL
      AND u.stripe_account_status = 'verified'
  `

  const results = {
    successful: 0,
    failed: 0,
    skipped: 0,
    errors: [] as string[],
  }

  for (const payout of pendingPayouts) {
    try {
      // Check if account can receive payouts
      const canPay = await stripeConnectService.canReceivePayouts(payout.stripe_account_id)
      if (!canPay) {
        results.skipped++
        continue
      }

      // Create transfer
      await stripeConnectService.createPayout({
        userId: payout.user_id,
        accountId: payout.stripe_account_id,
        amount: payout.amount_cents,
        category: payout.category,
        cycleId: payout.cycle_id,
      })

      // Update ledger status
      await sql`
        UPDATE payout_ledger 
        SET status = 'processing', updated_at = NOW()
        WHERE id = ${payout.id}
      `

      results.successful++
    } catch (error) {
      results.failed++
      results.errors.push(`Payout ${payout.id}: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  logStripeEvent("Admin execute payouts completed", {
    adminEmail,
    ...results,
  })

  return NextResponse.json({
    ok: true,
    message: `Execution terminee: ${results.successful} reussis, ${results.failed} echoues, ${results.skipped} ignores`,
    ...results,
  })
}

async function resendOnboarding(accountId: string) {
  const url = await stripeConnectService.refreshOnboardingLink(accountId)
  
  logStripeEvent("Admin resend onboarding link", { accountId })

  return NextResponse.json({ ok: true, url })
}

async function refreshAccountStatus(accountId: string, userId: string) {
  await stripeConnectService.syncAccountStatus(accountId, userId)
  
  return NextResponse.json({ ok: true, message: "Statut actualise" })
}

async function createConnectAccount(params: { userId: string; email: string }) {
  const result = await stripeConnectService.createConnectAccount({
    userId: params.userId,
    email: params.email,
    country: "FR",
    type: "express",
    businessType: "individual",
  })

  return NextResponse.json({
    ok: true,
    accountId: result.accountId,
    onboardingUrl: result.onboardingUrl,
  })
}
