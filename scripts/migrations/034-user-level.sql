-- Migration 034: User Level System
ALTER TABLE users ADD COLUMN IF NOT EXISTS user_level INT NOT NULL DEFAULT 1 CHECK (user_level BETWEEN 1 AND 3);
ALTER TABLE users ADD COLUMN IF NOT EXISTS level_promoted_at TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS level_celebrated INT DEFAULT 1;

CREATE TABLE IF NOT EXISTS user_level_history (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  from_level INT NOT NULL,
  to_level INT NOT NULL,
  promoted_at TIMESTAMP DEFAULT NOW(),
  reason VARCHAR(50) NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_user_level_history_user ON user_level_history(user_id);
