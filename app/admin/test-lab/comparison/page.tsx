"use client"

import { useState } from "react"
import { useTestLabAccess } from "@/lib/test-lab/use-test-lab-access"
import type { TestScenarioConfig, TestScenarioSummary } from "@/lib/test-lab/types"
import { GitCompare, Loader2, Trophy } from "lucide-react"

interface ComparisonResponse {
  success: boolean
  configA?: TestScenarioConfig
  configB?: TestScenarioConfig
  summaryA?: TestScenarioSummary
  summaryB?: TestScenarioSummary
  delta?: {
    totalRevenue: number
    topCreatorEarnings: number
    avgContributionPerCreator: number
    vixualPlatformShare: number
  }
  winner?: "A" | "B" | "tie"
  recommendation?: string
  error?: string
}

const PRESET_A: Partial<TestScenarioConfig> = {
  name: "Commission 23 % (V1 actuelle)",
  visitors: 1000,
  creators: 50,
  contributors: 250,
  videos: 100,
  podcasts: 40,
  articles: 80,
  successfulPaymentsPercent: 90,
  failedPaymentsPercent: 10,
}

const PRESET_B: Partial<TestScenarioConfig> = {
  name: "Commission 20 % (test V2)",
  visitors: 1000,
  creators: 50,
  contributors: 250,
  videos: 100,
  podcasts: 40,
  articles: 80,
  successfulPaymentsPercent: 92,
  failedPaymentsPercent: 8,
}

