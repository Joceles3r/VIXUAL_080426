"use client"

import { useState } from "react"
import {
  Search,
  TrendingUp,
  Share2,
  Users,
  Eye,
  MousePointer,
  UserPlus,
  Award,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  Globe,
  BarChart3,
  FileText,
  AlertTriangle,
  Settings,
  RefreshCw,
  ExternalLink,
  Copy,
  Instagram,
  Facebook,
  Linkedin,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  Zap,
} from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  getMockSeoMetrics,
  getMockSocialMetrics,
  getMockSeoSuggestions,
  calculateGrowthScore,
  type SeoSuggestion,
  type SocialSource,
} from "@/lib/seo-growth-engine"

// ─── Social Source Icons ───

const SOURCE_ICONS: Record<SocialSource, React.ReactNode> = {
  instagram: <Instagram className="h-4 w-4" />,
  tiktok: <span className="text-xs font-bold">TT</span>,
  facebook: <Facebook className="h-4 w-4" />,
  x: <span className="text-xs font-bold">X</span>,
  linkedin: <Linkedin className="h-4 w-4" />,
  youtube: <span className="text-xs font-bold">YT</span>,
  other: <Globe className="h-4 w-4" />,
}

const SOURCE_COLORS: Record<SocialSource, string> = {
  instagram: "bg-gradient-to-r from-purple-500 to-pink-500",
  tiktok: "bg-black",
  facebook: "bg-blue-600",
  x: "bg-black",
  linkedin: "bg-blue-700",
  youtube: "bg-red-600",
  other: "bg-slate-600",
}

// ─── Status Badge Component ───

