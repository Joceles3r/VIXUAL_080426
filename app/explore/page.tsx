"use client"

import Link from "next/link"
import Image from "next/image"
import { useSearchParams, useRouter } from "next/navigation"
import { useState, useMemo, useEffect, useCallback, Suspense, useRef } from "react"
import {
  Search, Film, FileText, Mic, Compass, SlidersHorizontal, Eye, UserPlus,
  ChevronLeft, ChevronRight, Play, TrendingUp, Users, Clock, BookOpen, Headphones,
  Lock, Unlock, Heart, Download, Flame, Award, Star, Clapperboard, Shield,
  Crown, Sparkles, Trophy, CheckCircle, Zap, ArrowRight, Rocket, Plus, Bookmark
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { VisualSlogan } from "@/components/vixual-slogan"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { VisualHeader } from "@/components/visual-header"
import { Footer } from "@/components/footer"
import { ReportButton } from "@/components/report-button"
import { TrafficLight } from "@/components/traffic-light"
import {
  ALL_CONTENTS,
  VIDEO_CATEGORIES,
  TEXT_CATEGORIES,
  PODCAST_CATEGORIES,
  type ContentType,
  type Content,
  isVerifiedCreator,
} from "@/lib/mock-data"
import { useAuth } from "@/lib/auth-context"

/* ═══════════════════════════════════════════════════════════════════════════
   VIXUAL EXPLORER V2 - Experience Netflix/YouTube Immersive
   ═══════════════════════════════════════════════════════════════════════════ */

/* ---------- Helper: Get VIXUAL Badges ---------- */
function getVisualBadges(content: Content) {
  const badges: { label: string; icon: typeof Flame; color: string; bg: string }[] = []
  const daysSinceCreation = Math.floor(
    (Date.now() - new Date(content.createdAt).getTime()) / (1000 * 60 * 60 * 24)
  )
  const fundingPercent = (content.currentInvestment / content.investmentGoal) * 100

  if (daysSinceCreation <= 14) {
    badges.push({ label: "Nouveau", icon: Clapperboard, color: "text-sky-300", bg: "bg-sky-500/80" })
  }
  if (content.contributorCount >= 50) {
    badges.push({ label: "Tendance", icon: Flame, color: "text-orange-300", bg: "bg-orange-500/80" })
  }
  if (content.totalVotes >= 250) {
    badges.push({ label: "Soutenu", icon: Star, color: "text-amber-300", bg: "bg-amber-500/80" })
  }
  if (fundingPercent >= 90) {
    badges.push({ label: "Top projet", icon: Award, color: "text-emerald-300", bg: "bg-emerald-500/80" })
  }
  if (isVerifiedCreator(content.creatorName)) {
    badges.push({ label: "Gold", icon: Crown, color: "text-yellow-300", bg: "bg-yellow-500/80" })
  }
  return badges
}

/* ---------- HERO PRINCIPAL IMMERSIF ---------- */
function ImmersiveHero({ content }: { content: Content }) {
  const badges = getVisualBadges(content)
  const typeLabel = content.contentType === "video" ? "Films & Videos" : 
                    content.contentType === "text" ? "Livres & Articles" : "Podcasts"
  const TypeIcon = content.contentType === "video" ? Film : 
                   content.contentType === "text" ? BookOpen : Headphones

  return (
    <div className="relative w-full h-[450px] sm:h-[550px] lg:h-[600px] overflow-hidden">
      {/* Background Image with Parallax Effect */}
      <div className="absolute inset-0">
        <Image
          src={content.coverUrl || "/placeholder.svg"}
          alt={content.title}
          fill
          className="object-cover scale-105"
          priority
        />
      </div>
      
      {/* Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/85 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-slate-950/20" />
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/60 via-transparent to-slate-950" />
      
      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-10 lg:p-16 max-w-4xl">
        {/* Category & Badges */}
        <div className="flex flex-wrap gap-2 mb-4">
          <Badge className="bg-emerald-600 text-white border-0 text-xs tracking-wider uppercase px-3 py-1">
            <TypeIcon className="h-3 w-3 mr-1.5" />
            {typeLabel}
          </Badge>
          {badges.slice(0, 3).map((b) => (
            <Badge key={b.label} className={`${b.bg} text-white border-0 text-xs px-2.5 py-1`}>
              <b.icon className="h-3 w-3 mr-1" />
              {b.label}
            </Badge>
          ))}
        </div>
        
        {/* Title */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-white mb-3 text-balance leading-tight">
          {content.title}
        </h1>
        
        {/* Description */}
        <p className="text-white/70 text-base sm:text-lg max-w-2xl line-clamp-2 mb-5">
          {content.description}
        </p>
        
        {/* Meta Info */}
        <div className="flex flex-wrap items-center gap-4 mb-6 text-sm">
          <span className="text-white/60">par <span className="text-white font-medium">{content.creatorName}</span></span>
          <span className="text-white/20">|</span>
          <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
            <Users className="h-4 w-4" />
            {content.contributorCount} contributeurs
          </span>
          <span className="text-white/20">|</span>
          <span className="text-emerald-400 font-semibold">
            {Math.round((content.currentInvestment / content.investmentGoal) * 100)}% finance
          </span>
          {content.duration && (
            <>
              <span className="text-white/20">|</span>
              <span className="flex items-center gap-1.5 text-white/60">
                <Clock className="h-4 w-4" />
                {content.duration}
              </span>
            </>
          )}
        </div>
        
        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          <Link href={`/video/${content.id}`}>
            <Button size="lg" className="bg-white text-slate-900 hover:bg-white/90 font-semibold px-6">
              <Play className="h-5 w-5 mr-2 fill-current" />
              Voir l'extrait
            </Button>
          </Link>
          <Link href={`/video/${content.id}`}>
            <Button size="lg" className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-6">
              <TrendingUp className="h-5 w-5 mr-2" />
              Soutenir
            </Button>
          </Link>
          <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 bg-white/5 px-4">
            <Bookmark className="h-5 w-5" />
          </Button>
        </div>
      </div>
      
      {/* Progress Indicator */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-800/50">
        <div 
          className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
          style={{ width: `${Math.min((content.currentInvestment / content.investmentGoal) * 100, 100)}%` }}
        />
      </div>
    </div>
  )
}

/* ---------- CARTE PROJET NETFLIX STYLE ---------- */
function ProjectCard({ content, size = "normal" }: { content: Content; size?: "normal" | "large" }) {
  const { isAuthed } = useAuth()
  const progressPercent = Math.min((content.currentInvestment / content.investmentGoal) * 100, 100)
  const badges = getVisualBadges(content)
  const isLocked = !isAuthed && !content.isFree
  const isGold = isVerifiedCreator(content.creatorName)

  const typeConfig = {
    video: { bg: "bg-red-600/90", icon: Film, label: "Video" },
    text: { bg: "bg-amber-600/90", icon: BookOpen, label: "Livre" },
    podcast: { bg: "bg-purple-600/90", icon: Headphones, label: "Podcast" },
  }[content.contentType]

  return (
    <div className={`group relative flex-shrink-0 ${size === "large" ? "w-[300px] sm:w-[340px]" : "w-[200px] sm:w-[240px]"}`}>
      <div className="relative rounded-xl overflow-hidden bg-slate-900/80 border border-white/5 hover:border-emerald-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-900/20 hover:scale-[1.02]">
        {/* Image Container */}
        <Link href={`/video/${content.id}`}>
          <div className={`relative overflow-hidden ${size === "large" ? "aspect-[16/10]" : "aspect-[16/9]"}`}>
            <Image
              src={content.coverUrl || "/placeholder.svg"}
              alt={content.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
            
            {/* Type Badge */}
            <Badge className={`absolute top-2 left-2 ${typeConfig.bg} text-white border-0 text-[10px] px-2 py-0.5`}>
              <typeConfig.icon className="h-2.5 w-2.5 mr-1" />
              {typeConfig.label}
            </Badge>
            
            {/* Gold Creator Badge */}
            {isGold && (
              <Badge className="absolute top-2 right-2 bg-gradient-to-r from-yellow-500 to-amber-500 text-white border-0 text-[10px] px-2 py-0.5">
                <Crown className="h-2.5 w-2.5 mr-1" />
                Gold
              </Badge>
            )}
            
            {/* Free / Lock Badge */}
            {content.isFree && !isGold && (
              <Badge className="absolute top-2 right-2 bg-emerald-600/90 text-white border-0 text-[10px] px-2">
                Gratuit
              </Badge>
            )}
            
            {/* Duration/Meta */}
            <div className="absolute bottom-2 right-2 flex items-center gap-1 text-white/90 text-[11px] bg-black/70 px-2 py-0.5 rounded backdrop-blur-sm">
              {content.contentType === "video" && <><Clock className="h-3 w-3" />{content.duration}</>}
              {content.contentType === "text" && <><BookOpen className="h-3 w-3" />{content.wordCount?.toLocaleString()} mots</>}
              {content.contentType === "podcast" && <><Headphones className="h-3 w-3" />{content.episodeCount} ep.</>}
            </div>
            
            {/* Progress Growth Indicator */}
            {progressPercent >= 80 && (
              <div className="absolute bottom-2 left-2 flex items-center gap-1 text-emerald-400 text-[10px] bg-emerald-500/20 px-2 py-0.5 rounded backdrop-blur-sm border border-emerald-500/30">
                <Rocket className="h-3 w-3" />
                +{Math.round(Math.random() * 20 + 5)}% aujourd'hui
              </div>
            )}
            
            {/* Hover Play Button */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="w-14 h-14 rounded-full bg-emerald-500/90 backdrop-blur-sm flex items-center justify-center border-2 border-white/30 shadow-xl">
                <Play className="h-6 w-6 text-white fill-white ml-1" />
              </div>
            </div>
          </div>
        </Link>
        
        {/* Content Info */}
        <div className="p-3 space-y-2">
          <Link href={`/video/${content.id}`}>
            <h3 className="font-semibold text-white text-sm line-clamp-1 group-hover:text-emerald-400 transition-colors">
              {content.title}
            </h3>
          </Link>
          <p className="text-white/50 text-xs">{content.creatorName}</p>
          
          {/* Progress Bar */}
          <div className="space-y-1">
            <Progress value={progressPercent} className="h-1 bg-slate-800" />
            <div className="flex justify-between text-[10px] text-white/40">
              <span className="text-emerald-400 font-medium">{content.currentInvestment.toLocaleString()}EUR</span>
              <span>{Math.round(progressPercent)}%</span>
            </div>
          </div>
          
          {/* Quick Actions */}
          <div className="flex gap-1.5 pt-1">
            <Link href={`/video/${content.id}`} className="flex-1">
              <Button size="sm" variant="ghost" className="w-full h-7 text-[10px] text-white/60 hover:text-white hover:bg-white/10">
                <Play className="h-3 w-3 mr-1" />
                Extrait
              </Button>
            </Link>
            <Link href={`/video/${content.id}`} className="flex-1">
              <Button size="sm" variant="ghost" className="w-full h-7 text-[10px] text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10">
                <TrendingUp className="h-3 w-3 mr-1" />
                Soutenir
              </Button>
            </Link>
            <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-amber-400 hover:text-amber-300 hover:bg-amber-500/10">
              <Bookmark className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ---------- RANGEE HORIZONTALE TYPE NETFLIX ---------- */
function ContentRow({ 
  title, 
  icon: Icon, 
  contents, 
  accentColor = "emerald",
  size = "normal",
  showViewAll = true
}: { 
  title: string
  icon: typeof Flame
  contents: Content[]
  accentColor?: "emerald" | "amber" | "rose" | "sky" | "purple"
  size?: "normal" | "large"
  showViewAll?: boolean
}) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const checkScroll = useCallback(() => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
      setCanScrollLeft(scrollLeft > 0)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
    }
  }, [])

  useEffect(() => {
    checkScroll()
    const el = scrollRef.current
    if (el) {
      el.addEventListener("scroll", checkScroll)
      return () => el.removeEventListener("scroll", checkScroll)
    }
  }, [checkScroll])

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = direction === "left" ? -400 : 400
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" })
    }
  }

  const colorClasses = {
    emerald: "text-emerald-400",
    amber: "text-amber-400",
    rose: "text-rose-400",
    sky: "text-sky-400",
    purple: "text-purple-400",
  }

  if (contents.length === 0) return null

  return (
    <section className="py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 px-4 sm:px-8 lg:px-16">
        <div className="flex items-center gap-3">
          <Icon className={`h-5 w-5 ${colorClasses[accentColor]}`} />
          <h2 className="text-xl sm:text-2xl font-bold text-white">{title}</h2>
          <Badge className="bg-white/10 text-white/60 border-0 text-xs">
            {contents.length}
          </Badge>
        </div>
        {showViewAll && (
          <Link href="/explore?view=all" className="flex items-center gap-1 text-sm text-white/60 hover:text-white transition-colors">
            Tout voir
            <ArrowRight className="h-4 w-4" />
          </Link>
        )}
      </div>
      
      {/* Scrollable Container */}
      <div className="relative group/row">
        {/* Left Arrow */}
        {canScrollLeft && (
          <button
            onClick={() => scroll("left")}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/80 border border-white/20 flex items-center justify-center text-white hover:bg-black hover:border-white/40 transition-all opacity-0 group-hover/row:opacity-100"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}
        
        {/* Cards */}
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide px-4 sm:px-8 lg:px-16 pb-2"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {contents.map((content) => (
            <ProjectCard key={content.id} content={content} size={size} />
          ))}
        </div>
        
        {/* Right Arrow */}
        {canScrollRight && (
          <button
            onClick={() => scroll("right")}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/80 border border-white/20 flex items-center justify-center text-white hover:bg-black hover:border-white/40 transition-all opacity-0 group-hover/row:opacity-100"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        )}
      </div>
    </section>
  )
}

/* ---------- CATEGORY TABS ---------- */
function CategoryTabs({ 
  activeTab, 
  onTabChange 
}: { 
  activeTab: "all" | "video" | "text" | "podcast"
  onTabChange: (tab: "all" | "video" | "text" | "podcast") => void 
}) {
  const tabs = [
    { id: "all" as const, label: "Tout", icon: Compass },
    { id: "video" as const, label: "Films & Videos", icon: Film },
    { id: "text" as const, label: "Livres & Articles", icon: BookOpen },
    { id: "podcast" as const, label: "Podcasts", icon: Headphones },
  ]

  return (
    <div className="flex items-center gap-2 px-4 sm:px-8 lg:px-16 py-4 overflow-x-auto">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
            activeTab === tab.id
              ? "bg-emerald-600 text-white"
              : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
          }`}
        >
          <tab.icon className="h-4 w-4" />
          {tab.label}
        </button>
      ))}
    </div>
  )
}

/* ---------- GENRES PAR CATEGORIE ---------- */
const VIDEO_GENRES = [
  { id: "all", label: "Tous les genres" },
  { id: "action", label: "Action" },
  { id: "adventure", label: "Aventure" },
  { id: "animation", label: "Animation" },
  { id: "comedy", label: "Comedie" },
  { id: "crime", label: "Crime / Policier" },
  { id: "documentary", label: "Documentaire" },
  { id: "drama", label: "Drame" },
  { id: "fantasy", label: "Fantastique" },
  { id: "horror", label: "Horreur" },
  { id: "musical", label: "Musical" },
  { id: "mystery", label: "Mystere / Thriller" },
  { id: "romance", label: "Romance" },
  { id: "scifi", label: "Science-Fiction" },
  { id: "war", label: "Guerre" },
  { id: "western", label: "Western" },
  { id: "biopic", label: "Biopic" },
  { id: "historical", label: "Historique" },
  { id: "shortfilm", label: "Court-metrage" },
] as const

const TEXT_GENRES = [
  { id: "all", label: "Tous les genres" },
  { id: "novel", label: "Roman" },
  { id: "thriller", label: "Thriller / Suspense" },
  { id: "romance", label: "Romance" },
  { id: "newromance", label: "New Romance" },
  { id: "fantasy", label: "Fantasy / Fantastique" },
  { id: "scifi", label: "Science-Fiction" },
  { id: "horror", label: "Horreur / Epouvante" },
  { id: "historical", label: "Roman Historique" },
  { id: "biography", label: "Biographie / Memoires" },
  { id: "essay", label: "Essai / Non-fiction" },
  { id: "poetry", label: "Poesie" },
  { id: "shortstory", label: "Nouvelles / Recueils" },
  { id: "youngadult", label: "Young Adult" },
  { id: "children", label: "Jeunesse" },
  { id: "crime", label: "Polar / Crime" },
  { id: "humor", label: "Humour" },
  { id: "selfhelp", label: "Developpement personnel" },
  { id: "travel", label: "Recit de voyage" },
] as const

const PODCAST_GENRES = [
  { id: "all", label: "Tous les genres" },
  { id: "truestory", label: "Histoire vraie / True Crime" },
  { id: "fiction", label: "Fiction / Histoire imaginaire" },
  { id: "documentary", label: "Documentaire audio" },
  { id: "interview", label: "Interview / Talk-show" },
  { id: "news", label: "Actualites / Mediatique" },
  { id: "history", label: "Histoire / Historique" },
  { id: "science", label: "Science / Technologie" },
  { id: "culture", label: "Culture / Societe" },
  { id: "business", label: "Business / Entrepreneuriat" },
  { id: "comedy", label: "Humour / Comedie" },
  { id: "education", label: "Education / Apprentissage" },
  { id: "sports", label: "Sport" },
  { id: "health", label: "Sante / Bien-etre" },
  { id: "politics", label: "Politique / Geopolitique" },
  { id: "music", label: "Musique" },
  { id: "gaming", label: "Jeux video / Gaming" },
  { id: "spirituality", label: "Spiritualite / Religion" },
] as const

/* ---------- GENRE SELECTOR ---------- */
function GenreSelector({
  activeTab,
  selectedGenre,
  onGenreChange,
}: {
  activeTab: "all" | "video" | "text" | "podcast"
  selectedGenre: string
  onGenreChange: (genre: string) => void
}) {
  const genres = activeTab === "video" ? VIDEO_GENRES :
                 activeTab === "text" ? TEXT_GENRES :
                 activeTab === "podcast" ? PODCAST_GENRES : []

  // Show a hint when on "all" tab
  if (activeTab === "all") {
    return (
      <div className="px-4 sm:px-8 lg:px-16 py-4 bg-gradient-to-r from-white/5 to-transparent border-y border-white/10">
        <div className="flex items-center gap-3">
          <SlidersHorizontal className="h-5 w-5 text-amber-400" />
          <span className="text-white/60 text-sm">
            Selectionnez une categorie (<span className="text-emerald-400">Films & Videos</span>, <span className="text-sky-400">Livres & Articles</span>, ou <span className="text-purple-400">Podcasts</span>) pour filtrer par genre
          </span>
        </div>
      </div>
    )
  }

  if (genres.length === 0) return null

  const tabConfig = {
    video: { 
      label: "Filtrer par genre cinematographique", 
      color: "emerald",
      icon: Film,
      gradient: "from-emerald-500/20 via-emerald-500/10 to-transparent",
      borderColor: "border-emerald-500/40"
    },
    text: { 
      label: "Filtrer par genre litteraire", 
      color: "sky",
      icon: BookOpen,
      gradient: "from-sky-500/20 via-sky-500/10 to-transparent",
      borderColor: "border-sky-500/40"
    },
    podcast: { 
      label: "Filtrer par categorie podcast", 
      color: "purple",
      icon: Headphones,
      gradient: "from-purple-500/20 via-purple-500/10 to-transparent",
      borderColor: "border-purple-500/40"
    },
  }[activeTab]

  const colorClasses = {
    emerald: {
      activeBg: "bg-emerald-600",
      hoverBg: "hover:bg-emerald-500/20",
      border: "border-emerald-500/30",
      text: "text-emerald-400",
      glow: "shadow-emerald-500/20"
    },
    sky: {
      activeBg: "bg-sky-600",
      hoverBg: "hover:bg-sky-500/20",
      border: "border-sky-500/30",
      text: "text-sky-400",
      glow: "shadow-sky-500/20"
    },
    purple: {
      activeBg: "bg-purple-600",
      hoverBg: "hover:bg-purple-500/20",
      border: "border-purple-500/30",
      text: "text-purple-400",
      glow: "shadow-purple-500/20"
    },
  }
  const safeColors = colorClasses[tabConfig.color as keyof typeof colorClasses] ?? {
    activeBg: "bg-emerald-600",
    hoverBg: "hover:bg-emerald-500/20",
    border: "border-emerald-500/30",
    text: "text-emerald-400",
    glow: "shadow-emerald-500/20",
  }

  return (
    <div className={`px-4 sm:px-8 lg:px-16 py-5 bg-gradient-to-r ${tabConfig.gradient} border-y ${tabConfig.borderColor}`}>
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${safeColors.activeBg}/20 ${safeColors.border} border`}>
            <tabConfig.icon className={`h-5 w-5 ${safeColors.text}`} />
          </div>
          <div>
            <h3 className="text-white font-semibold text-sm">{tabConfig.label}</h3>
            <p className="text-white/50 text-xs">{genres.length - 1} genres disponibles</p>
          </div>
        </div>
        {selectedGenre !== "all" && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onGenreChange("all")}
            className="border-white/20 text-white/70 hover:bg-white/10 hover:text-white"
          >
            <SlidersHorizontal className="h-3.5 w-3.5 mr-2" />
            Reinitialiser
          </Button>
        )}
      </div>
      
      {/* Genre Pills */}
      <div className="flex flex-wrap gap-2">
        {genres.map((genre) => (
          <button
            key={genre.id}
            onClick={() => onGenreChange(genre.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${
              selectedGenre === genre.id
                ? `${safeColors.activeBg} text-white border-transparent shadow-lg ${safeColors.glow}`
                : `bg-slate-800/50 text-white/70 ${safeColors.border} ${safeColors.hoverBg} hover:text-white hover:border-white/30`
            }`}
          >
            {genre.label}
          </button>
        ))}
      </div>
      
      {/* Active Filter Indicator */}
      {selectedGenre !== "all" && (
        <div className="flex items-center gap-3 mt-4 pt-4 border-t border-white/10">
          <div className="flex items-center gap-2">
            <CheckCircle className={`h-4 w-4 ${safeColors.text}`} />
            <span className="text-white/60 text-sm">Filtre actif:</span>
          </div>
          <Badge className={`${safeColors.activeBg} text-white border-0 px-3 py-1`}>
            {genres.find(g => g.id === selectedGenre)?.label}
          </Badge>
          <button 
            onClick={() => onGenreChange("all")}
            className={`${safeColors.text} hover:text-white text-sm underline underline-offset-2 ml-auto`}
          >
            Effacer le filtre
          </button>
        </div>
      )}
    </div>
  )
}

/* ---------- PAGINATION COMPONENT ---------- */
const ITEMS_PER_PAGE = 12

function PaginationBar({ 
  currentPage, 
  totalPages, 
  onPageChange 
}: { 
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void 
}) {
  // Generate smart page numbers: show first, last, current and nearby pages
  const getPageNumbers = () => {
    const pages: (number | "...")[] = []
    const delta = 2 // Pages to show around current page
    
    // Always show page 1
    pages.push(1)
    
    // Calculate range around current page
    const rangeStart = Math.max(2, currentPage - delta)
    const rangeEnd = Math.min(totalPages - 1, currentPage + delta)
    
    // Add ellipsis if there's a gap after page 1
    if (rangeStart > 2) {
      pages.push("...")
    }
    
    // Add pages in range
    for (let i = rangeStart; i <= rangeEnd; i++) {
      if (!pages.includes(i)) pages.push(i)
    }
    
    // Add ellipsis if there's a gap before last page
    if (rangeEnd < totalPages - 1) {
      pages.push("...")
    }
    
    // Always show last page if more than 1 page
    if (totalPages > 1 && !pages.includes(totalPages)) {
      pages.push(totalPages)
    }
    
    return pages
  }

  const pageNumbers = getPageNumbers()
  
  return (
    <div className="flex items-center justify-center gap-2 py-8 px-4 flex-wrap">
      {/* First page button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onPageChange(1)}
        disabled={currentPage === 1}
        className="text-white/60 hover:text-white hover:bg-white/10 hidden sm:flex"
      >
        <ChevronLeft className="h-4 w-4" />
        <ChevronLeft className="h-4 w-4 -ml-2" />
      </Button>
      
      {/* Previous page button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="text-white/60 hover:text-white hover:bg-white/10"
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="hidden sm:inline">Precedent</span>
      </Button>
      
      {/* Page numbers */}
      <div className="flex items-center gap-1 flex-wrap justify-center">
        {pageNumbers.map((page, index) => (
          page === "..." ? (
            <span key={`ellipsis-${index}`} className="text-white/40 px-2">...</span>
          ) : (
            <button
              key={page}
              type="button"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onPageChange(page as number)
              }}
              className={`w-9 h-9 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                currentPage === page
                  ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30"
                  : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
              }`}
            >
              {page}
            </button>
          )
        ))}
      </div>
      
      {/* Next page button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className="text-white/60 hover:text-white hover:bg-white/10"
      >
        <span className="hidden sm:inline">Suivant</span>
        <ChevronRight className="h-4 w-4" />
      </Button>
      
      {/* Last page button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onPageChange(totalPages)}
        disabled={currentPage === totalPages}
        className="text-white/60 hover:text-white hover:bg-white/10 hidden sm:flex"
      >
        <ChevronRight className="h-4 w-4" />
        <ChevronRight className="h-4 w-4 -ml-2" />
      </Button>
      
      <span className="text-white/40 text-sm ml-4">
        Page {currentPage} sur {totalPages}
      </span>
    </div>
  )
}

/* ---------- MAIN EXPLORER PAGE ---------- */
function ExplorerContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isAuthed, roles } = useAuth()
  
  // Read URL params
  const tabParam = searchParams.get("tab") as "all" | "video" | "text" | "podcast" | null
  const genreParam = searchParams.get("genre") || "all"
  const pageParam = parseInt(searchParams.get("page") || "1", 10)
  
  const [activeTab, setActiveTab] = useState<"all" | "video" | "text" | "podcast">(tabParam || "all")
  const [selectedGenre, setSelectedGenre] = useState<string>(genreParam)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(pageParam)
  
  // Track previous URL params to detect external navigation changes
  const prevTabRef = useRef(tabParam)
  const prevGenreRef = useRef(genreParam)
  const prevPageRef = useRef(pageParam)

  // Sync state with URL params when they change (back/forward navigation or external links)
  useEffect(() => {
    const newTab = tabParam || "all"
    const newGenre = genreParam || "all"
    const newPage = pageParam || 1
    
    // Only update if URL params actually changed (not from our own updates)
    if (prevTabRef.current !== tabParam) {
      setActiveTab(newTab)
      prevTabRef.current = tabParam
    }
    if (prevGenreRef.current !== genreParam) {
      setSelectedGenre(newGenre)
      prevGenreRef.current = genreParam
    }
    if (prevPageRef.current !== pageParam) {
      setCurrentPage(newPage)
      prevPageRef.current = pageParam
    }
  }, [tabParam, genreParam, pageParam])

  // Listen for header navigation events to force re-sync
  useEffect(() => {
    const handleVisualNav = () => {
      // Force re-read URL params after header navigation
      const params = new URLSearchParams(window.location.search)
      const newTab = (params.get("tab") as "all" | "video" | "text" | "podcast") || "all"
      const newGenre = params.get("genre") || "all"
      const newPage = parseInt(params.get("page") || "1", 10)
      
      // Update refs and state
      prevTabRef.current = newTab === "all" ? null : newTab
      prevGenreRef.current = newGenre
      prevPageRef.current = newPage
      
      setActiveTab(newTab)
      setSelectedGenre(newGenre)
      setCurrentPage(newPage)
    }
    
    window.addEventListener("visual-nav", handleVisualNav)
    return () => window.removeEventListener("visual-nav", handleVisualNav)
  }, [])

  // Update URL without triggering re-render loop
  const updateURL = useCallback((tab: string, genre: string, page: number) => {
    const params = new URLSearchParams()
    if (tab !== "all") params.set("tab", tab)
    if (genre !== "all") params.set("genre", genre)
    if (page > 1) params.set("page", page.toString())
    
    const newURL = params.toString() ? `/explore?${params.toString()}` : "/explore"
    router.replace(newURL, { scroll: false })
  }, [router])

  // Reset genre when tab changes
  const handleTabChange = useCallback((tab: "all" | "video" | "text" | "podcast") => {
    // Update refs to prevent useEffect from overwriting
    prevTabRef.current = tab === "all" ? null : tab
    prevGenreRef.current = "all"
    prevPageRef.current = 1
    
    setActiveTab(tab)
    setSelectedGenre("all")
    setCurrentPage(1)
    updateURL(tab, "all", 1)
  }, [updateURL])

  // Handle genre change
  const handleGenreChange = useCallback((genre: string) => {
    prevGenreRef.current = genre === "all" ? "all" : genre
    prevPageRef.current = 1
    
    setSelectedGenre(genre)
    setCurrentPage(1)
    updateURL(activeTab, genre, 1)
  }, [activeTab, updateURL])

  // Handle page change
  const handlePageChange = useCallback((page: number) => {
    prevPageRef.current = page
    
    setCurrentPage(page)
    updateURL(activeTab, selectedGenre, page)
  }, [activeTab, selectedGenre, updateURL])

  // Filter contents based on tab and genre
  const filteredContents = useMemo(() => {
    let contents = ALL_CONTENTS
    if (activeTab !== "all") {
      contents = contents.filter(c => c.contentType === activeTab)
    }
    // Genre filter (mock - in real app, content would have genre field)
    if (selectedGenre !== "all") {
      // Simulate genre filtering by using a deterministic hash
      contents = contents.filter(c => {
        const hash = c.id.charCodeAt(0) + c.title.length
        const genreIndex = hash % 10
        return genreIndex < 5 // Simulate ~50% match for demo
      })
    }
    if (searchQuery) {
      contents = contents.filter(c => 
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.creatorName.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    return contents
  }, [activeTab, selectedGenre, searchQuery])

  // Prepare different sections
  const heroContent = useMemo(() => {
    const sorted = [...filteredContents].sort((a, b) => b.totalVotes - a.totalVotes)
    return sorted[0]
  }, [filteredContents])

  const trendingNow = useMemo(() => {
    return [...filteredContents]
      .filter(c => c.contributorCount >= 30)
      .sort((a, b) => b.contributorCount - a.contributorCount)
      .slice(0, 12)
  }, [filteredContents])

  const risingProjects = useMemo(() => {
    return [...filteredContents]
      .filter(c => {
        const funding = (c.currentInvestment / c.investmentGoal) * 100
        return funding >= 60 && funding < 95
      })
      .sort((a, b) => b.currentInvestment - a.currentInvestment)
      .slice(0, 12)
  }, [filteredContents])

  const closeToTop = useMemo(() => {
    return [...filteredContents]
      .filter(c => {
        const funding = (c.currentInvestment / c.investmentGoal) * 100
        return funding >= 85 && funding < 100
      })
      .slice(0, 12)
  }, [filteredContents])

  const goldCreators = useMemo(() => {
    return filteredContents
      .filter(c => isVerifiedCreator(c.creatorName))
      .slice(0, 12)
  }, [filteredContents])

  const newTalents = useMemo(() => {
    const twoWeeksAgo = new Date()
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14)
    return filteredContents
      .filter(c => new Date(c.createdAt) > twoWeeksAgo)
      .slice(0, 12)
  }, [filteredContents])

  const mostSupported = useMemo(() => {
    return [...filteredContents]
      .sort((a, b) => b.currentInvestment - a.currentInvestment)
      .slice(0, 12)
  }, [filteredContents])

  const forYou = useMemo(() => {
    // Randomize for "personalized" feel
    return [...filteredContents]
      .sort(() => Math.random() - 0.5)
      .slice(0, 12)
  }, [filteredContents])

  // Videos, Texts, Podcasts specific
  const videos = useMemo(() => filteredContents.filter(c => c.contentType === "video").slice(0, 12), [filteredContents])
  const texts = useMemo(() => filteredContents.filter(c => c.contentType === "text").slice(0, 12), [filteredContents])
  const podcasts = useMemo(() => filteredContents.filter(c => c.contentType === "podcast").slice(0, 12), [filteredContents])

  return (
    <div className="min-h-screen bg-slate-950">
      <VisualHeader />

      {/* Hero Section */}
      {heroContent && <ImmersiveHero content={heroContent} />}

      <p className="text-emerald-400/70 text-sm mb-6 italic text-center pt-4">
        Vois-les avant tout le monde — découvre les talents émergents que la communauté propulse.
      </p>

      {/* Category Tabs */}
      <CategoryTabs activeTab={activeTab} onTabChange={handleTabChange} />

      {/* Main Category Title with Traffic Lights */}
      {activeTab !== "all" && (
        <div className="flex items-center justify-center gap-4 sm:gap-6 py-6 px-4">
          {/* Traffic Light Left */}
          <TrafficLight className="scale-125 sm:scale-150" />
          
          {/* Main Title */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white text-center">
            {activeTab === "video" && "Films & Videos"}
            {activeTab === "text" && "Livres & Articles"}
            {activeTab === "podcast" && "Podcasts"}
          </h1>
          
          {/* Traffic Light Right */}
          <TrafficLight className="scale-125 sm:scale-150" />
        </div>
      )}

      {/* Genre Selector */}
      <GenreSelector 
        activeTab={activeTab}
        selectedGenre={selectedGenre}
        onGenreChange={handleGenreChange}
      />

      {/* Search Bar */}
      <div className="px-4 sm:px-8 lg:px-16 py-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
          <Input
            placeholder="Rechercher un projet ou createur..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-emerald-500/50"
          />
        </div>
      </div>

      {/* Content Rows */}
      <div className="pb-20 space-y-2">
        {/* Tendances maintenant */}
        <ContentRow 
          title="Tendances maintenant" 
          icon={Flame} 
          contents={trendingNow}
          accentColor="rose"
          size="large"
        />

        {/* Projets qui montent */}
        <ContentRow 
          title="Projets qui montent" 
          icon={Rocket} 
          contents={risingProjects}
          accentColor="emerald"
        />

        {/* Proches du Top */}
        <ContentRow 
          title="Proches du Top" 
          icon={Trophy} 
          contents={closeToTop}
          accentColor="amber"
        />

        {/* Createurs Gold */}
        {goldCreators.length > 0 && (
          <ContentRow 
            title="Mis en lumiere par VIXUAL" 
            icon={Crown} 
            contents={goldCreators}
            accentColor="amber"
            size="large"
          />
        )}

        {/* Choisis pour vous */}
        <ContentRow 
          title="Choisis pour vous" 
          icon={Sparkles} 
          contents={forYou}
          accentColor="purple"
        />

        {/* Nouveaux talents */}
        <ContentRow 
          title="Nouveaux talents" 
          icon={Star} 
          contents={newTalents}
          accentColor="sky"
        />

        {/* Les plus soutenus */}
        <ContentRow 
          title="Les plus soutenus" 
          icon={Heart} 
          contents={mostSupported}
          accentColor="rose"
        />

        {/* Category-specific rows when viewing all */}
        {activeTab === "all" && (
          <>
            <ContentRow 
              title="Films & Videos" 
              icon={Film} 
              contents={videos}
              accentColor="rose"
            />
            <ContentRow 
              title="Livres & Articles" 
              icon={BookOpen} 
              contents={texts}
              accentColor="amber"
            />
            <ContentRow 
              title="Podcasts" 
              icon={Headphones} 
              contents={podcasts}
              accentColor="purple"
            />
          </>
        )}

        {/* Pagination */}
        <div className="border-t border-white/10 mt-8">
          <PaginationBar
            currentPage={currentPage}
            totalPages={Math.max(15, Math.ceil(filteredContents.length / ITEMS_PER_PAGE))}
            onPageChange={(page) => {
              handlePageChange(page)
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
          />
        </div>
      </div>

      <Footer />
    </div>
  )
}

/* ---------- EXPORT WITH SUSPENSE ---------- */
export default function ExplorePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-white/60">Chargement...</div>
      </div>
    }>
      <ExplorerContent />
    </Suspense>
  )
}
