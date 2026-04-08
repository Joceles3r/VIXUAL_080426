"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Lock, Eye, EyeOff, CheckCircle, ArrowLeft, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function ChangePasswordPage() {
  const router = useRouter()
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  const hasMinLength = newPassword.length >= 8
  const hasUppercase = /[A-Z]/.test(newPassword)
  const hasLowercase = /[a-z]/.test(newPassword)
  const hasNumber = /[0-9]/.test(newPassword)
  const passwordsMatch = newPassword === confirmPassword && confirmPassword.length > 0
  const isValid = hasMinLength && hasUppercase && hasLowercase && hasNumber && passwordsMatch

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValid) return

    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors du changement de mot de passe")
      }

      setSuccess(true)
      setTimeout(() => {
        router.push("/dashboard")
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-slate-900 border-emerald-500/30">
          <CardContent className="pt-8 pb-8 text-center">
            <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-emerald-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Mot de passe modifie</h2>
            <p className="text-white/60 text-sm">
              Votre nouveau mot de passe est actif. Redirection en cours...
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-slate-900 border-slate-800">
        <CardHeader className="text-center pb-2">
          <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Shield className="h-7 w-7 text-white" />
          </div>
          <CardTitle className="text-xl text-white">Changer mon mot de passe</CardTitle>
          <CardDescription className="text-white/50">
            Definissez votre nouveau mot de passe personnel
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Mot de passe actuel */}
            <div>
              <label className="text-sm font-medium text-white/70 mb-1.5 block">
                Mot de passe actuel
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                <Input
                  type={showCurrent ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Votre mot de passe actuel"
                  className="pl-10 pr-10 bg-slate-800 border-slate-700 text-white"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
                >
                  {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-xs text-white/40 mt-1">
                Mot de passe provisoire: Clef*000.vix
              </p>
            </div>

            {/* Nouveau mot de passe */}
            <div>
              <label className="text-sm font-medium text-white/70 mb-1.5 block">
                Nouveau mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                <Input
                  type={showNew ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Votre nouveau mot de passe"
                  className="pl-10 pr-10 bg-slate-800 border-slate-700 text-white"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
                >
                  {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {/* Indicateurs */}
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div className={`flex items-center gap-1.5 text-xs ${hasMinLength ? "text-emerald-400" : "text-white/30"}`}>
                  <CheckCircle className="h-3 w-3" />
                  <span>8 caracteres minimum</span>
                </div>
                <div className={`flex items-center gap-1.5 text-xs ${hasUppercase ? "text-emerald-400" : "text-white/30"}`}>
                  <CheckCircle className="h-3 w-3" />
                  <span>Une majuscule</span>
                </div>
                <div className={`flex items-center gap-1.5 text-xs ${hasLowercase ? "text-emerald-400" : "text-white/30"}`}>
                  <CheckCircle className="h-3 w-3" />
                  <span>Une minuscule</span>
                </div>
                <div className={`flex items-center gap-1.5 text-xs ${hasNumber ? "text-emerald-400" : "text-white/30"}`}>
                  <CheckCircle className="h-3 w-3" />
                  <span>Un chiffre</span>
                </div>
              </div>
            </div>

            {/* Confirmer */}
            <div>
              <label className="text-sm font-medium text-white/70 mb-1.5 block">
                Confirmer le nouveau mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                <Input
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Retapez votre nouveau mot de passe"
                  className={`pl-10 pr-10 bg-slate-800 border-slate-700 text-white ${
                    confirmPassword && !passwordsMatch ? "border-rose-500" : ""
                  }`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {confirmPassword && !passwordsMatch && (
                <p className="text-xs text-rose-400 mt-1">Les mots de passe ne correspondent pas</p>
              )}
              {passwordsMatch && (
                <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Les mots de passe correspondent
                </p>
              )}
            </div>

            {error && (
              <div className="bg-rose-500/10 border border-rose-500/30 rounded-lg p-3">
                <p className="text-rose-400 text-sm">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={!isValid || loading}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-medium"
            >
              {loading ? "Modification en cours..." : "Enregistrer mon nouveau mot de passe"}
            </Button>

            <Link href="/dashboard">
              <Button variant="ghost" className="w-full text-white/50 hover:text-white">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour au tableau de bord
              </Button>
            </Link>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
