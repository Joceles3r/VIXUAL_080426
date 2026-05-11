import type { ReactNode } from "react"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface PremiumPosterCardProps {
  /**
   * URL de la cover (utilise next/image pour optimisation auto).
   * Si absent, un fallback gradient cinema est affiche.
   */
  coverUrl?: string | null
  coverAlt?: string
  /**
   * Titre du contenu (affiche sous le poster).
   */
  title: string
  /**
   * Sous-titre optionnel (createur, type, etc.).
   */
  subtitle?: ReactNode
  /**
   * Lien de destination (rend la carte cliquable + accessible).
   */
  href?: string
  /**
   * Contenu additionnel sous le titre (badges, stats, etc.).
   */
  children?: ReactNode
  /**
   * Aspect ratio du poster. Defaut: "video" (16/9).
   */
  aspect?: "video" | "square" | "portrait"
  className?: string
}

const ASPECT_CLASS = {
  video: "aspect-video",
  square: "aspect-square",
  portrait: "aspect-[2/3]",
}

/**
 * <PremiumPosterCard>
 * Carte poster cinema premium reutilisable.
 * Combine :
 *   - .vx-cinema-card  : hover lift, border lumineuse, shadow profonde
 *   - .vx-cinema-poster : voile gradient cinema sur l'image (lisibilite)
 *
 * Reutilise les utilitaires CSS de app/cinematic.css + <Card> shadcn.
 * Aucun nouveau CSS, aucune duplication.
 *
 * Usage :
 *   <PremiumPosterCard
 *     href={`/video/${id}`}
 *     coverUrl={cover}
 *     title="Mon film"
 *     subtitle={<>par Createur</>}
 *   />
 */
export function PremiumPosterCard({
  coverUrl,
  coverAlt = "",
  title,
  subtitle,
  href,
  children,
  aspect = "video",
  className,
}: PremiumPosterCardProps) {
  const inner = (
    <Card
      className={cn(
        "vx-cinema-card overflow-hidden h-full bg-slate-900/50 border-white/10",
        "hover:border-fuchsia-400/40 group",
        className,
      )}
    >
      <div
        className={cn(
          "vx-cinema-poster relative bg-slate-800",
          ASPECT_CLASS[aspect],
        )}
      >
        {coverUrl ? (
          <Image
            src={coverUrl}
            alt={coverAlt}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover"
            loading="lazy"
            data-poster-img=""
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(135deg, rgba(217,70,239,0.30) 0%, rgba(168,85,247,0.22) 50%, rgba(15,23,42,1) 100%)",
            }}
            aria-hidden="true"
          />
        )}
      </div>
      <CardContent className="p-5">
        <h3 className="font-semibold text-base text-white line-clamp-2 leading-snug group-hover:text-fuchsia-200 transition-colors">
          {title}
        </h3>
        {subtitle && (
          <p className="text-xs text-white/55 mt-1.5 line-clamp-1">
            {subtitle}
          </p>
        )}
        {children && <div className="mt-3">{children}</div>}
      </CardContent>
    </Card>
  )

  if (href) {
    return (
      <Link href={href} className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-400 rounded-xl">
        {inner}
      </Link>
    )
  }
  return inner
}
