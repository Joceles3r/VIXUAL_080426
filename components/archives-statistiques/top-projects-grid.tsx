"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Trophy, Crown, Medal, TrendingUp, TrendingDown, Minus, Rocket, 
  Heart, Eye, Film, FileText, Mic, Sparkles, ArrowRight
} from "lucide-react"
import type { PublicProjectStats, PublicTrend, PrestigeLabel } from "@/lib/archives-statistics/engine"
import { PRESTIGE_LABELS_CONFIG, TREND_CONFIG } from "@/lib/archives-statistics/engine"

interface TopProjectsGridProps {
  projects: PublicProjectStats[]
  title?: string
  subtitle?: string
  showViewAll?: boolean
  viewAllHref?: string
  variant?: "default" | "compact" | "featured"
}

const CATEGORY_ICONS = {
  video: Film,
  text: FileText,
  podcast: Mic,
}

const TREND_ICONS: Record<PublicTrend, React.ComponentType<{ className?: string }>> = {
  rising_fast: Rocket,
  rising: TrendingUp,
  stable: Minus,
  falling: TrendingDown,
  falling_fast: TrendingDown,
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <div className="absolute -top-2 -left-2 w-10 h-10 rounded-xl bg-gradient-to-br from-amber-300 to-yellow-500 flex items-center justify-center shadow-lg shadow-amber-400/40 z-10">
        <Crown className="h-5 w-5 text-white" />
      </div>
    )
  }
  if (rank === 2) {
    return (
      <div className="absolute -top-2 -left-2 w-9 h-9 rounded-xl bg-gradient-to-br from-slate-300 to-slate-400 flex items-center justify-center shadow-lg shadow-slate-400/30 z-10">
        <Medal className="h-4 w-4 text-white" />
      </div>
    )
  }
  if (rank === 3) {
    return (
      <div className="absolute -top-2 -left-2 w-9 h-9 rounded-xl bg-gradient-to-br from-orange-400 to-amber-600 flex items-center justify-center shadow-lg shadow-orange-400/30 z-10">
        <Medal className="h-4 w-4 text-white" />
      </div>
    )
  }
  return (
    <div className="absolute -top-2 -left-2 w-8 h-8 rounded-lg bg-violet-500/20 border border-violet-400/30 flex items-center justify-center z-10">
      <span className="text-violet-300 font-bold text-xs">{rank}</span>
    </div>
  )
}

function TrendBadge({ trend, delta }: { trend: PublicTrend; delta: number }) {
  const config = TREND_CONFIG[trend]
  const Icon = TREND_ICONS[trend]
  
  const colorClasses: Record<string, string> = {
    emerald: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    green: "bg-green-500/15 text-green-400 border-green-500/30",
    slate: "bg-slate-500/15 text-slate-400 border-slate-500/30",
    orange: "bg-orange-500/15 text-orange-400 border-orange-500/30",
    red: "bg-red-500/15 text-red-400 border-red-500/30",
  }
  
  return (
    <Badge className={`${colorClasses[config.color]} text-xs gap-1`}>
      <Icon className="h-3 w-3" />
      {delta > 0 ? `+${delta}` : delta}
    </Badge>
  )
}

function PrestigeBadge({ label }: { label: PrestigeLabel }) {
  const config = PRESTIGE_LABELS_CONFIG[label]
  
  const colorClasses: Record<string, string> = {
    amber: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    emerald: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    rose: "bg-rose-500/15 text-rose-400 border-rose-500/30",
    violet: "bg-violet-500/15 text-violet-400 border-violet-500/30",
    sky: "bg-sky-500/15 text-sky-400 border-sky-500/30",
    yellow: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
    purple: "bg-purple-500/15 text-purple-400 border-purple-500/30",
  }
  
  return (
    <Badge className={`${colorClasses[config.color]} text-xs`}>
      {config.label}
    </Badge>
  )
}

