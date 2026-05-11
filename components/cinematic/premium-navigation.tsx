/**
 * <PremiumNavigation>
 *
 * Note importante :
 * La navigation premium existe deja en production sous le nom
 *   <VisualHeader>  (cf. components/vixual-header.tsx)
 * avec, en V3, un mode FLOTTANT premium (rounded-2xl, blur renforce,
 * halo radial fuchsia, border luminescente) deja active automatiquement.
 *
 * Conformement au §13 du patch ("ne pas refaire la navigation entiere,
 * modifier seulement style/profondeur/lumiere/overlays"), ce module
 * re-exporte simplement le header existant sous le nom canonique du
 * design system.
 *
 * Aucune duplication. Aucun nouveau header.
 */
export { VisualHeader as PremiumNavigation } from "@/components/vixual-header"
