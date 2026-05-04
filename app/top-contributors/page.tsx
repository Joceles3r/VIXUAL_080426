"use client"

import { VersionGuard } from "@/components/version-guard"
import { useState, useMemo } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  ArrowLeft, Trophy, Users, TrendingUp, Award, Star, 
  Shield, ChevronRight, Sparkles, Crown, Medal
} from "lucide-react"
import { 
  ContributorRankCard, 
  AnimatedAvatar 
} from "@/components/user-identity-display"
import { 
  MOCK_TOP_CONTRIBUTORS, 
  CONTRIBUTOR_BADGES,
  calculateContributorScore,
  getContributorRankBadge
} from "@/lib/identity-system"
import { TrafficLight } from "@/components/traffic-light"

type TierFilter = 10 | 50 | 100 | 500

const TIER_CONFIG: Record<TierFilter, { label: string; color: string; bg: string; border: string; icon: any }> = {
  10: { label: "Top 10", color: "text-amber-300", bg: "bg-amber-500/20", border: "border-amber-500/40", icon: Crown },
  50: { label: "Top 50", color: "text-yellow-300", bg: "bg-yellow-500/20", border: "border-yellow-500/40", icon: Medal },
  100: { label: "Top 100", color: "text-teal-300", bg: "bg-teal-500/20", border: "border-teal-500/40", icon: Star },
  500: { label: "Top 500", color: "text-slate-300", bg: "bg-slate-500/20", border: "border-slate-500/40", icon: Award },
}

// Generer plus de contributeurs mock
function generateMoreContributors(count: number) {
  const names = [
    { first: 'Antoine', last: 'V.' }, { first: 'Marie', last: 'C.' },
    { first: 'Nicolas', last: 'H.' }, { first: 'Camille', last: 'B.' },
    { first: 'Alexandre', last: 'M.' }, { first: 'Laura', last: 'S.' },
    { first: 'Julien', last: 'R.' }, { first: 'Sarah', last: 'K.' },
    { first: 'Pierre', last: 'D.' }, { first: 'Manon', last: 'L.' },
    { first: 'Romain', last: 'A.' }, { first: 'Claire', last: 'F.' },
    { first: 'Kevin', last: 'P.' }, { first: 'Elise', last: 'G.' },
    { first: 'Florian', last: 'J.' }, { first: 'Oceane', last: 'N.' },
  ]
  
  const emojis = ['🎯', '💡', '🌈', '⚡', '🎪', '🎵', '📚', '🎨', '🌙', '🍀']
  const colors = ['emerald', 'teal', 'sky', 'violet', 'rose', 'amber', 'orange', 'cyan']
  
  const additional = []
  for (let i = MOCK_TOP_CONTRIBUTORS.length; i < count; i++) {
    const nameIdx = i % names.length
    const name = names[nameIdx]
    const score = Math.max(10, 68 - (i - 10) * 0.5 + Math.random() * 5)
    additional.push({
      rank: i + 1,
      displayName: `${name.first} ${name.last}`,
      avatarEmoji: emojis[i % emojis.length],
      avatarColor: colors[i % colors.length],
      score: Math.round(score * 10) / 10,
      totalContributed: Math.max(100, 3500 - (i - 10) * 50 + Math.floor(Math.random() * 200)),
      projectsCount: Math.max(2, 18 - Math.floor((i - 10) / 5)),
      badge: getContributorRankBadge(i + 1),
    })
  }
  
  return [...MOCK_TOP_CONTRIBUTORS, ...additional]
}

