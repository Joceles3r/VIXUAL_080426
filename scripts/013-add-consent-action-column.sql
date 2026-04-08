-- Migration 013: Add consent_action column to cookie_consent_logs
-- This column stores a human-readable summary of accepted cookie categories

ALTER TABLE cookie_consent_logs 
ADD COLUMN IF NOT EXISTS consent_action TEXT DEFAULT 'necessary_only';

-- Add consented_at as alias for consent_date if needed
ALTER TABLE cookie_consent_logs 
ADD COLUMN IF NOT EXISTS consented_at TIMESTAMPTZ;

-- Backfill consented_at from consent_date
UPDATE cookie_consent_logs 
SET consented_at = consent_date 
WHERE consented_at IS NULL;

-- Create index on consent_action for filtering
CREATE INDEX IF NOT EXISTS idx_consent_action ON cookie_consent_logs(consent_action);
