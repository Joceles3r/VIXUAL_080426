"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Megaphone, Plus, Trash2, Eye, EyeOff } from "lucide-react"
import { ConfirmationDialog } from "@/components/admin/confirmation-dialog"

interface OfficialMessage {
  id: string
  title: string
  body: string
  category: "announcement" | "maintenance" | "security" | "update" | "alert"
  is_published: boolean
  published_at: string | null
  expires_at: string | null
  created_at: string
}

export default function OfficialMessagesPage() {
  const { user } = useAuth()
  const [messages, setMessages] = useState<OfficialMessage[]>([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [draft, setDraft] = useState({ title: "", body: "", category: "announcement" as const, isPublished: false })

  const fetchMessages = () => {
    if (!user?.email) return
    setLoading(true)
    fetch("/api/official-messages", { headers: { "x-admin-email": user.email } })
      .then((r) => (r.ok ? r.json() : { messages: [] }))
      .then((d) => setMessages(d.messages ?? []))
      .finally(() => setLoading(false))
  }

  useEffect(fetchMessages, [user?.email])

  const handleCreate = async () => {
    if (!user?.email || draft.title.length < 3 || draft.body.length < 10) return
    await fetch("/api/official-messages", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-email": user.email },
      body: JSON.stringify(draft),
    })
    setDraft({ title: "", body: "", category: "announcement", isPublished: false })
    setShowForm(false)
    fetchMessages()
  }

  const togglePublish = async (id: string, isPublished: boolean) => {
    if (!user?.email) return
    await fetch("/api/official-messages", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "x-admin-email": user.email },
      body: JSON.stringify({ id, isPublished }),
    })
    fetchMessages()
  }

  const handleDelete = async () => {
    if (!user?.email || !confirmDelete) return
    await fetch(`/api/official-messages?id=${confirmDelete}`, {
      method: "DELETE",
      headers: { "x-admin-email": user.email },
    })
    setConfirmDelete(null)
    fetchMessages()
  }

  const categoryColors: Record<OfficialMessage["category"], string> = {
    announcement: "bg-blue-500/20 text-blue-300 border-blue-500/40",
    maintenance: "bg-amber-500/20 text-amber-300 border-amber-500/40",
    security: "bg-rose-500/20 text-rose-300 border-rose-500/40",
    update: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
    alert: "bg-orange-500/20 text-orange-300 border-orange-500/40",
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Megaphone className="h-6 w-6 text-amber-400" />
            <h1 className="text-3xl font-bold">Messages officiels</h1>
          </div>
          <Button onClick={() => setShowForm((s) => !s)} className="bg-amber-500 hover:bg-amber-600 text-black font-bold">
            <Plus className="h-4 w-4 mr-2" /> Nouveau message
          </Button>
        </div>

        {showForm && (
          <Card className="bg-white/[0.03] border-amber-500/30 p-5 mb-6 space-y-4">
            <div>
              <Label className="text-xs text-white/60">Titre</Label>
              <Input
                value={draft.title}
                onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                maxLength={200}
                className="bg-black/30 border-white/15 text-white"
              />
            </div>
            <div>
              <Label className="text-xs text-white/60">Categorie</Label>
              <div className="flex flex-wrap gap-2 mt-1.5">
                {(["announcement", "maintenance", "security", "update", "alert"] as const).map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setDraft({ ...draft, category: c as typeof draft.category })}
                    className={`text-xs px-3 py-1.5 rounded-full border transition ${
                      draft.category === c ? categoryColors[c] : "bg-black/30 border-white/10 text-white/55 hover:border-white/30"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label className="text-xs text-white/60">Contenu (markdown supporte)</Label>
              <Textarea
                value={draft.body}
                onChange={(e) => setDraft({ ...draft, body: e.target.value })}
                rows={5}
                maxLength={5000}
                className="bg-black/30 border-white/15 text-white text-sm"
              />
            </div>
            <label className="flex items-center gap-2 text-sm text-white/70">
              <input
                type="checkbox"
                checked={draft.isPublished}
                onChange={(e) => setDraft({ ...draft, isPublished: e.target.checked })}
                className="accent-amber-500"
              />
              Publier immediatement
            </label>
            <div className="flex gap-2 pt-2">
              <Button onClick={handleCreate} className="bg-amber-500 hover:bg-amber-600 text-black font-bold">
                Enregistrer
              </Button>
              <Button variant="ghost" onClick={() => setShowForm(false)} className="text-white/65">
                Annuler
              </Button>
            </div>
          </Card>
        )}

        {loading ? (
          <p className="text-white/55 text-center py-8">Chargement...</p>
        ) : messages.length === 0 ? (
          <Card className="bg-white/[0.03] border-white/10 p-8 text-center text-white/55">
            Aucun message officiel pour le moment.
          </Card>
        ) : (
          <div className="space-y-3">
            {messages.map((m) => (
              <Card key={m.id} className="bg-white/[0.03] border-white/10 p-5">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded font-bold border ${categoryColors[m.category]}`}>
                      {m.category}
                    </span>
                    {m.is_published ? (
                      <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
                        Publie
                      </span>
                    ) : (
                      <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-white/10 text-white/55 font-bold">
                        Brouillon
                      </span>
                    )}
                    <h3 className="font-bold text-white">{m.title}</h3>
                  </div>
                  <span className="text-xs text-white/40 shrink-0">
                    {new Date(m.created_at).toLocaleDateString("fr-FR")}
                  </span>
                </div>
                <p className="text-white/75 text-sm leading-relaxed whitespace-pre-wrap mb-3">{m.body}</p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => togglePublish(m.id, !m.is_published)}
                    className="bg-white/[0.03] border-white/15"
                  >
                    {m.is_published ? <><EyeOff className="h-3.5 w-3.5 mr-1" /> Depublier</> : <><Eye className="h-3.5 w-3.5 mr-1" /> Publier</>}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setConfirmDelete(m.id)} className="text-rose-300 hover:bg-rose-500/10">
                    <Trash2 className="h-3.5 w-3.5 mr-1" /> Supprimer
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <ConfirmationDialog
        open={!!confirmDelete}
        onOpenChange={(v) => { if (!v) setConfirmDelete(null) }}
        title="Supprimer ce message ?"
        description="Cette action est irreversible. Le message sera retire definitivement."
        onConfirm={handleDelete}
      />
    </div>
  )
}
