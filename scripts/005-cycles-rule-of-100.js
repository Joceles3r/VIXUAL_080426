import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

async function migrate() {
  console.log("=== VIXUAL Migration 005: Universe Cycles (Rule of 100) ===");

  // 1) pgcrypto extension
  console.log("[1/6] Ensuring pgcrypto extension...");
  await sql`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`;

  // 2) universe_cycles table
  console.log("[2/6] Creating universe_cycles table...");
  await sql`
    CREATE TABLE IF NOT EXISTS universe_cycles (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      universe TEXT NOT NULL CHECK (universe IN ('audiovisual','literary','podcast')),
      cycle_number INT NOT NULL DEFAULT 1,
      status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','closing','closed')),
      threshold INT NOT NULL DEFAULT 100,
      started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      closed_at TIMESTAMPTZ,
      UNIQUE(universe, cycle_number)
    )
  `;

  // 3) Index on universe_cycles
  console.log("[3/6] Creating indexes on universe_cycles...");
  await sql`CREATE INDEX IF NOT EXISTS idx_universe_cycles_status ON universe_cycles(universe, status)`;

  // 4) Add universe + cycle_id columns to contents (if absent)
  console.log("[4/6] Adding universe and cycle_id columns to contents...");
  await sql`ALTER TABLE contents ADD COLUMN IF NOT EXISTS universe TEXT`;
  await sql`ALTER TABLE contents ADD COLUMN IF NOT EXISTS cycle_id UUID`;

  // 5) Indexes on contents for cycle queries
  console.log("[5/6] Creating indexes on contents...");
  await sql`CREATE INDEX IF NOT EXISTS idx_contents_cycle_id ON contents(cycle_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_contents_universe ON contents(universe)`;

  // 6) Seed initial open cycles (one per universe)
  console.log("[6/6] Seeding initial open cycles...");
  for (const universe of ["audiovisual", "literary", "podcast"]) {
    const existing = await sql`
      SELECT id FROM universe_cycles
      WHERE universe = ${universe} AND status = 'open'
      LIMIT 1
    `;
    if (existing.length === 0) {
      await sql`
        INSERT INTO universe_cycles (universe, cycle_number, status, threshold)
        VALUES (${universe}, 1, 'open', 100)
        ON CONFLICT (universe, cycle_number) DO NOTHING
      `;
      console.log(`  -> Created initial open cycle for ${universe}`);
    } else {
      console.log(`  -> Open cycle already exists for ${universe}`);
    }
  }

  console.log("=== Migration 005 complete ===");
}

migrate().catch((err) => {
  console.error("Migration 005 failed:", err);
  process.exit(1);
});
