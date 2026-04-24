/**
 * VIXUAL - Menu admin / patron
 *
 * Configuration centralisee, hierarchisee :
 *  1. Sante plateforme (Stripe, alertes, support)
 *  2. Operations (paiements, roles, utilisateurs, signalements)
 *  3. Croissance (ORBIT, Financial Brain, Visibility, SEO)
 */

export type AdminMenuGroup = {
  id: string
  label: string
  items: readonly { href: string; label: string }[]
}

export const ADMIN_MENU: readonly AdminMenuGroup[] = [
  {
    id: "health",
    label: "Sante plateforme",
    items: [
      { href: "/admin", label: "Tableau de bord" },
      { href: "/admin/stripe", label: "Sante Stripe" },
      { href: "/admin/messages", label: "Messages support" },
      { href: "/admin/alerts", label: "Alertes critiques" },
    ],
  },
  {
    id: "operations",
    label: "Operations",
    items: [
      { href: "/admin/payments", label: "Paiements" },
      { href: "/admin/roles", label: "Roles" },
      { href: "/admin/users", label: "Utilisateurs" },
      { href: "/admin/reports", label: "Signalements" },
    ],
  },
  {
    id: "growth",
    label: "Croissance",
    items: [
      { href: "/admin/orbit", label: "ORBIT" },
      { href: "/admin/financial-brain", label: "Financial Brain" },
      { href: "/admin/visibility", label: "Visibility Engine" },
      { href: "/admin/seo", label: "SEO + Growth" },
    ],
  },
] as const
