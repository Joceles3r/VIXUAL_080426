"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Bot,
  Brain,
  Activity,
  TrendingUp,
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
} from "lucide-react"
import { MOCK_EMPLOYEES, EMPLOYEE_FUNCTIONS } from "@/lib/admin/employees"
import { MESSAGE_CATEGORIES, MESSAGE_PRIORITIES } from "@/lib/support/ai-support-engine"

// ==================== MOCK DATA ====================

const AI_STATS = {
  messagesProcessed: 1247,
  autoReplied: 412,
  escalated: 89,
  avgConfidence: 0.87,
  avgResponseTime: 0.8, // seconds
  todayProcessed: 34,
  todayAutoReplied: 12,
  accuracyRate: 0.94,
}

const CATEGORY_STATS = [
  { category: "payment", count: 156, autoReplied: 42, avgConfidence: 0.85 },
  { category: "technical", count: 198, autoReplied: 31, avgConfidence: 0.78 },
  { category: "account", count: 234, autoReplied: 98, avgConfidence: 0.91 },
  { category: "general", count: 312, autoReplied: 187, avgConfidence: 0.94 },
  { category: "content", count: 89, autoReplied: 12, avgConfidence: 0.82 },
  { category: "stripe_onboarding", count: 145, autoReplied: 89, avgConfidence: 0.92 },
  { category: "ticket_gold", count: 78, autoReplied: 45, avgConfidence: 0.89 },
  { category: "abuse", count: 35, autoReplied: 0, avgConfidence: 0.76 },
]

const TEAM_WORKLOAD = [
  { team: "payment_support", tickets: 24, urgent: 3, employees: 2 },
  { team: "technical_support", tickets: 31, urgent: 1, employees: 3 },
  { team: "user_support", tickets: 18, urgent: 0, employees: 2 },
  { team: "content_moderation", tickets: 12, urgent: 2, employees: 2 },
  { team: "creator_support", tickets: 8, urgent: 1, employees: 1 },
]

const RECENT_ALERTS = [
  { id: 1, type: "saturation", message: "Support technique sature (31 tickets)", time: "Il y a 5 min", severity: "warning" },
  { id: 2, type: "spike", message: "Hausse des tickets paiement (+40%)", time: "Il y a 15 min", severity: "warning" },
  { id: 3, type: "pattern", message: "Bug recurrent detecte: upload video", time: "Il y a 1h", severity: "info" },
  { id: 4, type: "fraud", message: "Activite suspecte detectee: multi-comptes", time: "Il y a 2h", severity: "critical" },
]

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

function CategoryPerformanceCard({ stats }: { stats: typeof CATEGORY_STATS }) {
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

function TeamWorkloadCard({ workload }: { workload: typeof TEAM_WORKLOAD }) {
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

function AlertsCard({ alerts }: { alerts: typeof RECENT_ALERTS }) {
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

  return (
    <Card className="bg-slate-900/50 border-white/10">
      <CardHeader className="pb-3">
        <CardTitle className="text-white text-lg flex items-center gap-2">
          <Shield className="h-5 w-5 text-amber-400" />
          Alertes IA
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

// ==================== MAIN PAGE ====================

export default function AdminSupportPage() {
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => setIsRefreshing(false), 1000)
  }

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
            disabled={isRefreshing}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            Actualiser
          </Button>
          <Button variant="outline" className="border-white/20 text-white">
            <Settings className="mr-2 h-4 w-4" />
            Configuration
          </Button>
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Messages traites"
          value={AI_STATS.messagesProcessed.toLocaleString()}
          subtitle={`+${AI_STATS.todayProcessed} aujourd'hui`}
          icon={MessageSquare}
          color="sky"
          trend={{ value: 12, positive: true }}
        />
        <StatCard
          title="Auto-reponses"
          value={AI_STATS.autoReplied.toLocaleString()}
          subtitle={`${Math.round((AI_STATS.autoReplied / AI_STATS.messagesProcessed) * 100)}% du total`}
          icon={Bot}
          color="emerald"
          trend={{ value: 8, positive: true }}
        />
        <StatCard
          title="Escalades"
          value={AI_STATS.escalated}
          subtitle="vers humains"
          icon={ArrowUp}
          color="amber"
        />
        <StatCard
          title="Precision IA"
          value={`${Math.round(AI_STATS.accuracyRate * 100)}%`}
          subtitle="taux de reussite"
          icon={CheckCircle}
          color="violet"
          trend={{ value: 2, positive: true }}
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
              <p className="text-3xl font-bold text-white">{Math.round(AI_STATS.avgConfidence * 100)}%</p>
              <p className="text-white/50 text-sm">Confiance moyenne</p>
            </div>
            <div className="p-4 bg-white/5 rounded-lg text-center">
              <p className="text-3xl font-bold text-white">{AI_STATS.avgResponseTime}s</p>
              <p className="text-white/50 text-sm">Temps de reponse</p>
            </div>
            <div className="p-4 bg-white/5 rounded-lg text-center">
              <p className="text-3xl font-bold text-emerald-400">{AI_STATS.todayAutoReplied}</p>
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
        <CategoryPerformanceCard stats={CATEGORY_STATS} />
        <TeamWorkloadCard workload={TEAM_WORKLOAD} />
        <AlertsCard alerts={RECENT_ALERTS} />
      </div>

      {/* AI Agents Status */}
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
              { name: "IA Triage", description: "Classification et priorite", status: "active", processed: 1247 },
              { name: "IA Reponse", description: "Reponses automatiques", status: "active", processed: 412 },
              { name: "IA Escalade", description: "Detection urgences", status: "active", processed: 89 },
              { name: "IA Surveillance", description: "Detection anomalies", status: "active", processed: 156 },
            ].map((agent) => (
              <div key={agent.name} className="p-4 bg-white/5 rounded-lg border border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-medium">{agent.name}</span>
                  <Badge className="bg-emerald-500/20 text-emerald-400 text-xs">Actif</Badge>
                </div>
                <p className="text-white/50 text-xs mb-3">{agent.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-white/40 text-xs">Traites</span>
                  <span className="text-white font-semibold">{agent.processed}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
