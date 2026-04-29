-- Migration 033: Platform Version Management
CREATE TABLE IF NOT EXISTS platform_version (
  id INT PRIMARY KEY DEFAULT 1,
  current_version VARCHAR(2) NOT NULL DEFAULT 'V1' CHECK (current_version IN ('V1','V2','V3')),
  updated_by VARCHAR(255),
  updated_at TIMESTAMP DEFAULT NOW(),
  reason TEXT,
  CONSTRAINT single_row CHECK (id = 1)
);
INSERT INTO platform_version (id, current_version, updated_by, reason)
VALUES (1, 'V1', 'system', 'Lancement initial V1')
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS platform_version_history (
  id SERIAL PRIMARY KEY,
  from_version VARCHAR(2),
  to_version VARCHAR(2) NOT NULL,
  changed_by VARCHAR(255),
  changed_at TIMESTAMP DEFAULT NOW(),
  reason TEXT
);
