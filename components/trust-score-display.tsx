"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  Star,
  CheckCircle,
  Flame,
  Film,
  Trophy,
  Rocket,
  Crown,
  Gem,
  Sparkles,
  Info,
  TrendingUp,
  Clock,
  Users,
  Wallet,
  Heart,
  AlertTriangle,
} from "lucide-react"
import {
  type TrustScore,
  type TrustScoreLevel,
  type BadgeType,
  TRUST_SCORE_RANGES,
  TRUST_BADGES,
} from "@/lib/trust/types"

// ─── Utils ───

function getScoreColor(score: number): string {
  if (score >= 90) return "text-emerald-400"
  if (score >= 75) return "text-teal-400"
  if (score >= 60) return "text-sky-400"
  if (score >= 40) return "text-amber-400"
  return "text-rose-400"
}

function getScoreBgColor(score: number): string {
  if (score >= 90) return "bg-emerald-500"
  if (score >= 75) return "bg-teal-500"
  if (score >= 60) return "bg-sky-500"
  if (score >= 40) return "bg-amber-500"
  return "bg-rose-500"
}

function getScoreIcon(level: TrustScoreLevel) {
  switch (level) {
    case "exemplary":
      return <ShieldCheck className="h-6 w-6 text-emerald-400" />
    case "very_reliable":
      return <ShieldCheck className="h-6 w-6 text-teal-400" />
    case "correct":
      return <Shield className="h-6 w-6 text-sky-400" />
    case "to_watch":
      return <ShieldAlert className="h-6 w-6 text-amber-400" />
    case "at_risk":
      return <ShieldX className="h-6 w-6 text-rose-400" />
  }
}

function getBadgeIcon(badge: BadgeType) {
  const icons: Record<BadgeType, React.ReactNode> = {
    identity_verified: <CheckCircle className="h-4 w-4" />,
    active_contributor: <Flame className="h-4 w-4" />,
    recognized_creator: <Film className="h-4 w-4" />,
    top_contributor: <Trophy className="h-4 w-4" />,
    project_promising: <Rocket className="h-4 w-4" />,
    elite_creator: <Crown className="h-4 w-4" />,
    premium_contributor: <Gem className="h-4 w-4" />,
    vixual_ambassador: <Sparkles className="h-4 w-4" />,
  }
  return icons[badge]
}

function getRarityColor(rarity: string): string {
  switch (rarity) {
    case "common":
      return "bg-slate-700 text-slate-300 border-slate-600"
    case "uncommon":
      return "bg-emerald-900/50 text-emerald-300 border-emerald-700"
    case "rare":
      return "bg-sky-900/50 text-sky-300 border-sky-700"
    case "legendary":
      return "bg-amber-900/50 text-amber-300 border-amber-700"
    default:
      return "bg-slate-700 text-slate-300 border-slate-600"
  }
}

// ─── Components ───

interface TrustScoreGaugeProps {
  score: number
  size?: "sm" | "md" | "lg"
  showLabel?: boolean
}

