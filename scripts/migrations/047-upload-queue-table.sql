-- ═══════════════════════════════════════════════════════════════
-- Module Upload Queue : tracabilite uploads Bunny.net
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS upload_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  file_name VARCHAR(500) NOT NULL,
  file_size BIGINT NOT NULL,
  file_type VARCHAR(100) NOT NULL,
  target_collection VARCHAR(60),
  target_doc VARCHAR(100),
  target_url TEXT,
  provider VARCHAR(20) NOT NULL DEFAULT 'local' CHECK (provider IN ('local', 'bunny', 'firebase', 'blob')),
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'uploading', 'completed', 'error', 'cancelled')),
  progress INT NOT NULL DEFAULT 0,
  retry_count INT NOT NULL DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_upload_queue_user ON upload_queue(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_upload_queue_status ON upload_queue(status, created_at DESC);
