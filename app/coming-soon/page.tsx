/**
 * Route placeholder generique VIXUAL — /coming-soon?module=...
 *
 * Page propre, ambiance streaming OLED, evite toute 404 pour les
 * modules visibles mais non encore actives.
 *
 * Usage :
 *   /coming-soon?module=podcasts
 *   /coming-soon?module=mini-series
 *   /coming-soon?module=createurs-emergents
 */
import Link from "next/link"
import { Suspense } from "react"
import { ArrowLeft, Compass, Sparkles } from "lucide-react"
import { VisualHeader } from "@/components/vixual-header"
import { Footer } from "@/components/footer"

export const metadata = {
  title: "Module en preparation · VIXUAL",
  description:
    "Cette section fait partie de l'evolution de VIXUAL. Elle sera activee progressivement.",
}

// Libelles humanises pour les modules les plus probables
const MODULE_LABELS: Record<string, string> = {
  podcasts: "Podcasts",
  "mini-series": "Mini-series",
  documentaires: "Documentaires",
  createurs: "Createurs emergents",
  "createurs-emergents": "Createurs emergents",
  "savoir-culture": "Savoir & Culture",
  "chaine-v3": "Chaine VIXUAL V3",
  "vixu-points": "VIXUpoints",
  vixupoints: "VIXUpoints",
  packs: "Packs Decouverte",
  livres: "Livres & Ecrits",
  films: "Films & Videos",
  social: "VIXUAL Social",
}

function ComingSoonContent({ moduleSlug }: { moduleSlug?: string }) {
  const moduleLabel = moduleSlug ? MODULE_LABELS[moduleSlug] ?? moduleSlug : null

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#020203] pt-32 pb-24 text-white">
      {/* Halo violet/bleu cinema, signature VIXUAL */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 80% at 25% 30%, rgba(124,58,237,0.18) 0%, transparent 60%), radial-gradient(ellipse 50% 70% at 75% 70%, rgba(30,58,138,0.22) 0%, transparent 60%)",
          filter: "blur(40px)",
        }}
      />

      <div className="relative mx-auto flex max-w-3xl flex-col items-center px-6 text-center">
        <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-400/30 bg-violet-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.25em] text-violet-200">
          <Sparkles className="h-3.5 w-3.5" />
          VIXUAL
        </span>

        <h1 className="text-balance text-4xl font-bold leading-tight tracking-tight md:text-5xl">
          Module en preparation
        </h1>

        {moduleLabel ? (
          <p className="mt-4 text-pretty text-lg font-medium text-white/80">
            {moduleLabel} arrive bientot.
          </p>
        ) : null}

        <p className="mt-4 max-w-xl text-pretty text-base leading-relaxed text-white/65">
          Cette section fait partie de l&apos;evolution de VIXUAL. Elle sera activee
          progressivement, etape par etape, pour garantir une experience premium et
          stable. En attendant, continuez a explorer la plateforme.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition-transform hover:scale-[1.03]"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour a l&apos;accueil
          </Link>
          <Link
            href="/explore"
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-6 py-3 text-sm font-semibold text-white backdrop-blur transition-colors hover:border-violet-400/50 hover:bg-white/[0.1]"
          >
            <Compass className="h-4 w-4" />
            Explorer VIXUAL
          </Link>
        </div>

        {/* Liens suggeres vers d'autres sections vivantes */}
        <div className="mt-12 grid w-full max-w-xl grid-cols-2 gap-3 text-left sm:grid-cols-3">
          <Link
            href="/#savoir-culture"
            className="rounded-xl border border-white/8 bg-white/[0.03] px-4 py-3 text-xs font-medium text-white/70 transition-colors hover:border-violet-400/40 hover:text-white"
          >
            Savoir &amp; Culture
          </Link>
          <Link
            href="/leaderboard"
            className="rounded-xl border border-white/8 bg-white/[0.03] px-4 py-3 text-xs font-medium text-white/70 transition-colors hover:border-violet-400/40 hover:text-white"
          >
            Classements
          </Link>
          <Link
            href="/soutien-libre"
            className="rounded-xl border border-white/8 bg-white/[0.03] px-4 py-3 text-xs font-medium text-white/70 transition-colors hover:border-violet-400/40 hover:text-white"
          >
            Soutenir un createur
          </Link>
        </div>
      </div>
    </main>
  )
}

export default async function ComingSoonPage({
  searchParams,
}: {
  searchParams: Promise<{ module?: string }>
}) {
  const params = await searchParams
  const moduleSlug = typeof params.module === "string" ? params.module : undefined

  return (
    <>
      <VisualHeader />
      <Suspense fallback={null}>
        <ComingSoonContent moduleSlug={moduleSlug} />
      </Suspense>
      <Footer />
    </>
  )
}