export function TrustScoreGauge({
  score,
  size = "md",
  showLabel = true,
}: TrustScoreGaugeProps) {
  const sizes = {
    sm: { container: "w-16 h-16", text: "text-lg", label: "text-xs" },
    md: { container: "w-24 h-24", text: "text-2xl", label: "text-sm" },
    lg: { container: "w-32 h-32", text: "text-4xl", label: "text-base" },
  }

  const circumference = 2 * Math.PI * 45
  const strokeDashoffset = circumference - (score / 100) * circumference

  return (
    <div className={`relative ${sizes[size].container}`}>
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          className="text-slate-700"
        />
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className={getScoreColor(score)}
          style={{ transition: "stroke-dashoffset 1s ease-out" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`font-bold ${sizes[size].text} ${getScoreColor(score)}`}>
          {score}
        </span>
        {showLabel && (
          <span className={`text-slate-400 ${sizes[size].label}`}>/ 100</span>
        )}
      </div>
    </div>
  )
}

interface TrustScoreCardProps {
  trustScore: TrustScore
  compact?: boolean
}

export function TrustScoreCard({ trustScore, compact = false }: TrustScoreCardProps) {
  const [showDetails, setShowDetails] = useState(false)
  const level = TRUST_SCORE_RANGES[trustScore.level]

  if (compact) {
    return (
      <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
        <TrustScoreGauge score={trustScore.score} size="sm" showLabel={false} />
        <div>
          <p className="text-sm font-medium text-white">{level.label}</p>
          <p className="text-xs text-slate-400">Niveau confiance</p>
        </div>
        {getScoreIcon(trustScore.level)}
      </div>
    )
  }

  return (
    <Card className="bg-slate-800/50 border-slate-700/50">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg text-white flex items-center gap-2">
            <Shield className="h-5 w-5 text-emerald-400" />
            VIXUAL Trust Score
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDetails(!showDetails)}
            className="text-slate-400 hover:text-white"
          >
            <Info className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-6 mb-4">
          <TrustScoreGauge score={trustScore.score} size="lg" />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              {getScoreIcon(trustScore.level)}
              <span className={`font-semibold ${getScoreColor(trustScore.score)}`}>
                {level.label}
              </span>
            </div>
            <p className="text-xs uppercase tracking-wider text-slate-500 mb-2">
              Niveau confiance
            </p>
            <p className="text-sm text-slate-400 mb-3">
              Votre niveau de confiance reflete votre engagement et votre
              fiabilite au sein de la communaute VIXUAL.
            </p>
            <div className="flex flex-wrap gap-1.5">
              {trustScore.badges.slice(0, 4).map((badge) => (
                <TooltipProvider key={badge}>
                  <Tooltip>
                    <TooltipTrigger>
                      <Badge
                        variant="outline"
                        className={getRarityColor(TRUST_BADGES[badge].rarity)}
                      >
                        {getBadgeIcon(badge)}
                        <span className="ml-1 text-xs">
                          {TRUST_BADGES[badge].displayName}
                        </span>
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{TRUST_BADGES[badge].description}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
              {trustScore.badges.length > 4 && (
                <Badge variant="outline" className="bg-slate-700 text-slate-300">
                  +{trustScore.badges.length - 4}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {showDetails && (
          <div className="space-y-3 pt-4 border-t border-slate-700">
            <h4 className="text-sm font-medium text-white mb-3">
              Composition du score
            </h4>
            <ScoreComponent
              icon={<CheckCircle className="h-4 w-4 text-emerald-400" />}
              label="Identite verifiee"
              value={trustScore.components.identityVerified}
              max={25}
            />
            <ScoreComponent
              icon={<TrendingUp className="h-4 w-4 text-sky-400" />}
              label="Historique transactions"
              value={trustScore.components.transactionHistory}
              max={20}
            />
            <ScoreComponent
              icon={<Users className="h-4 w-4 text-violet-400" />}
              label="Participation communautaire"
              value={trustScore.components.communityParticipation}
              max={15}
            />
            <ScoreComponent
              icon={<Clock className="h-4 w-4 text-amber-400" />}
              label="Anciennete"
              value={trustScore.components.seniority}
              max={15}
            />
            <ScoreComponent
              icon={<Heart className="h-4 w-4 text-rose-400" />}
              label="Comportement social"
              value={trustScore.components.socialBehavior}
              max={10}
            />
            <ScoreComponent
              icon={<Wallet className="h-4 w-4 text-teal-400" />}
              label="Fiabilite financiere"
              value={trustScore.components.financialReliability}
              max={10}
            />
            <ScoreComponent
              icon={<Star className="h-4 w-4 text-yellow-400" />}
              label="Bonus communaute"
              value={trustScore.components.communityBonus}
              max={5}
            />
          </div>
        )}

        {trustScore.warnings.length > 0 && (
          <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
            <div className="flex items-center gap-2 text-amber-400 text-sm">
              <AlertTriangle className="h-4 w-4" />
              <span className="font-medium">Avertissements</span>
            </div>
            <ul className="mt-2 text-xs text-amber-200/70 space-y-1">
              {trustScore.warnings.map((warning, idx) => (
                <li key={idx}>- {warning}</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function ScoreComponent({
  icon,
  label,
  value,
  max,
}: {
  icon: React.ReactNode
  label: string
  value: number
  max: number
}) {
  const percentage = (value / max) * 100

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2 text-slate-300">
          {icon}
          <span>{label}</span>
        </div>
        <span className="text-slate-400">
          {value.toFixed(1)} / {max}
        </span>
      </div>
      <Progress value={percentage} className="h-1.5" />
    </div>
  )
}

interface BadgesGridProps {
  badges: BadgeType[]
  showAll?: boolean
}

export function BadgesGrid({ badges, showAll = false }: BadgesGridProps) {
  const allBadges = showAll ? Object.keys(TRUST_BADGES) as BadgeType[] : badges

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
      {allBadges.map((badgeId) => {
        const badge = TRUST_BADGES[badgeId]
        const isOwned = badges.includes(badgeId)

        return (
          <Card
            key={badgeId}
            className={`relative overflow-hidden transition-all ${
              isOwned
                ? "bg-slate-800/80 border-slate-600"
                : "bg-slate-900/50 border-slate-800 opacity-50"
            }`}
          >
            <CardContent className="p-4">
              <div className="flex flex-col items-center text-center gap-2">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    isOwned ? getRarityColor(badge.rarity) : "bg-slate-800"
                  }`}
                >
                  <span className={isOwned ? badge.color : "text-slate-600"}>
                    {getBadgeIcon(badgeId)}
                  </span>
                </div>
                <div>
                  <p className={`text-sm font-medium ${isOwned ? "text-white" : "text-slate-500"}`}>
                    {badge.displayName}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">{badge.description}</p>
                </div>
                {!isOwned && (
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-900/60">
                    <Badge variant="outline" className="bg-slate-800/90 text-slate-400 border-slate-700">
                      Non obtenu
                    </Badge>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

export function TrustScoreExplanation() {
  return (
    <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700/50">
      <CardHeader>
        <CardTitle className="text-lg text-white flex items-center gap-2">
          <Info className="h-5 w-5 text-sky-400" />
          Comment fonctionne le Trust Score?
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-slate-400">
          Le VIXUAL Trust Score mesure votre fiabilite sur la plateforme. Il evolue
          automatiquement selon vos actions et permet de securiser les interactions.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Object.entries(TRUST_SCORE_RANGES).map(([key, value]) => (
            <div
              key={key}
              className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50 text-center"
            >
              <p className={`text-lg font-bold ${getScoreColor(value.min)}`}>
                {value.min}-{value.max}
              </p>
              <p className="text-xs text-slate-400 mt-1">{value.label}</p>
            </div>
          ))}
        </div>

        <div className="space-y-2 pt-2">
          <h4 className="text-sm font-medium text-white">Facteurs positifs</h4>
          <ul className="text-xs text-slate-400 space-y-1">
            <li>+ Verification de l'identite (email, telephone, Stripe)</li>
            <li>+ Transactions reussies sans litige</li>
            <li>+ Participation communautaire positive</li>
            <li>+ Anciennete sur la plateforme</li>
          </ul>
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-medium text-white">Facteurs negatifs</h4>
          <ul className="text-xs text-slate-400 space-y-1">
            <li>- Litiges ou paiements refuses</li>
            <li>- Signalements pour comportement inapproprie</li>
            <li>- Spam ou tentatives de fraude</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
