-- ═══════════════════════════════════════════════════════════════
-- Module Archives : table d'archivage (recyclage doux)
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS archives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  original_table VARCHAR(60) NOT NULL,
  original_id VARCHAR(100) NOT NULL,
  payload JSONB NOT NULL,
  archived_by VARCHAR(255) NOT NULL,
  archived_at TIMESTAMP NOT NULL DEFAULT NOW(),
  reason TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'archived' CHECK (status IN ('archived', 'restored', 'purged')),
  restored_at TIMESTAMP,
  restored_by VARCHAR(255),
  purged_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_archives_status ON archives(status, archived_at DESC);
CREATE INDEX IF NOT EXISTS idx_archives_table ON archives(original_table);
