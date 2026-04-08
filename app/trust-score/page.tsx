"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft,
  Shield,
  ShieldCheck,
  Award,
  TrendingUp,
  Clock,
  Users,
  Wallet,
  Heart,
  Star,
  CheckCircle,
  AlertTriangle,
  Info,
  Sparkles,
} from "lucide-react"
import {
  TrustScoreCard,
  TrustScoreGauge,
  BadgesGrid,
  TrustScoreExplanation,
} from "@/components/trust-score-display"
import { type TrustScore, TRUST_BADGES, type BadgeType } from "@/lib/trust/types"

// Mock data - En production, vient de la base de donnees
const MOCK_TRUST_SCORE: TrustScore = {
  userId: "user_123",
  score: 78,
  level: "very_reliable",
  lastUpdated: new Date().toISOString(),
  components: {
    identityVerified: 22,
    transactionHistory: 16,
    communityParticipation: 12,
    seniority: 10,
    socialBehavior: 8,
    financialReliability: 7,
    communityBonus: 3,
  },
  badges: ["identity_verified", "active_contributor", "recognized_creator"],
  warnings: [],
  riskFlags: [],
}

const TRUST_HISTORY = [
  { date: "10 mars 2026", score: 78, change: +2, reason: "Contribution reussie" },
  { date: "8 mars 2026", score: 76, change: +3, reason: "Badge obtenu" },
  { date: "5 mars 2026", score: 73, change: +1, reason: "Commentaire apprecie" },
  { date: "1 mars 2026", score: 72, change: +5, reason: "Verification identite" },
  { date: "25 fev 2026", score: 67, change: 0, reason: "Inscription" },
]

const TIPS_TO_IMPROVE = [
  {
    icon: <CheckCircle className="h-5 w-5 text-emerald-400" />,
    title: "Verifiez votre identite",
    description: "Confirmez email, telephone et Stripe Connect pour +10 points",
    points: "+10",
    done: true,
  },
  {
    icon: <TrendingUp className="h-5 w-5 text-sky-400" />,
    title: "Effectuez des contributions",
    description: "Chaque contribution reussie ameliore votre historique",
    points: "+1 a +3",
    done: false,
  },
  {
    icon: <Users className="h-5 w-5 text-violet-400" />,
    title: "Participez a la communaute",
    description: "Commentez, partagez et interagissez avec les createurs",
    points: "+1 a +3",
    done: false,
  },
  {
    icon: <Clock className="h-5 w-5 text-amber-400" />,
    title: "Restez actif",
    description: "L'anciennete sans incident augmente votre score",
    points: "+3 a +10",
    done: false,
  },
]

