-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 032: Extension des types de paiement supportes
-- ─────────────────────────────────────────────────────────────────────────────
-- Objectif : ajouter 'free_support' et 'priority_reintegration' au CHECK
-- constraint de payments.payment_type pour supporter les modules 5.5 (Reintegration 25€)
-- et 5.6 (Soutien libre 5/10/20/50€).
-- ─────────────────────────────────────────────────────────────────────────────

-- Supprimer l'ancienne contrainte si elle existe
ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_payment_type_check;

-- Recreer avec les nouveaux types
ALTER TABLE payments ADD CONSTRAINT payments_payment_type_check 
  CHECK (payment_type IN (
    'ticket_gold',
    'project_deposit',
    'priority_payment',
    'priority_reintegration',  -- Module 5.5 : reintegration 25€ d'un projet
    'free_support',             -- Module 5.6 : soutien libre 5/10/20/50€
    'other'
  ));

-- Index pour accelerer les recherches par type de paiement
CREATE INDEX IF NOT EXISTS idx_payments_payment_type ON payments(payment_type);

-- Rapport final
SELECT 'Migration 032 applied - payment types extended' AS status;
