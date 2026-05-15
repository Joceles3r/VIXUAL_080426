"use client"

import Link from "next/link"
import { VisualSlogan } from "@/components/vixual-slogan"
import {
  Star,
  Heart,
  Film,
  FileText,
  Mic,
  Wallet,
  TrendingUp,
  Upload,
  ArrowRight,
  Compass,
  AlertCircle,
  CreditCard,
  Shield,
  ShieldAlert,
  Lock,
  LogOut,
  Sparkles,
  HelpCircle,
  Trophy,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useAuth } from "@/lib/auth-context"
import { MOCK_INVESTMENTS, MOCK_TRANSACTIONS, USER_RANKINGS, LEADERBOARD_CATEGORIES } from "@/lib/mock-data"
import { MINOR_VIXUPOINTS_CAP } from "@/lib/payout/constants"
import { ParentalConsentForm } from "@/components/parental-consent-form"
import { CommunityCharter } from "@/components/community-charter"
import { ReportButton } from "@/components/report-button"
import { TrustScoreCard } from "@/components/trust-score-display"
import { type TrustScore } from "@/lib/trust"
import { CreatorProgressCard } from "@/components/creator-progress-card"

// Mock Trust Score pour le dashboard
const MOCK_USER_TRUST_SCORE: TrustScore = {
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
  badges: ["identity_verified", "active_contributor"],
  warnings: [],
  riskFlags: [],
}

