"use client"

import { CreditCard, ShieldCheck } from "lucide-react"
import { STRIPE_TEST_CARDS } from "@/lib/test-lab/stripe-simulator"

const COLOR_MAP = {
  emerald: "border-emerald-500/30 bg-emerald-500/10 text-emerald-200",
  red: "border-rose-500/30 bg-rose-500/10 text-rose-200",
  amber: "border-amber-500/30 bg-amber-500/10 text-amber-200",
} as const

export default function TestLabStripePage() {
  return (
    <main className="text-white p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <header className="space-y-2">
          <p className="text-xs uppercase tracking-wider text-emerald-300">
            Laboratoire / Stripe
          </p>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <CreditCard className="h-6 w-6 text-emerald-300" />
            Test Stripe VIXUAL
          </h1>
          <p className="text-white/60 max-w-2xl">
            Utilise uniquement les cartes Stripe TEST. Aucun paiement reel ne
            doit etre declenche depuis cet ecran.
          </p>
        </header>

        <section className="grid md:grid-cols-3 gap-4">
          {STRIPE_TEST_CARDS.map((card) => (
            <div
              key={card.number}
              className={`rounded-2xl border p-5 ${COLOR_MAP[card.color]}`}
            >
              <h2 className="font-semibold">{card.label}</h2>
              <p className="font-mono text-sm mt-3 tracking-wider">
                {card.number}
              </p>
              <p className="text-xs opacity-80 mt-2">CVC : 123 — Date : future</p>
            </div>
          ))}
        </section>

        <section className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5 flex items-start gap-3">
          <ShieldCheck className="h-5 w-5 text-emerald-300 shrink-0 mt-0.5" />
          <div className="text-sm text-white/70 leading-relaxed">
            <p className="text-white font-medium mb-1">Mode isole actif</p>
            <p>
              Le flag <code className="text-emerald-300">VIXUAL_TEST_LAB_ALLOW_REAL_STRIPE</code>{" "}
              doit rester <strong>false</strong> tant que la phase de validation
              n&apos;est pas terminee. Toutes les transactions generees ici sont
              persistes uniquement dans <code className="text-emerald-300">test_lab_runs</code>.
            </p>
          </div>
        </section>
      </div>
    </main>
  )
}
