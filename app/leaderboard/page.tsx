"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Trophy, Star, Flame, TrendingUp, Award, Zap, Users, Heart, BarChart3,
  Crown, CheckCircle, ArrowLeft, Film, FileText, Mic, Sparkles, Medal, ChevronRight
} from "lucide-react"
import { getTop100ByCategory } from "@/lib/discovery/engine"
import { TrafficLight } from "@/components/traffic-light"

type TierOption = 10 | 100 | 500
type CategoryOption = "all" | "video" | "text" | "podcast"

const TIER_CONFIG: Record<TierOption, { label: string; activeClass: string; dotColor: string }> = {
  10:  { label: "TOP 10",  activeClass: "bg-amber-400/20 text-amber-300 border-amber-400/40",  dotColor: "bg-amber-400" },
  100: { label: "TOP 100", activeClass: "bg-violet-400/20 text-violet-200 border-violet-400/40", dotColor: "bg-violet-400" },
  500: { label: "TOP 500", activeClass: "bg-sky-400/20 text-sky-200 border-sky-400/40",         dotColor: "bg-sky-400" },
}

const CATEGORY_CONFIG: Record<CategoryOption, { label: string; icon: any; activeClass: string }> = {
  all:     { label: "Tous",    icon: Sparkles, activeClass: "bg-white/10 text-white border-white/20" },
  video:   { label: "Vidéo",   icon: Film,     activeClass: "bg-rose-400/15 text-rose-300 border-rose-400/25" },
  text:    { label: "Écrit",   icon: FileText, activeClass: "bg-sky-400/15 text-sky-300 border-sky-400/25" },
  podcast: { label: "Podcast", icon: Mic,      activeClass: "bg-violet-400/15 text-violet-300 border-violet-400/25" },
}

/* ── Rank Medal ─────────────────────────────────────────── */
function RankMedal({ rank }: { rank: number }) {
  if (rank === 1) return (
    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-300 to-yellow-500 flex items-center justify-center shadow-lg shadow-amber-400/40 shrink-0">
      <Crown className="h-6 w-6 text-white" />
    </div>
  )
  if (rank === 2) return (
    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-300 to-slate-400 flex items-center justify-center shadow-lg shadow-slate-400/30 shrink-0">
      <Medal className="h-6 w-6 text-white" />
    </div>
  )
  if (rank === 3) return (
    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-400 to-amber-600 flex items-center justify-center shadow-lg shadow-orange-400/30 shrink-0">
      <Medal className="h-6 w-6 text-white" />
    </div>
  )
  if (rank <= 10) return (
    <div className="w-11 h-11 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center shrink-0">
      <span className="text-amber-300 font-bold text-sm">{rank}</span>
    </div>
  )
  if (rank <= 50) return (
    <div className="w-11 h-11 rounded-xl bg-violet-400/10 border border-violet-400/25 flex items-center justify-center shrink-0">
      <span className="text-violet-300 font-semibold text-sm">{rank}</span>
    </div>
  )
  return (
    <div className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
      <span className="text-white/40 font-medium text-sm">{rank}</span>
    </div>
  )
}

