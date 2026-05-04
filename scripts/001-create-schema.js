import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

async function migrate() {
  console.log("Starting VIXUAL database migration...");

  try {
    await sql`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`;
    console.log("OK: pgcrypto extension");
  } catch (err) {
    console.log("pgcrypto already exists or skipped:", err.message);
  }

  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      roles TEXT[] NOT NULL DEFAULT ARRAY['visitor'],
      avatar_url TEXT,
      visupoints INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;
  console.log("OK: users table");

  await sql`
    CREATE TABLE IF NOT EXISTS stripe_accounts (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      stripe_account_id TEXT UNIQUE,
      status TEXT NOT NULL DEFAULT 'not_started',
      onboarding_url TEXT,
      charges_enabled BOOLEAN NOT NULL DEFAULT false,
      payouts_enabled BOOLEAN NOT NULL DEFAULT false,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      UNIQUE(user_id)
    )
  `;
  console.log("OK: stripe_accounts table");

  await sql`
    CREATE TABLE IF NOT EXISTS cautions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      caution_type TEXT NOT NULL,
      amount_cents INTEGER NOT NULL,
      stripe_payment_intent_id TEXT UNIQUE,
      status TEXT NOT NULL DEFAULT 'pending',
      paid_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;
  console.log("OK: cautions table");

  await sql`
    CREATE TABLE IF NOT EXISTS contents (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      description TEXT,
      content_type TEXT NOT NULL,
      category TEXT,
      cover_url TEXT,
      is_free BOOLEAN NOT NULL DEFAULT false,
      investment_goal_cents INTEGER NOT NULL DEFAULT 0,
      current_investment_cents INTEGER NOT NULL DEFAULT 0,
      investor_count INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'draft',
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;
  console.log("OK: contents table");

  await sql`
    CREATE TABLE IF NOT EXISTS investments (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      content_id UUID NOT NULL REFERENCES contents(id) ON DELETE CASCADE,
      amount_cents INTEGER NOT NULL,
      votes_granted INTEGER NOT NULL DEFAULT 0,
      visupoints_granted INTEGER NOT NULL DEFAULT 0,
      stripe_payment_intent_id TEXT UNIQUE,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;
  console.log("OK: investments table");

  await sql`
    CREATE TABLE IF NOT EXISTS wallets (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      available_cents INTEGER NOT NULL DEFAULT 0,
      pending_cents INTEGER NOT NULL DEFAULT 0,
      total_earned_cents INTEGER NOT NULL DEFAULT 0,
      total_withdrawn_cents INTEGER NOT NULL DEFAULT 0,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;
  console.log("OK: wallets table");

  await sql`
    CREATE TABLE IF NOT EXISTS wallet_transactions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      type TEXT NOT NULL,
      amount_cents INTEGER NOT NULL,
      description TEXT,
      reference_id TEXT,
      status TEXT NOT NULL DEFAULT 'completed',
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;
  console.log("OK: wallet_transactions table");

  await sql`
    CREATE TABLE IF NOT EXISTS payout_cycles (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      cycle_id TEXT UNIQUE NOT NULL,
      content_id UUID REFERENCES contents(id),
      gross_eligible_cents INTEGER NOT NULL,
      platform_take_cents INTEGER NOT NULL DEFAULT 0,
      platform_fee_cents INTEGER NOT NULL DEFAULT 0,
      platform_residual_cents INTEGER NOT NULL DEFAULT 0,
      total_user_payout_cents INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'pending',
      computed_at TIMESTAMPTZ,
      distributed_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;
  console.log("OK: payout_cycles table");

  await sql`
    CREATE TABLE IF NOT EXISTS ledger_entries (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      entry_id TEXT UNIQUE NOT NULL,
      payout_cycle_id UUID REFERENCES payout_cycles(id),
      user_id UUID REFERENCES users(id),
      type TEXT NOT NULL,
      amount_cents INTEGER NOT NULL,
      currency TEXT NOT NULL DEFAULT 'eur',
      status TEXT NOT NULL DEFAULT 'posted',
      meta JSONB DEFAULT '{}',
      occurred_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;
  console.log("OK: ledger_entries table");

  await sql`
    CREATE TABLE IF NOT EXISTS withdrawal_requests (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      amount_cents INTEGER NOT NULL,
      stripe_transfer_id TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      processed_at TIMESTAMPTZ
    )
  `;
  console.log("OK: withdrawal_requests table");

  await sql`CREATE INDEX IF NOT EXISTS idx_investments_user ON investments(user_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_investments_content ON investments(content_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_wallet_transactions_user ON wallet_transactions(user_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_ledger_entries_user ON ledger_entries(user_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_ledger_entries_cycle ON ledger_entries(payout_cycle_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_contents_creator ON contents(creator_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_contents_status ON contents(status)`;
  console.log("OK: all indexes created");

  console.log("VIXUAL database migration complete!");
}

migrate().catch((err) => {
  console.error("Migration failed:", err.message);
  process.exit(1);
});
