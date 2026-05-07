"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Mail, Lock, User, ArrowRight, Eye, EyeOff, Check, Calendar, ShieldAlert } from "lucide-react"
import { VisualSlogan } from "@/components/vixual-slogan"
import { VixualLogo } from "@/components/vixual-logo"
import { isMinor, isEligibleForSignup, computeAge, MINOR_VIXUPOINTS_CAP } from "@/lib/vixupoints-engine"
import { ParentalConsentForm } from "@/components/parental-consent-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/lib/auth-context"
import { usePlatformVersion } from "@/hooks/use-platform-version"

function getBenefits(version: "V1" | "V2" | "V3") {
  return [
    "Acces aux contenus gratuits",
    "Gagnez des VIXUpoints",
    "Suivez vos createurs preferes",
    version === "V1"
      ? "Devenez Contributeur ou Createur (Porteur)"
      : "Devenez Contributeur, Contribu-lecteur, Auditeur ou Createur (Porteur, Infoporteur, Podcasteur)",
  ]
}

export default function SignupPage() {
  const router = useRouter()
  const { signup } = useAuth()
  const platformVersion = usePlatformVersion()
  const benefits = getBenefits(platformVersion)
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    birthDate: "",
  })
  const [error, setError] = useState("")
  const [signupDone, setSignupDone] = useState(false)
  const [isUserMinor, setIsUserMinor] = useState(false)

  const userAge = formData.birthDate ? computeAge(formData.birthDate) : null
  const showMinorWarning = userAge !== null && userAge >= 16 && userAge < 18
  const showTooYoung = userAge !== null && userAge < 16

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (formData.password !== formData.confirmPassword) {
      setError("Les mots de passe ne correspondent pas.")
      return
    }

    if (formData.password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.")
      return
    }

    if (!acceptTerms) {
      setError("Vous devez accepter les conditions d'utilisation.")
      return
    }

    if (!formData.birthDate) {
      setError("La date de naissance est obligatoire.")
      return
    }

    if (!isEligibleForSignup(formData.birthDate)) {
      setError("Vous devez avoir au moins 16 ans pour vous inscrire sur VIXUAL.")
      return
    }

    setIsLoading(true)

    try {
      const minor = isMinor(formData.birthDate)
      await signup({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        birthDate: formData.birthDate,
      })
      setIsUserMinor(minor)
      if (minor) {
        setSignupDone(true)
      } else {
        router.push("/dashboard")
      }
    } catch {
      setError("Une erreur est survenue. Veuillez r\u00e9essayer.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 py-12">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-emerald-900/20 via-slate-950 to-slate-950" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-emerald-500/10 rounded-full blur-3xl" />

      <div className="relative w-full max-w-md">
        {/* Logo + Slogan */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex justify-center">
            <VixualLogo size="lg" />
          </Link>
          <div className="mt-2">
            <VisualSlogan size="xs" opacity="medium" />
          </div>
        </div>

        <Card className="bg-slate-900/70 border-white/10 backdrop-blur-xl cinema-panel">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-white">
              {"Créer un compte"}
            </CardTitle>
            <p className="text-white/55 text-sm italic mt-2 text-center">Vois-les avant tout le monde.</p>
            <p className="text-white/60 mt-2">
              Rejoignez VIXUAL et devenez Visiteur gratuitement
            </p>
          </CardHeader>
          <CardContent>
            {/* Benefits */}
            <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
              <p className="text-emerald-400 font-medium mb-2">
                En tant que Visiteur, vous bénéficiez de :
              </p>
              <ul className="space-y-1">
                {benefits.map((benefit) => (
                  <li
                    key={benefit}
                    className="flex items-center gap-2 text-sm text-white/70"
                  >
                    <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="name" className="text-white">
                  Nom complet
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Votre nom"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                    className="pl-10 bg-slate-800/50 border-white/10 text-white placeholder:text-white/40 focus:border-emerald-500/50"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-white">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="votre@email.com"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    required
                    className="pl-10 bg-slate-800/50 border-white/10 text-white placeholder:text-white/40 focus:border-emerald-500/50"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="birthDate" className="text-white">
                  Date de naissance
                </Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
                  <Input
                    id="birthDate"
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) =>
                      setFormData({ ...formData, birthDate: e.target.value })
                    }
                    required
                    className="pl-10 bg-slate-800/50 border-white/10 text-white placeholder:text-white/40 focus:border-emerald-500/50"
                  />
                </div>
                {showMinorWarning && (
                  <div className="flex items-start gap-2 p-2.5 bg-amber-500/10 border border-amber-500/25 rounded-lg">
                    <ShieldAlert className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                    <p className="text-amber-400/90 text-xs leading-relaxed">
                      {"Vous avez entre 16 et 17 ans. Votre compte sera soumis a des restrictions : plafond de 10 000 VIXUpoints (100EUR), aucun retrait ni investissement avant 18 ans. Une autorisation parentale sera demandee."}
                    </p>
                  </div>
                )}
                {showTooYoung && (
                  <div className="flex items-start gap-2 p-2.5 bg-red-500/10 border border-red-500/25 rounded-lg">
                    <ShieldAlert className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                    <p className="text-red-400/90 text-xs leading-relaxed">
                      {"Vous devez avoir au moins 16 ans pour vous inscrire sur VIXUAL."}
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-white">
                  Mot de passe
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Minimum 8 caractères"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    required
                    className="pl-10 pr-10 bg-slate-800/50 border-white/10 text-white placeholder:text-white/40 focus:border-emerald-500/50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-white">
                  Confirmer le mot de passe
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
                  <Input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="Confirmez votre mot de passe"
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        confirmPassword: e.target.value,
                      })
                    }
                    required
                    className="pl-10 bg-slate-800/50 border-white/10 text-white placeholder:text-white/40 focus:border-emerald-500/50"
                  />
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Checkbox
                  id="terms"
                  checked={acceptTerms}
                  onCheckedChange={(checked) =>
                    setAcceptTerms(checked as boolean)
                  }
                  className="mt-1 border-white/30 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                />
                <Label htmlFor="terms" className="text-sm text-white/70">
                  J'accepte les{" "}
                  <Link
                    href="/legal/terms"
                    className="text-emerald-400 hover:underline"
                  >
                    conditions d'utilisation
                  </Link>{" "}
                  et la{" "}
                  <Link
                    href="/legal/privacy"
                    className="text-emerald-400 hover:underline"
                  >
                    politique de confidentialité
                  </Link>
                </Label>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white h-11"
              >
                {isLoading ? (
                  "Création en cours..."
                ) : (
                  <>
                    Créer mon compte
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-white/60">
                {"D\u00e9j\u00e0 un compte ? "}
                <Link
                  href="/login"
                  className="text-emerald-400 hover:text-emerald-300 font-medium"
                >
                  Se connecter
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Formulaire consentement parental apres inscription mineur */}
        {signupDone && isUserMinor && (
          <div className="mt-6 space-y-4">
            <ParentalConsentForm
              userId="new-minor-user"
              onSubmitted={() => {
                setTimeout(() => router.push("/dashboard"), 2000)
              }}
            />
            <p className="text-center text-white/40 text-xs">
              {"Vous pouvez aussi compl\u00e9ter cette \u00e9tape plus tard depuis votre tableau de bord."}
            </p>
            <div className="text-center">
              <Button
                variant="ghost"
                onClick={() => router.push("/dashboard")}
                className="text-white/50 hover:text-white/70"
              >
                {"Passer pour l'instant"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
