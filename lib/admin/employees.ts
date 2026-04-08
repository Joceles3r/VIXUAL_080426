/**
 * VIXUAL - Module ADMIN-Adjoint + Employes
 * 
 * Systeme de gestion des employes VIXUAL avec hierarchie:
 * 1. ADMIN/PATRON - controle total
 * 2. ADMIN ADJOINT - coordination operationnelle
 * 3. EMPLOYES SPECIALISES - support, moderation, technique, paiement
 */

// ==================== TYPES ====================

export type EmployeeRole = 
  | "admin_patron"
  | "admin_adjoint"
  | "support_agent"
  | "moderator"
  | "finance_agent"
  | "technical_agent"
  | "content_manager"
  | "user_support_agent"
  | "creator_support_agent";

export type EmployeeFunction =
  | "payment_support"
  | "technical_support"
  | "user_support"
  | "content_moderation"
  | "creator_support"
  | "stripe_onboarding"
  | "ticket_gold_support"
  | "archives_stats"
  | "general_support"
  | "urgent_messages";

export type EmployeePermission =
  | "can_view_payments"
  | "can_manage_payment_tickets"
  | "can_view_users"
  | "can_manage_user_tickets"
  | "can_moderate_content"
  | "can_view_reports"
  | "can_manage_support_queue"
  | "can_assign_tickets"
  | "can_access_creator_support"
  | "can_access_archives_stats"
  | "can_view_admin_dashboard"
  | "can_manage_employee_notes"
  | "can_suspend_non_admin_accounts"
  | "can_escalate_to_adjoint"
  | "can_escalate_to_patron";

export type EmployeeStatus = "active" | "suspended" | "inactive";

export interface Employee {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  role: EmployeeRole;
  functions: EmployeeFunction[];
  permissions: EmployeePermission[];
  status: EmployeeStatus;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  lastActivity?: Date;
  note?: string;
}

export interface EmployeeWorkload {
  employeeId: string;
  ticketsAssigned: number;
  ticketsInProgress: number;
  urgentTickets: number;
  avgResponseTimeMinutes: number;
  todayResolved: number;
}

export interface EmployeeActivityLog {
  id: string;
  employeeId: string;
  actionKey: string;
  targetType?: string;
  targetId?: string;
  details?: string;
  createdAt: Date;
}

// ==================== ROLE CONFIGURATION ====================

