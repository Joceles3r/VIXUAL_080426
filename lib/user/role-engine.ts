/**
 * Role Engine VIXUAL - Activation automatique des profils
 *
 * Principe : l'utilisateur AGIT, VIXUAL attribue le profil.
 * Plus jamais d'ecran "Choisissez votre profil" en V1.
 *
 * Les cles utilisees ici sont les cles officielles VIXUAL :
 *   - "guest"        : non connecte
 *   - "visitor"      : compte cree, par defaut
 *   - "creator"      : a publie au moins 1 projet (video)
 *   - "contributor"  : a soutenu au moins 1 projet (video)
 *
 * Les sous-roles V2+ (infoporteur, podcasteur, contribu_lecteur,
 * auditeur) sont activables via le parametre `mediaType`.
 *
 * Cette logique fonctionne cote client (state local du AuthProvider)
 * ET peut etre appelee depuis une route API serveur via les helpers
 * `applyRoleAction` / `roleNeedsForAction`.
 */

import type { VixualRole } from "@/components/navigation"

export type RoleAction =
  | "signup"
  | "support"
  | "create"

export type RoleMediaType = "video" | "text" | "podcast"

export interface RoleActionContext {
  /** Action effectuee par l'utilisateur. */
  action: RoleAction
  /** Type de media impacte (uniquement pour `support` et `create`). */
  mediaType?: RoleMediaType
}

/**
 * Liste deduplicee des roles a ajouter selon l'action.
 */
function rolesForAction(ctx: RoleActionContext): VixualRole[] {
  const { action, mediaType = "video" } = ctx

  if (action === "signup") return ["visitor"]

  if (action === "support") {
    if (mediaType === "text") return ["contributor", "contribu_lecteur"]
    if (mediaType === "podcast") return ["contributor", "auditeur"]
    return ["contributor"]
  }

  if (action === "create") {
    if (mediaType === "text") return ["creator", "infoporteur"]
    if (mediaType === "podcast") return ["creator", "podcasteur"]
    return ["creator"]
  }

  return []
}

/**
 * Applique une action a un set de roles existants et renvoie le
 * nouveau tableau de roles, sans duplication, en preservant l'ordre
 * d'apparition (utile pour le tri / l'affichage).
 */
export function applyRoleAction(
  currentRoles: readonly VixualRole[],
  ctx: RoleActionContext,
): VixualRole[] {
  const additions = rolesForAction(ctx)
  const set = new Set<VixualRole>(currentRoles)

  // Si l'utilisateur passe au-dela du simple "guest", on retire "guest".
  if (additions.length > 0) set.delete("guest")

  for (const r of additions) set.add(r)

  return Array.from(set)
}

/**
 * Renvoie true si l'action ferait apparaitre un nouveau role pour
 * l'utilisateur. Utile pour declencher les progressive hints UNIQUEMENT
 * quand un role est reellement gagne (pas a chaque support repete).
 */
export function actionGrantsNewRole(
  currentRoles: readonly VixualRole[],
  ctx: RoleActionContext,
): boolean {
  const additions = rolesForAction(ctx)
  const set = new Set<VixualRole>(currentRoles)
  return additions.some((r) => !set.has(r))
}

/**
 * Liste les roles "metier" (hors guest/visitor) actuellement actifs.
 * Sert a afficher les bons hints d'onboarding progressif.
 */
export function getEngagedRoles(roles: readonly VixualRole[]): VixualRole[] {
  return roles.filter(
    (r) =>
      r !== "guest" &&
      r !== "visitor",
  )
}
