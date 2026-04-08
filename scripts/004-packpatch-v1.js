import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

async function migrate() {
  console.log("[004] PackPatch V1 migration starting...");

  // 1. VISUpoints transactions table (for daily cap tracking + audit)
  await sql`
    CREATE TABLE IF NOT EXISTS visupoints_transactions (
      id SERIAL PRIMARY KEY,
      user_id TEXT NOT NULL,
      type TEXT NOT NULL CHECK (type IN ('credit', 'debit', 'conversion', 'bonus')),
      points INTEGER NOT NULL,
      source TEXT,
      balance_after INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  console.log("[004] Created visupoints_transactions table");

  // 2. Add visupoints_balance column to users if not exists
  await sql`
    ALTER TABLE users ADD COLUMN IF NOT EXISTS visupoints_balance INTEGER NOT NULL DEFAULT 0
  `;
  console.log("[004] Added visupoints_balance to users");

  // 3. Content creators table (for batch payout: maps content -> creators with rank)
  await sql`
    CREATE TABLE IF NOT EXISTS content_creators (
      id SERIAL PRIMARY KEY,
      content_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'porter',
      rank INTEGER NOT NULL DEFAULT 1,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE(content_id, user_id)
    )
  `;
  console.log("[004] Created content_creators table");

  // 4. Expand payout_cycles for batch support
  await sql`
    ALTER TABLE payout_cycles ADD COLUMN IF NOT EXISTS idempotency_key TEXT
  `;
  await sql`
    ALTER TABLE payout_cycles ADD COLUMN IF NOT EXISTS month TEXT
  `;
  await sql`
    ALTER TABLE payout_cycles ADD COLUMN IF NOT EXISTS total_gross_cents INTEGER DEFAULT 0
  `;
  await sql`
    ALTER TABLE payout_cycles ADD COLUMN IF NOT EXISTS total_user_payout_cents INTEGER DEFAULT 0
  `;
  await sql`
    ALTER TABLE payout_cycles ADD COLUMN IF NOT EXISTS total_platform_take_cents INTEGER DEFAULT 0
  `;
  await sql`
    ALTER TABLE payout_cycles ADD COLUMN IF NOT EXISTS allocations_count INTEGER DEFAULT 0
  `;
  await sql`
    ALTER TABLE payout_cycles ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ
  `;
  console.log("[004] Extended payout_cycles for batch support");

  // 5. Indexes for VISUpoints daily cap queries
  await sql`
    CREATE INDEX IF NOT EXISTS idx_visupoints_tx_user_date
    ON visupoints_transactions (user_id, created_at)
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS idx_visupoints_tx_type_date
    ON visupoints_transactions (type, created_at)
  `;
  console.log("[004] Created visupoints indexes");

  // 6. Indexes for batch payout queries
  await sql`
    CREATE INDEX IF NOT EXISTS idx_content_creators_content
    ON content_creators (content_id)
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS idx_payout_cycles_month
    ON payout_cycles (month)
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS idx_payout_cycles_idem
    ON payout_cycles (idempotency_key)
  `;
  console.log("[004] Created batch payout indexes");

  // 7. Rate limit audit log (optional, for monitoring)
  await sql`
    CREATE TABLE IF NOT EXISTS rate_limit_events (
      id SERIAL PRIMARY KEY,
      identifier TEXT NOT NULL,
      route_class TEXT NOT NULL,
      blocked BOOLEAN NOT NULL DEFAULT false,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS idx_rate_limit_events_id_date
    ON rate_limit_events (identifier, created_at)
  `;
  console.log("[004] Created rate_limit_events table");

  console.log("[004] PackPatch V1 migration complete!");
}

migrate().catch((err) => {
  console.error("[004] Migration failed:", err);
  process.exit(1);
});
