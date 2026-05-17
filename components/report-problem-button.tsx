"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Bug, Send, CheckCircle2 } from "lucide-react"

/**
 * Bouton flottant + dialog "Reporter un probleme" accessible a tout utilisateur.
 * Envoie le bug a /api/support/report (table support_reports).
 */
export function ReportProblemButton() {
  const [open, setOpen] = useState(false)
  const [category, setCategory] = useState<"bug" | "broken_content" | "other">("bug")
  const [message, setMessage] = useState("")
  const [email, setEmail] = useState("")
  const [pending, setPending] = useState(false)
  const [done, setDone] = useState(false)

  const handleSubmit = async () => {
    if (message.trim().length < 10) return
    setPending(true)
    try {
      await fetch("/api/support/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          message: message.trim(),
          email: email.trim() || null,
          userAgent: navigator.userAgent,
          path: typeof window !== "undefined" ? window.location.pathname : null,
        }),
      })
      setDone(true)
      setTimeout(() => {
        setOpen(false)
        setDone(false)
        setMessage("")
        setEmail("")
      }, 1500)
    } finally {
      setPending(false)
    }
  }

  return (
    <>
      {/* Bouton flottant discret en bas a droite */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-4 right-4 z-50 group flex items-center gap-2 px-3 py-2 rounded-full bg-slate-900/90 backdrop-blur border border-white/10 text-white/70 text-xs hover:text-white hover:border-white/30 hover:bg-slate-800 transition-all shadow-lg"
        aria-label="Reporter un probleme"
      >
        <Bug className="h-3.5 w-3.5" />
        <span className="hidden group-hover:inline">Reporter un probleme</span>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-slate-900 border-white/10 text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bug className="h-5 w-5 text-amber-400" />
              Reporter un probleme
            </DialogTitle>
          </DialogHeader>

          {done ? (
            <div className="py-8 text-center space-y-3">
              <CheckCircle2 className="h-12 w-12 text-emerald-400 mx-auto" />
              <p className="text-emerald-300 font-semibold">Merci ! Votre rapport a ete envoye.</p>
              <p className="text-white/55 text-sm">L&apos;equipe VIXUAL revient vers vous au besoin.</p>
            </div>
          ) : (
            <>
              <div className="space-y-3 py-2">
                <div>
                  <Label className="text-xs text-white/60 mb-1.5 block">Type de probleme</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["bug", "broken_content", "other"] as const).map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setCategory(c)}
                        className={`text-xs px-2 py-2 rounded border transition ${
                          category === c
                            ? "bg-amber-500/20 border-amber-500/60 text-amber-200"
                            : "bg-black/30 border-white/10 text-white/60 hover:border-white/30"
                        }`}
                      >
                        {c === "bug" ? "Bug" : c === "broken_content" ? "Contenu casse" : "Autre"}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-xs text-white/60 mb-1.5 block">Description (10 caracteres min.)</Label>
                  <Textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Decrivez ce qui s&apos;est passe..."
                    rows={4}
                    maxLength={1000}
                    className="bg-black/30 border-white/10 text-white text-sm"
                  />
                  <p className="text-[10px] text-white/40 mt-1 text-right">{message.length}/1000</p>
                </div>

                <div>
                  <Label className="text-xs text-white/60 mb-1.5 block">Email pour suivi (optionnel)</Label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="vous@example.com"
                    className="bg-black/30 border-white/10 text-white text-sm"
                  />
                </div>
              </div>

              <DialogFooter className="flex-row gap-2">
                <Button variant="ghost" onClick={() => setOpen(false)} className="text-white/70">
                  Annuler
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={message.trim().length < 10 || pending}
                  className="bg-amber-500 hover:bg-amber-600 text-black font-bold"
                >
                  <Send className="h-4 w-4 mr-2" />
                  {pending ? "Envoi..." : "Envoyer"}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
