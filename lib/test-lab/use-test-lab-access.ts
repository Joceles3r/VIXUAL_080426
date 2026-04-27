"use client"

/**
 * Hook client : verifie l'eligibilite ADMIN/PATRON cote interface.
 * Simplifie : tous les admins ont acces au Test Lab.
 */

import { useAuth } from "@/lib/auth-context"

export function useTestLabAccess() {
  const { user, isAdmin, isAuthed } = useAuth()

  // SIMPLIFIE : tous les admins ont acces au Test Lab
  const showButton = isAuthed && isAdmin
  const canAccess = isAuthed && isAdmin

  return {
    isVisible: true,
    isAuthed,
    isAdmin,
    isPatron: isAdmin, // Pour le PATRON, admin = patron
    email: user?.email ?? "",
    showButton,
    canAccess,
    blockedReason: !isAdmin ? "Reserve aux administrateurs" : null,
  }
}
