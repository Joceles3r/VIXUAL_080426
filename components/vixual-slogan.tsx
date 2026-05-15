import { cn } from "@/lib/utils"

interface VisualSloganProps {
  size?: "xs" | "sm" | "base"
  className?: string
  withLines?: boolean
  opacity?: "low" | "medium" | "high"
}

/**
 * Slogan officiel VIXUAL : "Regarde - Soutiens - Participe"
 * Couleurs : blanc pur sur fond sombre (cohérence streaming premium).
 */
export function VisualSlogan({
  size = "xs",
  className,
  withLines = false,
  opacity = "medium",
}: VisualSloganProps) {
  const sizeClasses = {
    xs: "text-xs",
    sm: "text-xs md:text-sm",
    base: "text-sm md:text-base",
  }

  const opacityMap = {
    low: { word: "text-white/55", dash: "text-white/20" },
    medium: { word: "text-white/80", dash: "text-white/30" },
    high: { word: "text-white", dash: "text-white/40" },
  }

  const colors = opacityMap[opacity]

  const slogan = (
    <span
      className={cn(
        sizeClasses[size],
        "font-semibold tracking-widest uppercase inline-flex items-center gap-1",
        className,
      )}
    >
      <span className={colors.word}>Regarde</span>
      <span className={cn(colors.dash, "mx-0.5")}>{"\u2013"}</span>
      <span className={colors.word}>Soutiens</span>
      <span className={cn(colors.dash, "mx-0.5")}>{"\u2013"}</span>
      <span className={colors.word}>Participe</span>
    </span>
  )

  if (!withLines) return slogan

  return (
    <span className="flex items-center justify-center gap-3">
      <span className="h-px w-8 md:w-12 bg-gradient-to-r from-transparent to-white/25" />
      {slogan}
      <span className="h-px w-8 md:w-12 bg-gradient-to-l from-transparent to-white/25" />
    </span>
  )
}
