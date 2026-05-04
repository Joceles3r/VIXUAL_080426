"use client"

import { BarChart3 } from "lucide-react"

export default function TestLabResultsPage() {
  return (
    <main className="text-white p-6">
      <div className="max-w-5xl mx-auto space-y-4">
        <header className="space-y-2">
          <p className="text-xs uppercase tracking-wider text-amber-300">
            Laboratoire / Resultats
          </p>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <BarChart3 className="h-6 w-6 text-amber-300" />
            Resultats de tests VIXUAL
          </h1>
        </header>

        <section className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-white/70 leading-relaxed space-y-3">
          <p>
            Les scenarios executes sont historises dans{" "}
            <code className="text-amber-300">test_lab_runs</code> et leurs
            payloads dans <code className="text-amber-300">test_lab_payloads</code>.
          </p>
          <p>
            La consultation detaillee (filtres, comparaison, export) sera
            ajoutee dans une iteration ulterieure. Pour l&apos;instant, le
            resume est affiche directement apres l&apos;execution dans la page{" "}
            <strong>Creer un scenario personnalise</strong>.
          </p>
        </section>
      </div>
    </main>
  )
}
