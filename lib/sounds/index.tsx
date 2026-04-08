/**
 * VIXUAL Sound System
 * 
 * Identité sonore officielle de la plateforme VIXUAL
 * 
 * Jingles disponibles:
 * - spark: Jingle principal (~2s) - ouverture app, première découverte
 * - pulse: Mini notification (~0.6s) - notifications, messages
 * - win: Gain utilisateur (~1.2s) - argent, VIXUpoints, TOP
 * - boost: Projet populaire (~1.4s) - tendance, badges
 * - click: Clic UI (~0.1s) - interactions
 * - success: Succès action (~0.8s) - confirmation
 * - error: Erreur (~0.4s) - échec
 * 
 * Usage:
 * ```tsx
 * import { useSounds } from "@/lib/sounds"
 * 
 * function MyComponent() {
 *   const { playWin, playPulse, enabled, toggle } = useSounds()
 *   
 *   return (
 *     <button onClick={playWin}>Gagner!</button>
 *   )
 * }
 * ```
 */

export * from "./types"
export * from "./use-sounds"
export { playSound, stopAllSounds } from "./synthesizer"
