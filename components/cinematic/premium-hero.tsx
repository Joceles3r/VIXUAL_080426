import type { ReactNode, HTMLAttributes } from "react"
import { cn } from "@/lib/utils"
import { CinematicBackground } from "./cinematic-background"

interface PremiumHeroProps extends HTMLAttributes<HTMLElement> {
  /**
   * Contenu principal du hero (titre, slogan, CTAs).
   */
  children: ReactNode
  /**
   * Active l'animation d'apparition progressive sequencee.
   * Defaut: true.
   */
  rise?: boolean
}

/**
 * <PremiumHero>
 * Section "hero" cinema premium. Combine :
 *   - <CinematicBackground hero> : voile + orbes drift
 *   - .vx-rise-in : apparition progressive (anti-flash)
 *
 * Reutilise app/cinematic.css. Aucun nouveau style.
 *
 * Le padding vertical et le contenu (titre, CTAs) restent
 * controles par le consommateur pour preserver la souplesse
 * des homepages V1/V2/V3.
 */
export function PremiumHero({
  children,
  rise = true,
  className,
  ...rest
}: PremiumHeroProps) {
  return (
    <section
      className={cn(
        "relative overflow-hidden",
        rise && "vx-rise-in",
        className,
      )}
      {...rest}
    >
      <CinematicBackground hero>
        <div className="relative z-[2]">{children}</div>
      </CinematicBackground>
    </section>
  )
}
