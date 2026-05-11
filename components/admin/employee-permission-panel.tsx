"use client"

/**
 * VIXUAL — Panneau de permissions employé (réutilisable)
 *
 * Composant unique branché dans :
 *  - encart "ADMIN-Adjoint"
 *  - encart "EMPLOYÉS VIXUAL"
 *  - résultat "Rechercher un employé"
 *  - filtre "Tous les rôles"
 *
 * Règles hiérarchiques (patch §11 / §13) :
 *  - ADMIN/PATRON (jocelyndru@gmail.com) seul à cocher/décocher
 *  - Les "permissions critiques" sont affichées en lecture seule
 *    et jamais cochables (réservées exclusivement au PATRON).
 */

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Crown, Lock, Mail, Shield, ShieldAlert } from "lucide-react"
import type { Employee, EmployeePermission } from "@/lib/admin/employees"
import { EMPLOYEE_ROLES } from "@/lib/admin/employees"

// ─── Libellés FR des permissions existantes (les 15 du système actuel) ───
const PERMISSION_LABELS: Record<EmployeePermission, { label: string; group: "support" | "moderation" | "finance" | "team" | "escalation" }> = {
  can_view_payments:             { label: "Voir les paiements",            group: "finance" },
  can_manage_payment_tickets:    { label: "Gérer les tickets paiements",   group: "finance" },
  can_view_users:                { label: "Voir les utilisateurs",         group: "support" },
  can_manage_user_tickets:       { label: "Gérer les tickets utilisateurs", group: "support" },
  can_moderate_content:          { label: "Modérer les contenus",          group: "moderation" },
  can_view_reports:              { label: "Voir les signalements",         group: "moderation" },
  can_manage_support_queue:      { label: "Gérer la file de support",      group: "support" },
  can_assign_tickets:            { label: "Assigner des tickets",          group: "team" },
  can_access_creator_support:    { label: "Accompagner les créateurs",     group: "support" },
  can_access_archives_stats:     { label: "Accéder aux archives & stats",  group: "moderation" },
  can_view_admin_dashboard:      { label: "Voir le tableau de bord ADMIN", group: "team" },
  can_manage_employee_notes:     { label: "Gérer les notes d'équipe",      group: "team" },
  can_suspend_non_admin_accounts:{ label: "Suspendre des comptes (non-admin)", group: "moderation" },
  can_escalate_to_adjoint:       { label: "Escalader à l'ADMIN-Adjoint",   group: "escalation" },
  can_escalate_to_patron:        { label: "Escalader à l'ADMIN/PATRON",    group: "escalation" },
}

const GROUP_META: Record<"support" | "moderation" | "finance" | "team" | "escalation", { label: string; color: string }> = {
  support:    { label: "Support utilisateurs", color: "text-sky-300" },
  moderation: { label: "Modération",           color: "text-rose-300" },
  finance:    { label: "Finances",             color: "text-emerald-300" },
  team:       { label: "Équipe",               color: "text-violet-300" },
  escalation: { label: "Escalades",            color: "text-amber-300" },
}

// ─── Permissions critiques (patch §11) — toujours verrouillées ───
const CRITICAL_PERMISSIONS = [
  { key: "full_admin_access",        label: "Accès admin complet" },
  { key: "manage_admin_patron",      label: "Modifier ADMIN/PATRON" },
  { key: "manage_stripe_full",       label: "Gérer Stripe complet" },
  { key: "manage_bunny_full",        label: "Gérer Bunny complet" },
  { key: "delete_platform",          label: "Supprimer plateforme" },
  { key: "change_platform_owner",    label: "Changer propriétaire" },
  { key: "manage_security_critical", label: "Sécurité critique" },
  { key: "export_all_users",         label: "Exporter tous utilisateurs" },
  { key: "export_all_finances",      label: "Exporter toutes finances" },
] as const

const COLOR_MAP: Record<string, { bg: string; text: string; border: string }> = {
  amber:   { bg: "bg-amber-500/15",   text: "text-amber-300",   border: "border-amber-500/30" },
  orange:  { bg: "bg-orange-500/15",  text: "text-orange-300",  border: "border-orange-500/30" },
  sky:     { bg: "bg-sky-500/15",     text: "text-sky-300",     border: "border-sky-500/30" },
  violet:  { bg: "bg-violet-500/15",  text: "text-violet-300",  border: "border-violet-500/30" },
  emerald: { bg: "bg-emerald-500/15", text: "text-emerald-300", border: "border-emerald-500/30" },
  blue:    { bg: "bg-blue-500/15",    text: "text-blue-300",    border: "border-blue-500/30" },
  rose:    { bg: "bg-rose-500/15",    text: "text-rose-300",    border: "border-rose-500/30" },
  teal:    { bg: "bg-teal-500/15",    text: "text-teal-300",    border: "border-teal-500/30" },
  purple:  { bg: "bg-purple-500/15", text: "text-purple-300",   border: "border-purple-500/30" },
}

export interface EmployeePermissionPanelProps {
  employee: Employee
  canEdit: boolean
  onTogglePermission: (employeeId: string, permissionKey: EmployeePermission, value: boolean) => void
}

