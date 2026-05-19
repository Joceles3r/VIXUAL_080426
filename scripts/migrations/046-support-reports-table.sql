-- ═══════════════════════════════════════════════════════════════
-- Module Support Reports : signalements utilisateurs
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS support_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID REFERENCES users(id) ON DELETE SET NULL,
  reported_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  reported_content_id UUID,
  category VARCHAR(40) NOT NULL,
  description TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_review', 'resolved', 'dismissed')),
  priority VARCHAR(20) NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'critical')),
  assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
  resolved_at TIMESTAMP,
  resolution_note TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_support_reports_status ON support_reports(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_support_reports_priority ON support_reports(priority, status);
CREATE INDEX IF NOT EXISTS idx_support_reports_reporter ON support_reports(reporter_id);
