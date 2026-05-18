"use client"

import { useEffect, useRef, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Clock } from "lucide-react"

const TIMEOUT_MS = 30 * 60 * 1000 // 30 minutes
const WARN_BEFORE_MS = 60 * 1000 // avertir 1 min avant

/**
 * Auto-logout pour les sessions ADMIN/PATRON apres 30 min d'inactivite.
 * Affiche un avertissement 1 minute avant la deconnexion.
 *
 * Monte dans /admin/layout.tsx pour ne tracker l'inactivite QUE sur les routes admin.
 */
export function AdminAutoLogout() {
  const { user, logout } = useAuth() as { user: { email?: string } | null; logout?: () => void | Promise<void> }
  const lastActivityRef = useRef<number>(Date.now())
  const [warning, setWarning] = useState(false)
  const [secondsLeft, setSecondsLeft] = useState(60)

  useEffect(() => {
    if (!user?.email) return

    const updateActivity = () => {
      lastActivityRef.current = Date.now()
      if (warning) setWarning(false)
    }

    const events: Array<keyof DocumentEventMap> = ["mousedown", "keydown", "scroll", "touchstart"]
    events.forEach((e) => document.addEventListener(e, updateActivity, { passive: true }))

    const interval = setInterval(() => {
      const idle = Date.now() - lastActivityRef.current
      if (idle >= TIMEOUT_MS) {
        clearInterval(interval)
        // Deconnexion forcee
        if (typeof logout === "function") {
          void logout()
        }
        if (typeof window !== "undefined") {
          window.location.href = "/login?reason=timeout"
        }
      } else if (idle >= TIMEOUT_MS - WARN_BEFORE_MS) {
        const remain = Math.max(0, Math.ceil((TIMEOUT_MS - idle) / 1000))
        setSecondsLeft(remain)
        setWarning(true)
      }
    }, 5000)

    return () => {
      events.forEach((e) => document.removeEventListener(e, updateActivity))
      clearInterval(interval)
    }
  }, [user?.email, logout, warning])

  if (!user?.email) return null

  return (
    <Dialog open={warning} onOpenChange={() => { /* ne se ferme que par activite */ }}>
      <DialogContent className="bg-slate-900 border-amber-500/40 text-white sm:max-w-md">
        <DialogHeader>
          <div className="w-12 h-12 rounded-full bg-amber-500/15 flex items-center justify-center mb-2">
            <Clock className="h-6 w-6 text-amber-400 animate-pulse" />
          </div>
          <DialogTitle>Session sur le point d&apos;expirer</DialogTitle>
          <DialogDescription className="text-white/65 leading-relaxed pt-1">
            Vous serez deconnecte automatiquement dans <span className="font-bold text-amber-300">{secondsLeft}s</span> par securite.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            onClick={() => { lastActivityRef.current = Date.now(); setWarning(false) }}
            className="bg-amber-500 hover:bg-amber-600 text-black font-bold w-full"
          >
            Rester connecte
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
