"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Wrench, Save, AlertTriangle, CheckCircle2 } from "lucide-react"
import {
  getMaintenanceConfig,
  saveMaintenanceConfig,
  type MaintenanceConfig,
} from "@/lib/maintenance"
import { hasLaunchPermission } from "@/lib/admin/launch-permissions"

export default function MaintenancePage() {
  const { user } = useAuth()
  const [config, setConfig] = useState<MaintenanceConfig | null>(null)
  const [savedAt, setSavedAt] = useState<Date | null>(null)

  useEffect(() => {
    setConfig(getMaintenanceConfig())
  }, [])

  // Permission : seul PATRON ou ADMIN_ADJOINT
  const canManage = user?.email
    ? hasLaunchPermission((user as { role?: string }).role === "patron" ? "patron" : "admin_adjoint", "manage_homepage")
    : false

  if (!config) {
    return <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">Chargement...</div>
  }

  const handleSave = () => {
    if (!user?.email) return
    const saved = saveMaintenanceConfig(config, user.email)
    setConfig(saved)
    setSavedAt(new Date())
    setTimeout(() => setSavedAt(null), 3000)
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-2">
          <Wrench className="h-6 w-6 text-amber-400" />
          <h1 className="text-3xl font-bold">Mode Maintenance</h1>
        </div>
        <p className="text-white/60 mb-8">
          Activer le mode maintenance affiche un bandeau global et permet de couper certaines fonctionnalites.
          ADMIN/PATRON conserve toujours acces complet.
        </p>

        {/* Toggle principal */}
        <Card className={`p-6 mb-6 border-2 ${config.enabled ? "border-amber-500/60 bg-amber-500/5" : "border-white/10 bg-white/[0.03]"}`}>
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h2 className="text-xl font-bold mb-1">Maintenance globale</h2>
              <p className="text-sm text-white/60">
                {config.enabled ? "ACTIVE — bandeau visible sur toute la plateforme" : "Inactive — plateforme en fonctionnement normal"}
              </p>
            </div>
            <Switch
              checked={config.enabled}
              onCheckedChange={(v) => setConfig({ ...config, enabled: v })}
              disabled={!canManage}
            />
          </div>

          <div className="space-y-3">
            <Label className="text-xs text-white/60">Message affiche aux utilisateurs</Label>
            <Textarea
              value={config.message}
              onChange={(e) => setConfig({ ...config, message: e.target.value })}
              rows={3}
              maxLength={300}
              placeholder="VIXUAL est temporairement en maintenance..."
              className="bg-black/30 border-white/10 text-white"
              disabled={!canManage}
            />
          </div>
        </Card>

        {/* Restrictions granulaires */}
        <h2 className="text-xs uppercase tracking-widest text-white/40 mb-3">Restrictions ciblees</h2>
        <Card className="p-5 mb-6 bg-white/[0.03] border-white/10 space-y-4">
          <ToggleRow
            label="Couper les uploads"
            desc="Bloque les depots de fichiers (Hero, vignettes, contenus)."
            checked={config.blockUploads}
            onChange={(v) => setConfig({ ...config, blockUploads: v })}
            disabled={!canManage}
          />
          <ToggleRow
            label="Couper les paiements"
            desc="Bloque Stripe Checkout et tout flux financier (placeholders OK)."
            checked={config.blockPayments}
            onChange={(v) => setConfig({ ...config, blockPayments: v })}
            disabled={!canManage}
          />
          <ToggleRow
            label="Couper la V2/V3"
            desc="Force tous les utilisateurs sur la V1 (mode lancement)."
            checked={config.blockV2}
            onChange={(v) => setConfig({ ...config, blockV2: v })}
            disabled={!canManage}
          />
        </Card>

        {/* Sauvegarde */}
        <div className="flex items-center gap-3">
          <Button
            onClick={handleSave}
            disabled={!canManage}
            className="bg-amber-500 hover:bg-amber-600 text-black font-bold"
          >
            <Save className="h-4 w-4 mr-2" />
            Enregistrer la configuration
          </Button>
          {savedAt && (
            <span className="text-emerald-400 text-sm flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4" />
              Enregistre a {savedAt.toLocaleTimeString("fr-FR")}
            </span>
          )}
        </div>

        {!canManage && (
          <Card className="mt-6 p-4 border-rose-500/30 bg-rose-500/10">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-rose-400 mt-0.5" />
              <p className="text-sm text-rose-200">
                Vous n&apos;avez pas la permission <code className="text-rose-100">manage_homepage</code> requise pour modifier le mode maintenance.
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}

function ToggleRow({
  label, desc, checked, onChange, disabled,
}: { label: string; desc: string; checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2 border-b border-white/5 last:border-0">
      <div className="flex-1 min-w-0">
        <p className="font-medium text-white">{label}</p>
        <p className="text-xs text-white/50 mt-0.5">{desc}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} disabled={disabled} />
    </div>
  )
}
