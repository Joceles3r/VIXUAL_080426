-- ═══════════════════════════════════════════════════════════════
-- Module Sécurité Phase 1 : audit avancé + bots + emails jetables
-- ═══════════════════════════════════════════════════════════════

-- Journal d'audit étendu (toutes actions sensibles)
CREATE TABLE IF NOT EXISTS security_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type VARCHAR(60) NOT NULL,
  severity VARCHAR(20) NOT NULL DEFAULT 'info' CHECK (severity IN ('info','warn','critical')),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  action VARCHAR(120) NOT NULL,
  resource VARCHAR(200),
  outcome VARCHAR(40) NOT NULL,
  context JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_seclog_user ON security_audit_log(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_seclog_event ON security_audit_log(event_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_seclog_severity ON security_audit_log(severity, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_seclog_ip ON security_audit_log(ip_address, created_at DESC);

-- IP blacklist (alimentée par les détecteurs + manuelle)
CREATE TABLE IF NOT EXISTS security_ip_blacklist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address VARCHAR(45) UNIQUE NOT NULL,
  reason TEXT NOT NULL,
  severity VARCHAR(20) NOT NULL DEFAULT 'warn' CHECK (severity IN ('warn','block','ban')),
  added_by VARCHAR(255),
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_ipblacklist_ip ON security_ip_blacklist(ip_address);

-- Tentatives d'accès interdit (signal d'attaque)
CREATE TABLE IF NOT EXISTS security_forbidden_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address VARCHAR(45) NOT NULL,
  path VARCHAR(500) NOT NULL,
  method VARCHAR(10) NOT NULL,
  user_agent TEXT,
  status_code INT,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_forbidden_ip ON security_forbidden_attempts(ip_address, created_at DESC);
