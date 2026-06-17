"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { getHomepageConfig } from "@/lib/homepage-config"

type SavoirCard = {
  id: string
  title: string
  image: string
  href: string
  enabled?: boolean
  order?: number
}

const FALLBACK_CARDS: SavoirCard[] = [
  { id: "sav-001", title: "Histoire", image: "/uploads/savoir-culture/histoire.jpg", href: "/explore/savoir/histoire", order: 0 },
  { id: "sav-002", title: "Monde & Civilisations", image: "/uploads/savoir-culture/civilisations.jpg", href: "/explore/savoir/civilisations", order: 1 },
  { id: "sav-003", title: "Sciences & Découvertes", image: "/uploads/savoir-culture/sciences.jpg", href: "/explore/savoir/sciences", order: 2 },
  { id: "sav-004", title: "Comprendre le Monde", image: "/uploads/savoir-culture/comprendre.jpg", href: "/explore/savoir/comprendre", order: 3 },
  { id: "sav-005", title: "Orientation & Métiers", image: "/uploads/savoir-culture/metiers.jpg", href: "/explore/savoir/metiers", order: 4 },
  { id: "sav-006", title: "Arts & Culture", image: "/uploads/savoir-culture/arts.jpg", href: "/explore/savoir/arts", order: 5 },
]

const descriptions: Record<string, string> = {
  "Histoire": "Explorer les grandes périodes, les personnages et les événements marquants.",
  "Monde & Civilisations": "Découvrir les cultures, les peuples et les grandes civilisations.",
  "Sciences & Découvertes": "Comprendre les innovations, l'espace et les grandes découvertes.",
  "Comprendre le Monde": "Économie, société, citoyenneté et actualité expliquées simplement.",
  "Orientation & Métiers": "Découvrir des parcours professionnels inspirants.",
  "Arts & Culture": "Explorer les œuvres, les artistes et le patrimoine culturel.",
}

const icons: Record<string, string> = {
  "Histoire": "🏛",
  "Monde & Civilisations": "🌍",
  "Sciences & Découvertes": "🚀",
  "Comprendre le Monde": "💡",
  "Orientation & Métiers": "🎓",
  "Arts & Culture": "🎨",
}

function loadSavoirCards(): SavoirCard[] {
  const config = getHomepageConfig()
  const row = config.rows.find((item) => item.id === "row-savoir" || item.id === "row-savoir-culture")
  const cards = row?.items?.length ? row.items : FALLBACK_CARDS

  return cards
    .filter((card) => card.enabled !== false)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .slice(0, 6)
    .map((card, index) => ({
      id: card.id,
      title: card.title || FALLBACK_CARDS[index]?.title || "Savoir & Culture",
      image: card.image || FALLBACK_CARDS[index]?.image || "/placeholder.svg",
      href: card.href || FALLBACK_CARDS[index]?.href || "/explore",
      enabled: card.enabled,
      order: card.order ?? index,
    }))
}

export function SavoirCultureV1() {
  const [cards, setCards] = useState<SavoirCard[]>(FALLBACK_CARDS)

  useEffect(() => {
    const refresh = () => setCards(loadSavoirCards())

    refresh()
    window.addEventListener("vixual-homepage-config-updated", refresh)
    window.addEventListener("storage", refresh)

    return () => {
      window.removeEventListener("vixual-homepage-config-updated", refresh)
      window.removeEventListener("storage", refresh)
    }
  }, [])

  return (
    <section id="savoir-culture" className="py-24 px-6 border-t border-white/[0.06]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-sm uppercase tracking-[0.35em] text-fuchsia-300/70 mb-4">Explorer</p>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">Savoir &amp; Culture</h2>
          <p className="text-white/50 max-w-3xl mx-auto text-base md:text-lg font-light">
            Découvrir • Comprendre • Apprendre
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((category) => (
            <Link key={category.id} href={category.href}>
              <div className="group h-full overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] hover:border-fuchsia-500/40 hover:bg-white/[0.05] transition-all">
                <div className="relative h-40 w-full overflow-hidden bg-white/[0.04]">
                  <img src={category.image} alt={category.title} className="h-full w-full object-cover opacity-85 transition-transform duration-500 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
                  <div className="absolute bottom-3 left-4 text-4xl">{icons[category.title] ?? "🧠"}</div>
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-3">{category.title}</h3>
                  <p className="text-white/45 text-sm leading-relaxed">
                    {descriptions[category.title] ?? "Découvrir des contenus courts, utiles et inspirants."}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>

       <div className="mt-10 rounded-3xl border border-fuchsia-400/20 bg-gradient-to-br from-fuchsia-500/10 via-purple-500/10 to-blue-500/10 p-6 text-center shadow-[0_0_40px_rgba(168,85,247,0.18)]">
  <h3 className="text-xl md:text-2xl font-semibold mb-4 bg-gradient-to-r from-fuchsia-300 via-purple-300 to-blue-300 bg-clip-text text-transparent">
    Créer une mini-série
  </h3>

  <p className="text-white/60 max-w-4xl mx-auto">
    Les créateurs peuvent proposer des séries composées de plusieurs mini-épisodes.
    VIXUAL recommande des épisodes de 10 minutes maximum afin de faciliter la découverte.
  </p>

  <p className="text-sm mt-4 max-w-3xl mx-auto font-medium bg-gradient-to-r from-fuchsia-300 via-purple-300 to-blue-300 bg-clip-text text-transparent">
    Ne cherchez pas à tout expliquer en une seule vidéo. Faites découvrir votre sujet étape par étape.
  </p>
</div>

        <div className="mt-8 text-center">
          <p className="text-white/35 text-sm">Podcasts et Écrits seront disponibles à partir de VIXUAL V2.</p>
        </div>
      </div>
    </section>
  )
}
