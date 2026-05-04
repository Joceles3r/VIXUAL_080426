"use client"
import { useState, useEffect } from "react"
import { Bell, X } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"

interface Notification {
  id: string
  type: string
  title: string
  body: string | null
  link: string | null
  is_read: boolean
  created_at: string
}

export function NotificationsBell() {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(false)

  const unreadCount = notifications.filter(n => !n.is_read).length

  useEffect(() => {
    if (!user?.id) return
    fetch(`/api/notifications?userId=${user.id}`).then(r => r.json()).then(d => setNotifications(d.notifications ?? [])).catch(() => {})
  }, [user?.id])

  const markRead = async () => {
    if (!user?.id) return
    setLoading(true)
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id }),
    })
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
    setLoading(false)
  }

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="relative p-2 rounded-full hover:bg-white/10 transition">
        <Bell className="h-5 w-5 text-white/70" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 w-80 bg-slate-900 border border-white/10 rounded-xl shadow-2xl z-50">
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <h3 className="font-semibold text-white">Notifications</h3>
            <button onClick={() => setOpen(false)}><X className="h-4 w-4 text-white/40" /></button>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="p-4 text-white/40 text-sm text-center">Aucune notification</p>
            ) : (
              notifications.map(n => (
                <div key={n.id} className={`p-3 border-b border-white/5 ${n.is_read ? "opacity-50" : ""}`}>
                  <p className="text-sm text-white font-medium">{n.title}</p>
                  {n.body && <p className="text-xs text-white/55 mt-1">{n.body}</p>}
                  <p className="text-[10px] text-white/30 mt-1">{new Date(n.created_at).toLocaleDateString("fr-FR")}</p>
                </div>
              ))
            )}
          </div>
          {unreadCount > 0 && (
            <div className="p-3 border-t border-white/10">
              <Button size="sm" variant="ghost" onClick={markRead} disabled={loading} className="w-full text-xs">
                {loading ? "..." : "Tout marquer comme lu"}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
