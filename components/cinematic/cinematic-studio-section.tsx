import type { ReactNode, HTMLAttributes } from "react"
import { cn } from "@/lib/utils"

interface CinematicStudioSectionProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  /**
   * Active l'apparition progressive (.vx-rise-in). Defaut: true.
   */
  rise?: boolean
}

/**
 * <CinematicStudioSection>
 * Frame "studio createur" prestigieux pour les pages V3 (chaines, studio,
 * profils createur premium).
 *
 * Reutilise :
 *   - .vx-studio-frame : border fuchsia + shadow profonde + backdrop-blur
 *   - .vx-rise-in : apparition progressive
 *
 * Aucun nouveau CSS. Wrapper minimal du systeme existant.
 *
 * Usage :
 *   <CinematicStudioSection>
 *     <h1>Mon studio</h1>
 *     ...
 *   </CinematicStudioSection>
 */
export function CinematicStudioSection({
  children,
  rise = true,
  className,
  ...rest
}: CinematicStudioSectionProps) {
  return (
    <div
      className={cn(
        "vx-studio-frame p-6 md:p-10",
        rise && "vx-rise-in",
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  )
}
