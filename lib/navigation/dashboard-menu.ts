/**
 * VIXUAL - Menu dashboard utilisateur
 *
 * Configuration centralisee. Les composants UI lisent cette source
 * sans la reconstruire dynamiquement a chaque render.
 */

export type DashboardMenuItem = {
  href: string
  label: string
  /** Roles autorises ; undefined = tous */
  roles?: readonly string[]
}

export const DASHBOARD_MENU: readonly DashboardMenuItem[] = [
  { href: "/dashboard", label: "Accueil" },
  { href: "/dashboard/wallet", label: "Wallet" },
  { href: "/dashboard/vixupoints", label: "Mes VIXUpoints" },
  { href: "/dashboard/profile", label: "Profil" },
  {
    href: "/dashboard/creator",
    label: "Espace createur",
    roles: ["creator", "infoporteur", "podcasteur"],
  },
  { href: "/dashboard/projects", label: "Mes projets" },
] as const
