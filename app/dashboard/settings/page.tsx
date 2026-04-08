"use client"

import { Badge } from "@/components/ui/badge"

import { useState, useCallback } from "react"
import {
  Settings,
  Bell,
  Lock,
  Globe,
  CreditCard,
  Shield,
  Trash2,
  ExternalLink,
  Check,
  CheckCircle,
  Film,
  FileText,
  Mic,
  TrendingUp,
  BookOpen,
  Headphones,
  Loader2,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/components/ui/use-toast"
import { CAUTION_EUR } from "@/lib/payout/constants"

const ROLE_UPGRADES = [
  {
    role: "porter" as const,
    label: "Porteur",
    description: "Deposez des videos et contenus audiovisuels sur VIXUAL",
    icon: Film,
    color: "red",
    caution: CAUTION_EUR.creator,
    cautionType: "creator" as const,
  },
  {
    role: "infoporter" as const,
    label: "Infoporteur",
    description: "Publiez vos ecrits : articles, histoires, livres",
    icon: FileText,
    color: "amber",
    caution: CAUTION_EUR.creator,
    cautionType: "creator" as const,
  },
  {
    role: "podcaster" as const,
    label: "Podcasteur",
    description: "Deposez vos podcasts et emissions audio",
    icon: Mic,
    color: "purple",
    caution: CAUTION_EUR.creator,
    cautionType: "creator" as const,
  },
  {
    role: "contributor" as const,
    label: "Contributeur",
    description: "Contribuez aux projets audiovisuels",
    icon: TrendingUp,
    color: "emerald",
    caution: CAUTION_EUR.contributor,
    cautionType: "contributor" as const,
  },
  {
    role: "contribu_reader" as const,
    label: "Contribu-lecteur",
    description: "Contribuez aux contenus litteraires",
    icon: BookOpen,
    color: "sky",
    caution: CAUTION_EUR.contributor,
    cautionType: "contributor" as const,
  },
  {
    role: "listener" as const,
    label: "Auditeur",
    description: "Contribuez aux podcasts et contenus audio",
    icon: Headphones,
    color: "violet",
    caution: CAUTION_EUR.contributor,
    cautionType: "contributor" as const,
  },
] as const

export default function SettingsPage() {
  const { user, roles, updateRoles } = useAuth()
  const { toast } = useToast()
  const [notifications, setNotifications] = useState({
    email: true,
    investments: true,
    updates: false,
    marketing: false,
  })
  const [language, setLanguage] = useState("fr")
  const [saved, setSaved] = useState(false)
  const [upgradingRole, setUpgradingRole] = useState<string | null>(null)
  
  // Password change state
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [passwordError, setPasswordError] = useState("")
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Password validation
  const hasMinLength = newPassword.length >= 8
  const hasUppercase = /[A-Z]/.test(newPassword)
  const hasLowercase = /[a-z]/.test(newPassword)
  const hasNumber = /[0-9]/.test(newPassword)
  const passwordsMatch = newPassword === confirmPassword && confirmPassword.length > 0
  const isPasswordValid = hasMinLength && hasUppercase && hasLowercase && hasNumber && passwordsMatch && currentPassword.length > 0

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleChangePassword = async () => {
    if (!isPasswordValid) return
    
    setPasswordLoading(true)
    setPasswordError("")
    
    try {
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          email: user?.email,
        }),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || "Erreur lors du changement de mot de passe")
      }
      
      setPasswordSuccess(true)
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      setTimeout(() => setPasswordSuccess(false), 3000)
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : "Une erreur est survenue")
    } finally {
      setPasswordLoading(false)
    }
  }

  const handleUpgradeRole = useCallback(
    async (role: string, cautionType: "creator" | "contributor") => {
      if (!user) return
      setUpgradingRole(role)
      try {
        // En production : appeler /api/stripe/caution pour payer la caution
        // puis activer le role cote serveur apres confirmation webhook
        const res = await fetch("/api/stripe/caution", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user.id, cautionType }),
        })
        const result = await res.json()
        if (result.error) {
          toast({ title: "Erreur", description: result.error, variant: "destructive" })
        } else {
          // Activation locale du role (mock)
          const newRoles = [...new Set([...roles, role])] as typeof roles
          updateRoles(newRoles)
          toast({ 
            title: "Role active", 
            description: `Role "${role}" active avec succes. En production, le paiement de la caution sera requis via Stripe.` 
          })
        }
      } catch {
        toast({ title: "Erreur", description: "Erreur lors de l'activation du role. Veuillez reessayer.", variant: "destructive" })
      } finally {
        setUpgradingRole(null)
      }
    },
    [user, roles, updateRoles]
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">{"Paramètres"}</h1>
          <p className="text-white/60">{"Gérez vos préférences et votre compte"}</p>
        </div>
        <Button
          onClick={handleSave}
          className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white"
        >
          {saved ? (
            <>
              <Check className="h-4 w-4 mr-2" />
              {"Enregistré"}
            </>
          ) : (
            "Enregistrer"
          )}
        </Button>
      </div>

      {/* Role Upgrade Section */}
      <Card className="bg-gradient-to-br from-slate-900/80 to-slate-800/40 border-emerald-500/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Shield className="h-5 w-5 text-emerald-400" />
            {"Mes rôles VIXUAL"}
          </CardTitle>
          <CardDescription className="text-white/60">
            {"Activez de nouveaux rôles pour débloquer des fonctionnalités. Chaque rôle nécessite une caution unique, remboursable en cas de résiliation."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {ROLE_UPGRADES.map((upgrade) => {
              const Icon = upgrade.icon
              const hasRole = roles.includes(upgrade.role)
              const isUpgrading = upgradingRole === upgrade.role
              const colorMap: Record<string, { bg: string; text: string; border: string; badge: string }> = {
                red: { bg: "bg-red-500/10", text: "text-red-400", border: "border-red-500/30", badge: "bg-red-500/20 text-red-400" },
                amber: { bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/30", badge: "bg-amber-500/20 text-amber-400" },
                purple: { bg: "bg-purple-500/10", text: "text-purple-400", border: "border-purple-500/30", badge: "bg-purple-500/20 text-purple-400" },
                emerald: { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/30", badge: "bg-emerald-500/20 text-emerald-400" },
                sky: { bg: "bg-sky-500/10", text: "text-sky-400", border: "border-sky-500/30", badge: "bg-sky-500/20 text-sky-400" },
                violet: { bg: "bg-violet-500/10", text: "text-violet-400", border: "border-violet-500/30", badge: "bg-violet-500/20 text-violet-400" },
              }
              const colors = colorMap[upgrade.color]

              return (
                <div
                  key={upgrade.role}
                  className={`p-4 rounded-lg border transition-all ${
                    hasRole
                      ? `${colors.bg} ${colors.border}`
                      : "bg-slate-800/50 border-white/10 hover:border-white/20"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-lg ${colors.bg} flex items-center justify-center shrink-0`}>
                      <Icon className={`h-5 w-5 ${colors.text}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-white font-medium">{upgrade.label}</h4>
                        {hasRole && (
                          <Badge className={`${colors.badge} border-0 text-xs`}>
                            {"Actif"}
                          </Badge>
                        )}
                      </div>
                      <p className="text-white/50 text-xs mb-3">{upgrade.description}</p>
                      {hasRole ? (
                        <div className="flex items-center gap-1.5 text-emerald-400 text-xs">
                          <Check className="h-3.5 w-3.5" />
                          <span>{"Rôle activé"}</span>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => handleUpgradeRole(upgrade.role, upgrade.cautionType)}
                          disabled={isUpgrading}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs h-8"
                        >
                          {isUpgrading ? (
                            <Loader2 className="h-3 w-3 animate-spin mr-1" />
                          ) : (
                            <CreditCard className="h-3 w-3 mr-1" />
                          )}
                          {"Activer (caution "}
                          {upgrade.caution}
                          {"€)"}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="mt-4 p-3 bg-slate-800/30 rounded-lg flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-white/40 mt-0.5 shrink-0" />
            <p className="text-xs text-white/40">
              {"La caution est un dépôt unique remboursable en cas de résiliation de votre compte. Créateurs : 10€ | Contributeurs : 20€. Le paiement est sécurisé par Stripe."}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Notifications */}
        <Card className="bg-slate-900/50 border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Bell className="h-5 w-5 text-emerald-400" />
              Notifications
            </CardTitle>
            <CardDescription className="text-white/60">
              Choisissez comment vous souhaitez être notifié
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
              <div>
                <p className="text-white font-medium">Notifications par email</p>
                <p className="text-white/60 text-sm">
                  Recevez les notifications importantes par email
                </p>
              </div>
              <Switch
                checked={notifications.email}
                onCheckedChange={(checked) =>
                  setNotifications({ ...notifications, email: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
              <div>
                <p className="text-white font-medium">Alertes investissements</p>
                <p className="text-white/60 text-sm">
                  Soyez notifié des retours sur vos investissements
                </p>
              </div>
              <Switch
                checked={notifications.investments}
                onCheckedChange={(checked) =>
                  setNotifications({ ...notifications, investments: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
              <div>
                <p className="text-white font-medium">Mises à jour projets</p>
                <p className="text-white/60 text-sm">
                  Recevez les actualités des projets suivis
                </p>
              </div>
              <Switch
                checked={notifications.updates}
                onCheckedChange={(checked) =>
                  setNotifications({ ...notifications, updates: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
              <div>
                <p className="text-white font-medium">Emails marketing</p>
                <p className="text-white/60 text-sm">
                  Recevez nos offres et actualités
                </p>
              </div>
              <Switch
                checked={notifications.marketing}
                onCheckedChange={(checked) =>
                  setNotifications({ ...notifications, marketing: checked })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Language & Region */}
        <Card className="bg-slate-900/50 border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Globe className="h-5 w-5 text-emerald-400" />
              Langue et région
            </CardTitle>
            <CardDescription className="text-white/60">
              Configurez vos préférences régionales
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="language" className="text-white">
                Langue de l'interface
              </Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="bg-slate-800 border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-white/20">
                  <SelectItem value="fr" className="text-white hover:bg-white/10">
                    Français
                  </SelectItem>
                  <SelectItem value="en" className="text-white hover:bg-white/10">
                    English
                  </SelectItem>
                  <SelectItem value="es" className="text-white hover:bg-white/10">
                    Español
                  </SelectItem>
                  <SelectItem value="de" className="text-white hover:bg-white/10">
                    Deutsch
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timezone" className="text-white">
                Fuseau horaire
              </Label>
              <Select defaultValue="europe-paris">
                <SelectTrigger className="bg-slate-800 border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-white/20">
                  <SelectItem
                    value="europe-paris"
                    className="text-white hover:bg-white/10"
                  >
                    Europe/Paris (UTC+1)
                  </SelectItem>
                  <SelectItem
                    value="europe-london"
                    className="text-white hover:bg-white/10"
                  >
                    Europe/London (UTC+0)
                  </SelectItem>
                  <SelectItem
                    value="america-new_york"
                    className="text-white hover:bg-white/10"
                  >
                    America/New_York (UTC-5)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency" className="text-white">
                Devise d'affichage
              </Label>
              <Select defaultValue="eur">
                <SelectTrigger className="bg-slate-800 border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-white/20">
                  <SelectItem value="eur" className="text-white hover:bg-white/10">
                    Euro (€)
                  </SelectItem>
                  <SelectItem value="usd" className="text-white hover:bg-white/10">
                    Dollar ($)
                  </SelectItem>
                  <SelectItem value="gbp" className="text-white hover:bg-white/10">
                    Livre Sterling (£)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Security */}
        <Card className="bg-slate-900/50 border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Lock className="h-5 w-5 text-emerald-400" />
              Sécurité
            </CardTitle>
            <CardDescription className="text-white/60">
              Protégez votre compte
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {passwordSuccess && (
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-3 flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-400" />
                <p className="text-emerald-400 text-sm">Mot de passe modifie avec succes!</p>
              </div>
            )}
            
            {passwordError && (
              <div className="bg-rose-500/10 border border-rose-500/30 rounded-lg p-3 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-rose-400" />
                <p className="text-rose-400 text-sm">{passwordError}</p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="current-password" className="text-white">
                Mot de passe actuel
              </Label>
              <div className="relative">
                <Input
                  id="current-password"
                  type={showCurrentPassword ? "text" : "password"}
                  placeholder="Entrez votre mot de passe actuel"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="bg-slate-800 border-white/20 text-white pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                >
                  {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-password" className="text-white">
                Nouveau mot de passe
              </Label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showNewPassword ? "text" : "password"}
                  placeholder="Entrez votre nouveau mot de passe"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="bg-slate-800 border-white/20 text-white pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div className={`flex items-center gap-1.5 text-xs ${hasMinLength ? "text-emerald-400" : "text-white/30"}`}>
                  <CheckCircle className="h-3 w-3" />
                  <span>8 caracteres min</span>
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

            <div className="space-y-2">
              <Label htmlFor="confirm-password" className="text-white">
                Confirmer le nouveau mot de passe
              </Label>
              <div className="relative">
                <Input
                  id="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirmez votre nouveau mot de passe"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`bg-slate-800 border-white/20 text-white pr-10 ${
                    confirmPassword && !passwordsMatch ? "border-rose-500" : ""
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {confirmPassword && !passwordsMatch && (
                <p className="text-xs text-rose-400">Les mots de passe ne correspondent pas</p>
              )}
              {passwordsMatch && (
                <p className="text-xs text-emerald-400 flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Les mots de passe correspondent
                </p>
              )}
            </div>

            <Button
              onClick={handleChangePassword}
              disabled={!isPasswordValid || passwordLoading}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-medium disabled:opacity-50"
            >
              {passwordLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Modification en cours...
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4 mr-2" />
                  Enregistrer le nouveau mot de passe
                </>
              )}
            </Button>

            <div className="border-t border-white/10 pt-4 mt-4">
              <Button
                variant="outline"
                className="w-full bg-transparent border-white/20 text-white hover:bg-white/10"
              >
                <Shield className="h-4 w-4 mr-2" />
                Activer l'authentification a deux facteurs
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Payment Methods */}
        <Card className="bg-slate-900/50 border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-emerald-400" />
              Moyens de paiement
            </CardTitle>
            <CardDescription className="text-white/60">
              Gérez vos méthodes de paiement
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-slate-800/50 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-8 bg-gradient-to-r from-blue-600 to-blue-800 rounded flex items-center justify-center text-white text-xs font-bold">
                  VISA
                </div>
                <div>
                  <p className="text-white font-medium">•••• •••• •••• 4242</p>
                  <p className="text-white/60 text-sm">Expire 12/28</p>
                </div>
              </div>
              <Badge className="bg-emerald-500/20 text-emerald-400 border-0">
                Par défaut
              </Badge>
            </div>

            <Button
              variant="outline"
              className="w-full bg-transparent border-white/20 text-white hover:bg-white/10"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Ajouter une carte
            </Button>

            <div className="pt-4 border-t border-white/10">
              <p className="text-white font-medium mb-2">Compte Stripe Connect</p>
              <p className="text-white/60 text-sm mb-3">
                Pour recevoir vos gains, connectez votre compte Stripe
              </p>
              <Button className="bg-[#635BFF] hover:bg-[#5851DB] text-white">
                <ExternalLink className="h-4 w-4 mr-2" />
                Connecter Stripe
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone - Resiliation */}
        <Card className="lg:col-span-2 bg-slate-900/50 border-red-500/30">
          <CardHeader>
            <CardTitle className="text-red-400 flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              {"Zone de danger"}
            </CardTitle>
            <CardDescription className="text-white/60">
              {"Actions irréversibles sur votre compte"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Resiliation + remboursement caution */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-amber-500/10 rounded-lg border border-amber-500/30">
              <div>
                <p className="text-white font-medium">{"Résilier mon compte"}</p>
                <p className="text-white/60 text-sm">
                  {"La résiliation entraîne le remboursement de votre caution (si applicable) et la désactivation de tous vos rôles. Vos investissements en cours seront clôturés selon les règles VIXUAL."}
                </p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="shrink-0 border-amber-500/50 text-amber-400 hover:bg-amber-600/20 hover:text-amber-300">
                    {"Résilier"}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-slate-900 border-white/10">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-white">
                      {"Confirmer la résiliation"}
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-white/60">
                      {"En résiliant votre compte, vos rôles seront désactivés et votre caution sera remboursée sous sept jours ouvrés via Stripe. Vos investissements en cours seront traités selon les règles de clôture VIXUAL."}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="bg-transparent border-white/20 text-white hover:bg-white/10">
                      {"Annuler"}
                    </AlertDialogCancel>
                    <AlertDialogAction className="bg-amber-600 hover:bg-amber-500 text-white">
                      {"Confirmer la résiliation"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>

            {/* Suppression definitive */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-red-500/10 rounded-lg border border-red-500/30">
              <div>
                <p className="text-white font-medium">{"Supprimer définitivement mon compte"}</p>
                <p className="text-white/60 text-sm">
                  {"Cette action est irréversible. Toutes vos données seront supprimées définitivement. Le remboursement de la caution ne sera plus possible après suppression."}
                </p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="shrink-0">
                    <Trash2 className="h-4 w-4 mr-2" />
                    {"Supprimer le compte"}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-slate-900 border-white/10">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-white">
                      {"Êtes-vous absolument sûr ?"}
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-white/60">
                      {"Cette action ne peut pas être annulée. Cela supprimera définitivement votre compte et toutes vos données de nos serveurs. Veuillez d'abord résilier votre compte pour obtenir le remboursement de votre caution."}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="bg-transparent border-white/20 text-white hover:bg-white/10">
                      {"Annuler"}
                    </AlertDialogCancel>
                    <AlertDialogAction className="bg-red-600 hover:bg-red-500 text-white">
                      {"Supprimer définitivement"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
