"use client"
import { useState } from "react"
import { Heart, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"

export function VisibilityBoostButton({ creatorId, contentId, className = "" }: { creatorId: string; contentId?: string; className?: string }) {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [points, setPoints] = useState(20)
  const [loading, setLoading] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)

  if (!user || user.id === creatorId) return null

  const send = async () => {
    setLoading(true); setFeedback(null)
    try {
      const res = await fetch("/api/visibility-boost", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visitorId: user.id, creatorId, contentId, points }),
      })
      const data = await res.json()
      if (res.ok) { setFeedback(`Merci ! +${data.visibilityGain.toFixed(1)} pts de visibilite offerts.`); setTimeout(() => setOpen(false), 2000) }
      else setFeedback(data.error)
    } finally { setLoading(false) }
  }

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)} className={className}>
        <Heart className="h-4 w-4 mr-2 text-rose-400" />Soutenir ce createur
      </Button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={() => setOpen(false)}>
          <div className="bg-slate-900 border border-white/10 rounded-xl p-6 max-w-sm w-full" onClick={e => e.stopPropagation()}>
            <h3 className="font-semibold text-white mb-2">Offrir de la visibilite</h3>
            <p className="text-white/55 text-xs mb-4">Vos VIXUpoints donnent un boost algorithmique au createur. Pas d&apos;argent reel — juste de la mise en avant.</p>
            <div className="flex gap-2 mb-4">
              {[10,20,30,50].map(p => (
                <button key={p} onClick={() => setPoints(p)} className={`flex-1 py-2 rounded text-sm ${points === p ? "bg-emerald-600 text-white" : "bg-slate-800 text-white/60"}`}>{p} pts</button>
              ))}
            </div>
            {feedback && <p className="text-emerald-300 text-sm mb-3">{feedback}</p>}
            <Button onClick={send} disabled={loading} className="w-full bg-rose-600 hover:bg-rose-500">{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : `Offrir ${points} VIXUpoints`}</Button>
          </div>
        </div>
      )}
    </>
  )
}
