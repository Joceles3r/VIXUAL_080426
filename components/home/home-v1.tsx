"use client"

import Link from "next/link"
import { useRef } from "react"
import {
  Play,
  Info,
  Heart,
  ChevronLeft,
  ChevronRight,
  LogIn,
  Compass,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { VisualHeader } from "@/components/vixual-header"
import { Footer } from "@/components/footer"
import { VisualSlogan } from "@/components/vixual-slogan"
import { useAuth } from "@/lib/auth-context"
import { V1_FEATURED, V1_ROWS, type V1Content } from "@/lib/mock-data-v1"

/**
 * Homepage V1 — Refonte streaming premium.
 *
 * Structure inspiree des grandes plateformes streaming (hero plein largeur
 * avec contenu vedette, rangees scroll horizontal de thumbnails 16:9),
 * mais avec l'identite VIXUAL preservee (logo, slogan, signature fuchsia
 * discrete sur fond OLED noir absolu).
 *
 * Sections :
 *  1. Hero plein largeur — contenu vedette + CTA "Commencer gratuitement"
 *  2. Bandeau slogan & valeurs
 *  3. 6 rangees streaming (Tendances, Films, Podcasts, Docs, Livres, Creations)
 *  4. Section "Comprendre VIXUAL en 30 secondes"
 *  5. CTA final + footer
 *
 * Palette : noir OLED #030307 + accents fuchsia VIXUAL (#d946ef / #c026d3)
 * Toutes les animations utilisent les classes vx-* deja presentes dans globals.css
 * + nouvelles classes vx-stream-* ajoutees a globals.css par ce patch.
 */
export function HomeV1() {
  const { isAuthed } = useAuth()

  return (
    <div className="min-h-screen bg-[#030307] text-white">
      <VisualHeader />

      <main className="vx-stream-main">
        {/* ═══ HERO PLEIN LARGEUR ═══ */}
        <section className="vx-stream-hero">
          {/* Image vedette plein ecran */}
          <div
            className="vx-stream-hero-bg"
            style={{
              backgroundImage: `url(${V1_FEATURED.thumbnail.replace("w=800&h=450", "w=1920&h=1080")})`,
            }}
            aria-hidden="true"
          />

          {/* Voiles degrade — lisibilite du texte */}
          <div className="vx-stream-hero-overlay" aria-hidden="true" />
          <div className="vx-stream-hero-overlay-bottom" aria-hidden="true" />
          <div className="vx-stream-hero-glow" aria-hidden="true" />

          {/* Contenu hero */}
          <div className="vx-stream-hero-content">
            <div className="vx-stream-hero-inner">
              <span className="vx-stream-badge vx-rise-in">
                <span className="vx-stream-badge-dot" />
                CONTENU VEDETTE
              </span>

              <h1 className="vx-stream-hero-title vx-rise-in vx-rise-in--delay-1">
                {V1_FEATURED.title}
              </h1>

              <div className="vx-stream-hero-meta vx-rise-in vx-rise-in--delay-2">
                <span className="vx-stream-meta-item">{V1_FEATURED.creator}</span>
                <span className="vx-stream-meta-dot">·</span>
                <span className="vx-stream-meta-item">{V1_FEATURED.duration}</span>
                <span className="vx-stream-meta-dot">·</span>
                <span className="vx-stream-meta-item vx-stream-meta-supports">
                  <Heart className="h-3 w-3" />
                  {V1_FEATURED.supports.toLocaleString("fr-FR")} soutiens
                </span>
              </div>

              <p className="vx-stream-hero-tagline vx-rise-in vx-rise-in--delay-2">
                {V1_FEATURED.tagline}
              </p>

              <div className="vx-stream-hero-cta vx-rise-in vx-rise-in--delay-3">
                <Link href="/explore">
                  <Button size="lg" className="vx-stream-btn-primary">
                    <Play className="mr-2 h-5 w-5 fill-current" />
                    Commencer gratuitement
                  </Button>
                </Link>
                <Link href={`/video/${V1_FEATURED.id}`}>
                  <Button size="lg" variant="outline" className="vx-stream-btn-secondary">
                    <Info className="mr-2 h-4 w-4" />
                    {"Plus d'infos"}
                  </Button>
                </Link>
                {!isAuthed && (
                  <Link href="/login" className="hidden md:block">
                    <Button size="lg" variant="ghost" className="vx-stream-btn-ghost">
                      <LogIn className="mr-2 h-4 w-4" />
                      Se connecter
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ═══ BANDEAU SLOGAN ═══ */}
        <section className="vx-stream-slogan-band">
          <div className="container mx-auto px-4">
            <div className="flex flex-col items-center text-center gap-2">
              <VisualSlogan size="base" opacity="high" withLines />
              <p className="text-white/45 text-xs md:text-sm tracking-wide">
                Films · Podcasts · Documentaires · Livres · Creations originales
              </p>
            </div>
          </div>
        </section>

        {/* ═══ RANGEES STREAMING ═══ */}
        <section className="vx-stream-rows">
          <div className="vx-stream-rows-inner">
            {V1_ROWS.map((row) => (
              <StreamRow key={row.id} row={row} />
            ))}
          </div>
        </section>

        {/* ═══ COMPRENDRE EN 30 SECONDES ═══ */}
        <section id="comprendre" className="vx-stream-understand">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="text-center mb-12">
              <p className="text-fuchsia-300/80 text-xs uppercase tracking-[0.3em] mb-3 font-semibold">
                Comprendre VIXUAL
              </p>
              <h2 className="text-3xl md:text-5xl font-bold text-white">
                En 30 secondes
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <UnderstandCard
                num="01"
                title="Decouvre"
                desc="Films, podcasts, livres, documentaires et creations originales. Acces libre, aucune inscription requise pour regarder."
              />
              <UnderstandCard
                num="02"
                title="Soutiens"
                desc="Contribue de 2 a 20 EUR aux createurs que tu apprecies. Tu choisis toujours le montant. Aucun engagement force."
              />
              <UnderstandCard
                num="03"
                title="Participe"
                desc="Vote, commente, partage. Ton role evolue avec tes actions. Certaines participations sont recompensees selon les regles officielles."
              />
            </div>

            <p className="text-center text-white/35 text-xs mt-10 max-w-2xl mx-auto leading-relaxed">
              Le soutien financier ne garantit pas de retour. Les gains eventuels dependent du classement final du projet.
              VIXUAL n&apos;est pas un jeu de hasard ni un produit d&apos;investissement au sens de l&apos;AMF.
            </p>
          </div>
        </section>

        {/* ═══ CTA FINAL ═══ */}
        <section className="vx-stream-cta-final">
          <div className="container mx-auto px-4 text-center max-w-3xl">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
              Prêt à decouvrir VIXUAL ?
            </h2>
            <p className="text-white/55 text-lg mb-8 leading-relaxed">
              Parcours le catalogue. Trouve un createur qui t&apos;inspire. Soutiens librement.
            </p>
            <Link href="/explore">
              <Button size="lg" className="vx-stream-btn-primary px-10">
                <Compass className="mr-2 h-5 w-5" />
                Commencer gratuitement
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

/** Rangee de contenus avec scroll horizontal (pattern streaming) */
function StreamRow({ row }: { row: { id: string; title: string; subtitle: string; items: V1Content[] } }) {
  const scrollRef = useRef<HTMLDivElement>(null)

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return
    const amount = scrollRef.current.clientWidth * 0.85
    scrollRef.current.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    })
  }

  return (
    <div className="vx-stream-row">
      <div className="vx-stream-row-header">
        <div>
          <h3 className="vx-stream-row-title">{row.title}</h3>
          <p className="vx-stream-row-subtitle">{row.subtitle}</p>
        </div>
        <div className="vx-stream-row-arrows">
          <button
            onClick={() => scroll("left")}
            className="vx-stream-row-arrow"
            aria-label="Defiler vers la gauche"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="vx-stream-row-arrow"
            aria-label="Defiler vers la droite"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div ref={scrollRef} className="vx-stream-row-scroll">
        {row.items.map((item) => (
          <StreamThumbnail key={item.id} item={item} />
        ))}
      </div>
    </div>
  )
}

/** Thumbnail 16:9 avec hover premium (zoom + overlay info) */
function StreamThumbnail({ item }: { item: V1Content }) {
  return (
    <Link href={`/video/${item.id}`} className="vx-stream-thumb group">
      <div
        className="vx-stream-thumb-img"
        style={{ backgroundImage: `url(${item.thumbnail})` }}
        aria-hidden="true"
      />
      <div className="vx-stream-thumb-overlay">
        <div className="vx-stream-thumb-info">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            {item.isNew && <span className="vx-stream-thumb-tag vx-stream-thumb-tag--new">NOUVEAU</span>}
            <span className="vx-stream-thumb-duration">{item.duration}</span>
          </div>
          <h4 className="vx-stream-thumb-title">{item.title}</h4>
          <p className="vx-stream-thumb-creator">{item.creator}</p>
        </div>
      </div>
    </Link>
  )
}

/** Carte "Comprendre VIXUAL" numerotee */
function UnderstandCard({ num, title, desc }: { num: string; title: string; desc: string }) {
  return (
    <div className="vx-stream-understand-card">
      <span className="vx-stream-understand-num">{num}</span>
      <h3 className="vx-stream-understand-title">{title}</h3>
      <p className="vx-stream-understand-desc">{desc}</p>
    </div>
  )
}