export default function TopContributorsPage() {
  const router = useRouter()
  const [tier, setTier] = useState<TierFilter>(10)
  
  const allContributors = useMemo(() => generateMoreContributors(500), [])
  const contributors = useMemo(() => allContributors.slice(0, tier), [allContributors, tier])
  
  const tierConfig = TIER_CONFIG[tier]
  const TierIcon = tierConfig.icon
  
  // Stats
  const totalContributed = contributors.reduce((sum, c) => sum + c.totalContributed, 0)
  const totalProjects = contributors.reduce((sum, c) => sum + c.projectsCount, 0)
  const avgScore = contributors.reduce((sum, c) => sum + c.score, 0) / contributors.length
  
  return (
    <VersionGuard requiredVersion="V2">
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Header sticky */}
      <div className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-xl border-b border-slate-800/50">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-xl bg-slate-800/50 border border-slate-700/50 text-slate-400 hover:text-white hover:bg-slate-700/50 transition-all"
              aria-label="Retour"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex-1">
              <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                <Trophy className="h-6 w-6 text-amber-400" />
                Top Contributeurs VIXUAL
              </h1>
              <p className="text-sm text-slate-500 hidden sm:block">
                Classement discret des meilleurs contributeurs
              </p>
            </div>
            <Link href="/" className="text-sm text-teal-400 hover:text-teal-300 transition-colors hidden sm:block">
              Accueil
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Hero */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-500/20 to-teal-500/20 border border-amber-500/30 mb-4">
            <Sparkles className="h-4 w-4 text-amber-400" />
            <span className="text-sm font-medium text-slate-300">Classement officiel</span>
          </div>
          
          <div className="flex items-center justify-center gap-4 md:gap-6 mb-3">
            <TrafficLight size="lg" />
            <h2 className="text-3xl sm:text-4xl font-bold">
              <span className={tierConfig.color}>{tierConfig.label}</span>
              <span className="text-slate-500"> Contributeurs</span>
            </h2>
            <TrafficLight size="lg" />
          </div>
          
          <p className="text-slate-400 max-w-xl mx-auto mb-6">
            Les contributeurs les plus actifs de la communaute VIXUAL. Le classement est base sur le montant contribue, la diversification, la regularite et l'anciennete.
          </p>
          
          {/* Explication anonymat */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700/50 text-sm text-slate-400">
            <Shield className="h-4 w-4 text-teal-400" />
            <span>Affichage discret: Prenom + initiale pour proteger la vie privee</span>
          </div>
        </div>

        {/* Tier Selector */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2 p-1.5 bg-slate-800/50 rounded-xl border border-slate-700/50">
            {([10, 50, 100, 500] as TierFilter[]).map((t) => {
              const config = TIER_CONFIG[t]
              const Icon = config.icon
              const isActive = tier === t
              return (
                <button
                  key={t}
                  onClick={() => setTier(t)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? `${config.bg} ${config.color} ${config.border} border shadow-sm`
                      : "text-slate-400 hover:text-white hover:bg-slate-700/50"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {config.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          <Card className="bg-slate-800/30 border-slate-700/30">
            <CardContent className="p-4 text-center">
              <Users className="h-5 w-5 mx-auto mb-1 text-teal-400" />
              <p className="text-xl font-bold text-white">{contributors.length}</p>
              <p className="text-xs text-slate-500">Contributeurs</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/30 border-slate-700/30">
            <CardContent className="p-4 text-center">
              <TrendingUp className="h-5 w-5 mx-auto mb-1 text-emerald-400" />
              <p className="text-xl font-bold text-white">{(totalContributed / 1000).toFixed(0)}k</p>
              <p className="text-xs text-slate-500">Total contribue</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/30 border-slate-700/30">
            <CardContent className="p-4 text-center">
              <Award className="h-5 w-5 mx-auto mb-1 text-amber-400" />
              <p className="text-xl font-bold text-white">{totalProjects}</p>
              <p className="text-xs text-slate-500">Projets soutenus</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/30 border-slate-700/30">
            <CardContent className="p-4 text-center">
              <Star className="h-5 w-5 mx-auto mb-1 text-yellow-400" />
              <p className="text-xl font-bold text-white">{avgScore.toFixed(1)}</p>
              <p className="text-xs text-slate-500">Score moyen</p>
            </CardContent>
          </Card>
        </div>

        {/* Liste des contributeurs */}
        <div className="space-y-3">
          {contributors.map((contributor) => (
            <ContributorRankCard
              key={contributor.rank}
              rank={contributor.rank}
              displayName={contributor.displayName}
              avatarEmoji={contributor.avatarEmoji}
              avatarColor={contributor.avatarColor}
              score={contributor.score}
              totalContributed={contributor.totalContributed}
              projectsCount={contributor.projectsCount}
              badge={contributor.badge}
            />
          ))}
        </div>

        {/* Score explanation */}
        <Card className="mt-12 bg-slate-800/30 border-slate-700/30">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl bg-amber-500/20">
                <TrendingUp className="h-5 w-5 text-amber-400" />
              </div>
              <h3 className="text-lg font-semibold">Comment est calcule le score?</h3>
            </div>
            
            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-400">Montant contribue</span>
                    <span className="text-amber-400 font-medium">50%</span>
                  </div>
                  <Progress value={50} className="h-2 bg-slate-700" />
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-400">Diversification</span>
                    <span className="text-teal-400 font-medium">20%</span>
                  </div>
                  <Progress value={20} className="h-2 bg-slate-700" />
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-400">Participation reguliere</span>
                    <span className="text-emerald-400 font-medium">15%</span>
                  </div>
                  <Progress value={15} className="h-2 bg-slate-700" />
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-400">Anciennete</span>
                    <span className="text-sky-400 font-medium">10%</span>
                  </div>
                  <Progress value={10} className="h-2 bg-slate-700" />
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-400">Bonus communautaire</span>
                    <span className="text-violet-400 font-medium">5%</span>
                  </div>
                  <Progress value={5} className="h-2 bg-slate-700" />
                </div>
                
                <div className="pt-2 border-t border-slate-700 mt-4">
                  <p className="text-xs text-slate-500">
                    Ce systeme evite qu'un seul gros investissement domine le classement et favorise l'engagement regulier.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Badges explanation */}
        <Card className="mt-6 bg-slate-800/30 border-slate-700/30">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl bg-violet-500/20">
                <Award className="h-5 w-5 text-violet-400" />
              </div>
              <h3 className="text-lg font-semibold">Badges de classement</h3>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {Object.values(CONTRIBUTOR_BADGES).filter(b => b.type.startsWith('top')).map((badge) => (
                <div key={badge.type} className="text-center p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
                  <span className="text-2xl block mb-1">{badge.icon}</span>
                  <span className={`text-sm font-medium ${badge.color}`}>{badge.label}</span>
                </div>
              ))}
            </div>
            
            <p className="text-xs text-slate-500 mt-4 text-center">
              Les badges apparaissent sur votre profil, dans les commentaires et sur Vixual Social.
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
    </VersionGuard>
  )
}