export default function TestLabComparisonPage() {
  const { email } = useTestLabAccess()
  const [configA, setConfigA] = useState<Partial<TestScenarioConfig>>(PRESET_A)
  const [configB, setConfigB] = useState<Partial<TestScenarioConfig>>(PRESET_B)
  const [response, setResponse] = useState<ComparisonResponse | null>(null)
  const [loading, setLoading] = useState(false)

  async function runComparison() {
    setLoading(true)
    setResponse(null)
    try {
      const res = await fetch("/api/admin/test-lab/comparison", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-email": email,
        },
        body: JSON.stringify({ configA, configB }),
      })
      const data = (await res.json()) as ComparisonResponse
      setResponse(data)
      if (!data.success) {
        alert(`Erreur comparaison: ${data.error || "Erreur inconnue"}`)
      }
    } catch (err) {
      const errorMsg = (err as Error).message
      setResponse({ success: false, error: errorMsg })
      alert(`Erreur comparaison: ${errorMsg}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="text-white p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <header>
          <p className="text-xs uppercase tracking-wider text-indigo-300">
            Laboratoire de tests
          </p>
          <h1 className="text-3xl font-bold mt-1 flex items-center gap-3">
            <GitCompare className="h-6 w-6 text-indigo-300" />
            Comparaison A/B
          </h1>
          <p className="text-white/60 mt-2 max-w-2xl">
            Compare deux configurations economiques cote a cote
            (ex: 23 % vs 20 % de commission). Aucune donnee reelle modifiee.
          </p>
        </header>

        <section className="grid md:grid-cols-2 gap-4">
          <ConfigPanel
            tone="indigo"
            label="Scenario A"
            config={configA}
            onChange={setConfigA}
          />
          <ConfigPanel
            tone="fuchsia"
            label="Scenario B"
            config={configB}
            onChange={setConfigB}
          />
        </section>

        <div>
          <button
            onClick={runComparison}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-5 py-3 font-semibold disabled:opacity-50 transition"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <GitCompare className="h-4 w-4" />
            )}
            {loading ? "Comparaison en cours..." : "Lancer la comparaison"}
          </button>
        </div>

        {response?.success && response.summaryA && response.summaryB && response.delta && (
          <section className="space-y-4">
            <div
              className={`rounded-2xl border p-5 flex items-center gap-4 ${
                response.winner === "A"
                  ? "border-indigo-500/40 bg-indigo-500/10"
                  : response.winner === "B"
                    ? "border-fuchsia-500/40 bg-fuchsia-500/10"
                    : "border-amber-500/30 bg-amber-500/5"
              }`}
            >
              <Trophy
                className={`h-8 w-8 ${
                  response.winner === "A"
                    ? "text-indigo-300"
                    : response.winner === "B"
                      ? "text-fuchsia-300"
                      : "text-amber-300"
                }`}
              />
              <div className="flex-1">
                <p className="text-xs uppercase tracking-wider text-white/50">
                  Verdict
                </p>
                <p className="text-lg font-semibold mt-1">
                  {response.recommendation}
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <SummaryPanel
                tone="indigo"
                title={response.configA?.name ?? "Scenario A"}
                summary={response.summaryA}
              />
              <SummaryPanel
                tone="fuchsia"
                title={response.configB?.name ?? "Scenario B"}
                summary={response.summaryB}
              />
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <h2 className="font-semibold mb-3">Delta financier (B - A)</h2>
              <div className="grid md:grid-cols-2 gap-3">
                <DeltaStat
                  label="Revenu total"
                  value={response.delta.totalRevenue}
                  unit="€"
                />
                <DeltaStat
                  label="Part plateforme VIXUAL"
                  value={response.delta.vixualPlatformShare}
                  unit="€"
                />
              </div>
            </div>
          </section>
        )}

        {response && !response.success && (
          <p className="text-rose-300 text-sm">
            {response.error ?? "Erreur inconnue"}
          </p>
        )}
      </div>
    </main>
  )
}

function ConfigPanel({
  tone,
  label,
  config,
  onChange,
}: {
  tone: "indigo" | "fuchsia"
  label: string
  config: Partial<TestScenarioConfig>
  onChange: (c: Partial<TestScenarioConfig>) => void
}) {
  const toneClass =
    tone === "indigo"
      ? "border-indigo-500/30 bg-indigo-500/5"
      : "border-fuchsia-500/30 bg-fuchsia-500/5"
  const toneText = tone === "indigo" ? "text-indigo-300" : "text-fuchsia-300"

  function update<K extends keyof TestScenarioConfig>(
    key: K,
    value: TestScenarioConfig[K],
  ) {
    onChange({ ...config, [key]: value })
  }

  return (
    <div className={`rounded-2xl border p-5 ${toneClass}`}>
      <p className={`text-xs uppercase tracking-wider ${toneText}`}>{label}</p>
      <input
        type="text"
        value={config.name ?? ""}
        onChange={(e) => update("name", e.target.value)}
        className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 mt-2 text-white font-semibold"
      />
      <div className="grid grid-cols-2 gap-3 mt-3">
        <Field label="Visiteurs">
          <NumberInput
            value={config.visitors ?? 0}
            onChange={(v) => update("visitors", v)}
          />
        </Field>
        <Field label="Createurs">
          <NumberInput
            value={config.creators ?? 0}
            onChange={(v) => update("creators", v)}
          />
        </Field>
        <Field label="Contributeurs">
          <NumberInput
            value={config.contributors ?? 0}
            onChange={(v) => update("contributors", v)}
          />
        </Field>
        <Field label="% paiements OK">
          <NumberInput
            value={config.successfulPaymentsPercent ?? 0}
            onChange={(v) => update("successfulPaymentsPercent", v)}
            min={0}
            max={100}
          />
        </Field>
      </div>
    </div>
  )
}

function SummaryPanel({
  tone,
  title,
  summary,
}: {
  tone: "indigo" | "fuchsia"
  title: string
  summary: TestScenarioSummary
}) {
  const toneClass =
    tone === "indigo"
      ? "border-indigo-500/30 bg-indigo-500/5"
      : "border-fuchsia-500/30 bg-fuchsia-500/5"
  return (
    <div className={`rounded-2xl border p-5 ${toneClass}`}>
      <h3 className="font-semibold mb-3">{title}</h3>
      <div className="grid grid-cols-2 gap-3">
        <Stat label="Profils" value={summary.usersCount} />
        <Stat label="Contenus" value={summary.projectsCount} />
        <Stat label="Transactions" value={summary.transactionsCount} />
        <Stat
          label="Paiements OK"
          value={summary.successfulPayments}
          tone="emerald"
        />
        <Stat
          label="Paiements KO"
          value={summary.failedPayments}
          tone="rose"
        />
      </div>
    </div>
  )
}

function DeltaStat({
  label,
  value,
  unit,
}: {
  label: string
  value: number
  unit: string
}) {
  const positive = value > 0
  const tone = positive ? "text-emerald-300" : value < 0 ? "text-rose-300" : "text-white/70"
  return (
    <div className="rounded-xl bg-black/30 border border-white/10 p-4">
      <p className="text-xs uppercase tracking-wider text-white/50">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${tone}`}>
        {positive ? "+" : ""}
        {value.toFixed(2)} {unit}
      </p>
    </div>
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
      className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
    />
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
    <div className="rounded-xl bg-black/30 border border-white/10 p-3">
      <p className="text-xs uppercase tracking-wider text-white/50">{label}</p>
      <p className={`text-xl font-bold mt-1 ${toneClass}`}>{value}</p>
    </div>
  )
}
