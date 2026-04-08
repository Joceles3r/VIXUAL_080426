import { cn } from "@/lib/utils"

interface VisualSloganProps {
  size?: "xs" | "sm" | "base"
  className?: string
  withLines?: boolean
  opacity?: "low" | "medium" | "high"
}

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
    low: { regarde: "from-red-500/50 to-amber-400/50", participe: "from-emerald-400/50 to-teal-400/50", gagne: "from-sky-400/50 to-indigo-400/50", dash: "text-white/20" },
    medium: { regarde: "from-red-500/70 to-amber-400/70", participe: "from-emerald-400/70 to-teal-400/70", gagne: "from-sky-400/70 to-indigo-400/70", dash: "text-white/30" },
    high: { regarde: "from-red-500 to-amber-400", participe: "from-emerald-400 to-teal-400", gagne: "from-sky-400 to-indigo-400", dash: "text-white/40" },
  }

  const colors = opacityMap[opacity]

  const slogan = (
    <span
      className={cn(
        sizeClasses[size],
        "font-semibold tracking-widest uppercase inline-flex items-center gap-1",
        className
      )}
    >
      <span
        className={cn(
          "text-transparent bg-clip-text bg-gradient-to-r",
          colors.regarde
        )}
      >
        Regarde
      </span>
      <span className={cn(colors.dash, "mx-0.5")}>{"\u2013"}</span>
      <span
        className={cn(
          "text-transparent bg-clip-text bg-gradient-to-r",
          colors.participe
        )}
      >
        Participe
      </span>
      <span className={cn(colors.dash, "mx-0.5")}>{"\u2013"}</span>
      <span
        className={cn(
          "text-transparent bg-clip-text bg-gradient-to-r",
          colors.gagne
        )}
      >
        Gagne
      </span>
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
