"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Shield, Lock, Eye, EyeOff, CheckCircle, AlertTriangle } from "lucide-react"
import Link from "next/link"

export default function ResetPasswordPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get("token")
  
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [tokenValid, setTokenValid] = useState<boolean | null>(null)

  // Password strength validation
  const passwordChecks = {
    length: password.length >= 12,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  }
  
  const passwordStrength = Object.values(passwordChecks).filter(Boolean).length
  const passwordValid = passwordStrength >= 4 && password.length >= 12
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0

  useEffect(() => {
    if (token) {
      // Verify token validity
      fetch(`/api/auth/verify-reset-token?token=${token}`)
        .then(res => res.json())
        .then(data => setTokenValid(data.valid))
        .catch(() => setTokenValid(false))
    }
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!passwordValid) {
      setError("Le mot de passe ne respecte pas les criteres de securite")
      return
    }

    if (!passwordsMatch) {
      setError("Les mots de passe ne correspondent pas")
      return
    }

    setLoading(true)

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Erreur lors de la reinitialisation")
        return
      }

      setSuccess(true)
      setTimeout(() => router.push("/login"), 3000)
    } catch {
      setError("Erreur de connexion au serveur")
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-slate-900 border-rose-500/30">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="h-12 w-12 text-rose-400 mx-auto mb-4" />
            <p className="text-white/70">Token de reinitialisation manquant.</p>
            <Link href="/login">
              <Button className="mt-4" variant="outline">
                Retour a la connexion
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (tokenValid === false) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-slate-900 border-rose-500/30">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="h-12 w-12 text-rose-400 mx-auto mb-4" />
            <p className="text-white/70">Token invalide ou expire.</p>
            <Link href="/login">
              <Button className="mt-4" variant="outline">
                Retour a la connexion
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-slate-900 border-emerald-500/30">
          <CardContent className="p-6 text-center">
            <CheckCircle className="h-12 w-12 text-emerald-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Mot de passe mis a jour!</h2>
            <p className="text-white/70">Redirection vers la connexion...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-slate-900 border-amber-500/30">
        <CardHeader className="text-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center mx-auto mb-4">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl text-white">Nouveau mot de passe ADMIN</CardTitle>
          <CardDescription className="text-white/60">
            Definissez votre mot de passe securise pour acceder a VIXUAL
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-white/70">Nouveau mot de passe</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-white/40" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 bg-slate-800 border-white/10 text-white"
                  placeholder="Minimum 12 caracteres"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-white/40 hover:text-white"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Password strength indicators */}
            <div className="space-y-2 text-xs">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((level) => (
                  <div
                    key={level}
                    className={`h-1 flex-1 rounded ${
                      passwordStrength >= level
                        ? level <= 2
                          ? "bg-rose-500"
                          : level <= 3
                          ? "bg-amber-500"
                          : "bg-emerald-500"
                        : "bg-white/10"
                    }`}
                  />
                ))}
              </div>
              <div className="grid grid-cols-2 gap-1">
                <div className={`flex items-center gap-1 ${passwordChecks.length ? "text-emerald-400" : "text-white/40"}`}>
                  <CheckCircle className="h-3 w-3" /> 12+ caracteres
                </div>
                <div className={`flex items-center gap-1 ${passwordChecks.uppercase ? "text-emerald-400" : "text-white/40"}`}>
                  <CheckCircle className="h-3 w-3" /> Majuscule
                </div>
                <div className={`flex items-center gap-1 ${passwordChecks.lowercase ? "text-emerald-400" : "text-white/40"}`}>
                  <CheckCircle className="h-3 w-3" /> Minuscule
                </div>
                <div className={`flex items-center gap-1 ${passwordChecks.number ? "text-emerald-400" : "text-white/40"}`}>
                  <CheckCircle className="h-3 w-3" /> Chiffre
                </div>
                <div className={`flex items-center gap-1 ${passwordChecks.special ? "text-emerald-400" : "text-white/40"}`}>
                  <CheckCircle className="h-3 w-3" /> Caractere special
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-white/70">Confirmer le mot de passe</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-white/40" />
                <Input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`pl-10 bg-slate-800 border-white/10 text-white ${
                    confirmPassword && (passwordsMatch ? "border-emerald-500/50" : "border-rose-500/50")
                  }`}
                  placeholder="Confirmez votre mot de passe"
                />
              </div>
              {confirmPassword && !passwordsMatch && (
                <p className="text-rose-400 text-xs">Les mots de passe ne correspondent pas</p>
              )}
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30">
                <p className="text-rose-400 text-sm">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading || !passwordValid || !passwordsMatch}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold"
            >
              {loading ? "Mise a jour..." : "Definir mon mot de passe"}
            </Button>
          </form>

          <div className="mt-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
            <p className="text-amber-400/80 text-xs text-center">
              Ce mot de passe vous donnera acces exclusif a l'administration VIXUAL. Conservez-le en lieu sur.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
