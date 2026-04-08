/**
 * VIXUAL Role Aliases - Compatibilite avec les anciens termes
 * 
 * Ce fichier permet de migrer progressivement de l'ancienne terminologie
 * vers la nouvelle sans casser le code existant.
 */

// Mapping des anciens termes vers les nouveaux
export const LEGACY_ROLE_ALIASES: Record<string, string> = {
  // Anciens termes -> Nouveaux termes
  investor: "contributor",
  investireader: "contribu_reader",
  investi_reader: "contribu_reader",
  "investi-reader": "contribu_reader",
}

// Mapping des anciens termes d'affichage
export const LEGACY_LABEL_ALIASES: Record<string, string> = {
  "Investisseur": "Contributeur",
  "Investi-lecteur": "Contribu-lecteur",
  "Investisseurs": "Contributeurs",
  "Investi-lecteurs": "Contribu-lecteurs",
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
