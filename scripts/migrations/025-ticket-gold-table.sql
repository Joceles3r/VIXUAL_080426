-- ============================================
-- VIXUAL - Migration 025: Ticket Gold System
-- Remplace Gold Pass par Ticket Gold
-- ============================================

-- Table principale des Tickets Gold
CREATE TABLE IF NOT EXISTS ticket_gold (
  id VARCHAR(64) PRIMARY KEY,
  project_id VARCHAR(64) NOT NULL,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  purchased_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  activated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  boost_multiplier DECIMAL(3,2) NOT NULL DEFAULT 0.50,
  stripe_payment_id VARCHAR(128),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index pour les recherches frequentes
CREATE INDEX IF NOT EXISTS idx_ticket_gold_project ON ticket_gold(project_id);
CREATE INDEX IF NOT EXISTS idx_ticket_gold_user ON ticket_gold(user_id);
CREATE INDEX IF NOT EXISTS idx_ticket_gold_active ON ticket_gold(is_active, expires_at);
CREATE INDEX IF NOT EXISTS idx_ticket_gold_stripe ON ticket_gold(stripe_payment_id);

-- Table historique des profils utilisateur (pour la regle visiteur)
CREATE TABLE IF NOT EXISTS user_profile_history (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(32) NOT NULL,
  action VARCHAR(16) NOT NULL CHECK (action IN ('added', 'removed')),
  performed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_profile_history_user ON user_profile_history(user_id);
CREATE INDEX IF NOT EXISTS idx_profile_history_role ON user_profile_history(role);

-- Colonne pour marquer si l'utilisateur a quitte le profil visiteur
ALTER TABLE users ADD COLUMN IF NOT EXISTS has_left_visitor BOOLEAN DEFAULT FALSE;

-- Table des tickets support avec IA triage
CREATE TABLE IF NOT EXISTS support_tickets (
  id VARCHAR(64) PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user_email VARCHAR(255) NOT NULL,
  user_name VARCHAR(128) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  category VARCHAR(32) NOT NULL,
  priority VARCHAR(16) NOT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'nouveau',
  ai_triage_score DECIMAL(3,2),
  ai_suggested_response TEXT,
  escalation_target VARCHAR(32),
  assigned_to UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_support_tickets_user ON support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_priority ON support_tickets(priority);
CREATE INDEX IF NOT EXISTS idx_support_tickets_category ON support_tickets(category);
CREATE INDEX IF NOT EXISTS idx_support_tickets_assigned ON support_tickets(assigned_to);

-- Table des reponses aux tickets
CREATE TABLE IF NOT EXISTS support_ticket_responses (
  id VARCHAR(64) PRIMARY KEY,
  ticket_id VARCHAR(64) NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  author_id VARCHAR(64) NOT NULL,
  author_name VARCHAR(128) NOT NULL,
  author_type VARCHAR(16) NOT NULL CHECK (author_type IN ('user', 'ai', 'support', 'admin')),
  message TEXT NOT NULL,
  is_automatic BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ticket_responses_ticket ON support_ticket_responses(ticket_id);

-- Fonction pour desactiver automatiquement les tickets expires
CREATE OR REPLACE FUNCTION expire_ticket_gold()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.expires_at <= NOW() AND NEW.is_active = TRUE THEN
    NEW.is_active := FALSE;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour expiration automatique
DROP TRIGGER IF EXISTS trigger_expire_ticket_gold ON ticket_gold;
CREATE TRIGGER trigger_expire_ticket_gold
  BEFORE UPDATE ON ticket_gold
  FOR EACH ROW
  EXECUTE FUNCTION expire_ticket_gold();

-- Job pour nettoyer les tickets expires (a executer periodiquement)
-- UPDATE ticket_gold SET is_active = FALSE WHERE expires_at <= NOW() AND is_active = TRUE;

COMMENT ON TABLE ticket_gold IS 'Tickets Gold pour boost de visibilite temporaire (48h, 5EUR, 1x/mois/projet)';
COMMENT ON TABLE user_profile_history IS 'Historique des changements de profils pour regle visiteur';
COMMENT ON TABLE support_tickets IS 'Tickets de support avec triage IA';
