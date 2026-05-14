"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import Image from "next/image"
import {
  Play,
  Info,
  ChevronLeft,
  ChevronRight,
  Star,
  Clock,
} from "lucide-react"
import useEmblaCarousel from "embla-carousel-react"
import { VisualHeader } from "@/components/vixual-header"
import { Footer } from "@/components/footer"
import { useAuth } from "@/lib/auth-context"
import {
  V1_FEATURED,
  V1_SECTIONS,
  type V1Content,
} from "@/lib/mock-data-v1"

/**
 * Homepage V1 — STREAMING PREMIUM (style Netflix / Apple TV+ / Prime Video).
 *
 * Reproduit fidelement le design "Code Homepage Streaming Pro" :
 *  - Hero plein ecran 90vh avec image cinematique
 *  - 3 carrousels Embla avec fleches au hover
 *  - Cartes 2:3 portrait avec reveal info au hover
 *  - CTA final avec degrade rouge-violet-bleu
 *
 * Pas de framer-motion : animations en CSS pur (classes vx-prem-*).
 * Header VIXUAL existant reutilise (pas de duplication).
 */
export function HomeV1() {
  const { isAuthed } = useAuth()

  return (
    <div className="min-h-screen bg-[#141414]">
      <VisualHeader />

      {/* ═══ HERO PLEIN ECRAN ═══ */}
      <section className="vx-prem-hero">
        <div className="vx-prem-hero-image">
          <Image
            src={V1_FEATURED.thumbnail || "/placeholder.svg"}
            alt={V1_FEATURED.title}
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
          <div className="vx-prem-hero-grad-right" aria-hidden="true" />
          <div className="vx-prem-hero-grad-bottom" aria-hidden="true" />
        </div>

        <div className="vx-prem-hero-content">
          <div className="vx-prem-hero-inner vx-prem-fade-in">
            <div className="vx-prem-hero-badges vx-prem-fade-up vx-prem-delay-1">
              <span className="vx-prem-badge-original">Original VIXUAL</span>
              <span className="vx-prem-rating-inline">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                <span>{V1_FEATURED.rating}</span>
              </span>
            </div>

            <h1 className="vx-prem-hero-title vx-prem-fade-up vx-prem-delay-2">
              {V1_FEATURED.title}
            </h1>

            <div className="vx-prem-hero-meta vx-prem-fade-up vx-prem-delay-3">
              <span className="vx-prem-meta-year">{V1_FEATURED.year ?? "2026"}</span>
              <span className="vx-prem-meta-dot" />
              <span className="vx-prem-meta-time">
                <Clock className="h-4 w-4" />
                {V1_FEATURED.duration}
              </span>
              <span className="vx-prem-meta-dot" />
              <span>{V1_FEATURED.genres?.join(" · ") ?? "Thriller · Crime · Mystère"}</span>
            </div>

            <p className="vx-prem-hero-desc vx-prem-fade-up vx-prem-delay-4">
              {V1_FEATURED.description ?? (V1_FEATURED as { tagline?: string }).tagline}
            </p>

            <div className="vx-prem-hero-cta vx-prem-fade-up vx-prem-delay-5">
              <Link href={`/video/${V1_FEATURED.id}`} className="vx-prem-btn-play">
                <Play className="h-6 w-6 fill-current" />
                <span>Lecture</span>
              </Link>
              <Link href={`/video/${V1_FEATURED.id}`} className="vx-prem-btn-info">
                <Info className="h-6 w-6" />
                <span>Plus d&apos;infos</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 3 CARROUSELS EMBLA ═══ */}
      <div className="vx-prem-rows">
        <div className="vx-prem-rows-inner">
          {V1_SECTIONS.slice(0, 3).map((section) => (
            <div key={section.id} className="vx-prem-row vx-prem-reveal">
              <h2 className="vx-prem-row-title">{section.title}</h2>
              <ContentCarousel items={section.items} />
            </div>
          ))}
        </div>
      </div>

      {/* ═══ CTA FINAL DEGRADE ═══ */}
      <section className="vx-prem-cta">
        <div className="vx-prem-cta-bg" aria-hidden="true" />
        <div className="vx-prem-cta-inner vx-prem-reveal">
          <h2 className="vx-prem-cta-title">
            Prêt à découvrir des talents exceptionnels ?
          </h2>
          <p className="vx-prem-cta-desc">
            Rejoignez VIXUAL et soutenez les créateurs de demain.
            Films, podcasts, livres — tout en un seul endroit.
          </p>
          <Link
            href={isAuthed ? "/explore" : "/signup"}
            className="vx-prem-cta-btn"
          >
            Commencer gratuitement
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  )
}

/* ─── CARROUSEL EMBLA ─── */
function ContentCarousel({ items }: { items: V1Content[] }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    slidesToScroll: 2,
  })

  const [canPrev, setCanPrev] = useState(false)
  const [canNext, setCanNext] = useState(false)

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev()
  }, [emblaApi])

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext()
  }, [emblaApi])

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

  return (
    <div className="vx-prem-carousel">
      {canPrev && (
        <button
          onClick={scrollPrev}
          className="vx-prem-carousel-arrow vx-prem-carousel-arrow--prev"
          aria-label="Précédent"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
      )}

      <div className="vx-prem-carousel-viewport" ref={emblaRef}>
        <div className="vx-prem-carousel-container">
          {items.map((item) => (
            <div key={item.id} className="vx-prem-carousel-slide">
              <ContentCard item={item} />
            </div>
          ))}
        </div>
      </div>

      {canNext && (
        <button
          onClick={scrollNext}
          className="vx-prem-carousel-arrow vx-prem-carousel-arrow--next"
          aria-label="Suivant"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      )}
    </div>
  )
}

/* ─── CARTE CONTENU ─── */
function ContentCard({ item }: { item: V1Content }) {
  const typeLabel =
    item.category === "films" ? "Film" :
    item.category === "podcasts" ? "Podcast" :
    item.category === "livres" ? "Livre" : "Savoir"

  return (
    <Link href={`/video/${item.id}`} className="vx-prem-card">
      <div className="vx-prem-card-img-wrap">
        <Image
          src={item.thumbnail || "/placeholder.svg"}
          alt={item.title}
          fill
          className="vx-prem-card-img"
          sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 20vw"
        />
        <div className="vx-prem-card-grad" aria-hidden="true" />
      </div>

      {item.isNew && (
        <span className="vx-prem-card-new">NOUVEAU</span>
      )}

      {/* Affichage par defaut : titre + note en bas */}
      <div className="vx-prem-card-info-default">
        <h3 className="vx-prem-card-title-default">{item.title}</h3>
        <div className="vx-prem-card-rating-default">
          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
          <span>{item.rating}</span>
        </div>
      </div>

      {/* Affichage au hover : reveal complet */}
      <div className="vx-prem-card-info-hover">
        <h3 className="vx-prem-card-title-hover">{item.title}</h3>
        <div className="vx-prem-card-meta-hover">
          <span className="vx-prem-card-rating-hover">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            <span>{item.rating}</span>
          </span>
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
