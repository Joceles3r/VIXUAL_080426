-- VIXUAL Stripe Connect Tables Migration
-- Ce script cree les tables necessaires pour Stripe Connect

-- ─── Table payments ───────────────────────────────────────────────────────────
-- Journalise tous les paiements entrants (contributions)

CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  content_id UUID,
  stripe_payment_intent_id TEXT UNIQUE,
  stripe_checkout_session_id TEXT UNIQUE,
  stripe_charge_id TEXT,
  amount_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'eur',
  status TEXT NOT NULL DEFAULT 'pending',
  payment_type TEXT NOT NULL DEFAULT 'contribution',
  transfer_group TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Index pour recherches frequentes
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_content_id ON payments(content_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payments_stripe_pi ON payments(stripe_payment_intent_id);

-- ─── Table payout_ledger ──────────────────────────────────────────────────────
-- Ledger de redistribution vers les comptes Connect

CREATE TABLE IF NOT EXISTS payout_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID REFERENCES payments(id),
  user_id UUID NOT NULL,
  stripe_account_id TEXT,
  amount_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'eur',
  category TEXT NOT NULL DEFAULT 'creator_gain',
  status TEXT NOT NULL DEFAULT 'pending',
  stripe_transfer_id TEXT,
  cycle_id TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Index pour recherches frequentes
CREATE INDEX IF NOT EXISTS idx_payout_ledger_user_id ON payout_ledger(user_id);
CREATE INDEX IF NOT EXISTS idx_payout_ledger_status ON payout_ledger(status);
CREATE INDEX IF NOT EXISTS idx_payout_ledger_cycle_id ON payout_ledger(cycle_id);
CREATE INDEX IF NOT EXISTS idx_payout_ledger_created_at ON payout_ledger(created_at DESC);

-- ─── Table stripe_events ──────────────────────────────────────────────────────
-- Journalise tous les evenements Stripe pour idempotence et audit

CREATE TABLE IF NOT EXISTS stripe_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_event_id TEXT UNIQUE NOT NULL,
  event_type TEXT NOT NULL,
  livemode BOOLEAN NOT NULL DEFAULT FALSE,
  processed BOOLEAN NOT NULL DEFAULT FALSE,
  payload JSONB NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  processed_at TIMESTAMP
);

-- Index pour idempotence
CREATE INDEX IF NOT EXISTS idx_stripe_events_event_id ON stripe_events(stripe_event_id);
CREATE INDEX IF NOT EXISTS idx_stripe_events_type ON stripe_events(event_type);
CREATE INDEX IF NOT EXISTS idx_stripe_events_processed ON stripe_events(processed);

-- ─── Colonnes supplementaires sur users ───────────────────────────────────────
-- Ajoute les colonnes Stripe Connect si elles n'existent pas

DO $$ 
BEGIN
  -- stripe_customer_id
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'stripe_customer_id') THEN
    ALTER TABLE users ADD COLUMN stripe_customer_id TEXT;
  END IF;
  
  -- stripe_account_id
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'stripe_account_id') THEN
    ALTER TABLE users ADD COLUMN stripe_account_id TEXT;
  END IF;
  
  -- stripe_account_status
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'stripe_account_status') THEN
    ALTER TABLE users ADD COLUMN stripe_account_status TEXT DEFAULT 'none';
  END IF;
  
  -- stripe_account_details (JSONB pour stocker charges_enabled, payouts_enabled, requirements, etc.)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'stripe_account_details') THEN
    ALTER TABLE users ADD COLUMN stripe_account_details JSONB DEFAULT '{}';
  END IF;
END $$;

-- Index pour recherche par compte Stripe
CREATE INDEX IF NOT EXISTS idx_users_stripe_account_id ON users(stripe_account_id) WHERE stripe_account_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_stripe_account_status ON users(stripe_account_status);

-- ─── Fonction de mise a jour timestamp ────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers pour updated_at
DROP TRIGGER IF EXISTS update_payments_updated_at ON payments;
CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_payout_ledger_updated_at ON payout_ledger;
CREATE TRIGGER update_payout_ledger_updated_at
  BEFORE UPDATE ON payout_ledger
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ─── Validation ───────────────────────────────────────────────────────────────

SELECT 'Stripe Connect tables created successfully' as status;
