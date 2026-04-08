"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Shield, Eye, EyeOff, CheckCircle, AlertTriangle, Lock } from "lucide-react"

const PATRON_EMAIL = "jocelyndru@gmail.com"

export default function AdminSetupPage() {
  const router = useRouter()
  const [step, setStep] = useState<"email" | "password" | "success">("email")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const validateEmail = () => {
    if (email.toLowerCase().trim() !== PATRON_EMAIL) {
      setError("Cette adresse email n'est pas autorisee pour la configuration PATRON.")
      return
    }
    setError("")
    setStep("password")
  }

  const validatePassword = (pwd: string) => {
    const hasMinLength = pwd.length >= 8
    const hasUppercase = /[A-Z]/.test(pwd)
    const hasLowercase = /[a-z]/.test(pwd)
    const hasNumber = /[0-9]/.test(pwd)
    return { hasMinLength, hasUppercase, hasLowercase, hasNumber, isValid: hasMinLength && hasUppercase && hasLowercase && hasNumber }
  }

  const passwordCheck = validatePassword(password)

  const handleSubmit = async () => {
    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.")
      return
    }

    if (!passwordCheck.isValid) {
      setError("Le mot de passe ne respecte pas les criteres de securite.")
      return
    }

    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/auth/admin-setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.toLowerCase().trim(), password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de la configuration")
      }

      setStep("success")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-900/20 via-transparent to-transparent" />
      
      <Card className="w-full max-w-md bg-slate-900/90 border-amber-500/30 backdrop-blur-xl relative z-10">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center mb-4">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-white">Configuration PATRON</CardTitle>
          <CardDescription className="text-white/60">
            {step === "email" && "Confirmez votre identite pour configurer l'acces administrateur"}
            {step === "password" && "Definissez votre mot de passe securise"}
            {step === "success" && "Configuration terminee avec succes"}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {step === "email" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white/80">Adresse email PATRON</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Entrez votre email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-slate-800/50 border-white/10 text-white placeholder:text-white/30 focus:border-amber-500"
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 text-rose-400 text-sm bg-rose-500/10 p-3 rounded-lg">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  {error}
                </div>
              )}

              <Button
                onClick={validateEmail}
                disabled={!email}
                className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
              >
                Continuer
              </Button>
            </div>
          )}

          {step === "password" && (
            <div className="space-y-4">
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-3">
                <p className="text-emerald-400 text-sm flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Identite confirmee: {email}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-white/80">Nouveau mot de passe</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Minimum 8 caracteres"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-slate-800/50 border-white/10 text-white placeholder:text-white/30 focus:border-amber-500 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className={`flex items-center gap-1.5 ${passwordCheck.hasMinLength ? "text-emerald-400" : "text-white/40"}`}>
                  <CheckCircle className="h-3 w-3" /> 8 caracteres min
                </div>
                <div className={`flex items-center gap-1.5 ${passwordCheck.hasUppercase ? "text-emerald-400" : "text-white/40"}`}>
                  <CheckCircle className="h-3 w-3" /> 1 majuscule
                </div>
                <div className={`flex items-center gap-1.5 ${passwordCheck.hasLowercase ? "text-emerald-400" : "text-white/40"}`}>
                  <CheckCircle className="h-3 w-3" /> 1 minuscule
                </div>
                <div className={`flex items-center gap-1.5 ${passwordCheck.hasNumber ? "text-emerald-400" : "text-white/40"}`}>
                  <CheckCircle className="h-3 w-3" /> 1 chiffre
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm" className="text-white/80">Confirmer le mot de passe</Label>
                <div className="relative">
                  <Input
                    id="confirm"
                    type={showConfirm ? "text" : "password"}
                    placeholder="Retapez votre mot de passe"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="bg-slate-800/50 border-white/10 text-white placeholder:text-white/30 focus:border-amber-500 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60"
                  >
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {confirmPassword && (
                  <p className={`text-xs flex items-center gap-1.5 ${password === confirmPassword ? "text-emerald-400" : "text-rose-400"}`}>
                    {password === confirmPassword ? (
                      <><CheckCircle className="h-3 w-3" /> Les mots de passe correspondent</>
                    ) : (
                      <><AlertTriangle className="h-3 w-3" /> Les mots de passe ne correspondent pas</>
                    )}
                  </p>
                )}
              </div>

              {error && (
                <div className="flex items-center gap-2 text-rose-400 text-sm bg-rose-500/10 p-3 rounded-lg">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  {error}
                </div>
              )}

              <Button
                onClick={handleSubmit}
                disabled={loading || !passwordCheck.isValid || password !== confirmPassword}
                className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
              >
                {loading ? "Configuration en cours..." : "Configurer mon acces PATRON"}
              </Button>

              <button
                onClick={() => { setStep("email"); setPassword(""); setConfirmPassword(""); setError(""); }}
                className="w-full text-white/40 text-sm hover:text-white/60"
              >
                Retour
              </button>
            </div>
          )}

          {step === "success" && (
            <div className="space-y-4 text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-emerald-400" />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-white">Configuration terminee</h3>
                <p className="text-white/60 text-sm">
                  Votre mot de passe PATRON a ete configure avec succes. Vous pouvez maintenant vous connecter a VIXUAL.
                </p>
              </div>

              <div className="bg-slate-800/50 rounded-lg p-4 text-left space-y-2">
                <p className="text-white/80 text-sm flex items-center gap-2">
                  <Lock className="h-4 w-4 text-amber-400" />
                  <span><strong>Email:</strong> {email}</span>
                </p>
                <p className="text-white/50 text-xs">
                  Votre mot de passe est stocke de maniere securisee avec chiffrement bcrypt.
                </p>
              </div>

              <Button
                onClick={() => router.push("/login")}
                className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
              >
                Aller a la page de connexion
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
