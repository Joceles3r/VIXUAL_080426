"use client"

import { Video, Loader2, CheckCircle2, AlertTriangle } from "lucide-react"
import type { TestBunnyMode } from "@/lib/test-lab/types"

const STATES: Array<{
  status: TestBunnyMode
  label: string
  desc: string
  color: string
  icon: typeof Loader2
}> = [
  {
    status: "processing",
    label: "processing",
    desc: "Encodage en cours, lecture indisponible.",
    color: "border-yellow-500/30 bg-yellow-500/10 text-yellow-200",
    icon: Loader2,
  },
  {
    status: "ready",
    label: "ready",
    desc: "Pret a la lecture, URL Bunny CDN simulee.",
    color: "border-emerald-500/30 bg-emerald-500/10 text-emerald-200",
    icon: CheckCircle2,
  },
  {
    status: "error",
    label: "error",
    desc: "Echec encodage Bunny, retry attendu.",
    color: "border-rose-500/30 bg-rose-500/10 text-rose-200",
    icon: AlertTriangle,
  },
]

export default function TestLabBunnyPage() {
  return (
    <main className="text-white p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <header className="space-y-2">
          <p className="text-xs uppercase tracking-wider text-sky-300">
            Laboratoire / Bunny
          </p>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Video className="h-6 w-6 text-sky-300" />
            Test Bunny VIXUAL
          </h1>
          <p className="text-white/60 max-w-2xl">
            Ce module teste Bunny en mode mock avant activation reelle.
            Aucun upload n&apos;est envoye au CDN tant que{" "}
            <code className="text-sky-300">VIXUAL_TEST_LAB_ALLOW_REAL_BUNNY</code>{" "}
            reste a <strong>false</strong>.
          </p>
        </header>

        <section className="rounded-2xl border border-sky-500/30 bg-sky-500/10 p-5">
          <h2 className="text-lg font-semibold mb-3">Lecteur mock</h2>
          <video
            controls
            className="w-full rounded-xl bg-black aspect-video"
            preload="none"
          >
            <source src="/videos/demo1.mp4" type="video/mp4" />
            Votre navigateur ne supporte pas la lecture video.
          </video>
          <p className="text-xs text-white/50 mt-2">
            Source : fichier statique local — aucun appel reseau Bunny.
          </p>
        </section>

        <section className="grid md:grid-cols-3 gap-4">
          {STATES.map((state) => {
            const Icon = state.icon
            return (
              <div key={state.status} className={`rounded-xl border p-4 ${state.color}`}>
                <div className="flex items-center gap-2 font-semibold">
                  <Icon
                    className={`h-4 w-4 ${
                      state.status === "processing" ? "animate-spin" : ""
                    }`}
                  />
                  {state.label}
                </div>
                <p className="text-xs opacity-80 mt-2 leading-relaxed">{state.desc}</p>
              </div>
            )
          })}
        </section>
      </div>
    </main>
  )
}