export const EMPLOYEE_ROLES: Record<EmployeeRole, {
  label: string;
  description: string;
  level: number;
  color: string;
  defaultPermissions: EmployeePermission[];
}> = {
  admin_patron: {
    label: "ADMIN / PATRON",
    description: "Controle total de la plateforme",
    level: 100,
    color: "amber",
    defaultPermissions: [
      "can_view_payments",
      "can_manage_payment_tickets",
      "can_view_users",
      "can_manage_user_tickets",
      "can_moderate_content",
      "can_view_reports",
      "can_manage_support_queue",
      "can_assign_tickets",
      "can_access_creator_support",
      "can_access_archives_stats",
      "can_view_admin_dashboard",
      "can_manage_employee_notes",
      "can_suspend_non_admin_accounts",
      "can_escalate_to_adjoint",
      "can_escalate_to_patron",
    ],
  },
  admin_adjoint: {
    label: "ADMIN ADJOINT",
    description: "Coordination operationnelle et supervision intermediaire",
    level: 80,
    color: "orange",
    defaultPermissions: [
      "can_view_payments",
      "can_manage_payment_tickets",
      "can_view_users",
      "can_manage_user_tickets",
      "can_moderate_content",
      "can_view_reports",
      "can_manage_support_queue",
      "can_assign_tickets",
      "can_access_creator_support",
      "can_access_archives_stats",
      "can_view_admin_dashboard",
      "can_escalate_to_patron",
    ],
  },
  support_agent: {
    label: "Agent Support General",
    description: "Support utilisateurs generaliste",
    level: 30,
    color: "sky",
    defaultPermissions: [
      "can_view_users",
      "can_manage_user_tickets",
      "can_view_reports",
      "can_escalate_to_adjoint",
    ],
  },
  moderator: {
    label: "Moderateur",
    description: "Moderation des contenus signales",
    level: 40,
    color: "violet",
    defaultPermissions: [
      "can_moderate_content",
      "can_view_reports",
      "can_escalate_to_adjoint",
    ],
  },
  finance_agent: {
    label: "Agent Paiements",
    description: "Support paiements et Stripe",
    level: 50,
    color: "emerald",
    defaultPermissions: [
      "can_view_payments",
      "can_manage_payment_tickets",
      "can_escalate_to_adjoint",
    ],
  },
  technical_agent: {
    label: "Agent Technique",
    description: "Support technique et bugs",
    level: 40,
    color: "blue",
    defaultPermissions: [
      "can_view_reports",
      "can_escalate_to_adjoint",
    ],
  },
  content_manager: {
    label: "Gestionnaire Contenus",
    description: "Gestion et curation des contenus",
    level: 35,
    color: "rose",
    defaultPermissions: [
      "can_moderate_content",
      "can_access_archives_stats",
      "can_escalate_to_adjoint",
    ],
  },
  user_support_agent: {
    label: "Agent Support Utilisateurs",
    description: "Support comptes et profils",
    level: 30,
    color: "teal",
    defaultPermissions: [
      "can_view_users",
      "can_manage_user_tickets",
      "can_escalate_to_adjoint",
    ],
  },
  creator_support_agent: {
    label: "Agent Support Createurs",
    description: "Support dedie aux createurs",
    level: 35,
    color: "purple",
    defaultPermissions: [
      "can_access_creator_support",
      "can_view_users",
      "can_escalate_to_adjoint",
    ],
  },
};

export const EMPLOYEE_FUNCTIONS: Record<EmployeeFunction, {
  label: string;
  description: string;
  category: string;
}> = {
  payment_support: {
    label: "Support Paiements",
    description: "Gestion des tickets lies aux paiements Stripe",
    category: "finance",
  },
  technical_support: {
    label: "Support Technique",
    description: "Gestion des bugs et problemes techniques",
    category: "technique",
  },
  user_support: {
    label: "Support Utilisateurs",
    description: "Aide generale aux utilisateurs",
    category: "support",
  },
  content_moderation: {
    label: "Moderation Contenus",
    description: "Traitement des signalements de contenus",
    category: "moderation",
  },
  creator_support: {
    label: "Support Createurs",
    description: "Accompagnement des createurs VIXUAL",
    category: "support",
  },
  stripe_onboarding: {
    label: "Onboarding Stripe",
    description: "Aide a l'activation des comptes Stripe",
    category: "finance",
  },
  ticket_gold_support: {
    label: "Support Ticket Gold",
    description: "Questions sur les Tickets Gold",
    category: "support",
  },
  archives_stats: {
    label: "Archives & Statistiques",
    description: "Gestion des archives et stats publiques",
    category: "contenu",
  },
  general_support: {
    label: "Support General",
    description: "Questions generales sur VIXUAL",
    category: "support",
  },
  urgent_messages: {
    label: "Messages Urgents",
    description: "Traitement prioritaire des urgences",
    category: "urgent",
  },
};

// ==================== HELPER FUNCTIONS ====================

export function hasEmployeePermission(
  employee: Employee | null,
  permission: EmployeePermission
): boolean {
  if (!employee) return false;
  return employee.permissions.includes(permission);
}

export function canEmployeeAccess(
  employee: Employee | null,
  targetFunction: EmployeeFunction
): boolean {
  if (!employee) return false;
  if (employee.role === "admin_patron" || employee.role === "admin_adjoint") {
    return true;
  }
  return employee.functions.includes(targetFunction);
}

export function getRoleLevel(role: EmployeeRole): number {
  return EMPLOYEE_ROLES[role]?.level ?? 0;
}

