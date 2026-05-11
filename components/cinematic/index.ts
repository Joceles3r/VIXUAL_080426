/**
 * Design System cinema VIXUAL — barrel export.
 *
 * 6 composants reutilisables (cf. §19 du patch SUPER DECO) :
 *   1. CinematicBackground
 *   2. PremiumHero
 *   3. GlowOverlay
 *   4. PremiumPosterCard
 *   5. PremiumNavigation  (re-export de VisualHeader, deja en place)
 *   6. CinematicStudioSection
 *
 * Tous sont des wrappers fins autour des utilitaires CSS deja existants
 * dans app/cinematic.css (.vx-orb-bg, .vx-halo, .vx-cinema-card,
 * .vx-cinema-poster, .vx-studio-frame, .vx-text-glow, .vx-rise-in...).
 *
 * Aucun nouveau CSS. Aucune duplication. Aucune dependance ajoutee.
 */
export { CinematicBackground } from "./cinematic-background"
export { PremiumHero } from "./premium-hero"
export { GlowOverlay } from "./glow-overlay"
export { PremiumPosterCard } from "./premium-poster-card"
export { PremiumNavigation } from "./premium-navigation"
export { CinematicStudioSection } from "./cinematic-studio-section"
