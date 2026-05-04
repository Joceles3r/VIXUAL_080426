"use client"

import { useState } from "react"
import useSWR from "swr"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Bot,
  Brain,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  Shield,
  MessageSquare,
  Users,
  BarChart3,
  Settings,
  RefreshCw,
  ArrowUp,
  ArrowDown,
  Inbox,
} from "lucide-react"
import { EMPLOYEE_FUNCTIONS } from "@/lib/admin/employees"
import { MESSAGE_CATEGORIES } from "@/lib/support/ai-support-engine"

// ==================== DATA FETCHING ====================

const fetcher = (url: string) => fetch(url).then(res => res.json())

// ==================== TYPES ====================

interface SupportStats {
  messagesProcessed: number
  autoReplied: number
  escalated: number
  avgConfidence: number
  avgResponseTime: number
  todayProcessed: number
  todayAutoReplied: number
  accuracyRate: number
}

interface CategoryStat {
  category: string
  count: number
  autoReplied: number
  avgConfidence: number
}

interface TeamWorkload {
  team: string
  tickets: number
  urgent: number
  employees: number
}

interface Alert {
  id: number
  type: string
  message: string
  time: string
  severity: "critical" | "warning" | "info"
}

// ==================== COMPONENTS ====================

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
  trend,
}: {
  title: string
  value: string | number
  subtitle?: string
  icon: React.ElementType
  color: string
  trend?: { value: number; positive: boolean }
}) {
  const colorMap: Record<string, string> = {
    emerald: "bg-emerald-500/20 text-emerald-400",
    sky: "bg-sky-500/20 text-sky-400",
    amber: "bg-amber-500/20 text-amber-400",
    violet: "bg-violet-500/20 text-violet-400",
    rose: "bg-rose-500/20 text-rose-400",
  }

  return (
    <Card className="bg-slate-900/50 border-white/10">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className={`w-10 h-10 rounded-lg ${colorMap[color]} flex items-center justify-center`}>
            <Icon className="h-5 w-5" />
          </div>
          {trend && (
            <div className={`flex items-center gap-1 text-xs ${trend.positive ? "text-emerald-400" : "text-rose-400"}`}>
              {trend.positive ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
              {trend.value}%
            </div>
          )}
        </div>
        <div className="mt-3">
          <p className="text-2xl font-bold text-white">{value}</p>
          <p className="text-white/50 text-sm">{title}</p>
          {subtitle && <p className="text-white/30 text-xs mt-1">{subtitle}</p>}
        </div>
      </CardContent>
    </Card>
  )
}

function CategoryPerformanceCard({ stats }: { stats: CategoryStat[] }) {
  if (stats.length === 0) {
    return (
      <Card className="bg-slate-900/50 border-white/10">
        <CardHeader className="pb-3">
          <CardTitle className="text-white text-lg flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-violet-400" />
            Performance par categorie
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <BarChart3 className="h-10 w-10 text-white/20 mx-auto mb-3" />
            <p className="text-white/50 text-sm">Aucune donnee disponible</p>
            <p className="text-white/30 text-xs mt-1">Les statistiques apparaitront apres le premier ticket</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-slate-900/50 border-white/10">
      <CardHeader className="pb-3">
        <CardTitle className="text-white text-lg flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-violet-400" />
          Performance par categorie
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {stats.map((stat) => {
            const categoryConfig = MESSAGE_CATEGORIES[stat.category as keyof typeof MESSAGE_CATEGORIES]
            const autoRate = stat.count > 0 ? (stat.autoReplied / stat.count) * 100 : 0
            return (
              <div key={stat.category} className="flex items-center gap-3">
                <div className="w-32 text-sm text-white/70 truncate">
                  {categoryConfig?.label || stat.category}
                </div>
                <div className="flex-1">
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-violet-500 to-sky-500 rounded-full"
                      style={{ width: `${autoRate}%` }}
                    />
                  </div>
                </div>
                <div className="w-16 text-right text-sm">
                  <span className="text-white font-medium">{stat.count}</span>
                  <span className="text-white/40"> / {Math.round(autoRate)}%</span>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

function TeamWorkloadCard({ workload }: { workload: TeamWorkload[] }) {
  if (workload.length === 0) {
    return (
      <Card className="bg-slate-900/50 border-white/10">
        <CardHeader className="pb-3">
          <CardTitle className="text-white text-lg flex items-center gap-2">
            <Users className="h-5 w-5 text-sky-400" />
            Charge par equipe
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Users className="h-10 w-10 text-white/20 mx-auto mb-3" />
            <p className="text-white/50 text-sm">Aucune equipe assignee</p>
            <p className="text-white/30 text-xs mt-1">La charge de travail sera affichee ici</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-slate-900/50 border-white/10">
      <CardHeader className="pb-3">
        <CardTitle className="text-white text-lg flex items-center gap-2">
          <Users className="h-5 w-5 text-sky-400" />
          Charge par equipe
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {workload.map((team) => {
            const functionConfig = EMPLOYEE_FUNCTIONS[team.team as keyof typeof EMPLOYEE_FUNCTIONS]
            const isSaturated = team.tickets > 25
            return (
              <div key={team.team} className="p-3 bg-white/5 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-medium text-sm">
                    {functionConfig?.label || team.team}
                  </span>
                  {isSaturated && (
                    <Badge className="bg-amber-500/20 text-amber-400 text-xs">Sature</Badge>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-white font-semibold">{team.tickets}</p>
                    <p className="text-white/40 text-xs">Tickets</p>
                  </div>
                  <div>
                    <p className={`font-semibold ${team.urgent > 0 ? "text-rose-400" : "text-white/50"}`}>
                      {team.urgent}
                    </p>
                    <p className="text-white/40 text-xs">Urgents</p>
                  </div>
                  <div>
                    <p className="text-sky-400 font-semibold">{team.employees}</p>
                    <p className="text-white/40 text-xs">Agents</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

function AlertsCard({ alerts }: { alerts: Alert[] }) {
  const severityColors: Record<string, string> = {
    critical: "border-l-rose-500 bg-rose-500/10",
    warning: "border-l-amber-500 bg-amber-500/10",
    info: "border-l-sky-500 bg-sky-500/10",
  }

  const severityIcons: Record<string, React.ElementType> = {
    critical: AlertTriangle,
    warning: Clock,
    info: Activity,
  }

  if (alerts.length === 0) {
    return (
      <Card className="bg-slate-900/50 border-white/10">
        <CardHeader className="pb-3">
          <CardTitle className="text-white text-lg flex items-center gap-2">
            <Shield className="h-5 w-5 text-amber-400" />
            Alertes systeme
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <CheckCircle className="h-10 w-10 text-emerald-400/50 mx-auto mb-3" />
            <p className="text-emerald-400 text-sm font-medium">Aucune alerte</p>
            <p className="text-white/30 text-xs mt-1">Tout fonctionne normalement</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-slate-900/50 border-white/10">
      <CardHeader className="pb-3">
        <CardTitle className="text-white text-lg flex items-center gap-2">
          <Shield className="h-5 w-5 text-amber-400" />
          Alertes systeme
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {alerts.map((alert) => {
            const Icon = severityIcons[alert.severity]
            return (
              <div key={alert.id} className={`p-3 rounded-lg border-l-4 ${severityColors[alert.severity]}`}>
                <div className="flex items-start gap-3">
                  <Icon className={`h-4 w-4 mt-0.5 ${
                    alert.severity === "critical" ? "text-rose-400" :
                    alert.severity === "warning" ? "text-amber-400" : "text-sky-400"
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm">{alert.message}</p>
                    <p className="text-white/40 text-xs mt-1">{alert.time}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

// ==================== EMPTY STATE ====================

function EmptyDashboard() {
  return (
    <Card className="bg-slate-900/50 border-white/10">
      <CardContent className="p-12 text-center">
        <Inbox className="h-16 w-16 text-white/20 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">Support IA en attente</h3>
        <p className="text-white/60 max-w-md mx-auto mb-6">
          Le moteur IA de support est pret. Les statistiques et analyses apparaitront
          une fois que des tickets auront ete traites.
        </p>
        <div className="flex items-center justify-center gap-2">
          <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
            <Zap className="h-3 w-3 mr-1" />
            Moteur IA actif
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}

// ==================== MAIN PAGE ====================

export default function AdminSupportPage() {
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Fetch real stats from API
  const { data, error, isLoading, mutate } = useSWR<{
    stats: SupportStats
    categories: CategoryStat[]
    workload: TeamWorkload[]
    alerts: Alert[]
  }>(
    "/api/admin/support-stats",
    fetcher,
    { refreshInterval: 60000 } // Refresh every minute
  )

  // Default empty values
  const stats: SupportStats = data?.stats || {
    messagesProcessed: 0,
    autoReplied: 0,
    escalated: 0,
    avgConfidence: 0,
    avgResponseTime: 0,
    todayProcessed: 0,
    todayAutoReplied: 0,
    accuracyRate: 0,
  }
  const categories = data?.categories || []
  const workload = data?.workload || []
  const alerts = data?.alerts || []

  const handleRefresh = () => {
    setIsRefreshing(true)
    mutate().finally(() => setIsRefreshing(false))
  }

  const hasData = stats.messagesProcessed > 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Bot className="h-7 w-7 text-emerald-400" />
            Support IA VIXUAL
          </h1>
          <p className="text-white/60 mt-1">Supervision du triage et routage intelligent</p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={handleRefresh}
            variant="outline"
            className="border-white/20 text-white"
            disabled={isRefreshing || isLoading}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing || isLoading ? "animate-spin" : ""}`} />
            Actualiser
          </Button>
          <Button variant="outline" className="border-white/20 text-white">
            <Settings className="mr-2 h-4 w-4" />
            Configuration
          </Button>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <Card className="bg-rose-500/10 border-rose-500/20">
          <CardContent className="p-6 flex items-center gap-4">
            <AlertTriangle className="h-8 w-8 text-rose-400" />
            <div>
              <p className="text-rose-400 font-medium">Erreur de chargement</p>
              <p className="text-white/60 text-sm">Impossible de recuperer les statistiques support</p>
            </div>
            <Button onClick={handleRefresh} variant="outline" className="ml-auto">
              Reessayer
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Loading state */}
      {isLoading && (
        <Card className="bg-slate-900/50 border-white/10">
          <CardContent className="p-8 text-center">
            <RefreshCw className="h-8 w-8 text-amber-400 mx-auto mb-4 animate-spin" />
            <p className="text-white/60">Chargement des statistiques...</p>
          </CardContent>
        </Card>
      )}

      {/* Main content */}
      {!isLoading && !error && (
        <>
          {!hasData ? (
            <EmptyDashboard />
          ) : (
            <>
              {/* Main Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard
                  title="Messages traites"
                  value={stats.messagesProcessed.toLocaleString()}
                  subtitle={`+${stats.todayProcessed} aujourd'hui`}
                  icon={MessageSquare}
                  color="sky"
                />
                <StatCard
                  title="Auto-reponses"
                  value={stats.autoReplied.toLocaleString()}
                  subtitle={stats.messagesProcessed > 0 ? `${Math.round((stats.autoReplied / stats.messagesProcessed) * 100)}% du total` : "0%"}
                  icon={Bot}
                  color="emerald"
                />
                <StatCard
                  title="Escalades"
                  value={stats.escalated}
                  subtitle="vers humains"
                  icon={ArrowUp}
                  color="amber"
                />
                <StatCard
                  title="Precision IA"
                  value={stats.accuracyRate > 0 ? `${Math.round(stats.accuracyRate * 100)}%` : "-"}
                  subtitle="taux de reussite"
                  icon={CheckCircle}
                  color="violet"
                />
              </div>

              {/* AI Performance */}
              <Card className="bg-gradient-to-r from-emerald-500/10 to-sky-500/10 border-emerald-500/20">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 flex items-center justify-center">
                      <Brain className="h-7 w-7 text-emerald-400" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">Moteur IA Support</h2>
                      <p className="text-white/60">Triage automatique + reponses intelligentes</p>
                    </div>
                    <Badge className="ml-auto bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                      <Zap className="h-3 w-3 mr-1" />
                      Actif
                    </Badge>
                  </div>
                  
                  <div className="grid md:grid-cols-4 gap-4">
                    <div className="p-4 bg-white/5 rounded-lg text-center">
                      <p className="text-3xl font-bold text-white">
                        {stats.avgConfidence > 0 ? `${Math.round(stats.avgConfidence * 100)}%` : "-"}
                      </p>
                      <p className="text-white/50 text-sm">Confiance moyenne</p>
                    </div>
                    <div className="p-4 bg-white/5 rounded-lg text-center">
                      <p className="text-3xl font-bold text-white">
                        {stats.avgResponseTime > 0 ? `${stats.avgResponseTime}s` : "-"}
                      </p>
                      <p className="text-white/50 text-sm">Temps de reponse</p>
                    </div>
                    <div className="p-4 bg-white/5 rounded-lg text-center">
                      <p className="text-3xl font-bold text-emerald-400">{stats.todayAutoReplied}</p>
                      <p className="text-white/50 text-sm">Auto-reponses aujourd&apos;hui</p>
                    </div>
                    <div className="p-4 bg-white/5 rounded-lg text-center">
                      <p className="text-3xl font-bold text-white">4</p>
                      <p className="text-white/50 text-sm">Agents IA actifs</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Grid: Categories + Workload + Alerts */}
              <div className="grid lg:grid-cols-3 gap-6">
                <CategoryPerformanceCard stats={categories} />
                <TeamWorkloadCard workload={workload} />
                <AlertsCard alerts={alerts} />
              </div>
            </>
          )}
        </>
      )}

      {/* AI Agents Status - always show */}
      <Card className="bg-slate-900/50 border-white/10">
        <CardHeader className="pb-3">
          <CardTitle className="text-white text-lg flex items-center gap-2">
            <Zap className="h-5 w-5 text-amber-400" />
            Agents IA actifs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4">
            {[
              { name: "IA Triage", description: "Classification et priorite", status: "active" },
              { name: "IA Reponse", description: "Reponses automatiques", status: "active" },
              { name: "IA Escalade", description: "Detection urgences", status: "active" },
              { name: "IA Surveillance", description: "Detection anomalies", status: "active" },
            ].map((agent) => (
              <div key={agent.name} className="p-4 bg-white/5 rounded-lg border border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-medium">{agent.name}</span>
                  <Badge className="bg-emerald-500/20 text-emerald-400 text-xs">Actif</Badge>
                </div>
                <p className="text-white/50 text-xs">{agent.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
