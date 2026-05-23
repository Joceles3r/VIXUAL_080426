/**
 * lib/admin-config.ts
 * ───────────────────────────────────────────────────────────────────────────────
 * Centralise l'email ADMIN/PATRON de VIXUAL.
 * Utiliser cette constante partout au lieu de hardcoder "jocelyndru@gmail.com".
 */

export const ADMIN_PATRON_EMAIL =
  process.env.VIXUAL_ADMIN_EMAIL ||
  process.env.NEXT_PUBLIC_ADMIN_EMAIL ||
  process.env.PATRON_EMAIL ||
  "jocelyndru@gmail.com"

/**
 * Verifie si un email est l'ADMIN/PATRON principal.
 */
export function isAdminPatron(email: string | null | undefined): boolean {
  if (!email) return false
  return email.toLowerCase() === ADMIN_PATRON_EMAIL.toLowerCase()
}
