/**
 * VIXUAL — Home V1 HBO Dark
 *
 * Ce composant est un alias temporaire vers PremiumHomepage pour retablir
 * l'import casse dans app/page.tsx. Le refactor V1/V2 a renomme ou supprime
 * le composant original sans corriger l'import.
 *
 * À FAIRE PLUS TARD : creer la vraie variante HBO Dark si differente de
 * PremiumHomepage, ou supprimer ce fichier alias si PremiumHomepage suffit.
 */
"use client"

import { PremiumHomepage } from "./premium-homepage"

export function HomeV1HboDark() {
  return <PremiumHomepage />
}
