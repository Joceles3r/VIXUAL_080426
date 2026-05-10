/**
 * COMPOSANT STRUCTUREL VIXUAL
 * Carte de contenu utilisee par toutes les listes/feeds.
 * Modifier avec prudence : impact visuel global.
 */
"use client"

import Image from "next/image"
import Link from "next/link"
import {
  Film, FileText, Mic, Users, Clock, BookOpen, Headphones, Lock, Play,
  Heart, Unlock, Flame, Star, Award, Clapperboard
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useAuth } from "@/lib/auth-context"
import { ReportButton } from "@/components/report-button"
import type { Content } from "@/lib/mock-data"

/* ---------- VIXUAL Badges ---------- */
function getVisualBadges(content: Content) {
  const badges: { label: string; icon: typeof Flame; bg: string }[] = []
  const daysSinceCreation = Math.floor(
    (Date.now() - new Date(content.createdAt).getTime()) / (1000 * 60 * 60 * 24)
  )
  const fundingPercent = (content.currentInvestment / content.investmentGoal) * 100
  if (daysSinceCreation <= 14) badges.push({ label: "Nouveau", icon: Clapperboard, bg: "bg-sky-500/80" })
  if (content.investorCount >= 50) badges.push({ label: "Tendance", icon: Flame, bg: "bg-orange-500/80" })
  if (content.totalVotes >= 250) badges.push({ label: "Soutenu", icon: Star, bg: "bg-amber-500/80" })
  if (fundingPercent >= 90) badges.push({ label: "Top projet", icon: Award, bg: "bg-emerald-500/80" })
  return badges
}

interface ContentCardProps {
  content: Content
}

export function ContentCard({ content }: ContentCardProps) {
  const { isAuthed } = useAuth()
  const isGuestLocked = !isAuthed && !content.isFree
  const progressPercent = Math.min(
    (content.currentInvestment / content.investmentGoal) * 100,
    100
  )
  const cType = content.contentType
  const badges = getVisualBadges(content)

  const badgeConfig = {
    video: { bg: "bg-red-600/90 hover:bg-red-600", icon: Film, label: "Video" },
    text: { bg: "bg-amber-600/90 hover:bg-amber-600", icon: FileText, label: "Ecrit" },
    podcast: { bg: "bg-purple-600/90 hover:bg-purple-600", icon: Mic, label: "Podcast" },
  }[cType]

  return (
    <Link href={`/video/${content.id}`}>
      <Card className="vx-cinema-card group overflow-hidden bg-slate-900/50 border-white/10 hover:border-emerald-500/50 h-full cinema-card">
        <div className="vx-cinema-poster relative aspect-video">
          <Image
            src={content.coverUrl || "/placeholder.svg"}
            alt={content.title}
            fill
            className="object-cover"
            data-poster-img=""
          />

          {/* Badge type */}
          <Badge className={`absolute top-3 left-3 ${badgeConfig.bg} text-white border-0`}>
            <badgeConfig.icon className="h-3 w-3 mr-1" />
            {badgeConfig.label}
          </Badge>

          {/* VIXUAL badges row */}
          {badges.length > 0 && (
            <div className="absolute top-10 left-3 flex gap-1">
              {badges.slice(0, 2).map((b) => (
                <span key={b.label} className={`${b.bg} text-white text-[8px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5`}>
                  <b.icon className="h-2 w-2" />
                  {b.label}
                </span>
              ))}
            </div>
          )}

          {/* Free badge or Lock badge */}
          {content.isFree ? (
            <Badge className="absolute top-3 right-3 bg-emerald-600/90 hover:bg-emerald-600 text-white border-0">
              Gratuit
            </Badge>
          ) : isGuestLocked ? (
            <Badge className="absolute top-3 right-3 bg-slate-700/90 hover:bg-slate-700 text-white/70 border-0">
              <Lock className="h-3 w-3 mr-1" />
              Extrait
            </Badge>
          ) : null}

          {/* Duration/Word count/Episodes */}
          <div className="absolute bottom-3 right-3 flex items-center gap-1 text-white/90 text-sm bg-black/60 px-2 py-1 rounded">
            {cType === "video" && (
              <>
                <Clock className="h-3 w-3" />
                {content.duration}
              </>
            )}
            {cType === "text" && (
              <>
                <BookOpen className="h-3 w-3" />
                {content.wordCount?.toLocaleString()} mots
              </>
            )}
            {cType === "podcast" && (
              <>
                <Headphones className="h-3 w-3" />
                {content.episodeCount} {"ep."} - {content.duration}
              </>
            )}
          </div>

          {/* Hover overlay play button */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-emerald-600/5">
            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
              <Play className="h-5 w-5 text-white fill-white" />
            </div>
          </div>
        </div>

        <CardContent className="p-4 space-y-3">
          <div>
            <h3 className="font-semibold text-white line-clamp-1 group-hover:text-emerald-400 transition-colors">
              {content.title}
            </h3>
            <p className="text-sm text-white/60 mt-1">{content.creatorName}</p>
          </div>

          <p className="text-sm text-white/70 line-clamp-2">
            {content.description}
          </p>

          {/* Progress */}
          <div className="space-y-2">
            <Progress value={progressPercent} className="h-2 bg-slate-800" />
            <div className="flex justify-between text-xs text-white/60">
              <span className="text-emerald-400 font-medium">
                {content.currentInvestment.toLocaleString("fr-FR")}{"\u20ac"}
              </span>
              <span>sur {content.investmentGoal.toLocaleString("fr-FR")}{"\u20ac"}</span>
            </div>
          </div>

          {/* Action buttons row */}
          <div className="flex gap-1 pt-1" onClick={(e) => e.preventDefault()}>
            <Button size="sm" variant="ghost" className="flex-1 h-7 text-[10px] text-white/60 hover:text-white hover:bg-white/10 px-1">
              <Play className="h-3 w-3 mr-1 fill-current" />
              Extrait
            </Button>
            {isAuthed && !content.isFree && (
              <Button size="sm" variant="ghost" className="flex-1 h-7 text-[10px] text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 px-1">
                <Unlock className="h-3 w-3 mr-1" />
                {"D\u00e9bloquer"}
              </Button>
            )}
            <Button size="sm" variant="ghost" className="flex-1 h-7 text-[10px] text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 px-1">
              <Heart className="h-3 w-3 mr-1" />
              Soutenir
            </Button>
          </div>

          {/* Investors + Report */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-sm text-white/60">
              <Users className="h-4 w-4" />
              <span>{content.investorCount} contributeurs</span>
            </div>
            {isAuthed && (
              <div onClick={(e) => e.preventDefault()}>
                <ReportButton
                  targetId={content.id}
                  targetType="content"
                  targetName={content.title}
                  variant="minimal"
                  size="sm"
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
