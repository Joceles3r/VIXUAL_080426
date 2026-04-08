-- VIXUAL: Module ADMIN-Adjoint + Employes
-- Migration pour le systeme de gestion des employes et support IA

-- =====================================================
-- TABLE: employees
-- Gestion des employes VIXUAL (admin adjoint, support, moderateurs, etc.)
-- =====================================================

CREATE TABLE IF NOT EXISTS employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role_key TEXT NOT NULL DEFAULT 'support_agent',
  status TEXT NOT NULL DEFAULT 'active',
  note TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  last_activity TIMESTAMP WITH TIME ZONE
);

-- Index pour recherche rapide
CREATE INDEX IF NOT EXISTS idx_employees_user_id ON employees(user_id);
CREATE INDEX IF NOT EXISTS idx_employees_role_key ON employees(role_key);
CREATE INDEX IF NOT EXISTS idx_employees_status ON employees(status);
CREATE INDEX IF NOT EXISTS idx_employees_email ON employees(email);

-- =====================================================
-- TABLE: employee_functions
-- Fonctions attribuees a chaque employe
-- =====================================================

CREATE TABLE IF NOT EXISTS employee_functions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  function_key TEXT NOT NULL,
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  assigned_by UUID,
  UNIQUE(employee_id, function_key)
);

CREATE INDEX IF NOT EXISTS idx_employee_functions_employee ON employee_functions(employee_id);
CREATE INDEX IF NOT EXISTS idx_employee_functions_key ON employee_functions(function_key);

-- =====================================================
-- TABLE: employee_permissions
-- Permissions specifiques par employe
-- =====================================================

CREATE TABLE IF NOT EXISTS employee_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  permission_key TEXT NOT NULL,
  allowed BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(employee_id, permission_key)
);

CREATE INDEX IF NOT EXISTS idx_employee_permissions_employee ON employee_permissions(employee_id);
CREATE INDEX IF NOT EXISTS idx_employee_permissions_key ON employee_permissions(permission_key);

-- =====================================================
-- TABLE: employee_activity_logs
-- Journal des actions des employes
-- =====================================================

CREATE TABLE IF NOT EXISTS employee_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  action_key TEXT NOT NULL,
  target_type TEXT,
  target_id TEXT,
  details TEXT,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_employee_logs_employee ON employee_activity_logs(employee_id);
CREATE INDEX IF NOT EXISTS idx_employee_logs_action ON employee_activity_logs(action_key);
CREATE INDEX IF NOT EXISTS idx_employee_logs_created ON employee_activity_logs(created_at DESC);

-- =====================================================
-- TABLE: support_messages
-- Messages support avec triage IA
-- =====================================================

CREATE TABLE IF NOT EXISTS support_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  user_email TEXT,
  user_name TEXT,
  category TEXT NOT NULL DEFAULT 'general',
  priority TEXT NOT NULL DEFAULT 'normal',
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  assigned_employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'new',
  ai_confidence NUMERIC(5,2) DEFAULT 0,
  ai_auto_replied BOOLEAN DEFAULT FALSE,
  ai_suggested_response TEXT,
  escalation_target TEXT,
  resolved_by UUID REFERENCES employees(id) ON DELETE SET NULL,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_support_messages_user ON support_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_support_messages_status ON support_messages(status);
CREATE INDEX IF NOT EXISTS idx_support_messages_priority ON support_messages(priority);
CREATE INDEX IF NOT EXISTS idx_support_messages_category ON support_messages(category);
CREATE INDEX IF NOT EXISTS idx_support_messages_assigned ON support_messages(assigned_employee_id);
CREATE INDEX IF NOT EXISTS idx_support_messages_created ON support_messages(created_at DESC);

-- =====================================================
-- TABLE: support_message_responses
-- Reponses aux messages support
-- =====================================================

CREATE TABLE IF NOT EXISTS support_message_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES support_messages(id) ON DELETE CASCADE,
  author_id TEXT NOT NULL,
  author_name TEXT NOT NULL,
  author_type TEXT NOT NULL DEFAULT 'support',
  body TEXT NOT NULL,
  is_automatic BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_message_responses_message ON support_message_responses(message_id);
CREATE INDEX IF NOT EXISTS idx_message_responses_author ON support_message_responses(author_id);

-- =====================================================
-- TABLE: employee_workload
-- Statistiques de charge par employe
-- =====================================================

CREATE TABLE IF NOT EXISTS employee_workload (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  tickets_assigned INTEGER DEFAULT 0,
  tickets_resolved INTEGER DEFAULT 0,
  urgent_tickets INTEGER DEFAULT 0,
  avg_response_time_minutes INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(employee_id, date)
);

CREATE INDEX IF NOT EXISTS idx_employee_workload_employee ON employee_workload(employee_id);
CREATE INDEX IF NOT EXISTS idx_employee_workload_date ON employee_workload(date DESC);

-- =====================================================
-- TABLE: ai_support_alerts
-- Alertes generees par l'IA support
-- =====================================================

CREATE TABLE IF NOT EXISTS ai_support_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_type TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'info',
  message TEXT NOT NULL,
  details JSONB,
  acknowledged BOOLEAN DEFAULT FALSE,
  acknowledged_by UUID REFERENCES employees(id),
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_alerts_type ON ai_support_alerts(alert_type);
CREATE INDEX IF NOT EXISTS idx_ai_alerts_severity ON ai_support_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_ai_alerts_acknowledged ON ai_support_alerts(acknowledged);
CREATE INDEX IF NOT EXISTS idx_ai_alerts_created ON ai_support_alerts(created_at DESC);

-- =====================================================
-- Insert ADMIN/PATRON as first employee (system)
-- =====================================================

INSERT INTO employees (id, user_id, first_name, last_name, email, role_key, status, created_by, note)
VALUES (
  'e0000000-0000-0000-0000-000000000001',
  'u0000000-0000-0000-0000-000000000001',
  'Admin',
  'PATRON',
  'jocelyndru@gmail.com',
  'admin_patron',
  'active',
  'e0000000-0000-0000-0000-000000000001',
  'Administrateur principal VIXUAL'
) ON CONFLICT (email) DO NOTHING;

-- Insert default functions for PATRON
INSERT INTO employee_functions (employee_id, function_key)
SELECT 'e0000000-0000-0000-0000-000000000001', unnest(ARRAY[
  'urgent_messages',
  'payment_support',
  'technical_support',
  'user_support',
  'content_moderation',
  'creator_support',
  'stripe_onboarding',
  'ticket_gold_support',
  'archives_stats',
  'general_support'
]) ON CONFLICT (employee_id, function_key) DO NOTHING;
