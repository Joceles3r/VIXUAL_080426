/**
 * VIXUAL Role Aliases - VERROU FINAL
 *
 * ⚠️ UTILISÉ UNIQUEMENT POUR MIGRATION DES DONNÉES LEGACY
 *
 * Ne plus utiliser ce fichier dans la logique métier active.
 * Les clés officielles sont les seules à employer dans le code nouveau :
 * - guest
 * - visitor
 * - creator
 * - contributor
 * - infoporteur
 * - podcasteur
 * - auditeur
 * - contribu_lecteur
 */

/**
 * Mapping des anciennes cles (legacy) vers les cles officielles VIXUAL.
 *
 * N'UTILISER QUE DANS LES SCRIPTS DE MIGRATION DE DONNEES.
 * La logique metier courante doit exclusivement employer les cles officielles.
 */
export const LEGACY_ROLE_ALIASES: Record<string, string> = {
  porter: "creator",
  infoporter: "infoporteur",
  podcaster: "podcasteur",
  listener: "auditeur",
  investireader: "contribu_lecteur",
  contribureader: "contribu_lecteur",
  investor: "contributor",
};

/**
 * Normalise une cle legacy vers sa cle officielle.
 * Retourne la cle inchangee si elle est deja officielle ou inconnue.
 * Utilisation uniquement dans les scripts de migration et les webhooks qui
 * recoivent d'anciennes metadata.
 */
export function normalizeLegacyRole(role: string | null | undefined): string | null {
  if (!role) return null;
  return LEGACY_ROLE_ALIASES[role] ?? role;
}
