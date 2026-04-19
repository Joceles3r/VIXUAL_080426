-- Migration 030: VIXUAL Wallet / Stripe Coherence
-- Date: 2026-04-19
--
-- Cette migration unifie et verrouille le schema wallet/Stripe :
--   1. Tables wallets / wallet_transactions / withdrawal_requests
--   2. Normalisation des statuts (pending, success, failed, refunded, canceled)
--   3. Vue stripe_accounts_view qui lit depuis users.stripe_account_id
--      (evite la duplication de schema entre stripe_accounts et users)
--   4. Index pour performance wallet

-- ══════════════════════════════════════════════════════════════════════════════
-- 1. TABLE wallets (solde utilisateur en centimes)
-- ══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL UNIQUE,
  available_cents BIGINT NOT NULL DEFAULT 0,
  pending_cents BIGINT NOT NULL DEFAULT 0,
  total_earned_cents BIGINT NOT NULL DEFAULT 0,
  total_withdrawn_cents BIGINT NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'eur',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT wallets_available_nonneg CHECK (available_cents >= 0),
  CONSTRAINT wallets_pending_nonneg CHECK (pending_cents >= 0)
);

CREATE INDEX IF NOT EXISTS idx_wallets_user_id ON wallets(user_id);

COMMENT ON TABLE wallets IS 'Solde wallet VIXUAL en centimes - 1 row par user';

-- ══════════════════════════════════════════════════════════════════════════════
-- 2. TABLE wallet_transactions (journal des mouvements wallet)
-- ══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS wallet_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  type TEXT NOT NULL,                 -- 'gain', 'withdrawal', 'refund', 'adjustment'
  amount_cents BIGINT NOT NULL,       -- peut être négatif (withdrawal/refund)
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'success', 'failed', 'refunded', 'canceled')),
  currency TEXT NOT NULL DEFAULT 'eur',
  stripe_payment_intent_id TEXT,
  stripe_transfer_id TEXT,
  payout_ledger_id UUID,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wallet_tx_user_id ON wallet_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_wallet_tx_status ON wallet_transactions(status);
CREATE INDEX IF NOT EXISTS idx_wallet_tx_type ON wallet_transactions(type);
CREATE INDEX IF NOT EXISTS idx_wallet_tx_created_at ON wallet_transactions(created_at DESC);

COMMENT ON TABLE wallet_transactions IS 'Journal des mouvements wallet avec statuts normalises';

-- ══════════════════════════════════════════════════════════════════════════════
-- 3. TABLE withdrawal_requests (demandes de retrait utilisateur)
-- ══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS withdrawal_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  amount_cents BIGINT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'processing', 'success', 'failed', 'canceled')),
  stripe_transfer_id TEXT,
  admin_notes TEXT,
  requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  CONSTRAINT withdrawal_requests_amount_positive CHECK (amount_cents > 0)
);

CREATE INDEX IF NOT EXISTS idx_withdrawal_user_id ON withdrawal_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_withdrawal_status ON withdrawal_requests(status);

COMMENT ON TABLE withdrawal_requests IS 'Demandes de retrait utilisateur avec statuts normalises';

-- ══════════════════════════════════════════════════════════════════════════════
-- 4. VUE stripe_accounts_view (alias unifie sur users)
--    Permet au code legacy qui interroge stripe_accounts de fonctionner
--    sans dupliquer de donnees.
-- ══════════════════════════════════════════════════════════════════════════════

DROP VIEW IF EXISTS stripe_accounts_view;
CREATE VIEW stripe_accounts_view AS
SELECT
  u.id AS user_id,
  u.stripe_account_id,
  u.stripe_account_status AS status,
  COALESCE((u.stripe_account_details->>'chargesEnabled')::boolean, FALSE) AS charges_enabled,
  COALESCE((u.stripe_account_details->>'payoutsEnabled')::boolean, FALSE) AS payouts_enabled,
  COALESCE((u.stripe_account_details->>'detailsSubmitted')::boolean, FALSE) AS details_submitted,
  u.stripe_account_details,
  u.created_at
FROM users u
WHERE u.stripe_account_id IS NOT NULL;

COMMENT ON VIEW stripe_accounts_view IS 'Vue unifiee sur les comptes Stripe Connect (source: users)';

-- ══════════════════════════════════════════════════════════════════════════════
-- 5. ALIAS stripe_accounts (view remplacante si la table n'existait pas)
--    Attention : ne pas ecraser une vraie table existante
-- ══════════════════════════════════════════════════════════════════════════════

DO $$
BEGIN
  -- Si stripe_accounts n'existe pas du tout, créer une vue en alias
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'stripe_accounts'
  ) THEN
    EXECUTE 'CREATE VIEW stripe_accounts AS SELECT * FROM stripe_accounts_view';
  END IF;
END $$;

-- ══════════════════════════════════════════════════════════════════════════════
-- 6. NORMALISATION DES STATUTS EXISTANTS
-- ══════════════════════════════════════════════════════════════════════════════

-- Renommer 'succeeded' -> 'success' pour cohérence avec la convention normalisee
UPDATE wallet_transactions SET status = 'success' WHERE status = 'succeeded';
UPDATE wallet_transactions SET status = 'canceled' WHERE status IN ('cancelled', 'cancel');
UPDATE withdrawal_requests SET status = 'success' WHERE status = 'succeeded';
UPDATE withdrawal_requests SET status = 'canceled' WHERE status IN ('cancelled', 'cancel');

-- ══════════════════════════════════════════════════════════════════════════════
-- 7. TRIGGERS updated_at
-- ══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_wallets_updated_at ON wallets;
CREATE TRIGGER update_wallets_updated_at
  BEFORE UPDATE ON wallets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_wallet_tx_updated_at ON wallet_transactions;
CREATE TRIGGER update_wallet_tx_updated_at
  BEFORE UPDATE ON wallet_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ══════════════════════════════════════════════════════════════════════════════
-- 8. VALIDATION
-- ══════════════════════════════════════════════════════════════════════════════

SELECT 'Migration 030 applied - wallet/Stripe coherence' AS status;
