"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Eye,
  TrendingUp,
  Users,
  Star,
  Rocket,
  Flame,
  Crown,
  Shield,
  AlertTriangle,
  BarChart3,
  Globe,
  CheckCircle,
  XCircle,
  Clock,
  Zap,
  Target,
  Activity,
  Search,
  Filter,
} from "lucide-react"
import {
  VISIBILITY_LEVELS,
  VISIBILITY_WEIGHTS,
  TRUST_SCORE_THRESHOLDS,
  type VisibilityLevel,
  type VisibilityProfile,
  type AntiGamingAlert,
} from "@/lib/visibility-engine"

// Mock data for demonstration
const mockProfiles: VisibilityProfile[] = [
  {
    userId: "user-001",
    role: "porteur",
    visibilityScore: 87,
    visibilityLevel: "premium",
    trustScore: 92,
    engagementScore: 85,
    promotionScore: 78,
    consistencyScore: 90,
    contentPerformanceScore: 82,
    isBoostBlocked: false,
    badges: [{ id: "b1", name: "Élite VIXUAL", icon: "crown", level: "premium", awardedAt: new Date() }],
    updatedAt: new Date(),
  },
  {
    userId: "user-002",
    role: "infoporteur",
    visibilityScore: 72,
    visibilityLevel: "strong",
    trustScore: 78,
    engagementScore: 70,
    promotionScore: 65,
    consistencyScore: 75,
    contentPerformanceScore: 68,
    isBoostBlocked: false,
    badges: [{ id: "b2", name: "Tendance", icon: "fire", level: "strong", awardedAt: new Date() }],
    updatedAt: new Date(),
  },
  {
    userId: "user-003",
    role: "contributeur",
    visibilityScore: 45,
    visibilityLevel: "boosted",
    trustScore: 65,
    engagementScore: 50,
    promotionScore: 40,
    consistencyScore: 55,
    contentPerformanceScore: 35,
    isBoostBlocked: false,
    badges: [{ id: "b3", name: "En progression", icon: "rocket", level: "boosted", awardedAt: new Date() }],
    updatedAt: new Date(),
  },
  {
    userId: "user-004",
    role: "visiteur",
    visibilityScore: 28,
    visibilityLevel: "base",
    trustScore: 25,
    engagementScore: 30,
    promotionScore: 20,
    consistencyScore: 35,
    contentPerformanceScore: 15,
    isBoostBlocked: true,
    blockReason: "Trust Score critique - visibilité bloquée",
    badges: [{ id: "b4", name: "Visible", icon: "star", level: "base", awardedAt: new Date() }],
    updatedAt: new Date(),
  },
]

const mockAlerts: AntiGamingAlert[] = [
  {
    id: "alert-001",
    userId: "user-suspect-1",
    alertType: "fake_shares",
    severity: "high",
    description: "Vélocité de partage anormale: 45/h",
    detectedAt: new Date(Date.now() - 3600000),
    resolved: false,
  },
  {
    id: "alert-002",
    userId: "user-suspect-2",
    alertType: "multi_account",
    severity: "critical",
    description: "Signaux de multi-comptes coordonnés détectés",
    detectedAt: new Date(Date.now() - 7200000),
    resolved: false,
  },
  {
    id: "alert-003",
    userId: "user-suspect-3",
    alertType: "spike_interactions",
    severity: "medium",
    description: "Pic anormal d'interactions détecté",
    detectedAt: new Date(Date.now() - 86400000),
    resolved: true,
  },
]

const mockStats = {
  totalProfiles: 12847,
  premiumProfiles: 128,
  strongProfiles: 892,
  boostedProfiles: 3241,
  baseProfiles: 8586,
  averageScore: 42,
  activeBoosts: 156,
  blockedProfiles: 23,
  alertsToday: 7,
  seoBoostsTriggered: 34,
}

function getBadgeIconComponent(icon: string) {
  switch (icon) {
    case "crown":
      return Crown
    case "fire":
      return Flame
    case "rocket":
      return Rocket
    case "star":
    default:
      return Star
  }
}

function getLevelColor(level: VisibilityLevel) {
  switch (level) {
    case "premium":
      return "violet"
    case "strong":
      return "amber"
    case "boosted":
      return "emerald"
    case "base":
    default:
      return "slate"
  }
}

function getSeverityColor(severity: AntiGamingAlert["severity"]) {
  switch (severity) {
    case "critical":
      return "rose"
    case "high":
      return "orange"
    case "medium":
      return "amber"
    case "low":
    default:
      return "slate"
  }
}

