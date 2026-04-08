"use client"

import { useState } from "react"
import Link from "next/link"
import { ShieldCheck, X, AlertOctagon, ChevronDown, ChevronUp } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

const FORBIDDEN_BEHAVIORS = [
  "Racisme et discrimination raciale",
  "Homophobie et transphobie",
  "Antis\u00e9mitisme",
  "Propos anti-religieux et intol\u00e9rance religieuse",
  "Insultes, injures et harc\u00e8lement moral",
  "Menaces et intimidation",
  "Contenus sexuels ou pornographiques",
  "Apologie de la violence",
  "Diffamation et fausses accusations",
  "Spam, arnaques et fraudes",
]

const SANCTIONS = [
  { level: "Avertissement", desc: "Rappel par notification", color: "text-amber-400", dot: "bg-amber-400" },
  { level: "Suspension temporaire", desc: "7 \u00e0 90 jours", color: "text-orange-400", dot: "bg-orange-400" },
  { level: "Suspension d\u00e9finitive", desc: "Fermeture du compte", color: "text-red-400", dot: "bg-red-400" },
  { level: "Poursuites judiciaires", desc: "Signalement aux autorit\u00e9s", color: "text-red-500", dot: "bg-red-500" },
]

interface CommunityCharterProps {
  /** Allow the user to dismiss the banner */
  dismissible?: boolean
  /** Compact mode for sidebar/small spaces */
  compact?: boolean
}

export function CommunityCharter({ dismissible = true, compact = false }: CommunityCharterProps) {
  const [dismissed, setDismissed] = useState(false)
  const [expanded, setExpanded] = useState(false)

  if (dismissed) return null

  if (compact) {
    return (
      <div className="p-3 bg-emerald-500/5 border border-emerald-500/15 rounded-xl">
        <div className="flex items-start gap-2.5">
          <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-emerald-400/90 text-xs font-medium mb-1">Charte communautaire</p>
            <p className="text-white/50 text-[10px] leading-relaxed">
              {"Respect, courtoisie et bienveillance entre tous les utilisateurs de VIXUAL. Zero tolerance : racisme, homophobie, harcelement."}
            </p>
          </div>
          {dismissible && (
            <button onClick={() => setDismissed(true)} className="text-white/20 hover:text-white/50">
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <Card className="bg-gradient-to-r from-emerald-500/5 to-teal-500/5 border-emerald-500/15">
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center shrink-0">
              <ShieldCheck className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-white font-semibold text-sm">Charte communautaire VIXUAL</h3>
              <p className="text-white/40 text-xs">{"Respect, courtoisie et bienveillance entre tous les utilisateurs"}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-white/30 hover:text-white/60 transition-colors p-1"
              aria-label={expanded ? "R\u00e9duire" : "D\u00e9velopper"}
            >
              {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
            {dismissible && (
              <button
                onClick={() => setDismissed(true)}
                className="text-white/20 hover:text-white/50 transition-colors p-1"
                aria-label="Fermer"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Summary */}
        <div className="flex items-start gap-2.5 p-3 bg-black/20 rounded-xl border border-white/5">
          <AlertOctagon className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
          <p className="text-white/60 text-xs leading-relaxed">
            {"VIXUAL est un espace de creation collaborative fonde sur le respect mutuel. Toute forme de discrimination, harcelement, insulte, propos haineux ou contenu inapproprie est "}
            <strong className="text-red-400">{"strictement interdit"}</strong>
            {" et sera sanctionn\u00e9. Utilisez le "}
            <span className="text-red-400 font-medium">{"bouton rouge de signalement"}</span>
            {" disponible sur chaque contenu et profil pour alerter notre \u00e9quipe de mod\u00e9ration."}
          </p>
        </div>

        {/* Expanded details */}
        {expanded && (
          <div className="mt-4 space-y-4">
            {/* Forbidden behaviors */}
            <div>
              <p className="text-white/50 text-xs font-medium uppercase tracking-wider mb-2">Comportements interdits</p>
              <div className="grid grid-cols-2 gap-1.5">
                {FORBIDDEN_BEHAVIORS.map((item) => (
                  <div key={item} className="flex items-center gap-2 px-2.5 py-1.5 bg-red-500/5 border border-red-500/10 rounded-lg">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                    <span className="text-white/55 text-[11px]">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Sanctions */}
            <div>
              <p className="text-white/50 text-xs font-medium uppercase tracking-wider mb-2">Sanctions applicables</p>
              <div className="flex flex-col gap-1.5">
                {SANCTIONS.map((s) => (
                  <div key={s.level} className="flex items-center gap-3 px-3 py-2 bg-black/20 rounded-lg border border-white/5">
                    <span className={`w-2 h-2 rounded-full ${s.dot} shrink-0`} />
                    <span className={`text-xs font-medium ${s.color} whitespace-nowrap`}>{s.level}</span>
                    <span className="text-white/35 text-[11px]">{s.desc}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Link to CGU */}
            <div className="flex items-center justify-between pt-2 border-t border-white/5">
              <p className="text-white/30 text-[10px]">{"R\u00e8glement complet : CGU Articles 3 et 8"}</p>
              <Link href="/legal/terms" className="text-emerald-400/70 hover:text-emerald-400 text-[10px] underline transition-colors">
                Lire les CGU
              </Link>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
