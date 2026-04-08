import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

async function migrate() {
  console.log("=== VISUAL Migration 006: Stripe Webhook Logs & Queue ===");

  // 1) stripe_webhook_logs table (upgraded from basic webhook_events)
  console.log("[1/3] Creating stripe_webhook_logs table...");
  await sql`
    CREATE TABLE IF NOT EXISTS stripe_webhook_logs (
      id BIGSERIAL PRIMARY KEY,
      event_id TEXT UNIQUE NOT NULL,
      event_type TEXT NOT NULL,
      account_id TEXT,
      status TEXT CHECK (status IN ('received', 'processing', 'processed', 'failed', 'retrying'))
        DEFAULT 'received',
      signature_valid BOOLEAN DEFAULT false,
      payload_hash TEXT,
      error_message TEXT,
      retry_count INTEGER DEFAULT 0,
      processed_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  // 2) Indexes for performance
  console.log("[2/3] Creating indexes...");
  await sql`CREATE INDEX IF NOT EXISTS idx_wh_logs_event_id ON stripe_webhook_logs(event_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_wh_logs_status ON stripe_webhook_logs(status) WHERE status IN ('failed', 'retrying')`;
  await sql`CREATE INDEX IF NOT EXISTS idx_wh_logs_created ON stripe_webhook_logs(created_at DESC)`;

  // 3) Cookie consent audit table (for RGPD compliance)
  console.log("[3/3] Creating cookie_consent_logs table...");
  await sql`
    CREATE TABLE IF NOT EXISTS cookie_consent_logs (
      id BIGSERIAL PRIMARY KEY,
      user_id UUID REFERENCES users(id) ON DELETE SET NULL,
      ip_hash TEXT,
      preferences JSONB NOT NULL DEFAULT '{}',
      user_agent TEXT,
      consent_date TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_consent_date ON cookie_consent_logs(consent_date DESC)`;

  console.log("=== Migration 006 complete ===");
}

migrate().catch((err) => {
  console.error("Migration 006 failed:", err);
  process.exit(1);
});
