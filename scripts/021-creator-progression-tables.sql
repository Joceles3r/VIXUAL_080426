-- =============================================================================
-- VIXUAL Creator Progression Module - Database Migration
-- 
-- Tables for tracking creator progression (porteur/infoporteur/podcasteur)
-- Without monetary rewards - only visibility, prestige and status
-- =============================================================================

-- Add creator progression columns to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS creator_level INT DEFAULT 1,
ADD COLUMN IF NOT EXISTS creator_progress_score INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS creator_badge TEXT DEFAULT 'Nouveau',
ADD COLUMN IF NOT EXISTS creator_badge_color TEXT DEFAULT 'emerald',
ADD COLUMN IF NOT EXISTS creator_pro_unlocked BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS creator_last_progress_update TIMESTAMP NULL,
ADD COLUMN IF NOT EXISTS creator_visibility_boost DECIMAL(3,2) DEFAULT 1.00;

-- Creator progression history table
-- Tracks all score changes and level ups
CREATE TABLE IF NOT EXISTS creator_progress_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  score_before INT NOT NULL,
  score_after INT NOT NULL,
  level_before INT NOT NULL,
  level_after INT NOT NULL,
  reason TEXT NOT NULL,
  content_id UUID NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Index for querying user history
CREATE INDEX IF NOT EXISTS idx_creator_progress_history_user 
ON creator_progress_history(user_id, created_at DESC);

-- Creator goals table
-- Tracks dynamic objectives for each creator
CREATE TABLE IF NOT EXISTS creator_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  goal_key TEXT NOT NULL,
  goal_label TEXT NOT NULL,
  current_value INT DEFAULT 0,
  target_value INT NOT NULL,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Index for active goals per user
CREATE INDEX IF NOT EXISTS idx_creator_goals_user_active 
ON creator_goals(user_id, is_completed, priority);

-- Creator stats snapshot table
-- Daily snapshots of creator performance metrics
CREATE TABLE IF NOT EXISTS creator_stats_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  snapshot_date DATE NOT NULL,
  views INT DEFAULT 0,
  engagement INT DEFAULT 0,
  contributions INT DEFAULT 0,
  interactions INT DEFAULT 0,
  total_contents INT DEFAULT 0,
  weekly_publications INT DEFAULT 0,
  regularity_score DECIMAL(5,2) DEFAULT 0,
  reliability_score DECIMAL(5,2) DEFAULT 0,
  growth_score DECIMAL(5,2) DEFAULT 0,
  calculated_score INT DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Unique constraint: one snapshot per user per day
CREATE UNIQUE INDEX IF NOT EXISTS idx_creator_stats_user_date 
ON creator_stats_snapshots(user_id, snapshot_date);

-- Index for trend analysis
CREATE INDEX IF NOT EXISTS idx_creator_stats_date 
ON creator_stats_snapshots(snapshot_date DESC);

