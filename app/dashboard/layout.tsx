"use client"

import { ReactNode } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Star,
  Heart,
  Film,
  FileText,
  Mic,
  Wallet,
  Wallet2,
  History,
  Settings,
  Upload,
  Sparkles,
  Ticket,
} from "lucide-react"
import { VisualHeader } from "@/components/visual-header"
import { useAuth } from "@/lib/auth-context"
import { cn } from "@/lib/utils"

const SIDEBAR_ITEMS: { label: string; href: string; icon: any; roles: string[]; accent?: boolean }[] = [
  {
    label: "Tableau de bord",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["visitor", "porter", "contributor", "infoporter", "contribureader", "podcaster", "listener"],
  },
  {
    label: "Mes VIXUpoints",
    href: "/dashboard/visupoints",
    icon: Star,
    roles: ["visitor", "contribureader", "listener"],
  },
  {
    label: "Pass Decouverte",
    href: "/dashboard/visitor",
    icon: Ticket,
    roles: ["visitor", "contribureader", "listener"],
    accent: true,
  },
  {
    label: "Mes favoris",
    href: "/dashboard/favorites",
    icon: Heart,
    roles: ["visitor", "porter", "contributor", "infoporter", "contribureader", "podcaster", "listener"],
  },
  {
    label: "Ma progression",
    href: "/dashboard/creator",
    icon: Sparkles,
    roles: ["porter", "infoporter", "podcaster"],
    accent: true,
  },
  {
    label: "Mes projets (video)",
    href: "/dashboard/projects?type=video",
    icon: Film,
    roles: ["porter"],
  },
  {
    label: "Mes ecrits",
    href: "/dashboard/projects?type=text",
    icon: FileText,
    roles: ["infoporter"],
  },
  {
    label: "Mes podcasts",
    href: "/dashboard/projects?type=podcast",
    icon: Mic,
    roles: ["podcaster"],
  },
  {
    label: "Mes contributions",
    href: "/dashboard/contributions",
    icon: Wallet,
    roles: ["contributor", "contribureader", "listener"],
  },
  {
    label: "Mon Wallet V3",
    href: "/dashboard/wallet",
    icon: Wallet2,
    roles: ["porter", "contributor", "infoporter", "contribureader", "podcaster", "listener"],
    accent: true,
  },
  {
    label: "Historique",
    href: "/dashboard/history",
    icon: History,
    roles: ["porter", "contributor", "infoporter", "contribureader", "podcaster", "listener"],
  },
  {
    label: "Deposer une video",
    href: "/upload",
    icon: Upload,
    roles: ["porter"],
  },
  {
    label: "Deposer un ecrit",
    href: "/upload/text",
    icon: Upload,
    roles: ["infoporter"],
  },
  {
    label: "Deposer un podcast",
    href: "/upload/podcast",
    icon: Upload,
    roles: ["podcaster"],
  },
  {
    label: "Parametres",
    href: "/dashboard/settings",
    icon: Settings,
    roles: ["visitor", "porter", "investor", "infoporter", "investireader", "podcaster", "listener"],
  },
]

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const { roles, isAuthed } = useAuth()

  const visibleItems = SIDEBAR_ITEMS.filter(
    (item) => item.roles.some((r) => roles.includes(r as any)) || !isAuthed
  )

  return (
    <div className="min-h-screen bg-slate-950">
      <VisualHeader />

      <div className="flex pt-20">
        {/* Sidebar */}
        <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r border-white/10 bg-slate-900/50 min-h-[calc(100vh-5rem)] sticky top-20 cinema-sidebar">
          <nav className="flex-1 p-4 space-y-1">
            {visibleItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/dashboard" && pathname.startsWith(item.href.split("?")[0]))
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all",
                    item.accent && !isActive && "border border-emerald-500/25 bg-emerald-500/5 text-emerald-400 hover:bg-emerald-500/15 hover:border-emerald-500/40",
                    item.accent && isActive && "border border-emerald-500/40 bg-emerald-600/25 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.15)]",
                    !item.accent && isActive && "bg-emerald-600/20 text-emerald-400",
                    !item.accent && !isActive && "text-white/70 hover:bg-white/5 hover:text-white",
                  )}
                >
                  <item.icon className={cn("h-5 w-5", item.accent && "drop-shadow-[0_0_4px_rgba(16,185,129,0.4)]")} />
                  <span className={cn("text-sm font-medium", item.accent && "font-semibold")}>{item.label}</span>
                  {item.accent && (
                    <span className="ml-auto text-[10px] font-bold bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded">
                      V3
                    </span>
                  )}
                </Link>
              )
            })}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-6 lg:p-8 cinema-section">{children}</main>
      </div>
    </div>
  )
}
