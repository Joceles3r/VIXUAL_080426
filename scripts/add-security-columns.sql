-- VIXUAL (ex-VISUAL): Security Patch -- Add verification level, risk flags, step-up auth, and withdrawal policy columns
-- This migration is safe to re-run (uses IF NOT EXISTS / ADD COLUMN IF NOT EXISTS)

-- Verification level (0=basique, 1=standard, 2=fort KYC)
ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_level INTEGER DEFAULT 0;

-- Step-up authentication state
ALTER TABLE users ADD COLUMN IF NOT EXISTS step_up_phone_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS step_up_totp_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS step_up_last_at TIMESTAMPTZ;

-- IP risk flags
ALTER TABLE users ADD COLUMN IF NOT EXISTS risk_vpn_suspected BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS risk_proxy_suspected BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS risk_tor_suspected BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS risk_datacenter_ip BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS risk_country_mismatch BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS risk_multi_account_suspected BOOLEAN DEFAULT FALSE;

-- Stripe Connect status for security doc
ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_connect_account_id TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_connect_status TEXT DEFAULT 'none';

-- Withdrawal policy
ALTER TABLE users ADD COLUMN IF NOT EXISTS withdrawal_hold_hours INTEGER DEFAULT 72;

-- Private identity fields (NEVER exposed publicly)
ALTER TABLE users ADD COLUMN IF NOT EXISTS legal_first_name TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS legal_last_name TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS declared_country TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS declared_city TEXT;

-- Add risk flags snapshot to withdrawal_requests if table exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'withdrawal_requests') THEN
    ALTER TABLE withdrawal_requests ADD COLUMN IF NOT EXISTS risk_flags_snapshot JSONB;
  END IF;
END $$;
