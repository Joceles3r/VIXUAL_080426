-- VIXUAL - Migration 003: Security & Integrity Patch (ex-VISUAL, renomme)
-- Source: "Analyse des Faiblesses et Solutions Techniques"
--
-- Changes:
-- 1. payout_simulations table (audit trail for double-verification)
-- 2. KYC columns on users table (birth_date, kyc_verified)
-- 3. JSONB metadata column on contents table (flexible per-category attributes)
-- 4. Integrity indexes for webhook idempotency and financial reconciliation
-- 5. webhook_events log table for reconciliation/replay

-- ─────────────────────────────────────────────
-- 1. PAYOUT SIMULATIONS (audit trail)
-- ─────────────────────────────────────────────
-- Every payout computation is logged here BEFORE committing real transactions.
-- This enables double-verification and post-mortem analysis.

CREATE TABLE IF NOT EXISTS payout_simulations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  simulation_id TEXT UNIQUE NOT NULL,
  cycle_id TEXT NOT NULL,
  category TEXT NOT NULL,
  gross_eligible_cents INTEGER NOT NULL,
  total_user_payout_cents INTEGER NOT NULL,
  platform_take_cents INTEGER NOT NULL,
  allocations_count INTEGER NOT NULL DEFAULT 0,
  integrity_check BOOLEAN NOT NULL DEFAULT true,
  warnings JSONB DEFAULT '[]',
  allocation_snapshot JSONB DEFAULT '[]',
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_payout_simulations_cycle ON payout_simulations(cycle_id);
CREATE INDEX IF NOT EXISTS idx_payout_simulations_integrity ON payout_simulations(integrity_check) WHERE integrity_check = false;

-- ─────────────────────────────────────────────
-- 2. KYC COLUMNS ON USERS
-- ─────────────────────────────────────────────
-- birth_date: required for minor detection
-- kyc_verified: tracks Stripe Identity verification status
-- kyc_verified_at: timestamp of last successful verification

ALTER TABLE users ADD COLUMN IF NOT EXISTS birth_date DATE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS kyc_verified BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS kyc_verified_at TIMESTAMPTZ;

-- ─────────────────────────────────────────────
-- 3. JSONB METADATA ON CONTENTS
-- ─────────────────────────────────────────────
-- Flexible per-category attributes (duration, page count, episode count, etc.)
-- without requiring schema migrations for each new category.

ALTER TABLE contents ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- ─────────────────────────────────────────────
-- 4. WEBHOOK EVENTS LOG (reconciliation)
-- ─────────────────────────────────────────────
-- Stores raw webhook events for replay capability.
-- Admin can "re-play" a failed webhook from this table.

CREATE TABLE IF NOT EXISTS webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_event_id TEXT UNIQUE NOT NULL,
  event_type TEXT NOT NULL,
  processed BOOLEAN NOT NULL DEFAULT false,
  processing_error TEXT,
  payload JSONB NOT NULL DEFAULT '{}',
  received_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  processed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_webhook_events_type ON webhook_events(event_type);
CREATE INDEX IF NOT EXISTS idx_webhook_events_unprocessed ON webhook_events(processed) WHERE processed = false;

-- ─────────────────────────────────────────────
-- 5. INTEGRITY INDEXES
-- ─────────────────────────────────────────────
-- Index for idempotency checks on ledger_entries via JSONB meta
CREATE INDEX IF NOT EXISTS idx_ledger_entries_stripe_pi 
  ON ledger_entries ((meta->>'stripe_payment_intent_id'))
  WHERE meta->>'stripe_payment_intent_id' IS NOT NULL;

-- Index for financial reconciliation: fast aggregation by cycle
CREATE INDEX IF NOT EXISTS idx_ledger_entries_type_status 
  ON ledger_entries(type, status);

-- Index for wallet reconciliation
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_reference 
  ON wallet_transactions(reference_id);

-- Index for content investment totals
CREATE INDEX IF NOT EXISTS idx_contents_investment 
  ON contents(current_investment_cents DESC) 
  WHERE status IN ('published', 'funded');
