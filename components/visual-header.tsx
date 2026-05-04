/**
 * Re-export shim pour compatibilite ascendante.
 * Le composant officiel est `components/vixual-header.tsx` (avec x, pour
 * coller a l'identite de marque VIXUAL). Ce fichier evite tout build
 * casse par d'eventuelles references residuelles a `visual-header`
 * (ancien nom) dans des caches HMR/Turbopack ou des fichiers tiers.
 */
export { VisualHeader } from "./vixual-header"
