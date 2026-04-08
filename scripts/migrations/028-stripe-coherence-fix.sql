-- ============================================
-- VIXUAL - Migration 028: Stripe Coherence Fix
-- Date: 07/04/2026
-- 
-- Objectif: Unifier les tables Stripe et corriger les incoherences
-- - Table canonique webhooks: webhook_events
-- - Table canonique config: stripe_config
-- - Referentiel metier: investments, payouts
-- ============================================

-- ══════════════════════════════════════════════════════════════════════════════
-- 1. STRIPE_CONFIG - Assurer l'existence et la structure
-- ══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS stripe_config (
  id INTEGER PRIMARY KEY DEFAULT 1,
  test_secret_key TEXT,
  test_publishable_key TEXT,
  test_webhook_secret TEXT,
  live_secret_key TEXT,
  live_publishable_key TEXT,
  live_webhook_secret TEXT,
  active_mode VARCHAR(10) NOT NULL DEFAULT 'test',
  connect_client_id TEXT,
  updated_by TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT stripe_config_single_row CHECK (id = 1),
  CONSTRAINT stripe_config_valid_mode CHECK (active_mode IN ('test', 'live'))
);

-- Assurer l'existence de la row singleton
INSERT INTO stripe_config (id, active_mode)
VALUES (1, 'test')
ON CONFLICT (id) DO NOTHING;

COMMENT ON TABLE stripe_config IS 'Configuration Stripe chiffree - singleton (id=1). Source canonique pour les cles API.';

-- ══════════════════════════════════════════════════════════════════════════════
-- 2. WEBHOOK_EVENTS - Table canonique d idempotence
-- ══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id TEXT UNIQUE NOT NULL,
  event_type TEXT NOT NULL,
  livemode BOOLEAN DEFAULT FALSE,
  payload JSONB NOT NULL,
  processed BOOLEAN NOT NULL DEFAULT FALSE,
  processed_at TIMESTAMPTZ,
  error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_webhook_events_event_id ON webhook_events(event_id);
CREATE INDEX IF NOT EXISTS idx_webhook_events_type ON webhook_events(event_type);
CREATE INDEX IF NOT EXISTS idx_webhook_events_processed ON webhook_events(processed);
CREATE INDEX IF NOT EXISTS idx_webhook_events_livemode ON webhook_events(livemode);

COMMENT ON TABLE webhook_events IS 'Journal des webhooks Stripe pour idempotence et audit. Table canonique unique.';

-- ══════════════════════════════════════════════════════════════════════════════
-- 3. DEPRECATION: stripe_events (si existe)
-- ══════════════════════════════════════════════════════════════════════════════

-- Ne pas supprimer pour securite, mais marquer comme deprecated
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'stripe_events') THEN
    COMMENT ON TABLE stripe_events IS 'DEPRECATED - Utiliser webhook_events a la place. Cette table sera supprimee dans une future migration.';
  END IF;
END $$;

-- ══════════════════════════════════════════════════════════════════════════════
-- 4. INVESTMENTS - Ajouter colonnes Stripe si manquantes
-- ══════════════════════════════════════════════════════════════════════════════

-- Colonnes pour liaison Stripe
ALTER TABLE investments ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT;
ALTER TABLE investments ADD COLUMN IF NOT EXISTS stripe_session_id TEXT;
ALTER TABLE investments ADD COLUMN IF NOT EXISTS stripe_livemode BOOLEAN DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_investments_stripe_pi ON investments(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_investments_stripe_session ON investments(stripe_session_id);

COMMENT ON COLUMN investments.stripe_payment_intent_id IS 'ID PaymentIntent Stripe associe';
COMMENT ON COLUMN investments.stripe_session_id IS 'ID Session Checkout Stripe associe';
COMMENT ON COLUMN investments.stripe_livemode IS 'TRUE si paiement en mode live, FALSE si test';

-- ══════════════════════════════════════════════════════════════════════════════
-- 5. PAYOUTS - Ajouter colonnes Stripe si manquantes
-- ══════════════════════════════════════════════════════════════════════════════

ALTER TABLE payouts ADD COLUMN IF NOT EXISTS stripe_transfer_id TEXT;
ALTER TABLE payouts ADD COLUMN IF NOT EXISTS stripe_payout_id TEXT;
ALTER TABLE payouts ADD COLUMN IF NOT EXISTS stripe_livemode BOOLEAN DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_payouts_stripe_transfer ON payouts(stripe_transfer_id);
CREATE INDEX IF NOT EXISTS idx_payouts_stripe_payout ON payouts(stripe_payout_id);

COMMENT ON COLUMN payouts.stripe_transfer_id IS 'ID Transfer Stripe vers compte connecte';
COMMENT ON COLUMN payouts.stripe_payout_id IS 'ID Payout Stripe vers compte bancaire';
COMMENT ON COLUMN payouts.stripe_livemode IS 'TRUE si payout en mode live, FALSE si test';

-- ══════════════════════════════════════════════════════════════════════════════
-- 6. USERS - Ajouter colonnes Connect si manquantes
-- ══════════════════════════════════════════════════════════════════════════════

ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_connect_account_id TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_connect_status VARCHAR(32) DEFAULT 'none';
ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_connect_onboarded_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_users_stripe_connect ON users(stripe_connect_account_id);

COMMENT ON COLUMN users.stripe_connect_account_id IS 'ID compte Stripe Connect du createur';
COMMENT ON COLUMN users.stripe_connect_status IS 'Statut: none, pending, restricted, verified, disabled';

-- ══════════════════════════════════════════════════════════════════════════════
-- 7. PROJECTS - Ajouter colonnes Ticket Gold si manquantes
-- ══════════════════════════════════════════════════════════════════════════════

ALTER TABLE projects ADD COLUMN IF NOT EXISTS visibility_boost INTEGER DEFAULT 0;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS ticket_gold_active BOOLEAN DEFAULT FALSE;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS ticket_gold_expires_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_projects_ticket_gold ON projects(ticket_gold_active, ticket_gold_expires_at);

-- ══════════════════════════════════════════════════════════════════════════════
-- 8. Fonction pour expirer automatiquement les Tickets Gold
-- ══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION expire_ticket_gold_projects()
RETURNS void AS $$
BEGIN
  UPDATE projects 
  SET 
    ticket_gold_active = FALSE,
    visibility_boost = GREATEST(0, visibility_boost - 50)
  WHERE 
    ticket_gold_active = TRUE 
    AND ticket_gold_expires_at <= NOW();
    
  UPDATE ticket_gold
  SET is_active = FALSE
  WHERE 
    is_active = TRUE 
    AND expires_at <= NOW();
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION expire_ticket_gold_projects IS 'Fonction a appeler periodiquement pour expirer les Tickets Gold';

-- ══════════════════════════════════════════════════════════════════════════════
-- FIN MIGRATION 028
-- ══════════════════════════════════════════════════════════════════════════════

-- Log de migration
DO $$
BEGIN
  RAISE NOTICE 'Migration 028-stripe-coherence-fix completed successfully';
END $$;