export default function TrustScorePage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/50">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-xl bg-slate-800/50 border border-slate-700/50 text-slate-400 hover:text-white hover:bg-slate-700/50 transition-all"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Shield className="h-6 w-6 text-emerald-400" />
                VIXUAL Trust Score
              </h1>
              <p className="text-sm text-slate-500">
                Votre indicateur de confiance sur la plateforme
              </p>
            </div>
            <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
              Score: {MOCK_TRUST_SCORE.score}/100
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="mb-8">
          <Card className="bg-gradient-to-br from-emerald-900/20 via-slate-800/50 to-teal-900/20 border-emerald-500/20">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <TrustScoreGauge score={MOCK_TRUST_SCORE.score} size="lg" />
                <div className="flex-1 text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                    <ShieldCheck className="h-6 w-6 text-teal-400" />
                    <h2 className="text-2xl font-bold">Profil tres fiable</h2>
                  </div>
                  <p className="text-slate-400 mb-4 max-w-lg">
                    Votre score de confiance de {MOCK_TRUST_SCORE.score}/100 vous place
                    parmi les utilisateurs les plus fiables de VIXUAL. Continuez ainsi!
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                    {MOCK_TRUST_SCORE.badges.map((badge) => (
                      <Badge
                        key={badge}
                        className="bg-slate-700/50 text-slate-200 border-slate-600"
                      >
                        {TRUST_BADGES[badge].displayName}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-slate-800/50 border border-slate-700/50">
            <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
            <TabsTrigger value="badges">Badges</TabsTrigger>
            <TabsTrigger value="history">Historique</TabsTrigger>
            <TabsTrigger value="improve">Ameliorer</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <TrustScoreCard trustScore={MOCK_TRUST_SCORE} />
              <TrustScoreExplanation />
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="bg-slate-800/30 border-slate-700/30">
                <CardContent className="p-4 text-center">
                  <CheckCircle className="h-8 w-8 text-emerald-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">3</p>
                  <p className="text-xs text-slate-400">Badges obtenus</p>
                </CardContent>
              </Card>
              <Card className="bg-slate-800/30 border-slate-700/30">
                <CardContent className="p-4 text-center">
                  <TrendingUp className="h-8 w-8 text-sky-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">+11</p>
                  <p className="text-xs text-slate-400">Points ce mois</p>
                </CardContent>
              </Card>
              <Card className="bg-slate-800/30 border-slate-700/30">
                <CardContent className="p-4 text-center">
                  <Clock className="h-8 w-8 text-amber-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">45j</p>
                  <p className="text-xs text-slate-400">Anciennete</p>
                </CardContent>
              </Card>
              <Card className="bg-slate-800/30 border-slate-700/30">
                <CardContent className="p-4 text-center">
                  <Award className="h-8 w-8 text-violet-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">Top 15%</p>
                  <p className="text-xs text-slate-400">Classement</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Badges Tab */}
          <TabsContent value="badges" className="space-y-6">
            <Card className="bg-slate-800/30 border-slate-700/30">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Award className="h-5 w-5 text-amber-400" />
                  Vos badges de reputation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-400 mb-6">
                  Les badges attestent de votre fiabilite et de votre engagement sur VIXUAL.
                  Certains badges rares sont attribues automatiquement ou par validation VIXUAL.
                </p>
                <BadgesGrid badges={MOCK_TRUST_SCORE.badges} showAll />
              </CardContent>
            </Card>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-6">
            <Card className="bg-slate-800/30 border-slate-700/30">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="h-5 w-5 text-sky-400" />
                  Historique de votre score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {TRUST_HISTORY.map((entry, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg border border-slate-700/50"
                    >
                      <div className="flex items-center gap-4">
                        <div className="text-center min-w-[50px]">
                          <p className="text-lg font-bold text-white">{entry.score}</p>
                          <p className="text-xs text-slate-500">pts</p>
                        </div>
                        <div>
                          <p className="text-sm text-white">{entry.reason}</p>
                          <p className="text-xs text-slate-500">{entry.date}</p>
                        </div>
                      </div>
                      {entry.change !== 0 && (
                        <Badge
                          className={
                            entry.change > 0
                              ? "bg-emerald-500/20 text-emerald-300"
                              : "bg-rose-500/20 text-rose-300"
                          }
                        >
                          {entry.change > 0 ? "+" : ""}
                          {entry.change}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Improve Tab */}
          <TabsContent value="improve" className="space-y-6">
            <Card className="bg-slate-800/30 border-slate-700/30">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-amber-400" />
                  Comment ameliorer votre score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-400 mb-6">
                  Suivez ces conseils pour augmenter votre Trust Score et debloquer
                  de nouveaux badges.
                </p>
                <div className="space-y-3">
                  {TIPS_TO_IMPROVE.map((tip, idx) => (
                    <div
                      key={idx}
                      className={`flex items-start gap-4 p-4 rounded-lg border ${
                        tip.done
                          ? "bg-emerald-900/10 border-emerald-500/30"
                          : "bg-slate-900/50 border-slate-700/50"
                      }`}
                    >
                      <div
                        className={`p-2 rounded-lg ${
                          tip.done ? "bg-emerald-500/20" : "bg-slate-800"
                        }`}
                      >
                        {tip.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-white">{tip.title}</h4>
                          {tip.done && (
                            <Badge className="bg-emerald-500/20 text-emerald-300 text-xs">
                              Fait
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-slate-400 mt-1">{tip.description}</p>
                      </div>
                      <Badge
                        variant="outline"
                        className={
                          tip.done
                            ? "border-emerald-500/50 text-emerald-300"
                            : "border-slate-600 text-slate-400"
                        }
                      >
                        {tip.points}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Warning Section */}
            <Card className="bg-amber-900/10 border-amber-500/30">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <AlertTriangle className="h-6 w-6 text-amber-400 shrink-0" />
                  <div>
                    <h4 className="font-medium text-amber-200 mb-2">
                      Actions a eviter
                    </h4>
                    <ul className="text-sm text-amber-200/70 space-y-1">
                      <li>- Litiges ou contestations de paiement repetees</li>
                      <li>- Signalements pour comportement inapproprie</li>
                      <li>- Spam ou messages non sollicites</li>
                      <li>- Tentatives de fraude ou manipulation</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}
