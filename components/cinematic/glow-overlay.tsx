import type { CSSProperties } from "react"
import { cn } from "@/lib/utils"

type GlowTone = "accent" | "secondary" | "warm" | "trust"

interface GlowOverlayProps {
  /**
   * Teinte du halo :
   *  - accent     : fuchsia (defaut, brand VIXUAL)
   *  - secondary  : violet electrique
   *  - warm       : rouge/ambre (V2)
   *  - trust      : vert (V3)
   */
  tone?: GlowTone
  /**
   * Taille du halo, en pixels. Defaut: 480.
   */
  size?: number
  /**
   * Position absolue. Defaut: centre-haut.
   * Accepte des valeurs CSS classiques (px, %, rem).
   */
  top?: string | number
  left?: string | number
  right?: string | number
  bottom?: string | number
  /**
   * Permet d'ajouter un decalage personnalise (translate, etc.).
   */
  style?: CSSProperties
  className?: string
}

const TONE_CLASS: Record<GlowTone, string> = {
  accent: "vx-halo--accent",
  secondary: "vx-halo--secondary",
  warm: "vx-halo--warm",
  trust: "vx-halo--trust",
}

/**
 * <GlowOverlay>
 * Halo lumineux decoratif positionne en absolu.
 * Reutilise .vx-halo + .vx-halo--{tone} de app/cinematic.css.
 *
 * Toujours `aria-hidden` et `pointer-events-none` (jamais cliquable).
 *
 * Usage :
 *   <section className="relative">
 *     <GlowOverlay tone="accent" top="-150px" left="10%" size={440} />
 *     ...
 *   </section>
 */
export function GlowOverlay({
  tone = "accent",
  size = 480,
  top,
  left,
  right,
  bottom,
  style,
  className,
}: GlowOverlayProps) {
  return (
    <div
      className={cn("vx-halo", TONE_CLASS[tone], className)}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        top,
        left,
        right,
        bottom,
        ...style,
      }}
      aria-hidden="true"
    />
  )
}
