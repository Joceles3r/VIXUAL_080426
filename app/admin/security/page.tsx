"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  ShieldOff,
  AlertTriangle,
  AlertOctagon,
  Power,
  PowerOff,
  Settings,
  Clock,
  DollarSign,
  Film,
  Coins,
  MessageCircle,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle,
  Database,
  Cloud,
  Upload,
  Lock,
  Server,
  Activity,
  Send,
  Crown,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

type KillSwitchType = "global" | "finance" | "content" | "vixupoints" | "social"

interface PlatformState {
  maintenanceMode: boolean
  maintenanceMessage: string
  maintenanceScope: "global" | "partial"
  killSwitchGlobal: boolean
  killSwitchFinance: boolean
  killSwitchContent: boolean
  killSwitchVixupoints: boolean
  killSwitchSocial: boolean
  securityShield: {
    cloudflare: "ok" | "degraded" | "critical"
    uploadScanner: "ok" | "degraded" | "critical"
    apiGuard: "ok" | "degraded" | "critical"
    authService: "ok" | "degraded" | "critical"
    stripeService: "ok" | "degraded" | "critical"
    bunnyService: "ok" | "degraded" | "critical"
    database: "ok" | "degraded" | "critical"
    incidentsCount: number
  }
  updatedBy: string
  updatedAt: string
}

const DEFAULT_STATE: PlatformState = {
  maintenanceMode: false,
  maintenanceMessage: "VIXUAL est temporairement en maintenance. Nos equipes ameliorent la plateforme pour vous offrir une meilleure experience.",
  maintenanceScope: "global",
  killSwitchGlobal: false,
  killSwitchFinance: false,
  killSwitchContent: false,
  killSwitchVixupoints: false,
  killSwitchSocial: false,
  securityShield: {
    cloudflare: "ok",
    uploadScanner: "ok",
    apiGuard: "ok",
    authService: "ok",
    stripeService: "ok",
    bunnyService: "ok",
    database: "ok",
    incidentsCount: 0,
  },
  updatedBy: "",
  updatedAt: new Date().toISOString(),
}