/* ── Project Card ───────────────────────────────────────── */
function ProjectCard({ rank, project, score }: { rank: number; project: any; score: any }) {
  const visualScore  = score?.visualScore  ?? 0
  const waveLevel    = score?.waveLevel    ?? 0
  const progressPct  = Math.min((visualScore / 1000) * 100, 100)
  const isTop3  = rank <= 3
  const isTop10 = rank <= 10

  const cardClass = isTop3
    ? "border-amber-400/25 bg-white/[0.07] shadow-md shadow-amber-400/5"
    : isTop10
    ? "border-violet-400/20 bg-white/[0.05]"
    : "border-white/8 bg-white/[0.03]"

  return (
    <Link href={`/video/${project.id}`}>
      <Card className={`${cardClass} hover:bg-white/10 hover:border-violet-400/40 hover:shadow-lg hover:shadow-violet-500/10 transition-all duration-300 cursor-pointer group backdrop-blur-sm`}>
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-center gap-4">
            <RankMedal rank={rank} />

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="min-w-0">
                  <h3 className="font-semibold text-base truncate text-white/90 group-hover:text-white transition-colors">
                    {project.title}
                  </h3>
                  <p className="text-white/40 text-sm truncate">{project.creatorName}</p>
                </div>
                {isTop10 && (
                  <Badge className="shrink-0 bg-amber-400/15 text-amber-300 border-amber-400/25 text-xs">
                    <Trophy className="h-3 w-3 mr-1" />
                    Elite
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-4 text-xs text-white/40 mb-3">
                <span className="flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5 text-sky-400" />
                  {project.investorCount}
                </span>
                <span className="flex items-center gap-1.5">
                  <Heart className="h-3.5 w-3.5 text-rose-400" />
                  {project.totalVotes}
                </span>
                <span className="flex items-center gap-1.5">
                  <Zap className="h-3.5 w-3.5 text-amber-400" />
                  Wave {waveLevel}
                </span>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-white/30">Score VIXUAL</span>
                  <span className={`font-bold ${isTop10 ? "text-amber-300" : "text-violet-300"}`}>
                    {visualScore.toFixed(0)}<span className="text-white/30 font-normal">/1000</span>
                  </span>
                </div>
                <div className="h-1.5 bg-white/8 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      isTop10
                        ? "bg-gradient-to-r from-amber-400 to-yellow-400"
                        : "bg-gradient-to-r from-violet-400 to-sky-400"
                    }`}
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              </div>
            </div>

            <ChevronRight className="h-5 w-5 text-white/20 group-hover:text-violet-400 group-hover:translate-x-0.5 transition-all shrink-0" />
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

/* ── Tier Selector ──────────────────────────────────────── */
function TierSelector({ value, onChange }: { value: TierOption; onChange: (v: TierOption) => void }) {
  return (
    <div className="flex items-center gap-1 p-1 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
      {([10, 100, 500] as TierOption[]).map((tier) => {
        const cfg = TIER_CONFIG[tier]
        const active = value === tier
        return (
          <button
            key={tier}
            onClick={() => onChange(tier)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              active ? `${cfg.activeClass} border shadow-sm` : "text-white/40 hover:text-white/70"
            }`}
          >
            {active && <span className={`w-1.5 h-1.5 rounded-full ${cfg.dotColor}`} />}
            {cfg.label}
          </button>
        )
      })}
    </div>
  )
}

