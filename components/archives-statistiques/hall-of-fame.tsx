"use client"

import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Crown, Star, Sparkles, Heart, Eye, Trophy, Award, 
  Film, FileText, Mic, ArrowUpRight
} from "lucide-react"
import type { PublicProjectStats } from "@/lib/archives-statistics/engine"

interface HallOfFameProps {
  projects: PublicProjectStats[]
}

const CATEGORY_ICONS = {
  video: Film,
  text: FileText,
  podcast: Mic,
}

function HallOfFameCard({ project, index }: { project: PublicProjectStats; index: number }) {
  const CategoryIcon = CATEGORY_ICONS[project.category]
  const isTop3 = index < 3
  
  return (
    <Link href={`/video/${project.id}`}>
      <Card className={`relative overflow-hidden group cursor-pointer transition-all duration-500
        ${isTop3 
          ? "bg-gradient-to-br from-amber-500/10 via-yellow-500/5 to-orange-500/10 border-amber-400/30 hover:border-amber-400/50 hover:shadow-xl hover:shadow-amber-400/10" 
          : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-violet-400/30"
        }`}
      >
        {/* Glow effect for top 3 */}
        {isTop3 && (
          <div className="absolute inset-0 bg-gradient-to-br from-amber-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        )}
        
        {/* Crown badge for position */}
        <div className={`absolute -top-3 -right-3 w-12 h-12 rounded-xl flex items-center justify-center z-10 ${
          index === 0 ? "bg-gradient-to-br from-amber-300 to-yellow-500 shadow-lg shadow-amber-400/40" :
          index === 1 ? "bg-gradient-to-br from-slate-300 to-slate-400 shadow-lg shadow-slate-400/30" :
          index === 2 ? "bg-gradient-to-br from-orange-400 to-amber-600 shadow-lg shadow-orange-400/30" :
          "bg-violet-500/20 border border-violet-400/30"
        }`}>
          {index < 3 ? (
            <Crown className="h-5 w-5 text-white" />
          ) : (
            <Star className="h-5 w-5 text-violet-300" />
          )}
        </div>
        
        <CardContent className="p-0">
          {/* Image */}
          <div className="relative aspect-[4/3] overflow-hidden">
            <Image
              src={project.thumbnail || "/placeholder.svg"}
              alt={project.title}
              width={400}
              height={300}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
            
            {/* Hall of Fame badge */}
            <div className="absolute top-3 left-3">
              <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/40 backdrop-blur-sm">
                <Crown className="h-3 w-3 mr-1" />
                Hall of Fame
              </Badge>
            </div>
            
            {/* Category */}
            <div className="absolute top-3 right-14">
              <div className="w-8 h-8 rounded-lg bg-black/50 backdrop-blur-sm flex items-center justify-center">
                <CategoryIcon className="h-4 w-4 text-white/80" />
              </div>
            </div>
            
            {/* Stats at bottom */}
            <div className="absolute bottom-3 left-3 right-3">
              <h3 className="font-bold text-white text-lg mb-1 group-hover:text-amber-200 transition-colors line-clamp-2">
                {project.title}
              </h3>
              <p className="text-white/60 text-sm mb-2">{project.creatorName}</p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-white/60 text-xs">
                  <span className="flex items-center gap-1">
                    <Heart className="h-3 w-3 text-rose-400" />
                    {project.publicSupportCount}
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    {project.publicQualifiedViews.toLocaleString()}
                  </span>
                </div>
                <span className="text-amber-400 text-sm font-medium">{project.publicScore} pts</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

export function HallOfFame({ projects }: HallOfFameProps) {
  if (projects.length === 0) return null
  
  return (
    <section className="relative">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-amber-400/5 rounded-full blur-3xl" />
      </div>
      
      <div className="flex items-center justify-center gap-3 mb-8">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-400/30 to-transparent" />
        <div className="flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border border-amber-400/30">
          <Crown className="h-6 w-6 text-amber-400" />
          <h2 className="text-2xl font-bold bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 bg-clip-text text-transparent">
            Hall of Fame VIXUAL
          </h2>
          <Crown className="h-6 w-6 text-amber-400" />
        </div>
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-400/30 to-transparent" />
      </div>
      
      <p className="text-center text-white/50 mb-8 max-w-2xl mx-auto">
        Les projets legendaires qui ont marque l&apos;histoire de VIXUAL. Ces contenus exceptionnels 
        representent le meilleur de notre communaute de createurs.
      </p>
      
      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {projects.map((project, index) => (
          <HallOfFameCard key={project.id} project={project} index={index} />
        ))}
      </div>
      
      {/* Footer CTA */}
      <div className="mt-10 text-center">
        <Link 
          href="/explore"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-400/30 text-amber-300 hover:from-amber-500/30 hover:to-yellow-500/30 transition-all duration-300"
        >
          <Sparkles className="h-5 w-5" />
          Decouvrir tous les contenus
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  )
}
