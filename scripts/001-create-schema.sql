-- VISUAL - Database Schema V1
-- Neon PostgreSQL

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─────────────────────────────────────────────
-- 1. USERS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  roles TEXT[] NOT NULL DEFAULT ARRAY['visitor'],
  avatar_url TEXT,
  visupoints INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─────────────────────────────────────────────
-- 2. STRIPE CONNECT ACCOUNTS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS stripe_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  stripe_account_id TEXT UNIQUE,
  status TEXT NOT NULL DEFAULT 'not_started'
    CHECK (status IN ('not_started', 'pending', 'verified', 'rejected')),
  onboarding_url TEXT,
  charges_enabled BOOLEAN NOT NULL DEFAULT false,
  payouts_enabled BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- ─────────────────────────────────────────────
-- 3. CAUTIONS (10 EUR createurs, 20 EUR investisseurs)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cautions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  caution_type TEXT NOT NULL CHECK (caution_type IN ('creator', 'investor')),
  amount_cents INTEGER NOT NULL,
  stripe_payment_intent_id TEXT UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'paid', 'refunded')),
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─────────────────────────────────────────────
-- 4. CONTENTS (videos + textes)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS contents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  content_type TEXT NOT NULL CHECK (content_type IN ('video', 'text')),
  category TEXT,
  cover_url TEXT,
  is_free BOOLEAN NOT NULL DEFAULT false,
  investment_goal_cents INTEGER NOT NULL DEFAULT 0,
  current_investment_cents INTEGER NOT NULL DEFAULT 0,
  investor_count INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'published', 'funded', 'closed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─────────────────────────────────────────────
-- 5. INVESTMENTS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS investments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content_id UUID NOT NULL REFERENCES contents(id) ON DELETE CASCADE,
  amount_cents INTEGER NOT NULL,
  votes_granted INTEGER NOT NULL DEFAULT 0,
  visupoints_granted INTEGER NOT NULL DEFAULT 0,
  stripe_payment_intent_id TEXT UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'completed', 'refunded', 'failed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─────────────────────────────────────────────
-- 6. WALLET (soldes utilisateurs)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  available_cents INTEGER NOT NULL DEFAULT 0,
  pending_cents INTEGER NOT NULL DEFAULT 0,
  total_earned_cents INTEGER NOT NULL DEFAULT 0,
  total_withdrawn_cents INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─────────────────────────────────────────────
-- 7. WALLET TRANSACTIONS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS wallet_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN (
    'investment', 'return', 'caution', 'caution_refund',
    'withdrawal', 'visupoints_conversion', 'article_sale'
  )),
  amount_cents INTEGER NOT NULL,
  description TEXT,
  reference_id TEXT,
  status TEXT NOT NULL DEFAULT 'completed'
    CHECK (status IN ('pending', 'completed', 'failed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─────────────────────────────────────────────
-- 8. PAYOUT CYCLES
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS payout_cycles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cycle_id TEXT UNIQUE NOT NULL,
  content_id UUID REFERENCES contents(id),
  gross_eligible_cents INTEGER NOT NULL,
  platform_take_cents INTEGER NOT NULL DEFAULT 0,
  platform_fee_cents INTEGER NOT NULL DEFAULT 0,
  platform_residual_cents INTEGER NOT NULL DEFAULT 0,
  total_user_payout_cents INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'computed', 'distributed', 'failed')),
  computed_at TIMESTAMPTZ,
  distributed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─────────────────────────────────────────────
-- 9. LEDGER ENTRIES (historique granulaire)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ledger_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id TEXT UNIQUE NOT NULL,
  payout_cycle_id UUID REFERENCES payout_cycles(id),
  user_id UUID REFERENCES users(id),
  type TEXT NOT NULL CHECK (type IN (
    'platform_fee', 'platform_residual',
    'wallet_credit_gain', 'wallet_debit_withdraw_queue'
  )),
  amount_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'eur',
  status TEXT NOT NULL DEFAULT 'posted'
    CHECK (status IN ('posted', 'queued', 'settled', 'failed')),
  meta JSONB DEFAULT '{}',
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─────────────────────────────────────────────
-- 10. WITHDRAWAL REQUESTS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS withdrawal_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount_cents INTEGER NOT NULL,
  stripe_transfer_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  processed_at TIMESTAMPTZ
);

-- ─────────────────────────────────────────────
-- INDEXES
-- ─────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_investments_user ON investments(user_id);
CREATE INDEX IF NOT EXISTS idx_investments_content ON investments(content_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_user ON wallet_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_ledger_entries_user ON ledger_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_ledger_entries_cycle ON ledger_entries(payout_cycle_id);
CREATE INDEX IF NOT EXISTS idx_contents_creator ON contents(creator_id);
CREATE INDEX IF NOT EXISTS idx_contents_status ON contents(status);
