"use client"

import Link from "next/link"

const categories = [
  {
    icon: "🏛",
    title: "Histoire",
    description: "Explorer les grandes périodes, les personnages et les événements marquants.",
    href: "/explore/savoir/histoire",
    image: "/uploads/savoir-culture/histoire.jpg",
  },
  {
    icon: "🌍",
    title: "Monde & Civilisations",
    description: "Découvrir les cultures, les peuples et les grandes civilisations.",
    href: "/explore/savoir/civilisations",
    image: "/uploads/savoir-culture/civilisations.jpg",
  },
  {
    icon: "🚀",
    title: "Sciences & Découvertes",
    description: "Comprendre les innovations, l'espace et les grandes découvertes.",
    href: "/explore/savoir/sciences",
    image: "/uploads/savoir-culture/sciences.jpg",
  },
  {
    icon: "💡",
    title: "Comprendre le Monde",
    description: "Économie, société, citoyenneté et actualité expliquées simplement.",
    href: "/explore/savoir/comprendre",
    image: "/uploads/savoir-culture/comprendre.jpg",
  },
  {
    icon: "🎓",
    title: "Orientation & Métiers",
    description: "Découvrir des parcours professionnels inspirants.",
    href: "/explore/savoir/metiers",
    image: "/uploads/savoir-culture/metiers.jpg",
  },
  {
    icon: "🎨",
    title: "Arts & Culture",
    description: "Explorer les œuvres, les artistes et le patrimoine culturel.",
    href: "/explore/savoir/arts",
    image: "/uploads/savoir-culture/arts.jpg",
  },
]

export function SavoirCultureV1() {
  return (
    <section id="savoir-culture" className="py-24 px-6 border-t border-white/[0.06]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-sm uppercase tracking-[0.35em] text-fuchsia-300/70 mb-4">
            Explorer
          </p>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
            Savoir &amp; Culture
          </h2>
          <p className="text-white/50 max-w-3xl mx-auto text-base md:text-lg font-light">
            Découvrir • Comprendre • Apprendre
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <Link key={category.title} href={category.href}>
              <div className="group h-full overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] hover:border-fuchsia-500/40 hover:bg-white/[0.05] transition-all">
                <div className="relative h-40 w-full overflow-hidden bg-white/[0.04]">
                  <img
                    src={category.image}
                    alt={category.title}
                    className="h-full w-full object-cover opacity-85 transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
                  <div className="absolute bottom-3 left-4 text-4xl">{category.icon}</div>
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-3">{category.title}</h3>
                  <p className="text-white/45 text-sm leading-relaxed">{category.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-10 rounded-3xl border border-white/10 bg-white/[0.03] p-6 text-center">
          <h3 className="text-xl md:text-2xl font-semibold mb-4">Créer une mini-série</h3>
          <p className="text-white/50 max-w-4xl mx-auto">
            Les créateurs peuvent proposer des séries composées de plusieurs mini-épisodes.
            VIXUAL recommande des épisodes de 10 minutes maximum afin de faciliter la découverte.
          </p>
          <p className="text-white/35 text-sm mt-4 max-w-3xl mx-auto">
            Ne cherchez pas à tout expliquer en une seule vidéo. Faites découvrir votre sujet étape par étape.
          </p>
        </div>

        <div className="mt-8 text-center">
          <p className="text-white/35 text-sm">
            Podcasts et Écrits seront disponibles à partir de VIXUAL V2.
          </p>
        </div>
      </div>
    </section>
  )
}
