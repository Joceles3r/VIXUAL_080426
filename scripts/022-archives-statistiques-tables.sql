-- ============================================
-- VIXUAL Archives + Statistiques Tables
-- Migration: 022-archives-statistiques-tables.sql
-- Date: 2026-04-01
-- Description: Tables pour le module Archives & Statistiques publiques
-- ============================================

-- ─── 1. Add public stats columns to contents table ───

ALTER TABLE contents
ADD COLUMN IF NOT EXISTS public_rank INT NULL,
ADD COLUMN IF NOT EXISTS public_score NUMERIC(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS public_trend TEXT DEFAULT 'stable',
ADD COLUMN IF NOT EXISTS entered_top_at TIMESTAMP NULL,
ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP NULL,
ADD COLUMN IF NOT EXISTS is_prestige_archived BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS prestige_label TEXT NULL,
ADD COLUMN IF NOT EXISTS hall_of_fame BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS public_support_count INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS public_qualified_views INT DEFAULT 0;

-- Index for public queries
CREATE INDEX IF NOT EXISTS idx_contents_public_rank ON contents(public_rank) WHERE public_rank IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_contents_hall_of_fame ON contents(hall_of_fame) WHERE hall_of_fame = TRUE;
CREATE INDEX IF NOT EXISTS idx_contents_prestige_archived ON contents(is_prestige_archived) WHERE is_prestige_archived = TRUE;

-- ─── 2. Table for public stat snapshots ───

CREATE TABLE IF NOT EXISTS project_public_stat_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID NOT NULL REFERENCES contents(id) ON DELETE CASCADE,
  snapshot_date DATE NOT NULL,
  public_rank INT NULL,
  public_score NUMERIC(10,2) DEFAULT 0,
  public_support_count INT DEFAULT 0,
  public_qualified_views INT DEFAULT 0,
  public_trend TEXT DEFAULT 'stable',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  
  -- Unique constraint per content per day
  CONSTRAINT unique_snapshot_per_day UNIQUE (content_id, snapshot_date)
);

-- Indexes for snapshot queries
CREATE INDEX IF NOT EXISTS idx_snapshots_content_id ON project_public_stat_snapshots(content_id);
CREATE INDEX IF NOT EXISTS idx_snapshots_date ON project_public_stat_snapshots(snapshot_date);

-- ─── 3. Table for prestige archives ───

CREATE TABLE IF NOT EXISTS prestige_archives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID NOT NULL REFERENCES contents(id) ON DELETE CASCADE,
  archive_period_key TEXT NOT NULL,
  archive_year INT NOT NULL,
  archive_month INT NULL,
  archive_quarter INT NULL,
  archive_type TEXT NOT NULL,
  prestige_label TEXT NULL,
  archived_reason TEXT,
  final_rank INT NULL,
  final_score NUMERIC(10,2) NULL,
  final_support_count INT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  
  -- Archive types: monthly_top10, category_top10, historical_winner, hall_of_fame, remarkable_progression
  CONSTRAINT valid_archive_type CHECK (archive_type IN (
    'monthly_top10', 
    'category_top10', 
    'historical_winner', 
    'hall_of_fame', 
    'remarkable_progression'
  ))
);

-- Indexes for archive queries
CREATE INDEX IF NOT EXISTS idx_prestige_content_id ON prestige_archives(content_id);
CREATE INDEX IF NOT EXISTS idx_prestige_year ON prestige_archives(archive_year);
CREATE INDEX IF NOT EXISTS idx_prestige_type ON prestige_archives(archive_type);
CREATE INDEX IF NOT EXISTS idx_prestige_period ON prestige_archives(archive_period_key);

-- ─── 4. Global stats cache table ───

CREATE TABLE IF NOT EXISTS public_stats_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stat_key TEXT NOT NULL UNIQUE,
  stat_value JSONB NOT NULL,
  computed_at TIMESTAMP NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL DEFAULT (NOW() + INTERVAL '1 hour')
);

-- Index for cache lookups
CREATE INDEX IF NOT EXISTS idx_stats_cache_key ON public_stats_cache(stat_key);
CREATE INDEX IF NOT EXISTS idx_stats_cache_expires ON public_stats_cache(expires_at);

-- ─── 5. RLS Policies for public access ───

-- Allow public read on prestige_archives
ALTER TABLE prestige_archives ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view prestige archives"
ON prestige_archives FOR SELECT
TO public
USING (true);

-- Allow public read on snapshots (limited to recent)
ALTER TABLE project_public_stat_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view recent snapshots"
ON project_public_stat_snapshots FOR SELECT
TO public
USING (snapshot_date >= CURRENT_DATE - INTERVAL '90 days');

-- ─── 6. Functions for statistics ───

-- Function to compute trend
CREATE OR REPLACE FUNCTION compute_public_trend(
  current_score NUMERIC,
  previous_score NUMERIC
) RETURNS TEXT AS $$
BEGIN
  IF current_score - previous_score > 25 THEN
    RETURN 'rising_fast';
  ELSIF current_score - previous_score > 5 THEN
    RETURN 'rising';
  ELSIF current_score - previous_score < -25 THEN
    RETURN 'falling_fast';
  ELSIF current_score - previous_score < -5 THEN
    RETURN 'falling';
  ELSE
    RETURN 'stable';
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to archive monthly top projects
CREATE OR REPLACE FUNCTION archive_monthly_top_projects()
RETURNS void AS $$
DECLARE
  last_month DATE := DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month');
  period_key TEXT := TO_CHAR(last_month, 'YYYY-MM');
BEGIN
  -- Insert top 10 projects into prestige_archives
  INSERT INTO prestige_archives (
    content_id,
    archive_period_key,
    archive_year,
    archive_month,
    archive_type,
    archived_reason,
    final_rank,
    final_score,
    final_support_count
  )
  SELECT 
    c.id,
    period_key,
    EXTRACT(YEAR FROM last_month)::INT,
    EXTRACT(MONTH FROM last_month)::INT,
    'monthly_top10',
    'Top 10 du mois ' || TO_CHAR(last_month, 'Month YYYY'),
    c.public_rank,
    c.public_score,
    c.public_support_count
  FROM contents c
  WHERE c.public_rank IS NOT NULL 
    AND c.public_rank <= 10
    AND NOT EXISTS (
      SELECT 1 FROM prestige_archives pa 
      WHERE pa.content_id = c.id 
        AND pa.archive_period_key = period_key
        AND pa.archive_type = 'monthly_top10'
    );
    
  -- Update is_prestige_archived flag
  UPDATE contents
  SET is_prestige_archived = TRUE
  WHERE id IN (
    SELECT content_id FROM prestige_archives 
    WHERE archive_period_key = period_key
  );
END;
$$ LANGUAGE plpgsql;

-- ─── 7. Comments ───

COMMENT ON TABLE prestige_archives IS 'Archives des projets prestigieux VIXUAL - visible publiquement';
COMMENT ON TABLE project_public_stat_snapshots IS 'Snapshots quotidiens des statistiques publiques des projets';
COMMENT ON TABLE public_stats_cache IS 'Cache des statistiques globales publiques';
COMMENT ON COLUMN contents.public_rank IS 'Rang public actuel dans le classement general';
COMMENT ON COLUMN contents.hall_of_fame IS 'Projet marque comme Hall of Fame';
COMMENT ON COLUMN contents.prestige_label IS 'Label prestige attribue au projet';

-- ============================================
-- Migration complete
-- ============================================
