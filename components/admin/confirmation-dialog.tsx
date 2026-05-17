"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AlertTriangle } from "lucide-react"

/**
 * Dialog de confirmation critique :
 * l'utilisateur doit taper "CONFIRMER" pour valider l'action.
 * Empeche les suppressions / modifications accidentelles sur les actions sensibles.
 */
export function ConfirmationDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmWord = "CONFIRMER",
  destructive = true,
  onConfirm,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  title: string
  description: string
  confirmWord?: string
  destructive?: boolean
  onConfirm: () => void | Promise<void>
}) {
  const [typed, setTyped] = useState("")
  const [pending, setPending] = useState(false)
  const isMatch = typed.trim().toUpperCase() === confirmWord.toUpperCase()

  const handleConfirm = async () => {
    if (!isMatch) return
    setPending(true)
    try {
      await onConfirm()
      setTyped("")
      onOpenChange(false)
    } finally {
      setPending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) setTyped("") }}>
      <DialogContent className="bg-slate-900 border-rose-500/40 text-white sm:max-w-md">
        <DialogHeader>
          <div className={`w-12 h-12 rounded-full ${destructive ? "bg-rose-500/15" : "bg-amber-500/15"} flex items-center justify-center mb-2`}>
            <AlertTriangle className={`h-6 w-6 ${destructive ? "text-rose-400" : "text-amber-400"}`} />
          </div>
          <DialogTitle className="text-xl">{title}</DialogTitle>
          <DialogDescription className="text-white/65 leading-relaxed pt-1">
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 py-2">
          <label className="text-xs text-white/55 block">
            Tapez{" "}
            <code className={`px-1.5 py-0.5 rounded font-bold ${destructive ? "bg-rose-500/20 text-rose-200" : "bg-amber-500/20 text-amber-200"}`}>
              {confirmWord}
            </code>{" "}
            pour confirmer
          </label>
          <Input
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            placeholder={confirmWord}
            className="bg-black/40 border-white/15 font-mono"
            autoFocus
            autoComplete="off"
          />
        </div>

        <DialogFooter className="flex-row gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={pending} className="text-white/70">
            Annuler
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!isMatch || pending}
            className={`${destructive ? "bg-rose-600 hover:bg-rose-700" : "bg-amber-500 hover:bg-amber-600 text-black"} font-bold disabled:opacity-40`}
          >
            {pending ? "Traitement..." : "Confirmer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
