-- Migration 029: VIXUAL Stripe Complete Coherence
-- Date: 2026-04-07
-- 
-- Cette migration applique les corrections du patch technique Stripe:
-- 1. Table stripe_events_log pour idempotence webhook
-- 2. Table admin_audit_log pour journalisation admin
-- 3. Colonnes Stripe Connect sur users
-- 4. Contrainte singleton sur stripe_config

-- ══════════════════════════════════════════════════════════════════════════════
-- 1. TABLE STRIPE_EVENTS_LOG (idempotence webhook)
-- ══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS stripe_events_log (
  id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,
  livemode BOOLEAN NOT NULL DEFAULT FALSE,
  processed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  payload JSONB,
  processing_status TEXT DEFAULT 'processed' CHECK (processing_status IN ('processed', 'failed', 'ignored')),
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_stripe_events_log_event_type ON stripe_events_log(event_type);
CREATE INDEX IF NOT EXISTS idx_stripe_events_log_processed_at ON stripe_events_log(processed_at);
CREATE INDEX IF NOT EXISTS idx_stripe_events_log_livemode ON stripe_events_log(livemode);

COMMENT ON TABLE stripe_events_log IS 'Log des événements Stripe pour idempotence - évite le double traitement des webhooks';

-- ══════════════════════════════════════════════════════════════════════════════
-- 2. TABLE ADMIN_AUDIT_LOG (journalisation admin)
-- ══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS admin_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor TEXT NOT NULL,
  actor_email TEXT,
  action TEXT NOT NULL,
  target TEXT,
  target_type TEXT,
  metadata JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_audit_log_actor ON admin_audit_log(actor);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_action ON admin_audit_log(action);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_created_at ON admin_audit_log(created_at);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_target_type ON admin_audit_log(target_type);

COMMENT ON TABLE admin_audit_log IS 'Journal d''audit des actions administrateur VIXUAL';

-- ══════════════════════════════════════════════════════════════════════════════
-- 3. COLONNES STRIPE CONNECT SUR USERS
-- ══════════════════════════════════════════════════════════════════════════════

-- Ajouter les colonnes si elles n'existent pas
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'stripe_account_id'
  ) THEN
    ALTER TABLE users ADD COLUMN stripe_account_id TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'stripe_onboarding_complete'
  ) THEN
    ALTER TABLE users ADD COLUMN stripe_onboarding_complete BOOLEAN DEFAULT FALSE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'stripe_charges_enabled'
  ) THEN
    ALTER TABLE users ADD COLUMN stripe_charges_enabled BOOLEAN DEFAULT FALSE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'stripe_payouts_enabled'
  ) THEN
    ALTER TABLE users ADD COLUMN stripe_payouts_enabled BOOLEAN DEFAULT FALSE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'stripe_details_submitted'
  ) THEN
    ALTER TABLE users ADD COLUMN stripe_details_submitted BOOLEAN DEFAULT FALSE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'stripe_account_type'
  ) THEN
    ALTER TABLE users ADD COLUMN stripe_account_type TEXT CHECK (stripe_account_type IN ('express', 'standard', 'custom'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_users_stripe_account_id ON users(stripe_account_id) WHERE stripe_account_id IS NOT NULL;

-- ══════════════════════════════════════════════════════════════════════════════
-- 4. CONTRAINTE SINGLETON SUR STRIPE_CONFIG
-- ══════════════════════════════════════════════════════════════════════════════

-- S'assurer que la table existe avec le bon schema
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
  CONSTRAINT stripe_config_mode_check CHECK (active_mode IN ('test', 'live'))
);

-- Ajouter contrainte singleton si pas deja presente
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'stripe_config_singleton'
  ) THEN
    ALTER TABLE stripe_config ADD CONSTRAINT stripe_config_singleton CHECK (id = 1);
  END IF;
END $$;

-- Inserer la ligne par defaut si elle n'existe pas
INSERT INTO stripe_config (id, active_mode)
VALUES (1, 'test')
ON CONFLICT (id) DO NOTHING;

COMMENT ON TABLE stripe_config IS 'Configuration Stripe singleton (id=1) - source de verite pour les cles API';

-- ══════════════════════════════════════════════════════════════════════════════
-- 5. TABLE STRIPE_CONNECTED_ACCOUNTS (suivi detaille)
-- ══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS stripe_connected_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES users(id),
  stripe_account_id TEXT NOT NULL UNIQUE,
  account_type TEXT NOT NULL DEFAULT 'express' CHECK (account_type IN ('express', 'standard', 'custom')),
  country TEXT DEFAULT 'FR',
  email TEXT,
  charges_enabled BOOLEAN DEFAULT FALSE,
  payouts_enabled BOOLEAN DEFAULT FALSE,
  details_submitted BOOLEAN DEFAULT FALSE,
  onboarding_complete BOOLEAN DEFAULT FALSE,
  capabilities JSONB DEFAULT '{}',
  requirements JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_stripe_connected_accounts_user_id ON stripe_connected_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_stripe_connected_accounts_stripe_id ON stripe_connected_accounts(stripe_account_id);

COMMENT ON TABLE stripe_connected_accounts IS 'Comptes Stripe Connect lies aux utilisateurs VIXUAL';

-- ══════════════════════════════════════════════════════════════════════════════
-- 6. TABLE STRIPE_CHECKOUT_SESSIONS (traçabilité)
-- ══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS stripe_checkout_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL UNIQUE,
  user_id TEXT NOT NULL,
  product_code TEXT NOT NULL,
  amount_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'eur',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'expired', 'failed')),
  payment_intent_id TEXT,
  payment_context TEXT,
  metadata JSONB DEFAULT '{}',
  livemode BOOLEAN NOT NULL DEFAULT FALSE,
  expires_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_stripe_checkout_sessions_user_id ON stripe_checkout_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_stripe_checkout_sessions_status ON stripe_checkout_sessions(status);
CREATE INDEX IF NOT EXISTS idx_stripe_checkout_sessions_product_code ON stripe_checkout_sessions(product_code);

COMMENT ON TABLE stripe_checkout_sessions IS 'Historique des sessions Checkout Stripe pour tracabilite';

-- ══════════════════════════════════════════════════════════════════════════════
-- FIN MIGRATION 029
-- ══════════════════════════════════════════════════════════════════════════════
