"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  BarChart3,
  Clock,
  Award,
  History,
  Film,
  FileText,
  Mic,
  ArrowLeft,
  Trophy,
  Users,
  Play,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth-context"
import { VisualHeader } from "@/components/vixual-header"
import { Footer } from "@/components/footer"
import {
  type CreatorProgressState,
  type CreatorStats,
  type ProgressGoal,
  type ContentImpact,
  type ProgressHistory,
  type CreatorType,
  getLevelInfo,
  calculateProgressToNextLevel,
  getPointsToNextLevel,
  buildCreatorGoals,
  generateCreatorTips,
  getMockCreatorStats,
  getMockCreatorProgress,
  getMockContentImpacts,
  getMockProgressHistory,
  CREATOR_LEVELS,
  canAccessCreatorProPage,
} from "@/lib/creator-progression"

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

const creatorTypeConfig: Record<CreatorType, { label: string; icon: typeof Film; color: string }> = {
  // VERROU FINAL: cles officielles
  creator: { label: "Createur", icon: Film, color: "purple" },
  infoporteur: { label: "Infoporteur", icon: FileText, color: "sky" },
  podcasteur: { label: "Podcasteur", icon: Mic, color: "emerald" },
}

export default function CreatorDashboardPage() {
  const router = useRouter()
  const { user, roles, isAuthed } = useAuth()
  
  const [progress, setProgress] = useState<CreatorProgressState | null>(null)
  const [stats, setStats] = useState<CreatorStats | null>(null)
  const [goals, setGoals] = useState<ProgressGoal[]>([])
  const [tips, setTips] = useState<string[]>([])
  const [topContents, setTopContents] = useState<ContentImpact[]>([])
  const [history, setHistory] = useState<ProgressHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")

  // Determine creator type
  // VERROU FINAL: cles officielles
  const isCreator = roles.includes("creator")
  const isInfoporteur = roles.includes("infoporteur")
  const isPodcasteur = roles.includes("podcasteur")
  const hasCreatorRole = isCreator || isInfoporteur || isPodcasteur

  const creatorType: CreatorType = isCreator ? "creator" : isInfoporteur ? "infoporteur" : "podcasteur"
  const creatorConfig = creatorTypeConfig[creatorType]

  useEffect(() => {
    if (!isAuthed || !hasCreatorRole) {
      return
    }

    const timer = setTimeout(() => {
      const userId = user?.id || "user_123"
      const mockProgress = getMockCreatorProgress(userId, creatorType)
      const mockStats = getMockCreatorStats(userId, creatorType)
      const mockGoals = buildCreatorGoals(mockStats, mockProgress.level)
      const mockTips = generateCreatorTips(mockStats, mockProgress.level)
      const mockContents = getMockContentImpacts(userId)
      const mockHistory = getMockProgressHistory(userId)

      setProgress(mockProgress)
      setStats(mockStats)
      setGoals(mockGoals)
      setTips(mockTips)
      setTopContents(mockContents)
      setHistory(mockHistory)
      setLoading(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [isAuthed, hasCreatorRole, user?.id, creatorType])

  // Not authenticated
  if (!isAuthed) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
        <VisualHeader />
        <main className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Connexion requise</h1>
          <p className="text-white/60 mb-8">Connectez-vous pour acceder a votre espace createur.</p>
          <Link href="/login">
            <Button className="bg-purple-600 hover:bg-purple-500 text-white">
              Se connecter
            </Button>
          </Link>
        </main>
        <Footer />
      </div>
    )
  }

  // Not a creator
  if (!hasCreatorRole) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
        <VisualHeader />
        <main className="container mx-auto px-4 py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-6">
            <Sparkles className="h-8 w-8 text-purple-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-4">Espace reserve aux createurs</h1>
          <p className="text-white/60 mb-8 max-w-md mx-auto">
            Cet espace est reserve aux profils porteur, infoporteur et podcasteur.
            Devenez createur pour acceder a votre progression.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/guide-profiles">
              <Button className="bg-purple-600 hover:bg-purple-500 text-white">
                Devenir createur
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                Retour au dashboard
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (loading || !progress || !stats) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
        <VisualHeader />
        <main className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-white/10 rounded w-1/3" />
            <div className="h-40 bg-white/10 rounded-xl" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="h-32 bg-white/10 rounded-xl" />
              <div className="h-32 bg-white/10 rounded-xl" />
              <div className="h-32 bg-white/10 rounded-xl" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const levelInfo = getLevelInfo(progress.level)
  const nextLevelInfo = progress.level < 5 ? getLevelInfo(progress.level + 1) : null
  const progressPercent = calculateProgressToNextLevel(progress.score, progress.level)
  const pointsToNext = getPointsToNextLevel(progress.score, progress.level)
  const isElite = canAccessCreatorProPage(progress.level)

  // Calculate week trend
  const weekTrend = stats.growth > 5 ? "up" : stats.growth < -5 ? "down" : "stable"
  const weekTrendColor = weekTrend === "up" ? "text-emerald-400" : weekTrend === "down" ? "text-red-400" : "text-white/50"

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <VisualHeader />
      
      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <Link href="/dashboard" className="inline-flex items-center gap-2 text-white/50 hover:text-white text-sm mb-2">
              <ArrowLeft className="h-4 w-4" />
              Retour au dashboard
            </Link>
            <div className="flex items-center gap-3">
              <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", 
                creatorConfig.color === "purple" ? "bg-purple-500/20" :
                creatorConfig.color === "sky" ? "bg-sky-500/20" : "bg-emerald-500/20"
              )}>
                <creatorConfig.icon className={cn("h-5 w-5",
                  creatorConfig.color === "purple" ? "text-purple-400" :
                  creatorConfig.color === "sky" ? "text-sky-400" : "text-emerald-400"
                )} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Ma Progression Createur</h1>
                <p className="text-white/50 text-sm">Profil {creatorConfig.label}</p>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            {isElite && (
              <Link href={`/creator-pro/${user?.id}`}>
                <Button className="bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 text-white gap-2">
                  <Crown className="h-4 w-4" />
                  Ma Page PRO
                </Button>
              </Link>
            )}
            <Link href="/upload">
              <Button className="bg-purple-600 hover:bg-purple-500 text-white gap-2">
                <Upload className="h-4 w-4" />
                Publier
              </Button>
            </Link>
          </div>
        </div>

        {/* Main Level Card */}
        <Card className="bg-slate-900/60 border-white/10 overflow-hidden">
          <div className={cn("h-2 bg-gradient-to-r", levelGradientMap[progress.badgeColor])} />
          <CardContent className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Level Info */}
              <div className="lg:col-span-2">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      {isElite ? (
                        <Crown className="h-8 w-8 text-amber-400" />
                      ) : (
                        <Award className={cn("h-8 w-8", `text-${progress.badgeColor}-400`)} />
                      )}
                      <div>
                        <h2 className="text-2xl font-bold text-white">{levelInfo.name}</h2>
                        <Badge className={cn("font-medium mt-1", badgeColorMap[progress.badgeColor])}>
                          {progress.badge}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-white/60 text-sm max-w-md">{levelInfo.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-4xl font-bold text-white">{progress.score}</p>
                    <p className="text-white/40 text-sm">points de progression</p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/70 flex items-center gap-2">
                      <span className={cn("w-3 h-3 rounded-full bg-gradient-to-r", levelGradientMap[progress.badgeColor])} />
                      Niveau {progress.level}
                    </span>
                    {nextLevelInfo ? (
                      <span className="text-white/50">Niveau {progress.level + 1}</span>
                    ) : (
                      <span className="text-amber-400 font-medium">Niveau Maximum Atteint</span>
                    )}
                  </div>
                  <div className="relative h-4 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className={cn(
                        "absolute top-0 left-0 h-full rounded-full bg-gradient-to-r transition-all duration-700",
                        levelGradientMap[progress.badgeColor]
                      )}
                      style={{ width: `${progressPercent}%` }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-white text-xs font-medium drop-shadow-lg">{progressPercent}%</span>
                    </div>
                  </div>
                  {nextLevelInfo && (
                    <p className="text-white/60 text-sm">
                      Encore <strong className="text-white">{pointsToNext}</strong> points pour atteindre <strong className="text-white">{nextLevelInfo.name}</strong>
                    </p>
                  )}
                </div>
              </div>

              {/* Week Stats */}
              <div className="space-y-4">
                <h3 className="text-white font-medium flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-purple-400" />
                  Cette semaine
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-slate-800/50 border border-white/5">
                    <Eye className="h-4 w-4 text-sky-400 mb-2" />
                    <p className="text-xl font-bold text-white">{stats.views}</p>
                    <p className="text-white/40 text-xs">Vues</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-800/50 border border-white/5">
                    <Heart className="h-4 w-4 text-rose-400 mb-2" />
                    <p className="text-xl font-bold text-white">{stats.contributions}</p>
                    <p className="text-white/40 text-xs">Soutiens</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-800/50 border border-white/5">
                    <MessageCircle className="h-4 w-4 text-emerald-400 mb-2" />
                    <p className="text-xl font-bold text-white">{stats.interactions}</p>
                    <p className="text-white/40 text-xs">Interactions</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-800/50 border border-white/5">
                    <div className="flex items-center gap-1 mb-2">
                      {weekTrend === "up" ? <TrendingUp className="h-4 w-4 text-emerald-400" /> :
                       weekTrend === "down" ? <TrendingDown className="h-4 w-4 text-red-400" /> :
                       <Minus className="h-4 w-4 text-white/40" />}
                    </div>
                    <p className={cn("text-xl font-bold", weekTrendColor)}>
                      {stats.growth > 0 ? "+" : ""}{Math.round(stats.growth)}%
                    </p>
                    <p className="text-white/40 text-xs">Tendance</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Elite Banner */}
        {isElite && (
          <Card className="bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-purple-500/10 border-amber-500/20 overflow-hidden">
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-500 to-rose-500 flex items-center justify-center shrink-0">
                  <Crown className="h-7 w-7 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-bold text-lg">Felicitations, vous etes Elite VIXUAL !</h3>
                  <p className="text-white/60 text-sm">
                    Vous avez atteint le plus haut niveau de progression. Votre page PRO speciale est maintenant accessible a tous.
                  </p>
                </div>
                <Link href={`/creator-pro/${user?.id}`}>
                  <Button className="bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 text-white gap-2">
                    <Crown className="h-4 w-4" />
                    Voir ma page PRO
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-slate-900/60 border border-white/10">
            <TabsTrigger value="overview" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400">
              Vue d&apos;ensemble
            </TabsTrigger>
            <TabsTrigger value="goals" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400">
              Objectifs
            </TabsTrigger>
            <TabsTrigger value="contents" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400">
              Mes contenus
            </TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400">
              Historique
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-6 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Goals Preview */}
              <Card className="bg-slate-900/60 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2 text-base">
                    <Target className="h-5 w-5 text-emerald-400" />
                    Objectifs pour progresser
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {goals.length > 0 ? (
                    goals.map((goal) => {
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
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <GoalIcon className={cn(
                                "h-4 w-4",
                                goal.priority === "high" ? "text-amber-400" : "text-white/50"
                              )} />
                              <span className="text-white/80 text-sm">{goal.label}</span>
                            </div>
                            <span className="text-white/50 text-xs">
                              {goal.current}/{goal.target}
                            </span>
                          </div>
                          <Progress value={goal.progress} className="h-2 bg-white/10" />
                        </div>
                      )
                    })
                  ) : (
                    <p className="text-white/50 text-sm text-center py-4">
                      Tous les objectifs sont atteints ! Continuez ainsi.
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Tips */}
              <Card className="bg-slate-900/60 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2 text-base">
                    <Lightbulb className="h-5 w-5 text-purple-400" />
                    Conseils VIXUAL
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {tips.map((tip, index) => (
                    <div 
                      key={index}
                      className="p-3 rounded-lg bg-purple-500/5 border border-purple-500/20"
                    >
                      <div className="flex items-start gap-3">
                        <Sparkles className="h-4 w-4 text-purple-400 mt-0.5 shrink-0" />
                        <p className="text-white/70 text-sm">{tip}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Level Roadmap */}
            <Card className="bg-slate-900/60 border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2 text-base">
                  <Trophy className="h-5 w-5 text-amber-400" />
                  Parcours de progression
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between overflow-x-auto pb-2">
                  {CREATOR_LEVELS.map((level, index) => {
                    const isActive = progress.level === level.level
                    const isPast = progress.level > level.level
                    const isFuture = progress.level < level.level
                    
                    return (
                      <div key={level.key} className="flex items-center">
                        <div className="flex flex-col items-center">
                          <div className={cn(
                            "w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all",
                            isActive ? `bg-gradient-to-br ${levelGradientMap[level.badgeColor]} border-white/30` :
                            isPast ? "bg-emerald-500/20 border-emerald-500/50" :
                            "bg-slate-800 border-white/10"
                          )}>
                            {level.level === 5 ? (
                              <Crown className={cn("h-5 w-5", isActive || isPast ? "text-white" : "text-white/30")} />
                            ) : (
                              <span className={cn("text-lg font-bold", isActive || isPast ? "text-white" : "text-white/30")}>
                                {level.level}
                              </span>
                            )}
                          </div>
                          <p className={cn(
                            "text-xs mt-2 text-center max-w-[80px]",
                            isActive ? "text-white font-medium" : isPast ? "text-emerald-400" : "text-white/40"
                          )}>
                            {level.name}
                          </p>
                          <p className="text-white/30 text-xs mt-0.5">{level.minScore} pts</p>
                        </div>
                        {index < CREATOR_LEVELS.length - 1 && (
                          <div className={cn(
                            "w-8 lg:w-16 h-0.5 mx-2",
                            isPast ? "bg-emerald-500" : "bg-white/10"
                          )} />
                        )}
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Goals Tab */}
          <TabsContent value="goals" className="mt-6">
            <Card className="bg-slate-900/60 border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Target className="h-5 w-5 text-emerald-400" />
                  Tous vos objectifs
                </CardTitle>
              </CardHeader>
              <CardContent>
                {goals.length > 0 ? (
                  <div className="space-y-4">
                    {goals.map((goal) => {
                      const GoalIcon = goalIconMap[goal.icon] || Target
                      return (
                        <div 
                          key={goal.id}
                          className={cn(
                            "p-4 rounded-xl border",
                            goal.priority === "high" 
                              ? "bg-amber-500/5 border-amber-500/20" 
                              : "bg-slate-800/50 border-white/5"
                          )}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className={cn(
                                "w-10 h-10 rounded-full flex items-center justify-center",
                                goal.priority === "high" ? "bg-amber-500/20" : "bg-white/10"
                              )}>
                                <GoalIcon className={cn(
                                  "h-5 w-5",
                                  goal.priority === "high" ? "text-amber-400" : "text-white/50"
                                )} />
                              </div>
                              <div>
                                <p className="text-white font-medium">{goal.label}</p>
                                <Badge variant="outline" className={cn(
                                  "text-xs mt-1",
                                  goal.priority === "high" ? "border-amber-500/30 text-amber-400" :
                                  goal.priority === "medium" ? "border-purple-500/30 text-purple-400" :
                                  "border-white/20 text-white/50"
                                )}>
                                  {goal.priority === "high" ? "Priorite haute" :
                                   goal.priority === "medium" ? "Priorite moyenne" : "Optionnel"}
                                </Badge>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-bold text-white">{goal.progress}%</p>
                              <p className="text-white/40 text-xs">{goal.current}/{goal.target}</p>
                            </div>
                          </div>
                          <Progress value={goal.progress} className="h-2 bg-white/10" />
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                      <Trophy className="h-8 w-8 text-emerald-400" />
                    </div>
                    <p className="text-white font-medium">Tous les objectifs sont atteints !</p>
                    <p className="text-white/50 text-sm mt-1">Continuez a publier pour maintenir votre progression.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Contents Tab */}
          <TabsContent value="contents" className="mt-6">
            <Card className="bg-slate-900/60 border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Star className="h-5 w-5 text-amber-400" />
                  Impact de vos contenus
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topContents.map((content) => (
                    <div 
                      key={content.contentId}
                      className="p-4 rounded-xl bg-slate-800/50 border border-white/5 hover:border-white/10 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "w-12 h-12 rounded-lg flex items-center justify-center",
                            content.trend === "up" ? "bg-emerald-500/20" :
                            content.trend === "down" ? "bg-red-500/20" : "bg-white/10"
                          )}>
                            {content.trend === "up" ? <TrendingUp className="h-5 w-5 text-emerald-400" /> :
                             content.trend === "down" ? <TrendingDown className="h-5 w-5 text-red-400" /> :
                             <Minus className="h-5 w-5 text-white/40" />}
                          </div>
                          <div>
                            <p className="text-white font-medium">{content.contentTitle}</p>
                            <p className="text-white/50 text-sm">{content.message}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={cn(
                            "text-2xl font-bold",
                            content.trend === "up" ? "text-emerald-400" :
                            content.trend === "down" ? "text-red-400" : "text-white"
                          )}>
                            +{content.pointsToday}
                          </p>
                          <p className="text-white/40 text-xs">{"points aujourd'hui"}</p>
                          <p className="text-white/30 text-xs">{content.pointsTotal} pts au total</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 text-center">
                  <Link href="/dashboard/projects">
                    <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                      Voir tous mes contenus
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="mt-6">
            <Card className="bg-slate-900/60 border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <History className="h-5 w-5 text-purple-400" />
                  Historique de progression
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {history.map((entry, index) => {
                    const isLevelUp = entry.levelAfter > entry.levelBefore
                    const pointsGained = entry.scoreAfter - entry.scoreBefore
                    
                    return (
                      <div 
                        key={entry.id}
                        className={cn(
                          "p-4 rounded-xl border",
                          isLevelUp ? "bg-gradient-to-r from-purple-500/10 to-amber-500/10 border-purple-500/20" :
                          "bg-slate-800/50 border-white/5"
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "w-10 h-10 rounded-full flex items-center justify-center",
                              isLevelUp ? "bg-gradient-to-br from-purple-500 to-amber-500" : "bg-white/10"
                            )}>
                              {isLevelUp ? (
                                <Zap className="h-5 w-5 text-white" />
                              ) : (
                                <TrendingUp className="h-5 w-5 text-emerald-400" />
                              )}
                            </div>
                            <div>
                              <p className={cn(
                                "font-medium",
                                isLevelUp ? "text-white" : "text-white/80"
                              )}>
                                {entry.reason}
                              </p>
                              <p className="text-white/40 text-xs">
                                {new Date(entry.date).toLocaleDateString("fr-FR", {
                                  day: "numeric",
                                  month: "long",
                                  year: "numeric"
                                })}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-emerald-400 font-bold">+{pointsGained} pts</p>
                            <p className="text-white/40 text-xs">
                              {entry.scoreBefore} → {entry.scoreAfter}
                            </p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      
      <Footer />
    </div>
  )
}
