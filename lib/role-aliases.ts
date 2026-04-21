/**
 * VIXUAL Role Aliases - VERROU FINAL
 * 
 * Ce fichier permet de migrer progressivement de l'ancienne terminologie
 * vers la nouvelle. Les anciens alias sont conserves uniquement pour
 * la migration des donnees existantes.
 * 
 * CLES OFFICIELLES (ne pas utiliser d'autres cles dans le code nouveau):
 * - guest
 * - visitor
 * - creator
 * - contributor
 * - infoporteur
 * - podcasteur
 * - auditeur
 * - contribu_lecteur
 */

// Mapping des anciens termes vers les nouveaux (pour migration uniquement)
export const LEGACY_ROLE_ALIASES: Record<string, string> = {
  // Anciens termes -> Cles officielles
  investor: "contributor",
  porter: "creator",
  porteur: "creator",
  infoporter: "infoporteur",
  podcaster: "podcasteur",
  listener: "auditeur",
  auditor: "auditeur",
  investireader: "contribu_lecteur",
  investi_reader: "contribu_lecteur",
  "investi-reader": "contribu_lecteur",
  contribureader: "contribu_lecteur",
  contribu_reader: "contribu_lecteur",
}

// Mapping des anciens termes d'affichage
export const LEGACY_LABEL_ALIASES: Record<string, string> = {
  "Investisseur": "Contributeur",
  "Investisseurs": "Contributeurs",
  "Investi-lecteur": "Contribu-lecteur",
  "Investi-lecteurs": "Contribu-lecteurs",
  "Porteur": "Createur",
  "Porteurs": "Createurs",
}

// Mapping des termes business
export const LEGACY_BUSINESS_TERMS: Record<string, string> = {
  "investissement": "contribution",
  "investissements": "contributions",
  "investir": "contribuer",
  "investisseur": "contributeur",
  "investisseurs": "contributeurs",
  "investi-lecteur": "contribu-lecteur",
  "investi-lecteurs": "contribu-lecteurs",
  "investissement participatif": "contribution participative",
  "investissements participatifs": "contributions participatives",
  "caution investor": "caution contributeur",
  "investor_count": "contributor_count",
  "top investors": "top contributeurs",
  "Top investors": "Top contributeurs",
  "TOP investors": "TOP contributeurs",
}

// Fonction pour convertir un ancien role en nouveau
export function normalizeRole(role: string): string {
  const normalized = role.toLowerCase().replace(/-/g, "_")
  return LEGACY_ROLE_ALIASES[normalized] || normalized
}

// Fonction pour convertir un ancien label en nouveau
export function normalizeLabel(label: string): string {
  return LEGACY_LABEL_ALIASES[label] || label
}

// Fonction pour convertir un terme business
export function normalizeBusinessTerm(term: string): string {
  // Cherche une correspondance exacte d'abord
  if (LEGACY_BUSINESS_TERMS[term]) {
    return LEGACY_BUSINESS_TERMS[term]
  }
  
  // Puis cherche une correspondance insensible a la casse
  const lowerTerm = term.toLowerCase()
  for (const [old, replacement] of Object.entries(LEGACY_BUSINESS_TERMS)) {
    if (old.toLowerCase() === lowerTerm) {
      // Preserve la casse originale si possible
      if (term[0] === term[0].toUpperCase()) {
        return replacement.charAt(0).toUpperCase() + replacement.slice(1)
      }
      return replacement
    }
  }
  
  return term
}
