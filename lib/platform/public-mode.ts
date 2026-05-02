/**
 * Mode "production light" : permet de masquer les blocs experts,
 * reduire les animations, et eviter les compteurs simules en public.
 *
 * Active via: NEXT_PUBLIC_VIXUAL_PUBLIC_MODE = "light"
 */

export type VixualPublicMode = "light" | "full"

export function getPublicMode(): VixualPublicMode {
  return process.env.NEXT_PUBLIC_VIXUAL_PUBLIC_MODE === "light" ? "light" : "full"
}

export function isPublicLightMode(): boolean {
  return getPublicMode() === "light"
}

/**
 * Renvoie true si une animation lourde doit etre desactivee.
 * Permet aux composants animes de check une seule constante.
 */
export function shouldReduceAnimations(): boolean {
  return isPublicLightMode()
}

/**
 * Renvoie true si un compteur simule (mock) doit etre masque en public.
 */
export function shouldHideMockCounters(): boolean {
  return isPublicLightMode()
}
