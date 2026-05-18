/**
 * VIXUAL — Permissions de lancement (6 rôles + 6 permissions clés)
 *
 * Ce module est la SOURCE UNIQUE pour les guards de routes/UI du système
 * employés au lancement. Il ne remplace pas `lib/admin/roles.ts` ni
 * `lib/admin/employees.ts` (qui restent en place pour la rétrocompat),
 * mais fournit une vue alignée avec le patch ROLES_EMPLOYES_SECURITE.
 *
 * Principes :
 *   - ADMIN/PATRON = seul super-admin total (hard-lock email).
 *   - Aucun autre rôle ne peut accéder Stripe complet, Bunny complet,
 *     suppression globale, permissions ADMIN/PATRON, logs critiques complets.
 *   - 6 permissions granulaires uniquement (pas de RBAC entreprise).
 */

import { PATRON_EMAIL } from "@/lib/admin/roles"
import type { EmployeeRole } from "@/lib/admin/employees"

// ─── Les 6 rôles cibles au lancement ───
export type LaunchRole =
  | "patron"
  | "admin_adjoint"
  | "moderator"
  | "support"
  | "technical"
  | "creator_relations"

// ─── Les 7 permissions granulaires (6 lancement + 1 homepage) ───
export type LaunchPermission =
  | "manage_content"
  | "manage_reports"
  | "view_support"
  | "view_finance_basic"
  | "view_technical_logs"
  | "manage_creators"
  | "manage_homepage" // Gérer la homepage VIXUAL (Hero + carrousels V1)

// ─── Mapping rôle → permissions accordées ───
// Verrouillage : Stripe complet, Bunny complet, suppression globale et
// permissions ADMIN/PATRON ne sont PAS dans cette liste — réservés au patron.
export const LAUNCH_ROLE_PERMISSIONS: Record<LaunchRole, LaunchPermission[]> = {
  patron: [
    "manage_content",
    "manage_reports",
    "view_support",
    "view_finance_basic",
    "view_technical_logs",
    "manage_creators",
    "manage_homepage",
  ],
  admin_adjoint: [
    "manage_content",
    "manage_reports",
    "view_support",
    "view_finance_basic",
    "manage_creators",
    "manage_homepage", // L'admin adjoint peut aussi gérer les visuels homepage
    // PAS : view_technical_logs (logs sensibles réservés à TECHNIQUE + PATRON)
  ],
  moderator: ["manage_content", "manage_reports"],
  support: ["view_support"],
  technical: ["view_technical_logs"],
  creator_relations: ["manage_creators"],
}

// ─── Niveau d'accès (utile pour l'UI : badges, hiérarchie) ───
export const LAUNCH_ROLE_LEVEL: Record<LaunchRole, number> = {
  patron: 100,
  admin_adjoint: 80,
  moderator: 50,
  technical: 40,
  creator_relations: 35,
  support: 30,
}

// ─── Métadonnées d'affichage ───
export const LAUNCH_ROLE_META: Record<
  LaunchRole,
  { label: string; description: string; color: string }
> = {
  patron: {
    label: "ADMIN / PATRON",
    description: "Contrôle total de la plateforme.",
    color: "amber",
  },
  admin_adjoint: {
    label: "ADMIN ADJOINT",
    description: "Gestion opérationnelle et supervision.",
    color: "orange",
  },
  moderator: {
    label: "Modérateur",
    description: "Modération contenus et signalements.",
    color: "violet",
  },
  support: {
    label: "Support",
    description: "Assistance utilisateurs et tickets.",
    color: "sky",
  },
  technical: {
    label: "Technique",
    description: "Monitoring et logs techniques.",
    color: "blue",
  },
  creator_relations: {
    label: "Relations Créateurs",
    description: "Accompagnement créateurs et onboarding.",
    color: "purple",
  },
}

// ─── Hard-lock PATRON : un seul email autorisé ───
export function isPatronEmail(email: string | undefined | null): boolean {
  if (!email) return false
  return email.toLowerCase() === PATRON_EMAIL.toLowerCase()
}

/**
 * Throws si l'email n'est pas celui du PATRON.
 * À utiliser en début de route handler pour les actions critiques
 * (modification de permissions, accès Stripe complet, etc.).
 */
export function assertPatron(email: string | undefined | null): void {
  if (!isPatronEmail(email)) {
    throw new Error("Forbidden — PATRON only")
  }
}

/**
 * Test granulaire de permission. Le patron a tout par défaut.
 */
export function hasLaunchPermission(
  role: LaunchRole | undefined | null,
  permission: LaunchPermission,
): boolean {
  if (!role) return false
  if (role === "patron") return true
  return LAUNCH_ROLE_PERMISSIONS[role]?.includes(permission) ?? false
}

/**
 * Hiérarchie : un rôle A peut-il gérer un rôle B (modifier, suspendre) ?
 * - patron gère tout
 * - admin_adjoint gère les rôles < admin_adjoint (moderator, support, etc.)
 * - les autres ne gèrent personne
 */
export function canManageRole(
  manager: LaunchRole | undefined | null,
  target: LaunchRole | undefined | null,
): boolean {
  if (!manager || !target) return false
  if (manager === "patron") return true
  if (target === "patron") return false
  if (manager === "admin_adjoint" && target !== "admin_adjoint") return true
  return false
}

/**
 * Convertit un EmployeeRole existant (lib/admin/employees.ts) vers un LaunchRole.
 * Permet de réutiliser les données existantes sans migration de schéma.
 */
export function toLaunchRole(role: EmployeeRole): LaunchRole {
  switch (role) {
    case "admin_patron":
      return "patron"
    case "admin_adjoint":
      return "admin_adjoint"
    case "moderator":
    case "content_manager":
      return "moderator"
    case "support_agent":
    case "user_support_agent":
      return "support"
    case "technical_agent":
      return "technical"
    case "creator_support_agent":
      return "creator_relations"
    case "finance_agent":
      // Finance basique uniquement : on le mappe sur support
      // (Stripe complet est réservé au PATRON par règle absolue du patch).
      return "support"
    default:
      return "support"
  }
}

/**
 * Liste plate des 6 rôles cibles, utile pour les <select> UI.
 */
export const LAUNCH_ROLES: LaunchRole[] = [
  "patron",
  "admin_adjoint",
  "moderator",
  "support",
  "technical",
  "creator_relations",
]
