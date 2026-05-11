-- ============================================================
-- VIXUAL — Employee Logs (audit trail des actions employés)
-- Patch ROLES_EMPLOYES_SECURITE : journal traçable visible ADMIN/PATRON.
-- Léger : 1 table, 2 index, pas d'analytics complexe.
-- ============================================================

CREATE TABLE IF NOT EXISTS employee_logs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id   UUID NOT NULL,
  employee_role VARCHAR(40) NOT NULL,
  action        VARCHAR(80) NOT NULL,
  target_type   VARCHAR(40),
  target_id     VARCHAR(80),
  details       JSONB DEFAULT '{}'::jsonb,
  ip_address    VARCHAR(64),
  user_agent    VARCHAR(255),
  created_at    TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Index pour consultation par employé (timeline desc)
CREATE INDEX IF NOT EXISTS idx_employee_logs_employee
  ON employee_logs (employee_id, created_at DESC);

-- Index pour vue globale ADMIN/PATRON (toutes les actions récentes)
CREATE INDEX IF NOT EXISTS idx_employee_logs_recent
  ON employee_logs (created_at DESC);

-- Index pour filtrer par action (ex: "suspend_account", "moderate_content")
CREATE INDEX IF NOT EXISTS idx_employee_logs_action
  ON employee_logs (action, created_at DESC);

COMMENT ON TABLE employee_logs IS
  'Audit trail léger des actions employés (modération, support, technique, etc.). Consultable uniquement par ADMIN/PATRON.';
