-- ═══════════════════════════════════════════════════════════════
-- Module Chaînes créateurs (V3) — désactivé par défaut
-- ═══════════════════════════════════════════════════════════════

-- Demandes de chaîne (workflow créateur → admin)
CREATE TABLE IF NOT EXISTS creator_channel_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  channel_slug VARCHAR(60) UNIQUE,
  channel_name VARCHAR(120) NOT NULL,
  channel_bio TEXT,
  trust_score_at_request INT NOT NULL,
  reviewed_by VARCHAR(255),
  reviewed_at TIMESTAMP,
  review_note TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_channel_req_creator ON creator_channel_requests(creator_id);
CREATE INDEX IF NOT EXISTS idx_channel_req_status ON creator_channel_requests(status, created_at DESC);

-- Chaînes actives (créées après approbation)
CREATE TABLE IF NOT EXISTS creator_channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  slug VARCHAR(60) NOT NULL UNIQUE,
  name VARCHAR(120) NOT NULL,
  bio TEXT,
  banner_url TEXT,
  is_active BOOLEAN DEFAULT true,
  approved_at TIMESTAMP DEFAULT NOW(),
  approved_by VARCHAR(255),
  view_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_channel_slug ON creator_channels(slug);
CREATE INDEX IF NOT EXISTS idx_channel_active ON creator_channels(is_active);

-- Relation chaîne ↔ contenus (le créateur sélectionne ce qui apparaît)
CREATE TABLE IF NOT EXISTS creator_channel_contents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID NOT NULL REFERENCES creator_channels(id) ON DELETE CASCADE,
  content_id UUID NOT NULL REFERENCES contents(id) ON DELETE CASCADE,
  display_order INT DEFAULT 0,
  added_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(channel_id, content_id)
);
CREATE INDEX IF NOT EXISTS idx_channel_content ON creator_channel_contents(channel_id, display_order);

-- État global du module (toggle ON/OFF par le PATRON)
CREATE TABLE IF NOT EXISTS creator_channels_state (
  id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  is_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  enabled_at TIMESTAMP,
  enabled_by VARCHAR(255),
  disabled_at TIMESTAMP,
  disabled_by VARCHAR(255)
);
INSERT INTO creator_channels_state (id, is_enabled) VALUES (1, FALSE) ON CONFLICT DO NOTHING;
