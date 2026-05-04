-- ════════════════════════════════════════════════════════════════════════════════
-- VIXUAL — Migration 031 : Finalisation stripe_events_log (idempotence webhooks)
-- ════════════════════════════════════════════════════════════════════════════════
-- 
-- Cree la table canonique stripe_events_log utilisee par :
--   - app/api/integrations/stripe/webhooks/route.ts (idempotence ON CONFLICT DO NOTHING)
--   - app/api/admin/stripe-health/route.ts (monitoring eveenements + erreurs)
-- 
-- Note: la table stripe_events de 020-stripe-connect-tables.sql est legacy.
-- La table stripe_connected_accounts de 029 n'est PAS creee ici (doublon avec
-- les colonnes stripe_account_id/status/details deja sur users).
-- 
-- Execution : idempotente, ne touche pas aux donnees existantes.
-- ════════════════════════════════════════════════════════════════════════════════

BEGIN;

-- ──────────────────────────────────────────────────────────────────────────────
-- 1. Table stripe_events_log (idempotence + audit)
-- ──────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS stripe_events_log (
  id TEXT PRIMARY KEY,                               -- event.id Stripe (evt_xxx)
  event_type TEXT NOT NULL,
  livemode BOOLEAN NOT NULL DEFAULT false,
  payload JSONB NOT NULL,
  processing_status TEXT NOT NULL DEFAULT 'processing'
    CHECK (processing_status IN ('processing', 'processed', 'failed')),
  error_message TEXT,
  processed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index de performance
CREATE INDEX IF NOT EXISTS idx_stripe_events_log_type 
  ON stripe_events_log(event_type);
CREATE INDEX IF NOT EXISTS idx_stripe_events_log_status 
  ON stripe_events_log(processing_status);
CREATE INDEX IF NOT EXISTS idx_stripe_events_log_processed_at 
  ON stripe_events_log(processed_at DESC);

-- Colonnes complementaires si la table existait deja avec un schema partiel
ALTER TABLE stripe_events_log 
  ADD COLUMN IF NOT EXISTS error_message TEXT;
ALTER TABLE stripe_events_log 
  ADD COLUMN IF NOT EXISTS processing_status TEXT DEFAULT 'processing';

-- ──────────────────────────────────────────────────────────────────────────────
-- 2. Colonnes optionnelles sur projects (pour priority_reintegration)
-- ──────────────────────────────────────────────────────────────────────────────

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'projects') THEN
    BEGIN
      ALTER TABLE projects 
        ADD COLUMN IF NOT EXISTS priority_reintegrated_at TIMESTAMPTZ,
        ADD COLUMN IF NOT EXISTS priority_payment_id TEXT;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Colonnes priority_* non ajoutees a projects : %', SQLERRM;
    END;
  END IF;
END $$;

-- ──────────────────────────────────────────────────────────────────────────────
-- 3. Commentaires de documentation
-- ──────────────────────────────────────────────────────────────────────────────

COMMENT ON TABLE stripe_events_log IS 
  'Journal des evenements Stripe recus via webhook. Garantit l''idempotence via PK sur event.id. Utilise par /api/integrations/stripe/webhooks et /api/admin/stripe-health.';

COMMIT;

-- ════════════════════════════════════════════════════════════════════════════════
-- Verification (read-only, hors transaction)
-- ════════════════════════════════════════════════════════════════════════════════

SELECT 
  'stripe_events_log' as table_name,
  COUNT(*) as row_count,
  COUNT(*) FILTER (WHERE processing_status = 'processed') as processed_count,
  COUNT(*) FILTER (WHERE processing_status = 'failed') as failed_count
FROM stripe_events_log;
