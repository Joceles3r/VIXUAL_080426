"use client"

import VisualSocialFeed from "@/components/visual-social-feed"
import { VisualHeader } from "@/components/visual-header"
import { Footer } from "@/components/footer"
import { TrafficLight } from "@/components/traffic-light"
import { Card, CardContent } from "@/components/ui/card"
import {
  MessageCircle, Shield, Sparkles, Clock, Hash,
  Ban, Star, Users, Info, ThumbsUp,
} from "lucide-react"
import {
  MAX_BODY_LENGTH, MAX_TAGS_PER_POST, MAX_POSTS_PER_DAY,
  VISUAL_SOCIAL_ENABLE_VISUPOINTS_V1, REPORT_THRESHOLD_HIDE,
  TAG_CATEGORIES, TAG_LABELS, TAG_COLORS,
} from "@/lib/visual-social/hybrid"

function RulesCard() {
  const rules = [
    { icon: MessageCircle, text: `${MAX_BODY_LENGTH} caract\u00e8res max par post`, color: "text-emerald-400" },
    { icon: Hash, text: `1 \u00e0 ${MAX_TAGS_PER_POST} tags obligatoires par post`, color: "text-sky-400" },
    { icon: Clock, text: `${MAX_POSTS_PER_DAY} posts maximum par jour`, color: "text-amber-400" },
    { icon: Ban, text: "Pas de liens, images ou HTML", color: "text-red-400" },
    { icon: Shield, text: `${REPORT_THRESHOLD_HIDE} signalements = masquage automatique`, color: "text-purple-400" },
    { icon: ThumbsUp, text: "1 r\u00e9ponse par post (profondeur 1 max)", color: "text-teal-400" },
  ]
  return (
    <Card className="bg-slate-900/40 border-white/5">
      <CardContent className="p-4">
        <h3 className="text-white/70 text-sm font-semibold mb-3 flex items-center gap-2">
          <Shield className="h-4 w-4 text-emerald-400" />
          {"R\u00e8gles VIXUAL Social"}
        </h3>
        <div className="space-y-2">
          {rules.map((rule) => (
            <div key={rule.text} className="flex items-start gap-2 text-xs">
              <rule.icon className={`h-3.5 w-3.5 ${rule.color} mt-0.5 shrink-0`} />
              <span className="text-white/50">{rule.text}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function TagsCard() {
  return (
    <Card className="bg-slate-900/40 border-white/5">
      <CardContent className="p-4">
        <h3 className="text-white/70 text-sm font-semibold mb-3 flex items-center gap-2">
          <Hash className="h-4 w-4 text-sky-400" />
          Tags officiels
        </h3>
        <div className="space-y-3">
          {TAG_CATEGORIES.map((cat) => (
            <div key={cat.key}>
              <p className="text-white/30 text-[10px] font-medium uppercase tracking-wider mb-1">{cat.label}</p>
              <div className="flex flex-wrap gap-1">
                {cat.tags.map((tag) => (
                  <span key={tag} className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium border ${TAG_COLORS[tag]}`}>
                    {"#"}{TAG_LABELS[tag]}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function V1Notice() {
  return (
    <Card className="bg-amber-500/5 border-amber-500/15">
      <CardContent className="p-4">
        <h3 className="text-amber-400/80 text-sm font-semibold mb-2 flex items-center gap-2">
          <Info className="h-4 w-4" />
          Version 1
        </h3>
        <div className="space-y-1.5 text-xs text-white/40">
          <p>{"Les VIXUpoints sont temporairement d\u00e9sactiv\u00e9s sur VIXUAL Social en V1 pour garantir l'\u00e9quilibre du syst\u00e8me."}</p>
          <p>{"Le mode fonctionne actuellement en mock (donn\u00e9es de d\u00e9monstration). La connexion \u00e0 la base de donn\u00e9es sera activ\u00e9e en V2."}</p>
          <p>{"Deux vues disponibles : le fil global (ici) et les discussions sous chaque contenu."}</p>
        </div>
      </CardContent>
    </Card>
  )
}

export default function VixualSocialPage() {
  return (
    <div className="min-h-screen bg-slate-950">
      <VisualHeader />
      <main className="pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-1.5 mb-4">
              <Sparkles className="h-4 w-4 text-emerald-400" />
              <span className="text-emerald-400 text-sm font-medium">{"Mini-r\u00e9seau social int\u00e9gr\u00e9"}</span>
            </div>
            <div className="flex items-center justify-center gap-4 md:gap-6 mb-3">
              <TrafficLight size="md" />
              <h1 className="text-3xl md:text-4xl font-bold text-white text-balance">
                VIXUAL Social
              </h1>
              <TrafficLight size="md" />
            </div>
            <p className="text-white/50 max-w-xl mx-auto text-balance">
              {"Échangez avec la communauté VIXUAL. Discussions structurées par tags, réponses directes, modération communautaire."}
            </p>
          </div>

          {/* Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8 items-start">
            {/* Global feed */}
            <VisualSocialFeed mode="global" />

            {/* Sidebar */}
            <div className="space-y-4 lg:sticky lg:top-24">
              <RulesCard />
              <TagsCard />
              <V1Notice />

              <div className="bg-emerald-500/5 border border-emerald-500/15 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-4 w-4 text-emerald-400" />
                  <span className="text-white/70 text-sm font-medium">Deux vues</span>
                </div>
                <p className="text-white/40 text-xs leading-relaxed mb-2">
                  <span className="text-emerald-400 font-medium">Fil global :</span>
                  {" Tendances et discussions g\u00e9n\u00e9rales (ici)."}
                </p>
                <p className="text-white/40 text-xs leading-relaxed">
                  <span className="text-emerald-400 font-medium">Discussion sous contenu :</span>
                  {" Avis et questions directement sous chaque vid\u00e9o, podcast ou \u00e9crit."}
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
