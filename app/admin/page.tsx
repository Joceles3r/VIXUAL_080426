"use client"

import { useAuth } from "@/lib/auth-context"
import { useState, useEffect, useCallback, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Users,
  DollarSign,
  Film,
  FileText,
  Mic,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Ban,
  RefreshCw,
  Eye,
  Shield,
  Activity,
  AlertOctagon,
  UserX,
  Trash2,
  MessageCircle,
  ShieldAlert,
  Mail,
  Database,
  Fingerprint,
  Lock,
  Zap,
  FileCheck,
  LogOut,
  Wallet2,
  FlaskConical,
  Sparkles,
  Rocket,
  LayoutDashboard,
} from "lucide-react"
import Link from "next/link"
import { useTestLabAccess } from "@/lib/test-lab/use-test-lab-access"
import { CreatorChannelsBanner } from "@/components/admin/creator-channels-banner"

interface AdminStats {
  totalUsers: number
  totalInvestments: number
  totalCreators: number
  totalRevenue: number
  pendingPayouts: number
  activeProjects: number
  reportedContent: number
  timestamp: string
}

// Mock data for users and reports
const MOCK_USERS = [
  { id: "u1", name: "Marie Stellaire", email: "marie@example.com", role: "Porteur", status: "active", joined: "2025-01-15", investments: 0, raised: 15600 },
  { id: "u2", name: "Alexandre M.", email: "alex@example.com", role: "Contributeur", status: "active", joined: "2025-02-03", investments: 2450, raised: 0 },
  { id: "u3", name: "Pierre Michel", email: "pierre@example.com", role: "Infoporteur", status: "active", joined: "2025-03-12", investments: 0, raised: 9800 },
  { id: "u4", name: "Karim Ondes", email: "karim@example.com", role: "Podcasteur", status: "active", joined: "2025-04-01", investments: 0, raised: 8200 },
  { id: "u5", name: "Sophie L.", email: "sophie@example.com", role: "Contributeur", status: "suspended", joined: "2025-01-28", investments: 1890, raised: 0 },
  { id: "u6", name: "Lucas Nature", email: "lucas@example.com", role: "Porteur", status: "active", joined: "2025-02-18", investments: 0, raised: 12400 },
  { id: "u7", name: "Clara M.", email: "clara@example.com", role: "Visiteur", status: "active", joined: "2025-05-02", investments: 0, raised: 0 },
  { id: "u8", name: "Thomas R.", email: "thomas@example.com", role: "Contributeur", status: "active", joined: "2025-03-20", investments: 1650, raised: 0 },
]

const REPORT_CATEGORY_LABELS: Record<string, { label: string; severity: "low" | "medium" | "high" | "critical" }> = {
  racism: { label: "Racisme", severity: "critical" },
  homophobia: { label: "Homophobie", severity: "critical" },
  antisemitism: { label: "Antis\u00e9mitisme", severity: "critical" },
  religious_hate: { label: "Haine religieuse", severity: "critical" },
  insults: { label: "Insultes / Harc\u00e8lement", severity: "high" },
  sexual_content: { label: "Contenu sexuel", severity: "high" },
  violence: { label: "Violence", severity: "high" },
  plagiarism: { label: "Plagiat / Droits d'auteur", severity: "medium" },
  spam: { label: "Spam / Arnaque", severity: "low" },
  other: { label: "Autre", severity: "low" },
}

const MOCK_REPORTS = [
  { id: "r1", contentTitle: "Video signalement #1", reporter: "Clara M.", author: "User456", category: "insults", reason: "Insultes dans les commentaires", status: "pending", date: "2025-06-03" },
  { id: "r2", contentTitle: "Article litigieux", reporter: "Thomas R.", author: "User789", category: "plagiarism", reason: "Plagiat d'un article existant", status: "pending", date: "2025-06-02" },
  { id: "r3", contentTitle: "Podcast episode 12", reporter: "Sophie L.", author: "User321", category: "plagiarism", reason: "Musique non autoris\u00e9e", status: "reviewed", date: "2025-05-28" },
  { id: "r4", contentTitle: "Court-metrage X", reporter: "Alexandre M.", author: "User654", category: "spam", reason: "Spam promotionnel", status: "resolved", date: "2025-05-25" },
  { id: "r5", contentTitle: "Nouvelle litteraire", reporter: "Marie S.", author: "User111", category: "racism", reason: "Propos racistes dans le texte", status: "pending", date: "2025-06-03" },
  { id: "r6", contentTitle: "Commentaire social #42", reporter: "Lucas N.", author: "User222", category: "homophobia", reason: "Propos homophobes r\u00e9p\u00e9t\u00e9s", status: "pending", date: "2025-06-03" },
  { id: "r7", contentTitle: "Video profil User333", reporter: "Karim O.", author: "User333", category: "violence", reason: "Menaces envers un autre utilisateur", status: "pending", date: "2025-06-04" },
]

const MOCK_PAYOUTS = [
  { id: "p1", creator: "Marie Stellaire", amount: 1240, status: "pending", type: "Audiovisuel", date: "2025-06-01" },
  { id: "p2", creator: "Pierre Michel", amount: 680, status: "pending", type: "Litteraire", date: "2025-06-01" },
  { id: "p3", creator: "Karim Ondes", amount: 520, status: "pending", type: "Podcast", date: "2025-06-02" },
  { id: "p4", creator: "Lucas Nature", amount: 890, status: "processed", type: "Audiovisuel", date: "2025-05-28" },
  { id: "p5", creator: "Marie Stellaire", amount: 1100, status: "processed", type: "Audiovisuel", date: "2025-05-21" },
]

