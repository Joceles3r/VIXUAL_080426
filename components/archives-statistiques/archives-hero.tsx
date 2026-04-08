"use client"

import { Trophy, BarChart3, Archive, Crown } from "lucide-react"

interface ArchivesHeroProps {
  summary: {
    totalProjects: number
    totalInTop: number
    totalPrestige: number
    totalHallOfFame: number
  }
}

export function ArchivesHero({ summary }: ArchivesHeroProps) {
  const stats = [
    { label: "Projets classes", value: summary.totalProjects, icon: Trophy, color: "amber" },
    { label: "Dans le TOP", value: summary.totalInTop, icon: BarChart3, color: "violet" },
    { label: "Archives Prestige", value: summary.totalPrestige, icon: Archive, color: "emerald" },
    { label: "Hall of Fame", value: summary.totalHallOfFame, icon: Crown, color: "yellow" },
  ]

  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-violet-950/50 to-slate-900 border border-white/10">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(139,92,246,0.15),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(251,191,36,0.1),transparent_50%)]" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-b from-amber-400/10 to-transparent blur-3xl" />
      
      <div className="relative px-6 py-12 md:px-12 md:py-16">
        {/* Title */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-400/10 border border-amber-400/30 mb-6">
            <Trophy className="h-5 w-5 text-amber-400" />
            <span className="text-amber-300 text-sm font-medium">VIXUAL Prestige</span>
          </div>
          
          <h1 className="text-3xl md:text-5xl font-bold mb-4">
            <span className="text-white">Archives & Statistiques</span>
            <br />
            <span className="bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 bg-clip-text text-transparent">
              des Meilleurs Projets
            </span>
          </h1>
          
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
            Decouvrez les projets les plus marquants, les meilleures progressions 
            et les archives prestigieuses de la plateforme VIXUAL.
          </p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {stats.map((stat) => (
            <div 
              key={stat.label}
              className={`relative p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm
                hover:bg-white/10 hover:border-${stat.color}-400/30 transition-all duration-300 group`}
            >
              <div className={`w-12 h-12 rounded-xl bg-${stat.color}-400/15 flex items-center justify-center mb-3
                group-hover:scale-110 transition-transform duration-300`}>
                <stat.icon className={`h-6 w-6 text-${stat.color}-400`} />
              </div>
              <p className="text-3xl md:text-4xl font-bold text-white mb-1">
                {stat.value.toLocaleString()}
              </p>
              <p className="text-white/50 text-sm">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-10 text-center">
          <p className="text-white/40 text-sm">
            Accessible a tous - Explorez les meilleurs contenus de VIXUAL
          </p>
        </div>
      </div>
    </section>
  )
}