/* ── Category Selector ──────────────────────────────────── */
function CategorySelector({ value, onChange }: { value: CategoryOption; onChange: (v: CategoryOption) => void }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {(["all", "video", "text", "podcast"] as CategoryOption[]).map((cat) => {
        const cfg = CATEGORY_CONFIG[cat]
        const Icon = cfg.icon
        const active = value === cat
        return (
          <button
            key={cat}
            onClick={() => onChange(cat)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border-2 transition-all ${
              active
                ? `${cfg.activeClass} border-[#7A00FF] shadow-lg shadow-[#7A00FF]/15`
                : "text-white/40 border-white/10 hover:text-white/70 hover:border-[#7A00FF]/30"
            }`}
          >
            <Icon className="h-4 w-4" />
            {cfg.label}
          </button>
        )
      })}
    </div>
  )
}

/* ── Stats Summary ──────────────────────────────────────── */
function StatsSummary({ projects }: { projects: any[] }) {
  const totalInvestment = projects.reduce((s, p) => s + (p.currentInvestment || 0), 0)
  const totalSupporters = projects.reduce((s, p) => s + (p.investorCount || 0), 0)
  const avgScore = projects.length > 0
    ? projects.reduce((s, p) => s + (p.score?.visualScore || 0), 0) / projects.length
    : 0

  const stats = [
    { label: "Projets",    value: projects.length,                      icon: BarChart3,  color: "text-violet-300", glow: "shadow-violet-400/20" },
    { label: "Investis",   value: `${(totalInvestment / 1000).toFixed(0)}k €`, icon: TrendingUp, color: "text-sky-300",    glow: "shadow-sky-400/20" },
    { label: "Soutiens",   value: totalSupporters.toLocaleString(),     icon: Heart,      color: "text-rose-300",   glow: "shadow-rose-400/20" },
    { label: "Score moy.", value: avgScore.toFixed(0),                  icon: Star,       color: "text-amber-300",  glow: "shadow-amber-400/20" },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {stats.map((s) => (
        <div
          key={s.label}
          className={`bg-white/[0.06] backdrop-blur-sm border-2 border-[#7A00FF] rounded-2xl p-4 text-center shadow-lg ${s.glow}`}
        >
          <s.icon className={`h-5 w-5 mx-auto mb-2 ${s.color}`} />
          <p className="text-xl font-bold text-white">{s.value}</p>
          <p className="text-xs text-white/40 mt-0.5">{s.label}</p>
        </div>
      ))}
    </div>
  )
}

/* ── Main Page ──────────────────────────────────────────── */
export default function LeaderboardPage() {
  const router = useRouter()
  const [tier, setTier]         = useState<TierOption>(10)
  const [category, setCategory] = useState<CategoryOption>("all")

  const projects = useMemo(
    () => getTop100ByCategory(category === "all" ? undefined : category, tier),
    [category, tier]
  )

  const tierCfg = TIER_CONFIG[tier]

  return (
    <main
      className="min-h-screen text-white relative overflow-hidden"
      style={{
        background: "linear-gradient(160deg, #0a1628 0%, #0f1d3a 15%, #1a2a5e 30%, #2d1f5e 50%, #1e1548 70%, #0d1a40 85%, #0a1628 100%)",
      }}
    >
      {/* Soft futuristic streaming-style blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden>
        {/* Top-left blue glow */}
        <div
          className="absolute -top-20 -left-20 w-[700px] h-[500px] rounded-full opacity-25 blur-[120px]"
          style={{ background: "radial-gradient(ellipse, #3b82f6 0%, #1e40af 40%, transparent 70%)" }}
        />
        {/* Center-right purple glow */}
        <div
          className="absolute top-1/3 -right-32 w-[600px] h-[600px] rounded-full opacity-20 blur-[100px]"
          style={{ background: "radial-gradient(ellipse, #8b5cf6 0%, #6d28d9 40%, transparent 70%)" }}
        />
        {/* Bottom-left soft purple */}
        <div
          className="absolute bottom-0 left-1/4 w-[500px] h-[400px] rounded-full opacity-15 blur-[100px]"
          style={{ background: "radial-gradient(ellipse, #a78bfa 0%, #7c3aed 40%, transparent 70%)" }}
        />
        {/* Top-right blue accent */}
        <div
          className="absolute top-10 right-1/3 w-[450px] h-[350px] rounded-full opacity-18 blur-[90px]"
          style={{ background: "radial-gradient(ellipse, #60a5fa 0%, #2563eb 40%, transparent 70%)" }}
        />
        {/* Subtle noise overlay for depth */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")" }}
        />
      </div>

      {/* Sticky header */}
      <div
        className="sticky top-0 z-50 border-b border-white/10 backdrop-blur-xl"
        style={{ background: "rgba(15, 25, 50, 0.85)" }}
      >
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/50 hover:text-white hover:bg-white/10 transition-all"
              aria-label="Retour"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex-1">
              <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2.5">
                <div className="p-1.5 rounded-xl bg-amber-400/15 border border-amber-400/25">
                  <Trophy className="h-5 w-5 text-amber-300" />
                </div>
                <span style={{ color: "#F5F7FF" }}>VIXUAL Classements</span>
              </h1>
              <p className="text-sm text-white/35 hidden sm:block mt-0.5">
                Découvrez les meilleurs projets de la communauté
              </p>
            </div>
            <Link
              href="/"
              className="text-sm font-medium text-violet-300 hover:text-violet-200 transition-colors hidden sm:block"
            >
              Accueil
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative max-w-5xl mx-auto px-4 py-8 sm:py-12">

        {/* Hero */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/8 border border-white/12 mb-5">
            <Sparkles className="h-4 w-4 text-amber-300" />
            <span className="text-sm font-medium text-white/70">Classement officiel VIXUAL</span>
          </div>
          <div className="flex items-center justify-center gap-4 md:gap-6 mb-3">
            <TrafficLight size="lg" />
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight" style={{ color: "#F5F7FF" }}>
              {tierCfg.label}
            </h2>
            <TrafficLight size="lg" />
          </div>
          <p className="text-white/45 max-w-md mx-auto text-sm leading-relaxed">
            Les projets les mieux notés selon notre algorithme basé sur 6 critères d'évaluation.
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
          <TierSelector value={tier} onChange={setTier} />
          <div className="hidden sm:block w-px h-8 bg-white/10" />
          <CategorySelector value={category} onChange={setCategory} />
        </div>

        {/* Stats */}
        <div className="mb-8">
          <StatsSummary projects={projects} />
        </div>

        {/* List */}
        <div className="space-y-2.5">
          {projects.length === 0 ? (
            <div className="text-center py-20 text-white/30">
              <Trophy className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p>Aucun projet dans cette catégorie pour le moment.</p>
            </div>
          ) : (
            projects.map((proj, idx) => (
              <ProjectCard
                key={proj.id}
                rank={idx + 1}
                project={proj}
                score={proj.score || { visualScore: 500, waveLevel: 1, scores: {} }}
              />
            ))
          )}
        </div>

        {/* Legend */}
        <div
          className="mt-12 p-6 rounded-2xl border border-white/10 backdrop-blur-sm"
          style={{ background: "rgba(255,255,255,0.04)" }}
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2 rounded-xl bg-amber-400/10 border border-amber-400/20">
              <Award className="h-5 w-5 text-amber-300" />
            </div>
            <h3 className="text-base font-semibold text-white/85">Comment fonctionne le classement ?</h3>
          </div>
          <div className="grid sm:grid-cols-2 gap-6 text-sm text-white/45">
            <div>
              <p className="font-medium text-white/65 mb-3">Critères principaux</p>
              <ul className="space-y-2.5">
                {[
                  { icon: TrendingUp, color: "text-sky-400",    label: "Investissement (40%)",  sub: "Montants collectés" },
                  { icon: Heart,      color: "text-rose-400",   label: "Engagement (20%)",      sub: "Votes et interactions" },
                  { icon: CheckCircle,color: "text-emerald-400",label: "Longévité (15%)",       sub: "Constance du projet" },
                ].map((item) => (
                  <li key={item.label} className="flex items-center gap-3">
                    <div className="p-1.5 rounded-lg bg-white/5">
                      <item.icon className={`h-4 w-4 ${item.color}`} />
                    </div>
                    <span>
                      <span className="text-white/60 font-medium">{item.label}</span>
                      {" — "}{item.sub}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-medium text-white/65 mb-3">Critères secondaires</p>
              <ul className="space-y-2.5">
                {[
                  { icon: Flame,      color: "text-orange-400", label: "Momentum (10%)",    sub: "Croissance récente" },
                  { icon: Users,      color: "text-violet-400", label: "Communauté (10%)",  sub: "Nombre de soutiens" },
                  { icon: Star,       color: "text-amber-400",  label: "Créateur (5%)",     sub: "Crédibilité et historique" },
                ].map((item) => (
                  <li key={item.label} className="flex items-center gap-3">
                    <div className="p-1.5 rounded-lg bg-white/5">
                      <item.icon className={`h-4 w-4 ${item.color}`} />
                    </div>
                    <span>
                      <span className="text-white/60 font-medium">{item.label}</span>
                      {" — "}{item.sub}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