function ProjectCard({ project, variant = "default" }: { project: PublicProjectStats; variant?: "default" | "compact" | "featured" }) {
  const CategoryIcon = CATEGORY_ICONS[project.category]
  const projectHref = project.id ? `/video/${project.id}` : `/archives-statistiques/${project.slug || project.id}`
  
  if (variant === "compact") {
    return (
      <Link href={projectHref}>
        <Card className="bg-white/5 border-white/10 hover:bg-white/10 hover:border-violet-400/30 transition-all duration-300 cursor-pointer">
          <CardContent className="p-4 flex items-center gap-4">
            {project.publicRank && (
              <div className="w-8 h-8 rounded-lg bg-violet-500/15 border border-violet-400/25 flex items-center justify-center shrink-0">
                <span className="text-violet-300 font-bold text-sm">{project.publicRank}</span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-white/90 truncate text-sm">{project.title}</h3>
              <p className="text-white/40 text-xs truncate">{project.creatorName}</p>
            </div>
            <TrendBadge trend={project.trend} delta={project.trendDelta} />
          </CardContent>
        </Card>
      </Link>
    )
  }
  
  return (
    <Link href={projectHref}>
      <Card className={`relative overflow-hidden bg-white/5 border-white/10 hover:bg-white/10 hover:border-violet-400/30 
        transition-all duration-300 cursor-pointer group ${project.publicRank && project.publicRank <= 3 ? "border-amber-400/20" : ""}`}>
        {project.publicRank && <RankBadge rank={project.publicRank} />}
        
        <CardContent className="p-0">
          {/* Thumbnail */}
          <div className="relative aspect-video overflow-hidden">
            <img 
              src={project.thumbnail} 
              alt={project.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            
            {/* Category badge */}
            <div className="absolute top-3 right-3">
              <div className="w-8 h-8 rounded-lg bg-black/50 backdrop-blur-sm flex items-center justify-center">
                <CategoryIcon className="h-4 w-4 text-white/80" />
              </div>
            </div>
            
            {/* Stats overlay */}
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
              <div className="flex items-center gap-3 text-white/70 text-xs">
                <span className="flex items-center gap-1">
                  <Heart className="h-3 w-3" />
                  {project.publicSupportCount}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  {project.publicQualifiedViews.toLocaleString()}
                </span>
              </div>
              <TrendBadge trend={project.trend} delta={project.trendDelta} />
            </div>
          </div>
          
          {/* Content */}
          <div className="p-4">
            <h3 className="font-semibold text-white/90 truncate group-hover:text-white transition-colors mb-1">
              {project.title}
            </h3>
            <p className="text-white/40 text-sm truncate mb-3">{project.creatorName}</p>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {project.prestigeLabel && <PrestigeBadge label={project.prestigeLabel} />}
                {project.hallOfFame && (
                  <Badge className="bg-yellow-500/15 text-yellow-400 border-yellow-500/30 text-xs gap-1">
                    <Crown className="h-3 w-3" />
                    Hall of Fame
                  </Badge>
                )}
              </div>
              <span className="text-white/30 text-sm">{project.publicScore} pts</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

export function TopProjectsGrid({ 
  projects, 
  title = "Top Projets du Moment", 
  subtitle,
  showViewAll = false,
  viewAllHref = "/leaderboard",
  variant = "default"
}: TopProjectsGridProps) {
  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Trophy className="h-6 w-6 text-amber-400" />
            {title}
          </h2>
          {subtitle && <p className="text-white/50 mt-1">{subtitle}</p>}
        </div>
        
        {showViewAll && (
          <Link 
            href={viewAllHref}
            className="flex items-center gap-1 text-violet-400 hover:text-violet-300 text-sm transition-colors"
          >
            Voir tout
            <ArrowRight className="h-4 w-4" />
          </Link>
        )}
      </div>
      
      <div className={variant === "compact" 
        ? "space-y-3" 
        : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
      }>
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} variant={variant} />
        ))}
      </div>
    </section>
  )
}
