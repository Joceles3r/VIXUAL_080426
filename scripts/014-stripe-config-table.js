// scripts/014-stripe-config-table.js
// Migration: Create stripe_config table for secure Stripe key storage
// Run: node scripts/014-stripe-config-table.js

import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

async function run() {
  console.log('[014] Creating stripe_config table...');

  await sql`
    CREATE TABLE IF NOT EXISTS stripe_config (
      id               SERIAL PRIMARY KEY,
      test_secret_key       TEXT,
      test_publishable_key  TEXT,
      test_webhook_secret   TEXT,
      live_secret_key       TEXT,
      live_publishable_key  TEXT,
      live_webhook_secret   TEXT,
      active_mode           VARCHAR(10) NOT NULL DEFAULT 'test',
      connect_client_id     TEXT,
      updated_by            TEXT,
      updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      CONSTRAINT stripe_config_singleton CHECK (id = 1)
    )
  `;

  await sql`
    INSERT INTO stripe_config (id, active_mode)
    VALUES (1, 'test')
    ON CONFLICT (id) DO NOTHING
  `;

  console.log('[014] stripe_config table ready (singleton row id=1)');
}

run().catch((err) => {
  console.error('[014] Migration failed:', err);
  process.exit(1);
});
