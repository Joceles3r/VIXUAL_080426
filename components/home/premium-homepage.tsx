"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import {
  Play,
  Info,
  ChevronLeft,
  ChevronRight,
  Star,
  Clock,
  Landmark,
  Rocket,
  Globe,
  Brain,
  Film,
  Users,
  Lightbulb,
  Sparkles,
  GripVertical,
  Upload,
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

// ─── Types pour le drag-drop ─────────────────────────────────────────────────

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

// ─── Icônes Savoir & Culture ──────────────────────────────────────────────────

const SAVOIR_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  landmark: Landmark,
  rocket: Rocket,
  globe: Globe,
  brain: Brain,
  film: Film,
  users: Users,
  lightbulb: Lightbulb,
}

// ─── Component Principal ───────────────────────────────────────────────────────

export function PremiumHomepage() {
  const { isAuthed } = useAuth()
  const [homepageConfig, setHomepageConfig] = useState<HomepageConfigV1>(DEFAULT_HOMEPAGE_CONFIG)
  const [isAdmin, setIsAdmin] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [draggedCard, setDraggedCard] = useState<DraggableCard | null>(null)
  const [dropTarget, setDropTarget] = useState<string | null>(null)

  // ─── Lecture config + detection admin ──────────────────────────────────────

  useEffect(() => {
    const refreshConfig = () => {
      setHomepageConfig(getHomepageConfig())
    }
    refreshConfig()
    window.addEventListener("vixual-homepage-config-updated", refreshConfig)
    window.addEventListener("storage", refreshConfig)

    // Detecter si admin (simplifié - adapter selon votre auth)
    const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || "jocelyndru@gmail.com"
    const userEmail = localStorage.getItem("vixual_user_email")
    setIsAdmin(userEmail === adminEmail)

    return () => {
      window.removeEventListener("vixual-homepage-config-updated", refreshConfig)
      window.removeEventListener("storage", refreshConfig)
    }
  }, [])

  // ─── Raccourcis ─────────────────────────────────────────────────────────────

  const hero = homepageConfig.hero
  const heroImage = hero.image || V1_FEATURED.thumbnail || "/images/hero-v1.jpg"
  const heroTitle = hero.title || V1_FEATURED.title
  const heroDesc = hero.description || V1_FEATURED.description || ""
  const heroCta = hero.ctaLabel || "Commencer gratuitement"
  const heroCtaHref = hero.ctaHref || "/welcome"
  const heroCategory = hero.category || V1_FEATURED.genres?.[0] || "EXCLUSIF"

  const homepageRows = homepageConfig.rows?.length > 0
    ? homepageConfig.rows.filter((row) => row.enabled)
    : V1_SECTIONS

  // ─── Handlers drag-drop ─────────────────────────────────────────────────────

  const handleDragStart = (card: DraggableCard) => {
    if (!isAdmin || !editMode) return
    setDraggedCard(card)
  }

  const handleDragOver = (e: React.DragEvent, cardId: string) => {
    if (!draggedCard || draggedCard.id === cardId) return
    e.preventDefault()
    setDropTarget(cardId)
  }

  const handleDrop = (e: React.DragEvent, targetCard: DraggableCard) => {
    e.preventDefault()
    if (!draggedCard || draggedCard.id === targetCard.id) return
    // Logic d'echange d'images
    setDraggedCard(null)
    setDropTarget(null)
  }

  const handleDragEnd = () => {
    setDraggedCard(null)
    setDropTarget(null)
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <VisualHeader />

      {/* ═══ BARRE OUTIL ADMIN (si admin connecte) ═══ */}
      {isAdmin && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 bg-slate-900/95 backdrop-blur-xl border border-white/20 rounded-full shadow-2xl">
          <span className="text-white/70 text-sm font-medium">
            {editMode ? "Mode édition actif" : "Mode aperçu"}
          </span>
          <Button
            size="sm"
            variant={editMode ? "default" : "outline"}
            onClick={() => setEditMode(!editMode)}
            className={editMode
              ? "bg-emerald-600 hover:bg-emerald-500 text-white"
              : "bg-white/10 hover:bg-white/20 text-white border-white/30"
            }
          >
            <GripVertical className="h-4 w-4 mr-2" />
            {editMode ? "Terminé" : "Modifier"}
          </Button>
          <Link href="/admin/homepage">
            <Button size="sm" variant="outline" className="bg-white/10 hover:bg-white/20 text-white border-white/30">
              <Upload className="h-4 w-4 mr-2" />
              Config Avancée
            </Button>
          </Link>
        </div>
      )}

      {/* ═══ HERO PLEIN ÉCRAN ═══ */}
      <HeroSection
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
        editMode={editMode}
        isAdmin={isAdmin}
        onConfigSave={(newHero) => {
          const newConfig = {
            ...homepageConfig,
            hero: { ...hero, ...newHero }
          }
          localStorage.setItem("vixual_homepage_config_v1", JSON.stringify(newConfig))
          window.dispatchEvent(new Event("vixual-homepage-config-updated"))
        }}
      />

      {/* ═══ 3 CARROUSELS EMBLA ═══ */}
      <div className="vx-prem-rows">
        <div className="vx-prem-rows-inner">
          {homepageRows.slice(0, 3).map((section, idx) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
                <ContentCarousel
                  items={items as DraggableCard[]}
                  editMode={editMode && isAdmin}
                  onDragStart={handleDragStart}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onDragEnd={handleDragEnd}
                  draggedCard={draggedCard}
                  dropTarget={dropTarget}
                />
              </div>
            )
          })}
        </div>
      </div>

      {/* ═══ SAVOIR & CULTURE ═══ */}
      <SavoirCultureSection editMode={editMode && isAdmin} />

      {/* ═══ CTA FINAL ═══ */}
      <CTASection isAuthed={isAuthed} />

      <Footer />
    </div>
  )
}

