"use client"

import { useState } from "react"
import {
  Star, Share2, Users, MessageSquare, Calendar, Gift, Trophy, Lock,
  ArrowRight, ShieldAlert, AlertTriangle, CheckCircle2, Zap, ShoppingBag,
  TrendingUp, Info, Sparkles, CreditCard, Package,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/lib/auth-context"
import { MicropacksShop } from "@/components/vixupoints-micropacks"
import {
  VISUPOINTS_CONVERSION_THRESHOLD,
  VISUPOINTS_PER_EUR,
  convertVisupoints,
  VISUPOINTS_PROFILE_CAPS,
  VISUPOINTS_MAX_DAILY,
  HYBRID_BONUS_MONTHLY_CAP,
  INVESTOR_EVOLUTION_BONUS,
} from "@/lib/payout/constants"
import {
  canWithdraw,
  canInvest,
  canConvertVisupoints,
  MINOR_VISUPOINTS_CAP,
  engagementRedirectEngine,
  computeHybridPurchase,
  type EngagementRedirectResult,
} from "@/lib/visupoints-engine"

// ─── Missions ───

const MISSIONS = [
  { id: 1, title: "Parrainez un ami", description: "Invitez un ami a rejoindre VIXUAL", points: 50, icon: Users, completed: false },
  { id: 2, title: "Partagez un projet", description: "Partagez un projet sur les reseaux sociaux", points: 25, icon: Share2, completed: true },
  { id: 3, title: "Commentez", description: "Laissez un commentaire constructif", points: 10, icon: MessageSquare, completed: false },
  { id: 4, title: "Connexion quotidienne", description: "Connectez-vous chaque jour", points: 5, icon: Calendar, completed: true },
]

// ─── Niveaux ───

const LEVELS = [
  { name: "Bronze", min: 0, max: 500, color: "text-orange-400" },
  { name: "Argent", min: 500, max: 1500, color: "text-slate-300" },
  { name: "Or", min: 1500, max: 3500, color: "text-amber-400" },
  { name: "Platine", min: 3500, max: 7000, color: "text-cyan-300" },
  { name: "Diamant", min: 7000, max: Infinity, color: "text-indigo-400" },
]

const REWARDS = [
  { level: "Bronze", reward: "Badge Bronze + Acc\u00e8s prioritaire aux nouveaut\u00e9s" },
  { level: "Argent", reward: "Badge Argent + 5% de r\u00e9duction sur les commissions" },
  { level: "Or", reward: "Badge Or + 10% de r\u00e9duction + Support prioritaire" },
  { level: "Platine", reward: "Badge Platine + 15% de r\u00e9duction + Acc\u00e8s anticip\u00e9" },
  { level: "Diamant", reward: "Badge Diamant + 20% de r\u00e9duction + VIP exclusif" },
]

// ─── Composant EngagementBanner ───

function EngagementBanner({ redirect }: { redirect: EngagementRedirectResult }) {
  const borderColor = redirect.level === "critical"
    ? "border-red-500/40"
    : redirect.level === "warning"
      ? "border-amber-500/40"
      : "border-sky-500/30"
  const bgColor = redirect.level === "critical"
    ? "bg-red-500/10"
    : redirect.level === "warning"
      ? "bg-amber-500/10"
      : "bg-sky-500/10"
  const iconColor = redirect.level === "critical"
    ? "text-red-400"
    : redirect.level === "warning"
      ? "text-amber-400"
      : "text-sky-400"

  return (
    <Card className={`${bgColor} ${borderColor}`}>
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <div className={`w-10 h-10 rounded-lg bg-black/20 flex items-center justify-center shrink-0`}>
            <Zap className={`h-5 w-5 ${iconColor}`} />
          </div>
          <div className="flex-1 space-y-3">
            <div>
              <p className="text-white font-semibold">{redirect.title}</p>
              <p className="text-white/60 text-sm mt-1">{redirect.message}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {redirect.showPathA && (
                <div className="bg-black/20 rounded-xl p-4 border border-white/5">
                  <div className="flex items-center gap-2 mb-2">
                    <ShoppingBag className="h-4 w-4 text-emerald-400" />
                    <p className="text-white font-medium text-sm">{"Chemin A \u2014 Consommer du contenu"}</p>
                  </div>
                  <p className="text-white/50 text-xs leading-relaxed mb-3">
                    {"Utilisez vos VIXUpoints pour acc\u00e9der \u00e0 du contenu audiovisuel ou litt\u00e9raire. Paiement hybride : minimum 30% en euros, jusqu'\u00e0 70% en VIXUpoints."}
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-emerald-500/10 rounded-lg p-2 text-center">
                      <p className="text-emerald-400 font-bold text-sm">30%</p>
                      <p className="text-white/40 text-xs">min. euros</p>
                    </div>
                    <ArrowRight className="h-3 w-3 text-white/30" />
                    <div className="flex-1 bg-amber-500/10 rounded-lg p-2 text-center">
                      <p className="text-amber-400 font-bold text-sm">70%</p>
                      <p className="text-white/40 text-xs">max. VIXUpoints</p>
                    </div>
                  </div>
                  <p className="text-emerald-400/60 text-xs mt-2 flex items-center gap-1">
                    <Sparkles className="h-3 w-3" />
                    {"Bonus : +5% des points d\u00e9pens\u00e9s (max " + HYBRID_BONUS_MONTHLY_CAP + "/mois)"}
                  </p>
                  <Button size="sm" className="mt-3 w-full bg-emerald-600 hover:bg-emerald-500 text-white">
                    {"D\u00e9couvrir les contenus"}
                  </Button>
                </div>
              )}

              {redirect.showPathB && (
                <div className="bg-black/20 rounded-xl p-4 border border-white/5">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-4 w-4 text-purple-400" />
                    <p className="text-white font-medium text-sm">{"Chemin B \u2014 \u00c9voluer de profil"}</p>
                  </div>
                  <p className="text-white/50 text-xs leading-relaxed mb-3">
                    {"Passez au profil Contributeur pour d\u00e9bloquer les fonctionnalit\u00e9s avanc\u00e9es : investir dans des projets, voter, et percevoir des gains."}
                  </p>
                  <div className="bg-purple-500/10 rounded-lg p-3">
                    <p className="text-purple-400 font-medium text-sm mb-1">{"Bonus \u00e9volution"}</p>
                    <p className="text-white/60 text-xs">
                      {"Recevez +" + INVESTOR_EVOLUTION_BONUS + " VIXUpoints et le d\u00e9blocage du plafond en devenant Contributeur."}
                    </p>
                  </div>
                  <Button size="sm" variant="outline" className="mt-3 w-full border-purple-500/40 text-purple-400 hover:bg-purple-500/20">
                    {"Passer Contributeur"}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Composant HybridSimulator ───

function HybridSimulator({ userPoints }: { userPoints: number }) {
  const [priceCents, setPriceCents] = useState(500) // cinq euros par defaut
  const purchase = computeHybridPurchase(priceCents, userPoints)

  return (
    <Card className="bg-slate-900/50 border-white/10">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-emerald-400" />
          {"Simulateur de paiement hybride"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-white/50 text-sm">
          {"Visualisez la r\u00e9partition entre euros et VIXUpoints pour l'achat d'un contenu. La r\u00e8gle : minimum 30% en euros, maximum 70% en VIXUpoints."}
        </p>

        <div className="flex items-center gap-4">
          <label className="text-white/60 text-sm shrink-0">{"Prix du contenu :"}</label>
          <div className="flex items-center gap-2">
            {[200, 300, 500, 700, 1000].map((p) => (
              <button
                key={p}
                onClick={() => setPriceCents(p)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  priceCents === p
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-800 text-white/60 hover:bg-slate-700"
                }`}
              >
                {(p / 100).toFixed(0) + "\u20ac"}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-black/30 rounded-xl p-4 border border-white/5">
            <p className="text-white/40 text-xs">{"Minimum cash"}</p>
            <p className="text-white font-bold text-lg mt-1">{(purchase.cashCents / 100).toFixed(2) + "\u20ac"}</p>
          </div>
          <div className="bg-black/30 rounded-xl p-4 border border-white/5">
            <p className="text-white/40 text-xs">{"Points utilis\u00e9s"}</p>
            <p className="text-amber-400 font-bold text-lg mt-1">{purchase.pointsUsed + " pts"}</p>
          </div>
          <div className="bg-black/30 rounded-xl p-4 border border-white/5">
            <p className="text-white/40 text-xs">{"Bonus gagn\u00e9"}</p>
            <p className="text-emerald-400 font-bold text-lg mt-1">{"+" + purchase.bonusEarned + " pts"}</p>
          </div>
          <div className="bg-black/30 rounded-xl p-4 border border-white/5">
            <p className="text-white/40 text-xs">{"Points restants"}</p>
            <p className="text-white font-bold text-lg mt-1">{purchase.remainingPoints + " pts"}</p>
          </div>
        </div>

        <div className="bg-amber-500/5 border border-amber-500/15 rounded-lg p-3">
          <p className="text-amber-400/70 text-xs flex items-center gap-1.5">
            <Info className="h-3.5 w-3.5 shrink-0" />
            {"Le paiement 100% VIXUpoints n'est pas autoris\u00e9. Ce mod\u00e8le garantit un \u00e9quilibre \u00e9conomique durable pour les cr\u00e9ateurs et la plateforme."}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Composant ProfileTable ───

function ProfileTable() {
  return (
    <Card className="bg-slate-900/50 border-white/10">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Users className="h-5 w-5 text-sky-400" />
          {"VIXUpoints par profil"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left text-white/50 font-medium py-2 pr-4">Profil</th>
                <th className="text-center text-white/50 font-medium py-2 px-2">Plafond</th>
                <th className="text-center text-white/50 font-medium py-2 px-2">Type</th>
                <th className="text-center text-white/50 font-medium py-2 px-2">{"Convertible ?"}</th>
                <th className="text-left text-white/50 font-medium py-2 pl-2">Objectif</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {Object.entries(VISUPOINTS_PROFILE_CAPS).map(([key, profile]) => (
                <tr key={key}>
                  <td className="py-2.5 pr-4 text-white font-medium">{profile.label}</td>
                  <td className="py-2.5 px-2 text-center">
                    {profile.cap === null ? (
                      <span className="text-white/30">{"\u2014"}</span>
                    ) : (
                      <span className="text-amber-400 font-mono">{profile.cap.toLocaleString("fr-FR")}</span>
                    )}
                  </td>
                  <td className="py-2.5 px-2 text-center">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      profile.capType === "monthly" ? "bg-sky-500/15 text-sky-400" :
                      profile.capType === "total" ? "bg-amber-500/15 text-amber-400" :
                      "bg-slate-700 text-white/40"
                    }`}>
                      {profile.capType === "monthly" ? "/mois" : profile.capType === "total" ? "total" : "n/a"}
                    </span>
                  </td>
                  <td className="py-2.5 px-2 text-center">
                    {profile.convertible ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 mx-auto" />
                    ) : (
                      <Lock className="h-4 w-4 text-white/20 mx-auto" />
                    )}
                  </td>
                  <td className="py-2.5 pl-2 text-white/50 text-xs">{profile.objective}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex items-center gap-4 text-xs text-white/30">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-500/40" />
            {"Max journalier recommand\u00e9 : " + VISUPOINTS_MAX_DAILY + " pts"}
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500/40" />
            {"100 VIXUpoints = 1\u20ac"}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Page principale ───

export default function VisupointsPage() {
  const { user } = useAuth()
  const currentPoints = user?.visupoints || 150
  const userIsMinor = user?.isMinor ?? false
  const kycVerified = user?.kycVerified ?? false
  const userRole = user?.roles?.[0] || "visitor"

  // Restrictions
  const withdrawStatus = canWithdraw(userIsMinor, kycVerified)
  const convertStatus = canConvertVisupoints(userIsMinor)
  const conversion = convertVisupoints(currentPoints)

  // Engagement Redirect Engine
  const engagementRedirect = engagementRedirectEngine(userRole, currentPoints, userIsMinor)

  // Plafond et niveaux
  const cap = userIsMinor ? MINOR_VISUPOINTS_CAP : (userRole === "visitor" ? 2500 : null)
  const capProgress = cap ? Math.min((currentPoints / cap) * 100, 100) : null

  const currentLevel = LEVELS.find(
    (l) => currentPoints >= l.min && currentPoints < l.max
  ) || LEVELS[0]
  const nextLevel = LEVELS[LEVELS.indexOf(currentLevel) + 1]
  const progress = nextLevel
    ? ((currentPoints - currentLevel.min) / (nextLevel.min - currentLevel.min)) * 100
    : 100

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Mes VIXUpoints</h1>
        <p className="text-white/60">
          {"Gagnez des points, consommez du contenu et évoluez sur VIXUAL"}
        </p>
      </div>

      {/* Alerte Mineur */}
      {userIsMinor && (
        <Card className="bg-amber-500/10 border-amber-500/30">
          <CardContent className="p-5 flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center shrink-0">
              <ShieldAlert className="h-5 w-5 text-amber-400" />
            </div>
            <div className="space-y-2">
              <p className="text-white font-medium">{"Compte mineur (16\u201317 ans)"}</p>
              <ul className="text-white/60 text-sm space-y-1">
                <li className="flex items-center gap-2">
                  <Lock className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                  {"Plafond : 10 000 VIXUpoints (100\u20ac) \u2014 bloqu\u00e9 jusqu'\u00e0 18 ans"}
                </li>
                <li className="flex items-center gap-2">
                  <Lock className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                  {"Aucun retrait, investissement ni conversion avant la majorit\u00e9"}
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  {"Vos VIXUpoints sont conserv\u00e9s et seront d\u00e9bloqu\u00e9s \u00e0 vos 18 ans"}
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Engagement Redirect Banner */}
      {engagementRedirect && <EngagementBanner redirect={engagementRedirect} />}

      {/* Current Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-amber-900/30 to-orange-900/30 border-amber-500/30 md:col-span-2">
          <CardContent className="p-6">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-full bg-amber-500/20 flex items-center justify-center">
                <Star className="h-10 w-10 text-amber-400" />
              </div>
              <div className="flex-1">
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-4xl font-bold text-white">
                    {currentPoints.toLocaleString("fr-FR")}
                  </span>
                  <span className="text-white/60">VIXUpoints</span>
                  {cap && (
                    <span className="text-amber-400/70 text-sm">{"/ " + cap.toLocaleString("fr-FR")}</span>
                  )}
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <span className={`font-medium ${currentLevel.color}`}>
                    {"Niveau " + currentLevel.name}
                  </span>
                  {nextLevel && (
                    <span className="text-white/40">
                      {"\u2192 " + (nextLevel.min - currentPoints).toLocaleString("fr-FR") + " pts pour " + nextLevel.name}
                    </span>
                  )}
                </div>
                <Progress value={progress} className="h-2 bg-slate-800" />

                {/* Barre plafond */}
                {capProgress !== null && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs text-white/40 mb-1">
                      <span>{userIsMinor ? "Plafond mineur" : "Plafond visiteur"}</span>
                      <span>{Math.round(capProgress) + "%"}</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full transition-all ${capProgress >= 90 ? "bg-red-500" : capProgress >= 70 ? "bg-amber-500" : "bg-emerald-500"}`}
                        style={{ width: `${capProgress}%` }}
                      />
                    </div>
                    {capProgress >= 80 && !userIsMinor && (
                      <p className="text-amber-400/70 text-xs mt-1">
                        {"Plafond bient\u00f4t atteint. Utilisez vos points ou \u00e9voluez votre profil !"}
                      </p>
                    )}
                  </div>
                )}

                <div className="mt-3 flex gap-3 text-xs text-white/30">
                  <span>{"Max journalier : " + VISUPOINTS_MAX_DAILY + " pts"}</span>
                  <span>{"100 pts = 1\u20ac"}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-white/10">
          <CardContent className="p-6 flex flex-col items-center justify-center h-full text-center">
            <Trophy className="h-10 w-10 text-emerald-400 mb-3" />
            <p className="text-white font-medium">Avantage actuel</p>
            <p className="text-sm text-white/60 mt-1">
              {REWARDS.find((r) => r.level === currentLevel.name)?.reward}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Simulateur Paiement Hybride */}
      <HybridSimulator userPoints={currentPoints} />

      {/* Micro-Packs VIXUpoints */}
      <Card className="bg-slate-900/50 border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Package className="h-5 w-5 text-amber-400" />
            Acheter des VIXUpoints
          </CardTitle>
        </CardHeader>
        <CardContent>
          <MicropacksShop
            userProfile={userIsMinor ? "visitor_minor" : userRole}
            currentBalance={currentPoints}
            isMinor={userIsMinor}
          />
        </CardContent>
      </Card>

      {/* Conversion Card */}
      <Card className="bg-slate-900/50 border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <ArrowRight className="h-5 w-5 text-emerald-400" />
            {"Conversion en cr\u00e9dit interne"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-black/30 rounded-xl p-4 border border-white/5">
              <p className="text-white/50 text-sm">Taux</p>
              <p className="text-white font-bold text-lg mt-1">{VISUPOINTS_PER_EUR + " pts = 1\u20ac"}</p>
            </div>
            <div className="bg-black/30 rounded-xl p-4 border border-white/5">
              <p className="text-white/50 text-sm">Seuil minimum</p>
              <p className="text-white font-bold text-lg mt-1">{VISUPOINTS_CONVERSION_THRESHOLD.toLocaleString("fr-FR") + " pts"}</p>
              <p className="text-white/40 text-xs mt-0.5">{(VISUPOINTS_CONVERSION_THRESHOLD / VISUPOINTS_PER_EUR) + "\u20ac"}</p>
            </div>
            <div className="bg-black/30 rounded-xl p-4 border border-white/5">
              <p className="text-white/50 text-sm">Montant convertible</p>
              {convertStatus.allowed ? (
                <>
                  <p className="text-emerald-400 font-bold text-lg mt-1">{conversion.eurosConverted + "\u20ac"}</p>
                  <p className="text-white/40 text-xs mt-0.5">{conversion.pointsRemaining + " pts restants"}</p>
                </>
              ) : (
                <div className="mt-1 flex items-center gap-2">
                  <Lock className="h-4 w-4 text-amber-400" />
                  <p className="text-amber-400/80 text-sm">{"Bloqu\u00e9"}</p>
                </div>
              )}
            </div>
          </div>

          {!convertStatus.allowed && convertStatus.reason && (
            <div className="mt-4 bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
              <p className="text-amber-400/80 text-sm">{convertStatus.reason}</p>
            </div>
          )}

          {convertStatus.allowed && conversion.eligibleForConversion && (
            <div className="mt-4 flex items-center gap-3">
              <Button className="bg-emerald-600 hover:bg-emerald-500 text-white">
                {"Convertir " + conversion.eurosConverted + "\u20ac en cr\u00e9dit interne"}
              </Button>
              <p className="text-white/40 text-xs">
                {"Le crédit sera ajouté à votre Wallet VIXUAL."}
              </p>
            </div>
          )}

          {!withdrawStatus.allowed && !userIsMinor && withdrawStatus.reason && (
            <div className="mt-3 bg-sky-500/10 border border-sky-500/20 rounded-lg p-3 flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-sky-400 shrink-0 mt-0.5" />
              <p className="text-sky-400/80 text-sm">{withdrawStatus.reason}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tableau des profils */}
      <ProfileTable />

      {/* Missions */}
      <Card className="bg-slate-900/50 border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Gift className="h-5 w-5 text-emerald-400" />
            Missions disponibles
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {MISSIONS.map((mission) => (
            <div
              key={mission.id}
              className={`flex items-center gap-4 p-4 rounded-lg ${
                mission.completed
                  ? "bg-emerald-500/10 border border-emerald-500/30"
                  : "bg-slate-800/50"
              }`}
            >
              <div
                className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  mission.completed ? "bg-emerald-500/20" : "bg-slate-700"
                }`}
              >
                <mission.icon
                  className={`h-6 w-6 ${
                    mission.completed ? "text-emerald-400" : "text-white/60"
                  }`}
                />
              </div>
              <div className="flex-1">
                <p
                  className={`font-medium ${
                    mission.completed ? "text-emerald-400" : "text-white"
                  }`}
                >
                  {mission.title}
                </p>
                <p className="text-sm text-white/60">{mission.description}</p>
              </div>
              <div className="text-right">
                <span className="text-amber-400 font-bold">
                  {"+" + mission.points + " pts"}
                </span>
                {mission.completed ? (
                  <p className="text-xs text-emerald-400">{"Compl\u00e9t\u00e9"}</p>
                ) : (
                  <Button
                    size="sm"
                    className="mt-1 bg-emerald-600 hover:bg-emerald-500 text-white"
                  >
                    Faire
                  </Button>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Levels */}
      <Card className="bg-slate-900/50 border-white/10">
        <CardHeader>
          <CardTitle className="text-white">{"Niveaux et r\u00e9compenses"}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {LEVELS.filter((l) => l.max !== Infinity).map((level) => {
              const reward = REWARDS.find((r) => r.level === level.name)
              const isCurrentOrPast = currentPoints >= level.min
              return (
                <div
                  key={level.name}
                  className={`flex items-center gap-4 p-3 rounded-lg ${
                    currentLevel.name === level.name
                      ? "bg-emerald-500/10 border border-emerald-500/30"
                      : isCurrentOrPast
                        ? "bg-slate-800/30"
                        : "bg-slate-800/50"
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      isCurrentOrPast ? "bg-emerald-500/20" : "bg-slate-700"
                    }`}
                  >
                    <Star
                      className={`h-5 w-5 ${
                        isCurrentOrPast ? level.color : "text-white/40"
                      }`}
                    />
                  </div>
                  <div className="flex-1">
                    <p className={`font-medium ${level.color}`}>{level.name}</p>
                    <p className="text-xs text-white/40">
                      {level.min.toLocaleString("fr-FR") + " - " + level.max.toLocaleString("fr-FR") + " pts"}
                    </p>
                  </div>
                  <p className="text-sm text-white/60 max-w-xs text-right">
                    {reward?.reward}
                  </p>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Note juridique VIXUpoints */}
      <div className="bg-slate-800/30 rounded-xl p-4 border border-white/5 text-center">
        <p className="text-white/30 text-xs leading-relaxed">
          {"Les VIXUpoints constituent un avantage promotionnel interne à VIXUAL. Ils ne représentent pas une créance financière exigible ni une monnaie électronique au sens de la directive 2009/110/CE. Le paiement 100% VIXUpoints n'est pas autorisé. La conversion en euros est soumise aux conditions définies dans les "}
          <a href="/legal/cgv" className="text-emerald-400/50 hover:text-emerald-400/70 underline underline-offset-2">CGV</a>
          {" et les "}
          <a href="/legal/terms" className="text-emerald-400/50 hover:text-emerald-400/70 underline underline-offset-2">CGU</a>
          {" de la plateforme."}
        </p>
      </div>
    </div>
  )
}
