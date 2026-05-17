/**
 * COMPOSANT STRUCTUREL VIXUAL
 * Layout admin / patron (gate role admin + sidebar).
 * Modifier avec prudence : impact toutes les sous-routes /admin/*.
 */
"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import Link from "next/link"
import {
  Shield,
  BarChart3,
  Users,
  DollarSign,
  AlertTriangle,
  Settings,
  ArrowLeft,
  Lock,
  UserCog,
  ShieldAlert,
  Crown,
  Zap,
  Brain,
  Orbit,
  TrendingUp,
  CreditCard,
  Eye,
  Building2,
  Mail,
  Bot,
  UsersRound,
  FlaskConical,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTestLabAccess } from "@/lib/test-lab/use-test-lab-access"
import { AdminVersionQuickToggle } from "@/components/admin-version-quick-toggle"
import { AdminAutoLogout } from "@/components/admin/auto-logout"

const ADMIN_NAV = [
  { label: "Tableau de bord", href: "/admin", icon: BarChart3 },
  // ADMIN/PATRON + Employes Module
  { label: "ADMIN/PATRON + Employes", href: "/admin/employees", icon: UsersRound, employees: true },
  { label: "Messages Support", href: "/admin/messages", icon: Mail, messages: true },
  { label: "Support IA", href: "/admin/support", icon: Bot, support: true },
  // Existing modules
  { label: "ORBIT Engine", href: "/admin/orbit-engine", icon: Orbit, highlight: true },
  { label: "Financial Brain", href: "/admin/financial-brain", icon: Brain },
  { label: "Visibility Engine", href: "/admin/visibility-engine", icon: Eye, visibility: true },
  // Stripe modules (sous Visibility Engine)
  { label: "Config Stripe", href: "/admin/stripe", icon: CreditCard, stripe: true },
  { label: "Stripe Connect", href: "/admin/stripe-connect", icon: Building2, stripe: true },
  // Suite modules
  { label: "SEO + Growth", href: "/admin/seo-growth", icon: TrendingUp, highlight: true },
  { label: "Centre de Controle", href: "/admin/security", icon: ShieldAlert, critical: true },
  { label: "Gestion Roles", href: "/admin/roles", icon: UserCog },
  { label: "Utilisateurs", href: "/admin#users", icon: Users },
  { label: "Paiements", href: "/admin#payouts", icon: DollarSign },
  { label: "Signalements", href: "/admin#reports", icon: AlertTriangle },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, isAuthed, isLoading } = useAuth()
  const router = useRouter()
  const testLab = useTestLabAccess()

  useEffect(() => {
    // FIX BASCULE V1/V2/V3 :
    // Ne JAMAIS rediriger tant que la restauration de session est en cours.
    // Sinon `router.refresh()` (declenche par le toggle de version) demonte
    // brievement le AuthProvider, isAuthed redevient false ~10ms et la
    // redirection vers /login se declenche => deconnexion silencieuse.
    if (isLoading) return

    if (!isAuthed) {
      router.replace("/login")
    } else if (!isAdmin) {
      router.replace("/dashboard")
    }
  }, [isAuthed, isAdmin, isLoading, router])

  // Loader pendant la restauration de session OU si non-admin (avant redirection)
  if (isLoading || !isAuthed || !isAdmin) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <Lock className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-white/60 text-lg">{"Vérification des droits d'accès..."}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900/80 border-r border-amber-500/30 flex flex-col shrink-0 sticky top-0 h-screen">
        {/* Admin header */}
        <div className="p-5 border-b border-amber-500/30 bg-gradient-to-r from-amber-500/10 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 border border-amber-300 flex items-center justify-center shadow-lg shadow-amber-500/30">
              <Crown className="h-7 w-7 text-amber-950 fill-amber-950" strokeWidth={2.2} />
            </div>
            <div>
              <p className="text-sm font-bold text-amber-400">ADMIN / PATRON</p>
              <p className="text-xs text-white/50 truncate max-w-[130px]">{user?.email}</p>
            </div>
          </div>
          {/* Bascule rapide de version */}
          <div className="mt-3 flex justify-end">
            <AdminVersionQuickToggle />
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 flex flex-col gap-1 overflow-y-auto">
          {ADMIN_NAV.map((item) => {
            const isStripe = (item as { stripe?: boolean }).stripe
            const isVisibility = (item as { visibility?: boolean }).visibility
            const isEmployees = (item as { employees?: boolean }).employees
            const isMessages = (item as { messages?: boolean }).messages
            const isSupport = (item as { support?: boolean }).support
            return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                item.critical
                  ? "text-rose-300 bg-rose-500/10 border border-rose-500/40 hover:bg-rose-500/20"
                  : isEmployees
                  ? "text-orange-300 bg-orange-500/10 border border-orange-500/40 hover:bg-orange-500/20"
                  : isMessages
                  ? "text-sky-300 bg-sky-500/10 border border-sky-500/40 hover:bg-sky-500/20"
                  : isSupport
                  ? "text-emerald-300 bg-emerald-500/10 border border-emerald-500/40 hover:bg-emerald-500/20"
                  : isStripe
                  ? "text-violet-300 bg-violet-500/10 border border-violet-500/40 hover:bg-violet-500/20"
                  : isVisibility
                  ? "text-fuchsia-300 bg-fuchsia-500/10 border border-fuchsia-500/40 hover:bg-fuchsia-500/20"
                  : item.highlight
                  ? "text-amber-300 bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20"
                  : "text-white/60 hover:text-white hover:bg-amber-500/10"
              }`}
            >
              <item.icon className={`h-4 w-4 ${
                item.critical ? "text-rose-400" 
                : isEmployees ? "text-orange-400" 
                : isMessages ? "text-sky-400" 
                : isSupport ? "text-emerald-400" 
                : isStripe ? "text-violet-400" 
                : isVisibility ? "text-fuchsia-400" 
                : item.highlight ? "text-amber-400" 
                : "text-amber-400/60"
              }`} />
              {item.label}
              {item.critical && (
                <span className="ml-auto text-xs bg-rose-500 text-white px-1.5 py-0.5 rounded font-semibold">
                  !
                </span>
              )}
              {isMessages && (
                <span className="ml-auto text-xs bg-sky-500 text-white px-1.5 py-0.5 rounded font-semibold">
                  3
                </span>
              )}
            </Link>
          )})}

          {/* Test Lab - TOUJOURS visible pour les admins */}
          {testLab.showButton && (
            <Link
              href="/admin/test-lab"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all mt-4 ${
                testLab.canAccess
                  ? "text-violet-100 bg-gradient-to-r from-violet-600/40 to-fuchsia-600/40 border-2 border-violet-400/60 hover:border-violet-300 hover:shadow-lg hover:shadow-violet-500/20 animate-pulse"
                  : "text-violet-300/60 bg-violet-900/20 border border-violet-500/20 hover:bg-violet-800/30"
              }`}
            >
              <FlaskConical className={`h-5 w-5 ${testLab.canAccess ? "text-violet-200" : "text-violet-400/50"}`} />
              <div className="flex flex-col flex-1">
                <span className="font-semibold">Laboratoire de Tests</span>
                {testLab.blockedReason && (
                  <span className="text-[10px] text-violet-400/60">{testLab.blockedReason}</span>
                )}
              </div>
              <span className={`text-[10px] uppercase tracking-wider px-2 py-1 rounded font-bold ${
                testLab.canAccess
                  ? "bg-violet-500 text-white"
                  : "bg-violet-800/50 text-violet-400/70"
              }`}>
                Patron
              </span>
            </Link>
          )}
        </nav>

        {/* Bottom actions */}
        <div className="p-3 border-t border-red-500/20 flex flex-col gap-2">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="w-full justify-start text-white/40 hover:text-white hover:bg-white/5">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour au dashboard
            </Button>
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>

      {/* Auto-logout admin apres 30min inactivite */}
      <AdminAutoLogout />
    </div>
  )
}
