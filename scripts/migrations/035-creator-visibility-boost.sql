-- Migration 035: Creator Visibility Boost
CREATE TABLE IF NOT EXISTS creator_visibility_boost (
  id SERIAL PRIMARY KEY,
  visitor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content_id VARCHAR(64),
  vixupoints_spent INT NOT NULL CHECK (vixupoints_spent >= 10 AND vixupoints_spent <= 50),
  visibility_score NUMERIC(8,3) NOT NULL,
  visitor_trust_score INT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  cycle_month CHAR(7) NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_cvb_creator_month ON creator_visibility_boost(creator_id, cycle_month);
CREATE INDEX IF NOT EXISTS idx_cvb_visitor ON creator_visibility_boost(visitor_id, created_at DESC);
