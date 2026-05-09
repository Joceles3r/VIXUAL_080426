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
import { Tv, Eye, Calendar, Film, BookOpen, Headphones } from "lucide-react"

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
      {/* Banner */}
      <div
        className="h-48 md:h-64 bg-gradient-to-br from-fuchsia-700/40 via-purple-800/30 to-slate-950 relative"
        style={
          channel.bannerUrl
            ? {
                backgroundImage: `url(${channel.bannerUrl})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }
            : undefined
        }
      >
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent" />
      </div>

      <div className="container mx-auto px-4 max-w-5xl -mt-16 relative z-10">
        <Card className="bg-slate-900/80 backdrop-blur border-white/10">
          <CardContent className="p-6 md:p-8">
            <div className="flex items-start gap-4 mb-4">
              <div className="h-14 w-14 rounded-xl bg-fuchsia-500/15 border border-fuchsia-500/30 flex items-center justify-center shrink-0">
                <Tv className="h-7 w-7 text-fuchsia-300" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl md:text-3xl font-bold mb-1 text-balance">
                  {channel.name}
                </h1>
                <p className="text-sm text-white/55 mb-2">
                  Univers creatif de {channel.creatorDisplayName || channel.creatorEmail}
                </p>
                <div className="flex items-center gap-4 text-xs text-white/45">
                  <span className="flex items-center gap-1.5">
                    <Eye className="h-3 w-3" />
                    {channel.viewCount} vues
                  </span>
                  {channel.approvedAt && (
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-3 w-3" />
                      Ouverte le{" "}
                      {new Date(channel.approvedAt).toLocaleDateString("fr-FR")}
                    </span>
                  )}
                </div>
              </div>
            </div>
            {channel.bio && (
              <p className="text-white/75 leading-relaxed mt-4 border-t border-white/5 pt-4">
                {channel.bio}
              </p>
            )}
          </CardContent>
        </Card>

        <section className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Contenus de la chaine</h2>
          {contents.length === 0 ? (
            <Card className="bg-slate-900/50 border-white/10">
              <CardContent className="p-8 text-center text-white/55">
                Le createur n&apos;a pas encore ajoute de contenu a sa chaine.
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
                    className="group"
                  >
                    <Card className="bg-slate-900/50 border-white/10 hover:border-fuchsia-500/40 transition-colors h-full overflow-hidden">
                      <div className="aspect-video bg-slate-800 relative">
                        {c.contentCoverUrl ? (
                          <Image
                            src={c.contentCoverUrl}
                            alt={c.contentTitle || ""}
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                          />
                        ) : (
                          <div className="h-full flex items-center justify-center">
                            <Icon className="h-8 w-8 text-white/30" />
                          </div>
                        )}
                      </div>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-1.5">
                          <Icon className="h-3.5 w-3.5 text-fuchsia-300" />
                          <span className="text-[11px] uppercase tracking-wider text-white/45">
                            {c.contentType}
                          </span>
                        </div>
                        <h3 className="font-medium text-sm line-clamp-2 group-hover:text-fuchsia-200 transition-colors">
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
