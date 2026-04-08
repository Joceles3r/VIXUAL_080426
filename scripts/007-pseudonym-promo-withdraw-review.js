import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

async function migrate() {
  console.log("[007] Starting migration: Pseudonym + Promo + Withdraw Review 72h");

  // 1) USERS: display_name + pseudonym
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS display_name TEXT`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS pseudonym TEXT`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS pseudonym_enabled BOOLEAN NOT NULL DEFAULT false`;
  console.log("[007] Users columns added");

  // Constraint: pseudonym not empty if enabled
  await sql`
    DO $$ BEGIN
      ALTER TABLE users
        ADD CONSTRAINT users_pseudonym_enabled_requires_value
        CHECK (NOT pseudonym_enabled OR (pseudonym IS NOT NULL AND length(trim(pseudonym)) >= 2));
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_users_pseudonym_enabled ON users(pseudonym_enabled)`;
  console.log("[007] Pseudonym constraint + index created");

  // 2) PROMOTION: email logs + actions
  await sql`
    CREATE TABLE IF NOT EXISTS promo_email_logs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      to_email TEXT NOT NULL,
      subject TEXT NOT NULL,
      message TEXT NOT NULL,
      sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued','sent','failed')),
      provider_id TEXT,
      error TEXT
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_promo_email_logs_user_month ON promo_email_logs(user_id, sent_at)`;
  console.log("[007] promo_email_logs table created");

  await sql`
    CREATE TABLE IF NOT EXISTS promo_actions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      action_type TEXT NOT NULL CHECK (action_type IN ('share','invite_email','invite_click','invite_signup')),
      target TEXT,
      meta JSONB NOT NULL DEFAULT '{}',
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_promo_actions_user_time ON promo_actions(user_id, created_at)`;
  console.log("[007] promo_actions table created");

  // 3) WITHDRAWAL REQUESTS: review 72h for > 1000 EUR
  await sql`ALTER TABLE withdrawal_requests ADD COLUMN IF NOT EXISTS hold_until TIMESTAMPTZ`;
  await sql`
    DO $$ BEGIN
      ALTER TABLE withdrawal_requests ADD COLUMN review_status TEXT
        NOT NULL DEFAULT 'not_required'
        CHECK (review_status IN ('not_required','pending','approved','rejected'));
    EXCEPTION WHEN duplicate_column THEN NULL;
    END $$
  `;
  await sql`ALTER TABLE withdrawal_requests ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ`;
  await sql`ALTER TABLE withdrawal_requests ADD COLUMN IF NOT EXISTS reviewed_by TEXT`;
  await sql`ALTER TABLE withdrawal_requests ADD COLUMN IF NOT EXISTS review_note TEXT`;
  await sql`CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_review ON withdrawal_requests(review_status, hold_until)`;
  console.log("[007] withdrawal_requests review columns added");

  console.log("[007] Migration 007 complete.");
}

migrate().catch((err) => {
  console.error("[007] Migration failed:", err);
  process.exit(1);
});
