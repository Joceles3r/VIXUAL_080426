"use client"

/**
 * Logo VIXUAL unifié — style streaming professionnel.
 *
 * Texte blanc + point d'accent qui prend la couleur de la version active
 * via la variable CSS --vx-accent (fuchsia V1, rouge V2, emerald V3).
 *
 * Tailles disponibles : sm | md | lg | xl
 */
export function VixualLogo({
  size = "md",
  className = "",
}: {
  size?: "sm" | "md" | "lg" | "xl"
  className?: string
}) {
  const sizeClasses = {
    sm: "text-xl",
    md: "text-2xl",
    lg: "text-3xl",
    xl: "text-4xl md:text-5xl",
  } as const

  // Couleurs officielles VIXUAL (feu tricolore) :
  // V/I = rouge — X/U = jaune — A/L = vert
  return (
    <span
      className={`${sizeClasses[size]} font-black tracking-tight inline-flex items-baseline ${className}`}
    >
      <span className="text-red-500">V</span>
      <span className="text-red-500">I</span>
      <span className="text-amber-400">X</span>
      <span className="text-amber-400">U</span>
      <span className="text-emerald-400">A</span>
      <span className="text-emerald-400">L</span>
      <span
        aria-hidden="true"
        className="inline-block ml-0.5"
        style={{
          color: "var(--vx-accent, #d946ef)",
          textShadow: "0 0 12px var(--vx-accent, rgba(217, 70, 239, 0.6))",
        }}
      >
        .
      </span>
    </span>
  )
}
