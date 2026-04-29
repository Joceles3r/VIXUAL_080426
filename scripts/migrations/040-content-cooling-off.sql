-- Migration 040: Content Cooling Off (AMF Compliance)
ALTER TABLE investments ADD COLUMN IF NOT EXISTS cooling_off_expires_at TIMESTAMP;
ALTER TABLE investments ADD COLUMN IF NOT EXISTS cooling_off_waived BOOLEAN DEFAULT FALSE;

-- Bunny video columns for real upload
ALTER TABLE contents ADD COLUMN IF NOT EXISTS bunny_video_id VARCHAR(64);
ALTER TABLE contents ADD COLUMN IF NOT EXISTS bunny_status VARCHAR(20) DEFAULT 'pending' CHECK (bunny_status IN ('pending','processing','ready','error'));
