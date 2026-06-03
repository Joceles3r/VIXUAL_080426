"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import {
  Play,
  Info,
  ChevronLeft,
  ChevronRight,
  Star,
  Clock,
  Sparkles,
  Upload,
  BarChart3,
  Users,
  Crown,
  Settings,
} from "lucide-react"
import useEmblaCarousel from "embla-carousel-react"
import { VisualHeader } from "@/components/vixual-header"
import { Footer } from "@/components/footer"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import {
  V1_FEATURED,
  V1_SECTIONS,
  V1_SAVOIR_CULTURE,
  type V1SavoirCard,
} from "@/lib/mock-data-v1"
import {
  getHomepageConfig,
  DEFAULT_HOMEPAGE_CONFIG,
  type HomepageConfigV1,
  type HomepageCard,
} from "@/lib/homepage-config"

interface DraggableCard extends HomepageCard {
  id: string
  title: string
  type: "film" | "podcast" | "livre" | "savoir-culture"
  image: string
  href: string
  enabled: boolean
  order: number
  rating?: number
  duration?: string
}

const SAVOIR_ICONS: Record<string, () => React.ReactElement> = {
  landmark: () => <span>🏛️</span>,
  rocket: () => <span>🚀</span>,
  globe: () => <span>🌍</span>,
  brain: () => <span>🧠</span>,
  film: () => <span>🎬</span>,
  users: () => <span>👥</span>,
  lightbulb: () => <span>💡</span>,
}

/**
 * HOME V2 — PRESERVED HOMEPAGE (ancienne V1 transferee)
 * ══════════════════════════════════════════════════════
 * Conserve l'interface originale de l'ancienne V1.
 * Ajoute les nouveaux onglets V2 dans la navbar:
 * - Dashboard V2
 * - Projets V2
 * - Contributeurs V2
 * - Créateurs V2
 * - Trust Score
 * - VIXUpoints
 * - Paramètres V2
 */

export function HomeV2Preserved() {
  const { isAuthed } = useAuth()
  const [homepageConfig, setHomepageConfig] = useState<HomepageConfigV1>(DEFAULT_HOMEPAGE_CONFIG)

  useEffect(() => {
    const refreshConfig = () => {
      setHomepageConfig(getHomepageConfig())
    }
    refreshConfig()
    window.addEventListener("vixual-homepage-config-updated", refreshConfig)
    return () => {
      window.removeEventListener("vixual-homepage-config-updated", refreshConfig)
    }
  }, [])

  const hero = homepageConfig.hero
const heroImage = "/images/hero-v2-solitude.jpg"
  const heroTitle = hero.title || V1_FEATURED.title
  const heroDesc = hero.description || V1_FEATURED.description || ""
  const heroCta = hero.ctaLabel || "Commencer gratuitement"
  const heroCtaHref = hero.ctaHref || "/welcome"
  const heroCategory = hero.category || V1_FEATURED.genres?.[0] || "EXCLUSIF"

  const homepageRows = homepageConfig.rows?.length > 0
    ? homepageConfig.rows.filter((row) => row.enabled)
    : V1_SECTIONS

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <VisualHeader />

      {/* ═══ V2 NAVBAR TABS (NOUVEAUX ONGLETS) ═══ */}
      <V2NavbarTabs />

      {/* ═══ HERO PLEIN ÉCRAN (PRESERVED V1) ═══ */}
      <HeroSectionV2
        image={heroImage}
        title={heroTitle}
        description={heroDesc}
        category={heroCategory}
        rating={V1_FEATURED.rating}
        duration={V1_FEATURED.duration}
        year={V1_FEATURED.year}
        genres={V1_FEATURED.genres}
        ctaLabel={heroCta}
        ctaHref={heroCtaHref}
      />

      {/* ═══ 3 CARROUSELS EMBLA (PRESERVED V1) ═══ */}
      <div className="vx-prem-rows">
        <div className="vx-prem-rows-inner">
          {homepageRows.slice(0, 3).map((section, idx) => {
            const items = "items" in section && Array.isArray(section.items)
              ? section.items.map((card: any) => ({
                  id: card.id,
                  title: card.title,
                  type: card.type || card.category || (["film", "podcast", "livre"][idx] as "film" | "podcast" | "livre"),
                  image: card.image || card.thumbnail || "/images/placeholder.svg",
                  href: card.href || `/video/${card.id}`,
                  enabled: card.enabled ?? true,
                  order: card.order ?? 0,
                  rating: card.rating ?? 4.5,
                  duration: card.duration ?? "",
                }))
              : []

            return (
              <div key={section.id} className="vx-prem-row">
                <h2 className="vx-prem-row-title">{section.title}</h2>
                <ContentCarouselV2
                  items={items as DraggableCard[]}
                />
              </div>
            )
          })}
        </div>
      </div>

      {/* ═══ SAVOIR & CULTURE (PRESERVED V1) ═══ */}
      <SavoirCultureSectionV2 />

      {/* ═══ CTA FINAL (PRESERVED V1) ═══ */}
      <CTASectionV2 isAuthed={isAuthed} />

      <Footer />
    </div>
  )
}