export function EmployeePermissionPanel({
  employee,
  canEdit,
  onTogglePermission,
}: EmployeePermissionPanelProps) {
  const roleConfig = EMPLOYEE_ROLES[employee.role]
  const accent = COLOR_MAP[roleConfig.color] ?? COLOR_MAP.sky
  const isPatronCard = employee.role === "admin_patron"

  // Regroupement par catégorie pour une lecture rapide
  const grouped = (Object.entries(PERMISSION_LABELS) as [EmployeePermission, typeof PERMISSION_LABELS[EmployeePermission]][])
    .reduce<Record<string, { key: EmployeePermission; label: string }[]>>((acc, [key, meta]) => {
      ;(acc[meta.group] ??= []).push({ key, label: meta.label })
      return acc
    }, {})

  const activeCount = employee.permissions.length
  const totalCount = Object.keys(PERMISSION_LABELS).length

  return (
    <Card className="bg-slate-950/60 border-white/10 overflow-hidden">
      {/* ─── En-tête identité ─── */}
      <div className={`relative ${accent.bg} ${accent.border} border-b px-5 py-4`}>
        <div className="flex items-start gap-3">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${accent.bg} border ${accent.border}`}>
            {isPatronCard ? (
              <Crown className={`h-6 w-6 ${accent.text}`} />
            ) : (
              <Shield className={`h-6 w-6 ${accent.text}`} />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h3 className="text-white font-bold text-base leading-tight">
                {employee.firstName} {employee.lastName}
              </h3>
              <Badge className={`${accent.bg} ${accent.text} ${accent.border} border text-xs`}>
                {roleConfig.label} &middot; Lvl {roleConfig.level}
              </Badge>
              {employee.status === "active" ? (
                <Badge className="bg-emerald-500/15 text-emerald-300 border-emerald-500/30 border text-[10px]">Actif</Badge>
              ) : (
                <Badge className="bg-rose-500/15 text-rose-300 border-rose-500/30 border text-[10px]">
                  {employee.status === "suspended" ? "Suspendu" : "Inactif"}
                </Badge>
              )}
            </div>
            <p className="text-white/55 text-xs flex items-center gap-1.5 truncate">
              <Mail className="h-3 w-3 shrink-0" />
              <span className="truncate">{employee.email}</span>
            </p>
            <p className={`text-xs mt-1 ${accent.text}`}>{roleConfig.description}</p>
          </div>
          <div className="text-right shrink-0 hidden sm:block">
            <p className="text-[10px] uppercase tracking-wider text-white/40">Permissions</p>
            <p className="text-white font-bold text-sm">
              {activeCount}<span className="text-white/40"> / {totalCount}</span>
            </p>
          </div>
        </div>
      </div>

      <CardContent className="p-5 space-y-5">
        {/* ─── Bandeau d'édition ─── */}
        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${canEdit ? "bg-red-500/5 border-red-500/25" : "bg-white/[0.02] border-white/10"}`}>
          {canEdit ? (
            <>
              <Crown className="h-4 w-4 text-red-300 shrink-0" />
              <p className="text-red-200 text-xs">
                Vous êtes ADMIN/PATRON — vous pouvez modifier les permissions directement.
              </p>
            </>
          ) : (
            <>
              <Lock className="h-4 w-4 text-white/40 shrink-0" />
              <p className="text-white/50 text-xs">
                Lecture seule — seul l&apos;ADMIN/PATRON peut modifier ces permissions.
              </p>
            </>
          )}
        </div>

        {/* ─── Permissions actives (cochables) groupées par catégorie ─── */}
        <div className="space-y-4">
          {(Object.entries(grouped) as [keyof typeof GROUP_META, { key: EmployeePermission; label: string }[]][]).map(
            ([groupKey, items]) => {
              const meta = GROUP_META[groupKey]
              return (
                <div key={groupKey}>
                  <p className={`text-[11px] uppercase tracking-[0.14em] font-semibold mb-2 ${meta.color}`}>
                    {meta.label}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {items.map(({ key, label }) => {
                      const checked = employee.permissions.includes(key)
                      return (
                        <label
                          key={key}
                          className={`flex items-center justify-between gap-3 rounded-lg border px-3 py-2 text-sm transition-colors ${
                            checked
                              ? "bg-white/[0.04] border-white/15 text-white/90"
                              : "bg-black/20 border-white/5 text-white/55"
                          } ${canEdit ? "hover:border-white/25 cursor-pointer" : "cursor-default"}`}
                        >
                          <span className="leading-tight">{label}</span>
                          <input
                            type="checkbox"
                            checked={checked}
                            disabled={!canEdit}
                            onChange={(e) => onTogglePermission(employee.id, key, e.target.checked)}
                            className="h-4 w-4 accent-red-500 shrink-0 cursor-pointer disabled:cursor-not-allowed"
                            aria-label={label}
                          />
                        </label>
                      )
                    })}
                  </div>
                </div>
              )
            },
          )}
        </div>

        {/* ─── Permissions critiques (verrouillées — info uniquement) ─── */}
        <div className="pt-3 border-t border-white/10">
          <div className="flex items-center gap-2 mb-3">
            <ShieldAlert className="h-4 w-4 text-red-400" />
            <p className="text-[11px] uppercase tracking-[0.14em] font-semibold text-red-300">
              Permissions critiques &middot; réservées ADMIN/PATRON
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {CRITICAL_PERMISSIONS.map((p) => (
              <div
                key={p.key}
                className="flex items-center justify-between gap-3 rounded-lg border border-red-500/20 bg-red-500/[0.04] px-3 py-2 text-sm"
              >
                <span className="text-red-200/80 leading-tight">{p.label}</span>
                <Lock className="h-3.5 w-3.5 text-red-400/70 shrink-0" />
              </div>
            ))}
          </div>
          <p className="text-[11px] text-white/35 mt-3 leading-relaxed">
            Ces permissions ne sont jamais cochables, même pour l&apos;ADMIN-Adjoint.
            Elles sont attribuées exclusivement au compte propriétaire de la plateforme.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
