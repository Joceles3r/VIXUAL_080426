-- ═══════════════════════════════════════════════════════════════════════════
-- VIXUAL - Migration 042 : Moderation Audit Log + Platform Health View
-- Journal d'audit immuable + vue d'agrégat pour le tableau de bord.
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS moderation_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type VARCHAR(60) NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  alert_id UUID REFERENCES moderation_alerts(id) ON DELETE SET NULL,
  trust_score_before INT,
  trust_score_after INT,
  trust_score_delta INT,
  level_before INT,
  level_after INT,
  triggered_by VARCHAR(80) NOT NULL,
  rule_name VARCHAR(80),
  context JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_modaudit_user ON moderation_audit_log(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_modaudit_event ON moderation_audit_log(event_type, created_at DESC);

-- Vue d'agrégat plateforme.
-- NOTE : la table de référence pour les contributions est "contributions"
-- (colonnes : amount_eur, content_id, user_id, created_at — pas de colonne status).
CREATE OR REPLACE VIEW moderation_platform_health AS
SELECT
  (SELECT COUNT(*) FROM users WHERE created_at > NOW() - INTERVAL '30 days') AS users_last_30d,
  (SELECT COUNT(*) FROM users WHERE user_level = 2) AS users_level2,
  (SELECT COUNT(*) FROM users WHERE user_level = 3) AS users_level3,
  (SELECT COUNT(*) FROM users WHERE last_active_at > NOW() - INTERVAL '7 days') AS users_active_7d,
  (SELECT COUNT(*) FROM moderation_alerts WHERE status = 'pending' AND severity = 'critical') AS critical_alerts_pending,
  (SELECT COUNT(*) FROM moderation_alerts WHERE created_at > NOW() - INTERVAL '7 days') AS alerts_last_7d,
  (SELECT COUNT(*) FROM contents) AS total_contents,
  (SELECT COALESCE(SUM(amount_eur), 0) FROM contributions) AS total_contributions_eur;
