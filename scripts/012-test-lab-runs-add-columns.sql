-- VIXUAL Test-Lab : ajout des colonnes manquantes dans test_lab_runs.
-- Ces colonnes sont utilisees par les routes /api/admin/test-lab/realtime/*
-- (mode = 'manual' | 'realtime', status = 'running' | 'completed' | ...).
-- Idempotent grace a IF NOT EXISTS.

ALTER TABLE test_lab_runs
  ADD COLUMN IF NOT EXISTS mode TEXT DEFAULT 'manual',
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'completed';

CREATE INDEX IF NOT EXISTS idx_test_lab_runs_mode_status
  ON test_lab_runs (mode, status);
