-- Migration: Create discovery_pass_daily table for Pass Decouverte VIXUAL V1
-- Date: 2026-04-02

-- Table pour tracker le Pass Decouverte quotidien par utilisateur
CREATE TABLE IF NOT EXISTS discovery_pass_daily (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  
  -- Statut du Pass
  unlocked BOOLEAN NOT NULL DEFAULT false,
  unlocked_at TIMESTAMPTZ,
  unlock_method VARCHAR(50), -- 'excerpts', 'vixupoints', 'interaction'
  
  -- Utilisation du Pass
  used BOOLEAN NOT NULL DEFAULT false,
  used_at TIMESTAMPTZ,
  content_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Un seul enregistrement par utilisateur par jour
  CONSTRAINT discovery_pass_daily_user_date_unique UNIQUE (user_id, date)
);

-- Index pour les requetes frequentes
CREATE INDEX IF NOT EXISTS idx_discovery_pass_daily_user_date 
  ON discovery_pass_daily(user_id, date);

CREATE INDEX IF NOT EXISTS idx_discovery_pass_daily_date 
  ON discovery_pass_daily(date);

-- Vue pour les statistiques admin
CREATE OR REPLACE VIEW discovery_pass_stats AS
SELECT 
  date,
  COUNT(*) as total_passes,
  COUNT(*) FILTER (WHERE unlocked) as unlocked_count,
  COUNT(*) FILTER (WHERE used) as used_count,
  ROUND(
    (COUNT(*) FILTER (WHERE unlocked)::numeric / NULLIF(COUNT(*), 0) * 100), 2
  ) as unlock_rate,
  ROUND(
    (COUNT(*) FILTER (WHERE used)::numeric / NULLIF(COUNT(*) FILTER (WHERE unlocked), 0) * 100), 2
  ) as usage_rate
FROM discovery_pass_daily
GROUP BY date
ORDER BY date DESC;

-- Table pour tracker les interactions utilisateur (si elle n'existe pas)
CREATE TABLE IF NOT EXISTS user_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  target_type VARCHAR(50) NOT NULL, -- 'project', 'comment', 'user'
  target_id UUID NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'like', 'comment', 'share', 'view'
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_interactions_user_date 
  ON user_interactions(user_id, DATE(created_at));

CREATE INDEX IF NOT EXISTS idx_user_interactions_type 
  ON user_interactions(type);

-- Table pour les vues de contenu (si elle n'existe pas)
CREATE TABLE IF NOT EXISTS content_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  view_type VARCHAR(50) NOT NULL, -- 'excerpt', 'full', 'preview'
  duration_seconds INTEGER,
  viewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ip_address INET,
  device_fingerprint VARCHAR(255)
);

CREATE INDEX IF NOT EXISTS idx_content_views_user_date 
  ON content_views(user_id, DATE(viewed_at));

CREATE INDEX IF NOT EXISTS idx_content_views_content 
  ON content_views(content_id);

-- Commentaire de documentation
COMMENT ON TABLE discovery_pass_daily IS 
  'Pass Decouverte VIXUAL V1 - Un acces gratuit a un contenu complet par jour pour les profils eligibles (visiteurs, contribu-lecteurs, auditeurs)';
