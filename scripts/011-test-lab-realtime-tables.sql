-- Test Lab VIXUAL: Tables additionnelles pour simulation temps reel
-- NE JAMAIS utiliser sur les tables reelles (users, contents, payments, wallets)

-- Table des evenements (webhooks simules, actions utilisateurs)
CREATE TABLE IF NOT EXISTS test_lab_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id UUID REFERENCES test_lab_runs(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  event_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Table des metriques temps reel (tick par tick)
CREATE TABLE IF NOT EXISTS test_lab_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id UUID REFERENCES test_lab_runs(id) ON DELETE CASCADE,
  tick INTEGER NOT NULL DEFAULT 0,
  active_users INTEGER NOT NULL DEFAULT 0,
  page_views INTEGER NOT NULL DEFAULT 0,
  contributions_count INTEGER NOT NULL DEFAULT 0,
  contribution_amount_total NUMERIC(10,2) NOT NULL DEFAULT 0,
  successful_payments INTEGER NOT NULL DEFAULT 0,
  failed_payments INTEGER NOT NULL DEFAULT 0,
  bunny_processing INTEGER NOT NULL DEFAULT 0,
  bunny_ready INTEGER NOT NULL DEFAULT 0,
  bunny_error INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Index pour requetes rapides par run_id
CREATE INDEX IF NOT EXISTS idx_test_lab_events_run_id ON test_lab_events(run_id);
CREATE INDEX IF NOT EXISTS idx_test_lab_metrics_run_id ON test_lab_metrics(run_id);
