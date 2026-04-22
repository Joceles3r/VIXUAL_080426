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

// ⚠️ UTILISÉ UNIQUEMENT POUR MIGRATION
export const LEGACY_ROLE_ALIASES: Record<string, string> = {
  porter: "creator",
  infoporter: "infoporteur",
  podcaster: "podcasteur",
  listener: "auditeur",
  investireader: "contribu_lecteur",
  contribureader: "contribu_lecteur",
  investor: "contributor",
};
