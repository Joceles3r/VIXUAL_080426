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

  // Visibilite globale du module pilotee par variable d'env publique
  // (NEXT_PUBLIC_VIXUAL_TEST_LAB_VISIBLE === "true")
  const isVisible =
    process.env.NEXT_PUBLIC_VIXUAL_TEST_LAB_VISIBLE === "true"

  // Bouton visible uniquement quand le module est actif ET admin connecte
  const showButton = isVisible && isAuthed && isAdmin

  // Acces reel : module actif + admin + email PATRON
  const canAccess = isVisible && isAuthed && isAdmin && isPatron

  // Message explicatif si bouton visible mais acces bloque
  const blockedReason = !isVisible
    ? "Module desactive"
    : !isAdmin
      ? "Reserve aux administrateurs"
      : !isPatron
        ? "Reserve au PATRON uniquement"
        : null

  return {
    isVisible,
    isAuthed,
    isAdmin,
    isPatron,
    email,
    showButton,
    canAccess,
    blockedReason,
  }
}