export default function AdminPage() {
  const { user, logout } = useAuth()
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"overview" | "users" | "payouts" | "reports" | "integrity" | "wallet">("overview")

  const fetchStats = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/secure-action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user?.email, action: "get_stats" }),
      })
      if (res.ok) {
        const data = await res.json()
        setStats(data.data)
      }
    } catch {
      // Fallback stats for demo
      setStats({
        totalUsers: 1247,
        totalInvestments: 8934,
        totalCreators: 312,
        totalRevenue: 187650,
        pendingPayouts: 23,
        activeProjects: 89,
        reportedContent: 7,
        timestamp: new Date().toISOString(),
      })
    } finally {
      setLoading(false)
    }
  }, [user?.email])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  const tabs = useMemo(
    () => [
      { key: "overview" as const, label: "Vue d'ensemble", icon: Activity },
      { key: "users" as const, label: "Utilisateurs", icon: Users },
      { key: "payouts" as const, label: "Paiements", icon: DollarSign },
      { key: "reports" as const, label: "Signalements", icon: AlertTriangle },
      { key: "integrity" as const, label: "Integrity", icon: Database },
      { key: "wallet" as const, label: "Wallet V3", icon: Wallet2 },
    ],
    [],
  )

  return (
    <div className="p-6 lg:p-8 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Shield className="h-8 w-8 text-red-400" />
            Administration VIXUAL
          </h1>
          <p className="text-white/50 mt-1">
            {"Panneau d'administration -- Acces restreint"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={fetchStats}
            variant="outline"
            className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Actualiser
          </Button>
          <Button
            onClick={logout}
            variant="outline"
            className="border-white/15 text-white/50 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/25 gap-2"
          >
            <LogOut className="h-4 w-4" />
            {"D\u00e9connexion"}
          </Button>
        </div>
      </div>

      {/* Version Switch Banner - Stratification V1/V2/V3 */}
      <VersionSwitchBanner />

      {/* Test Lab Banner - Gros bouton voyant */}
      <TestLabBanner />

      {/* Creator Channels Banner — Module V3 (toggle + moderation) */}
      <CreatorChannelsBanner />

      {/* Homepage Manager Banner — Module gestion Hero + carrousels V1 */}
      <Link href="/admin/homepage" className="block mb-6">
        <div className="relative overflow-hidden rounded-2xl border-2 border-purple-400/60 bg-gradient-to-r from-purple-900/40 via-fuchsia-900/30 to-purple-900/40 p-5 transition-all group hover:shadow-xl hover:shadow-purple-500/20">
          <div className="relative flex items-center gap-5">
            <div className="w-16 h-16 rounded-xl flex items-center justify-center bg-gradient-to-br from-purple-500 to-fuchsia-600 shadow-lg shadow-purple-500/30">
              <LayoutDashboard className="h-8 w-8 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h3 className="text-xl font-bold text-white">Gestion Homepage</h3>
                <span className="text-xs uppercase tracking-wider px-2.5 py-1 rounded-full font-bold bg-purple-500 text-white">
                  Patron + manage_homepage
                </span>
              </div>
              <p className="text-sm text-purple-200/80">
                Modifiez le Hero principal, les carrousels Films / Podcasts / Littérature / Savoir &amp; Culture, et les visuels affichés sur la homepage V1.
              </p>
            </div>
            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-purple-500/20 text-purple-200 transition-transform group-hover:translate-x-1">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>
      </Link>

      {/* Moderation Banner - Acces direct au moteur de moderation */}
      <Link href="/admin/moderation" className="block mb-6">
        <div className="relative overflow-hidden rounded-2xl border-2 border-rose-400/60 bg-gradient-to-r from-rose-900/40 via-red-900/30 to-rose-900/40 p-5 transition-all group hover:shadow-xl hover:shadow-rose-500/20">
          <div className="relative flex items-center gap-5">
            <div className="w-16 h-16 rounded-xl flex items-center justify-center bg-gradient-to-br from-rose-500 to-red-600 shadow-lg shadow-rose-500/30">
              <ShieldAlert className="h-8 w-8 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h3 className="text-xl font-bold text-white">Modération &amp; Alertes</h3>
                <span className="text-xs uppercase tracking-wider px-2.5 py-1 rounded-full font-bold bg-rose-500 text-white">
                  Patron Only
                </span>
              </div>
              <p className="text-sm text-rose-200/80">
                Tableau de bord des alertes du moteur de modération automatisé (Trust Score, fraude, promotions, bascule plateforme).
              </p>
            </div>
            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-rose-500/20 text-rose-200 transition-transform group-hover:translate-x-1">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>
      </Link>

      {/* Tabs */}
      <div className="flex gap-1 mb-8 bg-slate-900/50 p-1 rounded-xl border border-white/5 w-fit">
        {tabs.map((tab) => {
          const isWallet = tab.key === "wallet"
          const isActive = activeTab === tab.key
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all border ${
                isActive && isWallet
                  ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.12)]"
                  : isActive
                    ? "bg-red-500/20 text-red-400 border-red-500/30"
                    : isWallet
                      ? "text-emerald-400/60 hover:text-emerald-400 hover:bg-emerald-500/10 border-emerald-500/15"
                      : "text-white/40 hover:text-white/70 hover:bg-white/5 border-transparent"
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span className="hidden sm:inline">{tab.label}</span>
              {isWallet && (
                <span className="text-[9px] font-bold bg-emerald-500/20 text-emerald-400 px-1 py-0.5 rounded leading-none">
                  V3
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Utilisateurs", value: stats?.totalUsers.toLocaleString() || "--", icon: Users, color: "text-blue-400", bg: "bg-blue-500/15" },
              { label: "Soutiens", value: stats?.totalInvestments.toLocaleString() || "--", icon: TrendingUp, color: "text-emerald-400", bg: "bg-emerald-500/15" },
              { label: "Revenus totaux", value: stats ? `${stats.totalRevenue.toLocaleString()} EUR` : "--", icon: DollarSign, color: "text-amber-400", bg: "bg-amber-500/15" },
              { label: "Projets actifs", value: stats?.activeProjects.toString() || "--", icon: Film, color: "text-purple-400", bg: "bg-purple-500/15" },
            ].map((stat) => (
              <Card key={stat.label} className="bg-slate-900/60 border-white/10">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center`}>
                      <stat.icon className={`h-5 w-5 ${stat.color}`} />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <p className="text-xs text-white/40 mt-1">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Secondary stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-slate-900/60 border-white/10">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-red-500/15 flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-red-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-red-400">{stats?.reportedContent || "--"}</p>
                  <p className="text-xs text-white/40">Contenus signales</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-slate-900/60 border-white/10">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-500/15 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-amber-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-amber-400">{stats?.pendingPayouts || "--"}</p>
                  <p className="text-xs text-white/40">Paiements en attente</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-slate-900/60 border-white/10">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-teal-500/15 flex items-center justify-center">
                  <Users className="h-6 w-6 text-teal-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-teal-400">{stats?.totalCreators || "--"}</p>
                  <p className="text-xs text-white/40">Createurs actifs</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Activity feed */}
          <Card className="bg-slate-900/60 border-white/10">
            <CardHeader>
              <CardTitle className="text-white text-lg">{"Activite recente"}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { text: "Nouveau Porteur inscrit : Lucas Nature", time: "Il y a deux minutes", icon: Film, color: "text-red-400" },
                  { text: "Soutien de quinze euros sur 'L'Odyssee des Etoiles'", time: "Il y a huit minutes", icon: TrendingUp, color: "text-emerald-400" },
                  { text: "Paiement de mille deux cent quarante euros trait\u00e9 pour Marie Stellaire", time: "Il y a vingt-trois minutes", icon: DollarSign, color: "text-amber-400" },
                  { text: "Nouvel article publie par Pierre Michel", time: "Il y a quarante-cinq minutes", icon: FileText, color: "text-sky-400" },
                  { text: "Nouveau podcast de Karim Ondes", time: "Il y a une heure", icon: Mic, color: "text-purple-400" },
                  { text: "Signalement recu sur un contenu video", time: "Il y a deux heures", icon: AlertTriangle, color: "text-red-400" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/5">
                    <item.icon className={`h-4 w-4 ${item.color} shrink-0`} />
                    <p className="text-sm text-white/70 flex-1">{item.text}</p>
                    <span className="text-xs text-white/30 whitespace-nowrap">{item.time}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === "users" && (
        <div className="space-y-4" id="users">
          <Card className="bg-slate-900/60 border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-400" />
                Gestion des utilisateurs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3 px-3 text-white/40 font-medium">Nom</th>
                      <th className="text-left py-3 px-3 text-white/40 font-medium">Email</th>
                      <th className="text-left py-3 px-3 text-white/40 font-medium">{"Rôle"}</th>
                      <th className="text-left py-3 px-3 text-white/40 font-medium">Statut</th>
                      <th className="text-left py-3 px-3 text-white/40 font-medium">Inscription</th>
                      <th className="text-right py-3 px-3 text-white/40 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {MOCK_USERS.map((u) => (
                      <tr key={u.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                        <td className="py-3 px-3 text-white font-medium">{u.name}</td>
                        <td className="py-3 px-3 text-white/50">{u.email}</td>
                        <td className="py-3 px-3">
                          <Badge
                            variant="outline"
                            className={
                              u.role === "Porteur" ? "border-red-500/40 text-red-400" :
                              u.role === "Infoporteur" ? "border-sky-500/40 text-sky-400" :
                              u.role === "Podcasteur" ? "border-purple-500/40 text-purple-400" :
                              u.role === "Contributeur" ? "border-emerald-500/40 text-emerald-400" :
                              "border-white/20 text-white/50"
                            }
                          >
                            {u.role}
                          </Badge>
                        </td>
                        <td className="py-3 px-3">
                          {u.status === "active" ? (
                            <span className="flex items-center gap-1.5 text-emerald-400 text-xs">
                              <CheckCircle className="h-3.5 w-3.5" /> Actif
                            </span>
                          ) : (
                            <span className="flex items-center gap-1.5 text-red-400 text-xs">
                              <Ban className="h-3.5 w-3.5" /> Suspendu
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-white/40">{u.joined}</td>
                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="sm" className="text-white/40 hover:text-white h-8" title="Voir le profil">
                              <Eye className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost" size="sm"
                              className="text-amber-400/60 hover:text-amber-400 hover:bg-amber-500/10 h-8"
                              title="Envoyer un avertissement"
                              onClick={async () => {
                                await fetch("/api/admin/secure-action", {
                                  method: "POST",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({ email: user?.email, action: "moderate_content", payload: { decision: "warn", targetUser: u.id } }),
                                })
                              }}
                            >
                              <MessageCircle className="h-3.5 w-3.5" />
                            </Button>
                            {u.status === "active" ? (
                              <Button
                                variant="ghost" size="sm"
                                className="text-red-400/60 hover:text-red-400 hover:bg-red-500/10 h-8"
                                title="Suspendre le compte"
                                onClick={async () => {
                                  await fetch("/api/admin/secure-action", {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({ email: user?.email, action: "moderate_content", payload: { decision: "suspend_account", targetUser: u.id } }),
                                  })
                                }}
                              >
                                <Ban className="h-3.5 w-3.5" />
                              </Button>
                            ) : (
                              <Button
                                variant="ghost" size="sm"
                                className="text-emerald-400/60 hover:text-emerald-400 hover:bg-emerald-500/10 h-8"
                                title="R\u00e9activer le compte"
                                onClick={async () => {
                                  await fetch("/api/admin/secure-action", {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({ email: user?.email, action: "moderate_content", payload: { decision: "reactivate", targetUser: u.id } }),
                                  })
                                }}
                              >
                                <CheckCircle className="h-3.5 w-3.5" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Payouts Tab */}
      {activeTab === "payouts" && (
        <div className="space-y-4" id="payouts">
          <Card className="bg-slate-900/60 border-white/10">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-white flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-amber-400" />
                Gestion des paiements
              </CardTitle>
              <Button
                size="sm"
                className="bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:bg-amber-500/30"
                onClick={async () => {
                  await fetch("/api/admin/secure-action", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email: user?.email, action: "execute_payout", payload: { batchId: "batch-001" } }),
                  })
                }}
              >
                {"Exécuter les paiements"}
              </Button>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3 px-3 text-white/40 font-medium">{"Créateur"}</th>
                      <th className="text-left py-3 px-3 text-white/40 font-medium">Type</th>
                      <th className="text-right py-3 px-3 text-white/40 font-medium">Montant</th>
                      <th className="text-left py-3 px-3 text-white/40 font-medium">Statut</th>
                      <th className="text-left py-3 px-3 text-white/40 font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {MOCK_PAYOUTS.map((p) => (
                      <tr key={p.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                        <td className="py-3 px-3 text-white font-medium">{p.creator}</td>
                        <td className="py-3 px-3">
                          <Badge variant="outline" className="border-white/20 text-white/50">{p.type}</Badge>
                        </td>
                        <td className="py-3 px-3 text-right text-white font-mono">{p.amount.toLocaleString()} EUR</td>
                        <td className="py-3 px-3">
                          {p.status === "pending" ? (
                            <span className="flex items-center gap-1.5 text-amber-400 text-xs">
                              <Clock className="h-3.5 w-3.5" /> En attente
                            </span>
                          ) : (
                            <span className="flex items-center gap-1.5 text-emerald-400 text-xs">
                              <CheckCircle className="h-3.5 w-3.5" /> {"Traité"}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-white/40">{p.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Reports Tab - Full Moderation Pipeline */}
      {activeTab === "reports" && (
        <div className="space-y-4" id="reports">
          {/* Moderation summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "En attente", count: MOCK_REPORTS.filter(r => r.status === "pending").length, color: "text-red-400", bg: "bg-red-500/15", dot: "bg-red-400" },
              { label: "En cours", count: MOCK_REPORTS.filter(r => r.status === "reviewed").length, color: "text-amber-400", bg: "bg-amber-500/15", dot: "bg-amber-400" },
              { label: "R\u00e9solus", count: MOCK_REPORTS.filter(r => r.status === "resolved").length, color: "text-emerald-400", bg: "bg-emerald-500/15", dot: "bg-emerald-400" },
              { label: "Critiques", count: MOCK_REPORTS.filter(r => REPORT_CATEGORY_LABELS[r.category]?.severity === "critical").length, color: "text-red-500", bg: "bg-red-600/15", dot: "bg-red-500" },
            ].map((s) => (
              <Card key={s.label} className="bg-slate-900/60 border-white/10">
                <CardContent className="p-4 flex items-center gap-3">
                  <span className={`w-3 h-3 rounded-full ${s.dot}`} />
                  <div>
                    <p className={`text-xl font-bold ${s.color}`}>{s.count}</p>
                    <p className="text-xs text-white/40">{s.label}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Reports list with full moderation actions */}
          <Card className="bg-slate-900/60 border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-red-400" />
                {"Signalements -- Mod\u00e9ration compl\u00e8te"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {MOCK_REPORTS.map((r) => {
                  const catInfo = REPORT_CATEGORY_LABELS[r.category] || { label: r.category, severity: "low" }
                  const severityColors = {
                    critical: "border-red-500/30 bg-red-500/5",
                    high: "border-orange-500/20 bg-orange-500/5",
                    medium: "border-amber-500/15 bg-amber-500/5",
                    low: "border-white/5 bg-white/[0.02]",
                  }
                  const severityBadge = {
                    critical: "bg-red-500/20 text-red-400 border-red-500/40",
                    high: "bg-orange-500/20 text-orange-400 border-orange-500/40",
                    medium: "bg-amber-500/20 text-amber-400 border-amber-500/40",
                    low: "bg-white/10 text-white/50 border-white/20",
                  }

                  return (
                    <div key={r.id} className={`p-4 rounded-xl border ${severityColors[catInfo.severity]}`}>
                      {/* Report header */}
                      <div className="flex items-start gap-3 mb-3">
                        <div className={`w-2.5 h-2.5 rounded-full shrink-0 mt-1.5 ${
                          r.status === "pending" ? "bg-red-400 animate-pulse" :
                          r.status === "reviewed" ? "bg-amber-400" :
                          "bg-emerald-400"
                        }`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <p className="text-sm text-white font-medium">{r.contentTitle}</p>
                            <Badge variant="outline" className={`text-[10px] ${severityBadge[catInfo.severity]}`}>
                              {catInfo.label}
                            </Badge>
                            <Badge
                              variant="outline"
                              className={
                                r.status === "pending" ? "border-red-500/40 text-red-400 text-[10px]" :
                                r.status === "reviewed" ? "border-amber-500/40 text-amber-400 text-[10px]" :
                                "border-emerald-500/40 text-emerald-400 text-[10px]"
                              }
                            >
                              {r.status === "pending" ? "En attente" : r.status === "reviewed" ? "En cours" : "R\u00e9solu"}
                            </Badge>
                          </div>
                          <p className="text-xs text-white/40">
                            {"Signal\u00e9 par "}{r.reporter}{" -- Auteur : "}{r.author}{" -- "}{r.date}
                          </p>
                          <p className="text-xs text-white/50 mt-1 italic">{"\u00ab\u00a0"}{r.reason}{"\u00a0\u00bb"}</p>
                        </div>
                      </div>

                      {/* Moderation actions -- full pipeline */}
                      {r.status === "pending" && (
                        <div className="flex flex-wrap items-center gap-2 ml-5.5 pt-3 border-t border-white/5">
                          {/* Approve (false alarm) */}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2.5 text-xs text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20"
                            title="Approuver (fausse alerte)"
                            onClick={async () => {
                              await fetch("/api/admin/secure-action", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ email: user?.email, action: "moderate_content", payload: { contentId: r.id, decision: "approved" } }),
                              })
                            }}
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Approuver
                          </Button>

                          {/* Warn user */}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2.5 text-xs text-amber-400 hover:bg-amber-500/20 border border-amber-500/20"
                            title="Envoyer un avertissement"
                            onClick={async () => {
                              await fetch("/api/admin/secure-action", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ email: user?.email, action: "moderate_content", payload: { contentId: r.id, decision: "warn", targetUser: r.author } }),
                              })
                            }}
                          >
                            <Mail className="h-3 w-3 mr-1" />
                            Avertir
                          </Button>

                          {/* Delete content */}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2.5 text-xs text-orange-400 hover:bg-orange-500/20 border border-orange-500/20"
                            title="Supprimer le contenu"
                            onClick={async () => {
                              await fetch("/api/admin/secure-action", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ email: user?.email, action: "moderate_content", payload: { contentId: r.id, decision: "delete_content" } }),
                              })
                            }}
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Supprimer contenu
                          </Button>

                          {/* Suspend account */}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2.5 text-xs text-red-400 hover:bg-red-500/20 border border-red-500/20"
                            title="Suspendre le compte"
                            onClick={async () => {
                              await fetch("/api/admin/secure-action", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ email: user?.email, action: "moderate_content", payload: { contentId: r.id, decision: "suspend_account", targetUser: r.author } }),
                              })
                            }}
                          >
                            <Ban className="h-3 w-3 mr-1" />
                            Suspendre
                          </Button>

                          {/* Ban account */}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2.5 text-xs text-red-500 hover:bg-red-600/20 border border-red-600/20"
                            title="Supprimer le compte d\u00e9finitivement"
                            onClick={async () => {
                              await fetch("/api/admin/secure-action", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ email: user?.email, action: "moderate_content", payload: { contentId: r.id, decision: "ban_account", targetUser: r.author } }),
                              })
                            }}
                          >
                            <UserX className="h-3 w-3 mr-1" />
                            Supprimer compte
                          </Button>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Moderation guidelines reminder */}
          <Card className="bg-emerald-500/5 border-emerald-500/15">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertOctagon className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                <div className="space-y-2">
                  <p className="text-emerald-400 font-medium text-sm">{"Rappel -- Charte de modération VIXUAL"}</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="text-white/50">{"Signalements critiques (racisme, homophobie, antis\u00e9mitisme) : traitement prioritaire sous vingt-quatre heures."}</div>
                    <div className="text-white/50">{"Pipeline : Signalement > Examen > D\u00e9cision (approuver / avertir / supprimer contenu / suspendre / bannir)."}</div>
                    <div className="text-white/50">{"L'avertissement rappelle les r\u00e8gles de respect et de courtoisie entre utilisateurs."}</div>
                    <div className="text-white/50">{"La suspension temporaire bloque le compte de sept \u00e0 quatre-vingt-dix jours. La suppression est d\u00e9finitive."}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Integrity Tab -- Financial Integrity Dashboard */}
      {activeTab === "integrity" && (
        <div className="space-y-6" id="integrity">
          {/* Integrity overview cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Payout Simulations", value: "12", desc: "ce mois", icon: FileCheck, color: "text-teal-400", bg: "bg-teal-500/15" },
              { label: "Webhook Events", value: "847", desc: "30 derniers jours", icon: Zap, color: "text-amber-400", bg: "bg-amber-500/15" },
              { label: "KYC Verified", value: "89%", desc: "des payables", icon: Fingerprint, color: "text-emerald-400", bg: "bg-emerald-500/15" },
              { label: "Integrity Checks", value: "100%", desc: "pass rate", icon: Lock, color: "text-sky-400", bg: "bg-sky-500/15" },
            ].map((card) => (
              <Card key={card.label} className="bg-slate-900/60 border-white/10">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-9 h-9 rounded-lg ${card.bg} flex items-center justify-center`}>
                      <card.icon className={`h-4.5 w-4.5 ${card.color}`} />
                    </div>
                  </div>
                  <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
                  <p className="text-xs text-white/40 mt-0.5">{card.label}</p>
                  <p className="text-[10px] text-white/25">{card.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Strategy Pattern - Payout Engine Status */}
          <Card className="bg-slate-900/60 border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2 text-base">
                <Database className="h-5 w-5 text-teal-400" />
                {"Moteur de redistribution -- Strategies V3"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  { name: "FilmStrategy", category: "Audiovisuel", pool: "35%", reserve: "15%", status: "active" },
                  { name: "PodcastStrategy", category: "Podcast", pool: "25%", reserve: "10%", status: "active" },
                  { name: "VoixInfoStrategy", category: "Voix-Info", pool: "20%", reserve: "10%", status: "active" },
                  { name: "LivresStrategy", category: "Livres", pool: "20%", reserve: "10%", status: "active" },
                ].map((s) => (
                  <div key={s.name} className="bg-black/30 border border-white/5 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white/70 text-sm font-medium">{s.category}</span>
                      <Badge variant="outline" className="border-emerald-500/40 text-emerald-400 text-[10px]">
                        {s.status}
                      </Badge>
                    </div>
                    <p className="text-[10px] text-white/30 font-mono mb-2">{s.name}</p>
                    <div className="flex gap-3 text-xs">
                      <div>
                        <span className="text-white/30">Pool:</span>
                        <span className="text-teal-400 ml-1 font-medium">{s.pool}</span>
                      </div>
                      <div>
                        <span className="text-white/30">Reserve:</span>
                        <span className="text-amber-400 ml-1 font-medium">{s.reserve}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Payout Simulations */}
          <Card className="bg-slate-900/60 border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2 text-base">
                <FileCheck className="h-5 w-5 text-sky-400" />
                {"Simulations de paiement r\u00e9centes"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-white/30 text-xs border-b border-white/5">
                      <th className="pb-3 px-3 text-left font-medium">ID</th>
                      <th className="pb-3 px-3 text-left font-medium">{"Cat\u00e9gorie"}</th>
                      <th className="pb-3 px-3 text-right font-medium">{"Brut \u00e9ligible"}</th>
                      <th className="pb-3 px-3 text-right font-medium">{"Vers\u00e9 (utilisateurs)"}</th>
                      <th className="pb-3 px-3 text-right font-medium">{"Commission plateforme"}</th>
                      <th className="pb-3 px-3 text-center font-medium">{"Int\u00e9grit\u00e9"}</th>
                      <th className="pb-3 px-3 text-center font-medium">Alertes</th>
                      <th className="pb-3 px-3 text-right font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { id: "sim_01HX7...", category: "Audiovisuel", gross: 15600, payout: 12480, platform: 3120, integrity: true, warnings: 0, date: "01/03/2026" },
                      { id: "sim_01HX8...", category: "Podcast", gross: 8200, payout: 6560, platform: 1640, integrity: true, warnings: 0, date: "01/03/2026" },
                      { id: "sim_01HX9...", category: "Voix-Info", gross: 9800, payout: 7840, platform: 1960, integrity: true, warnings: 1, date: "01/03/2026" },
                      { id: "sim_01HXA...", category: "Livres", gross: 4200, payout: 3360, platform: 840, integrity: true, warnings: 0, date: "01/03/2026" },
                    ].map((sim) => (
                      <tr key={sim.id} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                        <td className="py-3 px-3 text-white/50 font-mono text-xs">{sim.id}</td>
                        <td className="py-3 px-3 text-white/70">{sim.category}</td>
                        <td className="py-3 px-3 text-right text-white/50">{(sim.gross / 100).toFixed(2)} EUR</td>
                        <td className="py-3 px-3 text-right text-teal-400 font-medium">{(sim.payout / 100).toFixed(2)} EUR</td>
                        <td className="py-3 px-3 text-right text-amber-400">{(sim.platform / 100).toFixed(2)} EUR</td>
                        <td className="py-3 px-3 text-center">
                          {sim.integrity ? (
                            <CheckCircle className="h-4 w-4 text-emerald-400 mx-auto" />
                          ) : (
                            <AlertTriangle className="h-4 w-4 text-red-400 mx-auto" />
                          )}
                        </td>
                        <td className="py-3 px-3 text-center">
                          {sim.warnings > 0 ? (
                            <Badge variant="outline" className="border-amber-500/40 text-amber-400 text-[10px]">{sim.warnings}</Badge>
                          ) : (
                            <span className="text-white/20 text-xs">0</span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-right text-white/30 text-xs">{sim.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Security Guards Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Webhook Idempotency */}
            <Card className="bg-slate-900/60 border-white/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-white flex items-center gap-2 text-sm">
                  <Zap className="h-4 w-4 text-amber-400" />
                  {"Webhook Idempotency Guard"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { label: "Events processed (30j)", value: "847", status: "ok" },
                    { label: "Duplicates blocked", value: "3", status: "ok" },
                    { label: "Signature failures", value: "0", status: "ok" },
                    { label: "Reconciliation drift", value: "0.00%", status: "ok" },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between py-2 border-b border-white/[0.03] last:border-0">
                      <span className="text-white/50 text-xs">{item.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-white/70 text-sm font-medium">{item.value}</span>
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* KYC & Investment Guards */}
            <Card className="bg-slate-900/60 border-white/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-white flex items-center gap-2 text-sm">
                  <Fingerprint className="h-4 w-4 text-emerald-400" />
                  {"KYC & Investment Guards"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { label: "Self-invest attempts blocked", value: "2", status: "ok" },
                    { label: "Non-KYC invest blocked", value: "5", status: "ok" },
                    { label: "Minor invest blocked (>500EUR)", value: "1", status: "ok" },
                    { label: "Stripe Connect unverified blocked", value: "8", status: "warning" },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between py-2 border-b border-white/[0.03] last:border-0">
                      <span className="text-white/50 text-xs">{item.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-white/70 text-sm font-medium">{item.value}</span>
                        <span className={`w-2 h-2 rounded-full ${item.status === "ok" ? "bg-emerald-400" : "bg-amber-400"}`} />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Rule of 100 -- Universe Cycles */}
          <Card className="bg-slate-900/60 border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2 text-base">
                <Activity className="h-5 w-5 text-violet-400" />
                {"R\u00e8gle des 100 -- Cycles par Univers"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { universe: "Audiovisuel", icon: Film, color: "text-sky-400", bg: "bg-sky-500/15", cycle: 1, validated: 0, threshold: 100, status: "open" as const },
                  { universe: "Litt\u00e9raire", icon: FileText, color: "text-amber-400", bg: "bg-amber-500/15", cycle: 1, validated: 0, threshold: 100, status: "open" as const },
                  { universe: "Podcast", icon: Mic, color: "text-emerald-400", bg: "bg-emerald-500/15", cycle: 1, validated: 0, threshold: 100, status: "open" as const },
                ].map((u) => (
                  <div key={u.universe} className="bg-black/30 border border-white/5 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-lg ${u.bg} flex items-center justify-center`}>
                          <u.icon className={`h-4 w-4 ${u.color}`} />
                        </div>
                        <div>
                          <p className="text-white/80 text-sm font-medium">{u.universe}</p>
                          <p className="text-white/30 text-[10px]">Cession #{u.cycle}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className={u.status === "open" ? "border-emerald-500/40 text-emerald-400 text-[10px]" : "border-red-500/40 text-red-400 text-[10px]"}>
                        {u.status === "open" ? "Ouverte" : "Ferm\u00e9e"}
                      </Badge>
                    </div>
                    <div className="mb-2">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-white/40">{u.validated} / {u.threshold} valid\u00e9es</span>
                        <span className={u.color}>{Math.round((u.validated / u.threshold) * 100)}%</span>
                      </div>
                      <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${u.color === "text-sky-400" ? "bg-sky-400" : u.color === "text-amber-400" ? "bg-amber-400" : "bg-emerald-400"}`}
                          style={{ width: `${Math.min(100, (u.validated / u.threshold) * 100)}%` }}
                        />
                      </div>
                    </div>
                    <p className="text-[10px] text-white/25">{"Fermeture auto \u00e0 100 \u0153uvres valid\u00e9es"}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Integrity rules summary */}
          <Card className="bg-teal-500/5 border-teal-500/15">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Lock className="h-5 w-5 text-teal-400 shrink-0 mt-0.5" />
                <div className="space-y-2">
                  <p className="text-teal-400 font-medium text-sm">{"R\u00e8gles d'int\u00e9grit\u00e9 financi\u00e8re actives"}</p>
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 text-xs">
                    {[
                      "Simulation obligatoire avant chaque paiement",
                      "Idempotency keys sur chaque webhook Stripe",
                      "Auto-soutien interdit (guard serveur)",
                      "KYC obligatoire avant soutien financier",
                      "Plafond mineur cinq cents euros (sans consentement parental)",
                      "Stripe Connect charges_enabled requis",
                      "Integrity check = sum(users) + platform == gross",
                      "Batch mensuel unique le premier du mois",
                      "Audit trail complet (payout_simulations)",
                      "R\u00e8gle des 100: cession ferm\u00e9e auto \u00e0 100 \u0153uvres",
                    ].map((rule) => (
                      <div key={rule} className="flex items-start gap-1.5">
                        <CheckCircle className="h-3 w-3 text-teal-400/60 mt-0.5 shrink-0" />
                        <span className="text-white/50">{rule}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Wallet V3 Admin Tab */}
      {activeTab === "wallet" && (
        <div className="space-y-6">
          {/* Wallet Overview Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Volume total", value: "187 650 \u20ac", icon: Wallet2, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
              { label: "Retraits en attente", value: String(stats?.pendingPayouts ?? 23), icon: Clock, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
              { label: "Cautions actives", value: "1 247", icon: Shield, color: "text-sky-400", bg: "bg-sky-500/10", border: "border-sky-500/20" },
              { label: "VIXUpoints en circulation", value: "342 800", icon: Zap, color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" },
            ].map((s) => (
              <Card key={s.label} className={`${s.bg} border ${s.border}`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <s.icon className={`h-5 w-5 ${s.color}`} />
                    <span className={`text-xl font-bold ${s.color}`}>{s.value}</span>
                  </div>
                  <p className="text-white/50 text-xs">{s.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Recent Wallet Transactions */}
          <Card className="bg-slate-900/50 border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Activity className="h-5 w-5 text-emerald-400" />
                {"Transactions r\u00e9centes (tous wallets)"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { user: "Marie Stellaire", type: "Retrait", amount: "-350,00 \u20ac", status: "valid\u00e9", statusColor: "bg-emerald-500/20 text-emerald-400", time: "Il y a trois minutes" },
                  { user: "Lucas Nature", type: "Gain soutien", amount: "+120,50 \u20ac", status: "cr\u00e9dit\u00e9", statusColor: "bg-emerald-500/20 text-emerald-400", time: "Il y a sept minutes" },
                  { user: "F\u00e9lix Cin\u00e9ma", type: "Retrait", amount: "-1 200,00 \u20ac", status: "en revue", statusColor: "bg-amber-500/20 text-amber-400", time: "Il y a douze minutes" },
                  { user: "Sophie Drama", type: "Conversion VIXUpoints", amount: "+25,00 \u20ac", status: "cr\u00e9dit\u00e9", statusColor: "bg-emerald-500/20 text-emerald-400", time: "Il y a vingt minutes" },
                  { user: "Karim Ondes", type: "Caution rembours\u00e9e", amount: "-10,00 \u20ac", status: "rembours\u00e9", statusColor: "bg-sky-500/20 text-sky-400", time: "Il y a trente-cinq minutes" },
                  { user: "Pierre Michel", type: "Retrait", amount: "-480,00 \u20ac", status: "valid\u00e9", statusColor: "bg-emerald-500/20 text-emerald-400", time: "Il y a une heure" },
                  { user: "Amina Vision", type: "Gain cr\u00e9ateur", amount: "+890,00 \u20ac", status: "cr\u00e9dit\u00e9", statusColor: "bg-emerald-500/20 text-emerald-400", time: "Il y a deux heures" },
                ].map((tx, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/70 text-xs font-bold">
                        {tx.user.split(" ").map(n => n[0]).join("")}
                      </div>
                      <div>
                        <p className="text-white text-sm font-medium">{tx.user}</p>
                        <p className="text-white/40 text-xs">{tx.type} -- {tx.time}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-sm font-mono font-bold ${tx.amount.startsWith("+") ? "text-emerald-400" : "text-red-400"}`}>{tx.amount}</span>
                      <Badge className={`${tx.statusColor} text-xs`}>{tx.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Pending Large Withdrawals */}
          <Card className="bg-slate-900/50 border-amber-500/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-400" />
                {"Retraits en revue manuelle (\u2265 mille euros)"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { user: "F\u00e9lix Cin\u00e9ma", amount: "1 200,00 \u20ac", requested: "Il y a douze minutes", trustScore: 82 },
                  { user: "Romain Sc\u00e8ne", amount: "2 500,00 \u20ac", requested: "Il y a trois heures", trustScore: 91 },
                  { user: "Nadia Cam\u00e9ra", amount: "1 050,00 \u20ac", requested: "Il y a six heures", trustScore: 75 },
                ].map((w, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-amber-500/5 border border-amber-500/15">
                    <div>
                      <p className="text-white text-sm font-medium">{w.user}</p>
                      <p className="text-white/40 text-xs">{"Demand\u00e9 "}{w.requested} -- Trust Score : {w.trustScore}/100</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-amber-400 font-mono font-bold text-sm">{w.amount}</span>
                      <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-7 px-3">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Approuver
                      </Button>
                      <Button size="sm" variant="outline" className="border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs h-7 px-3">
                        <Ban className="h-3 w-3 mr-1" />
                        Refuser
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Wallet Health */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="bg-slate-900/50 border-white/10">
              <CardHeader>
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <Shield className="h-4 w-4 text-emerald-400" />
                  {"Sant\u00e9 du syst\u00e8me Wallet"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { label: "Stripe Connect", status: "Actif", ok: true },
                  { label: "File de paiement", status: "Nominal", ok: true },
                  { label: "Reversement mensuel", status: "Prochain : premier avril", ok: true },
                  { label: "Anomalies d\u00e9tect\u00e9es", status: "Aucune", ok: true },
                ].map((h) => (
                  <div key={h.label} className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02]">
                    <span className="text-white/60 text-sm">{h.label}</span>
                    <span className={`text-xs font-medium flex items-center gap-1 ${h.ok ? "text-emerald-400" : "text-red-400"}`}>
                      {h.ok ? <CheckCircle className="h-3 w-3" /> : <AlertOctagon className="h-3 w-3" />}
                      {h.status}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-white/10">
              <CardHeader>
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-sky-400" />
                  {"R\u00e9partition des fonds"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { label: "Wallets cr\u00e9ateurs", value: "98 200 \u20ac", pct: 52, color: "bg-red-400" },
                  { label: "Wallets soutiens", value: "67 450 \u20ac", pct: 36, color: "bg-emerald-400" },
                  { label: "Cautions bloqu\u00e9es", value: "18 700 \u20ac", pct: 10, color: "bg-amber-400" },
                  { label: "VIXUpoints (valeur)", value: "3 428 \u20ac", pct: 2, color: "bg-purple-400" },
                ].map((f) => (
                  <div key={f.label} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-white/60">{f.label}</span>
                      <span className="text-white/80 font-mono">{f.value}</span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div className={`h-full ${f.color} rounded-full`} style={{ width: `${f.pct}%` }} />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Timestamp */}
      {stats?.timestamp && (
        <p className="text-xs text-white/20 mt-8 text-right">
          {"Derniere actualisation :"} {new Date(stats.timestamp).toLocaleString("fr-FR")}
        </p>
      )}
    </div>
  )
}

/**
 * Composant VersionSwitchBanner - GROS bouton de bascule V1/V2/V3 pour le PATRON
 */
function VersionSwitchBanner() {
  const [currentVersion, setCurrentVersion] = useState<string>("V3")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch("/api/platform/version").then(r => r.json()).then(d => setCurrentVersion(d.version || "V3")).catch(() => {})
  }, [])

  const versionColors: Record<string, { border: string; bg: string; text: string; glow: string }> = {
    V1: { border: "border-emerald-400/60", bg: "from-emerald-900/40 via-teal-900/30 to-emerald-900/40", text: "text-emerald-300", glow: "shadow-emerald-500/20" },
    V2: { border: "border-amber-400/60", bg: "from-amber-900/40 via-orange-900/30 to-amber-900/40", text: "text-amber-300", glow: "shadow-amber-500/20" },
    V3: { border: "border-violet-400/60", bg: "from-violet-900/40 via-fuchsia-900/30 to-violet-900/40", text: "text-violet-300", glow: "shadow-violet-500/20" },
  }

  const colors = versionColors[currentVersion] || versionColors.V1

  return (
    <Link href="/admin/platform-state" className="block mb-6">
      <div className={`relative overflow-hidden rounded-2xl border-2 p-5 transition-all group ${colors.border} bg-gradient-to-r ${colors.bg} hover:shadow-xl ${colors.glow}`}>
        {/* Animated glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse" />

        <div className="relative flex items-center gap-5">
          {/* Icon */}
          <div className={`w-16 h-16 rounded-xl flex items-center justify-center bg-gradient-to-br ${
            currentVersion === "V1" ? "from-emerald-500 to-teal-600" :
            currentVersion === "V2" ? "from-amber-500 to-orange-600" :
            "from-violet-500 to-fuchsia-600"
          } shadow-lg`}>
            <Rocket className="h-8 w-8 text-white" />
          </div>

          {/* Text */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <h3 className="text-xl font-bold text-white">Stratification VIXUAL</h3>
              <span className={`text-sm uppercase tracking-wider px-3 py-1 rounded-full font-black ${
                currentVersion === "V1" ? "bg-emerald-500 text-white" :
                currentVersion === "V2" ? "bg-amber-500 text-black" :
                "bg-violet-500 text-white"
              }`}>
                {currentVersion}
              </span>
              <Sparkles className="h-5 w-5 text-amber-400 animate-pulse" />
            </div>
            <p className={`text-sm ${colors.text}`}>
              {currentVersion === "V1" && "Lancement — 4 profils (Invite/Visiteur/Porteur/Contributeur), videos, Pass Decouverte, boost visibilite"}
              {currentVersion === "V2" && "Croissance — 8 profils, ecrits + podcasts, paiement hybride 30%/70%, OAuth, commentaires"}
              {currentVersion === "V3" && "Pleine puissance — Vixual Social, Ticket Gold, Trust Score visible, IA Support, archives"}
            </p>
          </div>

          {/* Badge + Arrow */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-white/40 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
              Cliquer pour basculer
            </span>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-transform group-hover:translate-x-1 ${
              currentVersion === "V1" ? "bg-emerald-500/20 text-emerald-200" :
              currentVersion === "V2" ? "bg-amber-500/20 text-amber-200" :
              "bg-violet-500/20 text-violet-200"
            }`}>
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}

/**
 * Composant TestLabBanner - Gros bouton voyant pour le PATRON
 */
function TestLabBanner() {
  const testLab = useTestLabAccess()

  if (!testLab.showButton) return null

  return (
    <Link href="/admin/test-lab" className="block mb-6">
      <div className={`relative overflow-hidden rounded-2xl border-2 p-5 transition-all group ${
        testLab.canAccess
          ? "border-violet-400/60 bg-gradient-to-r from-violet-900/40 via-fuchsia-900/30 to-violet-900/40 hover:border-violet-300 hover:shadow-xl hover:shadow-violet-500/20"
          : "border-violet-500/20 bg-violet-950/30 hover:border-violet-500/40"
      }`}>
        {/* Animated glow effect */}
        {testLab.canAccess && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-violet-500/10 to-transparent animate-pulse" />
        )}

        <div className="relative flex items-center gap-5">
          {/* Icon container */}
          <div className={`w-16 h-16 rounded-xl flex items-center justify-center ${
            testLab.canAccess
              ? "bg-gradient-to-br from-violet-500 to-fuchsia-600 shadow-lg shadow-violet-500/30"
              : "bg-violet-800/30"
          }`}>
            <FlaskConical className={`h-8 w-8 ${testLab.canAccess ? "text-white" : "text-violet-400/50"}`} />
          </div>

          {/* Text content */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <h3 className={`text-xl font-bold ${testLab.canAccess ? "text-white" : "text-violet-300/70"}`}>
                Laboratoire de Tests
              </h3>
              <span className={`text-xs uppercase tracking-wider px-2.5 py-1 rounded-full font-bold ${
                testLab.canAccess
                  ? "bg-violet-500 text-white"
                  : "bg-violet-800/50 text-violet-400/70"
              }`}>
                Patron Only
              </span>
              {testLab.canAccess && (
                <Sparkles className="h-5 w-5 text-amber-400 animate-pulse" />
              )}
            </div>
            <p className={`text-sm ${testLab.canAccess ? "text-violet-200/80" : "text-violet-400/50"}`}>
              {testLab.canAccess
                ? "Testez Stripe, Bunny et les scenarios de paiement en mode isole"
                : testLab.blockedReason || "Acces restreint"}
            </p>
          </div>

          {/* Arrow indicator */}
          <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-transform group-hover:translate-x-1 ${
            testLab.canAccess
              ? "bg-violet-500/20 text-violet-200"
              : "bg-violet-800/20 text-violet-500/30"
          }`}>
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  )
}
