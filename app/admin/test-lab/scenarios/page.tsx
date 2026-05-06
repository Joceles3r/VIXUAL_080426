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
  name: "Lancement VIXUAL — Cycle mensuel complet",
  visitors: 30,
  creators: 5,
  contributors: 15,
  infoporteurs: 3,
  podcasteurs: 3,
  auditeurs: 8,
  contribu_lecteurs: 8,
  guests: 10,
  videos: 5,
  podcasts: 3,
  articles: 4,
  successfulPaymentsPercent: 80,
  failedPaymentsPercent: 20,
  durationMinutes: 30,
  enableStripeSimulation: true,
  enableBunnyMock: true,
  enableTrustScoreEvolution: true,
  enableVisibilityBoostSim: true,
  enableMonthlyCycleClose: true,
  simulatedDaysActive: 30,
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
              desc="~80 utilisateurs"
              onClick={() => setConfig({
                ...config,
                name: "Scenario leger",
                visitors: 20,
                creators: 2,
                contributors: 5,
                infoporteurs: 1,
                podcasteurs: 1,
                auditeurs: 3,
                contribu_lecteurs: 3,
                guests: 5,
                videos: 2,
                podcasts: 1,
                articles: 2,
                successfulPaymentsPercent: 85,
                failedPaymentsPercent: 15,
                simulatedDaysActive: 14,
              })}
            />
            <QuickScenarioButton
              label="Scenario lancement"
              desc="~400 utilisateurs"
              onClick={() => setConfig({
                ...config,
                name: "Scenario lancement",
                visitors: 250,
                creators: 10,
                contributors: 60,
                infoporteurs: 8,
                podcasteurs: 8,
                auditeurs: 25,
                contribu_lecteurs: 25,
                guests: 30,
                videos: 20,
                podcasts: 8,
                articles: 15,
                successfulPaymentsPercent: 88,
                failedPaymentsPercent: 12,
                simulatedDaysActive: 30,
              })}
            />
            <QuickScenarioButton
              label="Fort trafic"
              desc="~1 700 utilisateurs"
              onClick={() => setConfig({
                ...config,
                name: "Scenario fort trafic",
                visitors: 1000,
                creators: 50,
                contributors: 250,
                infoporteurs: 30,
                podcasteurs: 30,
                auditeurs: 100,
                contribu_lecteurs: 100,
                guests: 150,
                videos: 100,
                podcasts: 40,
                articles: 80,
                successfulPaymentsPercent: 90,
                failedPaymentsPercent: 10,
                simulatedDaysActive: 30,
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
            <Field label="Infoporteurs">
              <NumberInput
                value={config.infoporteurs}
                onChange={(v) => update("infoporteurs", v)}
              />
            </Field>
            <Field label="Podcasteurs">
              <NumberInput
                value={config.podcasteurs}
                onChange={(v) => update("podcasteurs", v)}
              />
            </Field>
            <Field label="Auditeurs">
              <NumberInput
                value={config.auditeurs}
                onChange={(v) => update("auditeurs", v)}
              />
            </Field>
            <Field label="Contribu-lecteurs">
              <NumberInput
                value={config.contribu_lecteurs}
                onChange={(v) => update("contribu_lecteurs", v)}
              />
            </Field>
            <Field label="Invites (guests)">
              <NumberInput
                value={config.guests}
                onChange={(v) => update("guests", v)}
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

            <Field label="Trust Score (Niveau 1 -> 2 -> 3)">
              <Toggle
                checked={config.enableTrustScoreEvolution}
                onChange={(v) => update("enableTrustScoreEvolution", v)}
              />
            </Field>
            <Field label="Boost visibilite visiteur -> createur">
              <Toggle
                checked={config.enableVisibilityBoostSim}
                onChange={(v) => update("enableVisibilityBoostSim", v)}
              />
            </Field>
            <Field label="Cloture cycle mensuel (TOP 10 + redistribution)">
              <Toggle
                checked={config.enableMonthlyCycleClose}
                onChange={(v) => update("enableMonthlyCycleClose", v)}
              />
            </Field>
            <Field label="Jours simules d'activite">
              <NumberInput
                value={config.simulatedDaysActive}
                onChange={(v) => update("simulatedDaysActive", v)}
                min={1}
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
              <div className="space-y-4">
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

                {/* Metriques economiques */}
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                  <h3 className="text-emerald-300 text-sm font-semibold mb-3 uppercase tracking-wider">
                    Metriques economiques
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                    <EconomicStat
                      label="Revenu total"
                      value={`${response.result.summary.totalRevenueEur} EUR`}
                    />
                    <EconomicStat
                      label="Part Vixual"
                      value={`${response.result.summary.vixualPlatformShareEur} EUR`}
                    />
                    <EconomicStat
                      label="Reverse createurs"
                      value={`${response.result.summary.creatorsRevenueEur} EUR`}
                    />
                    <EconomicStat
                      label="Reserve technique"
                      value={`${response.result.summary.reserveTechniqueEur} EUR`}
                    />
                  </div>
                </div>

                {/* Profils detailles */}
                <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-4">
                  <h3 className="text-violet-300 text-sm font-semibold mb-3 uppercase tracking-wider">
                    Repartition des 8 profils
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                    {Object.entries(response.result.summary.profileBreakdown).map(([role, count]) => (
                      <div
                        key={role}
                        className="flex items-center justify-between rounded-lg bg-black/30 px-3 py-2 border border-white/5"
                      >
                        <span className="text-white/60 capitalize">
                          {role.replace("_", "-")}
                        </span>
                        <span className="text-white font-semibold">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Niveaux Trust Score */}
                <div className="rounded-xl border border-sky-500/20 bg-sky-500/5 p-4">
                  <h3 className="text-sky-300 text-sm font-semibold mb-3 uppercase tracking-wider">
                    Niveaux utilisateurs (Trust Score)
                  </h3>
                  <div className="grid grid-cols-3 gap-3 text-xs">
                    <EconomicStat label="Niveau 1" value={response.result.summary.level1Count} />
                    <EconomicStat label="Niveau 2" value={response.result.summary.level2Count} />
                    <EconomicStat label="Niveau 3" value={response.result.summary.level3Count} />
                  </div>
                </div>

                {/* Boost visibilite */}
                {response.result.summary.uniqueBoosters > 0 && (
                  <div className="rounded-xl border border-fuchsia-500/20 bg-fuchsia-500/5 p-4">
                    <h3 className="text-fuchsia-300 text-sm font-semibold mb-3 uppercase tracking-wider">
                      Boost visibilite (V1)
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                      <EconomicStat
                        label="Visiteurs participants"
                        value={response.result.summary.uniqueBoosters}
                      />
                      <EconomicStat
                        label="Points VIXU depenses"
                        value={response.result.summary.totalVisibilityPointsSpent}
                      />
                      <EconomicStat
                        label="Coefficient Gini"
                        value={response.result.summary.giniCoefficient.toFixed(3)}
                        hint="0 = egalite, 1 = concentration"
                      />
                    </div>
                  </div>
                )}

                {/* TOP 10 createurs */}
                {response.result.summary.top10Creators.length > 0 && (
                  <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
                    <h3 className="text-amber-300 text-sm font-semibold mb-3 uppercase tracking-wider">
                      TOP 10 createurs (cycle clos
                      {response.result.summary.cycleClosedAt
                        ? ` le ${new Date(response.result.summary.cycleClosedAt).toLocaleDateString("fr-FR")}`
                        : ""}
                      )
                    </h3>
                    <ol className="space-y-1 text-xs">
                      {response.result.summary.top10Creators.map((c, i) => (
                        <li
                          key={c.creatorId}
                          className="flex items-center justify-between rounded-lg bg-black/30 px-3 py-2 border border-white/5"
                        >
                          <span className="text-white/70">
                            <span className="text-amber-300 font-bold mr-2">#{i + 1}</span>
                            {c.creatorId}
                          </span>
                          <span className="text-white font-semibold">
                            {c.revenueEur.toFixed(2)} EUR
                          </span>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
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

function EconomicStat({
  label,
  value,
  hint,
}: {
  label: string
  value: string | number
  hint?: string
}) {
  return (
    <div className="rounded-lg bg-black/30 border border-white/5 px-3 py-2">
      <p className="text-[10px] uppercase tracking-wider text-white/50">{label}</p>
      <p className="text-base font-bold text-white mt-0.5">{value}</p>
      {hint && <p className="text-[10px] text-white/40 mt-0.5">{hint}</p>}
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