export function canManageEmployee(
  manager: Employee | null,
  target: Employee | null
): boolean {
  if (!manager || !target) return false;
  if (manager.role === "admin_patron") return true;
  if (manager.role === "admin_adjoint" && target.role !== "admin_patron" && target.role !== "admin_adjoint") {
    return true;
  }
  return false;
}

export function getDefaultPermissionsForRole(role: EmployeeRole): EmployeePermission[] {
  return EMPLOYEE_ROLES[role]?.defaultPermissions ?? [];
}

// ==================== MOCK DATA (for development) ====================

export const MOCK_EMPLOYEES: Employee[] = [
  {
    id: "emp-001",
    userId: "user-patron",
    firstName: "Admin",
    lastName: "PATRON",
    email: "jocelyndru@gmail.com",
    role: "admin_patron",
    functions: ["urgent_messages", "payment_support", "content_moderation"],
    permissions: EMPLOYEE_ROLES.admin_patron.defaultPermissions,
    status: "active",
    createdBy: "system",
    createdAt: new Date("2025-01-01"),
    updatedAt: new Date("2026-04-05"),
    lastActivity: new Date(),
  },
  {
    id: "emp-002",
    userId: "user-adjoint",
    firstName: "Marie",
    lastName: "Adjointe",
    email: "adjoint@vixual.fr",
    role: "admin_adjoint",
    functions: ["urgent_messages", "payment_support", "user_support"],
    permissions: EMPLOYEE_ROLES.admin_adjoint.defaultPermissions,
    status: "active",
    createdBy: "emp-001",
    createdAt: new Date("2025-02-15"),
    updatedAt: new Date("2026-04-01"),
    lastActivity: new Date(),
  },
  {
    id: "emp-003",
    userId: "user-support1",
    firstName: "Lucas",
    lastName: "Support",
    email: "lucas.support@vixual.fr",
    role: "support_agent",
    functions: ["user_support", "general_support"],
    permissions: EMPLOYEE_ROLES.support_agent.defaultPermissions,
    status: "active",
    createdBy: "emp-001",
    createdAt: new Date("2025-03-10"),
    updatedAt: new Date("2026-03-15"),
    lastActivity: new Date(),
  },
  {
    id: "emp-004",
    userId: "user-mod1",
    firstName: "Sophie",
    lastName: "Moderatrice",
    email: "sophie.mod@vixual.fr",
    role: "moderator",
    functions: ["content_moderation"],
    permissions: EMPLOYEE_ROLES.moderator.defaultPermissions,
    status: "active",
    createdBy: "emp-001",
    createdAt: new Date("2025-04-01"),
    updatedAt: new Date("2026-04-01"),
    lastActivity: new Date(),
  },
  {
    id: "emp-005",
    userId: "user-finance1",
    firstName: "Thomas",
    lastName: "Finance",
    email: "thomas.finance@vixual.fr",
    role: "finance_agent",
    functions: ["payment_support", "stripe_onboarding"],
    permissions: EMPLOYEE_ROLES.finance_agent.defaultPermissions,
    status: "active",
    createdBy: "emp-002",
    createdAt: new Date("2025-05-20"),
    updatedAt: new Date("2026-03-28"),
    lastActivity: new Date(),
  },
];

export const MOCK_WORKLOADS: EmployeeWorkload[] = [
  { employeeId: "emp-002", ticketsAssigned: 8, ticketsInProgress: 3, urgentTickets: 2, avgResponseTimeMinutes: 45, todayResolved: 5 },
  { employeeId: "emp-003", ticketsAssigned: 12, ticketsInProgress: 5, urgentTickets: 0, avgResponseTimeMinutes: 60, todayResolved: 7 },
  { employeeId: "emp-004", ticketsAssigned: 6, ticketsInProgress: 2, urgentTickets: 1, avgResponseTimeMinutes: 30, todayResolved: 4 },
  { employeeId: "emp-005", ticketsAssigned: 4, ticketsInProgress: 2, urgentTickets: 1, avgResponseTimeMinutes: 90, todayResolved: 2 },
];
