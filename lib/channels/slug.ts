/**
 * Helpers slug pour le module Chaines createurs.
 *
 * Module PUR (importable client + server). Aucune dependance BDD.
 * Le service serveur (lib/channels/service.ts) re-exporte ces fonctions.
 */

const SLUG_REGEX = /^[a-z0-9](?:[a-z0-9-]{0,58}[a-z0-9])?$/

/**
 * Convertit une chaine en slug URL-safe :
 * - minuscules
 * - sans accent
 * - alphanumerique + tirets uniquement
 * - 1 a 60 caracteres, pas de tiret en debut/fin
 */
export function normalizeSlug(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-")
    .slice(0, 60)
}

export function isValidSlug(slug: string): boolean {
  return SLUG_REGEX.test(slug)
}
