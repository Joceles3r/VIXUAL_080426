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

  // Visibilite globale : ACTIVE par defaut pour le PATRON.
  // La variable d'env publique sert de kill switch explicite : seule la
  // valeur "false" coupe le module. La protection email PATRON reste
  // l'unique gate de securite reelle.
  const isVisible =
    process.env.NEXT_PUBLIC_VIXUAL_TEST_LAB_VISIBLE !== "false"

  // Bouton visible uniquement pour le PATRON connecte (les autres admins
  // ne voient meme pas le module pour eviter toute confusion).
  const showButton = isVisible && isAuthed && isAdmin && isPatron

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
