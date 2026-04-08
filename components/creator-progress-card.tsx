"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronRight,
  Target,
  Sparkles,
  Crown,
  Upload,
  Eye,
  Heart,
  MessageCircle,
  Calendar,
  Lightbulb,
  ArrowUpRight,
  Star,
  Zap,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  type CreatorProgressState,
  type CreatorStats,
  type ProgressGoal,
  type ContentImpact,
  getLevelInfo,
  calculateProgressToNextLevel,
  getPointsToNextLevel,
  buildCreatorGoals,
  generateCreatorTips,
  getMockCreatorStats,
  getMockCreatorProgress,
  getMockContentImpacts,
  CREATOR_LEVELS,
  canAccessCreatorProPage,
} from "@/lib/creator-progression"

interface CreatorProgressCardProps {
  userId: string
  creatorType: "porter" | "infoporter" | "podcaster"
  compact?: boolean
  className?: string
}

const badgeColorMap: Record<string, string> = {
  emerald: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  sky: "bg-sky-500/20 text-sky-400 border-sky-500/30",
  purple: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  amber: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  rose: "bg-gradient-to-r from-rose-500/20 to-amber-500/20 text-rose-400 border-rose-500/30",
}

const levelGradientMap: Record<string, string> = {
  emerald: "from-emerald-500 to-teal-500",
  sky: "from-sky-500 to-blue-500",
  purple: "from-purple-500 to-violet-500",
  amber: "from-amber-500 to-orange-500",
  rose: "from-rose-500 via-pink-500 to-amber-500",
}

const goalIconMap: Record<string, typeof Upload> = {
  upload: Upload,
  eye: Eye,
  heart: Heart,
  "message-circle": MessageCircle,
  calendar: Calendar,
}

