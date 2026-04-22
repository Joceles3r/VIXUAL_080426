"use client"

import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { useState, useMemo, useCallback, useEffect } from "react"
import {
  ArrowLeft, Film, FileText, Mic, Headphones, Clock, BookOpen, Users,
  Heart, Share2, TrendingUp, Play, Pause, Lock, Unlock, UserPlus,
  Sparkles, CreditCard, Star, Download, MessageSquare, Bookmark,
  Maximize2, Volume2, Settings2, Shield, Flame, Award, Clapperboard,
  Eye, ChevronRight, CheckCircle, AlertCircle, Crown, Zap, Trophy, Loader2, Wallet,
} from "lucide-react"
import { ReportButton } from "@/components/report-button"
import { SupportButton } from "@/components/support-button"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { VisualHeader } from "@/components/visual-header"
import { Footer } from "@/components/footer"
import VisualSocialFeed from "@/components/visual-social-feed"
import { ALL_CONTENTS, isGoldCreator } from "@/lib/mock-data"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/components/ui/use-toast"
import { INVESTMENT_TIERS_EUR } from "@/lib/payout/constants"
import type { ContentType } from "@/lib/visual-social/hybrid"

/* ---------- Motivational Messages ---------- */
function DynamicWatermark({ userId, contentId }: { userId: string; contentId: string }) {
  const [pos, setPos] = useState({ x: 20, y: 20 })
  useEffect(() => {
    const interval = setInterval(() => {
      setPos({ x: Math.random() * 60, y: Math.random() * 70 })
    }, 30000)
    return () => clearInterval(interval)
  }, [])
  const masked = userId.length > 8 ? userId.slice(0, 4) + "****" + userId.slice(-4) : userId
  return (
    <div
      className="absolute z-40 pointer-events-none select-none"
      style={{ left: `${pos.x}%`, top: `${pos.y}%`, opacity: 0.12 }}
    >
      <span className="text-white text-xs font-mono tracking-wide">
        {masked} / {contentId.slice(0, 8)}
      </span>
    </div>
  )
}

/* ---------- VIXUAL Badges ---------- */
function getVisualBadges(content: typeof ALL_CONTENTS[0]) {
  const badges: { label: string; icon: typeof Flame; color: string; bg: string }[] = []
  const daysSinceCreation = Math.floor(
    (Date.now() - new Date(content.createdAt).getTime()) / (1000 * 60 * 60 * 24)
  )
  const fundingPercent = (content.currentInvestment / content.investmentGoal) * 100
  if (daysSinceCreation <= 14) badges.push({ label: "Nouveau", icon: Clapperboard, color: "text-sky-300", bg: "bg-sky-500/80" })
  if (content.investorCount >= 50) badges.push({ label: "Tendance", icon: Flame, color: "text-orange-300", bg: "bg-orange-500/80" })
  if (content.totalVotes >= 250) badges.push({ label: "Soutenu par la communaut\u00e9", icon: Star, color: "text-amber-300", bg: "bg-amber-500/80" })
  if (fundingPercent >= 90) badges.push({ label: "Top projet", icon: Award, color: "text-emerald-300", bg: "bg-emerald-500/80" })
  return badges
}

/* ---------- Motivational Messages ---------- */
function getMotivationalMessages(content: typeof ALL_CONTENTS[0]) {
  const msgs: string[] = []
  const pct = (content.currentInvestment / content.investmentGoal) * 100
  if (pct >= 80) msgs.push("Ce projet approche de son objectif. Votre soutien peut faire la diff\u00e9rence.")
  if (content.investorCount >= 40 && content.investorCount < 50) msgs.push("Ce projet approche du TOP 10.")
  if (pct < 50) msgs.push("Soutenez ce projet pour participer \u00e0 son succ\u00e8s.")
  if (content.totalVotes >= 200) msgs.push("Votre soutien peut aider ce cr\u00e9ateur \u00e0 atteindre le classement.")
  return msgs
}

/* ---------- Quick Investment Amounts ---------- */
const QUICK_AMOUNTS = [3, 5, 10, 20] as const

