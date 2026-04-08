"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Orbit,
  TrendingUp,
  Users,
  Trophy,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Coins,
  BarChart3,
  Shield,
  Film,
  BookOpen,
  Mic,
  RefreshCw,
  Play,
  Pause,
  Info,
} from "lucide-react"
import {
  DISTRIBUTION_KEY,
  CYCLE_THRESHOLD,
  TOP_WINNERS,
  SCORE_WEIGHTS,
  CONTRIBUTION_TO_VOTES,
  getMockCycle,
  getMockProjects,
  getMockContributions,
  rankProjects,
  calculateDistribution,
  detectAntiGamingAlerts,
  generateCycleReport,
  type Universe,
  type ProjectScore,
  type AntiGamingAlert,
} from "@/lib/orbit-engine"

const UNIVERSE_CONFIG = {
  audiovisual: { label: "Films & Videos", icon: Film, color: "text-rose-400" },
  literary: { label: "Livres & Articles", icon: BookOpen, color: "text-amber-400" },
  podcast: { label: "Podcasts", icon: Mic, color: "text-emerald-400" },
}

export default function OrbitEnginePage() {
  const [selectedUniverse, setSelectedUniverse] = useState<Universe>("audiovisual")
  const [isSimulating, setIsSimulating] = useState(false)
  
  // Mock data pour demonstration
  const cycle = getMockCycle(selectedUniverse)
  const projects = getMockProjects(selectedUniverse, 100)
  const contributions = getMockContributions(projects.map(p => p.id), 500)
  
  // Calculs du moteur
  const rankedProjects = rankProjects(projects)
  const distribution = calculateDistribution(cycle.id, cycle.totalFunds, rankedProjects, contributions)
  const alerts = detectAntiGamingAlerts(contributions, projects)
  const report = generateCycleReport(cycle, rankedProjects, distribution, alerts)
  
  const top10 = rankedProjects.filter(p => p.rankCategory === "top10")
  const criticalAlerts = alerts.filter(a => a.severity === "critical" || a.severity === "high")
  
  const handleSimulation = () => {
    setIsSimulating(true)
    setTimeout(() => setIsSimulating(false), 2000)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-violet-500/20 to-indigo-500/20 border border-violet-500/30">
              <Orbit className="w-6 h-6 text-violet-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">VIXUAL ORBIT ENGINE</h1>
              <p className="text-white/60 text-sm">Moteur central economique et de classement</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleSimulation}
            disabled={isSimulating}
            className="border-violet-500/30 text-violet-400 hover:bg-violet-500/10"
          >
            {isSimulating ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Play className="w-4 h-4 mr-2" />
            )}
            Simuler cycle
          </Button>
        </div>
      </div>

      {/* Principe du moteur */}
      <Card className="bg-gradient-to-r from-violet-500/10 via-indigo-500/10 to-violet-500/10 border-violet-500/20">
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-violet-400 mt-0.5 shrink-0" />
            <div className="text-sm text-white/70">
              <p className="font-medium text-white mb-1">Principe fondamental</p>
              <p>Les utilisateurs ne parient pas. Ils soutiennent un projet culturel, attribuent des votes et participent au classement. Les redistributions dependent du classement, du succes du projet et du cycle. VIXUAL reste une plateforme de streaming participatif culturel.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Selecteur d'univers */}
      <div className="flex gap-2">
        {(Object.entries(UNIVERSE_CONFIG) as [Universe, typeof UNIVERSE_CONFIG.audiovisual][]).map(([key, config]) => {
          const Icon = config.icon
          return (
            <Button
              key={key}
              variant={selectedUniverse === key ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedUniverse(key)}
              className={selectedUniverse === key ? "bg-violet-600 hover:bg-violet-700" : ""}
            >
              <Icon className={`w-4 h-4 mr-2 ${selectedUniverse === key ? "text-white" : config.color}`} />
              {config.label}
            </Button>
          )
        })}
      </div>

      {/* KPIs principaux */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-slate-900/50 border-white/10">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/50 text-xs">Projets en cycle</p>
                <p className="text-2xl font-bold text-white">{cycle.projectCount}</p>
                <p className="text-xs text-white/40">sur {CYCLE_THRESHOLD}</p>
              </div>
              <div className="p-2 rounded-lg bg-violet-500/10">
                <BarChart3 className="w-5 h-5 text-violet-400" />
              </div>
            </div>
            <Progress value={(cycle.projectCount / CYCLE_THRESHOLD) * 100} className="mt-3 h-1.5" />
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-white/10">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/50 text-xs">Fonds du cycle</p>
                <p className="text-2xl font-bold text-emerald-400">{cycle.totalFunds.toLocaleString()}€</p>
                <p className="text-xs text-white/40">a redistribuer</p>
              </div>
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <Coins className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-white/10">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/50 text-xs">TOP 10 Gagnants</p>
                <p className="text-2xl font-bold text-amber-400">{TOP_WINNERS}</p>
                <p className="text-xs text-white/40">grands gagnants</p>
              </div>
              <div className="p-2 rounded-lg bg-amber-500/10">
                <Trophy className="w-5 h-5 text-amber-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-white/10">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/50 text-xs">Alertes actives</p>
                <p className={`text-2xl font-bold ${criticalAlerts.length > 0 ? "text-rose-400" : "text-emerald-400"}`}>
                  {criticalAlerts.length}
                </p>
                <p className="text-xs text-white/40">{alerts.length} total</p>
              </div>
              <div className={`p-2 rounded-lg ${criticalAlerts.length > 0 ? "bg-rose-500/10" : "bg-emerald-500/10"}`}>
                {criticalAlerts.length > 0 ? (
                  <AlertTriangle className="w-5 h-5 text-rose-400" />
                ) : (
                  <Shield className="w-5 h-5 text-emerald-400" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="distribution" className="space-y-4">
        <TabsList className="bg-slate-900/50 border border-white/10">
          <TabsTrigger value="distribution">Repartition</TabsTrigger>
          <TabsTrigger value="classement">Classement</TabsTrigger>
          <TabsTrigger value="votes">Votes</TabsTrigger>
          <TabsTrigger value="alerts">Alertes</TabsTrigger>
        </TabsList>

        {/* Onglet Repartition */}
        <TabsContent value="distribution" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Cle de repartition officielle */}
            <Card className="bg-slate-900/50 border-white/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-white flex items-center gap-2">
                  <Coins className="w-4 h-4 text-emerald-400" />
                  Cle de repartition officielle
                </CardTitle>
                <CardDescription>Distribution automatique des fonds du cycle</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-rose-400" />
                      <span className="text-white/70 text-sm">Createurs gagnants (TOP 10)</span>
                    </div>
                    <div className="text-right">
                      <span className="text-rose-400 font-bold">{DISTRIBUTION_KEY.creators * 100}%</span>
                      <p className="text-xs text-white/40">{distribution.creatorsShare.toLocaleString()}€</p>
                    </div>
                  </div>
                  <Progress value={DISTRIBUTION_KEY.creators * 100} className="h-2 bg-slate-800" />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-emerald-400" />
                      <span className="text-white/70 text-sm">Contributeurs gagnants</span>
                    </div>
                    <div className="text-right">
                      <span className="text-emerald-400 font-bold">{DISTRIBUTION_KEY.contributors * 100}%</span>
                      <p className="text-xs text-white/40">{distribution.contributorsShare.toLocaleString()}€</p>
                    </div>
                  </div>
                  <Progress value={DISTRIBUTION_KEY.contributors * 100} className="h-2 bg-slate-800" />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-sky-400" />
                      <span className="text-white/70 text-sm">Communaute (rang 11-100)</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sky-400 font-bold">{DISTRIBUTION_KEY.community * 100}%</span>
                      <p className="text-xs text-white/40">{distribution.communityShare.toLocaleString()}€</p>
                    </div>
                  </div>
                  <Progress value={DISTRIBUTION_KEY.community * 100} className="h-2 bg-slate-800" />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-violet-400" />
                      <span className="text-white/70 text-sm">VIXUAL (plateforme)</span>
                    </div>
                    <div className="text-right">
                      <span className="text-violet-400 font-bold">{DISTRIBUTION_KEY.platform * 100}%</span>
                      <p className="text-xs text-white/40">{distribution.platformShare.toLocaleString()}€</p>
                    </div>
                  </div>
                  <Progress value={DISTRIBUTION_KEY.platform * 100} className="h-2 bg-slate-800" />
                </div>

                <div className="pt-3 border-t border-white/10">
                  <div className="flex items-center justify-between">
                    <span className="text-white/50 text-sm">Verification integrite</span>
                    {report.integrityCheck.valid ? (
                      <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Valide
                      </Badge>
                    ) : (
                      <Badge className="bg-rose-500/20 text-rose-400 border-rose-500/30">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        Erreurs
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Score Projet */}
            <Card className="bg-slate-900/50 border-white/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-amber-400" />
                  Formule Score Projet
                </CardTitle>
                <CardDescription>Calcul du classement des projets</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-slate-800/50 rounded-lg p-4 border border-white/5">
                  <p className="text-white/70 text-sm font-mono text-center">
                    Score = (Votes × {SCORE_WEIGHTS.votes * 100}%) + (Financement × {SCORE_WEIGHTS.funding * 100}%) + (Engagement × {SCORE_WEIGHTS.engagement * 100}%)
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg">
                    <div>
                      <p className="text-white font-medium text-sm">Votes ponderes</p>
                      <p className="text-white/50 text-xs">Nombre total de votes recus</p>
                    </div>
                    <Badge variant="outline" className="text-rose-400 border-rose-400/30">
                      {SCORE_WEIGHTS.votes * 100}%
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg">
                    <div>
                      <p className="text-white font-medium text-sm">Financement total</p>
                      <p className="text-white/50 text-xs">Montant des contributions</p>
                    </div>
                    <Badge variant="outline" className="text-emerald-400 border-emerald-400/30">
                      {SCORE_WEIGHTS.funding * 100}%
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg">
                    <div>
                      <p className="text-white font-medium text-sm">Engagement public</p>
                      <p className="text-white/50 text-xs">Vues, lectures, ecoutes, interactions</p>
                    </div>
                    <Badge variant="outline" className="text-sky-400 border-sky-400/30">
                      {SCORE_WEIGHTS.engagement * 100}%
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Onglet Classement */}
        <TabsContent value="classement" className="space-y-4">
          <Card className="bg-slate-900/50 border-white/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-white flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-400" />
                TOP 10 - Grands gagnants du cycle
              </CardTitle>
              <CardDescription>Projets recevant la part principale des gains (40% createurs + 30% contributeurs)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {top10.map((project, index) => (
                  <div 
                    key={project.projectId}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      index < 3 ? "bg-amber-500/10 border border-amber-500/20" : "bg-slate-800/30"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                        index === 0 ? "bg-amber-400 text-slate-900" :
                        index === 1 ? "bg-slate-300 text-slate-900" :
                        index === 2 ? "bg-amber-600 text-white" :
                        "bg-slate-700 text-white"
                      }`}>
                        {project.rank}
                      </div>
                      <div>
                        <p className="text-white font-medium text-sm">{project.projectId}</p>
                        <p className="text-white/50 text-xs">Score global: {project.globalScore}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-xs">
                      <div className="text-center">
                        <p className="text-rose-400 font-medium">{project.votesScore}</p>
                        <p className="text-white/40">Votes</p>
                      </div>
                      <div className="text-center">
                        <p className="text-emerald-400 font-medium">{project.fundingScore}</p>
                        <p className="text-white/40">Financement</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sky-400 font-medium">{project.engagementScore}</p>
                        <p className="text-white/40">Engagement</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Votes */}
        <TabsContent value="votes" className="space-y-4">
          <Card className="bg-slate-900/50 border-white/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-400" />
                Table de conversion Contribution → Votes
              </CardTitle>
              <CardDescription>Les votes sont generes par les contributions financieres</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 gap-2">
                {Object.entries(CONTRIBUTION_TO_VOTES).map(([amount, votes]) => (
                  <div key={amount} className="bg-slate-800/50 rounded-lg p-3 text-center border border-white/5">
                    <p className="text-emerald-400 font-bold text-lg">{amount}€</p>
                    <div className="my-1 text-white/30">↓</div>
                    <p className="text-white font-medium">{votes} vote{votes > 1 ? "s" : ""}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 bg-slate-800/30 rounded-lg">
                <p className="text-white/60 text-sm text-center">
                  Ce systeme encourage le soutien, evite le gaming et reste proportionnel
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Alertes */}
        <TabsContent value="alerts" className="space-y-4">
          <Card className="bg-slate-900/50 border-white/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-white flex items-center gap-2">
                <Shield className="w-4 h-4 text-rose-400" />
                Surveillance Anti-Gaming
              </CardTitle>
              <CardDescription>Detection automatique des anomalies et comportements suspects</CardDescription>
            </CardHeader>
            <CardContent>
              {alerts.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                  <p className="text-white font-medium">Aucune alerte detectee</p>
                  <p className="text-white/50 text-sm">Le cycle est sain</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {alerts.map((alert, index) => (
                    <div 
                      key={index}
                      className={`p-3 rounded-lg border ${
                        alert.severity === "critical" ? "bg-rose-500/10 border-rose-500/30" :
                        alert.severity === "high" ? "bg-amber-500/10 border-amber-500/30" :
                        alert.severity === "medium" ? "bg-yellow-500/10 border-yellow-500/30" :
                        "bg-slate-800/30 border-white/10"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-2">
                          <AlertTriangle className={`w-4 h-4 mt-0.5 ${
                            alert.severity === "critical" ? "text-rose-400" :
                            alert.severity === "high" ? "text-amber-400" :
                            "text-yellow-400"
                          }`} />
                          <div>
                            <p className="text-white font-medium text-sm">{alert.type.replace("_", " ").toUpperCase()}</p>
                            <p className="text-white/60 text-xs mt-1">{alert.description}</p>
                            <p className="text-white/40 text-xs mt-2">
                              {alert.affectedUserIds.length} utilisateur(s) concerne(s) • 
                              {alert.affectedProjectIds.length} projet(s)
                            </p>
                          </div>
                        </div>
                        <Badge className={`text-xs ${
                          alert.severity === "critical" ? "bg-rose-500/20 text-rose-400" :
                          alert.severity === "high" ? "bg-amber-500/20 text-amber-400" :
                          "bg-yellow-500/20 text-yellow-400"
                        }`}>
                          {alert.severity}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
