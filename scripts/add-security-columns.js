import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

async function migrate() {
  console.log("VISUAL Security Patch: Adding security columns...");

  // Verification level (0=basique, 1=standard, 2=fort KYC)
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_level INTEGER DEFAULT 0`;
  console.log("  + verification_level");

  // Step-up authentication state
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS step_up_phone_verified BOOLEAN DEFAULT FALSE`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS step_up_totp_enabled BOOLEAN DEFAULT FALSE`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS step_up_last_at TIMESTAMPTZ`;
  console.log("  + step_up_phone_verified, step_up_totp_enabled, step_up_last_at");

  // IP risk flags
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS risk_vpn_suspected BOOLEAN DEFAULT FALSE`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS risk_proxy_suspected BOOLEAN DEFAULT FALSE`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS risk_tor_suspected BOOLEAN DEFAULT FALSE`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS risk_datacenter_ip BOOLEAN DEFAULT FALSE`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS risk_country_mismatch BOOLEAN DEFAULT FALSE`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS risk_multi_account_suspected BOOLEAN DEFAULT FALSE`;
  console.log("  + risk flags (vpn, proxy, tor, datacenter_ip, country_mismatch, multi_account)");

  // Stripe Connect status for security doc
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_connect_account_id TEXT`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_connect_status TEXT DEFAULT 'none'`;
  console.log("  + stripe_connect_account_id, stripe_connect_status");

  // Withdrawal policy
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS withdrawal_hold_hours INTEGER DEFAULT 72`;
  console.log("  + withdrawal_hold_hours");

  // Private identity fields (NEVER exposed publicly)
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS legal_first_name TEXT`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS legal_last_name TEXT`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS declared_country TEXT`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS declared_city TEXT`;
  console.log("  + legal_first_name, legal_last_name, declared_country, declared_city");

  // Add risk_flags_snapshot to withdrawal_requests if table exists
  try {
    const tableCheck = await sql`
      SELECT 1 FROM information_schema.tables WHERE table_name = 'withdrawal_requests'
    `;
    if (tableCheck.length > 0) {
      await sql`ALTER TABLE withdrawal_requests ADD COLUMN IF NOT EXISTS risk_flags_snapshot JSONB`;
      console.log("  + withdrawal_requests.risk_flags_snapshot");
    }
  } catch (e) {
    console.log("  (withdrawal_requests table not found, skipping risk_flags_snapshot)");
  }

  console.log("VISUAL Security Patch: Migration complete!");
}

migrate().catch((err) => {
  console.error("Migration failed:", err.message);
  process.exit(1);
});
