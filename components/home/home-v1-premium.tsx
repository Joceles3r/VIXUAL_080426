/**
 * VIXUAL — Home V1 Premium (Style Apple TV+ minimaliste avec image hero)
 *
 * Interface ultra-épurée pour les VISITEURS PUBLICS non-connectés.
 * Objectif : compréhension du concept VIXUAL en 20-30 secondes.
 *
 * Architecture en 4 sections :
 *   1. Hero immersif avec image cinematique en arriere-plan
 *   2. Trois concepts minimalistes — Vos contenus / Soutenez / Createurs
 *   3. Teaser visuel — 5 affiches statiques pour montrer le catalogue
 *   4. CTA final — Rejoindre l'aventure → Ouvrir mon compte
 *
 * Image hero V1 : charge depuis homepageConfig.hero.image (gérée via Admin)
 * Fallback : /images/hero-v1-neon.jpg si la config est vide
 */
"use client"

import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Film, Heart, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { VisualHeader } from "@/components/vixual-header"
import { Footer } from "@/components/footer"
import { V1_SECTIONS } from "@/lib/mock-data-v1"
import { useEffect, useState } from "react"
import { getHomepageConfig } from "@/lib/homepage-config"

// 5 affiches temporaires du mini-carrousel V1.
// Avant Bunny : images locales dans /public/uploads/homepage/v1-mini-carousel/
const TEASER_ITEMS = [
  {
    id: "v1-mini-thumb-1",
    title: "Films indépendants",
    thumbnail: "/uploads/homepage/v1-mini-carousel/thumb-1.jpg",
  },
  {
    id: "v1-mini-thumb-2",
    title: "Podcasts immersifs",
    thumbnail: "/uploads/homepage/v1-mini-carousel/thumb-2.jpg",
  },
  {
    id: "v1-mini-thumb-3",
    title: "Écrits originaux",
    thumbnail: "/uploads/homepage/v1-mini-carousel/thumb-3.jpg",
  },
  {
    id: "v1-mini-thumb-4",
    title: "Savoir & Culture",
    thumbnail: "/uploads/homepage/v1-mini-carousel/thumb-4.jpg",
  },
  {
    id: "v1-mini-thumb-5",
    title: "Créateurs VIXUAL",
    thumbnail: "/uploads/homepage/v1-mini-carousel/thumb-5.jpg",
  },
]

