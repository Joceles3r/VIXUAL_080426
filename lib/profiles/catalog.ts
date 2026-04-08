/**
 * VIXUAL - Catalogue Officiel des Profils
 * 
 * Source de verite unique pour tous les profils utilisateur.
 * Cles internes stables + labels traduits FR/EN.
 * 
 * REGLE: Utiliser les PROFILE_KEYS partout dans le code,
 * les LABELS uniquement pour l'affichage UI.
 */

// ─── Cles Internes Stables ───

export const PROFILE_KEYS = {
  guest: "guest",
  visitor: "visitor",
  creator: "creator",           // porteur
  contributor: "contributor",
  infoporteur: "infoporteur",
  podcasteur: "podcasteur",
  auditeur: "auditeur",
  contribu_lecteur: "contribu_lecteur",
} as const;

export type ProfileKey = typeof PROFILE_KEYS[keyof typeof PROFILE_KEYS];

// ─── Labels Francais (Affichage UI) ───

export const PROFILE_LABELS_FR: Record<ProfileKey, string> = {
  guest: "Invité",
  visitor: "Visiteur",
  creator: "Porteur",
  contributor: "Contributeur",
  infoporteur: "Infoporteur",
  podcasteur: "Podcasteur",
  auditeur: "Auditeur",
  contribu_lecteur: "Contribu-lecteur",
};

// ─── Labels Anglais (Internationalisation) ───

export const PROFILE_LABELS_EN: Record<ProfileKey, string> = {
  guest: "Guest",
  visitor: "Visitor",
  creator: "Creator",
  contributor: "Contributor",
  infoporteur: "News Creator",
  podcasteur: "Podcaster",
  auditeur: "Listener",
  contribu_lecteur: "Reader-Contributor",
};

// ─── Descriptions Francais ───

export const PROFILE_DESCRIPTIONS_FR: Record<ProfileKey, string> = {
  guest: "Accès limité, découverte de la plateforme",
  visitor: "Découvrir, accumuler, débloquer, progresser",
  creator: "Créateur de contenus audiovisuels",
  contributor: "Contribution en euros aux projets",
  infoporteur: "Auteur de contenus écrits et articles",
  podcasteur: "Créateur de podcasts",
  auditeur: "Contribution aux podcasts",
  contribu_lecteur: "Contribution aux livres et écrits",
};

// ─── Descriptions Anglais ───

export const PROFILE_DESCRIPTIONS_EN: Record<ProfileKey, string> = {
  guest: "Limited access, platform discovery",
  visitor: "Discover, accumulate, unlock, progress",
  creator: "Audiovisual content creator",
  contributor: "EUR contribution to projects",
  infoporteur: "Written content and articles author",
  podcasteur: "Podcast creator",
  auditeur: "Podcast contribution",
  contribu_lecteur: "Books and written content contribution",
};

// ─── Couleurs des Badges par Profil ───

export const PROFILE_COLORS: Record<ProfileKey, { bg: string; text: string; border: string }> = {
  guest: { bg: "bg-slate-500/20", text: "text-slate-300", border: "border-slate-500/30" },
  visitor: { bg: "bg-teal-500/20", text: "text-teal-300", border: "border-teal-500/30" },
  creator: { bg: "bg-rose-500/20", text: "text-rose-300", border: "border-rose-500/30" },
  contributor: { bg: "bg-emerald-500/20", text: "text-emerald-300", border: "border-emerald-500/30" },
  infoporteur: { bg: "bg-sky-500/20", text: "text-sky-300", border: "border-sky-500/30" },
  podcasteur: { bg: "bg-violet-500/20", text: "text-violet-300", border: "border-violet-500/30" },
  auditeur: { bg: "bg-purple-500/20", text: "text-purple-300", border: "border-purple-500/30" },
  contribu_lecteur: { bg: "bg-amber-500/20", text: "text-amber-300", border: "border-amber-500/30" },
};

// ─── Regles de Paiement par Profil ───

export interface PaymentRules {
  vixupoints: boolean;
  euros: boolean;
  hybrid: boolean;
  canWithdraw: boolean;
  canUseStripeConnect: boolean;
}

