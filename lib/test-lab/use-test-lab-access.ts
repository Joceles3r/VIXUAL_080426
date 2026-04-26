"use client"

/**
 * Hook client : verifie l'eligibilite ADMIN/PATRON cote interface.
 * Le serveur reverifie systematiquement (assertTestLabAccess).
 */

import { useAuth } from "@/lib/auth-context"
import { PATRON_EMAIL } from "@/lib/test-lab/guards"

const PUBLIC_VISIBLE = process.env.NEXT_PUBLIC_VIXUAL_TEST_LAB_VISIBLE === "true"

export function useTestLabAccess() {
  const { user, isAdmin, isAuthed } = useAuth()
  const email = user?.email?.trim().toLowerCase() ?? ""
  const isPatron = email === PATRON_EMAIL

  return {
    isVisible: PUBLIC_VISIBLE,
    isAuthed,
    isAdmin,
    isPatron,
    email,
    canAccess: PUBLIC_VISIBLE && isAuthed && isAdmin && isPatron,
  }
}
