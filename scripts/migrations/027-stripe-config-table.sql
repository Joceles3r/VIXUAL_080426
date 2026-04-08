-- Migration 027: Create stripe_config table for secure Stripe key storage
-- This table stores encrypted Stripe API keys configurable from the ADMIN dashboard
-- IMPORTANT: Uses INTEGER PRIMARY KEY (not SERIAL) for singleton pattern compatibility

-- Drop existing table if exists to fix schema conflicts
DROP TABLE IF EXISTS stripe_config;

-- Create the table with correct schema
CREATE TABLE stripe_config (
  id                    INTEGER PRIMARY KEY DEFAULT 1,
  test_secret_key       TEXT,
  test_publishable_key  TEXT,
  test_webhook_secret   TEXT,
  live_secret_key       TEXT,
  live_publishable_key  TEXT,
  live_webhook_secret   TEXT,
  active_mode           VARCHAR(10) NOT NULL DEFAULT 'test',
  connect_client_id     TEXT,
  updated_by            TEXT,
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT single_row CHECK (id = 1)
);

-- Insert default singleton row
INSERT INTO stripe_config (id, active_mode)
VALUES (1, 'test')
ON CONFLICT (id) DO NOTHING;

-- Add comment
COMMENT ON TABLE stripe_config IS 'Singleton table (id=1) storing encrypted Stripe API configuration. Uses INTEGER PRIMARY KEY for API compatibility.';