export const PROFILE_PAYMENT_RULES: Record<ProfileKey, PaymentRules> = {
  guest: { vixupoints: false, euros: false, hybrid: false, canWithdraw: false, canUseStripeConnect: false },
  visitor: { vixupoints: true, euros: true, hybrid: true, canWithdraw: false, canUseStripeConnect: false },
  creator: { vixupoints: false, euros: false, hybrid: false, canWithdraw: true, canUseStripeConnect: true },
  contributor: { vixupoints: false, euros: true, hybrid: false, canWithdraw: false, canUseStripeConnect: false },
  infoporteur: { vixupoints: false, euros: false, hybrid: false, canWithdraw: true, canUseStripeConnect: true },
  podcasteur: { vixupoints: false, euros: false, hybrid: false, canWithdraw: true, canUseStripeConnect: true },
  auditeur: { vixupoints: true, euros: true, hybrid: true, canWithdraw: false, canUseStripeConnect: false },
  contribu_lecteur: { vixupoints: true, euros: true, hybrid: true, canWithdraw: false, canUseStripeConnect: false },
};

// ─── Regles Speciales Mineurs (16-17 ans) ───

export const MINOR_PAYMENT_RULES: PaymentRules = {
  vixupoints: true,
  euros: false,
  hybrid: false,
  canWithdraw: false,
  canUseStripeConnect: false,
};

export const MINOR_LIMITS = {
  dailyVixupoints: 100,
  weeklyVixupoints: 500,
  totalVixupoints: 10000,
  parentalConsentValidityMonths: 12,
};

// ─── Version Activation par Profil ───

export type VersionKey = "V1" | "V2" | "V3";

export const PROFILE_VERSION_AVAILABILITY: Record<ProfileKey, VersionKey> = {
  guest: "V1",
  visitor: "V1",
  creator: "V1",
  contributor: "V1",
  infoporteur: "V2",
  podcasteur: "V2",
  auditeur: "V2",
  contribu_lecteur: "V2",
};

// ─── Fonctions Utilitaires ───

/**
 * Obtenir le label d'un profil dans la langue specifiee
 */
export function getProfileLabel(key: ProfileKey, lang: "fr" | "en" = "fr"): string {
  if (lang === "en") {
    return PROFILE_LABELS_EN[key] || key;
  }
  return PROFILE_LABELS_FR[key] || key;
}

/**
 * Obtenir la description d'un profil dans la langue specifiee
 */
export function getProfileDescription(key: ProfileKey, lang: "fr" | "en" = "fr"): string {
  if (lang === "en") {
    return PROFILE_DESCRIPTIONS_EN[key] || "";
  }
  return PROFILE_DESCRIPTIONS_FR[key] || "";
}

/**
 * Verifier si un profil peut utiliser le paiement hybride
 */
export function canUseHybridPayment(key: ProfileKey, isMinor: boolean = false): boolean {
  if (isMinor) return MINOR_PAYMENT_RULES.hybrid;
  return PROFILE_PAYMENT_RULES[key]?.hybrid ?? false;
}

/**
 * Verifier si un profil peut payer en euros
 */
export function canPayInEuros(key: ProfileKey, isMinor: boolean = false): boolean {
  if (isMinor) return MINOR_PAYMENT_RULES.euros;
  return PROFILE_PAYMENT_RULES[key]?.euros ?? false;
}

/**
 * Verifier si un profil peut utiliser les VIXUpoints
 */
export function canUseVixupoints(key: ProfileKey, isMinor: boolean = false): boolean {
  if (isMinor) return MINOR_PAYMENT_RULES.vixupoints;
  return PROFILE_PAYMENT_RULES[key]?.vixupoints ?? false;
}

/**
 * Verifier si un profil peut retirer ses gains
 */
export function canWithdraw(key: ProfileKey, isMinor: boolean = false): boolean {
  if (isMinor) return MINOR_PAYMENT_RULES.canWithdraw;
  return PROFILE_PAYMENT_RULES[key]?.canWithdraw ?? false;
}

/**
 * Verifier si un profil est disponible dans une version donnee
 */
export function isProfileAvailableInVersion(key: ProfileKey, version: VersionKey): boolean {
  const profileVersion = PROFILE_VERSION_AVAILABILITY[key];
  const versionOrder: VersionKey[] = ["V1", "V2", "V3"];
  return versionOrder.indexOf(version) >= versionOrder.indexOf(profileVersion);
}

/**
 * Obtenir tous les profils disponibles dans une version donnee
 */
export function getProfilesForVersion(version: VersionKey): ProfileKey[] {
  return Object.entries(PROFILE_VERSION_AVAILABILITY)
    .filter(([, v]) => isProfileAvailableInVersion(v as ProfileKey, version))
    .map(([k]) => k as ProfileKey);
}

/**
 * Valider qu'une cle est un profil valide
 */
export function isValidProfileKey(key: string): key is ProfileKey {
  return Object.values(PROFILE_KEYS).includes(key as ProfileKey);
}
