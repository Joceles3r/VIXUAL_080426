"use client"

import { Shield, ShieldCheck, ShieldAlert, Star, Clock, CheckCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

export type VerificationLevel = 0 | 1 | 2

interface VerificationBadgesProps {
  /** 0 = basique, 1 = standard, 2 = fort (KYC) */
  verificationLevel: VerificationLevel
  /** VPN / anonymous connection suspected */
  vpnSuspected?: boolean
  /** Is the user a verified creator (Level 2 + content published) */
  isVerifiedCreator?: boolean
  /** Pending large withdrawal review */
  withdrawalPending72h?: boolean
  /** Compact mode for tight spaces */
  compact?: boolean
  className?: string
}

export function VerificationBadges({
  verificationLevel,
  vpnSuspected = false,
  isVerifiedCreator = false,
  withdrawalPending72h = false,
  compact = false,
  className,
}: VerificationBadgesProps) {
  return (
    <TooltipProvider delayDuration={200}>
      <div className={cn("flex flex-wrap items-center gap-1.5", className)}>
        {/* Verification level badge */}
        {verificationLevel >= 1 && (
          <Tooltip>
            <TooltipTrigger>
              <Badge
                className={cn(
                  "gap-1 border-0 text-[10px] font-semibold",
                  verificationLevel >= 2
                    ? "bg-emerald-500/15 text-emerald-400"
                    : "bg-sky-500/15 text-sky-400",
                  compact && "text-[9px] px-1.5 py-0"
                )}
              >
                {verificationLevel >= 2 ? (
                  <ShieldCheck className="h-3 w-3" />
                ) : (
                  <Shield className="h-3 w-3" />
                )}
                {!compact && (verificationLevel >= 2 ? "KYC Verifie" : "Verifie")}
              </Badge>
            </TooltipTrigger>
            <TooltipContent className="bg-slate-900 border-white/10 text-white text-xs max-w-60">
              {verificationLevel >= 2
                ? "Identite verifiee via Stripe Connect (KYC). Ce compte peut recevoir des paiements."
                : "Compte verifie par telephone ou 2FA. Actions monetaires autorisees."}
            </TooltipContent>
          </Tooltip>
        )}

        {/* Verified creator */}
        {isVerifiedCreator && (
          <Tooltip>
            <TooltipTrigger>
              <Badge className={cn("gap-1 border-0 text-[10px] font-semibold bg-purple-500/15 text-purple-400", compact && "text-[9px] px-1.5 py-0")}>
                <Star className="h-3 w-3" />
                {!compact && "Createur verifie"}
              </Badge>
            </TooltipTrigger>
            <TooltipContent className="bg-slate-900 border-white/10 text-white text-xs max-w-60">
              {"Createur verifie : identite KYC validee et contenu publie sur VISUAL."}
            </TooltipContent>
          </Tooltip>
        )}

        {/* VPN / anonymous connection warning */}
        {vpnSuspected && (
          <Tooltip>
            <TooltipTrigger>
              <Badge className={cn("gap-1 border-0 text-[10px] font-semibold bg-amber-500/15 text-amber-400", compact && "text-[9px] px-1.5 py-0")}>
                <ShieldAlert className="h-3 w-3" />
                {!compact && "Verification renforcee"}
              </Badge>
            </TooltipTrigger>
            <TooltipContent className="bg-slate-900 border-white/10 text-white text-xs max-w-60">
              {"Connexion anonymisee detectee (VPN/Proxy). Certaines actions monetaires necessitent une verification renforcee."}
            </TooltipContent>
          </Tooltip>
        )}

        {/* Withdrawal pending 72h review */}
        {withdrawalPending72h && (
          <Tooltip>
            <TooltipTrigger>
              <Badge className={cn("gap-1 border-0 text-[10px] font-semibold bg-orange-500/15 text-orange-400", compact && "text-[9px] px-1.5 py-0")}>
                <Clock className="h-3 w-3" />
                {!compact && "Retrait en verification (72h)"}
              </Badge>
            </TooltipTrigger>
            <TooltipContent className="bg-slate-900 border-white/10 text-white text-xs max-w-60">
              {"Un retrait important est en cours de verification. Delai habituel : jusqu'a 72h pour votre securite."}
            </TooltipContent>
          </Tooltip>
        )}

        {/* Level 0 -- no badge, just hint */}
        {verificationLevel === 0 && !vpnSuspected && !withdrawalPending72h && (
          <Tooltip>
            <TooltipTrigger>
              <Badge className={cn("gap-1 border-0 text-[10px] font-semibold bg-white/5 text-white/40", compact && "text-[9px] px-1.5 py-0")}>
                <CheckCircle className="h-3 w-3" />
                {!compact && "Niveau basique"}
              </Badge>
            </TooltipTrigger>
            <TooltipContent className="bg-slate-900 border-white/10 text-white text-xs max-w-60">
              {"Email verifie. Completez la verification telephone ou 2FA pour investir et retirer."}
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  )
}
