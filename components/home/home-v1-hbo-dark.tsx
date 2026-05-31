/**
 * VIXUAL — Home V1 HBO Dark
 *
 * Alias qui pointe vers HomeV2Preserved, qui contient en réalité
 * la nouvelle interface HBO Dark premium (déplacement effectué
 * lors du refactor V1/V2 du 29 mai 2026).
 *
 * Architecture finale :
 *   - V1 (par defaut visiteurs) : nouvelle interface HBO Dark
 *   - V2 : même interface HBO Dark + onglets V2 supplementaires
 *   - V3 : interface standard cinematic
 *
 * Note : a nettoyer plus tard en deplaçant HomeV2Preserved vers
 * un fichier dedie home-hbo-dark.tsx et en supprimant cet alias.
 */
"use client"

import { HomeV2Preserved } from "./home-v2-preserved"

export function HomeV1HboDark() {
  return <HomeV2Preserved />
}
