/**
 * Page publique : liste des chaines createurs actives.
 * Reservee a la V3 + module active. Affiche un message clair sinon.
 */
import Link from "next/link"
import { isCreatorChannelsModuleActive } from "@/lib/channels/state"
import { listActiveChannels } from "@/lib/channels/service"
import { Card, CardContent } from "@/components/ui/card"
import { Tv, Eye, Sparkles } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function ChannelsPage() {
  const isActive = await isCreatorChannelsModuleActive()

  if (!isActive) {
    return (
      <main className="min-h-screen bg-slate-950 text-white">
        <div className="container mx-auto px-4 py-16 max-w-3xl text-center">
          <Tv className="h-12 w-12 mx-auto text-fuchsia-400 mb-4" />
          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-balance">
            Les chaines createurs arrivent bientot
          </h1>
          <p className="text-white/70 leading-relaxed">
            Ce module est actuellement desactive. Il sera ouvert progressivement
            aux createurs les plus actifs et fiables (Trust Score >= 85), apres
            validation manuelle par l&apos;equipe VIXUAL.
          </p>
        </div>
      </main>
    )
  }

  const channels = await listActiveChannels(50)

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <header className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-fuchsia-500/10 border border-fuchsia-500/30 text-fuchsia-200 text-xs font-medium mb-4">
            <Sparkles className="h-3 w-3" />
            Chaines createurs
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-3 text-balance">
            Univers creatifs des createurs VIXUAL
          </h1>
          <p className="text-white/65 max-w-2xl mx-auto leading-relaxed">
            Decouvre les chaines des createurs independants qui se sont distingues
            par leur engagement, leur qualite et la confiance de la communaute.
          </p>
        </header>

        {channels.length === 0 ? (
          <Card className="bg-slate-900/50 border-white/10">
            <CardContent className="p-10 text-center">
              <Tv className="h-10 w-10 mx-auto text-white/30 mb-3" />
              <p className="text-white/60">
                Aucune chaine ouverte pour le moment. Les premieres chaines
                arriveront avec les createurs les plus engages.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {channels.map((c) => (
              <Link
                key={c.id}
                href={`/channels/${c.slug}`}
                className="group"
              >
                <Card className="bg-slate-900/50 border-white/10 hover:border-fuchsia-500/40 transition-colors h-full overflow-hidden">
                  <div
                    className="h-32 bg-gradient-to-br from-fuchsia-600/30 via-purple-700/20 to-slate-900 flex items-center justify-center relative"
                    style={
                      c.bannerUrl
                        ? {
                            backgroundImage: `url(${c.bannerUrl})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                          }
                        : undefined
                    }
                  >
                    {!c.bannerUrl && <Tv className="h-10 w-10 text-fuchsia-300/60" />}
                  </div>
                  <CardContent className="p-5">
                    <h2 className="font-semibold text-lg mb-1 group-hover:text-fuchsia-300 transition-colors">
                      {c.name}
                    </h2>
                    <p className="text-xs text-white/50 mb-3">
                      par {c.creatorDisplayName || c.creatorEmail || "Createur"}
                    </p>
                    {c.bio && (
                      <p className="text-sm text-white/70 line-clamp-2 leading-relaxed mb-3">
                        {c.bio}
                      </p>
                    )}
                    <div className="flex items-center gap-1.5 text-xs text-white/40">
                      <Eye className="h-3 w-3" />
                      <span>{c.viewCount} vues</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
