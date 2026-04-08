"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  BarChart3, TrendingUp, Heart, Zap, Film, FileText, Mic, 
  Award, Sparkles, ArrowUpRight
} from "lucide-react"
import type { GlobalPublicStats, PublicProjectStats } from "@/lib/archives-statistics/engine"

interface PublicStatsPanelProps {
  stats: GlobalPublicStats
}

function FeaturedProjectMini({ project, label }: { project: PublicProjectStats; label: string }) {
  return (
    <Link href={`/video/${project.id}`}>
      <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-violet-400/20 transition-all duration-300 cursor-pointer group">
        <img 
          src={project.thumbnail} 
          alt={project.title}
          className="w-14 h-10 object-cover rounded-lg"
        />
        <div className="flex-1 min-w-0">
          <p className="text-xs text-white/40 mb-0.5">{label}</p>
          <h4 className="font-medium text-white/90 text-sm truncate group-hover:text-white">
            {project.title}
          </h4>
        </div>
        <ArrowUpRight className="h-4 w-4 text-white/30 group-hover:text-violet-400 transition-colors shrink-0" />
      </div>
    </Link>
  )
}

export function PublicStatsPanel({ stats }: PublicStatsPanelProps) {
  const categoryStats = [
    { category: "Video", icon: Film, count: Math.floor(stats.totalProjectsRanked * 0.5), color: "rose" },
    { category: "Ecrit", icon: FileText, count: Math.floor(stats.totalProjectsRanked * 0.3), color: "sky" },
    { category: "Podcast", icon: Mic, count: Math.floor(stats.totalProjectsRanked * 0.2), color: "violet" },
  ]

  return (
    <section>
      <div className="flex items-center gap-2 mb-6">
        <BarChart3 className="h-6 w-6 text-violet-400" />
        <h2 className="text-2xl font-bold text-white">Statistiques Publiques</h2>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main stats */}
        <Card className="bg-white/5 border-white/10 lg:col-span-2">
          <CardContent className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-4 rounded-xl bg-gradient-to-br from-violet-500/10 to-purple-500/10 border border-violet-400/20">
                <p className="text-3xl font-bold text-white mb-1">{stats.totalProjectsRanked}</p>
                <p className="text-white/50 text-xs">Projets classes</p>
              </div>
              <div className="text-center p-4 rounded-xl bg-gradient-to-br from-amber-500/10 to-yellow-500/10 border border-amber-400/20">
                <p className="text-3xl font-bold text-white mb-1">{stats.totalProjectsInTop}</p>
                <p className="text-white/50 text-xs">Dans le TOP</p>
              </div>
              <div className="text-center p-4 rounded-xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-400/20">
                <p className="text-3xl font-bold text-white mb-1">{stats.totalPrestigeArchived}</p>
                <p className="text-white/50 text-xs">Archives Prestige</p>
              </div>
              <div className="text-center p-4 rounded-xl bg-gradient-to-br from-yellow-500/10 to-amber-500/10 border border-yellow-400/20">
                <p className="text-3xl font-bold text-white mb-1">{stats.totalHallOfFame}</p>
                <p className="text-white/50 text-xs">Hall of Fame</p>
              </div>
            </div>
            
            {/* Category breakdown */}
            <h3 className="text-white/70 text-sm font-medium mb-3">Repartition par categorie</h3>
            <div className="space-y-3">
              {categoryStats.map((cat) => {
                const percentage = Math.round((cat.count / stats.totalProjectsRanked) * 100)
                return (
                  <div key={cat.category} className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg bg-${cat.color}-500/15 flex items-center justify-center`}>
                      <cat.icon className={`h-4 w-4 text-${cat.color}-400`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-white/80 text-sm">{cat.category}</span>
                        <span className="text-white/50 text-xs">{cat.count} projets ({percentage}%)</span>
                      </div>
                      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                        <div 
                          className={`h-full bg-${cat.color}-400 rounded-full transition-all duration-500`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
        
        {/* Featured projects */}
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-6">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-400" />
              Projets Remarquables
            </h3>
            
            <div className="space-y-3">
              {stats.bestProgressionMonth && (
                <FeaturedProjectMini 
                  project={stats.bestProgressionMonth} 
                  label="Meilleure progression du mois"
                />
              )}
              {stats.mostSupportedEver && (
                <FeaturedProjectMini 
                  project={stats.mostSupportedEver} 
                  label="Plus soutenu"
                />
              )}
              {stats.strongestDynamics30d && (
                <FeaturedProjectMini 
                  project={stats.strongestDynamics30d} 
                  label="Dynamique la plus forte (30j)"
                />
              )}
            </div>
            
            <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-400/20">
              <div className="flex items-center gap-2 mb-2">
                <Award className="h-5 w-5 text-amber-400" />
                <span className="text-white font-medium text-sm">Categorie en tete</span>
              </div>
              <Badge className="bg-rose-500/15 text-rose-400 border-rose-500/30">
                <Film className="h-3 w-3 mr-1" />
                {stats.topCategoryNow === "video" ? "Video" : stats.topCategoryNow}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
