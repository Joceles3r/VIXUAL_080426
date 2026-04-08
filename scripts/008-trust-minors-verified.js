import { neon } from "@neondatabase/serverless";
const sql = neon(process.env.DATABASE_URL);

async function run() {
  console.log("[008] Starting migration: Trust Score + Verified Creator + Minors + Ownership Declaration");

  // ── 1. Trust Score on users ──
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS trust_score INT NOT NULL DEFAULT 50`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS trust_level TEXT`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS trust_last_update TIMESTAMPTZ`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMPTZ`;
  console.log("[008] Added trust_score, trust_level, trust_last_update, last_seen_at to users");

  // ── 2. Trust events journal ──
  await sql`
    CREATE TABLE IF NOT EXISTS trust_events (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      event_type TEXT NOT NULL,
      severity INT NOT NULL DEFAULT 1,
      meta JSONB NOT NULL DEFAULT '{}'::jsonb,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_trust_events_user_time ON trust_events(user_id, created_at)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_trust_events_type ON trust_events(event_type)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_users_trust_score ON users(trust_score)`;
  console.log("[008] Created trust_events table + indexes");

  // ── 3. Verified creator fields ──
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS verified_creator BOOLEAN DEFAULT false`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS verified_type TEXT`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'none'`;
  console.log("[008] Added verified_creator, verified_type, verification_status to users");

  // ── 4. Minors 16-17 fields ──
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS birthdate DATE`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS is_minor BOOLEAN NOT NULL DEFAULT false`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS minor_lock_until TIMESTAMPTZ`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS minor_status TEXT NOT NULL DEFAULT 'none'`;
  console.log("[008] Added minor fields to users");

  // ── 5. Minor guardian verifications table ──
  await sql`
    CREATE TABLE IF NOT EXISTS minor_guardian_verifications (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      status TEXT NOT NULL DEFAULT 'pending',
      guardian_full_name TEXT NOT NULL,
      guardian_birthdate DATE NOT NULL,
      guardian_email TEXT NOT NULL,
      guardian_phone TEXT,
      guardian_address TEXT,
      doc_guardian_id_path TEXT NOT NULL,
      doc_relationship_path TEXT NOT NULL,
      doc_address_path TEXT,
      consent_checked BOOLEAN NOT NULL DEFAULT false,
      consent_signature_name TEXT NOT NULL,
      consent_signed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      email_token_hash TEXT NOT NULL,
      email_token_expires_at TIMESTAMPTZ NOT NULL,
      email_verified_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      reviewed_by TEXT,
      reviewed_at TIMESTAMPTZ,
      review_note TEXT
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_minor_guardian_user ON minor_guardian_verifications(user_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_minor_guardian_status ON minor_guardian_verifications(status)`;
  console.log("[008] Created minor_guardian_verifications table");

  // ── 6. Ownership declaration fields on contents ──
  await sql`ALTER TABLE contents ADD COLUMN IF NOT EXISTS ownership_declared BOOLEAN DEFAULT false`;
  await sql`ALTER TABLE contents ADD COLUMN IF NOT EXISTS ownership_legal_name TEXT`;
  await sql`ALTER TABLE contents ADD COLUMN IF NOT EXISTS ownership_declared_at TIMESTAMPTZ`;
  await sql`ALTER TABLE contents ADD COLUMN IF NOT EXISTS ownership_accepts_responsibility BOOLEAN DEFAULT false`;
  console.log("[008] Added ownership declaration fields to contents");

  console.log("[008] Migration complete.");
}

run().catch((e) => { console.error("[008] FAILED:", e); process.exit(1); });
