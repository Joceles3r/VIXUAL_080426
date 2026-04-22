"use client"

/**
 * VIXUAL Auth Context
 *
 * Production-ready authentication context with mock fallback for development.
 *
 * SECURITY NOTES:
 * - Mock auth is DISABLED in production by default
 * - To enable mock in dev, set NEXT_PUBLIC_USE_MOCK_AUTH=true
 * - ALL REAL AUTHENTICATION LOGIC RUNS ON THE API SIDE
 * - User verification is handled in each API route via database lookups
 * - KYC/identity checks happen in /api/stripe/* routes
 * - Risk Gate security checks happen in /api/security/* routes
 *
 * DO NOT rely on isAuthed or roles from this context for API decisions.
 * Always verify user identity server-side in API routes.
 */

import { createContext, useContext, useState, useEffect, ReactNode } from "react"

// ── Environment Detection ────────────────────────────────────────────────────

const IS_PRODUCTION = process.env.NODE_ENV === "production";
const USE_MOCK_AUTH = process.env.NEXT_PUBLIC_USE_MOCK_AUTH === "true";

// Log warning if mock auth is enabled
if (typeof window !== "undefined" && USE_MOCK_AUTH && !IS_PRODUCTION) {
  console.warn(
    "[VIXUAL Auth] Mock authentication is ENABLED. " +
    "This is for development only. Set NEXT_PUBLIC_USE_MOCK_AUTH=false for production."
  );
}

// Block mock auth in production unless explicitly allowed
if (IS_PRODUCTION && USE_MOCK_AUTH) {
  console.error(
    "[VIXUAL Auth] CRITICAL: Mock authentication cannot be enabled in production. " +
    "Remove NEXT_PUBLIC_USE_MOCK_AUTH from production environment."
  );
}
import type { VixualRole } from "@/components/navigation"
import type { ParentConsent } from "@/lib/vixupoints-engine"
import { isMinor as checkIsMinor, isEligibleForSignup, MINOR_VIXUPOINTS_CAP, DEFAULT_PARENT_CONSENT, MINOR_PARENT_CONSENT, checkMajorityUnlock } from "@/lib/vixupoints-engine"

export interface User {
  id: string
  name: string
  email: string
  roles: VixualRole[]
  avatarUrl?: string
  birthDate?: string
  isMinor: boolean
  vixupointsCap: number
  parentConsent: ParentConsent
  kycVerified: boolean
  // VERROU FINAL: cles officielles uniquement
  depositStatus?: {
    creator10: boolean
    contributor20: boolean
    infoporteur10: boolean
    contribu_lecteur20: boolean
    podcasteur10: boolean
    auditeur20: boolean
  }
  stripeConnect?: {
    accountId?: string
    status: "not_started" | "pending" | "verified"
  }
  wallet?: {
    available: number
    pending: number
  }
  visupoints?: number
  // Security fields (Identity + VPN Risk Gate)
  verificationLevel?: 0 | 1 | 2
  riskFlags?: {
    vpnSuspected?: boolean
    proxySuspected?: boolean
    torSuspected?: boolean
    datacenterIp?: boolean
    countryMismatch?: boolean
  }
  stepUp?: {
    phoneVerified?: boolean
    totpEnabled?: boolean
    lastStepUpAt?: string
  }
}

interface AuthContextType {
  user: User | null
  isAuthed: boolean
  isAdmin: boolean
  roles: VixualRole[]
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  signup: (data: { name: string; email: string; password: string; birthDate?: string }) => Promise<void>
  updateRoles: (newRoles: VixualRole[]) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Mock user pour demonstration (UUID format requis par Neon)
const MOCK_USER: User = {
  id: "00000000-0000-0000-0000-000000000001",
  name: "Jean Dupont",
  email: "jean@example.com",
  roles: ["visitor"],
  visupoints: 150,
  birthDate: undefined,
  isMinor: false,
  vixupointsCap: Infinity,
  parentConsent: DEFAULT_PARENT_CONSENT,
  kycVerified: false,
  depositStatus: {
    creator10: false,
    contributor20: false,
    infoporteur10: false,
    contribu_lecteur20: false,
    podcasteur10: false,
    auditeur20: false,
  },
  stripeConnect: {
    status: "not_started",
  },
  wallet: {
    available: 0,
    pending: 0,
  },
  verificationLevel: 0,
  riskFlags: {
    vpnSuspected: false,
    proxySuspected: false,
    torSuspected: false,
    datacenterIp: false,
    countryMismatch: false,
  },
  stepUp: {
    phoneVerified: false,
    totpEnabled: false,
    lastStepUpAt: undefined,
  },
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Restore session on mount
  useEffect(() => {
    async function restoreSession() {
      try {
        const response = await fetch("/api/auth/me")
        const data = await response.json()
        
        if (data.user) {
          setUser({
            ...MOCK_USER,
            id: data.user.id,
            name: data.user.name,
            email: data.user.email?.toLowerCase(),
            roles: data.user.roles || (data.user.role ? [data.user.role] : ["visitor"]),
          })
        }
      } catch (error) {
        console.error("[VIXUAL Auth] Session restore failed:", error)
      } finally {
        setIsLoading(false)
      }
    }
    
    restoreSession()
  }, [])

  const isAuthed = user !== null
  const roles: VixualRole[] = user?.roles ?? ["guest"]
  // Admin est un flag prive derive de l'email, pas un role de profil
  // Utilise NEXT_PUBLIC_ADMIN_EMAIL ou fallback vers jocelyndru@gmail.com (patron)
  const PATRON_EMAIL = "jocelyndru@gmail.com"
  const adminEmail = (process.env.NEXT_PUBLIC_ADMIN_EMAIL?.toLowerCase() || PATRON_EMAIL)
  const isAdmin = !!(user?.email && user.email.toLowerCase() === adminEmail)

  const login = async (email: string, password: string) => {
    // Real authentication via secure API
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || "Echec de connexion")
    }

    // Set user from API response - store email for isAdmin check
    const userEmail = data.user.email?.toLowerCase() || email.toLowerCase()
    setUser({
      ...MOCK_USER,
      id: data.user.id,
      name: data.user.name,
      email: userEmail,
      roles: data.user.roles || (data.user.role ? [data.user.role] : ["visitor"]),
    })
  }

  const logout = async () => {
    // Clear session cookie
    await fetch("/api/auth/logout", { method: "POST" })
    setUser(null)
  }

  const signup = async (data: { name: string; email: string; password: string; birthDate?: string }) => {
    // Real signup via secure API
    const response = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.error || "Echec d'inscription")
    }

    const minor = data.birthDate ? checkIsMinor(data.birthDate) : false
    setUser({
      ...MOCK_USER,
      id: result.user.id,
      name: data.name,
      email: data.email,
      birthDate: data.birthDate,
      isMinor: minor,
      vixupointsCap: minor ? MINOR_VIXUPOINTS_CAP : Infinity,
      parentConsent: minor ? MINOR_PARENT_CONSENT : DEFAULT_PARENT_CONSENT,
    })
  }

  const updateRoles = (newRoles: VixualRole[]) => {
    if (user) {
      setUser({ ...user, roles: newRoles })
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthed,
        isAdmin,
        roles,
        login,
        logout,
        signup,
        updateRoles,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