export default function DashboardPage() {
  const { user, roles, isAuthed, logout } = useAuth()

  if (!isAuthed) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mb-6">
          <Compass className="h-8 w-8 text-emerald-400" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-4">
          Connectez-vous pour accéder à votre espace
        </h1>
        <p className="text-white/60 mb-8 max-w-md">
          Créez un compte ou connectez-vous pour accéder à toutes les
          fonctionnalités de VIXUAL
        </p>
        <div className="flex gap-4">
          <Link href="/login">
            <Button
              variant="outline"
              className="bg-transparent border-white/20 text-white hover:bg-white/10"
            >
              Se connecter
            </Button>
          </Link>
          <Link href="/signup">
            <Button className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white">
              Créer un compte
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  // VERROU FINAL: cles officielles uniquement
  const isVisitor = roles.includes("visitor")
  const isCreator = roles.includes("creator")
  const isContributor = roles.includes("contributor")
  const isInfoporteur = roles.includes("infoporteur")
  const isContribuLecteur = roles.includes("contribu_lecteur")
  const isPodcasteur = roles.includes("podcasteur")
  const isAuditeur = roles.includes("auditeur")
  const hasCreatorRole = isCreator || isInfoporteur || isPodcasteur
  const hasContributorRole = isContributor || isContribuLecteur || isAuditeur

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-2">
            <h1 className="text-3xl font-bold text-white">
              Bienvenue, {user?.name || "Utilisateur"}
            </h1>
            <span className="hidden sm:block text-white/15">|</span>
            <VisualSlogan size="xs" opacity="medium" />
          </div>
          <p className="text-white/60">
            {"Voici un aper\u00e7u de votre activit\u00e9 sur VIXUAL"}
          </p>
        </div>
        <Button
          onClick={logout}
          variant="outline"
          className="shrink-0 border-red-500/25 text-red-400 hover:bg-red-500/10 hover:text-red-300 gap-2"
        >
          <LogOut className="h-4 w-4" />
          {"D\u00e9connexion"}
        </Button>
      </div>

      {/* Bloc Comprendre VIXUAL - Onboarding universel */}
      <Card className="bg-gradient-to-r from-emerald-500/10 via-slate-900/50 to-purple-500/10 border-emerald-500/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg text-white flex items-center gap-2">
            <Compass className="h-5 w-5 text-emerald-400" />
            Comprendre VIXUAL rapidement
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-white/70 text-sm">
            VIXUAL est une plateforme de streaming participative. Voici comment ca fonctionne :
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-8 w-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <Film className="h-4 w-4 text-emerald-400" />
                </div>
                <span className="font-medium text-white text-sm">Decouvrir</span>
              </div>
              <p className="text-white/50 text-xs">Regardez des films, lisez des ecrits, ecoutez des podcasts.</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-8 w-8 rounded-full bg-amber-500/20 flex items-center justify-center">
                  <CreditCard className="h-4 w-4 text-amber-400" />
                </div>
                <span className="font-medium text-white text-sm">Participer</span>
              </div>
              <p className="text-white/50 text-xs">Contribuez aux projets et obtenez des votes pour le classement.</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-8 w-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-purple-400" />
                </div>
                <span className="font-medium text-white text-sm">Gagner</span>
              </div>
              <p className="text-white/50 text-xs">Les meilleurs projets redistribuent les gains aux participants.</p>
            </div>
          </div>
          
          {/* Actions rapides selon profil */}
          <div className="pt-2 border-t border-white/10">
            <p className="text-white/50 text-xs mb-3">Commencer maintenant :</p>
            <div className="flex flex-wrap gap-2">
              <Link href="/explore">
                <Button size="sm" variant="outline" className="bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20 h-8 text-xs">
                  <Film className="h-3 w-3 mr-1" />
                  Explorer
                </Button>
              </Link>
              {!hasCreatorRole && (
                <Link href="/guide-profiles">
                  <Button size="sm" variant="outline" className="bg-purple-500/10 border-purple-500/30 text-purple-300 hover:bg-purple-500/20 h-8 text-xs">
                    <Upload className="h-3 w-3 mr-1" />
                    Devenir createur
                  </Button>
                </Link>
              )}
              {hasCreatorRole && (
                <Link href="/dashboard/projects">
                  <Button size="sm" variant="outline" className="bg-purple-500/10 border-purple-500/30 text-purple-300 hover:bg-purple-500/20 h-8 text-xs">
                    <Upload className="h-3 w-3 mr-1" />
                    Publier un contenu
                  </Button>
                </Link>
              )}
              <Link href="/faq">
                <Button size="sm" variant="outline" className="bg-slate-500/10 border-slate-500/30 text-slate-300 hover:bg-slate-500/20 h-8 text-xs">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  FAQ
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Message de bienvenue pour nouveaux utilisateurs */}
      {user && !hasContributorRole && !hasCreatorRole && (
        <Card className="bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-cyan-500/10 border-emerald-500/20">
          <CardContent className="p-5">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                <Sparkles className="h-6 w-6 text-emerald-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-2">Bienvenue sur VIXUAL</h3>
                <p className="text-white/70 text-sm mb-4">Voici vos premieres actions pour bien demarrer :</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Link href="/explore" className="flex items-center gap-2 p-3 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition-colors">
                    <div className="h-8 w-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                      <Film className="h-4 w-4 text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">1. Decouvrir</p>
                      <p className="text-white/50 text-xs">Explorer les contenus</p>
                    </div>
                  </Link>
                  <Link href="/guide-profiles" className="flex items-center gap-2 p-3 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition-colors">
                    <div className="h-8 w-8 rounded-full bg-amber-500/20 flex items-center justify-center">
                      <TrendingUp className="h-4 w-4 text-amber-400" />
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">2. Participer</p>
                      <p className="text-white/50 text-xs">Choisir un profil</p>
                    </div>
                  </Link>
                  <Link href="/faq" className="flex items-center gap-2 p-3 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition-colors">
                    <div className="h-8 w-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                      <HelpCircle className="h-4 w-4 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">3. Comprendre</p>
                      <p className="text-white/50 text-xs">Lire la FAQ</p>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stripe Connect Banner */}
      {(hasContributorRole || hasCreatorRole) &&
        user?.stripeConnect?.status !== "verified" && (
          <Card className="bg-gradient-to-r from-[#635BFF]/10 to-[#635BFF]/5 border-[#635BFF]/30">
            <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#635BFF]/20 flex items-center justify-center shrink-0">
                  <CreditCard className="h-5 w-5 text-[#635BFF]" />
                </div>
                <div>
                  <p className="text-white font-medium text-sm">
                    {user?.stripeConnect?.status === "pending"
                      ? "Verification Stripe en cours"
                      : "Connectez Stripe pour retirer vos gains"}
                  </p>
                  <p className="text-white/50 text-xs">
                    {"Vérification d'identité requise pour recevoir des paiements. Retraits traités chaque semaine."}
                  </p>
                </div>
              </div>
              <Link href="/dashboard/wallet" className="shrink-0">
                <Button
                  size="sm"
                  className="bg-[#635BFF] hover:bg-[#5851DB] text-white"
                >
                  {user?.stripeConnect?.status === "pending"
                    ? "Reprendre"
                    : "Connecter Stripe"}
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

      {/* Creator Progression Module */}
      {hasCreatorRole && user?.id && (
        <CreatorProgressCard 
          userId={user.id}
          creatorType={isCreator ? "creator" : isInfoporteur ? "infoporteur" : "podcasteur"}
        />
      )}

      {/* Caution Reminder */}
      {hasCreatorRole &&
        user?.depositStatus &&
        ((!user.depositStatus.creator10 && isCreator) ||
          (!user.depositStatus.infoporteur10 && isInfoporteur) ||
          (!user.depositStatus.podcasteur10 && isPodcasteur)) && (
          <Card className="bg-amber-500/10 border-amber-500/30">
            <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center shrink-0">
                  <Shield className="h-5 w-5 text-amber-400" />
                </div>
                <div>
                  <p className="text-white font-medium text-sm">
                    {"Caution créateur requise"}
                  </p>
                  <p className="text-white/50 text-xs">
                    {"Payez votre caution de 10€ pour pouvoir publier vos contenus. Remboursable en cas de résiliation."}
                  </p>
                </div>
              </div>
              <Link href="/dashboard/wallet" className="shrink-0">
                <Button
                  size="sm"
                  className="bg-amber-600 hover:bg-amber-500 text-white"
                >
                  {"Payer la caution"}
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

      {/* Minor Account Banner */}
      {user?.isMinor && (
        <Card className="bg-amber-500/10 border-amber-500/30">
          <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center shrink-0">
                <ShieldAlert className="h-5 w-5 text-amber-400" />
              </div>
              <div>
                <p className="text-white font-medium text-sm">
                  {"Compte mineur (16\u201317 ans)"}
                </p>
                <p className="text-white/50 text-xs">
                  {"Plafond : " + MINOR_VIXUPOINTS_CAP.toLocaleString() + " VIXUpoints (100\u20ac). Contributions et retraits bloques jusqu'a 18 ans."}
                </p>
              </div>
            </div>
            {user.parentConsent?.status === "required" && (
              <span className="text-xs bg-red-500/20 text-red-400 px-3 py-1 rounded-full border border-red-500/30">
                Consentement parental requis
              </span>
            )}
            {user.parentConsent?.status === "pending" && (
              <span className="text-xs bg-amber-500/20 text-amber-400 px-3 py-1 rounded-full border border-amber-500/30">
                {"Consentement en attente de v\u00e9rification"}
              </span>
            )}
            {user.parentConsent?.status === "verified" && (
              <span className="text-xs bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/30">
                {"Consentement v\u00e9rifi\u00e9"}
              </span>
            )}
          </CardContent>
        </Card>
      )}

      {/* Parental Consent Form (if required) */}
      {user?.isMinor && user.parentConsent?.status === "required" && (
        <ParentalConsentForm userId={user.id} />
      )}

      {/* Community Charter Reminder */}
      <CommunityCharter dismissible={true} />

      {/* Trust Score Widget */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TrustScoreCard trustScore={MOCK_USER_TRUST_SCORE} />
        <Card className="bg-gradient-to-br from-emerald-900/20 to-teal-900/20 border-emerald-500/20">
          <CardContent className="p-6 flex flex-col justify-between h-full">
            <div>
              <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                <Shield className="h-5 w-5 text-emerald-400" />
                VIXUAL Trust System
              </h3>
              <p className="text-sm text-slate-400 mb-4">
                Votre score de confiance evolue selon votre comportement sur la plateforme. 
                Un score eleve vous permet d'acceder a des avantages exclusifs et renforce 
                la confiance des autres utilisateurs.
              </p>
            </div>
            <Link href="/trust-score">
              <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
                Voir mon Trust Score complet
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Report quick-access */}
      <Card className="bg-red-500/5 border-red-500/15">
        <CardContent className="p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center shrink-0">
              <ShieldAlert className="h-5 w-5 text-red-400" />
            </div>
            <div>
              <p className="text-white/80 text-sm font-medium">{"Signaler un contenu inappropri\u00e9"}</p>
              <p className="text-white/40 text-xs">{"Racisme, homophobie, harc\u00e8lement, violence... Signalez en toute confidentialit\u00e9."}</p>
            </div>
          </div>
          <ReportButton
            targetId="general"
            targetType="content"
            targetName="Signalement depuis le tableau de bord"
            variant="full"
            size="sm"
          />
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* VIXUpoints - for all (with cap for minors) */}
        <Card className="bg-slate-900/50 border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-amber-500/20 flex items-center justify-center">
                <Star className="h-6 w-6 text-amber-400" />
              </div>
              <div>
                <p className="text-white/60 text-sm">VIXUpoints</p>
                <p className="text-2xl font-bold text-white">
                  {user?.visupoints || 0}
                  {user?.isMinor && (
                    <span className="text-sm font-normal text-white/40 ml-1">
                      {"/ " + MINOR_VIXUPOINTS_CAP.toLocaleString()}
                    </span>
                  )}
                </p>
                {user?.isMinor && (
                  <div className="mt-2">
                    <Progress
                      value={((user.visupoints || 0) / MINOR_VIXUPOINTS_CAP) * 100}
                      className="h-1.5 bg-white/10"
                    />
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Favorites */}
        <Card className="bg-slate-900/50 border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-red-500/20 flex items-center justify-center">
                <Heart className="h-6 w-6 text-red-400" />
              </div>
              <div>
                <p className="text-white/60 text-sm">Favoris</p>
                <p className="text-2xl font-bold text-white">12</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Investments or Projects count based on role */}
        {hasContributorRole && (
          <Card className="bg-slate-900/50 border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-emerald-400" />
                </div>
                <div>
                  <p className="text-white/60 text-sm">Soutiens</p>
                  <p className="text-2xl font-bold text-white">
                    {MOCK_INVESTMENTS.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {hasCreatorRole && (
          <Card className="bg-slate-900/50 border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-sky-500/20 flex items-center justify-center">
                  <Film className="h-6 w-6 text-sky-400" />
                </div>
                <div>
                  <p className="text-white/60 text-sm">Mes projets</p>
                  <p className="text-2xl font-bold text-white">3</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Wallet */}
        <Card className="bg-slate-900/50 border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-teal-500/20 flex items-center justify-center">
                <Wallet className="h-6 w-6 text-teal-400" />
              </div>
              <div>
                <p className="text-white/60 text-sm">Solde</p>
                <p className="text-2xl font-bold text-white">
                  {(user?.wallet?.available || 0).toFixed(2)}€
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Personal Rankings */}
      <Card className="bg-slate-900/50 border-white/10">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-white flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-400" />
            Mes classements
          </CardTitle>
          <Link href="/leaderboard">
            <Button variant="ghost" size="sm" className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-600/20">
              Voir les classements
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            {LEADERBOARD_CATEGORIES.map((cat) => {
              const rank = USER_RANKINGS[cat.key]
              const IconMap: Record<string, React.ComponentType<{ className?: string }>> = {
                porteur: Film,
                infoporteur: FileText,
                podcasteur: Mic,
              }
              const CatIcon = IconMap[cat.key] || Trophy
              return (
                <div
                  key={cat.key}
                  className={`p-4 rounded-xl border ${cat.borderColor} bg-slate-800/40 flex flex-col items-center gap-2`}
                >
                  <div className={`w-10 h-10 rounded-lg ${cat.bgColor} flex items-center justify-center`}>
                    <CatIcon className={`h-5 w-5 ${cat.color}`} />
                  </div>
                  <span className="text-xs text-white/50 text-center">{cat.label}</span>
                  <span className={`text-2xl font-bold ${cat.color}`}>
                    {rank <= 10 ? `#${rank}` : rank <= 100 ? `#${rank}` : `#${rank}`}
                  </span>
                  <span className="text-xs text-white/30">
                    {rank <= 10 ? "TOP 10" : rank <= 100 ? "TOP 100" : rank <= 500 ? "TOP 500" : `sur ${rank + Math.floor(Math.random() * 200)}`}
                  </span>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link href="/explore">
          <Card className="bg-slate-900/50 border-white/10 hover:border-emerald-500/50 transition-colors cursor-pointer h-full">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                <Compass className="h-6 w-6 text-emerald-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-white">Explorer</h3>
                <p className="text-sm text-white/60">
                  Découvrez de nouveaux projets
                </p>
              </div>
              <ArrowRight className="h-5 w-5 text-white/40" />
            </CardContent>
          </Card>
        </Link>

        {isCreator && (
          <Link href="/upload">
            <Card className="bg-slate-900/50 border-white/10 hover:border-red-500/50 transition-colors cursor-pointer h-full">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-red-500/20 flex items-center justify-center">
                  <Upload className="h-6 w-6 text-red-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white">Deposer une video</h3>
                  <p className="text-sm text-white/60">
                    Publiez votre contenu audiovisuel
                  </p>
                </div>
                <ArrowRight className="h-5 w-5 text-white/40" />
              </CardContent>
            </Card>
          </Link>
        )}

        {isInfoporteur && (
          <Link href="/upload/text">
            <Card className="bg-slate-900/50 border-white/10 hover:border-amber-500/50 transition-colors cursor-pointer h-full">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-amber-500/20 flex items-center justify-center">
                  <FileText className="h-6 w-6 text-amber-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white">{"Deposer un ecrit"}</h3>
                  <p className="text-sm text-white/60">
                    {"Publiez votre contenu litteraire"}
                  </p>
                </div>
                <ArrowRight className="h-5 w-5 text-white/40" />
              </CardContent>
            </Card>
          </Link>
        )}

        {isPodcasteur && (
          <Link href="/upload/podcast">
            <Card className="bg-slate-900/50 border-white/10 hover:border-purple-500/50 transition-colors cursor-pointer h-full">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center">
                  <Mic className="h-6 w-6 text-purple-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white">{"Deposer un podcast"}</h3>
                  <p className="text-sm text-white/60">
                    {"Publiez vos episodes audio"}
                  </p>
                </div>
                <ArrowRight className="h-5 w-5 text-white/40" />
              </CardContent>
            </Card>
          </Link>
        )}

        {hasContributorRole && (
          <Link href="/dashboard/wallet">
            <Card className="bg-slate-900/50 border-white/10 hover:border-teal-500/50 transition-colors cursor-pointer h-full">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-teal-500/20 flex items-center justify-center">
                  <Wallet className="h-6 w-6 text-teal-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white">{"Accéder à mon wallet"}</h3>
                  <p className="text-sm text-white/60">
                    {"Gérez vos gains et retraits Stripe"}
                  </p>
                </div>
                <ArrowRight className="h-5 w-5 text-white/40" />
              </CardContent>
            </Card>
          </Link>
        )}

        {!hasCreatorRole && !hasContributorRole && !user?.isMinor && (
          <Link href="/dashboard/settings">
            <Card className="bg-gradient-to-r from-emerald-900/30 to-teal-900/30 border-emerald-500/30 hover:border-emerald-500/50 transition-colors cursor-pointer h-full">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-emerald-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white">
                    Passer au niveau superieur
                  </h3>
                  <p className="text-sm text-white/60">
                    Devenez createur ou contributeur
                  </p>
                </div>
                <ArrowRight className="h-5 w-5 text-white/40" />
              </CardContent>
            </Card>
          </Link>
        )}

        {/* Minor restriction card */}
        {user?.isMinor && !hasCreatorRole && !hasContributorRole && (
          <Card className="bg-slate-900/50 border-white/10 opacity-75">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center">
                <Lock className="h-6 w-6 text-white/30" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-white/60">
                  {"R\u00f4les bloqu\u00e9s"}
                </h3>
                <p className="text-sm text-white/40">
                  {"Soutien financier, retrait et conversion de VIXUpoints accessibles d\u00e8s 18 ans."}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Section profil specifique - Ma progression */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Visiteur - Progression VIXUpoints */}
        {isVisitor && !hasContributorRole && !hasCreatorRole && (
          <Card className="bg-gradient-to-br from-amber-900/20 to-orange-900/20 border-amber-500/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Star className="h-5 w-5 text-amber-400" />
                Ma progression Visiteur
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-white/70 text-sm">
                En tant que visiteur, vous gagnez des VIXUpoints en regardant des contenus et en participant a la communaute.
              </p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">VIXUpoints gagnes</span>
                  <span className="text-amber-400 font-semibold">{user?.visupoints || 0} pts</span>
                </div>
                <Progress value={Math.min(((user?.visupoints || 0) / 1000) * 100, 100)} className="h-2 bg-white/10" />
                <p className="text-xs text-white/40">Prochain palier : 1 000 pts</p>
              </div>
              <div className="pt-2 border-t border-white/10">
                <p className="text-white/50 text-xs mb-2">Prochaines actions :</p>
                <ul className="space-y-1 text-xs text-white/60">
                  <li className="flex items-center gap-2">
                    <Film className="h-3 w-3 text-emerald-400" />
                    Regarder un contenu (+15 pts)
                  </li>
                  <li className="flex items-center gap-2">
                    <Heart className="h-3 w-3 text-rose-400" />
                    Ajouter aux favoris (+5 pts)
                  </li>
                </ul>
              </div>
              {/* CTA Evolution de profil */}
              <div className="pt-3 mt-3 border-t border-amber-500/20 bg-amber-500/5 -mx-6 -mb-6 px-6 py-4 rounded-b-xl">
                <p className="text-amber-200 text-sm font-medium mb-2">Debloquez les contributions</p>
                <p className="text-white/60 text-xs mb-3">Devenez Contributeur pour soutenir financierement les projets et generer des gains.</p>
                <Link href="/guide-profiles">
                  <Button size="sm" className="w-full bg-amber-600 hover:bg-amber-500 text-white">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Devenir Contributeur
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Contributeur - Projets soutenus */}
        {hasContributorRole && (
          <Card className="bg-gradient-to-br from-teal-900/20 to-emerald-900/20 border-teal-500/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-teal-400" />
                Ma progression Participant
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-white/70 text-sm">
                Vos contributions influencent le classement des projets. Si un projet que vous soutenez atteint le TOP, vous recevez une part des gains.
              </p>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 rounded-lg bg-slate-800/50">
                  <p className="text-xl font-bold text-teal-400">{MOCK_INVESTMENTS.length}</p>
                  <p className="text-xs text-white/50">Projets soutenus</p>
                </div>
                <div className="p-3 rounded-lg bg-slate-800/50">
                  <p className="text-xl font-bold text-amber-400">{MOCK_INVESTMENTS.reduce((acc, inv) => acc + inv.votes, 0)}</p>
                  <p className="text-xs text-white/50">Votes obtenus</p>
                </div>
                <div className="p-3 rounded-lg bg-slate-800/50">
                  <p className="text-xl font-bold text-emerald-400">{(user?.wallet?.available || 0).toFixed(0)}€</p>
                  <p className="text-xs text-white/50">Gains potentiels</p>
                </div>
              </div>
              <div className="pt-2 border-t border-white/10">
                <p className="text-white/50 text-xs mb-2">Prochaines actions :</p>
                <ul className="space-y-1 text-xs text-white/60">
                  <li className="flex items-center gap-2">
                    <CreditCard className="h-3 w-3 text-teal-400" />
                    Contribuer a un nouveau projet
                  </li>
                  <li className="flex items-center gap-2">
                    <Wallet className="h-3 w-3 text-purple-400" />
                    Connecter Stripe pour retirer vos gains
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Createur - Suivi projets */}
        {hasCreatorRole && (
          <Card className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 border-purple-500/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Upload className="h-5 w-5 text-purple-400" />
                Mon espace Createur
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-white/70 text-sm">
                Publiez vos contenus, suivez leur performance et recevez des royalties selon le succes de vos projets.
              </p>
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="p-3 rounded-lg bg-slate-800/50">
                  <p className="text-xl font-bold text-purple-400">0</p>
                  <p className="text-xs text-white/50">Contenus publies</p>
                </div>
                <div className="p-3 rounded-lg bg-slate-800/50">
                  <p className="text-xl font-bold text-emerald-400">{(user?.wallet?.available || 0).toFixed(0)}€</p>
                  <p className="text-xs text-white/50">Royalties</p>
                </div>
              </div>
              <div className="pt-2 border-t border-white/10">
                <p className="text-white/50 text-xs mb-2">Etapes pour publier :</p>
                <ol className="space-y-1 text-xs text-white/60 list-decimal list-inside">
                  <li>Remplir les informations du projet</li>
                  <li>Configurer les parametres de contribution</li>
                  <li>Uploader votre contenu</li>
                  <li>Soumettre pour validation</li>
                </ol>
              </div>
              <Link href="/dashboard/projects">
                <Button size="sm" className="w-full bg-purple-600 hover:bg-purple-500 text-white">
                  <Upload className="h-4 w-4 mr-2" />
                  Publier maintenant
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Ce que je peux faire - tous profils */}
        <Card className="bg-slate-900/50 border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Compass className="h-5 w-5 text-emerald-400" />
              Ce que je peux faire
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0 mt-0.5">
                  <Film className="h-3 w-3 text-emerald-400" />
                </div>
                <div>
                  <p className="text-white text-sm font-medium">Decouvrir des contenus</p>
                  <p className="text-white/50 text-xs">Films, ecrits, podcasts - gratuits ou payants</p>
                </div>
              </li>
              {!user?.isMinor && (
                <li className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0 mt-0.5">
                    <CreditCard className="h-3 w-3 text-amber-400" />
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">Contribuer aux projets</p>
                    <p className="text-white/50 text-xs">Obtenez des votes et influencez le classement</p>
                  </div>
                </li>
              )}
              {hasCreatorRole && (
                <li className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0 mt-0.5">
                    <Upload className="h-3 w-3 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">Publier vos creations</p>
                    <p className="text-white/50 text-xs">Monetisez vos films, ecrits ou podcasts</p>
                  </div>
                </li>
              )}
              {(hasContributorRole || hasCreatorRole) && (
                <li className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-teal-500/20 flex items-center justify-center shrink-0 mt-0.5">
                    <Wallet className="h-3 w-3 text-teal-400" />
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">Retirer vos gains</p>
                    <p className="text-white/50 text-xs">Via Stripe Connect - retraits hebdomadaires</p>
                  </div>
                </li>
              )}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Investments */}
        {hasContributorRole && MOCK_INVESTMENTS.length > 0 && (
          <Card className="bg-slate-900/50 border-white/10">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-white">
                Derniers soutiens
              </CardTitle>
              <Link href="/dashboard/contributions">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-600/20"
                >
                  Voir tout
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-4">
              {MOCK_INVESTMENTS.slice(0, 3).map((inv) => (
                <div
                  key={inv.id}
                  className="flex items-center gap-4 p-3 bg-slate-800/50 rounded-lg"
                >
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      inv.contentType === "video"
                        ? "bg-red-500/20"
                        : inv.contentType === "podcast"
                          ? "bg-purple-500/20"
                          : "bg-amber-500/20"
                    }`}
                  >
                    {inv.contentType === "video" ? (
                      <Film className="h-5 w-5 text-red-400" />
                    ) : inv.contentType === "podcast" ? (
                      <Mic className="h-5 w-5 text-purple-400" />
                    ) : (
                      <FileText className="h-5 w-5 text-amber-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-white">{inv.contentTitle}</p>
                    <p className="text-sm text-white/60">{inv.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-white">{inv.amount}€</p>
                    <p className="text-sm text-emerald-400">
                      +{inv.returns.toFixed(2)}€
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Recent transactions */}
        <Card className="bg-slate-900/50 border-white/10">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-white">Activité récente</CardTitle>
            <Link href="/dashboard/history">
              <Button
                variant="ghost"
                size="sm"
                className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-600/20"
              >
                Voir tout
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {MOCK_TRANSACTIONS.slice(0, 4).map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between py-2 border-b border-white/5 last:border-0"
              >
                <div>
                  <p className="text-sm text-white">{tx.description}</p>
                  <p className="text-xs text-white/40">{tx.date}</p>
                </div>
                <span
                  className={`font-medium ${
                    tx.amount >= 0 ? "text-emerald-400" : "text-white"
                  }`}
                >
                  {tx.amount >= 0 ? "+" : ""}
                  {tx.amount.toFixed(2)}€
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* VIXUpoints Progress (for visitors) */}
      {isVisitor && (
        <Card className="bg-gradient-to-r from-amber-900/20 to-orange-900/20 border-amber-500/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Star className="h-5 w-5 text-amber-400" />
              Progression VIXUpoints
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-white/60">Niveau actuel</span>
                <span className="text-amber-400 font-medium">Bronze</span>
              </div>
              <Progress value={30} className="h-2 bg-slate-800" />
              <div className="flex justify-between text-sm">
                <span className="text-white/60">
                  {user?.visupoints || 0} / 500 points
                </span>
                <span className="text-white/40">Prochain: Argent</span>
              </div>
              <Link href="/dashboard/vixupoints">
                <Button
                  variant="outline"
                  className="w-full bg-transparent border-amber-500/50 text-amber-400 hover:bg-amber-600/20"
                >
                  Gagner plus de points
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
