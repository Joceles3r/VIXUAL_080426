"use client"

/**
 * Hook client : verifie l'eligibilite ADMIN/PATRON cote interface.
 * Le serveur reverifie systematiquement (assertTestLabAccess).
 *
 * showButton = true pour tous les admins (bouton toujours visible)
 * canAccess = true uniquement si env configuree ET patron
 */

import { useAuth } from "@/lib/auth-context"
import { PATRON_EMAIL } from "@/lib/test-lab/guards"

const PUBLIC_VISIBLE = process.env.NEXT_PUBLIC_VIXUAL_TEST_LAB_VISIBLE === "true"

export function useTestLabAccess() {
  const { user, isAdmin, isAuthed } = useAuth()
  const email = user?.email?.trim().toLowerCase() ?? ""
  const isPatron = email === PATRON_EMAIL

  // Le bouton est TOUJOURS visible pour les admins (meme si env non configuree)
  const showButton = isAuthed && isAdmin

  // L'acces reel necessite l'env + patron
  const canAccess = PUBLIC_VISIBLE && isAuthed && isAdmin && isPatron

  // Message explicatif si bouton visible mais acces bloque
  const blockedReason = !PUBLIC_VISIBLE
    ? "Variable NEXT_PUBLIC_VIXUAL_TEST_LAB_VISIBLE non configuree"
    : !isPatron
      ? "Reserve au PATRON uniquement"
      : null

  return {
    isVisible: PUBLIC_VISIBLE,
    isAuthed,
    isAdmin,
    isPatron,
    email,
    showButton,
    canAccess,
    blockedReason,
  }
}
