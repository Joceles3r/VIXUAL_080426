"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Archive, Calendar, ChevronDown, ChevronUp, Trophy, Crown, 
  Medal, Film, FileText, Mic, ArrowRight
} from "lucide-react"
import type { ArchivesByPeriod, PublicProjectStats } from "@/lib/archives-statistics/engine"

interface ArchiveTimelineProps {
  archives: ArchivesByPeriod[]
}

const CATEGORY_ICONS = {
  video: Film,
  text: FileText,
  podcast: Mic,
}

function PeriodCard({ period, isExpanded, onToggle }: { 
  period: ArchivesByPeriod
  isExpanded: boolean
  onToggle: () => void 
}) {
  const top3 = period.projects.slice(0, 3)
  
  return (
    <Card className={`bg-white/5 border-white/10 transition-all duration-300 ${isExpanded ? "border-violet-400/30" : ""}`}>
      <CardContent className="p-0">
        {/* Header */}
        <button 
          onClick={onToggle}
          className="w-full p-5 flex items-center justify-between hover:bg-white/5 transition-colors"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-violet-500/15 border border-violet-400/25 flex items-center justify-center">
              <Calendar className="h-6 w-6 text-violet-400" />
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-white">{period.periodLabel}</h3>
              <p className="text-white/40 text-sm">{period.projects.length} projets archives</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Mini preview of top 3 */}
            <div className="hidden md:flex items-center -space-x-2">
              {top3.map((project, i) => (
                <div 
                  key={project.id}
                  className="w-8 h-8 rounded-lg border-2 border-slate-900 overflow-hidden"
                  style={{ zIndex: 3 - i }}
                >
                  <Image
                    src={project.thumbnail || "/placeholder.svg"}
                    alt=""
                    width={32}
                    height={32}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
            
            {isExpanded ? (
              <ChevronUp className="h-5 w-5 text-white/40" />
            ) : (
              <ChevronDown className="h-5 w-5 text-white/40" />
            )}
          </div>
        </button>
        
        {/* Expanded content */}
        {isExpanded && (
          <div className="px-5 pb-5 border-t border-white/5">
            <div className="pt-5 space-y-3">
              {period.projects.map((project, index) => {
                const CategoryIcon = CATEGORY_ICONS[project.category]
                const rank = index + 1
                
                return (
                  <Link key={project.id} href={`/video/${project.id}`}>
                    <div className="flex items-center gap-4 p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-violet-400/20 transition-all duration-300 cursor-pointer group">
                      {/* Rank */}
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                        rank === 1 ? "bg-gradient-to-br from-amber-300 to-yellow-500" :
                        rank === 2 ? "bg-gradient-to-br from-slate-300 to-slate-400" :
                        rank === 3 ? "bg-gradient-to-br from-orange-400 to-amber-600" :
                        "bg-violet-500/15 border border-violet-400/25"
                      }`}>
                        {rank <= 3 ? (
                          rank === 1 ? <Crown className="h-4 w-4 text-white" /> : <Medal className="h-4 w-4 text-white" />
                        ) : (
                          <span className="text-violet-300 font-bold text-sm">{rank}</span>
                        )}
                      </div>
                      
                      {/* Thumbnail */}
                      <div className="w-16 h-10 rounded-lg overflow-hidden shrink-0">
                        <Image
                          src={project.thumbnail || "/placeholder.svg"}
                          alt={project.title || ""}
                          width={64}
                          height={40}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                      
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-white/90 text-sm truncate group-hover:text-white">
                          {project.title}
                        </h4>
                        <p className="text-white/40 text-xs truncate">{project.creatorName}</p>
                      </div>
                      
                      {/* Category & Score */}
                      <div className="hidden sm:flex items-center gap-3">
                        <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center">
                          <CategoryIcon className="h-3.5 w-3.5 text-white/50" />
                        </div>
                        <span className="text-white/30 text-sm">{project.publicScore} pts</span>
                      </div>
                      
                      <ArrowRight className="h-4 w-4 text-white/20 group-hover:text-violet-400 transition-colors" />
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function ArchiveTimeline({ archives }: ArchiveTimelineProps) {
  const [expandedPeriods, setExpandedPeriods] = useState<Set<string>>(new Set([archives[0]?.periodLabel]))
  
  const togglePeriod = (periodLabel: string) => {
    setExpandedPeriods(prev => {
      const next = new Set(prev)
      if (next.has(periodLabel)) {
        next.delete(periodLabel)
      } else {
        next.add(periodLabel)
      }
      return next
    })
  }

  return (
    <section>
      <div className="flex items-center gap-2 mb-6">
        <Archive className="h-6 w-6 text-emerald-400" />
        <h2 className="text-2xl font-bold text-white">Archives Historiques</h2>
      </div>
      
      <p className="text-white/50 mb-6">
        Retrouvez les meilleurs projets de chaque periode - une memoire vivante de VIXUAL.
      </p>
      
      {/* Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-violet-400/50 via-violet-400/20 to-transparent hidden md:block" />
        
        <div className="space-y-4">
          {archives.map((period) => (
            <div key={period.periodLabel} className="relative md:pl-16">
              {/* Timeline dot */}
              <div className="absolute left-4 top-6 w-4 h-4 rounded-full bg-violet-400 border-4 border-slate-900 hidden md:block" />
              
              <PeriodCard 
                period={period}
                isExpanded={expandedPeriods.has(period.periodLabel)}
                onToggle={() => togglePeriod(period.periodLabel)}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
