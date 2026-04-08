import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { computePayoutAllocations } from "@/lib/payout/payout-engine";
import type { PayoutEngineInput, PayoutCategory } from "@/lib/payout/types";
import { apiError, ErrorCodes, withErrorHandler } from "@/lib/api-errors";

/**
 * POST /api/payout/execute
 * 
 * Executes a payout cycle for a given content:
 * 1. Reads all investments for the content
 * 2. Ranks investors by total amount invested
 * 3. Feeds the payout engine with TOP10 investors, TOP10 creators, and ranks 11-100
 * 4. Writes payout_cycles, ledger_entries, and credits wallets
 * 
 * This route should be called by an admin or a scheduled job (cron).
 * In production, add proper authentication/authorization.
 */
export const POST = withErrorHandler(async (req: Request) => {
    const body = await req.json();
    const { contentId, adminSecret } = body;

    // Admin secret protection - no dev bypass allowed
    const expectedSecret = process.env.VISUAL_ADMIN_SECRET;
    if (!expectedSecret) {
      console.error("[VIXUAL Payout] VISUAL_ADMIN_SECRET not configured");
      return apiError(ErrorCodes.ERR_SERVER_ERROR, "Server configuration error", 503);
    }
    if (adminSecret !== expectedSecret) {
      return apiError(ErrorCodes.ERR_UNAUTHORIZED, "Unauthorized", 401);
    }

    if (!contentId) {
      return apiError(ErrorCodes.ERR_MISSING_FIELD, "contentId is required", 400);
    }

    // Get the content
    const contents = await sql`SELECT * FROM contents WHERE id = ${contentId}`;
    if (contents.length === 0) {
      return NextResponse.json({ error: "Content not found" }, { status: 404 });
    }
    const content = contents[0];
    const grossEligibleCents = content.current_investment_cents as number;

    if (grossEligibleCents <= 0) {
      return NextResponse.json({ error: "No investments to distribute" }, { status: 400 });
    }

    // Get all completed investments for this content, ranked by amount
    const investments = await sql`
      SELECT user_id, SUM(amount_cents) as total_cents, 
             COUNT(*) as investment_count
      FROM investments 
      WHERE content_id = ${contentId} AND status = 'completed'
      GROUP BY user_id
      ORDER BY total_cents DESC
    `;

    if (investments.length === 0) {
      return NextResponse.json({ error: "No completed investments found" }, { status: 400 });
    }

    // Get the content creator(s) - for now, single creator
    const creatorId = content.creator_id as string;
    const creators = await sql`SELECT id, roles FROM users WHERE id = ${creatorId}`;

    // Determine payout category from content_type
    // video -> films, text -> livres, podcast -> podcasts
    // For Voix de l'Info articles, content_type is "text" with category "voix_info"
    let payoutCategory: PayoutCategory = "films";
    const contentCategory = content.category as string | undefined;
    if (content.content_type === "text") {
      payoutCategory = contentCategory === "voix_info" ? "voix_info" : "livres";
    } else if (content.content_type === "podcast") {
      payoutCategory = "podcasts";
    }

    // Determine roles based on category
    const roleMap: Record<PayoutCategory, { investor: "investor" | "investireader" | "listener"; creator: "porter" | "infoporter" | "podcaster" }> = {
      films: { investor: "investor", creator: "porter" },
      voix_info: { investor: "investireader", creator: "infoporter" },
      livres: { investor: "investireader", creator: "infoporter" },
      podcasts: { investor: "listener", creator: "podcaster" },
    };
    const roles = roleMap[payoutCategory];

    // Build the payout engine input
    const cycleId = `cycle_${contentId}_${Date.now()}`;

    // TOP10 investors (first 10 ranked by total investment)
    const top10Investors = investments.slice(0, 10).map((inv: Record<string, unknown>) => ({
      userId: inv.user_id as string,
      role: roles.investor,
    }));

    // Pad to 10 if needed (engine expects exactly 10 for films)
    while (top10Investors.length < 10) {
      top10Investors.push({
        userId: `placeholder_inv_${top10Investors.length}`,
        role: roles.investor,
      });
    }

    // TOP10 creators - for V1, we have 1 creator, pad the rest
    const top10Creators = [{
      userId: creatorId,
      role: roles.creator,
    }];
    while (top10Creators.length < 10) {
      top10Creators.push({
        userId: `placeholder_creator_${top10Creators.length}`,
        role: roles.creator,
      });
    }

    // Investors ranks 11-100
    const investors11to100 = investments.slice(10, 100).map((inv: Record<string, unknown>) => ({
      userId: inv.user_id as string,
      role: roles.investor,
    }));

    const engineInput: PayoutEngineInput = {
      cycleId,
      category: payoutCategory,
      grossEligibleCents,
      top10Investors,
      top10Creators,
      investors11to100,
      closedAtIso: new Date().toISOString(),
    };

    // Run the payout engine (V3 with simulation logging)
    const result = computePayoutAllocations(engineInput);

    // ── Step 1: Log simulation BEFORE committing real transactions ──
    // This enables audit trails and double-verification of calculations
    try {
      await sql`
        INSERT INTO payout_simulations (
          simulation_id, cycle_id, category, gross_eligible_cents,
          total_user_payout_cents, platform_take_cents,
          allocations_count, integrity_check, warnings, allocation_snapshot, computed_at
        ) VALUES (
          ${result.simulation.simulationId},
          ${result.simulation.cycleId},
          ${result.simulation.category},
          ${result.simulation.grossEligibleCents},
          ${result.simulation.totalUserPayoutCents},
          ${result.simulation.platformTakeCents},
          ${result.simulation.allocationsCount},
          ${result.simulation.integrityCheck},
          ${JSON.stringify(result.simulation.warnings)},
          ${JSON.stringify(result.simulation.allocationSnapshot)},
          ${result.simulation.computedAt}
        )
      `;
    } catch (simError) {
      // Simulation log failure is non-blocking but logged
      console.error("Failed to log payout simulation:", simError);
    }

    // ── Step 2: Integrity gate -- abort if integrity check fails ──
    if (!result.simulation.integrityCheck) {
      return NextResponse.json({
        error: "Payout integrity check failed. Simulation logged for review. Distribution aborted.",
        simulationId: result.simulation.simulationId,
        warnings: result.warnings,
      }, { status: 422 });
    }

    // Store payout cycle
    await sql`
      INSERT INTO payout_cycles (cycle_id, content_id, gross_eligible_cents, platform_take_cents, platform_fee_cents, platform_residual_cents, total_user_payout_cents, status, computed_at)
      VALUES (${result.cycleId}, ${contentId}, ${result.grossEligibleCents}, ${result.platformTakeCents}, ${result.platformFeeCents}, ${result.platformResidualCents}, ${result.totalUserPayoutCents}, 'computed', now())
    `;

    // Get payout cycle id
    const cycleRows = await sql`SELECT id FROM payout_cycles WHERE cycle_id = ${result.cycleId}`;
    const payoutCycleDbId = cycleRows[0].id as string;

    // Store ledger entries and credit wallets
    for (const entry of result.ledgerEntries) {
      await sql`
        INSERT INTO ledger_entries (entry_id, payout_cycle_id, user_id, type, amount_cents, currency, status, meta, occurred_at)
        VALUES (${entry.entryId}, ${payoutCycleDbId}, ${entry.userId || null}, ${entry.type}, ${entry.amountCents}, ${entry.currency}, ${entry.status}, ${JSON.stringify(entry.meta)}, ${entry.occurredAt})
      `;

      // Credit user wallets for wallet_credit_gain entries
      if (entry.type === "wallet_credit_gain" && entry.userId && !entry.userId.startsWith("placeholder_")) {
        // Ensure wallet exists
        const wallets = await sql`SELECT id FROM wallets WHERE user_id = ${entry.userId}`;
        if (wallets.length === 0) {
          await sql`INSERT INTO wallets (user_id) VALUES (${entry.userId})`;
        }

        // Credit the wallet
        await sql`
          UPDATE wallets
          SET available_cents = available_cents + ${entry.amountCents},
              total_earned_cents = total_earned_cents + ${entry.amountCents},
              updated_at = now()
          WHERE user_id = ${entry.userId}
        `;

        // Record wallet transaction
        await sql`
          INSERT INTO wallet_transactions (user_id, type, amount_cents, description, reference_id, status)
          VALUES (${entry.userId}, 'return', ${entry.amountCents}, ${'Gain cycle: ' + result.cycleId}, ${entry.entryId}, 'completed')
        `;
      }
    }

    // Mark cycle as distributed
    await sql`
      UPDATE payout_cycles SET status = 'distributed', distributed_at = now() WHERE cycle_id = ${result.cycleId}
    `;

    // Update content status
    await sql`
      UPDATE contents SET status = 'closed', updated_at = now() WHERE id = ${contentId}
    `;

    return NextResponse.json({
      success: true,
      cycleId: result.cycleId,
      simulationId: result.simulation.simulationId,
      grossEligibleCents: result.grossEligibleCents,
      platformTakeCents: result.platformTakeCents,
      platformFeeCents: result.platformFeeCents,
      platformResidualCents: result.platformResidualCents,
      totalUserPayoutCents: result.totalUserPayoutCents,
      allocationsCount: result.allocations.length,
      ledgerEntriesCount: result.ledgerEntries.length,
      warnings: result.warnings,
      integrityCheck: result.simulation.integrityCheck,
    });
});
