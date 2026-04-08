"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Send, Inbox, Clock, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/auth-context"

export default function SupportMailboxPage() {
  const { user, isAuthed } = useAuth()
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSend = async () => {
    if (!subject.trim() || !message.trim()) return
    setSending(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setSending(false)
    setSent(true)
    setSubject("")
    setMessage("")
    setTimeout(() => setSent(false), 4000)
  }

  if (!isAuthed) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 pt-24 px-4 md:px-6">
        <div className="max-w-3xl mx-auto text-center py-20">
          <Inbox className="h-16 w-16 text-white/20 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">{"Boîte interne VISUAL"}</h1>
          <p className="text-white/60 mb-6">{"Connectez-vous pour accéder au support."}</p>
          <Link href="/login">
            <Button className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white">
              {"Se connecter"}
            </Button>
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 pt-24 px-4 md:px-6 pb-16 cinema-section">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" className="text-white/60 hover:text-white hover:bg-white/10">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">{"Boîte interne VISUAL"}</h1>
            <p className="text-white/60 text-sm">
              {"Contactez le responsable de la plateforme (ADMIN VISUAL). R\u00e9ponse sous vingt-quatre \u00e0 soixante-douze heures."}
            </p>
          </div>
        </div>

        {/* New Message Form */}
        <Card className="bg-slate-900/50 border-white/10">
          <CardHeader>
            <CardTitle className="text-white text-lg">{"Nouveau message"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="subject" className="text-white/80">{"Objet"}</Label>
              <Input
                id="subject"
                placeholder="Ex : Problème de connexion, question sur un projet..."
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="bg-slate-800/50 border-white/10 text-white placeholder:text-white/30 focus:border-emerald-500/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message" className="text-white/80">{"Message"}</Label>
              <Textarea
                id="message"
                placeholder="Écrivez votre message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="bg-slate-800/50 border-white/10 text-white placeholder:text-white/30 focus:border-emerald-500/50 min-h-[160px]"
              />
            </div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-white/30">
                {"De : "}{user?.email}
              </p>
              <Button
                onClick={handleSend}
                disabled={sending || !subject.trim() || !message.trim()}
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white"
              >
                <Send className="h-4 w-4 mr-2" />
                {sending ? "Envoi..." : sent ? "Envoyé !" : "Envoyer"}
              </Button>
            </div>
            {sent && (
              <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                <CheckCircle className="h-4 w-4 text-emerald-400" />
                <p className="text-sm text-emerald-400">{"Message envoy\u00e9 avec succ\u00e8s. R\u00e9ponse sous vingt-quatre \u00e0 soixante-douze heures."}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Message History */}
        <Card className="bg-slate-900/50 border-white/10">
          <CardHeader>
            <CardTitle className="text-white text-lg flex items-center gap-2">
              <Clock className="h-5 w-5 text-white/40" />
              {"Historique"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Inbox className="h-12 w-12 text-white/10 mx-auto mb-3" />
              <p className="text-white/40 text-sm">{"Aucun message pour le moment."}</p>
              <p className="text-white/20 text-xs mt-1">
                {"L'historique apparaîtra ici quand le backend Support sera branché."}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Info */}
        <div className="flex items-center gap-2 text-xs text-white/30">
          <Badge variant="outline" className="border-white/10 text-white/30 text-xs">V1</Badge>
          <span>{"Boîte interne VISUAL — support@visual.app"}</span>
        </div>
      </div>
    </main>
  )
}
