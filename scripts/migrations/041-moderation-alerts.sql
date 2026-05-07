-- ═══════════════════════════════════════════════════════════════════════════
-- VIXUAL - Migration 041 : Moderation Alerts
-- Tableau de bord d'alertes du moteur de modération déterministe.
-- ═══════════════════════════════════════════════════════════════════════════

-- Pré-requis : colonnes optionnelles utilisées par les détecteurs
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMP DEFAULT NOW();
ALTER TABLE users ADD COLUMN IF NOT EXISTS created_ip VARCHAR(64);

-- Table dédiée aux alertes de modération admin
CREATE TABLE IF NOT EXISTS moderation_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(60) NOT NULL,
  severity VARCHAR(20) NOT NULL CHECK (severity IN ('critical','important','standard','info')),
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','escalated','expired')),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  related_entity_type VARCHAR(40),
  related_entity_id VARCHAR(120),
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  context JSONB,
  suggested_action VARCHAR(500),
  resolved_by VARCHAR(255),
  resolved_at TIMESTAMP,
  resolution_note TEXT,
  email_sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_modalert_status_severity ON moderation_alerts(status, severity, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_modalert_user ON moderation_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_modalert_type ON moderation_alerts(type);