export function HomeV1Premium() {
  const [heroImage, setHeroImage] = useState<string>("/images/hero-v1-neon.jpg")

  useEffect(() => {
    // ✓ Charger la config Homepage V1 depuis Admin
    const homepageConfig = getHomepageConfig()
    console.log("HERO CONFIG", homepageConfig.hero)
    console.log("HERO IMAGE", homepageConfig.hero.image)

    // Si homepageConfig.hero.image existe et n'est pas vide → l'utiliser
    if (homepageConfig.hero.image && homepageConfig.hero.image.trim()) {
      setHeroImage(homepageConfig.hero.image)
    }
    // Sinon → fallback vers l'image par défaut

    // Écouter les changements depuis l'Admin
    const handleConfigUpdate = () => {
      const updatedConfig = getHomepageConfig()
      console.log("HERO CONFIG UPDATED", updatedConfig.hero)
      if (updatedConfig.hero.image && updatedConfig.hero.image.trim()) {
        setHeroImage(updatedConfig.hero.image)
      }
    }

    window.addEventListener("vixual-homepage-config-updated", handleConfigUpdate)
    return () => {
      window.removeEventListener("vixual-homepage-config-updated", handleConfigUpdate)
    }
  }, [])

  return (
    <div className="min-h-screen bg-black text-white">
      <VisualHeader />

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* SECTION 1 — HERO IMMERSIF AVEC IMAGE CINEMATIQUE                  */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <section className="relative min-h-[90vh] flex items-center justify-center px-6 overflow-hidden">
        {/* Image cinema noir vintage en arriere-plan */}
        <div className="absolute inset-0 z-0">
          <Image
            src={heroImage}
            alt="Rue cinema vintage avec enseignes neon"
            fill
            priority
            sizes="100vw"
            className="object-cover"
            quality={90}
            unoptimized
           />
          {/* Voile sombre pour la lisibilité du texte */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.45) 40%, rgba(0,0,0,0.75) 100%)",
            }}
            aria-hidden="true"
          />
          {/* Touche fuchsia subtile pour rappeler l'identite VIXUAL */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse at center, rgba(217, 70, 239, 0.12) 0%, rgba(0, 0, 0, 0) 65%)",
            }}
            aria-hidden="true"
          />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          {/* Accroche principale — typographie XXL Apple TV+ */}
          <h1
            className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[1.05] mb-8"
            style={{
              textShadow: "0 4px 24px rgba(0, 0, 0, 0.6), 0 2px 8px rgba(0, 0, 0, 0.4)",
            }}
          >
            Films, podcasts, écrits
            <br />
            <span className="bg-gradient-to-r from-fuchsia-300 via-pink-300 to-fuchsia-400 bg-clip-text text-transparent">
              soutenus par vous
            </span>
          </h1>

          {/* Sous-ligne discrete avec le slogan */}
          <p
            className="text-base md:text-lg text-white/80 mb-12 tracking-wide font-light"
            style={{
              textShadow: "0 2px 8px rgba(0, 0, 0, 0.5)",
            }}
          >
            Regarde — Soutiens — Participe
          </p>

          {/* CTA principal unique */}
          <Link href="/explore">
            <Button
              size="lg"
              className="text-white px-10 h-14 text-lg font-semibold rounded-full transition-all hover:scale-105 hover:opacity-90"
              style={{
                backgroundImage: "linear-gradient(90deg, #ec4899 0%, #a855f7 50%, #3b82f6 100%)",
                boxShadow: "0 12px 40px -8px rgba(168, 85, 247, 0.55), 0 0 0 1px rgba(255, 255, 255, 0.1) inset",
              }}
            >
              Découvrir VIXUAL
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* ═════════════════════════════════════════════════════════════ */}
      {/* SECTION 2 — TROIS CONCEPTS MINIMALISTES                           */}
      {/* ═════════════════════════════════════════════════════════════ */}
      <section className="py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {/* Carte 1 — Vos contenus */}
            <div className="text-center group">
              <div className="inline-flex items-center justify-center w-16 h-16 mb-6 rounded-2xl bg-white/[0.04] border border-white/10 group-hover:border-fuchsia-500/40 transition-all">
                <Film className="h-7 w-7 text-fuchsia-400" />
              </div>
              <h3 className="text-xl md:text-2xl font-semibold mb-3 tracking-tight">
                Vos films, vos podcasts, vos écrits
              </h3>
              <p className="text-white/50 text-sm md:text-base leading-relaxed font-light">
                Une plateforme dédiée à la création indépendante française.
              </p>
            </div>

            {/* Carte 2 — Soutien recompense */}
            <div className="text-center group">
              <div className="inline-flex items-center justify-center w-16 h-16 mb-6 rounded-2xl bg-white/[0.04] border border-white/10 group-hover:border-fuchsia-500/40 transition-all">
                <Heart className="h-7 w-7 text-fuchsia-400" />
              </div>
              <h3 className="text-xl md:text-2xl font-semibold mb-3 tracking-tight">
                Soutenez les créateurs et soyez récompensé
              </h3>
              <p className="text-white/50 text-sm md:text-base leading-relaxed font-light">
                Contribuez aux projets, gagnez selon votre implication réelle.
              </p>
            </div>

            {/* Carte 3 — Createurs visibilite */}
            <div className="text-center group">
              <div className="inline-flex items-center justify-center w-16 h-16 mb-6 rounded-2xl bg-white/[0.04] border border-white/10 group-hover:border-fuchsia-500/40 transition-all">
                <Sparkles className="h-7 w-7 text-fuchsia-400" />
              </div>
              <h3 className="text-xl md:text-2xl font-semibold mb-3 tracking-tight">
                Créateurs, gagnez en visibilité
              </h3>
              <p className="text-white/50 text-sm md:text-base leading-relaxed font-light">
                Publiez vos œuvres et trouvez votre public, sans intermédiaire.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═════════════════════════════════════════════════════════════ */}
      {/* SECTION 3 — TEASER VISUEL (grille statique 5 affiches)            */}
      {/* ═════════════════════════════════════════════════════════════ */}
      <section className="py-24 px-6 border-t border-white/[0.06]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-3">
              Découvrez des créations exclusives
            </h2>
            <p className="text-white/40 text-base md:text-lg font-light">
              Un aperçu de ce qui vous attend sur VIXUAL
            </p>
          </div>

          {/* Grille statique de 5 affiches — sans carousel pour rester minimaliste */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4">
            {TEASER_ITEMS.map((item, idx) => (
              <Link
                key={item?.id ?? `teaser-${idx}`}
                href="/explore"
                className="relative aspect-[2/3] overflow-hidden rounded-xl bg-white/[0.03] border border-white/[0.06] group hover:border-white/20 transition-all"
              >
                {item?.thumbnail && (
                  <Image
                    src={item.thumbnail}
                    alt={item.title ?? "Création VIXUAL"}
                    fill
                    sizes="(max-width: 768px) 50vw, 20vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                    loading="lazy"
                  />
                )}
                {/* Voile sombre pour lisibilité du titre */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/0 to-transparent" />
                {/* Titre en bas */}
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <p className="text-white text-sm font-medium truncate">
                    {item?.title ?? "Création VIXUAL"}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═════════════════════════════════════════════════════════════ */}
      {/* SECTION 4 — CTA FINAL                                             */}
      {/* ═════════════════════════════════════════════════════════════ */}
      <section className="py-32 px-6 border-t border-white/[0.06] relative overflow-hidden">
        {/* Subtile aurore fuchsia en arriere-plan */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at center bottom, rgba(217, 70, 239, 0.12) 0%, rgba(0, 0, 0, 0) 70%)",
          }}
          aria-hidden="true"
        />

        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            Rejoindre l'aventure
          </h2>
          <p className="text-white/50 text-lg md:text-xl mb-12 font-light leading-relaxed">
            Créez votre compte gratuitement et commencez à explorer,<br className="hidden md:block" />
            soutenir et créer dès aujourd'hui.
          </p>

          <Link href="/signup">
            <Button
              size="lg"
              className="text-white px-12 h-14 text-lg font-semibold rounded-full transition-all hover:scale-105 hover:opacity-90"
              style={{
                backgroundImage: "linear-gradient(90deg, #ec4899 0%, #a855f7 50%, #3b82f6 100%)",
                boxShadow:
                  "0 12px 40px -8px rgba(168, 85, 247, 0.55), 0 0 0 1px rgba(255, 255, 255, 0.08) inset",
              }}
            >
              Ouvrir mon compte
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>

          <p className="text-white/30 text-sm mt-6 font-light">
            Gratuit · Sans engagement · Sans intermédiaire
          </p>
        </div>
      </section>

      <Footer />
    </div>
  )
}
