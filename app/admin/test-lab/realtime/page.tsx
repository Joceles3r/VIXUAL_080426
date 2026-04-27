"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { ArrowLeft, Play, StepForward, Square, Users, Eye, CreditCard, Video, TrendingUp, XCircle, CheckCircle, Loader2 } from "lucide-react"
import { useTestLabAccess } from "@/lib/test-lab/use-test-lab-access"

type TickResult = {
  tick: number
  activeUsers: number
  pageViews: number
  contributionsCount: number
  contributionAmountTotal: number
  successfulPayments: number
  failedPayments: number
  bunnyProcessing: number
  bunnyReady: number
  bunnyError: number
}

type RealtimeConfig = {
  name: string
  users: number
  creators: number
  projects: number
  durationMinutes: number
  intensity: "low" | "medium" | "high"
  contributionsPerMinute: number
  paymentFailurePercent: number
  bunnyErrorPercent: number
}

export default function TestLabRealtimePage() {
  const { email, canAccess } = useTestLabAccess()
  const [runId, setRunId] = useState<string | null>(null)
  const [config, setConfig] = useState<RealtimeConfig | null>(null)
  const [tick, setTick] = useState(0)
  const [running, setRunning] = useState(false)
  const [autoMode, setAutoMode] = useState(false)
  const [lastResult, setLastResult] = useState<TickResult | null>(null)
  const [history, setHistory] = useState<TickResult[]>([])
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Config editable
  const [formConfig, setFormConfig] = useState<RealtimeConfig>({
    name: "Simulation 1 000 utilisateurs",
    users: 1000,
    creators: 50,
    projects: 100,
    durationMinutes: 30,
    intensity: "medium",
    contributionsPerMinute: 40,
    paymentFailurePercent: 8,
    bunnyErrorPercent: 3,
  })

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  async function startSimulation() {
    const res = await fetch("/api/admin/test-lab/realtime/start", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin-email": email,
      },
      body: JSON.stringify(formConfig),
    })

    const data = await res.json()

    if (!data.success) {
      alert(data.error || "Erreur lancement simulation")
      return
    }

    setRunId(data.runId)
    setConfig(data.config)
    setRunning(true)
    setTick(0)
    setHistory([])
    setLastResult(null)
  }

  async function nextTick() {
    if (!runId || !config) return

    const next = tick + 1

    const res = await fetch("/api/admin/test-lab/realtime/tick", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin-email": email,
      },
      body: JSON.stringify({ runId, tick: next, config }),
    })

    const data = await res.json()

    if (!data.success) {
      alert(data.error || "Erreur tick simulation")
      return
    }

    setTick(next)
    setLastResult(data.result)
    setHistory((prev) => [...prev, data.result])
  }

  function toggleAutoMode() {
    if (autoMode) {
      if (intervalRef.current) clearInterval(intervalRef.current)
      setAutoMode(false)
    } else {
      setAutoMode(true)
      intervalRef.current = setInterval(() => {
        nextTick()
      }, 2000) // 1 tick toutes les 2 secondes
    }
  }

  async function stopSimulation() {
    if (!runId) return

    if (intervalRef.current) clearInterval(intervalRef.current)
    setAutoMode(false)

    await fetch("/api/admin/test-lab/realtime/stop", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin-email": email,
      },
      body: JSON.stringify({ runId }),
    })

    setRunning(false)
  }

  if (!canAccess) {
    return (
      <main className="min-h-screen bg-slate-950 text-white p-6 flex items-center justify-center">
        <p className="text-red-400">Acces reserve au PATRON uniquement.</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <Link href="/admin/test-lab" className="inline-flex items-center gap-2 text-sm text-violet-300 hover:text-violet-200">
          <ArrowLeft className="h-4 w-4" /> Retour au laboratoire
        </Link>

        <header>
          <p className="text-sm text-fuchsia-300">Simulation temps reel</p>
          <h1 className="text-3xl font-bold">1 000 utilisateurs</h1>
          <p className="text-white/60 mt-2 max-w-2xl">
            Teste VIXUAL comme si la plateforme etait active avec trafic, contributions automatiques, paiements et etats Bunny.
          </p>
        </header>

        {/* Configuration */}
        {!running && (
          <section className="rounded-2xl border border-white/10 bg-white/5 p-5 space-y-4">
            <h2 className="font-semibold text-lg">Configuration</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm text-white/60">Utilisateurs</label>
                <input
                  type="number"
                  value={formConfig.users}
                  onChange={(e) => setFormConfig({ ...formConfig, users: Number(e.target.value) })}
                  className="w-full mt-1 rounded-lg bg-black/30 border border-white/10 px-3 py-2"
                />
              </div>
              <div>
                <label className="text-sm text-white/60">Createurs</label>
                <input
                  type="number"
                  value={formConfig.creators}
                  onChange={(e) => setFormConfig({ ...formConfig, creators: Number(e.target.value) })}
                  className="w-full mt-1 rounded-lg bg-black/30 border border-white/10 px-3 py-2"
                />
              </div>
              <div>
                <label className="text-sm text-white/60">Projets</label>
                <input
                  type="number"
                  value={formConfig.projects}
                  onChange={(e) => setFormConfig({ ...formConfig, projects: Number(e.target.value) })}
                  className="w-full mt-1 rounded-lg bg-black/30 border border-white/10 px-3 py-2"
                />
              </div>
              <div>
                <label className="text-sm text-white/60">Contributions/min</label>
                <input
                  type="number"
                  value={formConfig.contributionsPerMinute}
                  onChange={(e) => setFormConfig({ ...formConfig, contributionsPerMinute: Number(e.target.value) })}
                  className="w-full mt-1 rounded-lg bg-black/30 border border-white/10 px-3 py-2"
                />
              </div>
              <div>
                <label className="text-sm text-white/60">% echecs paiement</label>
                <input
                  type="number"
                  value={formConfig.paymentFailurePercent}
                  onChange={(e) => setFormConfig({ ...formConfig, paymentFailurePercent: Number(e.target.value) })}
                  className="w-full mt-1 rounded-lg bg-black/30 border border-white/10 px-3 py-2"
                />
              </div>
              <div>
                <label className="text-sm text-white/60">% erreurs Bunny</label>
                <input
                  type="number"
                  value={formConfig.bunnyErrorPercent}
                  onChange={(e) => setFormConfig({ ...formConfig, bunnyErrorPercent: Number(e.target.value) })}
                  className="w-full mt-1 rounded-lg bg-black/30 border border-white/10 px-3 py-2"
                />
              </div>
            </div>
            <div>
              <label className="text-sm text-white/60">Intensite</label>
              <select
                value={formConfig.intensity}
                onChange={(e) => setFormConfig({ ...formConfig, intensity: e.target.value as "low" | "medium" | "high" })}
                className="w-full mt-1 rounded-lg bg-black/30 border border-white/10 px-3 py-2"
              >
                <option value="low">Faible</option>
                <option value="medium">Moyenne</option>
                <option value="high">Elevee</option>
              </select>
            </div>
          </section>
        )}

        {/* Boutons de controle */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={startSimulation}
            disabled={running}
            className="rounded-xl bg-violet-600 hover:bg-violet-500 px-5 py-3 font-semibold disabled:opacity-50 flex items-center gap-2"
          >
            <Play className="h-4 w-4" /> Lancer simulation
          </button>

          <button
            onClick={nextTick}
            disabled={!running || autoMode}
            className="rounded-xl bg-emerald-600 hover:bg-emerald-500 px-5 py-3 font-semibold disabled:opacity-50 flex items-center gap-2"
          >
            <StepForward className="h-4 w-4" /> +1 minute
          </button>

          <button
            onClick={toggleAutoMode}
            disabled={!running}
            className={`rounded-xl px-5 py-3 font-semibold disabled:opacity-50 flex items-center gap-2 ${
              autoMode ? "bg-amber-600 hover:bg-amber-500" : "bg-sky-600 hover:bg-sky-500"
            }`}
          >
            {autoMode ? <Loader2 className="h-4 w-4 animate-spin" /> : <TrendingUp className="h-4 w-4" />}
            {autoMode ? "Mode auto ON" : "Mode auto"}
          </button>

          <button
            onClick={stopSimulation}
            disabled={!running}
            className="rounded-xl bg-red-600 hover:bg-red-500 px-5 py-3 font-semibold disabled:opacity-50 flex items-center gap-2"
          >
            <Square className="h-4 w-4" /> Arreter
          </button>
        </div>

        {/* Statut */}
        {running && (
          <div className="rounded-xl border border-violet-500/30 bg-violet-500/10 px-4 py-3 text-sm">
            Simulation en cours — Tick {tick} / {config?.durationMinutes ?? 30} min
          </div>
        )}

        {/* Metriques temps reel */}
        {lastResult && (
          <section className="grid md:grid-cols-3 lg:grid-cols-5 gap-4">
            <MetricCard icon={Users} label="Utilisateurs actifs" value={lastResult.activeUsers} color="violet" />
            <MetricCard icon={Eye} label="Pages vues" value={lastResult.pageViews} color="sky" />
            <MetricCard icon={CreditCard} label="Contributions" value={lastResult.contributionsCount} color="emerald" />
            <MetricCard icon={CheckCircle} label="Paiements OK" value={lastResult.successfulPayments} color="green" />
            <MetricCard icon={XCircle} label="Paiements KO" value={lastResult.failedPayments} color="red" />
            <MetricCard icon={Video} label="Bunny processing" value={lastResult.bunnyProcessing} color="amber" />
            <MetricCard icon={Video} label="Bunny ready" value={lastResult.bunnyReady} color="emerald" />
            <MetricCard icon={Video} label="Bunny error" value={lastResult.bunnyError} color="red" />
            <MetricCard icon={TrendingUp} label="Montant simule" value={`${lastResult.contributionAmountTotal} EUR`} color="fuchsia" />
          </section>
        )}

        {/* Historique compact */}
        {history.length > 0 && (
          <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <h3 className="font-semibold mb-3">Historique ({history.length} ticks)</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-white/50 text-left">
                    <th className="py-2 px-2">Tick</th>
                    <th className="py-2 px-2">Actifs</th>
                    <th className="py-2 px-2">Vues</th>
                    <th className="py-2 px-2">Contrib.</th>
                    <th className="py-2 px-2">OK</th>
                    <th className="py-2 px-2">KO</th>
                    <th className="py-2 px-2">Montant</th>
                  </tr>
                </thead>
                <tbody>
                  {history.slice(-10).map((r) => (
                    <tr key={r.tick} className="border-t border-white/5">
                      <td className="py-2 px-2">{r.tick}</td>
                      <td className="py-2 px-2">{r.activeUsers}</td>
                      <td className="py-2 px-2">{r.pageViews}</td>
                      <td className="py-2 px-2">{r.contributionsCount}</td>
                      <td className="py-2 px-2 text-emerald-400">{r.successfulPayments}</td>
                      <td className="py-2 px-2 text-red-400">{r.failedPayments}</td>
                      <td className="py-2 px-2">{r.contributionAmountTotal} EUR</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>
    </main>
  )
}

function MetricCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string | number
  color: string
}) {
  const colorClasses: Record<string, string> = {
    violet: "border-violet-500/30 bg-violet-500/10",
    sky: "border-sky-500/30 bg-sky-500/10",
    emerald: "border-emerald-500/30 bg-emerald-500/10",
    green: "border-green-500/30 bg-green-500/10",
    red: "border-red-500/30 bg-red-500/10",
    amber: "border-amber-500/30 bg-amber-500/10",
    fuchsia: "border-fuchsia-500/30 bg-fuchsia-500/10",
  }

  return (
    <div className={`rounded-2xl border p-4 ${colorClasses[color] || colorClasses.violet}`}>
      <div className="flex items-center gap-2 text-white/50 text-sm mb-2">
        <Icon className="h-4 w-4" />
        {label}
      </div>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  )
}
