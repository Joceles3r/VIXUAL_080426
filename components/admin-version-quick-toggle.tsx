"use client"

import { useState, useEffect, useRef } from "react"
import { createPortal } from "react-dom"
import { useAuth } from "@/lib/auth-context"
import { ChevronDown, Rocket, Users, Sparkles, Check } from "lucide-react"
import type { PlatformVersion } from "@/lib/platform/version"
import { invalidatePlatformVersionCache } from "@/hooks/use-platform-version"

const VERSIONS_INFO = [
  { id: "V1" as const, label: "V1 - Lancement", icon: Rocket, color: "fuchsia" },
  { id: "V2" as const, label: "V2 - Croissance", icon: Users, color: "red" },
  { id: "V3" as const, label: "V3 - Pleine puissance", icon: Sparkles, color: "emerald" },
]

export function AdminVersionQuickToggle() {
  const { user, isAdmin } = useAuth()
  const [current, setCurrent] = useState<PlatformVersion>("V3")
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState<PlatformVersion | null>(null)
  const [mounted, setMounted] = useState(false)
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!isAdmin) return
    fetch("/api/platform/version")
      .then((r) => r.json())
      .then((d) => {
        const v = (d.version as PlatformVersion) ?? "V3"
        setCurrent(v)
        if (typeof document !== "undefined") {
          document.documentElement.setAttribute("data-version", v)
        }
      })
      .catch(() => {})
  }, [isAdmin])

  // Recalculer la position du dropdown quand on l'ouvre + au scroll/resize
  useEffect(() => {
    if (!open) return
    const updateCoords = () => {
      const rect = buttonRef.current?.getBoundingClientRect()
      if (!rect) return
      // Aligner le bord droit du dropdown avec le bord droit du bouton
      // (le dropdown fait 256px = w-64)
      const DROPDOWN_WIDTH = 256
      setCoords({
        top: rect.bottom + 8,
        left: Math.max(8, rect.right - DROPDOWN_WIDTH),
      })
    }
    updateCoords()
    window.addEventListener("scroll", updateCoords, true)
    window.addEventListener("resize", updateCoords)
    return () => {
      window.removeEventListener("scroll", updateCoords, true)
      window.removeEventListener("resize", updateCoords)
    }
  }, [open])

  if (!isAdmin) return null

  const switchTo = async (version: PlatformVersion) => {
    if (version === current || loading) return
    setLoading(version)
    try {
      const res = await fetch("/api/platform/version", {
        method: "POST",
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
          "x-admin-email": user?.email ?? "",
        },
        body: JSON.stringify({ version, reason: "Bascule rapide via toggle admin" }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        console.error("[v0] Bascule de version refusee:", res.status, data)
        return
      }

      // 1. Theme CSS instantane
      if (typeof document !== "undefined") {
        document.documentElement.setAttribute("data-version", version)
      }
      // 2. Notifier tous les hooks usePlatformVersion deja montes
      invalidatePlatformVersionCache(version)
      // 3. Etat local
      setCurrent(version)
      setOpen(false)
    } catch (err) {
      console.error("[v0] Erreur bascule version:", err)
    } finally {
      setLoading(null)
    }
  }

  const currentInfo = VERSIONS_INFO.find((v) => v.id === current) ?? VERSIONS_INFO[2]
  const CurrentIcon = currentInfo.icon

  // Le menu est rendu dans un Portal vers document.body pour echapper a
  // tous les stacking contexts (sidebar sticky, nav overflow-y-auto, etc.)
  const dropdown = open && coords && (
    <>
      <div
        className="fixed inset-0 z-[9998]"
        onClick={() => setOpen(false)}
      />
      <div
        className="fixed z-[9999] w-64 bg-slate-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden"
        style={{ top: coords.top, left: coords.left }}
        role="menu"
      >
        <div className="p-3 border-b border-white/10">
          <p className="text-white/40 text-[10px] uppercase tracking-wider">
            Bascule rapide de version
          </p>
          <p className="text-white/60 text-[11px] mt-0.5">
            Application instantanee du theme.
          </p>
        </div>
        {VERSIONS_INFO.map((v) => {
          const Icon = v.icon
          const isCurrent = v.id === current
          const isLoading = loading === v.id
          const colorClasses =
            v.color === "fuchsia"
              ? "bg-fuchsia-500/10 border-fuchsia-500/30 text-fuchsia-300"
              : v.color === "red"
              ? "bg-red-500/10 border-red-500/30 text-red-300"
              : "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
          return (
            <button
              key={v.id}
              type="button"
              onClick={() => switchTo(v.id)}
              disabled={isCurrent || isLoading}
              className={`w-full flex items-center gap-3 p-3 text-left transition-colors hover:bg-white/5 disabled:opacity-100 disabled:cursor-default ${
                isCurrent ? "bg-white/5" : "cursor-pointer"
              }`}
              role="menuitem"
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center border shrink-0 ${colorClasses}`}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-xs font-medium truncate">{v.label}</p>
                {isLoading && <p className="text-white/40 text-[10px]">Bascule en cours...</p>}
                {isCurrent && !isLoading && (
                  <p className="text-white/40 text-[10px]">Version actuelle</p>
                )}
              </div>
              {isCurrent && <Check className="h-4 w-4 text-emerald-400 shrink-0" />}
            </button>
          )
        })}
        <div className="p-2 border-t border-white/10 bg-slate-950/50">
          <a
            href="/admin/platform-state"
            className="text-white/40 text-[10px] hover:text-white/60 block text-center"
          >
            Voir les details par version
          </a>
        </div>
      </div>
    </>
  )

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all text-xs font-medium ${
          current === "V1"
            ? "bg-fuchsia-500/15 border-fuchsia-500/40 text-fuchsia-200 hover:bg-fuchsia-500/25 shadow-[0_0_15px_rgba(217,70,239,0.3)]"
            : current === "V2"
            ? "bg-red-500/15 border-red-500/40 text-red-200 hover:bg-red-500/25 shadow-[0_0_12px_rgba(229,9,20,0.25)]"
            : "bg-emerald-500/15 border-emerald-500/40 text-emerald-200 hover:bg-emerald-500/25"
        }`}
        aria-label="Basculer entre les versions"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <CurrentIcon className="h-3.5 w-3.5" />
        <span>{current}</span>
        <ChevronDown className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {mounted && dropdown ? createPortal(dropdown, document.body) : null}
    </>
  )
}
