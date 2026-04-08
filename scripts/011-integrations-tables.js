/**
 * VISUAL Platform - Integrations Tables Migration
 * Adds tables for Stripe Connect and Bunny.net CDN integrations
 */

import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

async function migrate() {
  console.log("[Migration] Starting integrations tables migration...");

  // ── Table: webhook_events (Stripe idempotency) ──
  await sql`
    CREATE TABLE IF NOT EXISTS webhook_events (
      id SERIAL PRIMARY KEY,
      event_id VARCHAR(255) UNIQUE NOT NULL,
      event_type VARCHAR(100) NOT NULL,
      processed_at TIMESTAMP,
      payload JSONB,
      error TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
  console.log("[Migration] Created webhook_events table");

  // ── Table: video_uploads (Bunny CDN tracking) ──
  await sql`
    CREATE TABLE IF NOT EXISTS video_uploads (
      id SERIAL PRIMARY KEY,
      user_id VARCHAR(255) NOT NULL,
      content_id VARCHAR(255),
      file_name VARCHAR(500) NOT NULL,
      file_path VARCHAR(1000) NOT NULL,
      cdn_url TEXT NOT NULL,
      bunny_video_id VARCHAR(255),
      file_size BIGINT,
      content_type VARCHAR(100),
      duration INTEGER,
      status VARCHAR(50) DEFAULT 'uploaded',
      metadata JSONB,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
  console.log("[Migration] Created video_uploads table");

  // ── Add Stripe Connect columns to users (if not exist) ──
  const stripeColumns = [
    { name: "stripe_account_id", type: "VARCHAR(255)" },
    { name: "stripe_account_status", type: "VARCHAR(50) DEFAULT 'none'" },
    { name: "stripe_account_details", type: "JSONB" },
  ];

  for (const col of stripeColumns) {
    try {
      await sql`
        ALTER TABLE users ADD COLUMN IF NOT EXISTS ${sql(col.name)} ${sql.unsafe(col.type)}
      `;
      console.log(`[Migration] Added column users.${col.name}`);
    } catch (e) {
      // Column might already exist
      console.log(`[Migration] Column users.${col.name} already exists or error: ${e}`);
    }
  }

  // ── Add Stripe columns to investments (if not exist) ──
  const investmentColumns = [
    { name: "stripe_charge_id", type: "VARCHAR(255)" },
    { name: "completed_at", type: "TIMESTAMP" },
    { name: "refunded_at", type: "TIMESTAMP" },
    { name: "error", type: "TEXT" },
  ];

  for (const col of investmentColumns) {
    try {
      await sql`
        ALTER TABLE investments ADD COLUMN IF NOT EXISTS ${sql(col.name)} ${sql.unsafe(col.type)}
      `;
      console.log(`[Migration] Added column investments.${col.name}`);
    } catch (e) {
      console.log(`[Migration] Column investments.${col.name} already exists or error: ${e}`);
    }
  }

  // ── Add Stripe columns to payouts (if not exist) ──
  const payoutColumns = [
    { name: "stripe_transfer_id", type: "VARCHAR(255)" },
    { name: "error", type: "TEXT" },
  ];

  for (const col of payoutColumns) {
    try {
      await sql`
        ALTER TABLE payouts ADD COLUMN IF NOT EXISTS ${sql(col.name)} ${sql.unsafe(col.type)}
      `;
      console.log(`[Migration] Added column payouts.${col.name}`);
    } catch (e) {
      console.log(`[Migration] Column payouts.${col.name} already exists or error: ${e}`);
    }
  }

  // ── Create indexes ──
  const indexes = [
    "CREATE INDEX IF NOT EXISTS idx_webhook_events_event_id ON webhook_events(event_id)",
    "CREATE INDEX IF NOT EXISTS idx_webhook_events_type ON webhook_events(event_type)",
    "CREATE INDEX IF NOT EXISTS idx_video_uploads_user ON video_uploads(user_id)",
    "CREATE INDEX IF NOT EXISTS idx_video_uploads_content ON video_uploads(content_id)",
    "CREATE INDEX IF NOT EXISTS idx_users_stripe_account ON users(stripe_account_id)",
  ];

  for (const idx of indexes) {
    try {
      await sql.unsafe(idx);
      console.log(`[Migration] Created index: ${idx.split(" ")[5]}`);
    } catch (e) {
      console.log(`[Migration] Index error: ${e}`);
    }
  }

  console.log("[Migration] Integrations tables migration complete!");
}

migrate().catch((err) => {
  console.error("[Migration] Failed:", err);
  process.exit(1);
});
