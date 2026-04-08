/**
 * VIXUAL PROFILE RULES ENGINE
 * 
 * Regles des profils VIXUAL:
 * - Un utilisateur peut choisir n'importe quel profil au depart
 * - S'il ne choisit pas "visiteur", il ne pourra JAMAIS y revenir
 * - Multi-profils autorises pour les profils evolues
 * - Un seul role principal a la fois
 */

import type { VixualRole } from "@/components/navigation";

// ── Types ──

export interface ProfileTransition {
  from: VixualRole;
  to: VixualRole;
  allowed: boolean;
  reason?: string;
}

export interface UserProfileState {
  currentRoles: VixualRole[];
  primaryRole: VixualRole;
  hasEverBeenVisitor: boolean;
  hasLeftVisitor: boolean;
  canReturnToVisitor: boolean;
  availableTransitions: VixualRole[];
}

// ── Constants ──

/** Profils de base (choix initial) */
export const BASE_PROFILES: VixualRole[] = ["visitor", "porter", "contributor", "infoporter", "contribureader", "podcaster", "listener"];

/** Profils createurs */
export const CREATOR_PROFILES: VixualRole[] = ["porter", "infoporter", "podcaster"];

/** Profils contributeurs/investisseurs */
export const INVESTOR_PROFILES: VixualRole[] = ["contributor", "contribureader", "listener"];

/** Profils cumulables (peuvent etre combines) */
export const STACKABLE_PROFILES: VixualRole[] = ["porter", "contributor", "infoporter", "contribureader", "podcaster", "listener"];

/** Profil visiteur - special, non cumulable */
export const VISITOR_PROFILE: VixualRole = "visitor";

/** Profil invite - non connecte */
export const GUEST_PROFILE: VixualRole = "guest";

// ── Core Functions ──

/**
 * Verifie si un utilisateur peut changer vers un profil donne
 */
export function canTransitionTo(
  currentRoles: VixualRole[],
  targetRole: VixualRole,
  hasLeftVisitor: boolean
): ProfileTransition {
  // Cas special: retour vers visiteur
  if (targetRole === VISITOR_PROFILE) {
    if (hasLeftVisitor) {
      return {
        from: currentRoles[0] || GUEST_PROFILE,
        to: targetRole,
        allowed: false,
        reason: "Vous avez quitte le profil Visiteur. Vous ne pouvez plus y revenir.",
      };
    }
    // Si l'utilisateur n'a jamais quitte visiteur, il peut y rester ou y revenir
    return {
      from: currentRoles[0] || GUEST_PROFILE,
      to: targetRole,
      allowed: true,
    };
  }

  // Transition vers un profil evolue depuis visiteur
  if (currentRoles.includes(VISITOR_PROFILE) && targetRole !== VISITOR_PROFILE) {
    return {
      from: VISITOR_PROFILE,
      to: targetRole,
      allowed: true,
      reason: "Attention: en quittant le profil Visiteur, vous ne pourrez plus y revenir.",
    };
  }

  // Ajout d'un profil cumulable
  if (STACKABLE_PROFILES.includes(targetRole) && !currentRoles.includes(targetRole)) {
    return {
      from: currentRoles[0] || GUEST_PROFILE,
      to: targetRole,
      allowed: true,
    };
  }

  // Deja ce profil
  if (currentRoles.includes(targetRole)) {
    return {
      from: currentRoles[0] || GUEST_PROFILE,
      to: targetRole,
      allowed: false,
      reason: "Vous avez deja ce profil.",
    };
  }

  return {
    from: currentRoles[0] || GUEST_PROFILE,
    to: targetRole,
    allowed: true,
  };
}

/**
 * Calcule l'etat complet du profil d'un utilisateur
 */
export function computeProfileState(
  currentRoles: VixualRole[],
  roleHistory: VixualRole[]
): UserProfileState {
  const hasEverBeenVisitor = roleHistory.includes(VISITOR_PROFILE) || currentRoles.includes(VISITOR_PROFILE);
  const hasLeftVisitor = hasEverBeenVisitor && !currentRoles.includes(VISITOR_PROFILE);
  const canReturnToVisitor = !hasLeftVisitor;

  // Determiner le role principal (premier role non-guest)
  const primaryRole = currentRoles.find(r => r !== GUEST_PROFILE) || VISITOR_PROFILE;

  // Calculer les transitions disponibles
  const availableTransitions: VixualRole[] = [];
  
  for (const profile of BASE_PROFILES) {
    const transition = canTransitionTo(currentRoles, profile, hasLeftVisitor);
    if (transition.allowed && !currentRoles.includes(profile)) {
      availableTransitions.push(profile);
    }
  }

  return {
    currentRoles,
    primaryRole,
    hasEverBeenVisitor,
    hasLeftVisitor,
    canReturnToVisitor,
    availableTransitions,
  };
}

