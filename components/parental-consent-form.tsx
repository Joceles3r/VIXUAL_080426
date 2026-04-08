"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent } from "@/components/ui/card"
import { ShieldAlert, Upload, CheckCircle2, AlertTriangle } from "lucide-react"

interface ParentalConsentFormProps {
  userId: string
  onSubmitted?: () => void
}

export function ParentalConsentForm({ userId, onSubmitted }: ParentalConsentFormProps) {
  const [accepted, setAccepted] = useState(false)
  const [guardianName, setGuardianName] = useState("")
  const [guardianEmail, setGuardianEmail] = useState("")
  const [documentType, setDocumentType] = useState<string>("id")
  const [file, setFile] = useState<File | null>(null)
  const [busy, setBusy] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit() {
    setError(null)

    if (!accepted) {
      setError("L'autorisation du repr\u00e9sentant l\u00e9gal est obligatoire.")
      return
    }
    if (!guardianEmail.trim()) {
      setError("L'email du repr\u00e9sentant l\u00e9gal est requis.")
      return
    }

    setBusy(true)
    try {
      const res = await fetch("/api/consent/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          payload: {
            acceptedByGuardian: true,
            guardianName: guardianName.trim() || undefined,
            guardianEmail: guardianEmail.trim(),
            documentType,
          },
        }),
      })

      if (!res.ok) {
        const t = await res.text().catch(() => "")
        throw new Error(t || "Enregistrement impossible.")
      }

      setSubmitted(true)
      onSubmitted?.()
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Erreur inconnue."
      setError(msg)
    } finally {
      setBusy(false)
    }
  }

  if (submitted) {
    return (
      <Card className="bg-emerald-500/10 border-emerald-500/30">
        <CardContent className="p-5 flex items-center gap-4">
          <CheckCircle2 className="h-8 w-8 text-emerald-400 shrink-0" />
          <div>
            <p className="text-white font-medium">Autorisation enregistr\u00e9e</p>
            <p className="text-white/60 text-sm mt-1">
              {"Statut : en attente de validation par l'équipe VIXUAL. Votre compte mineur est actif avec un plafond de 10 000 VIXUpoints."}
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-slate-900/50 border-amber-500/30">
      <CardContent className="p-5 space-y-5">
        {/* En-tete */}
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center shrink-0">
            <ShieldAlert className="h-5 w-5 text-amber-400" />
          </div>
          <div>
            <h3 className="text-white font-semibold text-lg">{"Autorisation parentale (16\u201317 ans)"}</h3>
            <p className="text-white/60 text-sm mt-1">
              {"Obligatoire pour activer le compte. Plafond : 10 000 VIXUpoints (100€). Aucun retrait ni investissement avant 18 ans."}
            </p>
          </div>
        </div>

        {/* Avertissement */}
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
          <p className="text-amber-400/80 text-xs leading-relaxed">
            {"Les VIXUpoints accumulés par un mineur sont un avantage promotionnel interne. Ils ne constituent pas une créance financière exigible et ne sont convertibles qu'à la majorité."}
          </p>
        </div>

        {/* Checkbox consentement */}
        <div className="flex items-start gap-3">
          <Checkbox
            id="parentConsent"
            checked={accepted}
            onCheckedChange={(c) => setAccepted(c as boolean)}
            className="mt-1 border-white/30 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
          />
          <Label htmlFor="parentConsent" className="text-sm text-white/80 leading-relaxed">
            {"Je confirme être le représentant légal (parent ou tuteur) et j'autorise l'ouverture d'un compte VIXUAL pour le mineur. J'ai lu et j'accepte les "}
            <a href="/legal/terms" className="text-emerald-400 hover:underline">CGU</a>
            {" et la "}
            <a href="/legal/privacy" className="text-emerald-400 hover:underline">{"Politique de Confidentialit\u00e9"}</a>.
          </Label>
        </div>

        {/* Champs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-white/70 text-sm">{"Nom du repr\u00e9sentant l\u00e9gal"}</Label>
            <Input
              value={guardianName}
              onChange={(e) => setGuardianName(e.target.value)}
              placeholder="Nom / Pr\u00e9nom"
              className="bg-slate-800/50 border-white/10 text-white placeholder:text-white/30"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-white/70 text-sm">{"Email du repr\u00e9sentant l\u00e9gal *"}</Label>
            <Input
              type="email"
              value={guardianEmail}
              onChange={(e) => setGuardianEmail(e.target.value)}
              placeholder="parent@email.com"
              required
              className="bg-slate-800/50 border-white/10 text-white placeholder:text-white/30"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-white/70 text-sm">Type de justificatif (optionnel)</Label>
            <select
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
              className="w-full rounded-md bg-slate-800/50 border border-white/10 px-3 py-2 text-sm text-white"
            >
              <option value="id">{"Pi\u00e8ce d'identit\u00e9 repr\u00e9sentant"}</option>
              <option value="family_record_book">Livret de famille</option>
              <option value="court_order">Jugement / tutelle</option>
              <option value="other">Autre</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-white/70 text-sm">Upload justificatif (optionnel)</Label>
            <div className="flex items-center gap-2">
              <label className="flex-1 flex items-center gap-2 px-3 py-2 rounded-md bg-slate-800/50 border border-white/10 text-sm text-white/60 cursor-pointer hover:border-white/20 transition-colors">
                <Upload className="h-4 w-4 shrink-0" />
                <span className="truncate">{file ? file.name : "Choisir un fichier"}</span>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  className="hidden"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                />
              </label>
            </div>
            <p className="text-white/30 text-xs">{"Sera v\u00e9rifi\u00e9 par l'\u00e9quipe VISUAL. PDF ou image."}</p>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-500/15 border border-red-500/30 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        <Button
          onClick={handleSubmit}
          disabled={busy || !accepted}
          className="w-full bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-semibold h-11"
        >
          {busy ? "Enregistrement..." : "Enregistrer l'autorisation parentale"}
        </Button>
      </CardContent>
    </Card>
  )
}
