"use client"

import Link from "next/link"
import { FlaskConical, CreditCard, Video, BarChart3, Wand2, Users, RotateCcw, GitCompare } from "lucide-react"

export default function AdminTestLabPage() {
  const tiles = [
    {
      href: "/admin/test-lab/scenarios",
      title: "Creer un scenario personnalise",
      desc: "Generer profils, contenus, contributions et statuts Bunny mock.",
      icon: Wand2,
      color: "violet",
    },
    {
      href: "/admin/test-lab/realtime",
      title: "Simulation temps reel",
      desc: "Simule 1 000 utilisateurs avec trafic, contributions et etats Stripe/Bunny.",
      icon: Users,
      color: "fuchsia",
    },
    {
      href: "/admin/test-lab/stripe",
      title: "Tester Stripe",
      desc: "Paiements reussis, refuses, authentification 3DS, soutien libre.",
      icon: CreditCard,
      color: "emerald",
    },
    {
      href: "/admin/test-lab/bunny",
      title: "Tester Bunny",
      desc: "Upload mock, processing, ready, error et lecture locale.",
      icon: Video,
      color: "sky",
    },
    {
      href: "/admin/test-lab/results",
      title: "Resultats de tests",
      desc: "Synthese des scenarios, transactions et contenus generes.",
      icon: BarChart3,
      color: "amber",
    },
    {
      href: "/admin/test-lab/comparison",
      title: "Comparaison A/B",
      desc: "Compare deux configurations economiques cote a cote (ex: 23% vs 20% commission).",
      icon: GitCompare,
      color: "indigo",
    },
  ] as const

  const colorMap = {
    violet: "border-violet-500/30 bg-violet-500/10 hover:bg-violet-500/20",
    fuchsia: "border-fuchsia-500/30 bg-fuchsia-500/10 hover:bg-fuchsia-500/20",
    emerald: "border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20",
    sky: "border-sky-500/30 bg-sky-500/10 hover:bg-sky-500/20",
    amber: "border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20",
    indigo: "border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/20",
  } as const

  const iconColorMap = {
    violet: "text-violet-300",
    fuchsia: "text-fuchsia-300",
    emerald: "text-emerald-300",
    sky: "text-sky-300",
    amber: "text-amber-300",
    indigo: "text-indigo-300",
  } as const

  return (
    <main className="text-white p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="space-y-2">
          <p className="text-xs uppercase tracking-wider text-violet-300">
            ADMIN / PATRON
          </p>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <FlaskConical className="h-7 w-7 text-violet-300" />
            Laboratoire de tests VIXUAL
          </h1>
          <p className="text-white/60 max-w-2xl text-pretty">
            Environnement isole pour tester Stripe, Bunny, les profils
            utilisateurs et les scenarios personnalises. Aucune ecriture sur
            les vraies donnees, aucun paiement reel.
          </p>
        </header>

        <section className="grid md:grid-cols-2 gap-4">
          {tiles.map((tile) => {
            const Icon = tile.icon
            return (
              <Link
                key={tile.href}
                href={tile.href}
                className={`rounded-2xl border p-5 transition ${colorMap[tile.color]}`}
              >
                <div className="flex items-start gap-4">
                  <div className="rounded-xl bg-black/20 p-3 border border-white/10">
                    <Icon className={`h-5 w-5 ${iconColorMap[tile.color]}`} />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-lg font-semibold">{tile.title}</h2>
                    <p className="text-white/60 text-sm mt-2 leading-relaxed">
                      {tile.desc}
                    </p>
                  </div>
                </div>
              </Link>
            )
          })}
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-white/70 leading-relaxed">
          <p className="font-medium text-white mb-2">Garde-fous actifs</p>
          <ul className="space-y-1 list-disc list-inside">
            <li>Acces gate par email PATRON et flag VIXUAL_TEST_LAB_ENABLED.</li>
            <li>Stripe et Bunny en mode simulation par defaut.</li>
            <li>Persistance reservee aux tables test_lab_*.</li>
            <li>Aucune interaction avec users / contents / payments / wallets.</li>
          </ul>
        </section>
      </div>
    </main>
  )
}
