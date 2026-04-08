"use client"

import type { TrustLevel } from "@/lib/trust/types"
import { TRUST_LEVEL_LABELS } from "@/lib/trust/types"

const LEVEL_CONFIG: Record<TrustLevel, { color: string; bg: string; border: string }> = {
  newcomer: { color: "text-white/50", bg: "bg-white/5", border: "border-white/10" },
  member: { color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
  trusted: { color: "text-sky-400", bg: "bg-sky-500/10", border: "border-sky-500/20" },
  verified: { color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
}

interface TrustBadgeProps {
  level: TrustLevel
  score?: number
  showLabel?: boolean
  showScore?: boolean
  size?: "sm" | "md" | "lg"
}

export function TrustBadge({ level, score, showLabel = true, showScore = false, size = "sm" }: TrustBadgeProps) {
  const config = LEVEL_CONFIG[level] ?? LEVEL_CONFIG.newcomer
  const label = TRUST_LEVEL_LABELS[level] ?? "Nouveau"

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5 gap-1",
    md: "text-sm px-2.5 py-1 gap-1.5",
    lg: "text-sm px-3 py-1.5 gap-2",
  }

  return (
    <span
      className={`inline-flex items-center rounded-full border font-medium ${config.bg} ${config.border} ${config.color} ${sizeClasses[size]}`}
    >
      <span className="inline-block w-1.5 h-1.5 rounded-full bg-current" />
      {showLabel && <span>{label}</span>}
      {showScore && score !== undefined && (
        <span className="opacity-60">({score}/100)</span>
      )}
    </span>
  )
}
