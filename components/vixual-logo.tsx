"use client"

/**
 * Logo VIXUAL — Dégradé rose-violet-bleu (signature streaming premium).
 *
 * Dégradé officiel : #ec4899 (rose) → #a855f7 (violet) → #3b82f6 (bleu)
 * Identique au CTA "Commencer gratuitement" pour cohérence visuelle.
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

  return (
    <span
      className={`${sizeClasses[size]} font-black tracking-tight inline-flex items-baseline ${className}`}
      style={{
        backgroundImage: "linear-gradient(90deg, #ec4899 0%, #a855f7 50%, #3b82f6 100%)",
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        WebkitTextFillColor: "transparent",
        color: "transparent",
        filter: "drop-shadow(0 2px 8px rgba(168, 85, 247, 0.35))",
      }}
    >
      <span>VIXUAL</span>
    </span>
  )
}