export function CreatorProgressCard({ 
  userId, 
  creatorType, 
  compact = false,
  className 
}: CreatorProgressCardProps) {
  const [progress, setProgress] = useState<CreatorProgressState | null>(null)
  const [stats, setStats] = useState<CreatorStats | null>(null)
  const [goals, setGoals] = useState<ProgressGoal[]>([])
  const [tips, setTips] = useState<string[]>([])
  const [topContents, setTopContents] = useState<ContentImpact[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      const mockProgress = getMockCreatorProgress(userId, creatorType)
      const mockStats = getMockCreatorStats(userId, creatorType)
      const mockGoals = buildCreatorGoals(mockStats, mockProgress.level)
      const mockTips = generateCreatorTips(mockStats, mockProgress.level)
      const mockContents = getMockContentImpacts(userId)

      setProgress(mockProgress)
      setStats(mockStats)
      setGoals(mockGoals)
      setTips(mockTips)
      setTopContents(mockContents)
      setLoading(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [userId, creatorType])

  if (loading || !progress || !stats) {
    return (
      <Card className={cn("bg-slate-900/60 border-white/10", className)}>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-white/10 rounded w-1/3" />
            <div className="h-4 bg-white/10 rounded w-full" />
            <div className="h-4 bg-white/10 rounded w-2/3" />
          </div>
        </CardContent>
      </Card>
    )
  }

  const levelInfo = getLevelInfo(progress.level)
  const nextLevelInfo = progress.level < 5 ? getLevelInfo(progress.level + 1) : null
  const progressPercent = calculateProgressToNextLevel(progress.score, progress.level)
  const pointsToNext = getPointsToNextLevel(progress.score, progress.level)
  const isElite = canAccessCreatorProPage(progress.level)

  // Compact version for sidebar or small spaces
  if (compact) {
    return (
      <Card className={cn("bg-slate-900/60 border-white/10 overflow-hidden", className)}>
        <div className={cn("h-1 bg-gradient-to-r", levelGradientMap[progress.badgeColor])} />
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              {isElite ? (
                <Crown className="h-5 w-5 text-amber-400" />
              ) : (
                <Zap className="h-5 w-5 text-purple-400" />
              )}
              <span className="text-white font-medium text-sm">{levelInfo.name}</span>
            </div>
            <Badge className={cn("text-xs", badgeColorMap[progress.badgeColor])}>
              {progress.badge}
            </Badge>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-white/50">Progression</span>
              <span className="text-white/70">{progressPercent}%</span>
            </div>
            <Progress 
              value={progressPercent} 
              className="h-2 bg-white/10"
            />
            {nextLevelInfo && (
              <p className="text-white/40 text-xs">
                {pointsToNext} pts pour {nextLevelInfo.name}
              </p>
            )}
          </div>
          
          <Link href="/dashboard/creator">
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full mt-3 text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 text-xs"
            >
              Voir ma progression
              <ChevronRight className="h-3 w-3 ml-1" />
            </Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  // Full version
  return (
    <Card className={cn("bg-slate-900/60 border-white/10 overflow-hidden", className)}>
      {/* Level indicator bar */}
      <div className={cn("h-1.5 bg-gradient-to-r", levelGradientMap[progress.badgeColor])} />
      
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            {isElite ? (
              <Crown className="h-5 w-5 text-amber-400" />
            ) : (
              <TrendingUp className="h-5 w-5 text-purple-400" />
            )}
            Progression Createur
          </CardTitle>
          <Link href="/dashboard/creator">
            <Button variant="ghost" size="sm" className="text-white/50 hover:text-white text-xs gap-1">
              Details
              <ArrowUpRight className="h-3 w-3" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-5">
        {/* Current Level + Badge */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h3 className="text-xl font-bold text-white">{levelInfo.name}</h3>
              <Badge className={cn("font-medium", badgeColorMap[progress.badgeColor])}>
                {progress.badge}
              </Badge>
            </div>
            <p className="text-white/50 text-sm">{levelInfo.description}</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-white">{progress.score}</p>
            <p className="text-white/40 text-xs">points</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-white/70">Niveau {progress.level}</span>
            {nextLevelInfo ? (
              <span className="text-white/50">Niveau {progress.level + 1}</span>
            ) : (
              <span className="text-amber-400">Niveau MAX</span>
            )}
          </div>
          <div className="relative">
            <Progress 
              value={progressPercent} 
              className="h-3 bg-white/10"
            />
            <div 
              className={cn(
                "absolute top-0 left-0 h-full rounded-full bg-gradient-to-r transition-all duration-500",
                levelGradientMap[progress.badgeColor]
              )}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          {nextLevelInfo && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-white/50">{progressPercent}% complete</span>
              <span className="text-white/70">
                Encore <strong className="text-white">{pointsToNext}</strong> points pour <strong className="text-white">{nextLevelInfo.name}</strong>
              </span>
            </div>
          )}
        </div>

        {/* Elite Access Banner */}
        {isElite && (
          <div className="p-3 rounded-xl bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-purple-500/10 border border-amber-500/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-rose-500 flex items-center justify-center">
                <Crown className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-white font-medium text-sm">Page PRO Elite debloquee</p>
                <p className="text-white/50 text-xs">Acces a votre vitrine createur exclusive</p>
              </div>
              <Link href={`/creator-pro/${userId}`}>
                <Button size="sm" className="bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 text-white text-xs">
                  Voir ma page PRO
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Dynamic Goals */}
        {goals.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-emerald-400" />
              <h4 className="text-white font-medium text-sm">Objectifs pour progresser</h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {goals.map((goal) => {
                const GoalIcon = goalIconMap[goal.icon] || Target
                return (
                  <div 
                    key={goal.id}
                    className={cn(
                      "p-3 rounded-lg border",
                      goal.priority === "high" 
                        ? "bg-amber-500/5 border-amber-500/20" 
                        : "bg-slate-800/50 border-white/5"
                    )}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <GoalIcon className={cn(
                        "h-4 w-4",
                        goal.priority === "high" ? "text-amber-400" : "text-white/50"
                      )} />
                      <span className="text-white/70 text-xs flex-1 truncate">{goal.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={goal.progress} className="h-1.5 flex-1 bg-white/10" />
                      <span className="text-white/50 text-xs whitespace-nowrap">
                        {goal.current}/{goal.target}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Top Content Impact */}
        {topContents.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-amber-400" />
              <h4 className="text-white font-medium text-sm">Vos meilleurs contenus</h4>
            </div>
            <div className="space-y-2">
              {topContents.slice(0, 2).map((content) => (
                <div 
                  key={content.contentId}
                  className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 border border-white/5"
                >
                  <div className="flex items-center gap-3">
                    {content.trend === "up" ? (
                      <TrendingUp className="h-4 w-4 text-emerald-400" />
                    ) : content.trend === "down" ? (
                      <TrendingDown className="h-4 w-4 text-red-400" />
                    ) : (
                      <Minus className="h-4 w-4 text-white/30" />
                    )}
                    <div>
                      <p className="text-white text-sm font-medium truncate max-w-[180px]">
                        {content.contentTitle}
                      </p>
                      <p className="text-white/40 text-xs">{content.message}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={cn(
                      "text-sm font-bold",
                      content.trend === "up" ? "text-emerald-400" : 
                      content.trend === "down" ? "text-red-400" : "text-white/70"
                    )}>
                      +{content.pointsToday}
                    </p>
                    <p className="text-white/40 text-xs">{"aujourd'hui"}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI Tips */}
        {tips.length > 0 && (
          <div className="p-3 rounded-xl bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0">
                <Lightbulb className="h-4 w-4 text-purple-400" />
              </div>
              <div>
                <p className="text-white font-medium text-sm mb-1">Conseil VIXUAL</p>
                <p className="text-white/60 text-xs">{tips[0]}</p>
              </div>
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="flex gap-2 pt-2">
          <Link href="/dashboard/creator" className="flex-1">
            <Button 
              variant="outline" 
              className="w-full border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Progression detaillee
            </Button>
          </Link>
          <Link href="/upload">
            <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white">
              <Upload className="h-4 w-4 mr-2" />
              Publier
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
