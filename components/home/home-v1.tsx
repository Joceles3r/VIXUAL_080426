"use client"

import Link from "next/link"
import { useRef } from "react"
import {
  Play,
  Info,
  Star,
  ChevronRight,
  Clock,
  PlaySquare,
  Landmark,
  FlaskConical,
  Palette,
  Brain,
  Leaf,
  Users,
  BookOpen,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { VisualHeader } from "@/components/vixual-header"
import { Footer } from "@/components/footer"
import { useAuth } from "@/lib/auth-context"
import {
  V1_FEATURED,
  V1_SECTIONS,
  V1_SAVOIR_CATEGORIES,
  type V1Content,
} from "@/lib/mock-data-v1"

const ICON_MAP = {
  "play-square": PlaySquare,
  landmark: Landmark,
  "flask-conical": FlaskConical,
  palette: Palette,
  brain: Brain,
  leaf: Leaf,
  users: Users,
  "book-open": BookOpen,
} as const

/**
 * Homepage V1 — Direction artistique STREAMING ULTIME
 * Layout 50/50 hero + carrousels horizontaux + bandeau Savoir & Culture
 */
export function HomeV1() {
  const { isAuthed } = useAuth()

  return (
    <div className="min-h-screen bg-[#020203] text-white">
      <VisualHeader />

      <main>
        {/* ═══ HERO LAYOUT 50/50 ═══ */}
        <section className="vx-ult-hero">
          {/* Image à droite */}
          <div className="vx-ult-hero-image">
            <div
              className="vx-ult-hero-image-bg"
              style={{ backgroundImage: `url(${V1_FEATURED.thumbnail})` }}
              aria-hidden="true"
            />
            <div className="vx-ult-hero-image-fade-left" aria-hidden="true" />
            <div className="vx-ult-hero-image-fade-bottom" aria-hidden="true" />
          </div>

          {/* Contenu à gauche */}
          <div className="vx-ult-hero-content">
            <div className="vx-ult-hero-badges">
              <span className="vx-ult-badge-original">ORIGINAL VIXUAL</span>
              <span className="vx-ult-rating">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                {V1_FEATURED.rating}
              </span>
            </div>

            <h1 className="vx-ult-hero-title">{V1_FEATURED.title}</h1>

            <div className="vx-ult-hero-meta">
              <span>{V1_FEATURED.year}</span>
              <span className="vx-ult-hero-meta-dot">·</span>
              <span className="vx-ult-hero-meta-time">
                <Clock className="h-3.5 w-3.5" />
                {V1_FEATURED.duration}
              </span>
              <span className="vx-ult-hero-meta-dot">·</span>
              <span className="vx-ult-hero-meta-genres">
                {V1_FEATURED.genres.join(" · ")}
              </span>
            </div>

            <p className="vx-ult-hero-desc">{V1_FEATURED.description}</p>

            <div className="vx-ult-hero-cta">
              <Link href={`/video/${V1_FEATURED.id}`}>
                <Button size="lg" className="vx-ult-btn-play">
                  <Play className="mr-2 h-5 w-5 fill-current" />
                  Lecture
                </Button>
              </Link>
              <Link href={`/video/${V1_FEATURED.id}`}>
                <Button size="lg" variant="outline" className="vx-ult-btn-info">
                  <Info className="mr-2 h-4 w-4" />
                  Plus d&apos;infos
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* ═══ 3 CARROUSELS HORIZONTAUX ═══ */}
        <section className="vx-ult-carousels">
          {V1_SECTIONS.map((section) => (
            <Carousel key={section.id} section={section} />
          ))}
        </section>

        {/* ═══ BANDEAU SAVOIR & CULTURE ═══ */}
        <section className="vx-ult-savoir">
          <div className="vx-ult-savoir-inner">
            <div className="vx-ult-savoir-header">
              <h2 className="vx-ult-savoir-title">SAVOIR &amp; CULTURE</h2>
              <p className="vx-ult-savoir-subtitle">
                Explorer, comprendre, s&apos;inspirer.
              </p>
            </div>
            <div className="vx-ult-savoir-grid">
              {V1_SAVOIR_CATEGORIES.map((cat) => {
                const Icon = ICON_MAP[cat.icon as keyof typeof ICON_MAP]
                return (
                  <Link
                    key={cat.id}
                    href={`/explore?cat=${cat.id}`}
                    className="vx-ult-savoir-item"
                  >
                    <Icon className="vx-ult-savoir-icon" />
                    <span className="vx-ult-savoir-label">{cat.label}</span>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>

        {/* ═══ CTA FINAL ═══ */}
        <section className="vx-ult-cta-final">
          <div className="vx-ult-cta-bg" aria-hidden="true" />
          <div className="vx-ult-cta-inner">
            <h2 className="vx-ult-cta-title">
              Prêt à découvrir des
              <br />
              talents exceptionnels ?
            </h2>
            <Link href={isAuthed ? "/explore" : "/signup"}>
              <Button size="lg" className="vx-ult-cta-btn">
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

/** Carrousel horizontal scrollable avec flèche droite */
function Carousel({
  section,
}: {
  section: { id: string; title: string; items: V1Content[] }
}) {
  const scrollRef = useRef<HTMLDivElement>(null)

  const scrollRight = () => {
    if (!scrollRef.current) return
    scrollRef.current.scrollBy({
      left: scrollRef.current.clientWidth * 0.85,
      behavior: "smooth",
    })
  }

  return (
    <div className="vx-ult-carousel">
      <h2 className="vx-ult-carousel-title">{section.title}</h2>
      <div className="vx-ult-carousel-wrap">
        <div ref={scrollRef} className="vx-ult-carousel-scroll">
          {section.items.map((item) => (
            <CarouselCard key={item.id} item={item} />
          ))}
        </div>
        <button
          onClick={scrollRight}
          className="vx-ult-carousel-arrow"
          aria-label="Defiler"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>
    </div>
  )
}

/** Carte vignette portrait avec note étoile */
function CarouselCard({ item }: { item: V1Content }) {
  return (
    <Link href={`/video/${item.id}`} className="vx-ult-card group">
      <div
        className="vx-ult-card-img"
        style={{ backgroundImage: `url(${item.thumbnail})` }}
        aria-hidden="true"
      />
      <div className="vx-ult-card-overlay" />
      <div className="vx-ult-card-play" aria-hidden="true">
        <Play className="h-6 w-6 fill-white text-white" />
      </div>
      {item.isNew && <span className="vx-ult-card-new">NOUVEAU</span>}
      <div className="vx-ult-card-info">
        <h3 className="vx-ult-card-title">{item.title}</h3>
        {item.tagline && (
          <p className="vx-ult-card-tagline">{item.tagline}</p>
        )}
        <div className="vx-ult-card-rating">
          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
          <span>{item.rating}</span>
        </div>
      </div>
    </Link>
  )
}
