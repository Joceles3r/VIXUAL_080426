/**
 * VIXUAL - Menu public
 *
 * Configuration centralisee. Modifier ici plutot qu'en dur dans les composants.
 */

export type PublicMenuItem = {
  href: string
  label: string
}

export const PUBLIC_MENU: readonly PublicMenuItem[] = [
  { href: "/", label: "Accueil" },
  { href: "/explore", label: "Explorer" },
  { href: "/social", label: "Social" },
  { href: "/support", label: "Support" },
] as const
