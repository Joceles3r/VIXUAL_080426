-- ═══════════════════════════════════════════════════════════════
-- Module Maintenance : etat global persistant
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS maintenance_state (
  id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  enabled BOOLEAN NOT NULL DEFAULT FALSE,
  message TEXT NOT NULL DEFAULT 'VIXUAL est temporairement en maintenance. Nos equipes effectuent des ameliorations.',
  block_uploads BOOLEAN NOT NULL DEFAULT FALSE,
  block_payments BOOLEAN NOT NULL DEFAULT FALSE,
  block_v2 BOOLEAN NOT NULL DEFAULT FALSE,
  estimated_return_at TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_by_email VARCHAR(255)
);

-- Ligne unique singleton
INSERT INTO maintenance_state (id) VALUES (1) ON CONFLICT (id) DO NOTHING;
