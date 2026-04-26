-- VIXUAL Test-Lab : tables ISOLEES, jamais reliees aux tables metier.
-- Ne JAMAIS y joindre users / contents / payments / wallets / payouts.

CREATE TABLE IF NOT EXISTS test_lab_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  summary JSONB NOT NULL,
  created_by TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS test_lab_payloads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id UUID NOT NULL REFERENCES test_lab_runs(id) ON DELETE CASCADE,
  payload JSONB NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_test_lab_runs_created_at
  ON test_lab_runs (created_at DESC);
