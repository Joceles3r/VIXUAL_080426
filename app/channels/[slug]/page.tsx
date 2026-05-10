/**
 * Page publique d'une chaine creator (univers creatif).
 * V3 + module active. 404 sinon.
 */
import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"
import { isCreatorChannelsModuleActive } from "@/lib/channels/state"
import {
  getChannelBySlug,
  incrementChannelViewCount,
  listChannelContents,
} from "@/lib/channels/service"
import { Card, CardContent } from "@/components/ui/card"
import { Tv, Eye, Calendar, Film, BookOpen, Headphones, Sparkles } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function ChannelPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  if (!(await isCreatorChannelsModuleActive())) notFound()

  const { slug } = await params
  const channel = await getChannelBySlug(slug)
  if (!channel) notFound()

  const [contents] = await Promise.all([
    listChannelContents(channel.id),
    incrementChannelViewCount(channel.id),
  ])

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* BANNIERE IMMERSIVE — entree dans le studio createur */}
      <div
        className="vx-cinema-banner h-64 md:h-96 relative"
        style={
          channel.bannerUrl
            ? {
                backgroundImage: `url(${channel.bannerUrl})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }
            : {
                background:
                  "linear-gradient(135deg, rgba(217,70,239,0.45) 0%, rgba(168,85,247,0.32) 45%, rgba(15,23,42,1) 100%)",
              }
        }
      >
        {/* Pill prestige flottant haut */}
        <div className="absolute top-24 md:top-32 left-1/2 -translate-x-1/2 z-[3] vx-rise-in">
          <span className="vx-pill">
            <Sparkles className="h-3 w-3" />
            Studio createur VIXUAL
          </span>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-5xl -mt-24 md:-mt-32 relative z-10">
        {/* Card principale — frame studio prestigieux */}
        <div className="vx-studio-frame p-6 md:p-10 vx-rise-in vx-rise-in--delay-1">
          <div className="flex items-start gap-5 mb-5">
            <div className="h-16 w-16 rounded-2xl bg-fuchsia-500/15 border border-fuchsia-500/40 flex items-center justify-center shrink-0 backdrop-blur-md"
              style={{
                boxShadow:
                  "0 0 30px -8px rgba(217, 70, 239, 0.5), 0 0 0 1px rgba(217, 70, 239, 0.15) inset",
              }}>
              <Tv className="h-8 w-8 text-fuchsia-200" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl md:text-4xl font-bold mb-2 text-balance vx-text-glow">
                {channel.name}
              </h1>
              <p className="text-sm text-white/60 mb-3">
                Univers creatif de{" "}
                <span className="text-white/85 font-medium">
                  {channel.creatorDisplayName || channel.creatorEmail}
                </span>
              </p>
              <div className="flex items-center gap-5 text-xs text-white/50 flex-wrap">
                <span className="flex items-center gap-1.5">
                  <Eye className="h-3.5 w-3.5" />
                  {channel.viewCount} vues
                </span>
                {channel.approvedAt && (
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    Ouverte le{" "}
                    {new Date(channel.approvedAt).toLocaleDateString("fr-FR")}
                  </span>
                )}
              </div>
            </div>
          </div>
          {channel.bio && (
            <p className="text-white/75 leading-relaxed mt-5 border-t border-white/10 pt-5 text-base">
              {channel.bio}
            </p>
          )}
        </div>

        <section className="mt-12 vx-rise-in vx-rise-in--delay-2">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 vx-text-glow">
            Contenus de la chaine
          </h2>
          {contents.length === 0 ? (
            <Card className="vx-cinema-card bg-slate-900/50 border-white/10">
              <CardContent className="p-12 text-center text-white/60 text-base">
                Le createur n&apos;a pas encore ajoute de contenu a sa chaine.
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {contents.map((c) => {
                const Icon =
                  c.contentType === "video"
                    ? Film
                    : c.contentType === "podcast"
                      ? Headphones
                      : BookOpen
                return (
                  <Link
                    key={c.id}
                    href={`/video/${c.contentId}`}
                    className="group block"
                  >
                    <Card className="vx-cinema-card bg-slate-900/50 border-white/10 hover:border-fuchsia-500/40 h-full overflow-hidden">
                      <div className="vx-cinema-poster aspect-video bg-slate-800">
                        {c.contentCoverUrl ? (
                          <Image
                            src={c.contentCoverUrl}
                            alt={c.contentTitle || ""}
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            className="object-cover"
                            loading="lazy"
                            data-poster-img=""
                          />
                        ) : (
                          <div className="h-full flex items-center justify-center relative z-[3]">
                            <Icon className="h-10 w-10 text-white/30" />
                          </div>
                        )}
                      </div>
                      <CardContent className="p-5">
                        <div className="flex items-center gap-2 mb-2">
                          <Icon className="h-3.5 w-3.5 text-fuchsia-300" />
                          <span className="text-[11px] uppercase tracking-wider text-white/50 font-medium">
                            {c.contentType}
                          </span>
                        </div>
                        <h3 className="font-semibold text-base line-clamp-2 group-hover:text-fuchsia-200 transition-colors leading-snug">
                          {c.contentTitle}
                        </h3>
                      </CardContent>
                    </Card>
                  </Link>
                )
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
