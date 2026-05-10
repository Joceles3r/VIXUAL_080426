import { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"
import { VisualHeader } from "@/components/vixual-header"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  ArrowLeft, Trophy, Crown, Heart, Eye, TrendingUp, Calendar, 
  Film, FileText, Mic, Share2, ExternalLink, Star, Award
} from "lucide-react"
import { getArchiveProjectDetail, PRESTIGE_LABELS_CONFIG, TREND_CONFIG } from "@/lib/archives-statistics/engine"

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const project = getArchiveProjectDetail(slug)
  
  if (!project) {
    return { title: "Projet non trouve | VIXUAL" }
  }
  
  return {
    title: `${project.title} | Archives VIXUAL`,
    description: `Decouvrez ${project.title} par ${project.creatorName} - Un projet marque de l'histoire VIXUAL.`,
  }
}

const CATEGORY_ICONS = {
  video: Film,
  text: FileText,
  podcast: Mic,
}

const CATEGORY_LABELS = {
  video: "Video",
  text: "Ecrit",
  podcast: "Podcast",
}

export default async function ArchiveProjectDetailPage({ params }: PageProps) {
  const { slug } = await params
  const project = getArchiveProjectDetail(slug)
  
  if (!project) {
    notFound()
  }
  
  const CategoryIcon = CATEGORY_ICONS[project.category]
  const trendConfig = TREND_CONFIG[project.trend]

  return (
    <div className="min-h-screen bg-slate-950">
      <VisualHeader />
      
      <main className="container mx-auto px-4 py-8">
        {/* Back button */}
        <Link 
          href="/archives-statistiques"
          className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour aux archives
        </Link>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hero image */}
            <div className="relative aspect-video rounded-2xl overflow-hidden">
              <Image
                src={project.thumbnail}
                alt={project.title}
                className="w-full h-full object-cover"
                width={1280}
                height={720}
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              
              {/* Badges overlay */}
              <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                {project.hallOfFame && (
                  <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/40 backdrop-blur-sm">
                    <Crown className="h-3 w-3 mr-1" />
                    Hall of Fame
                  </Badge>
                )}
                {project.prestigeLabel && (
                  <Badge className="bg-violet-500/20 text-violet-300 border-violet-500/40 backdrop-blur-sm">
                    <Award className="h-3 w-3 mr-1" />
                    {PRESTIGE_LABELS_CONFIG[project.prestigeLabel].label}
                  </Badge>
                )}
              </div>
              
              {/* Category badge */}
              <div className="absolute top-4 right-4">
                <Badge className="bg-black/50 backdrop-blur-sm text-white/80">
                  <CategoryIcon className="h-3 w-3 mr-1" />
                  {CATEGORY_LABELS[project.category]}
                </Badge>
              </div>
              
              {/* Title overlay */}
              <div className="absolute bottom-6 left-6 right-6">
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                  {project.title}
                </h1>
                <p className="text-white/70">par {project.creatorName}</p>
              </div>
            </div>
            
            {/* Description placeholder */}
            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold text-white mb-4">A propos de ce projet</h2>
                <p className="text-white/60 leading-relaxed">
                  Ce projet fait partie des contenus les plus remarquables de la plateforme VIXUAL. 
                  Il a su captiver notre communaute par sa qualite et son engagement aupres du public.
                </p>
                <p className="text-white/60 leading-relaxed mt-4">
                  Les projets presentes dans les archives VIXUAL representent le meilleur de ce que 
                  notre communaute de createurs a a offrir. Chaque projet archive temoigne de 
                  l&apos;excellence et de la creativite qui animent notre plateforme.
                </p>
              </CardContent>
            </Card>
            
            {/* Actions */}
            <div className="flex flex-wrap gap-4">
              <Button 
                asChild
                className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700"
              >
                <Link href={`/video/${project.id}`}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Voir le projet complet
                </Link>
              </Button>
              <Button variant="outline" className="border-white/10 text-white/70 hover:bg-white/5">
                <Share2 className="h-4 w-4 mr-2" />
                Partager
              </Button>
            </div>
          </div>
          
          {/* Sidebar stats */}
          <div className="space-y-6">
            {/* Rank card */}
            {project.publicRank && (
              <Card className="bg-gradient-to-br from-amber-500/10 to-yellow-500/10 border-amber-400/30">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-300 to-yellow-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-400/30">
                    <Trophy className="h-8 w-8 text-white" />
                  </div>
                  <p className="text-4xl font-bold text-amber-400 mb-1">#{project.publicRank}</p>
                  <p className="text-white/50 text-sm">Classement actuel</p>
                </CardContent>
              </Card>
            )}
            
            {/* Stats */}
            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-6 space-y-4">
                <h3 className="text-white font-semibold mb-4">Statistiques publiques</h3>
                
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                  <div className="flex items-center gap-2 text-white/60">
                    <Star className="h-4 w-4 text-violet-400" />
                    Score
                  </div>
                  <span className="text-white font-medium">{project.publicScore} pts</span>
                </div>
                
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                  <div className="flex items-center gap-2 text-white/60">
                    <Heart className="h-4 w-4 text-rose-400" />
                    Soutiens
                  </div>
                  <span className="text-white font-medium">{project.publicSupportCount}</span>
                </div>
                
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                  <div className="flex items-center gap-2 text-white/60">
                    <Eye className="h-4 w-4 text-sky-400" />
                    Vues qualifiees
                  </div>
                  <span className="text-white font-medium">{project.publicQualifiedViews.toLocaleString()}</span>
                </div>
                
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                  <div className="flex items-center gap-2 text-white/60">
                    <TrendingUp className="h-4 w-4 text-emerald-400" />
                    Tendance
                  </div>
                  <Badge className={`text-xs ${
                    project.trend.includes("rising") ? "bg-emerald-500/15 text-emerald-400" : 
                    project.trend.includes("falling") ? "bg-orange-500/15 text-orange-400" : 
                    "bg-slate-500/15 text-slate-400"
                  }`}>
                    {trendConfig.label}
                  </Badge>
                </div>
                
                {project.enteredTopAt && (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                    <div className="flex items-center gap-2 text-white/60">
                      <Calendar className="h-4 w-4 text-amber-400" />
                      Entre dans le TOP
                    </div>
                    <span className="text-white/70 text-sm">
                      {project.enteredTopAt.toLocaleDateString("fr-FR")}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* CTA */}
            <Card className="bg-gradient-to-br from-violet-500/10 to-purple-500/10 border-violet-400/30">
              <CardContent className="p-6 text-center">
                <p className="text-white/70 text-sm mb-4">
                  Soutenez ce projet et aidez-le a grimper dans le classement
                </p>
                <Button 
                  asChild
                  className="w-full bg-violet-500 hover:bg-violet-600"
                >
                  <Link href={`/video/${project.id}`}>
                    Soutenir ce projet
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  )
}
