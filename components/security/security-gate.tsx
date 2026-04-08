"use client"

import { Shield, AlertTriangle, Lock, CheckCircle, Smartphone, KeyRound, WifiOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export type SecurityGateVariant = "blocked" | "warning" | "info"

interface SecurityGateProps {
  /** Whether the action is blocked */
  blocked: boolean
  /** Title shown in the gate */
  title: string
  /** UX message (French, non-aggressive) */
  message: string
  /** Variant controls color scheme */
  variant?: SecurityGateVariant
  /** CTA button label */
  ctaLabel?: string
  /** CTA click handler */
  onCta?: () => void
  /** Secondary CTA */
  secondaryLabel?: string
  onSecondary?: () => void
  /** Suggested action hint */
  suggestedAction?: "VERIFY_EMAIL" | "STEP_UP" | "KYC" | "DISABLE_VPN" | "WAIT"
  className?: string
}

const VARIANT_STYLES: Record<SecurityGateVariant, { border: string; bg: string; icon: string; iconBg: string }> = {
  blocked: {
    border: "border-red-500/20",
    bg: "bg-red-500/5",
    icon: "text-red-400",
    iconBg: "bg-red-500/10",
  },
  warning: {
    border: "border-amber-500/20",
    bg: "bg-amber-500/5",
    icon: "text-amber-400",
    iconBg: "bg-amber-500/10",
  },
  info: {
    border: "border-sky-500/20",
    bg: "bg-sky-500/5",
    icon: "text-sky-400",
    iconBg: "bg-sky-500/10",
  },
}

const ACTION_ICONS: Record<string, typeof Shield> = {
  VERIFY_EMAIL: CheckCircle,
  STEP_UP: Smartphone,
  KYC: KeyRound,
  DISABLE_VPN: WifiOff,
  WAIT: Lock,
}

export function SecurityGate({
  blocked,
  title,
  message,
  variant = "blocked",
  ctaLabel = "Verifier mon compte",
  onCta,
  secondaryLabel,
  onSecondary,
  suggestedAction,
  className,
}: SecurityGateProps) {
  if (!blocked) return null

  const styles = VARIANT_STYLES[variant]
  const ActionIcon = suggestedAction ? ACTION_ICONS[suggestedAction] ?? Shield : Shield

  return (
    <div className={cn(
      "w-full rounded-xl border p-4",
      styles.border,
      styles.bg,
      className
    )}>
      <div className="flex items-start gap-3">
        <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center shrink-0", styles.iconBg)}>
          {variant === "blocked" ? (
            <Lock className={cn("h-5 w-5", styles.icon)} />
          ) : variant === "warning" ? (
            <AlertTriangle className={cn("h-5 w-5", styles.icon)} />
          ) : (
            <Shield className={cn("h-5 w-5", styles.icon)} />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-white text-sm">{title}</h4>
          <p className="text-white/60 text-xs mt-1 leading-relaxed">{message}</p>
          {suggestedAction && (
            <div className="flex items-center gap-1.5 mt-2 text-[10px] text-white/40">
              <ActionIcon className="h-3 w-3" />
              <span>
                {suggestedAction === "VERIFY_EMAIL" && "Confirmez votre email"}
                {suggestedAction === "STEP_UP" && "Verification telephone ou 2FA requise"}
                {suggestedAction === "KYC" && "Verification d'identite Stripe requise"}
                {suggestedAction === "DISABLE_VPN" && "Desactivez votre VPN pour continuer"}
                {suggestedAction === "WAIT" && "En cours de verification"}
              </span>
            </div>
          )}
          {(onCta || onSecondary) && (
            <div className="flex items-center gap-2 mt-3">
              {onCta && (
                <Button
                  size="sm"
                  onClick={onCta}
                  className={cn(
                    "text-xs h-8",
                    variant === "blocked" && "bg-red-600 hover:bg-red-700 text-white",
                    variant === "warning" && "bg-amber-600 hover:bg-amber-700 text-white",
                    variant === "info" && "bg-sky-600 hover:bg-sky-700 text-white",
                  )}
                >
                  {ctaLabel}
                </Button>
              )}
              {onSecondary && secondaryLabel && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onSecondary}
                  className="text-xs h-8 border-white/10 text-white/60 hover:bg-white/5"
                >
                  {secondaryLabel}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