export default function VideoPage({ params }: { params: { id: string } }) {
  const { id } = params
  const { isAuthed, roles } = useAuth()
  const { toast } = useToast()

  // Guard against undefined or invalid IDs
  if (!id || id === "undefined" || id === "null") {
    notFound()
  }

  const content = ALL_CONTENTS.find((c) => c.id === id)
  if (!content) notFound()

  const [isPlaying, setIsPlaying] = useState(false)
  const [isUnlocked, setIsUnlocked] = useState(content.isFree)
  const [isFavorite, setIsFavorite] = useState(false)
  const [showUnlockConfirm, setShowUnlockConfirm] = useState(false)
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null)
  const [showInvestConfirm, setShowInvestConfirm] = useState(false)
  const [showAllTiers, setShowAllTiers] = useState(false)
  const [isInvesting, setIsInvesting] = useState(false)
  const [playbackProgress, setPlaybackProgress] = useState(35)

  // Anti-copy: block dev tools and context menu shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === "F12" ||
        (e.ctrlKey && ["u", "s", "p"].includes(e.key.toLowerCase())) ||
        (e.ctrlKey && e.shiftKey && ["i", "j", "c"].includes(e.key.toLowerCase()))
      ) {
        e.preventDefault()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  // Simulate playback progress (in real app, would come from video element)
  useEffect(() => {
    if (!isPlaying || !isUnlocked) return
    const interval = setInterval(() => {
      setPlaybackProgress((p) => (p >= 100 ? 0 : p + 0.5))
    }, 1000)
    return () => clearInterval(interval)
  }, [isPlaying, isUnlocked])

  const progressPercent = Math.min((content.currentInvestment / content.investmentGoal) * 100, 100)
  const cType = content.contentType
  const isVideo = cType === "video"
  const isPodcast = cType === "podcast"
  const isGuest = !isAuthed
  const canInvest = isAuthed && (roles.includes("contributor") || roles.includes("contribu_lecteur") || roles.includes("auditeur"))
  const badges = getVisualBadges(content)
  const motivationalMsgs = getMotivationalMessages(content)
  const isGold = isGoldCreator(content.creatorName)

  // Recommendations: same type, exclude current, top 8 by investors
  const recommendations = useMemo(() => {
    return ALL_CONTENTS
      .filter((c) => c.contentType === cType && c.id !== content.id)
      .sort((a, b) => b.investorCount - a.investorCount)
      .slice(0, 8)
  }, [cType, content.id])

  const handleUnlock = useCallback(() => {
    setShowUnlockConfirm(false)
    setIsUnlocked(true)
  }, [])

  const handleInvest = useCallback(async () => {
    if (!selectedAmount || isInvesting) return
    setIsInvesting(true)
    try {
      const res = await fetch("/api/stripe/invest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contentId: content.id,
          amountEur: selectedAmount,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast({ 
          title: "Erreur de contribution", 
          description: data.message || "Une erreur est survenue lors de la contribution.", 
          variant: "destructive" 
        })
      } else if (data.url) {
        // Redirect to Stripe checkout
        window.location.href = data.url
      }
    } catch {
      toast({ 
        title: "Erreur de connexion", 
        description: "Veuillez reessayer.", 
        variant: "destructive" 
      })
    } finally {
      setIsInvesting(false)
      setShowInvestConfirm(false)
      setSelectedAmount(null)
    }
  }, [selectedAmount, isInvesting, content.id])

  return (
    <div className="min-h-screen bg-slate-950">
      <VisualHeader />

      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4">
          {/* Back button */}
          <Link href="/explore" className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-6 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            {"Retour \u00e0 l'exploration"}
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* ==================== MAIN CONTENT (2 cols) ==================== */}
            <div className="lg:col-span-2 space-y-6">

              {/* ---------- STREAM PLAYER ---------- */}
              <div
                className="relative aspect-video rounded-2xl overflow-hidden bg-slate-900 group/player shadow-2xl shadow-black/50 select-none"
                onContextMenu={(e) => e.preventDefault()}
              >
                <Image src={content.coverUrl || "/placeholder.svg"} alt={content.title} fill className="object-cover pointer-events-none" priority />
                {/* Dynamic watermark for DRM */}
                {isUnlocked && isAuthed && <DynamicWatermark userId={roles[0] || "user"} contentId={content.id} />}

                {/* Dark overlay */}
                <div className={`absolute inset-0 transition-colors ${isPlaying ? "bg-black/20" : "bg-black/50"}`} />

                {/* Locked overlay for guests */}
                {isGuest && !content.isFree ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-center px-6 z-10">
                    <div className="w-20 h-20 rounded-full bg-slate-800/80 backdrop-blur-sm flex items-center justify-center border border-white/20">
                      <Lock className="h-10 w-10 text-white/70" />
                    </div>
                    <div>
                      <p className="text-white font-semibold text-lg mb-1">{"Contenu r\u00e9serv\u00e9 aux membres"}</p>
                      <p className="text-white/60 text-sm mb-4">{"Inscrivez-vous pour acc\u00e9der \u00e0 ce contenu"}</p>
                    </div>
                    <div className="flex gap-3">
                      <Link href="/signup">
                        <Button className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white">
                          <UserPlus className="mr-2 h-4 w-4" />
                          {"Cr\u00e9er un compte"}
                        </Button>
                      </Link>
                      <Link href="/login">
                        <Button variant="outline" className="bg-transparent border-white/20 text-white hover:bg-white/10">
                          Se connecter
                        </Button>
                      </Link>
                    </div>
                  </div>
                ) : !isUnlocked ? (
                  /* Token unlock overlay */
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-center px-6 z-10">
                    {showUnlockConfirm ? (
                      <div className="bg-slate-900/90 backdrop-blur-md rounded-2xl p-8 border border-emerald-500/20 max-w-sm">
                        <Unlock className="h-10 w-10 text-emerald-400 mx-auto mb-4" />
                        <h3 className="text-white font-bold text-lg mb-2">{"D\u00e9bloquer ce contenu"}</h3>
                        <p className="text-white/60 text-sm mb-4">
                          {"Un jeton d'acc\u00e8s temporaire sera g\u00e9n\u00e9r\u00e9. Vous pourrez visionner ou t\u00e9l\u00e9charger ce contenu."}
                        </p>
                        <div className="space-y-2 mb-4 text-left">
                          <div className="flex items-center gap-2 text-white/50 text-xs">
                            <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
                            {"Jeton streaming : acc\u00e8s imm\u00e9diat"}
                          </div>
                          <div className="flex items-center gap-2 text-white/50 text-xs">
                            <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
                            {"Jeton t\u00e9l\u00e9chargement : sauvegarde locale"}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button onClick={handleUnlock} className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white">
                            Confirmer
                          </Button>
                          <Button onClick={() => setShowUnlockConfirm(false)} variant="outline" className="flex-1 border-white/20 text-white hover:bg-white/10">
                            Annuler
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={() => setShowUnlockConfirm(true)}
                          className="w-20 h-20 rounded-full bg-emerald-500/20 backdrop-blur-sm flex items-center justify-center hover:bg-emerald-500/30 transition-colors border border-emerald-500/30"
                        >
                          <Unlock className="h-10 w-10 text-emerald-400" />
                        </button>
                        <p className="text-white/70 text-sm font-medium">{"Cliquez pour d\u00e9bloquer le contenu complet"}</p>
                      </>
                    )}
                  </div>
                ) : (
                  /* Playable content */
                  <>
                    {/* ── BUNNY CDN : module non encore connecté ── */}
                    {/* Overlay Coming Soon - À SUPPRIMER quand Bunny.net sera actif */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center z-30 bg-gradient-to-b from-black/60 via-black/70 to-black/80">
                      <div className="w-20 h-20 rounded-full bg-emerald-500/20 backdrop-blur-sm flex items-center justify-center border border-emerald-500/30 mb-4">
                        <Play className="h-10 w-10 text-emerald-400 ml-1" />
                      </div>
                      <h3 className="text-white font-bold text-xl mb-2">Streaming bientot disponible</h3>
                      <p className="text-white/60 text-sm text-center max-w-xs mb-4">
                        Le module de streaming est en cours d'activation. Revenez tres bientot pour visionner ce contenu.
                      </p>
                      <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-emerald-400 text-sm font-medium">Lancement imminent</span>
                      </div>
                    </div>

                    {/* Center play/pause - Masqué temporairement, changer {false &&} en {true &&} pour activer */}
                    {false && <button
                      onClick={() => setIsPlaying(!isPlaying)}
                      className={`absolute inset-0 flex items-center justify-center z-10 transition-opacity ${isPlaying ? "opacity-0 group-hover/player:opacity-100" : "opacity-100"}`}
                    >
                      <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors border border-white/30">
                        {isPlaying ? (
                          <Pause className="h-10 w-10 text-white" />
                        ) : isVideo ? (
                          <Play className="h-10 w-10 text-white ml-1" />
                        ) : isPodcast ? (
                          <Headphones className="h-10 w-10 text-white" />
                        ) : (
                          <BookOpen className="h-10 w-10 text-white" />
                        )}
                      </div>
                    </button>}

                    {/* Player controls bar */}
                    <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4 z-20 transition-opacity ${isPlaying ? "opacity-0 group-hover/player:opacity-100" : "opacity-100"}`}>
                      {/* Progress bar */}
                      <div className="w-full h-1 bg-white/20 rounded-full mb-3 cursor-pointer group/bar">
                        <div
                          className="h-full bg-emerald-500 rounded-full relative group-hover/bar:h-1.5 transition-all"
                          style={{ width: `${playbackProgress}%` }}
                        >
                          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-emerald-400 rounded-full opacity-0 group-hover/bar:opacity-100 transition-opacity" />
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <button onClick={() => setIsPlaying(!isPlaying)} className="text-white hover:text-emerald-400 transition-colors">
                            {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 fill-current" />}
                          </button>
                          <button className="text-white/60 hover:text-white transition-colors">
                            <Volume2 className="h-5 w-5" />
                          </button>
                          <span className="text-white/50 text-xs">{"05:32 / "}{content.duration || "18:45"}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <button className="text-white/60 hover:text-white transition-colors" title="Partager">
                            <Share2 className="h-4 w-4" />
                          </button>
                          <button className="text-white/60 hover:text-white transition-colors" title={"Qualit\u00e9"}>
                            <Settings2 className="h-4 w-4" />
                          </button>
                          <button className="text-white/60 hover:text-white transition-colors" title={"Plein \u00e9cran"}>
                            <Maximize2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Badge type */}
                <Badge className={`absolute top-4 left-4 z-30 ${isVideo ? "bg-red-600/90" : isPodcast ? "bg-purple-600/90" : "bg-amber-600/90"} text-white border-0`}>
                  {isVideo && <><Film className="h-3 w-3 mr-1" />{"Vid\u00e9o"}</>}
                  {cType === "text" && <><FileText className="h-3 w-3 mr-1" />{"\u00c9crit"}</>}
                  {isPodcast && <><Mic className="h-3 w-3 mr-1" />Podcast</>}
                </Badge>

                {/* VIXUAL + Gold badges */}
                <div className="absolute top-12 left-4 z-30 flex flex-wrap gap-1">
                  {isGold && (
                    <Badge className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white border-0 text-[10px] shadow-lg shadow-amber-500/20">
                      <Crown className="h-3 w-3 mr-1" />
                      Créateur Gold
                    </Badge>
                  )}
                  {badges.map((b) => (
                    <Badge key={b.label} className={`${b.bg} text-white border-0 text-[10px]`}>
                      <b.icon className="h-3 w-3 mr-1" />
                      {b.label}
                    </Badge>
                  ))}
                </div>

                {/* Free badge */}
                {content.isFree && (
                  <Badge className="absolute top-4 right-4 z-30 bg-emerald-600/90 text-white border-0">
                    Gratuit
                  </Badge>
                )}
              </div>

              {/* ---------- ENCADRE PROJET (below player) ---------- */}
              <div className="bg-slate-900/60 border border-white/10 rounded-xl p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1.5 text-balance">{content.title}</h1>
                    <div className="flex flex-wrap items-center gap-3 text-sm">
                      <Link href="#" className="flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 font-medium transition-colors">
                        {content.creatorName}
                        {isGold && <Crown className="h-3.5 w-3.5 text-amber-400" />}
                      </Link>
                      <span className="text-white/30">|</span>
                      <span className="flex items-center gap-1 text-white/50">
                        {isVideo && <><Clock className="h-3.5 w-3.5" />{content.duration}</>}
                        {cType === "text" && <><BookOpen className="h-3.5 w-3.5" />{content.wordCount?.toLocaleString()} mots</>}
                        {isPodcast && <><Headphones className="h-3.5 w-3.5" />{content.episodeCount} {"\u00e9pisodes"}</>}
                      </span>
                      <span className="text-white/30">|</span>
                      <Badge variant="outline" className="border-white/15 text-white/50 text-xs">{content.category}</Badge>
                      {isGold && (
                        <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/20 text-[10px]">
                          <Shield className="h-3 w-3 mr-1" />
                          Trust : Excellent
                        </Badge>
                      )}
                    </div>
                  </div>
                  {/* Compact funding pill */}
                  <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/15 rounded-lg px-3 py-2 shrink-0">
                    <div className="text-right">
                      <div className="text-emerald-400 font-bold text-sm">{progressPercent.toFixed(0)}%</div>
                      <div className="text-white/40 text-[10px]">{"financ\u00e9"}</div>
                    </div>
                    <div className="w-16">
                      <Progress value={progressPercent} className="h-1.5 bg-slate-800" />
                    </div>
                  </div>
                </div>

                {/* Investissement minimum info */}
                <div className="flex items-center gap-2 p-2.5 bg-white/[0.02] rounded-lg border border-white/5">
                  <CreditCard className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span className="text-white/60 text-xs">{"Investissement minimum : trois euros"}</span>
                  <span className="text-white/30 mx-1">-</span>
                  <span className="text-white/60 text-xs">{content.investorCount} investisseurs</span>
                  <span className="text-white/30 mx-1">-</span>
                  <span className="text-emerald-400 text-xs font-medium">{content.currentInvestment.toLocaleString()}{"\u20ac"} sur {content.investmentGoal.toLocaleString()}{"\u20ac"}</span>
                </div>
              </div>

              {/* ---------- ACTION BUTTONS ROW ---------- */}
              <div className="flex flex-wrap gap-2">
                {isGuest ? (
                  <Link href="/signup">
                    <Button variant="outline" className="bg-transparent border-white/20 text-white/50 hover:bg-white/10">
                      <Lock className="h-4 w-4 mr-2" />
                      Inscrivez-vous pour interagir
                    </Button>
                  </Link>
                ) : (
                  <>
                    {!isUnlocked && !content.isFree && (
                      <Button onClick={() => setShowUnlockConfirm(true)} className="bg-emerald-600 hover:bg-emerald-500 text-white">
                        <Play className="h-4 w-4 mr-2 fill-current" />
                        {"Voir l'extrait"}
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      onClick={() => setIsFavorite(!isFavorite)}
                      className={`bg-transparent border-white/20 hover:bg-white/10 ${isFavorite ? "text-red-400 border-red-500/30" : "text-white"}`}
                    >
                      <Heart className={`h-4 w-4 mr-2 ${isFavorite ? "fill-current" : ""}`} />
                      {isFavorite ? "Favori" : "J'aime"}
                    </Button>
                    <SupportButton
                      creatorId={content.creator.id || "creator-1"}
                      creatorName={content.creator.name}
                      projectId={content.id}
                      projectTitle={content.title}
                      variant="outline"
                      className="bg-transparent border-rose-500/30 text-rose-400 hover:bg-rose-500/10"
                    />
                    <Button variant="outline" className="bg-transparent border-white/20 text-white hover:bg-white/10">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Commenter
                    </Button>
                    <Button variant="outline" className="bg-transparent border-white/20 text-white hover:bg-white/10">
                      <Bookmark className="h-4 w-4 mr-2" />
                      Favoris
                    </Button>
                    <Button variant="outline" className="bg-transparent border-white/20 text-white hover:bg-white/10">
                      <Share2 className="h-4 w-4 mr-2" />
                      Partager
                    </Button>
                    {isUnlocked && !content.isFree && (
                      <Button variant="outline" className="bg-transparent border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10">
                        <Download className="h-4 w-4 mr-2" />
                        {"T\u00e9l\u00e9charger"}
                      </Button>
                    )}
                    <ReportButton targetId={content.id} targetType="content" targetName={content.title} variant="full" size="sm" />
                  </>
                )}
              </div>

              {/* ---------- MOTIVATIONAL MESSAGES ---------- */}
              {motivationalMsgs.length > 0 && (
                <div className="space-y-2">
                  {motivationalMsgs.map((msg) => (
                    <div key={msg} className="flex items-center gap-2.5 p-3 bg-gradient-to-r from-emerald-500/5 to-teal-500/5 rounded-lg border border-emerald-500/10">
                      <Sparkles className="h-4 w-4 text-emerald-400 shrink-0" />
                      <p className="text-white/70 text-sm">{msg}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* ---------- DESCRIPTION ---------- */}
              <Card className="bg-slate-900/50 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-white/70 leading-relaxed">{content.description}</p>
                </CardContent>
              </Card>

              {/* ---------- VIXUAL SOCIAL THREAD ---------- */}
              <Card className="bg-slate-900/50 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-emerald-400" />
                    {"Communaut\u00e9 Vixual Social"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                  <VisualSocialFeed mode="content" contentType={cType as ContentType} contentId={content.id} />
                </CardContent>
              </Card>

              {/* ---------- RECOMMENDATIONS ---------- */}
              {recommendations.length > 0 && (
                <div>
                  <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-emerald-400" />
                    Vous aimerez aussi
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {recommendations.map((rec) => {
                      const recIsGold = isGoldCreator(rec.creatorName)
                      return (
                        <Link key={rec.id} href={`/video/${rec.id}`} className="group/rec block">
                          <div className="relative aspect-[16/10] rounded-xl overflow-hidden mb-2 border border-white/5 hover:border-emerald-500/20 transition-colors">
                            <Image src={rec.coverUrl || "/placeholder.svg"} alt={rec.title} fill className="object-cover transition-transform duration-300 group-hover/rec:scale-105" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                            <div className="absolute bottom-0 left-0 right-0 p-2.5">
                              <p className="text-white text-xs font-medium line-clamp-1">{rec.title}</p>
                              <div className="flex items-center gap-1">
                                <p className="text-white/50 text-[10px]">{rec.creatorName}</p>
                                {recIsGold && <Crown className="h-2.5 w-2.5 text-amber-400" />}
                              </div>
                            </div>
                            {/* Duration pill */}
                            <div className="absolute top-1.5 right-1.5 bg-black/70 text-white text-[9px] px-1.5 py-0.5 rounded backdrop-blur-sm">
                              {rec.duration || `${rec.wordCount?.toLocaleString()} mots`}
                            </div>
                            {/* Hover play */}
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/rec:opacity-100 transition-opacity bg-emerald-600/10">
                              <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/20">
                                <Play className="h-4 w-4 text-white fill-white" />
                              </div>
                            </div>
                            {/* Funding mini-bar */}
                            <div className="absolute bottom-0 left-0 right-0 h-0.5">
                              <div className="h-full bg-emerald-500" style={{ width: `${Math.min((rec.currentInvestment / rec.investmentGoal) * 100, 100)}%` }} />
                            </div>
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* ==================== SIDEBAR ==================== */}
            <div className="space-y-5">

              {/* --- Soutenir ce projet --- */}
              <Card className="bg-gradient-to-br from-emerald-950/50 to-teal-950/50 border-emerald-500/20">
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Heart className="h-5 w-5 text-emerald-400" />
                    <h3 className="text-white font-semibold">Soutenez ce projet</h3>
                  </div>
                  <p className="text-white/50 text-xs mb-4">
                    {"Soutenez ce projet pour acc\u00e9der \u00e0 la version compl\u00e8te et participer \u00e0 son classement."}
                  </p>

                  {/* Progress */}
                  <div className="space-y-2 mb-4">
                    <Progress value={progressPercent} className="h-3 bg-slate-800" />
                    <div className="flex justify-between text-sm">
                      <span className="text-emerald-400 font-bold">{content.currentInvestment.toLocaleString()}{"\u20ac"}</span>
                      <span className="text-white/50">sur {content.investmentGoal.toLocaleString()}{"\u20ac"}</span>
                    </div>
                    <div className="text-center">
                      <span className="text-white/40 text-xs">{progressPercent.toFixed(0)}% {"financ\u00e9"}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-2 py-2.5 bg-slate-800/50 rounded-lg mb-4">
                    <Users className="h-4 w-4 text-emerald-400" />
                    <span className="text-white/80 text-sm font-medium">{content.investorCount} investisseurs</span>
                  </div>

                  {/* Motivational */}
                  {motivationalMsgs.length > 0 && (
                    <div className="p-2.5 bg-emerald-500/5 rounded-lg border border-emerald-500/10 mb-4">
                      <p className="text-emerald-400/80 text-[11px] text-center">{motivationalMsgs[0]}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* --- Comprendre votre contribution --- */}
              <Card className="bg-gradient-to-br from-emerald-900/20 to-teal-900/20 border-emerald-500/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white flex items-center gap-2 text-sm">
                    <AlertCircle className="h-4 w-4 text-emerald-400" />
                    Comprendre votre contribution
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <ul className="space-y-2 text-xs">
                    <li className="flex items-start gap-2">
                      <div className="h-5 w-5 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0 mt-0.5">
                        <CheckCircle className="h-3 w-3 text-emerald-400" />
                      </div>
                      <span className="text-white/70">Vous obtenez des <span className="text-emerald-400 font-medium">votes</span> proportionnels a votre contribution</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="h-5 w-5 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0 mt-0.5">
                        <TrendingUp className="h-3 w-3 text-amber-400" />
                      </div>
                      <span className="text-white/70">Vous influencez le <span className="text-amber-400 font-medium">classement</span> du projet</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="h-5 w-5 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0 mt-0.5">
                        <Wallet className="h-3 w-3 text-purple-400" />
                      </div>
                      <span className="text-white/70">Vous pouvez generer un <span className="text-purple-400 font-medium">gain</span> si le projet reussit</span>
                    </li>
                  </ul>
                  {/* Mini simulateur interactif */}
                  <div className="p-3 bg-slate-800/50 rounded-lg border border-white/5">
                    <p className="text-white/50 text-[10px] uppercase tracking-wider mb-2">Estimation de gains</p>
                    <div className="grid grid-cols-2 gap-2 text-center">
                      <div className="p-2 rounded bg-amber-500/10 border border-amber-500/20">
                        <p className="text-amber-400 font-bold text-sm">TOP 10</p>
                        {selectedAmount ? (
                          <p className="text-amber-300 font-semibold text-xs">
                            {(selectedAmount * 1.15).toFixed(2)}€ – {(selectedAmount * 1.30).toFixed(2)}€
                          </p>
                        ) : (
                          <p className="text-white/60 text-xs">+15% a +30%</p>
                        )}
                      </div>
                      <div className="p-2 rounded bg-emerald-500/10 border border-emerald-500/20">
                        <p className="text-emerald-400 font-bold text-sm">TOP 5</p>
                        {selectedAmount ? (
                          <p className="text-emerald-300 font-semibold text-xs">
                            {(selectedAmount * 1.30).toFixed(2)}€ – {(selectedAmount * 1.50).toFixed(2)}€
                          </p>
                        ) : (
                          <p className="text-white/60 text-xs">+30% a +50%</p>
                        )}
                      </div>
                    </div>
                    {selectedAmount ? (
                      <p className="text-white/40 text-[9px] text-center mt-2">Estimation indicative — gains reels selon classement final</p>
                    ) : (
                      <p className="text-white/30 text-[9px] text-center mt-2">Selectionnez un montant pour voir votre estimation</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* --- Investment Card --- */}
              <Card className="bg-slate-900/50 border-white/10 sticky top-28">
                <CardHeader className="pb-3">
                  <CardTitle className="text-white flex items-center gap-2 text-base">
                    <TrendingUp className="h-5 w-5 text-emerald-400" />
                    Contribuer au projet
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {canInvest ? (
                    <div className="space-y-4">
                      <p className="text-white/50 text-xs text-center">{"Choisissez votre montant de contribution"}</p>

                      {/* Quick amounts */}
                      <div className="grid grid-cols-4 gap-2">
                        {QUICK_AMOUNTS.map((amt) => (
                          <button
                            key={amt}
                            onClick={() => setSelectedAmount(selectedAmount === amt ? null : amt)}
                            className={`py-2.5 rounded-lg text-sm font-bold border transition-all ${
                              selectedAmount === amt
                                ? "bg-emerald-600 text-white border-emerald-500 shadow-lg shadow-emerald-500/20"
                                : "bg-transparent border-emerald-500/30 text-emerald-400 hover:bg-emerald-600/10 hover:border-emerald-500/50"
                            }`}
                          >
                            {amt}{"\u20ac"}
                          </button>
                        ))}
                      </div>

                      {/* All tiers toggle */}
                      <button
                        onClick={() => setShowAllTiers(!showAllTiers)}
                        className="w-full text-center text-white/40 text-[11px] hover:text-white/60 transition-colors flex items-center justify-center gap-1"
                      >
                        <ChevronRight className={`h-3 w-3 transition-transform ${showAllTiers ? "rotate-90" : ""}`} />
                        {showAllTiers ? "Masquer les autres montants" : "Voir tous les montants"}
                      </button>

                      {showAllTiers && (
                        <div className="grid grid-cols-5 gap-1.5">
                          {INVESTMENT_TIERS_EUR.filter((t) => !QUICK_AMOUNTS.includes(t as typeof QUICK_AMOUNTS[number])).map((amt) => (
                            <button
                              key={amt}
                              onClick={() => setSelectedAmount(selectedAmount === amt ? null : amt)}
                              className={`py-2 rounded-lg text-xs font-bold border transition-all ${
                                selectedAmount === amt
                                  ? "bg-emerald-600 text-white border-emerald-500"
                                  : "bg-transparent border-white/10 text-white/50 hover:bg-white/5 hover:border-white/20"
                              }`}
                            >
                              {amt}{"\u20ac"}
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Investment confirmation */}
                      {selectedAmount && !showInvestConfirm && (
                        <Button
                          onClick={() => setShowInvestConfirm(true)}
                          className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white h-12 text-lg shadow-lg shadow-emerald-500/20"
                        >
                          Investir {selectedAmount}{"\u20ac"}
                        </Button>
                      )}

                      {!selectedAmount && (
                        <Button disabled className="w-full bg-slate-800 text-white/30 h-12 text-lg cursor-not-allowed">
                          {"S\u00e9lectionnez un montant"}
                        </Button>
                      )}

                      {/* Confirm modal inline */}
                      {showInvestConfirm && selectedAmount && (
                        <div className="p-4 bg-emerald-500/5 border border-emerald-500/15 rounded-xl space-y-3">
                          <div className="text-center">
                            <CheckCircle className="h-8 w-8 text-emerald-400 mx-auto mb-2" />
                            <p className="text-white font-semibold text-sm">Confirmer votre investissement</p>
                            <p className="text-emerald-400 font-bold text-2xl mt-1">{selectedAmount}{"\u20ac"}</p>
                          </div>
                          <p className="text-white/40 text-[11px] text-center">
                            {"Investir comporte des risques. Les gains ne sont pas garantis."}
                          </p>
                          <div className="flex gap-2">
                            <Button
                              onClick={handleInvest}
                              disabled={isInvesting}
                              className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-60"
                            >
                              {isInvesting ? (
                                <>
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  Traitement...
                                </>
                              ) : (
                                "Confirmer"
                              )}
                            </Button>
                            <Button
                              onClick={() => setShowInvestConfirm(false)}
                              disabled={isInvesting}
                              variant="outline"
                              className="flex-1 border-white/20 text-white hover:bg-white/10"
                            >
                              Annuler
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : isAuthed ? (
                    <div className="space-y-4">
                      <div className="p-4 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-lg border border-emerald-500/20">
                        <div className="flex items-center gap-2 mb-2">
                          <Sparkles className="h-5 w-5 text-emerald-400" />
                          <h4 className="text-white font-semibold text-sm">Soutenez les projets qui vous inspirent</h4>
                        </div>
                        <p className="text-white/60 text-sm mb-3">
                          {"Investissez dans ce "}
                          {isVideo ? "projet audiovisuel" : isPodcast ? "podcast" : "contenu litt\u00e9raire"}
                          {" et recevez des retours sur vos gains. Choisissez un montant entre deux et vingt euros."}
                        </p>
                        <Link href="/dashboard/settings">
                          <Button className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white">
                            <CreditCard className="h-4 w-4 mr-2" />
                            {"Devenir "}
                            {isVideo ? "Contributeur" : isPodcast ? "Auditeur" : "Contribu-lecteur"}
                          </Button>
                        </Link>
                        <p className="text-xs text-white/40 text-center mt-2">{"Caution remboursable en cas de r\u00e9siliation"}</p>
                      </div>
                      <Link href="/dashboard/visupoints">
                        <Button variant="outline" className="w-full bg-transparent border-amber-500/30 text-amber-400 hover:bg-amber-600/10">
                          <Star className="h-4 w-4 mr-2" />
                          Gagner des VIXUpoints en partageant
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="text-center space-y-3">
                      <p className="text-white/60 text-sm">{"Connectez-vous pour investir dans ce projet"}</p>
                      <Link href="/signup">
                        <Button className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white">
                          {"Cr\u00e9er un compte"}
                        </Button>
                      </Link>
                      <Link href="/login">
                        <Button variant="outline" className="w-full bg-transparent border-white/20 text-white hover:bg-white/10">
                          Se connecter
                        </Button>
                      </Link>
                    </div>
                  )}

                  {/* Legal */}
                  <div className="pt-2 border-t border-white/5">
                    <p className="text-xs text-white/30 text-center">
                      {"Investir comporte des risques. Les gains ne sont pas garantis. VIXUAL n'est pas un jeu de hasard."}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* --- Creator Card --- */}
              <Card className="bg-slate-900/50 border-white/10">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
                      isGold ? "bg-gradient-to-br from-amber-500 to-yellow-500" : "bg-emerald-500/20"
                    }`}>
                      <span className={`font-bold ${isGold ? "text-white" : "text-emerald-400"}`}>{content.creatorName.charAt(0)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-medium text-white truncate">{content.creatorName}</span>
                        {isGold && <Crown className="h-3.5 w-3.5 text-amber-400 shrink-0" />}
                      </div>
                      <div className="text-sm text-white/50">{"Cr\u00e9ateur VIXUAL"}</div>
                    </div>
                  </div>
                  {isGold && (
                    <div className="flex items-center gap-1.5 p-2 bg-amber-500/5 rounded-lg border border-amber-500/10 mb-3">
                      <Trophy className="h-3.5 w-3.5 text-amber-400" />
                      <span className="text-amber-400/80 text-[11px]">Créateur Gold</span>
                      <span className="text-white/20 mx-0.5">|</span>
                      <Shield className="h-3.5 w-3.5 text-emerald-400" />
                      <span className="text-emerald-400/80 text-[11px]">Trust : Excellent</span>
                    </div>
                  )}
                  <p className="text-white/40 text-xs mb-3">
                    {"Votre projet peut trouver son public sur VIXUAL."}
                  </p>
                  <Button variant="outline" className="w-full bg-transparent border-white/15 text-white/70 hover:bg-white/5 hover:text-white">
                    <Eye className="h-4 w-4 mr-2" />
                    Voir le profil
                  </Button>
                </CardContent>
              </Card>

              {/* --- Parcours VIXUAL --- */}
              <Card className="bg-slate-900/30 border-white/5">
                <CardContent className="p-4">
                  <h4 className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-3">Parcours VIXUAL</h4>
                  <div className="space-y-2">
                    {[
                      { icon: Eye, label: "D\u00e9couvrir le projet", done: true },
                      { icon: Play, label: "Voir l'extrait gratuit", done: isPlaying || isUnlocked },
                      { icon: Heart, label: "Soutenir / Investir", done: false },
                      { icon: Unlock, label: "Visionnage complet", done: isUnlocked },
                      { icon: Trophy, label: "Classement & gains", done: false },
                    ].map((step, i) => (
                      <div key={step.label} className="flex items-center gap-2.5">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${step.done ? "bg-emerald-500/20" : "bg-white/5"}`}>
                          <step.icon className={`h-3 w-3 ${step.done ? "text-emerald-400" : "text-white/30"}`} />
                        </div>
                        <span className={`text-xs ${step.done ? "text-white/70" : "text-white/30"}`}>{step.label}</span>
                        {i < 4 && <div className="flex-1 border-b border-dashed border-white/5" />}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* --- Anti-piracy --- */}
              <div className="flex items-center gap-2 p-3 rounded-lg bg-slate-900/30 border border-white/5">
                <Shield className="h-4 w-4 text-emerald-500 shrink-0" />
                <p className="text-white/40 text-[11px]">
                  {"Sur VIXUAL, chaque visionnage contribue \u00e0 soutenir les cr\u00e9ateurs."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