// ─── NAVBAR V2 TABS ───────────────────────────────────────────────────────

function V2NavbarTabs() {
  const tabs = [
    { label: "Dashboard V2", href: "/dashboard", icon: BarChart3 },
    { label: "Projets V2", href: "/explore", icon: Play },
    { label: "Contributeurs V2", href: "/top-contributors", icon: Users },
    { label: "Créateurs V2", href: "/guide-profiles", icon: Crown },
    { label: "Trust Score", href: "/trust-score", icon: Star },
    { label: "VIXUpoints", href: "/dashboard/vixupoints", icon: Sparkles },
    { label: "Paramètres V2", href: "/dashboard/settings", icon: Settings },
  ]

  return (
    <div className="sticky top-0 z-40 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-red-500/20">
      <div className="container mx-auto px-4">
        <div className="flex overflow-x-auto gap-2 py-3 scrollbar-hide">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-200 hover:bg-red-500/20 hover:border-red-500/50 transition-colors whitespace-nowrap"
              >
                <Icon className="h-4 w-4" />
                <span className="text-sm font-medium">{tab.label}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ─── HERO SECTION V2 ───────────────────────────────────────────────────────

interface HeroSectionV2Props {
  image: string
  title: string
  description: string
  category: string
  rating: number
  duration: string
  year?: string
  genres?: string[]
  ctaLabel: string
  ctaHref: string
}

function HeroSectionV2({
  image,
  title,
  description,
  rating,
  duration,
  year,
  genres,
  ctaLabel,
  ctaHref,
}: HeroSectionV2Props) {
  return (
    <section className="vx-prem-hero">
      <div className="vx-prem-hero-image">
        <Image
          src={image}
          alt={title}
          fill
          priority
          className="object-cover"
          sizes="100vw"
          unoptimized
        />
        <div className="vx-prem-hero-grad-right" aria-hidden="true" />
        <div className="vx-prem-hero-grad-bottom" aria-hidden="true" />
      </div>

      <div className="vx-prem-hero-content">
        <div className="vx-prem-hero-inner">
          <div className="vx-prem-hero-badges">
            <span className="vx-prem-badge-original">Original VIXUAL V2</span>
            <span className="vx-prem-rating-inline">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              <span>{rating}</span>
            </span>
            {year && <span className="vx-prem-badge-year">{year}</span>}
          </div>

          <h1 className="vx-prem-hero-title">{title}</h1>

          <div className="vx-prem-hero-meta">
            {duration && (
              <>
                <span className="vx-prem-meta-time">
                  <Clock className="h-4 w-4" />
                  {duration}
                </span>
                <span className="vx-prem-meta-dot" />
              </>
            )}
            {genres && <span>{genres.join(" · ")}</span>}
          </div>

          <p className="vx-prem-hero-desc">{description}</p>

          <div className="vx-prem-hero-cta">
            <Link href={ctaHref} className="vx-prem-btn-play">
              <Play className="h-6 w-6 fill-current" />
              <span>{ctaLabel}</span>
            </Link>
            <Link href="/explore" className="vx-prem-btn-info">
              <Info className="h-6 w-6" />
              <span>Explorer les contenus</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── CAROUSEL V2 ────────────────────────────────────────────────────────

interface ContentCarouselV2Props {
  items: DraggableCard[]
}

function ContentCarouselV2({ items }: ContentCarouselV2Props) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ align: "start", slidesToScroll: 2 })
  const [canPrev, setCanPrev] = useState(false)
  const [canNext, setCanNext] = useState(false)

  useEffect(() => {
    if (!emblaApi) return
    const onSelect = () => {
      setCanPrev(emblaApi.canScrollPrev())
      setCanNext(emblaApi.canScrollNext())
    }
    emblaApi.on("select", onSelect)
    emblaApi.on("reInit", onSelect)
    onSelect()
    return () => {
      emblaApi.off("select", onSelect)
      emblaApi.off("reInit", onSelect)
    }
  }, [emblaApi])

  const scrollPrev = () => emblaApi?.scrollPrev()
  const scrollNext = () => emblaApi?.scrollNext()

  return (
    <div className="vx-prem-carousel">
      {canPrev && (
        <button onClick={scrollPrev} className="vx-prem-carousel-arrow vx-prem-carousel-arrow--prev" aria-label="Précédent">
          <ChevronLeft className="h-6 w-6" />
        </button>
      )}

      <div className="vx-prem-carousel-viewport" ref={emblaRef}>
        <div className="vx-prem-carousel-container">
          {items.map((item) => (
            <div
              key={item.id}
              className="vx-prem-carousel-slide"
            >
              <ContentCardV2 item={item} />
            </div>
          ))}
        </div>
      </div>

      {canNext && (
        <button onClick={scrollNext} className="vx-prem-carousel-arrow vx-prem-carousel-arrow--next" aria-label="Suivant">
          <ChevronRight className="h-6 w-6" />
        </button>
      )}
    </div>
  )
}

// ─── CARTE V2 ─────────────────────────────────────────────────────────

function ContentCardV2({ item }: { item: DraggableCard }) {
  const typeLabel = item.type === "film" ? "Film" : item.type === "podcast" ? "Podcast" : "Livre"

  return (
    <Link href={item.href} className="vx-prem-card">
      <div className="vx-prem-card-img-wrap">
        <Image src={item.image} alt={item.title} fill className="vx-prem-card-img" sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 20vw" />
        <div className="vx-prem-card-grad" aria-hidden="true" />
      </div>

      {item.rating && <span className="vx-prem-card-new">⭐ {item.rating}</span>}

      <div className="vx-prem-card-info-default">
        <h3 className="vx-prem-card-title-default">{item.title}</h3>
        {item.duration && (
          <div className="vx-prem-card-rating-default">
            <Clock className="h-3 w-3" />
            <span>{item.duration}</span>
          </div>
        )}
      </div>

      <div className="vx-prem-card-info-hover">
        <h3 className="vx-prem-card-title-hover">{item.title}</h3>
        <div className="vx-prem-card-meta-hover">
          {item.rating && (
            <span className="vx-prem-card-rating-hover">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              <span>{item.rating}</span>
            </span>
          )}
          <span className="vx-prem-card-type">{typeLabel}</span>
        </div>
        <div className="vx-prem-card-buttons">
          <span className="vx-prem-card-btn-play">
            <Play className="h-4 w-4 fill-current" />
            <span>Lire</span>
          </span>
          <span className="vx-prem-card-btn-info" aria-hidden="true">
            <Info className="h-4 w-4" />
          </span>
        </div>
      </div>
    </Link>
  )
}

// ─── SAVOIR & CULTURE V2 ────────────────────────────────────────────────────

function SavoirCultureSectionV2() {
  return (
    <section id="savoir-culture" className="vx-savoir">
      <div className="vx-savoir-bg" aria-hidden="true" />
      <div className="vx-savoir-inner">
        <div className="vx-savoir-header">
          <span className="vx-savoir-eyebrow">
            <Sparkles className="h-4 w-4" />
            <span>Explorer</span>
          </span>
          <h2 className="vx-savoir-title">Savoir &amp; Culture</h2>
          <p className="vx-savoir-subtitle">
            Mini-séries documentaires immersives. Mystères, sciences, histoire et culture —
            pensées pour les curieux de 12 à 99 ans. Format court : 10 minutes maximum.
          </p>
        </div>

        <div className="vx-savoir-grid">
          {V1_SAVOIR_CULTURE.map((card) => (
            <SavoirCardV2 key={card.id} card={card} />
          ))}
        </div>

        <div className="vx-savoir-footer-note">
          <span>
            Mineurs : accès via <strong>VIXUpoints</strong> gagnés en participant.
            Parents : Pack Découverte 5€ · Pack Immersion 10€ · Pack Culture Premium 20€.
          </span>
        </div>
      </div>
    </section>
  )
}

// ─── CARTE SAVOIR V2 ───────────────────────────────────────────────────────

function SavoirCardV2({ card }: { card: V1SavoirCard }) {
  return (
    <Link href={`/explore?tab=savoir&id=${card.id}`} className="vx-savoir-card">
      <div className="vx-savoir-card-img-wrap">
        <Image src={card.thumbnail || "/images/placeholder.svg"} alt={card.title} fill className="vx-savoir-card-img" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" />
        <div className="vx-savoir-card-overlay" aria-hidden="true" />
      </div>

      <div className="vx-savoir-card-icon" aria-hidden="true">
        {card.iconKey ? SAVOIR_ICONS[card.iconKey]?.() : <>💡</>}
      </div>

      <span className="vx-savoir-card-duration">
        <Clock className="h-3 w-3" />
        <span>{card.duration}</span>
      </span>

      <div className="vx-savoir-card-content">
        <h3 className="vx-savoir-card-title">{card.title}</h3>
        <p className="vx-savoir-card-tagline">{card.tagline}</p>
        <span className="vx-savoir-card-cta">
          <Play className="h-3.5 w-3.5 fill-current" />
          <span>Découvrir</span>
        </span>
      </div>
    </Link>
  )
}

// ─── CTA V2 ──────────────────────────────────────────────────────────

function CTASectionV2({ isAuthed }: { isAuthed: boolean }) {
  return (
    <section className="vx-prem-cta">
      <div className="vx-prem-cta-bg" aria-hidden="true" />
      <div className="vx-prem-cta-inner">
        <h2 className="vx-prem-cta-title">Prêt à découvrir des talents exceptionnels ?</h2>
        <p className="vx-prem-cta-desc">
          Rejoignez VIXUAL et soutenez les créateurs de demain.
          Films, podcasts, livres — tout en un seul endroit.
        </p>
        <Link href={isAuthed ? "/explore" : "/welcome"} className="vx-prem-cta-btn">
          Commencer gratuitement
        </Link>
      </div>
    </section>
  )
}