// ─── Section Hero ─────────────────────────────────────────────────────────────

interface HeroSectionProps {
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
  editMode: boolean
  isAdmin: boolean
  onConfigSave: (config: Partial<HomepageConfigV1["hero"]>) => void
}

function HeroSection({
  image,
  title,
  description,
  rating,
  duration,
  year,
  genres,
  ctaLabel,
  ctaHref,
  editMode,
  isAdmin,
  onConfigSave,
}: HeroSectionProps) {
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const reader = new FileReader()
    reader.onload = (ev) => {
      const newImage = ev.target?.result as string
      onConfigSave({ image: newImage })
      setUploading(false)
    }
    reader.readAsDataURL(file)
  }

  return (
    <section className="vx-prem-hero">
      <div className={`vx-prem-hero-image ${editMode && isAdmin ? "vx-drop-zone" : ""}`}>
        <Image
          src={image}
          alt={title}
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="vx-prem-hero-grad-right" aria-hidden="true" />
        <div className="vx-prem-hero-grad-bottom" aria-hidden="true" />

        {editMode && isAdmin && (
          <div className="absolute top-4 right-4 z-20">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
            <Button
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="bg-white/20 backdrop-blur-md hover:bg-white/30 text-white border border-white/30"
              disabled={uploading}
            >
              {uploading ? (
                <><span className="animate-spin mr-2">↻</span>Upload...</>
              ) : (
                <><Upload className="h-4 w-4 mr-2" />Changer image</>
              )}
            </Button>
          </div>
        )}
      </div>

      <div className="vx-prem-hero-content">
        <div className="vx-prem-hero-inner">
          <div className="vx-prem-hero-badges">
            <span className="vx-prem-badge-original">Original VIXUAL</span>
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

// ─── Carrousel de Contenu ─────────────────────────────────────────────────────

interface ContentCarouselProps {
  items: DraggableCard[]
  editMode: boolean
  onDragStart: (card: DraggableCard) => void
  onDragOver: (e: React.DragEvent, cardId: string) => void
  onDrop: (e: React.DragEvent, targetCard: DraggableCard) => void
  onDragEnd: () => void
  draggedCard: DraggableCard | null
  dropTarget: string | null
}

function ContentCarousel({
  items,
  editMode,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  dropTarget,
}: ContentCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ align: "start", slidesToScroll: 2 })
  const [canPrev, setCanPrev] = useState(false)
  const [canNext, setCanNext] = useState(false)

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi])

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
        <button onClick={scrollPrev} className="vx-prem-carousel-arrow vx-prem-carousel-arrow--prev" aria-label="Précédent">
          <ChevronLeft className="h-6 w-6" />
        </button>
      )}

      <div className="vx-prem-carousel-viewport" ref={emblaRef}>
        <div className="vx-prem-carousel-container">
          {items.map((item) => (
            <div
              key={item.id}
              className={`vx-prem-carousel-slide ${editMode ? "vx-draggable" : ""} ${dropTarget === item.id ? "vx-drop-target" : ""}`}
              draggable={editMode}
              onDragStart={() => onDragStart(item)}
              onDragOver={(e) => onDragOver(e, item.id)}
              onDrop={(e) => onDrop(e, item)}
              onDragEnd={onDragEnd}
            >
              <ContentCard item={item} editMode={editMode} />
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

// ─── Carte de Contenu ──────────────────────────────────────────────────────────

function ContentCard({ item, editMode }: { item: DraggableCard; editMode: boolean }) {
  const typeLabel = item.type === "film" ? "Film" : item.type === "podcast" ? "Podcast" : item.type === "livre" ? "Livre" : "Savoir"

  const handleImageReplace = () => {
    if (!editMode) return
    const input = document.createElement("input")
    input.type = "file"
    input.accept = "image/*"
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = () => {}
      reader.readAsDataURL(file)
    }
    input.click()
  }

  return (
    <Link href={item.href} className="vx-prem-card">
      {editMode && (
        <div className="vx-drag-indicator">
          <GripVertical className="h-4 w-4" />
        </div>
      )}

      <div className="vx-prem-card-img-wrap" onClick={(e) => editMode && e.preventDefault()}>
        <Image src={item.image} alt={item.title} fill className="vx-prem-card-img" sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 20vw" />
        <div className="vx-prem-card-grad" aria-hidden="true" />

        {editMode && (
          <button className="vx-replace-image-btn" onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleImageReplace() }}>
            <Upload className="h-4 w-4" />
            <span>Remplacer</span>
          </button>
        )}
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

// ─── Section Savoir & Culture ──────────────────────────────────────────────────

function SavoirCultureSection({ editMode }: { editMode: boolean }) {
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
            <SavoirCard key={card.id} card={card} editMode={editMode} />
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

// ─── Carte Savoir ─────────────────────────────────────────────────────────────

function SavoirCard({ card, editMode }: { card: V1SavoirCard; editMode: boolean }) {
  const Icon = SAVOIR_ICONS[card.iconKey] || Lightbulb

  const handleImageReplace = () => {
    if (!editMode) return
    const input = document.createElement("input")
    input.type = "file"
    input.accept = "image/*"
    input.onchange = () => {}
    input.click()
  }

  return (
    <Link href={`/explore?tab=savoir&id=${card.id}`} className="vx-savoir-card">
      {editMode && (
        <button className="vx-replace-image-btn" onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleImageReplace() }}>
          <Upload className="h-4 w-4" />
          <span>Remplacer</span>
        </button>
      )}

      <div className="vx-savoir-card-img-wrap">
        <Image src={card.thumbnail || "/images/placeholder.svg"} alt={card.title} fill className="vx-savoir-card-img" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" />
        <div className="vx-savoir-card-overlay" aria-hidden="true" />
      </div>

      <div className="vx-savoir-card-icon" aria-hidden="true">
        <Icon className="h-5 w-5" />
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

// ─── Section CTA ───────────────────────────────────────────────────────────────

function CTASection({ isAuthed }: { isAuthed: boolean }) {
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
