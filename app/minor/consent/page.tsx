"use client"

import { useState } from "react"
import Link from "next/link"
import { ShieldAlert, ArrowRight, Loader2, CheckCircle, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function MinorConsentPage() {
  const [guardianEmail, setGuardianEmail] = useState("")
  const [guardianName, setGuardianName] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const res = await fetch("/api/minors/guardian", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guardianEmail, guardianName }),
      })
      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        setError(data?.message || "Impossible d'envoyer la demande.")
        return
      }

      setSuccess(true)
    } catch {
      setError("Une erreur est survenue. Veuillez r\u00e9essayer.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="max-w-lg w-full space-y-6">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 mx-auto">
            <ShieldAlert className="h-8 w-8 text-amber-400" />
          </div>
          <h1 className="text-2xl font-bold text-white">{"Autorisation parentale requise"}</h1>
          <p className="text-white/50 text-sm max-w-sm mx-auto">
            {"En tant que mineur (seize ou dix-sept ans), vous devez obtenir l'autorisation d'un parent ou tuteur l\u00e9gal pour utiliser VISUAL."}
          </p>
        </div>

        {/* Badge statut */}
        <div className="flex justify-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-sm font-semibold text-amber-300">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400 animate-pulse" />
            {"Validation mineur en cours"}
          </span>
        </div>

        {success ? (
          <Card className="bg-emerald-500/5 border-emerald-500/20">
            <CardContent className="p-6 text-center space-y-4">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-500/15 mx-auto">
                <CheckCircle className="h-6 w-6 text-emerald-400" />
              </div>
              <div>
                <p className="text-emerald-400 font-semibold text-lg">{"Demande envoy\u00e9e"}</p>
                <p className="text-white/50 text-sm mt-1">
                  {"Un e-mail a \u00e9t\u00e9 envoy\u00e9 \u00e0 "}<strong className="text-white/70">{guardianEmail}</strong>{". "}
                  {"Votre parent ou tuteur recevra un lien pour valider votre inscription."}
                </p>
              </div>
              <div className="flex items-center gap-2 p-3 bg-white/5 rounded-lg">
                <Mail className="h-4 w-4 text-white/40 shrink-0" />
                <p className="text-white/40 text-xs">
                  {"Si l'e-mail n'arrive pas, v\u00e9rifiez les spams ou redemandez un envoi."}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-slate-900/50 border-white/10">
            <CardHeader>
              <CardTitle className="text-white text-base">{"Informations du parent ou tuteur"}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="guardianName" className="text-white/70 text-sm">{"Nom complet du parent / tuteur"}</Label>
                  <Input
                    id="guardianName"
                    type="text"
                    placeholder="Jean Dupont"
                    value={guardianName}
                    onChange={(e) => setGuardianName(e.target.value)}
                    required
                    className="bg-black/20 border-white/10 text-white placeholder:text-white/30"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="guardianEmail" className="text-white/70 text-sm">{"Adresse e-mail du parent / tuteur"}</Label>
                  <Input
                    id="guardianEmail"
                    type="email"
                    placeholder="parent@email.com"
                    value={guardianEmail}
                    onChange={(e) => setGuardianEmail(e.target.value)}
                    required
                    className="bg-black/20 border-white/10 text-white placeholder:text-white/30"
                  />
                </div>

                {error && (
                  <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-3">{error}</p>
                )}

                <Button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white h-12"
                  disabled={!guardianEmail || !guardianName || loading}
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <ArrowRight className="h-4 w-4 mr-2" />
                  )}
                  {loading ? "Envoi en cours\u2026" : "Envoyer la demande"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="text-center">
          <Link href="/legal" className="text-white/30 text-xs hover:text-white/50 transition-colors underline">
            {"Conditions d'utilisation et politique de confidentialit\u00e9"}
          </Link>
        </div>
      </div>
    </main>
  )
}
