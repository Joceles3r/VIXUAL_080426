/**
 * VIXUAL - Platform State Management
 *
 * Gere l'etat de la plateforme: Mode Maintenance, Kill Switch, Security Shield
 *
 * Utilisation:
 * - Mode Maintenance: mise hors service temporaire pour les utilisateurs
 * - Kill Switch: arret d'urgence des fonctions critiques
 * - Security Shield: surveillance de la sante securitaire
 */

// Types
export type MaintenanceScope = "global" | "partial"
export type KillSwitchType = "global" | "finance" | "content" | "vixupoints" | "social"

export interface PlatformState {
  // Mode Maintenance
  maintenanceMode: boolean
  maintenanceMessage: string
  maintenanceScheduledAt: string | null
  maintenanceEstimatedDuration: string | null
  maintenanceScope: MaintenanceScope
  maintenanceModules: {
    withdrawals: boolean
    contributions: boolean
    uploads: boolean
    publications: boolean
    streaming: boolean
    wallet: boolean
  }

  // Kill Switches
  killSwitchGlobal: boolean
  killSwitchFinance: boolean
  killSwitchContent: boolean
  killSwitchVixupoints: boolean
  killSwitchSocial: boolean

  // Security Shield Status
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

  // Metadata
  updatedBy: string
  updatedAt: string
}

// Default state
export const DEFAULT_PLATFORM_STATE: PlatformState = {
  maintenanceMode: false,
  maintenanceMessage: "VIXUAL est temporairement en maintenance. Nos equipes ameliorent la plateforme pour vous offrir une meilleure experience.",
  maintenanceScheduledAt: null,
  maintenanceEstimatedDuration: null,
  maintenanceScope: "global",
  maintenanceModules: {
    withdrawals: false,
    contributions: false,
    uploads: false,
    publications: false,
    streaming: false,
    wallet: false,
  },
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

// In-memory state (in production, use database/Redis)
let platformState: PlatformState = { ...DEFAULT_PLATFORM_STATE }

// Getters
export function getPlatformState(): PlatformState {
  return { ...platformState }
}

export function isMaintenanceActive(): boolean {
  return platformState.maintenanceMode
}

export function isKillSwitchActive(type?: KillSwitchType): boolean {
  if (!type) return platformState.killSwitchGlobal
  switch (type) {
    case "global": return platformState.killSwitchGlobal
    case "finance": return platformState.killSwitchFinance || platformState.killSwitchGlobal
    case "content": return platformState.killSwitchContent || platformState.killSwitchGlobal
    case "vixupoints": return platformState.killSwitchVixupoints || platformState.killSwitchGlobal
    case "social": return platformState.killSwitchSocial || platformState.killSwitchGlobal
    default: return false
  }
}

export function isModuleBlocked(module: keyof PlatformState["maintenanceModules"]): boolean {
  if (platformState.maintenanceMode && platformState.maintenanceScope === "global") {
    return true
  }
  return platformState.maintenanceModules[module]
}

// Setters
export function setMaintenanceMode(
  enabled: boolean,
  options?: {
    message?: string
    scope?: MaintenanceScope
    scheduledAt?: string
    estimatedDuration?: string
    modules?: Partial<PlatformState["maintenanceModules"]>
  },
  updatedBy?: string
): PlatformState {
  platformState = {
    ...platformState,
    maintenanceMode: enabled,
    maintenanceMessage: options?.message ?? platformState.maintenanceMessage,
    maintenanceScope: options?.scope ?? platformState.maintenanceScope,
    maintenanceScheduledAt: options?.scheduledAt ?? null,
    maintenanceEstimatedDuration: options?.estimatedDuration ?? null,
    maintenanceModules: options?.modules
      ? { ...platformState.maintenanceModules, ...options.modules }
      : platformState.maintenanceModules,
    updatedBy: updatedBy ?? "ADMIN",
    updatedAt: new Date().toISOString(),
  }
  return getPlatformState()
}

export function activateKillSwitch(
  type: KillSwitchType,
  updatedBy?: string
): PlatformState {
  const updates: Partial<PlatformState> = {
    updatedBy: updatedBy ?? "ADMIN",
    updatedAt: new Date().toISOString(),
  }

  switch (type) {
    case "global":
      updates.killSwitchGlobal = true
      updates.killSwitchFinance = true
      updates.killSwitchContent = true
      updates.killSwitchVixupoints = true
      updates.killSwitchSocial = true
      break
    case "finance":
      updates.killSwitchFinance = true
      break
    case "content":
      updates.killSwitchContent = true
      break
    case "vixupoints":
      updates.killSwitchVixupoints = true
      break
    case "social":
      updates.killSwitchSocial = true
      break
  }

  platformState = { ...platformState, ...updates }
  return getPlatformState()
}

export function deactivateKillSwitch(
  type: KillSwitchType,
  updatedBy?: string
): PlatformState {
  const updates: Partial<PlatformState> = {
    updatedBy: updatedBy ?? "ADMIN",
    updatedAt: new Date().toISOString(),
  }

  switch (type) {
    case "global":
      updates.killSwitchGlobal = false
      updates.killSwitchFinance = false
      updates.killSwitchContent = false
      updates.killSwitchVixupoints = false
      updates.killSwitchSocial = false
      break
    case "finance":
      updates.killSwitchFinance = false
      break
    case "content":
      updates.killSwitchContent = false
      break
    case "vixupoints":
      updates.killSwitchVixupoints = false
      break
    case "social":
      updates.killSwitchSocial = false
      break
  }

  platformState = { ...platformState, ...updates }
  return getPlatformState()
}

export function reactivateAllServices(updatedBy?: string): PlatformState {
  platformState = {
    ...DEFAULT_PLATFORM_STATE,
    updatedBy: updatedBy ?? "ADMIN",
    updatedAt: new Date().toISOString(),
  }
  return getPlatformState()
}

// Messages utilisateur selon le type de coupure
export function getUserMessage(): string | null {
  if (platformState.maintenanceMode) {
    return platformState.maintenanceMessage
  }
  if (platformState.killSwitchGlobal) {
    return "VIXUAL est temporairement suspendu pour raison de securite. Merci de votre comprehension."
  }
  if (platformState.killSwitchFinance) {
    return "Les operations financieres sont momentanement suspendues pour raison de securite."
  }
  if (platformState.killSwitchContent) {
    return "Certaines fonctions de publication ou d'acces aux contenus sont temporairement indisponibles."
  }
  if (platformState.killSwitchVixupoints) {
    return "Le systeme de VIXUpoints est momentanement suspendu pour verification."
  }
  if (platformState.killSwitchSocial) {
    return "Les fonctionnalites sociales sont temporairement suspendues."
  }
  return null
}

// Check if user can access based on role
export function canAccessDuringMaintenance(role: string): boolean {
  const allowedRoles = ["admin", "admin-adjoint"]
  return allowedRoles.includes(role.toLowerCase())
}

// Security Shield update
export function updateSecurityShieldStatus(
  service: keyof PlatformState["securityShield"],
  status: "ok" | "degraded" | "critical"
): PlatformState {
  if (service === "incidentsCount") return platformState
  platformState = {
    ...platformState,
    securityShield: {
      ...platformState.securityShield,
      [service]: status,
    },
    updatedAt: new Date().toISOString(),
  }
  return getPlatformState()
}