-- Content impact tracking table
-- Tracks how each piece of content contributes to creator progression
CREATE TABLE IF NOT EXISTS content_progression_impact (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID NOT NULL,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  points_total INT DEFAULT 0,
  points_today INT DEFAULT 0,
  trend TEXT DEFAULT 'stable' CHECK (trend IN ('up', 'stable', 'down')),
  last_calculated TIMESTAMP NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Index for user content impacts
CREATE INDEX IF NOT EXISTS idx_content_impact_user 
ON content_progression_impact(user_id, points_total DESC);

-- Feature flags table for gradual rollout
CREATE TABLE IF NOT EXISTS feature_flags (
  key TEXT PRIMARY KEY,
  enabled BOOLEAN NOT NULL DEFAULT FALSE,
  rollout_percentage INT DEFAULT 0 CHECK (rollout_percentage >= 0 AND rollout_percentage <= 100),
  metadata JSONB DEFAULT '{}',
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Insert default feature flags for creator progression
INSERT INTO feature_flags (key, enabled, rollout_percentage, metadata) VALUES
('creator_progress_enabled', true, 100, '{"version": "v1", "description": "Enable creator progression system"}'),
('creator_goals_enabled', true, 100, '{"version": "v1", "description": "Enable dynamic goals"}'),
('creator_progress_notifications_enabled', true, 100, '{"version": "v1", "description": "Enable level-up notifications"}'),
('creator_advanced_analytics_enabled', false, 0, '{"version": "v2", "description": "Enable advanced analytics (V2)"}'),
('creator_pro_page_enabled', true, 100, '{"version": "v1", "description": "Enable Elite PRO page access"}'),
('creator_ai_tips_enabled', true, 50, '{"version": "v1", "description": "Enable AI-powered tips"}')
ON CONFLICT (key) DO NOTHING;

-- =============================================================================
-- FUNCTIONS
-- =============================================================================

-- Function to calculate creator level from score
CREATE OR REPLACE FUNCTION calculate_creator_level(score INT) RETURNS INT AS $$
BEGIN
  IF score >= 1000 THEN RETURN 5;
  ELSIF score >= 600 THEN RETURN 4;
  ELSIF score >= 300 THEN RETURN 3;
  ELSIF score >= 100 THEN RETURN 2;
  ELSE RETURN 1;
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to get badge info from level
CREATE OR REPLACE FUNCTION get_creator_badge(level INT) RETURNS TABLE(badge TEXT, badge_color TEXT, boost DECIMAL) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    CASE level
      WHEN 1 THEN 'Nouveau'
      WHEN 2 THEN 'Actif'
      WHEN 3 THEN 'Confirme'
      WHEN 4 THEN 'Influant'
      WHEN 5 THEN 'Elite VIXUAL'
    END,
    CASE level
      WHEN 1 THEN 'emerald'
      WHEN 2 THEN 'sky'
      WHEN 3 THEN 'purple'
      WHEN 4 THEN 'amber'
      WHEN 5 THEN 'rose'
    END,
    CASE level
      WHEN 1 THEN 1.00
      WHEN 2 THEN 1.10
      WHEN 3 THEN 1.25
      WHEN 4 THEN 1.50
      WHEN 5 THEN 2.00
    END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to update creator progression
CREATE OR REPLACE FUNCTION update_creator_progression(
  p_user_id UUID,
  p_new_score INT,
  p_reason TEXT,
  p_content_id UUID DEFAULT NULL
) RETURNS TABLE(
  old_level INT,
  new_level INT,
  leveled_up BOOLEAN,
  pro_unlocked BOOLEAN
) AS $$
DECLARE
  v_old_score INT;
  v_old_level INT;
  v_new_level INT;
  v_badge_info RECORD;
BEGIN
  -- Get current state
  SELECT creator_progress_score, creator_level 
  INTO v_old_score, v_old_level
  FROM users 
  WHERE id = p_user_id;
  
  -- Calculate new level
  v_new_level := calculate_creator_level(p_new_score);
  
  -- Get badge info
  SELECT * INTO v_badge_info FROM get_creator_badge(v_new_level);
  
  -- Update user
  UPDATE users SET
    creator_progress_score = p_new_score,
    creator_level = v_new_level,
    creator_badge = v_badge_info.badge,
    creator_badge_color = v_badge_info.badge_color,
    creator_visibility_boost = v_badge_info.boost,
    creator_pro_unlocked = (v_new_level >= 5),
    creator_last_progress_update = NOW()
  WHERE id = p_user_id;
  
  -- Log to history
  INSERT INTO creator_progress_history (
    user_id, score_before, score_after, level_before, level_after, reason, content_id
  ) VALUES (
    p_user_id, v_old_score, p_new_score, v_old_level, v_new_level, p_reason, p_content_id
  );
  
  -- Return result
  RETURN QUERY SELECT 
    v_old_level, 
    v_new_level, 
    (v_new_level > v_old_level),
    (v_new_level >= 5);
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- INDEXES FOR PERFORMANCE
-- =============================================================================

-- Index for finding elite creators
CREATE INDEX IF NOT EXISTS idx_users_creator_elite 
ON users(creator_level) 
WHERE creator_level >= 5;

-- Index for visibility boost sorting
CREATE INDEX IF NOT EXISTS idx_users_creator_boost 
ON users(creator_visibility_boost DESC);

-- =============================================================================
-- COMMENTS
-- =============================================================================

COMMENT ON TABLE creator_progress_history IS 'Tracks all progression changes for creators';
COMMENT ON TABLE creator_goals IS 'Dynamic objectives for creator progression';
COMMENT ON TABLE creator_stats_snapshots IS 'Daily performance snapshots for trend analysis';
COMMENT ON TABLE content_progression_impact IS 'Impact of each content on creator score';
COMMENT ON TABLE feature_flags IS 'Feature flags for gradual rollout of progression features';

COMMENT ON COLUMN users.creator_level IS 'Current progression level (1-5)';
COMMENT ON COLUMN users.creator_progress_score IS 'Total progression score';
COMMENT ON COLUMN users.creator_visibility_boost IS 'Multiplier for content visibility based on level';
COMMENT ON COLUMN users.creator_pro_unlocked IS 'Whether creator has access to Elite PRO page';
