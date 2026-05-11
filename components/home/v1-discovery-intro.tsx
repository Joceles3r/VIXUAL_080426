"use client"

import Link from "next/link"
import { Sparkles, Heart, ArrowRight } from "lucide-react"

/**
 * V1DiscoveryIntro
 *
 * Petite fenetre explicative "Mode Decouverte" pour la homepage V1.
 *
 * Place SOUS la grille "Decouvre / Soutiens / Accede" — visuellement
 * ancree a la carte Soutiens (Etape 2) via l'accent rose, pour donner
 * au nouveau visiteur un repere clair :
 *   « Je suis en mode Decouverte, je peux soutenir librement,
 *     et plus tard je debloquerai d'autres fonctionnalites. »
 *
 * Volontairement leger : aucun gros bloc, aucune popup automatique,
 * aucun jargon financier. Patch UX §1, §11.
 */
export function V1DiscoveryIntro() {
  return (
    <div className="mt-10 max-w-4xl mx-auto vx-rise-in vx-rise-in--delay-3">
      <div className="relative vx-cinema-card bg-slate-900/60 border border-rose-500/25 rounded-2xl overflow-hidden p-6 md:p-7 backdrop-blur-xl">
        {/* Halo rose discret cote gauche - echo visuel a la carte Soutiens (Etape 2) */}
        <div
          className="absolute -left-24 -top-24 w-64 h-64 rounded-full bg-rose-500/15 blur-3xl pointer-events-none"
          aria-hidden="true"
        />
        {/* Halo fuchsia discret cote droit - echo a la progression future */}
        <div
          className="absolute -right-20 -bottom-20 w-56 h-56 rounded-full bg-fuchsia-500/10 blur-3xl pointer-events-none"
          aria-hidden="true"
        />

        <div className="relative flex flex-col md:flex-row md:items-center gap-5 md:gap-6">
          {/* Icone + badge Mode Decouverte */}
          <div className="flex items-center gap-3 md:flex-col md:items-start md:gap-3 shrink-0">
            <div className="relative h-12 w-12 rounded-xl bg-rose-500/15 border border-rose-400/40 flex items-center justify-center shrink-0">
              <div
                className="absolute -inset-1 rounded-xl bg-rose-500/20 blur-lg opacity-70 pointer-events-none"
                aria-hidden="true"
              />
              <Sparkles className="relative h-6 w-6 text-rose-200" />
            </div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/15 border border-rose-400/30 text-rose-100 text-[11px] font-semibold uppercase tracking-[0.12em]">
              <Heart className="h-3 w-3" />
              Mode Decouverte
            </span>
          </div>

          {/* Texte explicatif central */}
          <div className="flex-1 min-w-0">
            <p className="text-white text-base md:text-lg font-semibold leading-snug mb-1.5">
              Vous explorez VIXUAL en mode Decouverte.
            </p>
            <p className="text-white/70 text-sm md:text-[15px] leading-relaxed">
              Decouvrez les projets, regardez les extraits et soutenez les
              createurs qui vous inspirent.
            </p>
            <p className="text-white/50 text-xs md:text-sm mt-2 leading-relaxed">
              Aucun engagement. Vous progressez a votre rythme.
            </p>
          </div>

          {/* CTA discret — pointe vers la section "Evoluez progressivement dans VIXUAL" */}
          <Link
            href="#vixual-progression"
            className="group inline-flex items-center justify-center gap-1.5 text-rose-100 hover:text-white text-sm font-medium px-4 py-2.5 rounded-lg border border-rose-400/30 bg-rose-500/10 hover:bg-rose-500/20 hover:border-rose-300/50 transition-all whitespace-nowrap shrink-0"
          >
            Debloquer plus de fonctionnalites
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </div>
  )
}
