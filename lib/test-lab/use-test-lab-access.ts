"use client"

/**
 * Hook client : verifie l'eligibilite ADMIN/PATRON cote interface.
 * SECURITE STRICTE : seul jocelyndru@gmail.com peut acceder au Test Lab.
 * Le serveur reverifie systematiquement (assertTestLabAccess).
 */

import { useAuth } from "@/lib/auth-context"

const PATRON_EMAIL = "jocelyndru@gmail.com"

export function useTestLabAccess() {
  const { user, isAdmin, isAuthed } = useAuth()
  const email = user?.email?.trim().toLowerCase() ?? ""
  const isPatron = email === PATRON_EMAIL

  // Bouton visible pour tous les admins (pour montrer que ca existe)
  const showButton = isAuthed && isAdmin

  // Acces reel uniquement pour le PATRON
  const canAccess = isAuthed && isAdmin && isPatron

  // Message explicatif si bouton visible mais acces bloque
  const blockedReason = !isAdmin
    ? "Reserve aux administrateurs"
    : !isPatron
      ? "Reserve au PATRON uniquement"
      : null

  return {
    isVisible: true,
    isAuthed,
    isAdmin,
    isPatron,
    email,
    showButton,
    canAccess,
    blockedReason,
  }
}
