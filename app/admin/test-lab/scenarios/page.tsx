"use client"

import { useState } from "react"
import { useTestLabAccess } from "@/lib/test-lab/use-test-lab-access"
import type { TestScenarioConfig, TestScenarioResult } from "@/lib/test-lab/types"
import { Loader2, Wand2, RotateCw } from "lucide-react"

interface RunResponse {
  success: boolean
  runId?: string | null
  config?: TestScenarioConfig
  result?: TestScenarioResult
  error?: string
}

const DEFAULTS: TestScenarioConfig = {
  name: "Lancement VIXUAL V1",
  visitors: 20,
  creators: 3,
  contributors: 10,
  videos: 5,
  podcasts: 2,
  articles: 4,
  successfulPaymentsPercent: 80,
  failedPaymentsPercent: 20,
  durationMinutes: 30,
  enableStripeSimulation: true,
  enableBunnyMock: true,
}

export default function TestLabScenariosPage() {
  const { email } = useTestLabAccess()
  const [config, setConfig] = useState<TestScenarioConfig>(DEFAULTS)
  const [response, setResponse] = useState<RunResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [resetState, setResetState] = useState<string | null>(null)

  function update<K extends keyof TestScenarioConfig>(
    key: K,
    value: TestScenarioConfig[K],
  ) {
    setConfig((prev) => ({ ...prev, [key]: value }))
  }

  async function runScenario() {
    setLoading(true)
    setResponse(null)
    try {
      const res = await fetch("/api/admin/test-lab/scenarios/run", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-email": email,
        },
        body: JSON.stringify(config),
      })

      // Gestion erreur HTTP
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        setResponse({
          success: false,
          error: errorData.error || `Erreur HTTP ${res.status}`,
        })
        alert(`Erreur lancement scenario: ${errorData.error || res.statusText}`)
        return
      }

      const data = (await res.json()) as RunResponse
      setResponse(data)

      if (!data.success) {
        alert(`Erreur: ${data.error || "Erreur inconnue"}`)
      }
    } catch (err) {
      const errorMsg = (err as Error).message
      setResponse({
        success: false,
        error: errorMsg,
      })
      alert(`Erreur lancement scenario: ${errorMsg}`)
    } finally {
      setLoading(false)
    }
  }

  async function resetLab() {
    // Confirmation avant reset
    if (!confirm("Reinitialiser le laboratoire de tests ? Cette action supprimera tous les resultats de tests.")) {
      return
    }

    setResetState("loading")
    try {
      const res = await fetch("/api/admin/test-lab/reset", {
        method: "POST",
        headers: { "x-admin-email": email },
      })

      // Gestion erreur HTTP
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        setResetState(errorData.error || `Erreur HTTP ${res.status}`)
        return
      }

      const data = (await res.json()) as { success: boolean; message?: string; error?: string }
      setResetState(data.success ? data.message ?? "Reset effectue" : data.error ?? "Erreur")
    } catch (err) {
      setResetState((err as Error).message)
    }
  }

  return (
    <main className="text-white p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <header>
          <p className="text-xs uppercase tracking-wider text-violet-300">
            Laboratoire de tests
          </p>
          <h1 className="text-3xl font-bold mt-1 flex items-center gap-3">
            <Wand2 className="h-6 w-6 text-violet-300" />
            Creer un scenario personnalise
          </h1>
          <p className="text-white/60 mt-2 max-w-2xl">
            Genere un environnement fictif avec profils, contenus, contributions
            Stripe test et Bunny mock. Aucune donnee reelle n&apos;est affectee.
          </p>
        </header>

        {/* Scenarios rapides preconfigures */}
        <section className="rounded-2xl border border-violet-500/20 bg-violet-500/5 p-5">
          <h2 className="font-semibold mb-3">Scenarios rapides</h2>
          <div className="grid md:grid-cols-3 gap-3">
            <QuickScenarioButton
              label="Scenario leger"
              desc="50 utilisateurs"
              onClick={() => setConfig({
                ...config,
                name: "Scenario leger",
                visitors: 20,
                creators: 2,
                contributors: 5,
                videos: 2,
                podcasts: 1,
                articles: 2,
                successfulPaymentsPercent: 85,
                failedPaymentsPercent: 15,
              })}
            />
            <QuickScenarioButton
              label="Scenario lancement"
              desc="250 utilisateurs"
              onClick={() => setConfig({
                ...config,
                name: "Scenario lancement",
                visitors: 250,
                creators: 10,
                contributors: 60,
                videos: 20,
                podcasts: 8,
                articles: 15,
                successfulPaymentsPercent: 88,
                failedPaymentsPercent: 12,
              })}
            />
            <QuickScenarioButton
              label="Fort trafic"
              desc="1 000 utilisateurs"
              onClick={() => setConfig({
                ...config,
                name: "Scenario fort trafic",
                visitors: 1000,
                creators: 50,
                contributors: 250,
                videos: 100,
                podcasts: 40,
                articles: 80,
                successfulPaymentsPercent: 90,
                failedPaymentsPercent: 10,
              })}
            />
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <h2 className="font-semibold mb-4">Configuration personnalisee</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Nom du scenario">
              <input
                type="text"
                value={config.name}
                onChange={(e) => update("name", e.target.value)}
                className="input"
              />
            </Field>
            <Field label="Duree (minutes)">
              <NumberInput
                value={config.durationMinutes}
                onChange={(v) => update("durationMinutes", v)}
                min={1}
              />
            </Field>

            <Field label="Visiteurs">
              <NumberInput value={config.visitors} onChange={(v) => update("visitors", v)} />
            </Field>
            <Field label="Createurs">
              <NumberInput value={config.creators} onChange={(v) => update("creators", v)} />
            </Field>
            <Field label="Contributeurs">
              <NumberInput
                value={config.contributors}
                onChange={(v) => update("contributors", v)}
              />
            </Field>
            <Field label="Videos">
              <NumberInput value={config.videos} onChange={(v) => update("videos", v)} />
            </Field>
            <Field label="Podcasts">
              <NumberInput value={config.podcasts} onChange={(v) => update("podcasts", v)} />
            </Field>
            <Field label="Articles">
              <NumberInput value={config.articles} onChange={(v) => update("articles", v)} />
            </Field>

            <Field label="% paiements OK">
              <NumberInput
                value={config.successfulPaymentsPercent}
                onChange={(v) => update("successfulPaymentsPercent", v)}
                min={0}
                max={100}
              />
            </Field>
            <Field label="% paiements echoues">
              <NumberInput
                value={config.failedPaymentsPercent}
                onChange={(v) => update("failedPaymentsPercent", v)}
                min={0}
                max={100}
              />
            </Field>

            <Field label="Stripe simulation">
              <Toggle
                checked={config.enableStripeSimulation}
                onChange={(v) => update("enableStripeSimulation", v)}
              />
            </Field>
            <Field label="Bunny mock">
              <Toggle
                checked={config.enableBunnyMock}
                onChange={(v) => update("enableBunnyMock", v)}
              />
            </Field>
          </div>

          <div className="flex flex-wrap gap-3 mt-6">
            <button
              onClick={runScenario}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl bg-violet-600 hover:bg-violet-500 px-5 py-3 font-semibold disabled:opacity-50 transition"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Wand2 className="h-4 w-4" />
              )}
              {loading ? "Simulation en cours..." : "Lancer le scenario"}
            </button>

            <button
              onClick={resetLab}
              className="inline-flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 px-5 py-3 font-semibold text-rose-200 transition"
            >
              <RotateCw className="h-4 w-4" />
              Reset laboratoire
            </button>

            {resetState && (
              <p className="text-sm text-white/60 self-center">{resetState}</p>
            )}
          </div>
        </section>

        {response && (
          <section className="rounded-2xl border border-white/10 bg-white/5 p-5 space-y-3">
            <h2 className="font-semibold">Resultat</h2>
            {response.success && response.result ? (
              <div className="grid md:grid-cols-5 gap-3">
                <Stat label="Profils" value={response.result.summary.usersCount} />
                <Stat label="Contenus" value={response.result.summary.projectsCount} />
                <Stat label="Transactions" value={response.result.summary.transactionsCount} />
                <Stat
                  label="Paiements OK"
                  value={response.result.summary.successfulPayments}
                  tone="emerald"
                />
                <Stat
                  label="Paiements KO"
                  value={response.result.summary.failedPayments}
                  tone="rose"
                />
              </div>
            ) : (
              <p className="text-rose-300 text-sm">
                {response.error ?? "Erreur inconnue"}
              </p>
            )}
            <details className="text-xs text-white/50">
              <summary className="cursor-pointer hover:text-white/80">
                Voir le payload complet
              </summary>
              <pre className="mt-2 rounded-xl bg-black/40 border border-white/10 p-3 overflow-auto max-h-96">
                {JSON.stringify(response, null, 2)}
              </pre>
            </details>
          </section>
        )}
      </div>

      <style jsx>{`
        .input {
          width: 100%;
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 0.5rem;
          padding: 0.5rem 0.75rem;
          color: white;
          font-size: 0.875rem;
        }
        .input:focus {
          outline: none;
          border-color: rgba(167, 139, 250, 0.5);
        }
      `}</style>
    </main>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs uppercase tracking-wider text-white/50 mb-1.5">
        {label}
      </span>
      {children}
    </label>
  )
}

