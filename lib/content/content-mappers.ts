/**
 * Mappers de contenu : pont entre champs DB legacy (investorCount, ...)
 * et le vocabulaire UI a jour (supporterCount, contributors, ...).
 *
 * NE PAS renommer les colonnes DB tant qu'une migration dediee n'est pas
 * effectuee : ces helpers absorbent l'ancien vocabulaire pour que l'UI
 * affiche uniquement les nouveaux termes.
 */

export interface LegacyContentLike {
  contributorCount?: number | null
  investorCount?: number | null
  supporterCount?: number | null
  [key: string]: unknown
}

/**
 * Renvoie le nombre de "soutiens" (contributeurs) pour un contenu,
 * en privilegiant les champs modernes et en absorbant les champs legacy.
 */
export function getSupporterCount(content: LegacyContentLike): number {
  return (
    content.supporterCount ??
    content.contributorCount ??
    content.investorCount ??
    0
  )
}

/**
 * Normalise un objet contenu pour l'UI : ajoute supporterCount,
 * conserve les anciens champs pour compatibilite descendante.
 */
export function normalizeContentForUi<T extends LegacyContentLike>(
  content: T,
): T & { supporterCount: number } {
  return {
    ...content,
    supporterCount: getSupporterCount(content),
  }
}

/**
 * Libelle UI a utiliser pour le compteur de soutiens.
 * Centralise pour eviter les "investisseurs" residuels dans l'UI.
 */
export function getSupporterLabel(count: number): string {
  if (count <= 1) return "contributeur"
  return "contributeurs"
}

/**
 * Format complet : "12 contributeurs" / "1 contributeur" / "Aucun soutien".
 */
export function formatSupporterCount(content: LegacyContentLike): string {
  const count = getSupporterCount(content)
  if (count <= 0) return "Aucun soutien"
  return `${count.toLocaleString("fr-FR")} ${getSupporterLabel(count)}`
}