export default function VisibilityEnginePage() {
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 border border-violet-500/30">
              <Eye className="h-6 w-6 text-violet-400" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">VIXUAL Visibility Engine</h1>
          </div>
          <p className="text-white/60 text-sm md:text-base">
            Moteur de récompense par la visibilité — Regarde-Soutiens-Participe
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="border-white/10 text-white/70">
            <Filter className="h-4 w-4 mr-2" />
            Filtres
          </Button>
          <Button size="sm" className="bg-violet-600 hover:bg-violet-700">
            <Activity className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <Card className="bg-slate-900/50 border-white/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-white/40" />
              <span className="text-xs text-white/40">Total profils</span>
            </div>
            <p className="text-xl font-bold text-white">{mockStats.totalProfiles.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className="bg-violet-500/10 border-violet-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Crown className="h-4 w-4 text-violet-400" />
              <span className="text-xs text-violet-400">Premium</span>
            </div>
            <p className="text-xl font-bold text-violet-300">{mockStats.premiumProfiles}</p>
          </CardContent>
        </Card>
        <Card className="bg-amber-500/10 border-amber-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Flame className="h-4 w-4 text-amber-400" />
              <span className="text-xs text-amber-400">Forte</span>
            </div>
            <p className="text-xl font-bold text-amber-300">{mockStats.strongProfiles}</p>
          </CardContent>
        </Card>
        <Card className="bg-emerald-500/10 border-emerald-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Rocket className="h-4 w-4 text-emerald-400" />
              <span className="text-xs text-emerald-400">Boostée</span>
            </div>
            <p className="text-xl font-bold text-emerald-300">{mockStats.boostedProfiles}</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-900/50 border-white/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-4 w-4 text-sky-400" />
              <span className="text-xs text-white/40">Boosts actifs</span>
            </div>
            <p className="text-xl font-bold text-sky-300">{mockStats.activeBoosts}</p>
          </CardContent>
        </Card>
        <Card className="bg-rose-500/10 border-rose-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-rose-400" />
              <span className="text-xs text-rose-400">Alertes</span>
            </div>
            <p className="text-xl font-bold text-rose-300">{mockStats.alertsToday}</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-slate-900/50 border border-white/5 p-1">
          <TabsTrigger value="overview" className="data-[state=active]:bg-violet-600">
            <BarChart3 className="h-4 w-4 mr-2" />
            Vue globale
          </TabsTrigger>
          <TabsTrigger value="profiles" className="data-[state=active]:bg-violet-600">
            <Users className="h-4 w-4 mr-2" />
            Profils
          </TabsTrigger>
          <TabsTrigger value="boosts" className="data-[state=active]:bg-violet-600">
            <Zap className="h-4 w-4 mr-2" />
            Boosts
          </TabsTrigger>
          <TabsTrigger value="alerts" className="data-[state=active]:bg-violet-600">
            <Shield className="h-4 w-4 mr-2" />
            Anti-Gaming
          </TabsTrigger>
          <TabsTrigger value="rules" className="data-[state=active]:bg-violet-600">
            <Target className="h-4 w-4 mr-2" />
            Règles
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Score Distribution */}
            <Card className="bg-slate-900/50 border-white/5">
              <CardHeader>
                <CardTitle className="text-white text-lg">Distribution des niveaux</CardTitle>
                <CardDescription>Répartition des profils par niveau de visibilité</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {(["premium", "strong", "boosted", "base"] as VisibilityLevel[]).map((level) => {
                  const count =
                    level === "premium"
                      ? mockStats.premiumProfiles
                      : level === "strong"
                      ? mockStats.strongProfiles
                      : level === "boosted"
                      ? mockStats.boostedProfiles
                      : mockStats.baseProfiles
                  const percentage = Math.round((count / mockStats.totalProfiles) * 100)
                  const color = getLevelColor(level)

                  return (
                    <div key={level} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className={`text-${color}-400 font-medium`}>
                          {VISIBILITY_LEVELS[level].label}
                        </span>
                        <span className="text-white/60">
                          {count.toLocaleString()} ({percentage}%)
                        </span>
                      </div>
                      <Progress
                        value={percentage}
                        className={`h-2 bg-slate-800 [&>div]:bg-${color}-500`}
                      />
                    </div>
                  )
                })}
              </CardContent>
            </Card>

            {/* Formula Weights */}
            <Card className="bg-slate-900/50 border-white/5">
              <CardHeader>
                <CardTitle className="text-white text-lg">Formule de calcul</CardTitle>
                <CardDescription>Pondération des critères de visibilité</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(VISIBILITY_WEIGHTS).map(([key, weight]) => {
                    const labels: Record<string, { label: string; color: string }> = {
                      engagement: { label: "Engagement réel", color: "emerald" },
                      trust: { label: "Trust Score", color: "violet" },
                      promotion: { label: "Impact promotionnel", color: "sky" },
                      consistency: { label: "Régularité", color: "amber" },
                      performance: { label: "Performance contenu", color: "rose" },
                    }
                    const info = labels[key]
                    const percentage = weight * 100

                    return (
                      <div key={key} className="flex items-center gap-3">
                        <div className={`w-12 text-right text-${info.color}-400 font-mono font-bold`}>
                          {percentage}%
                        </div>
                        <div className="flex-1">
                          <Progress
                            value={percentage}
                            className={`h-3 bg-slate-800 [&>div]:bg-${info.color}-500`}
                          />
                        </div>
                        <div className="w-40 text-sm text-white/70">{info.label}</div>
                      </div>
                    )
                  })}
                </div>
                <div className="mt-4 p-3 bg-black/30 rounded-lg border border-white/5">
                  <p className="text-xs text-white/50 font-mono">
                    Score = (Engagement × 35%) + (Trust × 30%) + (Promotion × 20%) + (Régularité × 10%) + (Performance × 5%)
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Trust Score Thresholds */}
            <Card className="bg-slate-900/50 border-white/5">
              <CardHeader>
                <CardTitle className="text-white text-lg">Seuils Trust Score</CardTitle>
                <CardDescription>Requis pour accéder aux niveaux de visibilité</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-violet-500/10 rounded-lg border border-violet-500/20">
                    <div className="flex items-center gap-2">
                      <Crown className="h-4 w-4 text-violet-400" />
                      <span className="text-violet-300">Premium</span>
                    </div>
                    <span className="text-violet-400 font-mono font-bold">
                      {TRUST_SCORE_THRESHOLDS.minForPremium}+
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
                    <div className="flex items-center gap-2">
                      <Flame className="h-4 w-4 text-amber-400" />
                      <span className="text-amber-300">Forte</span>
                    </div>
                    <span className="text-amber-400 font-mono font-bold">
                      {TRUST_SCORE_THRESHOLDS.minForStrong}+
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                    <div className="flex items-center gap-2">
                      <Rocket className="h-4 w-4 text-emerald-400" />
                      <span className="text-emerald-300">Boostée</span>
                    </div>
                    <span className="text-emerald-400 font-mono font-bold">
                      {TRUST_SCORE_THRESHOLDS.minForBoosted}+
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-rose-500/10 rounded-lg border border-rose-500/20">
                    <div className="flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-rose-400" />
                      <span className="text-rose-300">Blocage critique</span>
                    </div>
                    <span className="text-rose-400 font-mono font-bold">
                      {"<"}{TRUST_SCORE_THRESHOLDS.criticalBlock}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="bg-slate-900/50 border-white/5">
              <CardHeader>
                <CardTitle className="text-white text-lg">Activité récente</CardTitle>
                <CardDescription>Derniers changements de visibilité</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { user: "Porteur #1247", action: "Promu Premium", time: "il y a 2h", icon: Crown, color: "violet" },
                    { user: "Projet #892", action: "Boost SEO activé", time: "il y a 3h", icon: Globe, color: "sky" },
                    { user: "Infoporteur #456", action: "Niveau Fort atteint", time: "il y a 5h", icon: Flame, color: "amber" },
                    { user: "Visiteur #2341", action: "Visibilité bloquée", time: "il y a 8h", icon: XCircle, color: "rose" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors">
                      <div className={`p-1.5 rounded-lg bg-${item.color}-500/20`}>
                        <item.icon className={`h-4 w-4 text-${item.color}-400`} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-white">{item.user}</p>
                        <p className="text-xs text-white/50">{item.action}</p>
                      </div>
                      <span className="text-xs text-white/40">{item.time}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Profiles Tab */}
        <TabsContent value="profiles" className="space-y-4">
          <Card className="bg-slate-900/50 border-white/5">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-white">Profils en progression</CardTitle>
                  <CardDescription>Top profils par score de visibilité</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="border-white/10">
                    <Search className="h-4 w-4 mr-2" />
                    Rechercher
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockProfiles.map((profile) => {
                  const BadgeIcon = getBadgeIconComponent(profile.badges[0]?.icon || "star")
                  const color = getLevelColor(profile.visibilityLevel)

                  return (
                    <div
                      key={profile.userId}
                      className={`p-4 rounded-xl border ${
                        profile.isBoostBlocked
                          ? "bg-rose-500/5 border-rose-500/20"
                          : `bg-${color}-500/5 border-${color}-500/20`
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-xl bg-${color}-500/20`}>
                          <BadgeIcon className={`h-5 w-5 text-${color}-400`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-white font-medium">{profile.userId}</span>
                            <Badge variant="outline" className={`text-${color}-400 border-${color}-500/30 text-xs`}>
                              {profile.role}
                            </Badge>
                            {profile.isBoostBlocked && (
                              <Badge variant="outline" className="text-rose-400 border-rose-500/30 text-xs">
                                Bloqué
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-xs text-white/50">
                            <span>Trust: {profile.trustScore}</span>
                            <span>Engagement: {profile.engagementScore}</span>
                            <span>Promo: {profile.promotionScore}</span>
                          </div>
                          {profile.blockReason && (
                            <p className="text-xs text-rose-400 mt-1">{profile.blockReason}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <div className={`text-2xl font-bold text-${color}-400`}>{profile.visibilityScore}</div>
                          <div className={`text-xs text-${color}-400/70`}>
                            {VISIBILITY_LEVELS[profile.visibilityLevel].label}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Boosts Tab */}
        <TabsContent value="boosts" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="bg-slate-900/50 border-white/5">
              <CardHeader>
                <CardTitle className="text-white">Boosts actifs</CardTitle>
                <CardDescription>{mockStats.activeBoosts} boosts en cours</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { type: "Explorer", count: 89, color: "emerald" },
                    { type: "Tendances", count: 34, color: "amber" },
                    { type: "À découvrir", count: 45, color: "sky" },
                    { type: "Homepage", count: 12, color: "violet" },
                    { type: "SEO + Social", count: 34, color: "fuchsia" },
                  ].map((boost) => (
                    <div
                      key={boost.type}
                      className={`flex items-center justify-between p-3 rounded-lg bg-${boost.color}-500/10 border border-${boost.color}-500/20`}
                    >
                      <span className={`text-${boost.color}-300`}>{boost.type}</span>
                      <span className={`text-${boost.color}-400 font-bold`}>{boost.count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-white/5">
              <CardHeader>
                <CardTitle className="text-white">Zones de boost par niveau</CardTitle>
                <CardDescription>Accès aux zones selon le niveau de visibilité</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(["premium", "strong", "boosted", "base"] as VisibilityLevel[]).map((level) => {
                    const zones =
                      level === "premium"
                        ? ["Explorer", "Tendances", "À découvrir", "Homepage", "SEO+Social"]
                        : level === "strong"
                        ? ["Explorer", "Tendances", "À découvrir"]
                        : level === "boosted"
                        ? ["Explorer", "À découvrir"]
                        : ["Explorer"]
                    const color = getLevelColor(level)

                    return (
                      <div key={level} className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge className={`bg-${color}-500/20 text-${color}-400 border-${color}-500/30`}>
                            {VISIBILITY_LEVELS[level].label}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {zones.map((zone) => (
                            <span
                              key={zone}
                              className={`text-xs px-2 py-1 rounded-full bg-${color}-500/10 text-${color}-400/80 border border-${color}-500/20`}
                            >
                              {zone}
                            </span>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Anti-Gaming Tab */}
        <TabsContent value="alerts" className="space-y-4">
          <Card className="bg-slate-900/50 border-white/5">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-white">Alertes Anti-Gaming</CardTitle>
                  <CardDescription>Détection des comportements de manipulation</CardDescription>
                </div>
                <Badge variant="outline" className="text-rose-400 border-rose-500/30">
                  {mockAlerts.filter((a) => !a.resolved).length} non résolues
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockAlerts.map((alert) => {
                  const color = getSeverityColor(alert.severity)

                  return (
                    <div
                      key={alert.id}
                      className={`p-4 rounded-xl border ${
                        alert.resolved
                          ? "bg-slate-800/50 border-white/5 opacity-60"
                          : `bg-${color}-500/10 border-${color}-500/20`
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg bg-${color}-500/20`}>
                          <AlertTriangle className={`h-4 w-4 text-${color}-400`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-white font-medium">{alert.userId}</span>
                            <Badge
                              variant="outline"
                              className={`text-${color}-400 border-${color}-500/30 text-xs uppercase`}
                            >
                              {alert.severity}
                            </Badge>
                            <Badge variant="outline" className="text-white/50 border-white/10 text-xs">
                              {alert.alertType.replace("_", " ")}
                            </Badge>
                          </div>
                          <p className="text-sm text-white/70">{alert.description}</p>
                          <div className="flex items-center gap-2 mt-2 text-xs text-white/40">
                            <Clock className="h-3 w-3" />
                            {alert.detectedAt.toLocaleString("fr-FR")}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {alert.resolved ? (
                            <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Résolu
                            </Badge>
                          ) : (
                            <>
                              <Button size="sm" variant="outline" className="border-white/10 text-xs">
                                Examiner
                              </Button>
                              <Button size="sm" className="bg-rose-600 hover:bg-rose-700 text-xs">
                                Bloquer
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Comportements surveillés */}
          <Card className="bg-slate-900/50 border-white/5">
            <CardHeader>
              <CardTitle className="text-white">Comportements surveillés</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: "Faux partages", icon: "share", active: true },
                  { label: "Clics artificiels", icon: "click", active: true },
                  { label: "Commentaires vides", icon: "comment", active: true },
                  { label: "Multi-comptes", icon: "users", active: true },
                  { label: "Pics d'interactions", icon: "spike", active: true },
                  { label: "Push artificiel", icon: "push", active: true },
                  { label: "Inflation score", icon: "inflation", active: true },
                  { label: "Fermes à visibilité", icon: "farm", active: true },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-center"
                  >
                    <CheckCircle className="h-4 w-4 text-emerald-400 mx-auto mb-1" />
                    <span className="text-xs text-emerald-300">{item.label}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Rules Tab */}
        <TabsContent value="rules" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="bg-slate-900/50 border-white/5">
              <CardHeader>
                <CardTitle className="text-white">Règle directrice</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 rounded-xl border border-violet-500/20">
                  <p className="text-lg text-white font-medium text-center">
                    Bon comportement + activité réelle + fiabilité = visibilité accrue
                  </p>
                </div>
                <div className="mt-4 space-y-2">
                  <p className="text-sm text-white/60">La visibilité devient une récompense :</p>
                  <ul className="space-y-1 text-sm text-white/50">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-emerald-400" />
                      Plus saine que l'argent
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-emerald-400" />
                      Plus alignée avec l'écosystème VIXUAL
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-emerald-400" />
                      Plus utile aux créateurs et profils actifs
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-emerald-400" />
                      Plus compatible avec l'engagement communautaire
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-white/5">
              <CardHeader>
                <CardTitle className="text-white">Système de récompenses VIXUAL</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                    <div className="flex items-center gap-2 mb-1">
                      <Star className="h-4 w-4 text-amber-400" />
                      <span className="text-amber-300 font-medium">VIXUpoints</span>
                    </div>
                    <p className="text-xs text-white/50">Récompense de participation utile et communautaire</p>
                  </div>
                  <div className="p-3 rounded-lg bg-sky-500/10 border border-sky-500/20">
                    <div className="flex items-center gap-2 mb-1">
                      <Crown className="h-4 w-4 text-sky-400" />
                      <span className="text-sky-300 font-medium">Badges</span>
                    </div>
                    <p className="text-xs text-white/50">Récompense de réputation et de progression</p>
                  </div>
                  <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    <div className="flex items-center gap-2 mb-1">
                      <Shield className="h-4 w-4 text-emerald-400" />
                      <span className="text-emerald-300 font-medium">Trust Score</span>
                    </div>
                    <p className="text-xs text-white/50">Récompense de fiabilité et de qualité comportementale</p>
                  </div>
                  <div className="p-3 rounded-lg bg-violet-500/10 border border-violet-500/20">
                    <div className="flex items-center gap-2 mb-1">
                      <Eye className="h-4 w-4 text-violet-400" />
                      <span className="text-violet-300 font-medium">Visibilité</span>
                    </div>
                    <p className="text-xs text-white/50">Récompense d'exposition et d'impact réel</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Summary */}
          <Card className="bg-gradient-to-br from-slate-900 to-slate-900/50 border-white/5">
            <CardContent className="p-6">
              <div className="text-center space-y-3">
                <p className="text-white/70">
                  Tu participes → tu peux gagner des <span className="text-amber-400 font-medium">VIXUpoints</span>
                </p>
                <p className="text-white/70">
                  Tu progresses → tu obtiens des <span className="text-sky-400 font-medium">badges</span>
                </p>
                <p className="text-white/70">
                  Tu es fiable → ton <span className="text-emerald-400 font-medium">Trust Score</span> monte
                </p>
                <p className="text-white/70">
                  Tu es utile et régulier → ta <span className="text-violet-400 font-medium">visibilité</span> augmente
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
