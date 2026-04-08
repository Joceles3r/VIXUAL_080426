-- ============================================
-- VIXUAL - Module Soutien Libre
-- Migration: Tables pour le soutien libre
-- ============================================

-- Table des paiements de soutien libre
CREATE TABLE IF NOT EXISTS free_support_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Donateur
  donor_id UUID REFERENCES users(id) ON DELETE SET NULL,
  donor_email VARCHAR(255) NOT NULL,
  
  -- Createur
  creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  creator_stripe_account_id VARCHAR(255) NOT NULL,
  
  -- Montants (en EUR)
  amount DECIMAL(10, 2) NOT NULL,
  platform_fee DECIMAL(10, 2) NOT NULL, -- 7% VIXUAL
  stripe_fee DECIMAL(10, 2) NOT NULL DEFAULT 0,
  vixual_tip DECIMAL(10, 2) NOT NULL DEFAULT 0, -- Tip optionnel
  net_amount DECIMAL(10, 2) NOT NULL,
  
  -- Message
  message TEXT,
  is_anonymous BOOLEAN DEFAULT FALSE,
  
  -- Stripe
  stripe_session_id VARCHAR(255) NOT NULL,
  stripe_payment_intent_id VARCHAR(255),
  
  -- Statut
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  
  -- Contrainte: montant positif
  CONSTRAINT positive_amount CHECK (amount > 0),
  CONSTRAINT positive_net CHECK (net_amount >= 0)
);

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_free_support_creator ON free_support_payments(creator_id);
CREATE INDEX IF NOT EXISTS idx_free_support_donor ON free_support_payments(donor_id);
CREATE INDEX IF NOT EXISTS idx_free_support_status ON free_support_payments(status);
CREATE INDEX IF NOT EXISTS idx_free_support_session ON free_support_payments(stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_free_support_created ON free_support_payments(created_at DESC);

-- Vue pour les statistiques createur
CREATE OR REPLACE VIEW creator_soutien_stats AS
SELECT 
  creator_id,
  COUNT(*) FILTER (WHERE status = 'completed') as total_payments,
  COUNT(DISTINCT COALESCE(donor_id::text, donor_email)) FILTER (WHERE status = 'completed') as unique_supporters,
  COALESCE(SUM(net_amount) FILTER (WHERE status = 'completed'), 0) as total_received,
  COALESCE(AVG(amount) FILTER (WHERE status = 'completed'), 0) as average_amount,
  COALESCE(SUM(net_amount) FILTER (WHERE status = 'completed' AND created_at >= date_trunc('month', CURRENT_DATE)), 0) as this_month,
  COALESCE(SUM(net_amount) FILTER (WHERE status = 'completed' AND created_at >= date_trunc('month', CURRENT_DATE - INTERVAL '1 month') AND created_at < date_trunc('month', CURRENT_DATE)), 0) as last_month
FROM free_support_payments
GROUP BY creator_id;

-- Commentaires
COMMENT ON TABLE free_support_payments IS 'Paiements de soutien libre - canal secondaire sans impact sur classement';
COMMENT ON COLUMN free_support_payments.platform_fee IS 'Commission VIXUAL: 7%';
COMMENT ON COLUMN free_support_payments.vixual_tip IS 'Tip optionnel +1EUR pour soutenir VIXUAL';
COMMENT ON COLUMN free_support_payments.is_anonymous IS 'Si true, le donateur reste anonyme pour le createur';

-- ============================================
-- REGLES IMPORTANTES (Soutien Libre)
-- ============================================
-- 1. Le soutien libre N'IMPACTE PAS le classement
-- 2. Le soutien libre NE GENERE PAS de votes
-- 3. Le soutien libre NE DONNE PAS d'avantage
-- 4. Commission fixe: 7% VIXUAL + frais Stripe
-- 5. Le tip VIXUAL est 100% optionnel (+1EUR)
-- ============================================
