import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

async function migrate() {
  console.log("Starting VIXUAL security patch migration (003)...");

  // ── 1. payout_simulations table (audit trail) ──
  await sql`
    CREATE TABLE IF NOT EXISTS payout_simulations (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      simulation_id TEXT UNIQUE NOT NULL,
      cycle_id TEXT NOT NULL,
      category TEXT NOT NULL,
      gross_eligible_cents INTEGER NOT NULL,
      total_user_payout_cents INTEGER NOT NULL,
      platform_take_cents INTEGER NOT NULL,
      allocations_count INTEGER NOT NULL DEFAULT 0,
      integrity_check BOOLEAN NOT NULL DEFAULT false,
      warnings TEXT[] DEFAULT ARRAY[]::TEXT[],
      allocation_snapshot JSONB DEFAULT '[]',
      computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;
  console.log("OK: payout_simulations table");

  // ── 2. webhook_events table (idempotency / reconciliation) ──
  await sql`
    CREATE TABLE IF NOT EXISTS webhook_events (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      stripe_event_id TEXT UNIQUE NOT NULL,
      event_type TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'received'
        CHECK (status IN ('received', 'processing', 'processed', 'failed')),
      payload JSONB DEFAULT '{}',
      error_message TEXT,
      received_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      processed_at TIMESTAMPTZ
    )
  `;
  console.log("OK: webhook_events table");

  // ── 3. Add birth_date, kyc_verified columns to users ──
  try {
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS birth_date DATE`;
    console.log("OK: users.birth_date column");
  } catch (err) {
    console.log("users.birth_date skipped:", err.message);
  }

  try {
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS kyc_verified BOOLEAN NOT NULL DEFAULT false`;
    console.log("OK: users.kyc_verified column");
  } catch (err) {
    console.log("users.kyc_verified skipped:", err.message);
  }

  try {
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS kyc_verified_at TIMESTAMPTZ`;
    console.log("OK: users.kyc_verified_at column");
  } catch (err) {
    console.log("users.kyc_verified_at skipped:", err.message);
  }

  try {
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS trust_score NUMERIC(3,2) NOT NULL DEFAULT 2.50`;
    console.log("OK: users.trust_score column");
  } catch (err) {
    console.log("users.trust_score skipped:", err.message);
  }

  try {
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS account_status TEXT NOT NULL DEFAULT 'active'`;
    console.log("OK: users.account_status column");
  } catch (err) {
    console.log("users.account_status skipped:", err.message);
  }

  // ── 4. Add metadata JSONB to contents ──
  try {
    await sql`ALTER TABLE contents ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'`;
    console.log("OK: contents.metadata column");
  } catch (err) {
    console.log("contents.metadata skipped:", err.message);
  }

  try {
    await sql`ALTER TABLE contents ADD COLUMN IF NOT EXISTS ip_declared BOOLEAN NOT NULL DEFAULT false`;
    console.log("OK: contents.ip_declared column");
  } catch (err) {
    console.log("contents.ip_declared skipped:", err.message);
  }

  try {
    await sql`ALTER TABLE contents ADD COLUMN IF NOT EXISTS ip_declared_at TIMESTAMPTZ`;
    console.log("OK: contents.ip_declared_at column");
  } catch (err) {
    console.log("contents.ip_declared_at skipped:", err.message);
  }

  // ── 5. reports table (signalement system) ──
  await sql`
    CREATE TABLE IF NOT EXISTS reports (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      reporter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      target_id TEXT NOT NULL,
      target_type TEXT NOT NULL CHECK (target_type IN ('content', 'comment', 'user', 'other')),
      category TEXT NOT NULL,
      details TEXT,
      status TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
      admin_decision TEXT,
      admin_note TEXT,
      resolved_by UUID REFERENCES users(id),
      resolved_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;
  console.log("OK: reports table");

  // ── 6. Integrity & performance indexes ──
  await sql`CREATE INDEX IF NOT EXISTS idx_ledger_entries_status ON ledger_entries(status)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_ledger_entries_occurred ON ledger_entries(occurred_at)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_wallet_transactions_type ON wallet_transactions(type)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_wallet_transactions_created ON wallet_transactions(created_at)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_contents_type ON contents(content_type)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_contents_creator_type ON contents(creator_id, content_type)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_payout_simulations_cycle ON payout_simulations(cycle_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_payout_simulations_computed ON payout_simulations(computed_at)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_webhook_events_stripe ON webhook_events(stripe_event_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_webhook_events_status ON webhook_events(status)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_reports_target ON reports(target_id, target_type)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_reports_category ON reports(category)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_investments_user_content ON investments(user_id, content_id)`;
  console.log("OK: all security patch indexes created");

  console.log("VIXUAL security patch migration (003) complete!");
}

migrate().catch((err) => {
  console.error("Migration 003 failed:", err.message);
  process.exit(1);
});
