import type { ReactNode, HTMLAttributes } from "react"
import { cn } from "@/lib/utils"

interface CinematicBackgroundProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Active le voile "hero" (gradient cinema profond avec orbes drift).
   * Sinon, seul l'orb-bg discret est applique.
   */
  hero?: boolean
  children?: ReactNode
}

/**
 * <CinematicBackground>
 * Wrapper fin autour des utilitaires CSS deja en place :
 *   - .vx-orb-bg  : orbes drift premium
 *   - .vx-cinema-hero : voile gradient cinema OLED
 *
 * Aucun nouveau CSS. Reutilise app/cinematic.css.
 *
 * Usage :
 *   <CinematicBackground hero>
 *     <YourHeroContent />
 *   </CinematicBackground>
 */
export function CinematicBackground({
  hero = false,
  className,
  children,
  ...rest
}: CinematicBackgroundProps) {
  return (
    <div
      className={cn(
        "relative",
        hero && "vx-cinema-hero",
        className,
      )}
      {...rest}
    >
      {/* Orbes drift en couche -1 (n'interfere pas avec le clic) */}
      <div className="vx-orb-bg" aria-hidden="true" />
      {children}
    </div>
  )
}