export default function AdminSecurityPage() {
  const [platformState, setPlatformState] = useState<PlatformState>(DEFAULT_STATE)
  const [loading, setLoading] = useState(false)
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean
    action: string
    type?: KillSwitchType
    title: string
    description: string
    confirmText: string
    dangerous: boolean
  }>({
    open: false,
    action: "",
    title: "",
    description: "",
    confirmText: "",
    dangerous: false,
  })
  const [confirmInput, setConfirmInput] = useState("")
  const [maintenanceMessage, setMaintenanceMessage] = useState(DEFAULT_STATE.maintenanceMessage)
  const [scheduledDate, setScheduledDate] = useState("")
  const [estimatedDuration, setEstimatedDuration] = useState("")

  const handleAction = async (action: string, type?: KillSwitchType) => {
    setLoading(true)
    await new Promise(resolve => setTimeout(resolve, 800))

    const newState = { ...platformState }
    const now = new Date().toISOString()

    switch (action) {
      case "enable-maintenance":
        newState.maintenanceMode = true
        newState.maintenanceScope = "global"
        newState.maintenanceMessage = maintenanceMessage
        break
      case "disable-maintenance":
        newState.maintenanceMode = false
        break
      case "enable-partial-maintenance":
        newState.maintenanceMode = true
        newState.maintenanceScope = "partial"
        break
      case "kill-switch":
        if (type === "global") {
          newState.killSwitchGlobal = true
          newState.killSwitchFinance = true
          newState.killSwitchContent = true
          newState.killSwitchVixupoints = true
          newState.killSwitchSocial = true
        } else if (type === "finance") {
          newState.killSwitchFinance = true
        } else if (type === "content") {
          newState.killSwitchContent = true
        } else if (type === "vixupoints") {
          newState.killSwitchVixupoints = true
        } else if (type === "social") {
          newState.killSwitchSocial = true
        }
        break
      case "disable-kill-switch":
        if (type === "global") {
          newState.killSwitchGlobal = false
          newState.killSwitchFinance = false
          newState.killSwitchContent = false
          newState.killSwitchVixupoints = false
          newState.killSwitchSocial = false
        } else if (type === "finance") {
          newState.killSwitchFinance = false
        } else if (type === "content") {
          newState.killSwitchContent = false
        } else if (type === "vixupoints") {
          newState.killSwitchVixupoints = false
        } else if (type === "social") {
          newState.killSwitchSocial = false
        }
        break
      case "reactivate-all":
        Object.assign(newState, {
          maintenanceMode: false,
          killSwitchGlobal: false,
          killSwitchFinance: false,
          killSwitchContent: false,
          killSwitchVixupoints: false,
          killSwitchSocial: false,
        })
        break
    }

    newState.updatedAt = now
    newState.updatedBy = "ADMIN/PATRON"
    setPlatformState(newState)
    setLoading(false)
    setConfirmDialog({ ...confirmDialog, open: false })
    setConfirmInput("")
  }

  const openConfirmDialog = (
    action: string,
    title: string,
    description: string,
    confirmText: string,
    dangerous: boolean,
    type?: KillSwitchType
  ) => {
    setConfirmDialog({ open: true, action, type, title, description, confirmText, dangerous })
  }

  const hasAnyKillSwitch = platformState.killSwitchGlobal ||
    platformState.killSwitchFinance ||
    platformState.killSwitchContent ||
    platformState.killSwitchVixupoints ||
    platformState.killSwitchSocial

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-rose-500/30 to-amber-500/20 border border-rose-500/30">
            <Crown className="h-8 w-8 text-amber-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              Centre de Controle
              <Badge className="bg-amber-500 text-black font-bold">ADMIN/PATRON</Badge>
            </h1>
            <p className="text-white/60">Maintenance, Kill Switch, Security Shield</p>
          </div>
        </div>
        <Badge className={`${hasAnyKillSwitch || platformState.maintenanceMode ? "bg-rose-500" : "bg-emerald-500"} text-white border-0 px-4 py-2 text-sm`}>
          {hasAnyKillSwitch ? "ALERTE ACTIVE" : platformState.maintenanceMode ? "MAINTENANCE" : "OPERATIONNEL"}
        </Badge>
      </div>

      {/* Alert Banner */}
      {(hasAnyKillSwitch || platformState.maintenanceMode) && (
        <div className={`p-4 rounded-lg border ${hasAnyKillSwitch ? "bg-rose-500/10 border-rose-500/30" : "bg-amber-500/10 border-amber-500/30"}`}>
          <div className="flex items-center gap-3">
            <AlertOctagon className={`h-6 w-6 ${hasAnyKillSwitch ? "text-rose-400" : "text-amber-400"}`} />
            <div className="flex-1">
              <p className="text-white font-semibold">
                {platformState.killSwitchGlobal ? "KILL SWITCH GLOBAL ACTIF" :
                 platformState.maintenanceMode ? "MODE MAINTENANCE ACTIF" :
                 "SERVICES PARTIELLEMENT SUSPENDUS"}
              </p>
              <p className="text-white/60 text-sm">
                {platformState.killSwitchFinance && "Finance "}
                {platformState.killSwitchContent && "Contenus "}
                {platformState.killSwitchVixupoints && "VIXUpoints "}
                {platformState.killSwitchSocial && "Social "}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="border-white/20 text-white hover:bg-white/10"
              onClick={() => openConfirmDialog(
                "reactivate-all",
                "Reactiver tous les services",
                "Cette action va reactiver tous les services. Les utilisateurs pourront a nouveau acceder a la plateforme.",
                "Reactiver",
                false
              )}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Tout reactiver
            </Button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mode Maintenance */}
        <Card className="bg-slate-900/50 border-amber-500/30">
          <CardHeader className="border-b border-amber-500/30 bg-amber-500/5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/20">
                <Settings className="h-5 w-5 text-amber-400" />
              </div>
              <div>
                <CardTitle className="text-white">Mode Maintenance</CardTitle>
                <p className="text-amber-300/70 text-sm">Mise hors service temporaire</p>
              </div>
              <Badge className={`ml-auto ${platformState.maintenanceMode ? "bg-amber-500" : "bg-slate-600"}`}>
                {platformState.maintenanceMode ? "ACTIF" : "INACTIF"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-3">
              <Label className="text-white/70">Message affiche aux utilisateurs</Label>
              <Textarea
                value={maintenanceMessage}
                onChange={(e) => setMaintenanceMessage(e.target.value)}
                placeholder="Message de maintenance..."
                className="bg-slate-800 border-slate-700 text-white resize-none"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-white/70 text-sm">Programmation</Label>
                <Input
                  type="datetime-local"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white/70 text-sm">Duree estimee</Label>
                <Input
                  placeholder="Ex: 2 heures"
                  value={estimatedDuration}
                  onChange={(e) => setEstimatedDuration(e.target.value)}
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              {!platformState.maintenanceMode ? (
                <>
                  <Button
                    className="flex-1 bg-amber-600 hover:bg-amber-700"
                    onClick={() => openConfirmDialog(
                      "enable-maintenance",
                      "Activer le mode maintenance",
                      "Les utilisateurs seront rediriges vers une page de maintenance. Seuls les admins pourront acceder.",
                      "Activer",
                      false
                    )}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Activer
                  </Button>
                  <Button
                    variant="outline"
                    className="border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
                    onClick={() => openConfirmDialog(
                      "enable-partial-maintenance",
                      "Maintenance partielle",
                      "Seuls certains modules seront desactives.",
                      "Activer partielle",
                      false
                    )}
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    Partielle
                  </Button>
                </>
              ) : (
                <Button
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                  onClick={() => handleAction("disable-maintenance")}
                  disabled={loading}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Desactiver
                </Button>
              )}
            </div>

            <Button variant="outline" className="w-full border-slate-600 text-white/60 hover:bg-slate-800">
              <Send className="h-4 w-4 mr-2" />
              Envoyer message aux utilisateurs
            </Button>
          </CardContent>
        </Card>

        {/* Kill Switch Panel */}
        <Card className="bg-slate-900/50 border-rose-500/30">
          <CardHeader className="border-b border-rose-500/30 bg-rose-500/5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-rose-500/20">
                <ShieldOff className="h-5 w-5 text-rose-400" />
              </div>
              <div>
                <CardTitle className="text-white">Kill Switch - URGENCE</CardTitle>
                <p className="text-rose-300/70 text-sm">Arret immediat des fonctions critiques</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-3">
            {/* Kill Switch Global */}
            <div className={`p-4 rounded-lg border ${platformState.killSwitchGlobal ? "bg-rose-500/20 border-rose-500" : "bg-slate-800/50 border-slate-700/50"}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AlertOctagon className={`h-6 w-6 ${platformState.killSwitchGlobal ? "text-rose-400" : "text-white/40"}`} />
                  <div>
                    <p className="text-white font-semibold">Kill Switch GLOBAL</p>
                    <p className="text-white/50 text-xs">Coupe TOUS les services immediatement</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  className={platformState.killSwitchGlobal ? "bg-emerald-600 hover:bg-emerald-700" : "bg-rose-600 hover:bg-rose-700"}
                  onClick={() => openConfirmDialog(
                    platformState.killSwitchGlobal ? "disable-kill-switch" : "kill-switch",
                    platformState.killSwitchGlobal ? "Desactiver Kill Switch Global" : "ACTIVER KILL SWITCH GLOBAL",
                    platformState.killSwitchGlobal
                      ? "Les services seront reactives."
                      : "ATTENTION: Coupe IMMEDIATEMENT toutes les fonctions critiques. Urgence absolue uniquement.",
                    platformState.killSwitchGlobal ? "Desactiver" : "Je confirme l'activation",
                    !platformState.killSwitchGlobal,
                    "global"
                  )}
                >
                  {platformState.killSwitchGlobal ? <CheckCircle className="h-4 w-4 mr-1" /> : <PowerOff className="h-4 w-4 mr-1" />}
                  {platformState.killSwitchGlobal ? "Reactiver" : "ACTIVER"}
                </Button>
              </div>
            </div>

            {/* Partial Kill Switches */}
            <KillSwitchRow
              icon={DollarSign}
              label="Finance"
              description="Contributions, retraits, gains, wallet"
              active={platformState.killSwitchFinance}
              disabled={platformState.killSwitchGlobal}
              onToggle={() => openConfirmDialog(
                platformState.killSwitchFinance ? "disable-kill-switch" : "kill-switch",
                platformState.killSwitchFinance ? "Reactiver Finance" : "Couper Finance",
                platformState.killSwitchFinance ? "Operations financieres reactivees." : "Coupe: contributions, retraits, gains, wallet",
                platformState.killSwitchFinance ? "Reactiver" : "Confirmer",
                !platformState.killSwitchFinance,
                "finance"
              )}
            />

            <KillSwitchRow
              icon={Film}
              label="Contenus"
              description="Uploads, publications, telechargements"
              active={platformState.killSwitchContent}
              disabled={platformState.killSwitchGlobal}
              onToggle={() => openConfirmDialog(
                platformState.killSwitchContent ? "disable-kill-switch" : "kill-switch",
                platformState.killSwitchContent ? "Reactiver Contenus" : "Couper Contenus",
                platformState.killSwitchContent ? "Contenus reactives." : "Coupe: uploads, publications, telechargements",
                platformState.killSwitchContent ? "Reactiver" : "Confirmer",
                !platformState.killSwitchContent,
                "content"
              )}
            />

            <KillSwitchRow
              icon={Coins}
              label="VIXUpoints"
              description="Generation, attribution, paiement hybride"
              active={platformState.killSwitchVixupoints}
              disabled={platformState.killSwitchGlobal}
              onToggle={() => openConfirmDialog(
                platformState.killSwitchVixupoints ? "disable-kill-switch" : "kill-switch",
                platformState.killSwitchVixupoints ? "Reactiver VIXUpoints" : "Couper VIXUpoints",
                platformState.killSwitchVixupoints ? "VIXUpoints reactives." : "Coupe: generation, attribution, paiement hybride",
                platformState.killSwitchVixupoints ? "Reactiver" : "Confirmer",
                !platformState.killSwitchVixupoints,
                "vixupoints"
              )}
            />

            <KillSwitchRow
              icon={MessageCircle}
              label="Social"
              description="Commentaires, VIXUAL Social, messagerie"
              active={platformState.killSwitchSocial}
              disabled={platformState.killSwitchGlobal}
              onToggle={() => openConfirmDialog(
                platformState.killSwitchSocial ? "disable-kill-switch" : "kill-switch",
                platformState.killSwitchSocial ? "Reactiver Social" : "Couper Social",
                platformState.killSwitchSocial ? "Fonctions sociales reactivees." : "Coupe: commentaires, publications, messagerie",
                platformState.killSwitchSocial ? "Reactiver" : "Confirmer",
                !platformState.killSwitchSocial,
                "social"
              )}
            />
          </CardContent>
        </Card>
      </div>

      {/* Security Shield */}
      <Card className="bg-slate-900/50 border-sky-500/30">
        <CardHeader className="border-b border-sky-500/30 bg-sky-500/5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-sky-500/20">
              <ShieldCheck className="h-5 w-5 text-sky-400" />
            </div>
            <div>
              <CardTitle className="text-white">Security Shield Monitoring</CardTitle>
              <p className="text-sky-300/70 text-sm">Etat des protections en temps reel</p>
            </div>
            <Badge className="ml-auto bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
              {platformState.securityShield.incidentsCount} incidents
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            <SecurityStatusCard icon={Cloud} label="Cloudflare" status={platformState.securityShield.cloudflare} />
            <SecurityStatusCard icon={Upload} label="Scanner" status={platformState.securityShield.uploadScanner} />
            <SecurityStatusCard icon={Server} label="API Guard" status={platformState.securityShield.apiGuard} />
            <SecurityStatusCard icon={Lock} label="Auth" status={platformState.securityShield.authService} />
            <SecurityStatusCard icon={DollarSign} label="Stripe" status={platformState.securityShield.stripeService} />
            <SecurityStatusCard icon={Film} label="Bunny" status={platformState.securityShield.bunnyService} />
            <SecurityStatusCard icon={Database} label="Database" status={platformState.securityShield.database} />
          </div>
        </CardContent>
      </Card>

      {/* Activity Log */}
      <Card className="bg-slate-900/50 border-slate-700/50">
        <CardHeader className="border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/20">
              <Activity className="h-5 w-5 text-purple-400" />
            </div>
            <CardTitle className="text-white">Journal des actions ADMIN/PATRON</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <div className="space-y-2">
            {[
              { time: "14:42", action: "Connexion 2FA validee", user: "ADMIN/PATRON", type: "success" },
              { time: "14:30", action: "Acces Centre de Controle", user: "ADMIN/PATRON", type: "info" },
              { time: "12:15", action: "Scan securite automatique OK", user: "SYSTEM", type: "info" },
              { time: "10:00", action: "Backup base de donnees termine", user: "SYSTEM", type: "success" },
            ].map((log, i) => (
              <div key={i} className="flex items-center gap-3 p-2 rounded bg-slate-800/30 text-sm">
                <span className="text-white/40 w-12">{log.time}</span>
                <span className={log.type === "success" ? "text-emerald-400" : "text-white/70"}>{log.action}</span>
                <span className="text-amber-400/60 ml-auto">{log.user}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}>
        <DialogContent className={`bg-slate-900 border ${confirmDialog.dangerous ? "border-rose-500/50" : "border-slate-700"}`}>
          <DialogHeader>
            <DialogTitle className={`flex items-center gap-2 ${confirmDialog.dangerous ? "text-rose-400" : "text-white"}`}>
              {confirmDialog.dangerous && <AlertTriangle className="h-5 w-5" />}
              {confirmDialog.title}
            </DialogTitle>
            <DialogDescription className="text-white/60">{confirmDialog.description}</DialogDescription>
          </DialogHeader>

          {confirmDialog.dangerous && (
            <div className="space-y-3">
              <Label className="text-white/70 text-sm">
                Tapez <span className="text-rose-400 font-mono">"{confirmDialog.confirmText}"</span> pour confirmer:
              </Label>
              <Input
                value={confirmInput}
                onChange={(e) => setConfirmInput(e.target.value)}
                placeholder="Confirmation..."
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => { setConfirmDialog({ ...confirmDialog, open: false }); setConfirmInput("") }}
              className="border-slate-600 text-white/70 hover:bg-slate-800"
            >
              Annuler
            </Button>
            <Button
              onClick={() => handleAction(confirmDialog.action, confirmDialog.type)}
              disabled={loading || (confirmDialog.dangerous && confirmInput !== confirmDialog.confirmText)}
              className={confirmDialog.dangerous ? "bg-rose-600 hover:bg-rose-700" : "bg-emerald-600 hover:bg-emerald-700"}
            >
              {loading ? "..." : confirmDialog.confirmText}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function KillSwitchRow({ icon: Icon, label, description, active, disabled, onToggle }: {
  icon: React.ElementType; label: string; description: string; active: boolean; disabled: boolean; onToggle: () => void
}) {
  return (
    <div className={`p-3 rounded-lg border flex items-center justify-between ${active ? "bg-rose-500/10 border-rose-500/50" : "bg-slate-800/50 border-slate-700/50"} ${disabled ? "opacity-50" : ""}`}>
      <div className="flex items-center gap-3">
        <Icon className={`h-5 w-5 ${active ? "text-rose-400" : "text-white/40"}`} />
        <div>
          <p className="text-white text-sm font-medium">{label}</p>
          <p className="text-white/40 text-xs">{description}</p>
        </div>
      </div>
      <Button size="sm" variant="outline" disabled={disabled} onClick={onToggle}
        className={active ? "border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10" : "border-rose-500/50 text-rose-400 hover:bg-rose-500/10"}>
        {active ? "Reactiver" : "Couper"}
      </Button>
    </div>
  )
}

function SecurityStatusCard({ icon: Icon, label, status }: { icon: React.ElementType; label: string; status: "ok" | "degraded" | "critical" }) {
  const colors = {
    ok: { bg: "bg-emerald-500/10", border: "border-emerald-500/30", text: "text-emerald-400", StatusIcon: CheckCircle },
    degraded: { bg: "bg-amber-500/10", border: "border-amber-500/30", text: "text-amber-400", StatusIcon: AlertCircle },
    critical: { bg: "bg-rose-500/10", border: "border-rose-500/30", text: "text-rose-400", StatusIcon: XCircle },
  }
  const c = colors[status]
  return (
    <div className={`p-3 rounded-lg border ${c.bg} ${c.border} text-center`}>
      <Icon className={`h-6 w-6 mx-auto mb-2 ${c.text}`} />
      <p className="text-white text-xs font-medium mb-1">{label}</p>
      <div className="flex items-center justify-center gap-1">
        <c.StatusIcon className={`h-3 w-3 ${c.text}`} />
        <span className={`text-xs uppercase ${c.text}`}>{status}</span>
      </div>
    </div>
  )
}
