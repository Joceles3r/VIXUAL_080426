/**
 * VIXUAL — Badge de rôle employé réutilisable.
 *
 * Usage :
 *   <EmployeeRoleBadge role="patron" />
 *   <EmployeeRoleBadge role="moderator" size="sm" />
 *
 * Le composant adapte ses couleurs au rôle (cf. LAUNCH_ROLE_META).
 */

import { LAUNCH_ROLE_META, type LaunchRole } from "@/lib/admin/launch-permissions"
import { cn } from "@/lib/utils"

type BadgeSize = "sm" | "md"

interface EmployeeRoleBadgeProps {
  role: LaunchRole
  size?: BadgeSize
  className?: string
  /** Affiche un point coloré devant le label (indication discrète). */
  withDot?: boolean
}

// Palette par couleur déclarée dans LAUNCH_ROLE_META.
// On utilise des classes Tailwind explicites pour éviter le purge dynamique.
const COLOR_CLASSES: Record<
  string,
  { bg: string; text: string; border: string; dot: string }
> = {
  amber: {
    bg: "bg-amber-500/15",
    text: "text-amber-200",
    border: "border-amber-500/40",
    dot: "bg-amber-400",
  },
  orange: {
    bg: "bg-orange-500/15",
    text: "text-orange-200",
    border: "border-orange-500/40",
    dot: "bg-orange-400",
  },
  violet: {
    bg: "bg-violet-500/15",
    text: "text-violet-200",
    border: "border-violet-500/40",
    dot: "bg-violet-400",
  },
  sky: {
    bg: "bg-sky-500/15",
    text: "text-sky-200",
    border: "border-sky-500/40",
    dot: "bg-sky-400",
  },
  blue: {
    bg: "bg-blue-500/15",
    text: "text-blue-200",
    border: "border-blue-500/40",
    dot: "bg-blue-400",
  },
  purple: {
    bg: "bg-purple-500/15",
    text: "text-purple-200",
    border: "border-purple-500/40",
    dot: "bg-purple-400",
  },
}

const SIZE_CLASSES: Record<BadgeSize, string> = {
  sm: "text-[10px] px-2 py-0.5 gap-1",
  md: "text-xs px-2.5 py-1 gap-1.5",
}

export function EmployeeRoleBadge({
  role,
  size = "md",
  className,
  withDot = true,
}: EmployeeRoleBadgeProps) {
  const meta = LAUNCH_ROLE_META[role]
  const colors = COLOR_CLASSES[meta.color] ?? COLOR_CLASSES.sky

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border font-medium uppercase tracking-wider",
        colors.bg,
        colors.text,
        colors.border,
        SIZE_CLASSES[size],
        className,
      )}
      title={meta.description}
    >
      {withDot && (
        <span
          className={cn("h-1.5 w-1.5 rounded-full", colors.dot)}
          aria-hidden="true"
        />
      )}
      {meta.label}
    </span>
  )
}
