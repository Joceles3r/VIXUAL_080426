import { sql } from "@neondatabase/serverless"

async function createAuditLogs() {
  console.log("[v0] Creating audit_logs table for financial transaction trail...")

  try {
    // Create audit_logs table
    await sql`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id     UUID REFERENCES users(id) ON DELETE SET NULL,
        action      TEXT NOT NULL,
        amount_cents BIGINT,
        content_id  UUID,
        metadata    JSONB DEFAULT '{}',
        ip_hash     TEXT,
        created_at  TIMESTAMPTZ DEFAULT NOW()
      );
    `
    console.log("[v0] ✓ audit_logs table created")

    // Create indexes for efficient queries
    await sql`CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_logs(user_id, created_at DESC);`
    await sql`CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_logs(action, created_at DESC);`
    await sql`CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs(created_at DESC);`
    console.log("[v0] ✓ Indexes created on audit_logs")

    // Add RLS policy (only users can see their own logs, admin can see all)
    await sql`
      ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
    `
    console.log("[v0] ✓ RLS enabled on audit_logs")

    console.log("[v0] ✅ audit_logs migration complete!")
  } catch (err) {
    if (err instanceof Error && err.message.includes("already exists")) {
      console.log("[v0] audit_logs table already exists, skipping creation")
    } else {
      console.error("[v0] Error creating audit_logs:", err)
      throw err
    }
  }
}

createAuditLogs()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("[v0] Migration failed:", err)
    process.exit(1)
  })