function NumberInput({
  value,
  onChange,
  min = 0,
  max,
}: {
  value: number
  onChange: (v: number) => void
  min?: number
  max?: number
}) {
  return (
    <input
      type="number"
      value={value}
      min={min}
      max={max}
      onChange={(e) => {
        const n = Number(e.target.value)
        if (Number.isNaN(n)) return
        onChange(n)
      }}
      className="input"
    />
  )
}

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
        checked ? "bg-violet-500" : "bg-white/20"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
          checked ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  )
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string
  value: number
  tone?: "emerald" | "rose"
}) {
  const toneClass =
    tone === "emerald"
      ? "text-emerald-300"
      : tone === "rose"
        ? "text-rose-300"
        : "text-white"
  return (
    <div className="rounded-xl bg-black/30 border border-white/10 p-4">
      <p className="text-xs uppercase tracking-wider text-white/50">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${toneClass}`}>{value}</p>
    </div>
  )
}

function QuickScenarioButton({
  label,
  desc,
  onClick,
}: {
  label: string
  desc: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-xl border border-violet-500/30 bg-violet-500/10 hover:bg-violet-500/20 p-4 text-left transition"
    >
      <p className="font-semibold text-violet-200">{label}</p>
      <p className="text-xs text-white/50 mt-1">{desc}</p>
    </button>
  )
}

const _styles = ""
