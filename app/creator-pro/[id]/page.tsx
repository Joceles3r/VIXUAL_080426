"use client"

import { useState, useEffect, use } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Crown,
  Star,
  Eye,
  Heart,
  MessageCircle,
  Play,
  Film,
  FileText,
  Mic,
  ArrowLeft,
  Trophy,
  Users,
  TrendingUp,
  Award,
  Sparkles,
  ExternalLink,
  Share2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { VisualHeader } from "@/components/visual-header"
import { Footer } from "@/components/footer"
import { useAuth } from "@/lib/auth-context"
import {
  type CreatorType,
  type CreatorProgressState,
  getMockCreatorProgress,
  getMockCreatorStats,
  getMockContentImpacts,
  getLevelInfo,
  canAccessCreatorProPage,
  CREATOR_LEVELS,
} from "@/lib/creator-progression"

const creatorTypeConfig: Record<CreatorType, { label: string; icon: typeof Film; color: string }> = {
  porter: { label: "Porteur", icon: Film, color: "purple" },
  infoporter: { label: "Infoporteur", icon: FileText, color: "sky" },
  podcaster: { label: "Podcasteur", icon: Mic, color: "emerald" },
}

// Mock featured contents for the PRO page
const MOCK_FEATURED_CONTENTS = [
  {
    id: "1",
    title: "Le Grand Film",
    thumbnail: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&h=225&fit=crop",
    views: 15420,
    likes: 892,
    type: "video",
  },
  {
    id: "2",
    title: "Making-of Exclusif",
    thumbnail: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400&h=225&fit=crop",
    views: 8930,
    likes: 543,
    type: "video",
  },
  {
    id: "3",
    title: "Interview du Realisateur",
    thumbnail: "https://images.unsplash.com/photo-1598387993441-a364f854c3e1?w=400&h=225&fit=crop",
    views: 6210,
    likes: 421,
    type: "video",
  },
]

