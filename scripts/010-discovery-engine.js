/**
 * VISUAL Discovery Engine V1 — Database Migration
 * Creates: discovery_scores, diffusion_waves tables
 */
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL)

async function migrate() {
  console.log("[v0] Running Discovery Engine migration...")

  // discovery_scores: stores computed VISUAL Score per content per cycle
  await sql`
    CREATE TABLE IF NOT EXISTS discovery_scores (
      id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      content_id      UUID NOT NULL REFERENCES contents(id) ON DELETE CASCADE,
      cycle_id        UUID REFERENCES universe_cycles(id) ON DELETE SET NULL,
      universe        TEXT NOT NULL,
      score_total     NUMERIC(5,1) NOT NULL DEFAULT 0,
      score_investment  NUMERIC(5,1) NOT NULL DEFAULT 0,
      score_engagement  NUMERIC(5,1) NOT NULL DEFAULT 0,
      score_completion  NUMERIC(5,1) NOT NULL DEFAULT 0,
      score_growth      NUMERIC(5,1) NOT NULL DEFAULT 0,
      score_trust       NUMERIC(5,1) NOT NULL DEFAULT 0,
      score_quality     NUMERIC(5,1) NOT NULL DEFAULT 0,
      wave_level      SMALLINT NOT NULL DEFAULT 1 CHECK (wave_level BETWEEN 1 AND 4),
      badges          TEXT[] NOT NULL DEFAULT '{}',
      manipulation_flagged  BOOLEAN NOT NULL DEFAULT FALSE,
      manipulation_flags    TEXT[] NOT NULL DEFAULT '{}',
      manipulation_mode     TEXT NOT NULL DEFAULT 'normal',
      rank_in_universe  INTEGER,
      motivational_message TEXT,
      computed_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
      UNIQUE(content_id, cycle_id)
    )
  `
  console.log("[v0] discovery_scores table: OK")

  // diffusion_waves: tracks which wave a project is in per universe cycle
  await sql`
    CREATE TABLE IF NOT EXISTS diffusion_waves (
      id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      content_id      UUID NOT NULL REFERENCES contents(id) ON DELETE CASCADE,
      universe        TEXT NOT NULL,
      wave_level      SMALLINT NOT NULL DEFAULT 1 CHECK (wave_level BETWEEN 1 AND 4),
      wave_reached_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      previous_wave   SMALLINT,
      UNIQUE(content_id, wave_level)
    )
  `
  console.log("[v0] diffusion_waves table: OK")

  // Indexes for fast ranking queries
  await sql`
    CREATE INDEX IF NOT EXISTS idx_discovery_scores_universe_score
    ON discovery_scores(universe, score_total DESC)
  `
  await sql`
    CREATE INDEX IF NOT EXISTS idx_discovery_scores_content
    ON discovery_scores(content_id)
  `
  await sql`
    CREATE INDEX IF NOT EXISTS idx_discovery_scores_wave
    ON discovery_scores(wave_level)
  `
  console.log("[v0] Indexes: OK")
  console.log("[v0] Discovery Engine migration complete.")
}

migrate().catch((err) => {
  console.error("[v0] Migration failed:", err)
  process.exit(1)
})