/**
 * Applique une transition de profil
 * Retourne les nouveaux roles apres transition
 */
export function applyProfileTransition(
  currentRoles: VixualRole[],
  targetRole: VixualRole,
  hasLeftVisitor: boolean
): { newRoles: VixualRole[]; newHasLeftVisitor: boolean; success: boolean; message: string } {
  const transition = canTransitionTo(currentRoles, targetRole, hasLeftVisitor);

  if (!transition.allowed) {
    return {
      newRoles: currentRoles,
      newHasLeftVisitor: hasLeftVisitor,
      success: false,
      message: transition.reason || "Transition non autorisee",
    };
  }

  let newRoles: VixualRole[] = [...currentRoles];
  let newHasLeftVisitor = hasLeftVisitor;

  // Si on quitte visiteur
  if (currentRoles.includes(VISITOR_PROFILE) && targetRole !== VISITOR_PROFILE) {
    newRoles = newRoles.filter(r => r !== VISITOR_PROFILE);
    newHasLeftVisitor = true;
  }

  // Ajouter le nouveau role s'il n'est pas deja present
  if (!newRoles.includes(targetRole)) {
    // Pour visiteur, remplacer tous les roles
    if (targetRole === VISITOR_PROFILE) {
      newRoles = [VISITOR_PROFILE];
    } else {
      newRoles.push(targetRole);
    }
  }

  // S'assurer qu'il y a au moins un role
  if (newRoles.length === 0) {
    newRoles = [VISITOR_PROFILE];
    newHasLeftVisitor = false;
  }

  return {
    newRoles,
    newHasLeftVisitor,
    success: true,
    message: targetRole === VISITOR_PROFILE 
      ? "Vous etes maintenant Visiteur"
      : `Profil ${getProfileLabel(targetRole)} ajoute avec succes`,
  };
}

/**
 * Verifie si un utilisateur peut cumuler plusieurs profils
 */
export function canStackProfiles(currentRoles: VixualRole[]): boolean {
  // Le visiteur ne peut pas cumuler
  if (currentRoles.includes(VISITOR_PROFILE)) {
    return false;
  }
  return true;
}

/**
 * Retourne le label d'affichage d'un profil
 */
export function getProfileLabel(role: VixualRole): string {
  const labels: Record<VixualRole, string> = {
    guest: "Invite",
    visitor: "Visiteur",
    porter: "Porteur",
    contributor: "Contributeur",
    infoporter: "Infoporteur",
    contribureader: "ContribuReader",
    podcaster: "Podcasteur",
    listener: "Auditeur",
  };
  return labels[role] || role;
}

/**
 * Retourne la description d'un profil
 */
export function getProfileDescription(role: VixualRole): string {
  const descriptions: Record<VixualRole, string> = {
    guest: "Non connecte - Acces limite",
    visitor: "Decouvrez VIXUAL gratuitement avec le Pass Decouverte",
    porter: "Creez et partagez vos films et videos",
    contributor: "Soutenez financierement les projets video",
    infoporter: "Publiez vos livres et articles",
    contribureader: "Soutenez financierement les ecrits",
    podcaster: "Diffusez vos podcasts",
    listener: "Soutenez financierement les podcasts",
  };
  return descriptions[role] || "";
}

/**
 * Obtient les profils recommandes pour un utilisateur
 */
export function getRecommendedProfiles(
  currentRoles: VixualRole[],
  hasLeftVisitor: boolean
): { role: VixualRole; reason: string }[] {
  const recommendations: { role: VixualRole; reason: string }[] = [];

  // Si visiteur, recommander de passer a un profil actif
  if (currentRoles.includes(VISITOR_PROFILE)) {
    recommendations.push({
      role: "contributor",
      reason: "Soutenez des projets et gagnez des gains",
    });
    recommendations.push({
      role: "porter",
      reason: "Partagez vos creations video",
    });
  }

  // Si createur, recommander profil contributeur associe
  if (currentRoles.includes("porter") && !currentRoles.includes("contributor")) {
    recommendations.push({
      role: "contributor",
      reason: "Completez votre profil en devenant aussi contributeur",
    });
  }

  if (currentRoles.includes("infoporter") && !currentRoles.includes("contribureader")) {
    recommendations.push({
      role: "contribureader",
      reason: "Completez votre profil en devenant aussi ContribuReader",
    });
  }

  if (currentRoles.includes("podcaster") && !currentRoles.includes("listener")) {
    recommendations.push({
      role: "listener",
      reason: "Completez votre profil en devenant aussi Auditeur",
    });
  }

  return recommendations;
}
