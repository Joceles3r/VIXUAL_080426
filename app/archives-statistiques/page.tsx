import { Metadata } from "next"
import { VersionGuardServer } from "@/components/version-guard-server"
import { VisualHeader } from "@/components/vixual-header"
import { Footer } from "@/components/footer"
import { ArchivesHero } from "@/components/archives-statistiques/archives-hero"
import { TopProjectsGrid } from "@/components/archives-statistiques/top-projects-grid"
import { PublicStatsPanel } from "@/components/archives-statistiques/public-stats-panel"
import { ArchiveTimeline } from "@/components/archives-statistiques/archive-timeline"
import { HallOfFame } from "@/components/archives-statistiques/hall-of-fame"
import { getPublicArchivesAndStats, getBestProgressions } from "@/lib/archives-statistics/engine"

export const metadata: Metadata = {
  title: "Archives & Statistiques des Meilleurs Projets | VIXUAL Prestige",
  description: "Decouvrez les projets les plus marquants, les meilleures progressions et les archives prestigieuses de la plateforme VIXUAL. Accessible a tous.",
  openGraph: {
    title: "VIXUAL Prestige - Archives & Statistiques",
    description: "Les meilleurs projets de VIXUAL - Une vitrine publique accessible a tous.",
    type: "website",
  },
}

export default async function ArchivesStatistiquesPage() {
  const data = await getPublicArchivesAndStats()
  const bestProgressions = getBestProgressions(6)

  return (
    <VersionGuardServer requiredVersion="V2">
    <div className="min-h-screen bg-slate-950">
      <VisualHeader />
      
      <main className="container mx-auto px-4 py-8 space-y-16">
        {/* Hero Section */}
        <ArchivesHero summary={data.summary} />
        
        {/* Public Stats */}
        <PublicStatsPanel stats={data.globalStats} />
        
        {/* Top Projects du moment */}
        <TopProjectsGrid 
          projects={data.currentTopProjects}
          title="Top 10 du Moment"
          subtitle="Les projets les plus performants actuellement"
          showViewAll
          viewAllHref="/leaderboard"
        />
        
        {/* Best Progressions */}
        <TopProjectsGrid 
          projects={bestProgressions}
          title="Meilleures Progressions"
          subtitle="Les projets qui montent le plus vite"
          showViewAll
          viewAllHref="/leaderboard?sort=progression"
        />
        
        {/* Archive Timeline */}
        <ArchiveTimeline archives={data.archivesByPeriod} />
        
        {/* Hall of Fame */}
        <HallOfFame projects={data.hallOfFame} />
        
        {/* CTA for guests */}
        <section className="text-center py-12 px-6 rounded-3xl bg-gradient-to-br from-violet-500/10 via-purple-500/5 to-fuchsia-500/10 border border-violet-400/20">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Rejoignez la communaute VIXUAL
          </h2>
          <p className="text-white/60 max-w-xl mx-auto mb-6">
            Creez votre compte pour soutenir vos projets preferes, 
            participer aux classements et faire partie de l&apos;aventure.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <a 
              href="/signup"
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white font-medium hover:from-violet-600 hover:to-purple-700 transition-all duration-300 shadow-lg shadow-violet-500/25"
            >
              Creer un compte
            </a>
            <a 
              href="/explore"
              className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white/80 hover:bg-white/10 transition-all duration-300"
            >
              Explorer les contenus
            </a>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
    </VersionGuardServer>
  )
}
