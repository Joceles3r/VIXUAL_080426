-- VIXUAL - Support Tickets Table (migration 030)
-- Table unique pour tous les tickets de support usager.
-- Alimentée par /support/mailbox (usager) et consommée par /admin/messages (file unique).

CREATE TABLE IF NOT EXISTS support_tickets (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  user_email TEXT NOT NULL,
  user_name TEXT,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('urgent', 'important', 'normal', 'low')),
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'waiting_user', 'resolved', 'closed')),
  assigned_employee_id TEXT,
  ai_confidence NUMERIC(3, 2) DEFAULT 0.00,
  ai_auto_replied BOOLEAN NOT NULL DEFAULT FALSE,
  ai_suggested_response TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_support_tickets_user_email ON support_tickets (user_email);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets (status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_priority ON support_tickets (priority);
CREATE INDEX IF NOT EXISTS idx_support_tickets_created_at ON support_tickets (created_at DESC);

-- Table de réponses liées aux tickets
CREATE TABLE IF NOT EXISTS support_ticket_responses (
  id TEXT PRIMARY KEY,
  ticket_id TEXT NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  author_id TEXT,
  author_name TEXT,
  author_type TEXT NOT NULL CHECK (author_type IN ('user', 'ai', 'support', 'admin')),
  message TEXT NOT NULL,
  is_automatic BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_support_ticket_responses_ticket_id ON support_ticket_responses (ticket_id);
