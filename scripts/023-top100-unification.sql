-- ╔══════════════════════════════════════════════════════════════╗
-- ║ TOP 100 — Unification du moteur de selection / classement   ║
-- ║ Tables : top100_cycles, top100_queue, top100_rankings,       ║
-- ║          top100_audit_log                                    ║
-- ╚══════════════════════════════════════════════════════════════╝

-- 1) CYCLES
CREATE TABLE IF NOT EXISTS top100_cycles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  universe TEXT NOT NULL,
  cycle_number INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'open',
  selected_count INTEGER NOT NULL DEFAULT 0,
  max_projects INTEGER NOT NULL DEFAULT 100,
  opened_at TIMESTAMP NOT NULL DEFAULT NOW(),
  closed_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_top100_cycles_universe_status
  ON top100_cycles(universe, status);

CREATE UNIQUE INDEX IF NOT EXISTS idx_top100_cycles_universe_number
  ON top100_cycles(universe, cycle_number);

-- 2) QUEUE
CREATE TABLE IF NOT EXISTS top100_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id TEXT NOT NULL,
  creator_id TEXT NOT NULL,
  universe TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'queued',
  priority_level INTEGER NOT NULL DEFAULT 0,
  reentry_paid BOOLEAN NOT NULL DEFAULT false,
  submitted_at TIMESTAMP NOT NULL DEFAULT NOW(),
  approved_at TIMESTAMP,
  selected_at TIMESTAMP,
  cycle_id UUID REFERENCES top100_cycles(id),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_top100_queue_universe_status_priority
  ON top100_queue(universe, status, priority_level DESC, submitted_at ASC);

CREATE INDEX IF NOT EXISTS idx_top100_queue_cycle
  ON top100_queue(cycle_id);

-- 3) RANKINGS
CREATE TABLE IF NOT EXISTS top100_rankings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cycle_id UUID NOT NULL REFERENCES top100_cycles(id) ON DELETE CASCADE,
  content_id TEXT NOT NULL,
  universe TEXT NOT NULL,
  rank INTEGER NOT NULL,
  score NUMERIC NOT NULL,
  score_details JSONB NOT NULL,
  votes INTEGER NOT NULL DEFAULT 0,
  contributions_eur NUMERIC NOT NULL DEFAULT 0,
  computed_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_top100_rankings_cycle_rank
  ON top100_rankings(cycle_id, rank);

CREATE INDEX IF NOT EXISTS idx_top100_rankings_content
  ON top100_rankings(content_id);

-- 4) AUDIT LOG (preuve juridique)
CREATE TABLE IF NOT EXISTS top100_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action TEXT NOT NULL,
  content_id TEXT,
  creator_id TEXT,
  universe TEXT,
  cycle_id UUID,
  details JSONB,
  created_by TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_top100_audit_action_time
  ON top100_audit_log(action, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_top100_audit_content
  ON top100_audit_log(content_id, created_at DESC);
