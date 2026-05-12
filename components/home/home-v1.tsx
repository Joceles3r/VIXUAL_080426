"use client"

import Link from "next/link"
import { Play, Info, Star, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { VisualHeader } from "@/components/vixual-header"
import { Footer } from "@/components/footer"
import { useAuth } from "@/lib/auth-context"
import { V1_FEATURED, V1_SECTIONS, type V1Content } from "@/lib/mock-data-v1"

/**
 * Homepage V1 — Polish final.
 * - Vignettes avec icone Play visible au hover
 * - Hover sans contour fluo : juste assombrissement profond
 * - Titre hero blanc pur (pas de glow fuchsia)
 */
export function HomeV1() {
  const { isAuthed } = useAuth()

  return (
    <div className="min-h-screen bg-[#030307] text-white">
      <VisualHeader />

      <main className="vx-figma-main">
        {/* ═══ HERO PLEIN LARGEUR ═══ */}
        <section className="vx-stream-hero">
          <div
            className="vx-stream-hero-bg"
            style={{ backgroundImage: `url(${V1_FEATURED.thumbnail})` }}
            aria-hidden="true"
          />
          <div className="vx-stream-hero-overlay" aria-hidden="true" />
          <div className="vx-stream-hero-overlay-bottom" aria-hidden="true" />

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
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  {V1_FEATURED.rating}
                </span>
              </div>

              {V1_FEATURED.tagline && (
                <p className="vx-stream-hero-tagline vx-rise-in vx-rise-in--delay-2">
                  {V1_FEATURED.tagline}
                </p>
              )}

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
              </div>
            </div>
          </div>
        </section>

        {/* ═══ 3 SECTIONS GRILLE ═══ */}
        <section className="vx-figma-sections">
          {V1_SECTIONS.map((section) => (
            <FigmaSection key={section.id} section={section} />
          ))}
        </section>

        {/* ═══ CTA FINAL ═══ */}
        <section className="vx-figma-cta-final">
          <div className="vx-figma-cta-bg" aria-hidden="true" />
          <div className="container mx-auto px-6 text-center max-w-3xl relative z-10">
            <Sparkles className="h-8 w-8 text-fuchsia-300 mx-auto mb-6 opacity-80" />
            <h2 className="vx-figma-cta-title">
              {"Prêt à découvrir des talents exceptionnels ?"}
            </h2>
            <p className="vx-figma-cta-desc">
              Rejoignez VIXUAL et soutenez les créateurs de demain. Films, podcasts, livres — tout en un seul endroit.
            </p>
            <Link href={isAuthed ? "/explore" : "/signup"}>
              <Button size="lg" className="vx-figma-cta-btn">
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

/** Section avec titre + grille de vignettes */
function FigmaSection({ section }: { section: { id: string; title: string; items: V1Content[] } }) {
  return (
    <div className="vx-figma-section">
      <div className="container mx-auto px-6">
        <h2 className="vx-figma-section-title">{section.title}</h2>
        <div className="vx-figma-grid">
          {section.items.map((item) => (
            <FigmaThumbnail key={item.id} item={item} />
          ))}
        </div>
      </div>
    </div>
  )
}

/** Thumbnail portrait avec icône Play visible au hover */
function FigmaThumbnail({ item }: { item: V1Content }) {
  return (
    <Link href={`/video/${item.id}`} className="vx-figma-thumb group">
      <div
        className="vx-figma-thumb-img"
        style={{ backgroundImage: `url(${item.thumbnail})` }}
        aria-hidden="true"
      />
      <div className="vx-figma-thumb-overlay" />

      {/* Icône Play centrée (visible au hover) */}
      <div className="vx-figma-thumb-play" aria-hidden="true">
        <Play className="h-7 w-7 fill-white text-white" />
      </div>

      {item.isNew && <span className="vx-figma-thumb-new">NOUVEAU</span>}

      <div className="vx-figma-thumb-info">
        <h3 className="vx-figma-thumb-title">{item.title}</h3>
        {item.tagline && <p className="vx-figma-thumb-tagline">{item.tagline}</p>}
        <div className="vx-figma-thumb-rating">
          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
          <span>{item.rating}</span>
        </div>
      </div>
    </Link>
  )
}
