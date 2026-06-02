/**
 * VIXUAL — Home V1 HBO Dark (Alias)
 *
 * Cet alias historique pointe désormais vers HomeV1Premium,
 * la nouvelle interface V1 simplifiée style Apple TV+.
 *
 * Architecture finale (1er juin 2026) :
 *   - V1 (visiteurs publics) : HomeV1Premium — ultra-épurée Apple TV+
 *   - V2 (membres connectés) : HomeV2Preserved — HBO Dark streaming complet
 *   - V3 (admin/test futur) : interface cinematic standard (page.tsx default)
 *
 * Le nom "HboDark" est conservé pour ne pas casser l'import dans app/page.tsx.
 * A renommer plus tard en HomeV1 ou supprimer si on déplace l'import.
 */
"use client"

import { HomeV1Premium } from "./home-v1-premium"

export function HomeV1HboDark() {
  return <HomeV1Premium />
}
