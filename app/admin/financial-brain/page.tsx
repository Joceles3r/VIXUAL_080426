"use client"

import { useState } from "react"
import {
  Brain, Shield, AlertTriangle, CheckCircle, XCircle, Clock,
  TrendingUp, Users, FileText, Eye, Lock, Zap, Activity,
  RefreshCw, Download, Filter, Search, ChevronRight, Info,
  BarChart3, Target, AlertOctagon, UserX, Coins, Calendar,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  getMockCycleAnalysis,
  getMockFraudAlerts,
  getMockAuditLogs,
  type CycleAnalysis,
  type FraudAlert,
  type AuditLog,
} from "@/lib/financial-brain"

/* ══════════════════════════════════════════════════════════════════════════ */
/*                          FINANCIAL BRAIN DASHBOARD                         */
/* ══════════════════════════════════════════════════════════════════════════ */

export default function FinancialBrainPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "cycles" | "alerts" | "audit">("overview")
  const [selectedCycle, setSelectedCycle] = useState<CycleAnalysis | null>(null)
  
  const cycles = getMockCycleAnalysis()
  const alerts = getMockFraudAlerts()
  const auditLogs = getMockAuditLogs()
  
  // Statistiques globales
  const pendingValidations = cycles.filter(c => c.status === "pending_validation").length
  const activeAlerts = alerts.filter(a => a.severity === "critical" || a.severity === "high").length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-600/20 border border-violet-500/30">
              <Brain className="h-6 w-6 text-violet-400" />
            </div>
            Financial Brain
          </h1>
          <p className="text-white/50 text-sm mt-1">
            Systeme IA de surveillance financiere avec validation humaine obligatoire
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="border-white/20 text-white/70">
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
          <Button variant="outline" size="sm" className="border-white/20 text-white/70">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Alerte Gouvernance */}
      <Card className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-500/30">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-amber-400 mt-0.5" />
            <div className="flex-1">
              <p className="text-amber-300 font-medium text-sm">Gouvernance Humaine Active</p>
              <p className="text-white/60 text-xs mt-1">
                Toute decision financiere finale (cloture, repartition, exclusion) necessite une validation humaine.
                L'IA analyse et suggere, l'humain decide et valide.
              </p>
            </div>
            <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
              <Lock className="h-3 w-3 mr-1" />
              Conforme
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* KPIs rapides */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Clock}
          label="Cycles en attente"
          value={pendingValidations}
          color="amber"
          subtitle="Validation requise"
        />
        <StatCard
          icon={AlertTriangle}
          label="Alertes actives"
          value={activeAlerts}
          color="rose"
          subtitle="Critiques + Hautes"
        />
        <StatCard
          icon={CheckCircle}
          label="Validations ce mois"
          value={12}
          color="emerald"
          subtitle="Decisions humaines"
        />
        <StatCard
          icon={Brain}
          label="Score IA moyen"
          value="87%"
          color="violet"
          subtitle="Confiance analyses"
        />
      </div>

      {/* Tabs principaux */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList className="bg-slate-800/50 border border-white/10">
          <TabsTrigger value="overview" className="data-[state=active]:bg-violet-500/20">
            <Activity className="h-4 w-4 mr-2" />
            Vue d'ensemble
          </TabsTrigger>
          <TabsTrigger value="cycles" className="data-[state=active]:bg-violet-500/20">
            <Calendar className="h-4 w-4 mr-2" />
            Cycles
          </TabsTrigger>
          <TabsTrigger value="alerts" className="data-[state=active]:bg-violet-500/20">
            <AlertOctagon className="h-4 w-4 mr-2" />
            Alertes Fraude
          </TabsTrigger>
          <TabsTrigger value="audit" className="data-[state=active]:bg-violet-500/20">
            <FileText className="h-4 w-4 mr-2" />
            Journal Audit
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4 mt-4">
          <div className="grid lg:grid-cols-2 gap-4">
            {/* Cycles recents */}
            <Card className="bg-slate-900/50 border-white/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-white text-base flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-violet-400" />
                  Cycles recents
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {cycles.slice(0, 3).map((cycle) => (
                  <CycleRow key={cycle.id} cycle={cycle} />
                ))}
              </CardContent>
            </Card>

            {/* Alertes recentes */}
            <Card className="bg-slate-900/50 border-white/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-white text-base flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-rose-400" />
                  Alertes recentes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {alerts.slice(0, 3).map((alert, idx) => (
                  <AlertRow key={idx} alert={alert} />
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Principe de gouvernance */}
          <Card className="bg-slate-900/50 border-white/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-base flex items-center gap-2">
                <Shield className="h-4 w-4 text-amber-400" />
                Principe de Gouvernance Humaine
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="bg-violet-500/10 rounded-xl p-4 border border-violet-500/20">
                  <Brain className="h-8 w-8 text-violet-400 mb-2" />
                  <p className="text-white font-medium text-sm">1. L'IA analyse</p>
                  <p className="text-white/50 text-xs mt-1">
                    Detection automatique des anomalies, scoring, suggestions
                  </p>
                </div>
                <div className="bg-amber-500/10 rounded-xl p-4 border border-amber-500/20">
                  <Eye className="h-8 w-8 text-amber-400 mb-2" />
                  <p className="text-white font-medium text-sm">2. L'humain verifie</p>
                  <p className="text-white/50 text-xs mt-1">
                    Revue des alertes, analyse contextuelle, investigation
                  </p>
                </div>
                <div className="bg-emerald-500/10 rounded-xl p-4 border border-emerald-500/20">
                  <CheckCircle className="h-8 w-8 text-emerald-400 mb-2" />
                  <p className="text-white font-medium text-sm">3. L'humain decide</p>
                  <p className="text-white/50 text-xs mt-1">
                    Validation finale, exclusion, cloture cycle
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Cycles Tab */}
        <TabsContent value="cycles" className="space-y-4 mt-4">
          <Card className="bg-slate-900/50 border-white/10">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-white text-base">Gestion des Cycles de Cloture</CardTitle>
                <Badge className="bg-violet-500/20 text-violet-400">
                  {cycles.length} cycles
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {cycles.map((cycle) => (
                <CycleDetailRow 
                  key={cycle.id} 
                  cycle={cycle}
                  onValidate={() => console.log("Validate", cycle.id)}
                  onReject={() => console.log("Reject", cycle.id)}
                />
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Alerts Tab */}
        <TabsContent value="alerts" className="space-y-4 mt-4">
          <Card className="bg-slate-900/50 border-white/10">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-white text-base">Alertes de Fraude Detectees</CardTitle>
                <Badge className="bg-rose-500/20 text-rose-400">
                  {alerts.length} alertes
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {alerts.map((alert, idx) => (
                <AlertDetailRow key={idx} alert={alert} />
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Audit Tab */}
        <TabsContent value="audit" className="space-y-4 mt-4">
          <Card className="bg-slate-900/50 border-white/10">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-white text-base">Journal d'Audit des Decisions</CardTitle>
                <Badge className="bg-slate-500/20 text-white/60">
                  {auditLogs.length} entrees
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-white/50 text-xs">
                      <th className="text-left py-2 px-2">Date</th>
                      <th className="text-left py-2 px-2">Cycle</th>
                      <th className="text-left py-2 px-2">Anomalie</th>
                      <th className="text-center py-2 px-2">Score IA</th>
                      <th className="text-left py-2 px-2">Decision</th>
                      <th className="text-left py-2 px-2">Decide par</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {auditLogs.map((log) => (
                      <tr key={log.id} className="text-white/70">
                        <td className="py-2 px-2 text-xs">{new Date(log.timestamp).toLocaleDateString("fr-FR")}</td>
                        <td className="py-2 px-2">{log.cycle}</td>
                        <td className="py-2 px-2 text-rose-400 text-xs">{log.anomaly}</td>
                        <td className="py-2 px-2 text-center">
                          <Badge className={`${log.aiScore > 50 ? "bg-rose-500/20 text-rose-400" : "bg-emerald-500/20 text-emerald-400"}`}>
                            {log.aiScore}%
                          </Badge>
                        </td>
                        <td className="py-2 px-2 text-emerald-400 text-xs">{log.humanDecision}</td>
                        <td className="py-2 px-2 text-xs">
                          <span className="text-white/50">{log.decidedBy}</span>
                          <Badge className="ml-2 bg-amber-500/20 text-amber-400 text-xs">{log.role}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

/* ── Composants utilitaires ── */

function StatCard({ icon: Icon, label, value, color, subtitle }: {
  icon: React.ElementType
  label: string
  value: number | string
  color: "amber" | "rose" | "emerald" | "violet"
  subtitle: string
}) {
  const colors = {
    amber: "from-amber-500/20 to-orange-500/10 border-amber-500/30 text-amber-400",
    rose: "from-rose-500/20 to-red-500/10 border-rose-500/30 text-rose-400",
    emerald: "from-emerald-500/20 to-green-500/10 border-emerald-500/30 text-emerald-400",
    violet: "from-violet-500/20 to-purple-500/10 border-violet-500/30 text-violet-400",
  }

  return (
    <Card className={`bg-gradient-to-br ${colors[color]} border`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <Icon className={`h-5 w-5 ${colors[color].split(" ").pop()}`} />
          <span className="text-2xl font-bold text-white">{value}</span>
        </div>
        <p className="text-white/70 text-sm mt-2">{label}</p>
        <p className="text-white/40 text-xs">{subtitle}</p>
      </CardContent>
    </Card>
  )
}

function CycleRow({ cycle }: { cycle: CycleAnalysis }) {
  const statusConfig = {
    pending_validation: { label: "En attente", color: "bg-amber-500/20 text-amber-400" },
    validated: { label: "Valide", color: "bg-emerald-500/20 text-emerald-400" },
    rejected: { label: "Rejete", color: "bg-rose-500/20 text-rose-400" },
  }
  const status = statusConfig[cycle.status]

  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 border border-white/5">
      <div>
        <p className="text-white font-medium text-sm">{cycle.cycleName}</p>
        <p className="text-white/50 text-xs">{cycle.projectsCount} projets - {cycle.totalRevenue.toLocaleString()} EUR</p>
      </div>
      <Badge className={status.color}>{status.label}</Badge>
    </div>
  )
}

function CycleDetailRow({ cycle, onValidate, onReject }: { 
  cycle: CycleAnalysis
  onValidate: () => void
  onReject: () => void
}) {
  const isPending = cycle.status === "pending_validation"

  return (
    <div className="p-4 rounded-xl bg-slate-800/50 border border-white/10">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-white font-semibold">{cycle.cycleName}</p>
          <p className="text-white/50 text-sm">{cycle.projectsCount} projets analyses</p>
        </div>
        <Badge className={cycle.status === "pending_validation" ? "bg-amber-500/20 text-amber-400" : "bg-emerald-500/20 text-emerald-400"}>
          {cycle.status === "pending_validation" ? "Validation requise" : "Valide"}
        </Badge>
      </div>
      
      <div className="grid grid-cols-3 gap-3 mb-3">
        <div className="text-center p-2 rounded-lg bg-slate-700/30">
          <p className="text-white font-bold">{cycle.totalRevenue.toLocaleString()} EUR</p>
          <p className="text-white/40 text-xs">Revenus totaux</p>
        </div>
        <div className="text-center p-2 rounded-lg bg-slate-700/30">
          <p className="text-white font-bold">{cycle.contributorsCount}</p>
          <p className="text-white/40 text-xs">Contributeurs</p>
        </div>
        <div className="text-center p-2 rounded-lg bg-slate-700/30">
          <p className="text-violet-400 font-bold">{cycle.aiConfidence}%</p>
          <p className="text-white/40 text-xs">Confiance IA</p>
        </div>
      </div>

      {cycle.flaggedItems > 0 && (
        <div className="bg-rose-500/10 rounded-lg p-2 mb-3 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-rose-400" />
          <span className="text-rose-300 text-sm">{cycle.flaggedItems} elements signales par l'IA</span>
        </div>
      )}

      {isPending && (
        <div className="flex gap-2 mt-3">
          <Button size="sm" className="flex-1 bg-emerald-600 hover:bg-emerald-700" onClick={onValidate}>
            <CheckCircle className="h-4 w-4 mr-2" />
            Valider la cloture
          </Button>
          <Button size="sm" variant="outline" className="border-rose-500/30 text-rose-400 hover:bg-rose-500/10" onClick={onReject}>
            <XCircle className="h-4 w-4 mr-2" />
            Rejeter
          </Button>
        </div>
      )}
    </div>
  )
}

function AlertRow({ alert }: { alert: FraudAlert }) {
  const severityConfig = {
    critical: { color: "text-rose-400", bg: "bg-rose-500/20" },
    high: { color: "text-orange-400", bg: "bg-orange-500/20" },
    medium: { color: "text-amber-400", bg: "bg-amber-500/20" },
    low: { color: "text-sky-400", bg: "bg-sky-500/20" },
  }
  const config = severityConfig[alert.severity]

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50 border border-white/5">
      <div className={`p-2 rounded-lg ${config.bg}`}>
        <AlertTriangle className={`h-4 w-4 ${config.color}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm truncate">{alert.description}</p>
        <p className="text-white/40 text-xs">{alert.affectedAccounts.length} comptes concernes</p>
      </div>
      <Badge className={`${config.bg} ${config.color}`}>{alert.severity}</Badge>
    </div>
  )
}

function AlertDetailRow({ alert }: { alert: FraudAlert }) {
  const severityConfig = {
    critical: { color: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/30" },
    high: { color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/30" },
    medium: { color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/30" },
    low: { color: "text-sky-400", bg: "bg-sky-500/10", border: "border-sky-500/30" },
  }
  const config = severityConfig[alert.severity]

  return (
    <div className={`p-4 rounded-xl ${config.bg} border ${config.border}`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <AlertTriangle className={`h-5 w-5 ${config.color}`} />
          <span className={`font-semibold ${config.color}`}>{alert.type.replace(/_/g, " ").toUpperCase()}</span>
        </div>
        <Badge className={`${config.bg} ${config.color}`}>{alert.severity}</Badge>
      </div>
      <p className="text-white/70 text-sm mb-3">{alert.description}</p>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <UserX className="h-4 w-4 text-white/40" />
          <span className="text-white/50 text-xs">{alert.affectedAccounts.join(", ")}</span>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="h-7 text-xs border-white/20">
            <Eye className="h-3 w-3 mr-1" />
            Examiner
          </Button>
          <Button size="sm" className="h-7 text-xs bg-rose-600 hover:bg-rose-700">
            <XCircle className="h-3 w-3 mr-1" />
            Exclure
          </Button>
        </div>
      </div>
    </div>
  )
}