export default function CreatorProPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const { user, isAuthed } = useAuth()
  
  const [creatorData, setCreatorData] = useState<{
    progress: CreatorProgressState
    stats: ReturnType<typeof getMockCreatorStats>
    isOwner: boolean
  } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      // Mock: simulate fetching creator data
      const creatorId = resolvedParams.id
      const creatorType: CreatorType = "porter" // Default to porter for demo
      const progress = getMockCreatorProgress(creatorId, creatorType)
      const stats = getMockCreatorStats(creatorId, creatorType)
      
      // Override to level 5 for demo purposes on PRO page
      progress.level = 5
      progress.levelKey = "elite"
      progress.badge = "Elite VIXUAL"
      progress.badgeColor = "rose"
      progress.proUnlocked = true
      progress.score = 1250

      setCreatorData({
        progress,
        stats,
        isOwner: user?.id === creatorId,
      })
      setLoading(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [resolvedParams.id, user?.id])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
        <VisualHeader />
        <main className="container mx-auto px-4 py-16">
          <div className="animate-pulse space-y-8">
            <div className="h-64 bg-white/10 rounded-2xl" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="h-40 bg-white/10 rounded-xl" />
              <div className="h-40 bg-white/10 rounded-xl" />
              <div className="h-40 bg-white/10 rounded-xl" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (!creatorData || !canAccessCreatorProPage(creatorData.progress.level)) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
        <VisualHeader />
        <main className="container mx-auto px-4 py-16 text-center">
          <div className="w-20 h-20 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto mb-6">
            <Crown className="h-10 w-10 text-amber-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-4">Page PRO Elite reservee</h1>
          <p className="text-white/60 mb-8 max-w-md mx-auto">
            Cette page est reservee aux createurs ayant atteint le niveau Elite VIXUAL.
            Continuez a progresser pour debloquer cette vitrine exclusive.
          </p>
          <Link href="/dashboard/creator">
            <Button className="bg-purple-600 hover:bg-purple-500 text-white">
              Voir ma progression
            </Button>
          </Link>
        </main>
        <Footer />
      </div>
    )
  }

  const levelInfo = getLevelInfo(creatorData.progress.level)
  const creatorConfig = creatorTypeConfig[creatorData.progress.creatorType]
  const CreatorIcon = creatorConfig.icon

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <VisualHeader />
      
      <main className="container mx-auto px-4 py-8">
        {/* Back link */}
        <Link href="/dashboard/creator" className="inline-flex items-center gap-2 text-white/50 hover:text-white text-sm mb-6">
          <ArrowLeft className="h-4 w-4" />
          Retour a ma progression
        </Link>

        {/* Hero Section */}
        <div className="relative rounded-3xl overflow-hidden mb-8">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-amber-600/30 via-rose-600/30 to-purple-600/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
          
          {/* Decorative elements */}
          <div className="absolute top-10 right-10 w-32 h-32 bg-amber-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-10 left-10 w-40 h-40 bg-rose-500/20 rounded-full blur-3xl" />
          
          <div className="relative p-8 md:p-12">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              {/* Creator Avatar */}
              <div className="relative">
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-amber-500 to-rose-500 p-1">
                  <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center">
                    <Crown className="h-12 w-12 md:h-16 md:w-16 text-amber-400" />
                  </div>
                </div>
                <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-rose-500 flex items-center justify-center">
                  <Star className="h-5 w-5 text-white" />
                </div>
              </div>
              
              {/* Creator Info */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <Badge className="bg-gradient-to-r from-amber-500/30 to-rose-500/30 text-amber-400 border-amber-500/50 px-3 py-1">
                    <Crown className="h-3 w-3 mr-1" />
                    Elite VIXUAL
                  </Badge>
                  <Badge variant="outline" className="border-white/20 text-white/70">
                    <CreatorIcon className="h-3 w-3 mr-1" />
                    {creatorConfig.label}
                  </Badge>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                  Createur Elite
                </h1>
                <p className="text-white/60 max-w-xl">
                  Un des meilleurs createurs de la plateforme VIXUAL. 
                  Reconnu pour la qualite exceptionnelle de ses contenus et son impact sur la communaute.
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 md:gap-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-white">{creatorData.stats.views.toLocaleString()}</p>
                  <p className="text-white/50 text-sm">Vues totales</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-white">{creatorData.stats.contributions}</p>
                  <p className="text-white/50 text-sm">Soutiens</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-white">{creatorData.stats.totalContents}</p>
                  <p className="text-white/50 text-sm">Contenus</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Elite Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-amber-500/10 to-amber-500/5 border-amber-500/20">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                  <Trophy className="h-5 w-5 text-amber-400" />
                </div>
                <span className="text-white font-medium">Score Elite</span>
              </div>
              <p className="text-3xl font-bold text-white">{creatorData.progress.score}</p>
              <p className="text-amber-400/70 text-sm mt-1">Top 1% des createurs</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-purple-400" />
                </div>
                <span className="text-white font-medium">Croissance</span>
              </div>
              <p className="text-3xl font-bold text-emerald-400">+{Math.abs(creatorData.stats.growth)}%</p>
              <p className="text-purple-400/70 text-sm mt-1">Ce mois</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-rose-500/10 to-rose-500/5 border-rose-500/20">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-rose-500/20 flex items-center justify-center">
                  <Heart className="h-5 w-5 text-rose-400" />
                </div>
                <span className="text-white font-medium">Engagement</span>
              </div>
              <p className="text-3xl font-bold text-white">{creatorData.stats.engagement}</p>
              <p className="text-rose-400/70 text-sm mt-1">Interactions</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-sky-500/10 to-sky-500/5 border-sky-500/20">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-sky-500/20 flex items-center justify-center">
                  <Users className="h-5 w-5 text-sky-400" />
                </div>
                <span className="text-white font-medium">Regularite</span>
              </div>
              <p className="text-3xl font-bold text-white">{Math.round(creatorData.stats.regularity)}%</p>
              <p className="text-sky-400/70 text-sm mt-1">Constance</p>
            </CardContent>
          </Card>
        </div>

        {/* Featured Contents */}
        <Card className="bg-slate-900/60 border-white/10 mb-8">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-400" />
              Contenus mis en avant
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {MOCK_FEATURED_CONTENTS.map((content) => (
                <Link key={content.id} href={`/video/${content.id}`}>
                  <div className="group relative rounded-xl overflow-hidden bg-slate-800 border border-white/5 hover:border-amber-500/30 transition-all">
                    <div className="aspect-video relative">
                      <img 
                        src={content.thumbnail} 
                        alt={content.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                      <div className="absolute bottom-3 left-3 right-3">
                        <p className="text-white font-medium truncate">{content.title}</p>
                        <div className="flex items-center gap-3 mt-1 text-white/60 text-xs">
                          <span className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {content.views.toLocaleString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Heart className="h-3 w-3" />
                            {content.likes}
                          </span>
                        </div>
                      </div>
                      <div className="absolute top-3 right-3">
                        <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:bg-amber-500 transition-colors">
                          <Play className="h-5 w-5 text-white fill-white" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Achievements */}
        <Card className="bg-slate-900/60 border-white/10 mb-8">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Award className="h-5 w-5 text-purple-400" />
              Achievements Elite
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: Crown, label: "Elite VIXUAL", color: "amber", unlocked: true },
                { icon: Trophy, label: "Top Createur", color: "purple", unlocked: true },
                { icon: Star, label: "1000+ Points", color: "rose", unlocked: true },
                { icon: TrendingUp, label: "Croissance x2", color: "emerald", unlocked: true },
              ].map((achievement, index) => (
                <div 
                  key={index}
                  className={cn(
                    "p-4 rounded-xl border text-center",
                    achievement.unlocked 
                      ? `bg-${achievement.color}-500/10 border-${achievement.color}-500/30` 
                      : "bg-slate-800/50 border-white/5 opacity-50"
                  )}
                >
                  <div className={cn(
                    "w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center",
                    achievement.unlocked ? `bg-${achievement.color}-500/20` : "bg-white/10"
                  )}>
                    <achievement.icon className={cn(
                      "h-6 w-6",
                      achievement.unlocked ? `text-${achievement.color}-400` : "text-white/30"
                    )} />
                  </div>
                  <p className={cn(
                    "font-medium text-sm",
                    achievement.unlocked ? "text-white" : "text-white/50"
                  )}>
                    {achievement.label}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-wrap gap-4 justify-center">
          <Button 
            variant="outline" 
            className="border-white/20 text-white hover:bg-white/10 gap-2"
          >
            <Share2 className="h-4 w-4" />
            Partager cette page
          </Button>
          <Link href="/explore">
            <Button className="bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 text-white gap-2">
              <Film className="h-4 w-4" />
              Voir tous les contenus
            </Button>
          </Link>
        </div>
      </main>
      
      <Footer />
    </div>
  )
}
