/**
 * COMPOSANT STRUCTUREL VIXUAL
 * Header public partage par toutes les pages.
 * Modifier avec prudence : impact global navigation/pages.
 */
"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { ReportButton } from "@/components/report-button"
import { VisualSlogan } from "@/components/vixual-slogan"
import {
  ChevronDown,
  Eye,
  LogIn,
  UserPlus,
  Shield,
  Menu,
  X,
  LogOut,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LanguageSelector } from "@/components/language-selector"
import { SoundToggle } from "@/components/sound-toggle"
import {
  ADMIN_ITEM,
  DISCOVER_MENU,
  EXPLORE_MENU,
  MY_SPACE_MENU,
  hasAnyRole,
  type NavItem,
  type VixualRole,
} from "@/components/navigation"
import { useAuth } from "@/lib/auth-context"
import { MinorStatusBadge } from "@/components/minors/minor-status-badge"

function MenuBlock({
  label,
  items,
  roles,
}: {
  label: string
  items: NavItem[]
  roles: VixualRole[]
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const visibleItems = items.filter((it) => hasAnyRole(roles, it.roles))

  if (visibleItems.length === 0) return null

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="bg-slate-800/50 hover:bg-slate-700/60 text-white rounded-lg border border-white/10 h-10 px-5 text-sm font-medium transition-all duration-300 hover:border-emerald-500/50"
        >
          {label}
          <ChevronDown className="ml-2 h-4 w-4 opacity-70" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-80 bg-gradient-to-b from-slate-900 to-slate-950 border-emerald-500/30 text-white backdrop-blur-2xl shadow-2xl">
        <DropdownMenuLabel className="text-emerald-400 text-base font-bold">
          {label}
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-white/10" />
        {visibleItems.map((it) => {
          const Icon = it.icon
          return (
            <DropdownMenuItem
              key={it.href + it.label}
              className="focus:bg-emerald-600/30 focus:text-white cursor-pointer group py-3"
              onSelect={(e) => {
                e.preventDefault()
                setOpen(false)
                // Use window.location for query-param navigation on same path
                // to guarantee a full re-render (router.push doesn't always
                // trigger useSearchParams updates on same-path nav)
                const target = new URL(it.href, window.location.origin)
                const current = new URL(window.location.href)
                if (target.pathname === current.pathname) {
                  // Same path, possibly different query params -- force refresh
                  router.replace(it.href, { scroll: false })
                  // Dispatch a custom event so the explore page picks it up
                  setTimeout(() => {
                    window.dispatchEvent(new Event("visual-nav"))
                  }, 50)
                } else {
                  router.push(it.href)
                }
              }}
            >
              {Icon ? (
                <Icon className="mr-3 h-5 w-5 text-emerald-400 group-hover:scale-110 transition-transform" />
              ) : null}
              <span className="font-medium">{it.label}</span>
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function MobileMenu({
  isOpen,
  onClose,
  roles,
  isAuthed,
  isAdmin,
  onLogout,
}: {
  isOpen: boolean
  onClose: () => void
  roles: VixualRole[]
  isAuthed: boolean
  isAdmin: boolean
  onLogout: () => void
}) {
  const router = useRouter()

  if (!isOpen) return null

  const allMenus = [DISCOVER_MENU, EXPLORE_MENU]
  if (isAuthed) {
    allMenus.push(MY_SPACE_MENU)
  }

  const navigateTo = (href: string) => {
    onClose()
    const target = new URL(href, window.location.origin)
    const current = new URL(window.location.href)
    if (target.pathname === current.pathname) {
      router.replace(href, { scroll: false })
      setTimeout(() => {
        window.dispatchEvent(new Event("visual-nav"))
      }, 50)
    } else {
      router.push(href)
    }
  }

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="absolute right-0 top-0 bottom-0 w-80 bg-gradient-to-b from-slate-900 to-slate-950 border-l border-emerald-500/20 overflow-y-auto">
        <div className="p-4 border-b border-white/10">
          <div className="flex justify-between items-center">
            <span className="text-xl font-bold text-white">Menu</span>
            <Button variant="ghost" size="icon" onClick={onClose} className="text-white">
              <X className="h-6 w-6" />
            </Button>
          </div>
          <div className="mt-2 text-center">
            <VisualSlogan size="xs" opacity="medium" />
          </div>
        </div>

        <div className="p-4 space-y-6">
          {allMenus.map((menu) => {
            const visibleItems = menu.items.filter((it) =>
              hasAnyRole(roles, it.roles)
            )
            if (visibleItems.length === 0) return null

            return (
              <div key={menu.label}>
                <h3 className="text-emerald-400 font-bold mb-3">{menu.label}</h3>
                <div className="space-y-1">
                  {visibleItems.map((item) => {
                    const Icon = item.icon
                    return (
                      <button
                        key={item.href + item.label}
                        onClick={() => navigateTo(item.href)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-emerald-600/20 text-white/90 hover:text-white transition-colors text-left"
                      >
                        {Icon && <Icon className="h-5 w-5 text-emerald-400" />}
                        <span>{item.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}

          {isAdmin && (
            <div>
              <h3 className="text-amber-400 font-bold mb-3">Administration</h3>
              <Link
                href={ADMIN_ITEM.href}
                onClick={onClose}
                className="relative overflow-hidden flex items-center gap-3 px-3 py-2.5 rounded-lg bg-amber-900/20 border border-amber-400/30 text-white hover:bg-amber-800/30 transition-colors animate-admin-glow"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-400/20 to-transparent animate-admin-shine" />
                <Shield className="h-5 w-5 text-red-500 animate-pulse drop-shadow-[0_0_6px_rgba(239,68,68,0.7)]" />
                <span className="relative z-10 bg-gradient-to-r from-amber-300 to-red-400 bg-clip-text text-transparent font-bold">{ADMIN_ITEM.label}</span>
              </Link>
            </div>
          )}

          <div className="pt-4 border-t border-white/10 space-y-2">
            {isAuthed ? (
              <>
                <div className="flex justify-center mb-2">
                  <MinorStatusBadge />
                </div>
                <div className="flex justify-center mb-2">
                  <ReportButton
                    targetId="general"
                    targetType="content"
                    targetName="Signalement g\u00e9n\u00e9ral"
                    variant="full"
                    size="sm"
                  />
                </div>
                <Button
                  onClick={() => {
                    onLogout()
                    onClose()
                  }}
                  className="w-full bg-red-600/20 hover:bg-red-600/40 text-red-400 border border-red-500/30"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  {"D\u00e9connexion"}
                </Button>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 text-slate-400 text-sm mb-2 justify-center">
                  <Eye className="h-4 w-4" />
                  <span>Vous naviguez en tant qu'invite</span>
                </div>
                <Link href="/login" onClick={onClose} className="block">
                  <Button
                    variant="outline"
                    className="w-full bg-transparent border-white/20 text-white hover:bg-white/10"
                  >
                    <LogIn className="mr-2 h-4 w-4" />
                    Connexion
                  </Button>
                </Link>
                <Link href="/signup" onClick={onClose} className="block">
                  <Button className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Inscription
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export function VisualHeader() {
  const { user, isAuthed, isAdmin, roles, logout } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const effectiveRoles = useMemo<VixualRole[]>(() => {
    if (!isAuthed) return ["guest"]
    const r = roles?.length ? roles : ["visitor"]
    return r.includes("guest") ? r.filter((x) => x !== "guest") : r
  }, [isAuthed, roles])

  // isAdmin vient du auth context, pas des roles de profil

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/98 via-slate-950/98 to-slate-900/98 backdrop-blur-2xl border-b border-white/10 h-20 shadow-xl cinema-header-glow" />

        <div className="container mx-auto px-4 md:px-6 h-20 relative flex items-center justify-between gap-4">
          {/* Logo + Slogan */}
          <div className="flex items-center gap-3 md:gap-4 z-10 shrink-0">
              <Link href="/" className="flex items-center gap-3 group shrink-0">
              <div className="relative">
                <span className="text-2xl md:text-3xl font-black tracking-tight text-white drop-shadow-lg">
                  <span className="text-red-500">V</span>
                  <span className="text-amber-400">I</span>
                  <span className="text-emerald-400">X</span>
                  <span className="text-teal-400">U</span>
                  <span className="text-sky-400">A</span>
                  <span className="text-indigo-400">L</span>
                </span>
                <div className="absolute -bottom-1 left-0 right-0 h-[2px] bg-gradient-to-r from-red-500 via-emerald-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            </Link>

            {/* Slogan */}
            <div className="hidden sm:flex items-center">
              <div className="w-px h-6 bg-white/15 mr-3 md:mr-4" />
              <VisualSlogan size="sm" opacity="high" />
            </div>
          </div>

          {/* Menus principaux (desktop) */}
          <div className="hidden md:flex items-center gap-2 z-10">
            <MenuBlock
              label={DISCOVER_MENU.label}
              items={DISCOVER_MENU.items}
              roles={effectiveRoles}
            />
            <MenuBlock
              label={EXPLORE_MENU.label}
              items={EXPLORE_MENU.items}
              roles={effectiveRoles}
            />
            {isAuthed && (
              <MenuBlock
                label={MY_SPACE_MENU.label}
                items={MY_SPACE_MENU.items}
                roles={effectiveRoles}
              />
            )}

            {isAdmin && (
              <Link href={ADMIN_ITEM.href}>
                <Button
                  variant="ghost"
                  className="relative overflow-hidden bg-amber-900/30 hover:bg-amber-800/50 text-white rounded-lg border border-amber-400/40 h-10 px-5 text-sm font-semibold hover:border-amber-400/80 animate-admin-glow"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-400/25 to-transparent animate-admin-shine" />
                  <Shield className="mr-2 h-4 w-4 text-red-500 animate-pulse drop-shadow-[0_0_6px_rgba(239,68,68,0.7)]" />
                  <span className="relative z-10 bg-gradient-to-r from-amber-300 to-red-400 bg-clip-text text-transparent font-bold">Administration</span>
                </Button>
              </Link>
            )}
          </div>

          {/* Actions (toujours visibles) */}
  <div className="flex items-center gap-2 z-10">
  <div className="shrink-0">
  <SoundToggle />
  </div>
  <div className="shrink-0">
  <LanguageSelector />
  </div>

            {isAuthed ? (
              <>
                {/* Report alert button (always visible when logged in) */}
                <div className="hidden md:block">
                  <ReportButton
                    targetId="general"
                    targetType="content"
                    targetName="Signalement g\u00e9n\u00e9ral"
                    variant="icon"
                    size="sm"
                  />
                </div>

                {/* Minor status badge */}
                <div className="hidden md:block">
                  <MinorStatusBadge />
                </div>

                {/* User info desktop */}
                <div className="hidden md:flex items-center gap-2">
                  <span className="text-white/70 text-sm truncate max-w-[120px]">
                    {user?.name}
                  </span>
                  <Button
                    onClick={logout}
                    variant="ghost"
                    className="bg-white/5 hover:bg-red-600/20 text-white rounded-lg border border-white/10 h-10 px-4 text-sm font-medium hover:border-red-500/50 hover:text-red-400"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Déconnexion
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="hidden md:flex items-center gap-1.5 text-slate-400 text-xs mr-1">
                  <Eye className="h-3.5 w-3.5" />
                  <span>Invite</span>
                </div>
                <Link href="/login" className="shrink-0 hidden md:block">
                  <Button
                    variant="ghost"
                    className="bg-white/5 hover:bg-white/10 text-white rounded-lg border border-white/10 h-10 px-4 text-sm font-medium hover:border-emerald-500/50"
                  >
                    <LogIn className="mr-2 h-4 w-4" />
                    Connexion
                  </Button>
                </Link>

                <Link href="/signup" className="shrink-0 hidden md:block">
                  <Button className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-lg border border-white/20 h-10 px-5 text-sm font-bold shadow-lg transition-all duration-300 hover:shadow-emerald-900/40">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Inscription
                  </Button>
                </Link>
              </>
            )}

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden h-10 w-10 bg-white/5 hover:bg-white/10 text-white border border-white/10"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <MobileMenu
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        roles={effectiveRoles}
        isAuthed={isAuthed}
        isAdmin={isAdmin}
        onLogout={logout}
      />
    </>
  )
}
