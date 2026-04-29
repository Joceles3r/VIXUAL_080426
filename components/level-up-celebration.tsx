"use client"
import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { Sparkles, X, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export function LevelUpCelebration() {
  const { user } = useAuth()
  const [show, setShow] = useState(false)
  const [newLevel, setNewLevel] = useState<number>(1)

  useEffect(() => {
    if (!user?.id) return
    fetch(`/api/users/${user.id}/level`).then(r => r.json()).then(data => {
      if (data.needsCelebration) { setNewLevel(data.currentLevel); setShow(true) }
    }).catch(() => {})
  }, [user?.id])

  const dismiss = async () => {
    setShow(false)
    if (user?.id) await fetch(`/api/users/${user.id}/level/celebrate`, { method: "POST" })
  }

  if (!show) return null

  const titles = { 2: "Vous etes maintenant Engage !", 3: "Vous etes Confirme !" } as Record<number, string>
  const bodies = {
    2: "Vous pouvez desormais contribuer financierement a des projets, debloquer des fonctionnalites avancees et acceder a de nouveaux profils.",
    3: "Tous les outils VIXUAL vous sont ouverts : Ticket Gold, Vixual Social complet, retraits sans hold, et bien plus.",
  } as Record<number, string>

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="relative max-w-md w-full bg-gradient-to-br from-emerald-900/40 via-slate-900 to-violet-900/40 border border-emerald-500/30 rounded-2xl p-8 shadow-2xl">
        <button onClick={dismiss} className="absolute top-4 right-4 text-white/40 hover:text-white"><X className="h-5 w-5" /></button>
        <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-5"><Sparkles className="h-10 w-10 text-emerald-400" /></div>
        <h2 className="text-2xl font-bold text-white text-center mb-3">{titles[newLevel] ?? "Niveau superieur !"}</h2>
        <p className="text-white/65 text-center mb-7 leading-relaxed">{bodies[newLevel] ?? "De nouvelles possibilites s'ouvrent a vous."}</p>
        <Button onClick={dismiss} className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 h-12">Decouvrir <ArrowRight className="ml-2 h-4 w-4" /></Button>
      </div>
    </div>
  )
}