function StatusBadge({ status }: { status: "pending" | "approved" | "rejected" }) {
  const config = {
    pending: { label: "En attente", className: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
    approved: { label: "Valide", className: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
    rejected: { label: "Refuse", className: "bg-red-500/20 text-red-400 border-red-500/30" },
  }
  const c = config[status]
  return <Badge variant="outline" className={c.className}>{c.label}</Badge>
}

// ─── Main Component ───

export default function SeoGrowthDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const [suggestions, setSuggestions] = useState<SeoSuggestion[]>(getMockSeoSuggestions())
  
  const seoMetrics = getMockSeoMetrics()
  const socialMetrics = getMockSocialMetrics()
  const growthScore = calculateGrowthScore({
    seoTraffic: seoMetrics.totalTraffic,
    socialTraffic: socialMetrics.totalClicks,
    conversionRate: seoMetrics.conversionRate / 100,
    engagementRate: 0.65,
    contentQuality: 78,
  })

  const handleApproveSuggestion = (id: string) => {
    setSuggestions(prev => prev.map(s => 
      s.id === id ? { ...s, status: "approved" as const, approvedAt: new Date(), approvedBy: "admin" } : s
    ))
  }

  const handleRejectSuggestion = (id: string) => {
    setSuggestions(prev => prev.map(s => 
      s.id === id ? { ...s, status: "rejected" as const } : s
    ))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950/30 to-slate-950 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-xl bg-gradient-to-br from-cyan-500 to-indigo-600">
            <TrendingUp className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">SEO + Social Growth Engine</h1>
            <p className="text-white/50 text-sm">Moteur de croissance organique VIXUAL</p>
          </div>
        </div>
        <p className="text-white/40 text-sm mt-2 max-w-2xl">
          Analysez les performances SEO, gerez les propositions de contenu et suivez la croissance sociale de VIXUAL.
        </p>
      </div>

      {/* Score Global */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-8">
        <Card className="lg:col-span-2 bg-gradient-to-br from-indigo-600/20 to-purple-600/20 border-indigo-500/30 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-white/50 text-sm">Score de Croissance Global</p>
                <p className="text-5xl font-bold text-white">{growthScore.overall}<span className="text-2xl text-white/50">/100</span></p>
              </div>
              <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
            </div>
            <div className="grid grid-cols-4 gap-2 mt-4">
              {[
                { label: "SEO", value: growthScore.seo, color: "bg-cyan-500" },
                { label: "Social", value: growthScore.social, color: "bg-pink-500" },
                { label: "Engagement", value: growthScore.engagement, color: "bg-amber-500" },
                { label: "Qualite", value: growthScore.quality, color: "bg-emerald-500" },
              ].map(item => (
                <div key={item.label} className="text-center">
                  <p className="text-xs text-white/40 mb-1">{item.label}</p>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.value}%` }} />
                  </div>
                  <p className="text-sm font-medium text-white mt-1">{item.value}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        {[
          { label: "Trafic SEO", value: seoMetrics.totalTraffic.toLocaleString(), icon: Search, change: "+12%", up: true, color: "from-cyan-500 to-blue-600" },
          { label: "Trafic Social", value: socialMetrics.totalClicks.toLocaleString(), icon: Share2, change: "+24%", up: true, color: "from-pink-500 to-rose-600" },
          { label: "Nouveaux Inscrits", value: (seoMetrics.newUsersViaSeo + socialMetrics.signupsGenerated).toLocaleString(), icon: UserPlus, change: "+8%", up: true, color: "from-emerald-500 to-teal-600" },
        ].map(stat => (
          <Card key={stat.label} className="bg-white/[0.03] border-white/10 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-white/50 text-xs mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <div className={`flex items-center gap-1 mt-1 text-xs ${stat.up ? "text-emerald-400" : "text-red-400"}`}>
                    {stat.up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                    {stat.change}
                  </div>
                </div>
                <div className={`p-2 rounded-xl bg-gradient-to-br ${stat.color}`}>
                  <stat.icon className="h-5 w-5 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-white/5 border border-white/10 p-1">
          <TabsTrigger value="overview" className="data-[state=active]:bg-indigo-600">Vue Globale</TabsTrigger>
          <TabsTrigger value="seo" className="data-[state=active]:bg-cyan-600">SEO</TabsTrigger>
          <TabsTrigger value="social" className="data-[state=active]:bg-pink-600">Social</TabsTrigger>
          <TabsTrigger value="suggestions" className="data-[state=active]:bg-amber-600">
            Propositions
            <Badge className="ml-2 bg-amber-500/20 text-amber-400 text-xs">{suggestions.filter(s => s.status === "pending").length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="alerts" className="data-[state=active]:bg-red-600">Alertes</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Keywords */}
            <Card className="bg-white/[0.03] border-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Search className="h-5 w-5 text-cyan-400" />
                  Top Mots-Cles SEO
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {seoMetrics.topKeywords.map((kw, i) => (
                  <div key={kw.keyword} className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-cyan-400">#{i + 1}</span>
                      <div>
                        <p className="text-white text-sm font-medium">{kw.keyword}</p>
                        <p className="text-white/40 text-xs">Position: {kw.position}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-semibold">{kw.clicks.toLocaleString()}</p>
                      <p className="text-white/40 text-xs">clics</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Top Pages */}
            <Card className="bg-white/[0.03] border-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <FileText className="h-5 w-5 text-indigo-400" />
                  Pages les Plus Visitees
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {seoMetrics.topPages.map((page, i) => (
                  <div key={page.path} className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-indigo-400">#{i + 1}</span>
                      <div>
                        <p className="text-white text-sm font-medium font-mono">{page.path}</p>
                        <p className="text-white/40 text-xs">Bounce: {page.bounceRate}%</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-semibold">{page.views.toLocaleString()}</p>
                      <p className="text-white/40 text-xs">vues</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Conversion Funnel */}
          <Card className="bg-white/[0.03] border-white/10 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Target className="h-5 w-5 text-emerald-400" />
                Entonnoir de Conversion
              </CardTitle>
              <CardDescription className="text-white/50">Du trafic a la participation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between gap-4">
                {[
                  { label: "Visiteurs", value: seoMetrics.totalTraffic + socialMetrics.totalClicks, icon: Eye, color: "from-slate-500 to-slate-600" },
                  { label: "Uniques", value: socialMetrics.uniqueVisitors + seoMetrics.monthlyTraffic * 0.6, icon: Users, color: "from-blue-500 to-blue-600" },
                  { label: "Inscrits", value: seoMetrics.newUsersViaSeo + socialMetrics.signupsGenerated, icon: UserPlus, color: "from-indigo-500 to-indigo-600" },
                  { label: "Conversions", value: socialMetrics.conversions + Math.floor(seoMetrics.newUsersViaSeo * 0.4), icon: CheckCircle2, color: "from-emerald-500 to-emerald-600" },
                ].map((step, i, arr) => (
                  <div key={step.label} className="flex-1 text-center relative">
                    <div className={`mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center mb-3`}>
                      <step.icon className="h-7 w-7 text-white" />
                    </div>
                    <p className="text-white font-bold text-lg">{Math.round(step.value).toLocaleString()}</p>
                    <p className="text-white/50 text-xs">{step.label}</p>
                    {i < arr.length - 1 && (
                      <div className="absolute top-8 -right-2 text-white/20">
                        <ArrowUpRight className="h-6 w-6 rotate-45" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SEO Tab */}
        <TabsContent value="seo" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { label: "Trafic Total", value: seoMetrics.totalTraffic.toLocaleString(), icon: Eye, color: "from-cyan-500 to-cyan-600" },
              { label: "Cette Semaine", value: seoMetrics.weeklyTraffic.toLocaleString(), icon: TrendingUp, color: "from-blue-500 to-blue-600" },
              { label: "Ce Mois", value: seoMetrics.monthlyTraffic.toLocaleString(), icon: BarChart3, color: "from-indigo-500 to-indigo-600" },
              { label: "Taux Conversion", value: `${seoMetrics.conversionRate}%`, icon: Target, color: "from-emerald-500 to-emerald-600" },
            ].map(stat => (
              <Card key={stat.label} className="bg-white/[0.03] border-white/10">
                <CardContent className="pt-6 flex items-center gap-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color}`}>
                    <stat.icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-white/50 text-xs">{stat.label}</p>
                    <p className="text-xl font-bold text-white">{stat.value}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="bg-white/[0.03] border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Performance des Mots-Cles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {seoMetrics.topKeywords.map(kw => (
                  <div key={kw.keyword} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-white text-sm">{kw.keyword}</span>
                      <span className="text-cyan-400 font-mono text-sm">{kw.clicks} clics</span>
                    </div>
                    <Progress value={(kw.clicks / seoMetrics.topKeywords[0].clicks) * 100} className="h-2 bg-white/10" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Social Tab */}
        <TabsContent value="social" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { label: "Partages Totaux", value: socialMetrics.totalShares.toLocaleString(), icon: Share2, color: "from-pink-500 to-pink-600" },
              { label: "Clics Generes", value: socialMetrics.totalClicks.toLocaleString(), icon: MousePointer, color: "from-rose-500 to-rose-600" },
              { label: "Inscriptions", value: socialMetrics.signupsGenerated.toLocaleString(), icon: UserPlus, color: "from-fuchsia-500 to-fuchsia-600" },
              { label: "VIXUpoints Distribues", value: socialMetrics.vixupointsDistributed.toLocaleString(), icon: Award, color: "from-amber-500 to-amber-600" },
            ].map(stat => (
              <Card key={stat.label} className="bg-white/[0.03] border-white/10">
                <CardContent className="pt-6 flex items-center gap-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color}`}>
                    <stat.icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-white/50 text-xs">{stat.label}</p>
                    <p className="text-xl font-bold text-white">{stat.value}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* By Source */}
          <Card className="bg-white/[0.03] border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Performance par Reseau</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                {(Object.entries(socialMetrics.bySource) as [SocialSource, { shares: number; clicks: number; conversions: number }][]).map(([source, data]) => (
                  <div key={source} className="text-center p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                    <div className={`w-10 h-10 mx-auto rounded-full ${SOURCE_COLORS[source]} flex items-center justify-center mb-3 text-white`}>
                      {SOURCE_ICONS[source]}
                    </div>
                    <p className="text-white font-medium text-sm capitalize mb-2">{source}</p>
                    <div className="space-y-1 text-xs">
                      <p className="text-white/50">{data.shares} partages</p>
                      <p className="text-cyan-400">{data.clicks} clics</p>
                      <p className="text-emerald-400">{data.conversions} conv.</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Sharers */}
          <Card className="bg-white/[0.03] border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Award className="h-5 w-5 text-amber-400" />
                Top Partageurs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {socialMetrics.topSharers.map((sharer, i) => (
                  <div key={sharer.userId} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${i === 0 ? "bg-amber-500" : i === 1 ? "bg-slate-400" : "bg-amber-700"}`}>
                        {i + 1}
                      </div>
                      <span className="text-white font-mono text-sm">{sharer.userId}</span>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <p className="text-white font-semibold">{sharer.shares}</p>
                        <p className="text-white/40 text-xs">partages</p>
                      </div>
                      <div className="text-center">
                        <p className="text-emerald-400 font-semibold">{sharer.conversions}</p>
                        <p className="text-white/40 text-xs">conversions</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Suggestions Tab */}
        <TabsContent value="suggestions" className="space-y-6">
          <Card className="bg-white/[0.03] border-white/10">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-amber-400" />
                    Propositions SEO (IA)
                  </CardTitle>
                  <CardDescription className="text-white/50">
                    Pages generees automatiquement en attente de validation
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Actualiser
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {suggestions.map(suggestion => (
                <div
                  key={suggestion.id}
                  className={`p-4 rounded-xl border transition-all ${
                    suggestion.status === "approved"
                      ? "bg-emerald-500/10 border-emerald-500/30"
                      : suggestion.status === "rejected"
                      ? "bg-red-500/10 border-red-500/30"
                      : "bg-white/5 border-white/10 hover:border-amber-500/50"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <StatusBadge status={suggestion.status} />
                        <Badge variant="outline" className="border-indigo-500/30 text-indigo-400">
                          {suggestion.pageType}
                        </Badge>
                        <Badge variant="outline" className="border-cyan-500/30 text-cyan-400">
                          {suggestion.targetProfile}
                        </Badge>
                      </div>
                      <h3 className="text-white font-semibold text-lg mb-1">{suggestion.title}</h3>
                      <p className="text-white/60 text-sm mb-3">{suggestion.description}</p>
                      <div className="flex items-center gap-4 text-xs text-white/40">
                        <span>Score SEO: <span className={`font-semibold ${suggestion.score >= 80 ? "text-emerald-400" : suggestion.score >= 60 ? "text-amber-400" : "text-red-400"}`}>{suggestion.score}/100</span></span>
                        <span>Mots-cles: {suggestion.keywords.length}</span>
                        <span>Cree le {suggestion.createdAt.toLocaleDateString("fr-FR")}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="text-center mb-2">
                        <div className={`text-3xl font-bold ${suggestion.score >= 80 ? "text-emerald-400" : suggestion.score >= 60 ? "text-amber-400" : "text-red-400"}`}>
                          {suggestion.score}
                        </div>
                        <p className="text-white/40 text-xs">Score SEO</p>
                      </div>
                      {suggestion.status === "pending" && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleApproveSuggestion(suggestion.id)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white"
                          >
                            <CheckCircle2 className="h-4 w-4 mr-1" />
                            Valider
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRejectSuggestion(suggestion.id)}
                            className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Refuser
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                  {suggestion.status === "pending" && (
                    <div className="mt-4 pt-4 border-t border-white/10">
                      <p className="text-white/40 text-xs mb-2">Structure proposee:</p>
                      <div className="flex flex-wrap gap-2">
                        <Badge className="bg-indigo-500/20 text-indigo-400 border-none">H1: {suggestion.structure.h1.slice(0, 40)}...</Badge>
                        {suggestion.structure.h2.map((h2, i) => (
                          <Badge key={i} className="bg-cyan-500/20 text-cyan-400 border-none">H2: {h2}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Alerts Tab */}
        <TabsContent value="alerts" className="space-y-6">
          <Card className="bg-white/[0.03] border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-400" />
                Alertes Anti-Abus
              </CardTitle>
              <CardDescription className="text-white/50">
                Detection automatique des comportements suspects
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { type: "warning", message: "Pic de partages detecte pour user_892 (45 partages en 2h)", time: "Il y a 15 min" },
                { type: "info", message: "Nouvelle IP detectee pour une campagne existante", time: "Il y a 1h" },
                { type: "success", message: "Verification anti-bot: 0 compte suspect detecte", time: "Il y a 3h" },
              ].map((alert, i) => (
                <div
                  key={i}
                  className={`p-4 rounded-xl border flex items-start gap-4 ${
                    alert.type === "warning"
                      ? "bg-amber-500/10 border-amber-500/30"
                      : alert.type === "info"
                      ? "bg-blue-500/10 border-blue-500/30"
                      : "bg-emerald-500/10 border-emerald-500/30"
                  }`}
                >
                  <AlertTriangle className={`h-5 w-5 mt-0.5 ${
                    alert.type === "warning" ? "text-amber-400" : alert.type === "info" ? "text-blue-400" : "text-emerald-400"
                  }`} />
                  <div className="flex-1">
                    <p className="text-white text-sm">{alert.message}</p>
                    <p className="text-white/40 text-xs mt-1">{alert.time}</p>
                  </div>
                  <Button variant="ghost" size="sm" className="text-white/50 hover:text-white">
                    Voir
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-white/[0.03] border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Settings className="h-5 w-5 text-slate-400" />
                Parametres Anti-Abus
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Limite quotidienne", value: "10 partages" },
                  { label: "Limite hebdomadaire", value: "50 partages" },
                  { label: "Delai minimum", value: "1 minute" },
                  { label: "VIXUpoints max/jour", value: "200 pts" },
                ].map(param => (
                  <div key={param.label} className="p-3 rounded-lg bg-white/5">
                    <p className="text-white/50 text-xs mb-1">{param.label}</p>
                    <p className="text-white font-semibold">{param.value}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Footer */}
      <div className="mt-8 text-center">
        <p className="text-white/30 text-sm">
          VIXUAL SEO + Social Growth Engine v1.0 — Regarde-Soutiens-Participe
        </p>
      </div>
    </div>
  )
}
