"use client"
import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

interface Comment {
  id: string
  body: string
  author_name: string
  created_at: string
}

export function CommentsSection({ contentId }: { contentId: string }) {
  const { user } = useAuth()
  const [comments, setComments] = useState<Comment[]>([])
  const [text, setText] = useState("")
  const [loading, setLoading] = useState(false)

  const reload = () => {
    fetch(`/api/comments?contentId=${contentId}`)
      .then(r => r.json())
      .then(d => setComments(d.comments ?? []))
  }

  useEffect(() => { reload() }, [contentId])

  const post = async () => {
    if (!user || !text.trim()) return
    setLoading(true)
    const res = await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contentId, userId: user.id, body: text }),
    })
    if (res.ok) { setText(""); reload() }
    setLoading(false)
  }

  return (
    <div className="mt-8 border-t border-white/10 pt-6">
      <h3 className="text-white font-semibold mb-4">Commentaires ({comments.length})</h3>
      {user ? (
        <div className="mb-6">
          <Textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Votre commentaire…"
            className="bg-slate-800/50 border-white/10 text-white"
            rows={3}
            maxLength={2000}
          />
          <Button onClick={post} disabled={loading || !text.trim()} className="mt-2 bg-emerald-600 hover:bg-emerald-500">
            {loading ? "Publication…" : "Publier"}
          </Button>
        </div>
      ) : (
        <p className="text-white/40 text-sm mb-6">Connectez-vous pour commenter.</p>
      )}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <p className="text-white/30 text-sm text-center py-6">Aucun commentaire pour l&apos;instant. Soyez le premier !</p>
        ) : comments.map(c => (
          <div key={c.id} className="bg-slate-900/40 border border-white/5 rounded-lg p-4">
            <p className="text-white/85 text-sm whitespace-pre-wrap">{c.body}</p>
            <p className="text-white/35 text-xs mt-2">
              par <span className="text-white/55">{c.author_name}</span> · {new Date(c.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
