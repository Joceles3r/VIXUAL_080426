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
      <main className="vx-cinema-hero relative min-h-screen bg-slate-950 text-white">
        <div className="vx-orb-bg" aria-hidden="true" />
        <div className="container mx-auto px-4 py-24 max-w-3xl text-center relative">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-fuchsia-500/10 border border-fuchsia-500/30 mb-6 backdrop-blur-md">
            <Tv className="h-8 w-8 text-fuchsia-300" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-5 text-balance vx-text-glow">
            Les chaines createurs arrivent bientot
          </h1>
          <p className="text-white/75 leading-relaxed text-base md:text-lg max-w-xl mx-auto">
            Ce module est actuellement desactive. Il sera ouvert progressivement
            aux createurs les plus actifs et fiables (Trust Score &ge; 85), apres
            validation manuelle par l&apos;equipe VIXUAL.
          </p>
        </div>
      </main>
    )
  }

  const channels = await listActiveChannels(50)

  return (
    <main className="vx-cinema-hero relative min-h-screen bg-slate-950 text-white">
      {/* Halos cinéma signature studio créateur */}
      <div className="vx-orb-bg" aria-hidden="true" />

      <div className="container mx-auto px-4 py-16 max-w-6xl relative">
        <header className="mb-14 text-center">
          <div className="flex justify-center mb-5 vx-rise-in">
            <span className="vx-pill">
              <Sparkles className="h-3 w-3" />
              Chaines createurs
            </span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-4 text-balance vx-text-glow vx-rise-in vx-rise-in--delay-1">
            Univers creatifs des createurs VIXUAL
          </h1>
          <p className="text-white/70 max-w-2xl mx-auto leading-relaxed text-base md:text-lg vx-rise-in vx-rise-in--delay-2">
            Decouvre les chaines des createurs independants qui se sont distingues
            par leur engagement, leur qualite et la confiance de la communaute.
          </p>
        </header>

        {channels.length === 0 ? (
          <Card className="vx-cinema-card bg-slate-900/50 border-white/10">
            <CardContent className="p-12 text-center">
              <Tv className="h-12 w-12 mx-auto text-white/30 mb-4" />
              <p className="text-white/65 text-lg">
                Aucune chaine ouverte pour le moment. Les premieres chaines
                arriveront avec les createurs les plus engages.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {channels.map((c) => (
              <Link
                key={c.id}
                href={`/channels/${c.slug}`}
                className="group block"
              >
                <Card className="vx-cinema-card bg-slate-900/50 border-white/10 hover:border-fuchsia-500/40 h-full overflow-hidden">
                  <div
                    className="vx-cinema-poster h-40 flex items-center justify-center relative"
                    style={
                      c.bannerUrl
                        ? {
                            backgroundImage: `url(${c.bannerUrl})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                          }
                        : {
                            background:
                              "linear-gradient(135deg, rgba(217,70,239,0.35) 0%, rgba(168,85,247,0.25) 50%, rgba(15,23,42,1) 100%)",
                          }
                    }
                  >
                    {!c.bannerUrl && (
                      <Tv className="h-12 w-12 text-fuchsia-200/70 relative z-[3]" />
                    )}
                  </div>
                  <CardContent className="p-6">
                    <h2 className="font-semibold text-xl mb-1.5 group-hover:text-fuchsia-200 transition-colors text-balance">
                      {c.name}
                    </h2>
                    <p className="text-xs text-white/50 mb-3 uppercase tracking-wider">
                      par {c.creatorDisplayName || c.creatorEmail || "Createur"}
                    </p>
                    {c.bio && (
                      <p className="text-sm text-white/70 line-clamp-2 leading-relaxed mb-4">
                        {c.bio}
                      </p>
                    )}
                    <div className="flex items-center gap-1.5 text-xs text-white/45">
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
