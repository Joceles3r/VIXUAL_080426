"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { 
  AVATAR_COLORS, 
  CONTRIBUTOR_BADGES,
  VERIFICATION_LEVELS,
  type UserBadge,
  type VerificationLevel 
} from "@/lib/identity-system"
import { CheckCircle, Crown, Shield, Star } from "lucide-react"

// ══════════════════════════════════════════════════════════════
// AVATAR ANIMÉ
// ══════════════════════════════════════════════════════════════

interface AnimatedAvatarProps {
  emoji: string
  colorName: string
  size?: "sm" | "md" | "lg" | "xl"
  animate?: boolean
  showRing?: boolean
  rank?: number
}

export function AnimatedAvatar({ 
  emoji, 
  colorName, 
  size = "md", 
  animate = true,
  showRing = false,
  rank
}: AnimatedAvatarProps) {
  const color = AVATAR_COLORS.find(c => c.name === colorName) || AVATAR_COLORS[0]
  
  const sizeClasses = {
    sm: "w-8 h-8 text-sm",
    md: "w-10 h-10 text-base",
    lg: "w-12 h-12 text-lg",
    xl: "w-16 h-16 text-2xl",
  }
  
  const ringColors = {
    1: "ring-amber-400",
    2: "ring-slate-300",
    3: "ring-orange-400",
  }
  
  return (
    <div className="relative">
      <div 
        className={`
          ${sizeClasses[size]} 
          ${color.bg} 
          ${showRing && rank && rank <= 3 ? `ring-2 ${ringColors[rank as 1|2|3]}` : ''} 
          rounded-full flex items-center justify-center 
          border ${color.border}
          ${animate ? 'animate-pulse-subtle hover:scale-110 transition-transform' : ''}
        `}
      >
        <span className={animate ? 'animate-bounce-subtle' : ''}>{emoji}</span>
      </div>
      
      {/* Badge de rang pour top 3 */}
      {rank && rank <= 3 && (
        <div className={`
          absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold
          ${rank === 1 ? 'bg-amber-400 text-amber-900' : ''}
          ${rank === 2 ? 'bg-slate-300 text-slate-800' : ''}
          ${rank === 3 ? 'bg-orange-400 text-orange-900' : ''}
        `}>
          {rank}
        </div>
      )}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
// AFFICHAGE DISCRET DE L'UTILISATEUR
// ══════════════════════════════════════════════════════════════

interface UserIdentityDisplayProps {
  displayName: string
  avatarEmoji: string
  avatarColor: string
  pseudonym?: string
  verificationLevel?: VerificationLevel
  badges?: UserBadge[]
  rank?: number
  showScore?: boolean
  score?: number
  size?: "sm" | "md" | "lg"
  layout?: "horizontal" | "vertical"
}

export function UserIdentityDisplay({
  displayName,
  avatarEmoji,
  avatarColor,
  pseudonym,
  verificationLevel = 1,
  badges = [],
  rank,
  showScore = false,
  score,
  size = "md",
  layout = "horizontal"
}: UserIdentityDisplayProps) {
  const verification = VERIFICATION_LEVELS[verificationLevel]
  const topBadge = badges[0]
  
  const textSizes = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  }
  
  if (layout === "vertical") {
    return (
      <div className="flex flex-col items-center gap-2 text-center">
        <AnimatedAvatar 
          emoji={avatarEmoji} 
          colorName={avatarColor} 
          size={size === "sm" ? "md" : size === "md" ? "lg" : "xl"}
          rank={rank}
          showRing={!!rank && rank <= 10}
        />
        
        <div>
          <div className="flex items-center justify-center gap-1.5">
            <span className={`font-semibold text-white ${textSizes[size]}`}>
              {pseudonym || displayName}
            </span>
            {verificationLevel >= 2 && (
              <CheckCircle className="h-4 w-4 text-teal-400" />
            )}
            {verificationLevel === 3 && (
              <Crown className="h-4 w-4 text-violet-400" />
            )}
          </div>
          
          {pseudonym && (
            <p className="text-xs text-slate-500">{displayName}</p>
          )}
          
          {showScore && score !== undefined && (
            <p className="text-sm text-emerald-400 font-medium mt-1">
              Score: {score.toFixed(1)}
            </p>
          )}
        </div>
        
        {topBadge && (
          <Badge className={`${topBadge.color} bg-slate-800/50 border-slate-700`}>
            <span className="mr-1">{topBadge.icon}</span>
            {topBadge.label}
          </Badge>
        )}
      </div>
    )
  }
  
  return (
    <div className="flex items-center gap-3">
      <AnimatedAvatar 
        emoji={avatarEmoji} 
        colorName={avatarColor} 
        size={size}
        rank={rank}
        showRing={!!rank && rank <= 10}
      />
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className={`font-semibold text-white truncate ${textSizes[size]}`}>
            {pseudonym || displayName}
          </span>
          {verificationLevel >= 2 && (
            <CheckCircle className="h-3.5 w-3.5 text-teal-400 shrink-0" />
          )}
          {verificationLevel === 3 && (
            <Crown className="h-3.5 w-3.5 text-violet-400 shrink-0" />
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {pseudonym && (
            <span className="text-xs text-slate-500">{displayName}</span>
          )}
          {topBadge && (
            <span className={`text-xs ${topBadge.color}`}>
              {topBadge.icon} {topBadge.label}
            </span>
          )}
        </div>
        
        {showScore && score !== undefined && (
          <p className="text-xs text-emerald-400 font-medium">
            Score: {score.toFixed(1)}
          </p>
        )}
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
// CARTE DE CLASSEMENT CONTRIBUTEUR
// ══════════════════════════════════════════════════════════════

interface ContributorRankCardProps {
  rank: number
  displayName: string
  avatarEmoji: string
  avatarColor: string
  score: number
  totalContributed: number
  projectsCount: number
  badge: UserBadge | null
  isCurrentUser?: boolean
}

export function ContributorRankCard({
  rank,
  displayName,
  avatarEmoji,
  avatarColor,
  score,
  totalContributed,
  projectsCount,
  badge,
  isCurrentUser = false
}: ContributorRankCardProps) {
  const isTop3 = rank <= 3
  const isTop10 = rank <= 10
  
  const bgStyles = isCurrentUser
    ? "bg-gradient-to-r from-teal-500/20 to-emerald-500/20 border-teal-500/40"
    : isTop3
    ? "bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border-amber-500/30"
    : isTop10
    ? "bg-slate-800/50 border-teal-500/20"
    : "bg-slate-800/30 border-slate-700/30"
  
  return (
    <div className={`rounded-xl border p-4 ${bgStyles} transition-all hover:scale-[1.02]`}>
      <div className="flex items-center gap-4">
        {/* Rang */}
        <div className={`
          w-10 h-10 rounded-full flex items-center justify-center font-bold
          ${rank === 1 ? 'bg-amber-400 text-amber-900' : ''}
          ${rank === 2 ? 'bg-slate-300 text-slate-800' : ''}
          ${rank === 3 ? 'bg-orange-400 text-orange-900' : ''}
          ${rank > 3 && rank <= 10 ? 'bg-teal-500/30 text-teal-300 border border-teal-500/40' : ''}
          ${rank > 10 ? 'bg-slate-700/50 text-slate-400 border border-slate-600/40' : ''}
        `}>
          {rank}
        </div>
        
        {/* Avatar + Nom */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <AnimatedAvatar 
            emoji={avatarEmoji} 
            colorName={avatarColor} 
            size="lg"
            animate={isTop10}
          />
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-white truncate">{displayName}</span>
              {isCurrentUser && (
                <Badge className="bg-teal-500/30 text-teal-300 border-teal-500/40 text-xs">
                  Vous
                </Badge>
              )}
            </div>
            {badge && (
              <span className={`text-xs ${badge.color}`}>
                {badge.icon} {badge.label}
              </span>
            )}
          </div>
        </div>
        
        {/* Stats */}
        <div className="text-right hidden sm:block">
          <div className="text-lg font-bold text-emerald-400">{score.toFixed(1)}</div>
          <div className="text-xs text-slate-500">score</div>
        </div>
        
        <div className="text-right hidden md:block">
          <div className="text-sm font-medium text-white">{totalContributed.toLocaleString()}EUR</div>
          <div className="text-xs text-slate-500">{projectsCount} projets</div>
        </div>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
// INDICATEURS DE CONFIANCE
// ══════════════════════════════════════════════════════════════

interface TrustIndicatorsProps {
  documentVerified: boolean
  selfieVerified: boolean
  stripeConnectVerified: boolean
  isOfficialAccount: boolean
  verificationLevel: VerificationLevel
}

export function TrustIndicators({
  documentVerified,
  selfieVerified,
  stripeConnectVerified,
  isOfficialAccount,
  verificationLevel
}: TrustIndicatorsProps) {
  const indicators = []
  
  if (documentVerified && selfieVerified) {
    indicators.push({ icon: <CheckCircle className="h-4 w-4" />, label: 'Identité vérifiée', color: 'text-teal-400' })
  }
  
  if (stripeConnectVerified) {
    indicators.push({ icon: <Shield className="h-4 w-4" />, label: 'Paiement sécurisé', color: 'text-emerald-400' })
  }
  
  if (isOfficialAccount) {
    indicators.push({ icon: <Crown className="h-4 w-4" />, label: 'Compte officiel', color: 'text-violet-400' })
  }
  
  if (indicators.length === 0) {
    indicators.push({ icon: <Star className="h-4 w-4" />, label: VERIFICATION_LEVELS[verificationLevel].label, color: VERIFICATION_LEVELS[verificationLevel].color })
  }
  
  return (
    <div className="flex flex-wrap gap-2">
      {indicators.map((ind, i) => (
        <div key={i} className={`flex items-center gap-1.5 text-xs ${ind.color}`}>
          {ind.icon}
          <span>{ind.label}</span>
        </div>
      ))}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
// STYLES CSS POUR LES ANIMATIONS
// ══════════════════════════════════════════════════════════════

// Ajouter dans globals.css:
// @keyframes pulse-subtle {
//   0%, 100% { opacity: 1; }
//   50% { opacity: 0.8; }
// }
// @keyframes bounce-subtle {
//   0%, 100% { transform: translateY(0); }
//   50% { transform: translateY(-2px); }
// }
// .animate-pulse-subtle { animation: pulse-subtle 2s ease-in-out infinite; }
// .animate-bounce-subtle { animation: bounce-subtle 2s ease-in-out infinite; }
