/**
 * VIXUAL Roles - Terminologie officielle des profils
 */

// Labels officiels des profils (affichage UI)
export const ROLE_LABELS: Record<string, string> = {
  guest: "Invite",
  visitor: "Visiteur",
  contributor: "Contributeur",
  contribu_reader: "Contribu-lecteur",
  listener: "Auditeur",
  porter: "Porteur",
  infoporter: "Infoporteur",
  podcaster: "Podcasteur",
}

// Descriptions des profils
export const ROLE_DESCRIPTIONS: Record<string, string> = {
  guest: "Acces limite, decouverte de la plateforme",
  visitor: "Acces aux contenus, utilisation des VIXUpoints",
  contributor: "Contribution en euros aux projets audiovisuels",
  contribu_reader: "Contribution aux livres et ecrits (euros/VIXUpoints/hybride)",
  listener: "Contribution aux podcasts (euros/VIXUpoints/hybride)",
  porter: "Createur de contenus audiovisuels",
  infoporter: "Auteur de contenus ecrits et articles",
  podcaster: "Createur de podcasts",
}

// Couleurs des badges par profil
export const ROLE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  guest: { bg: "bg-slate-500/20", text: "text-slate-300", border: "border-slate-500/30" },
  visitor: { bg: "bg-teal-500/20", text: "text-teal-300", border: "border-teal-500/30" },
  contributor: { bg: "bg-emerald-500/20", text: "text-emerald-300", border: "border-emerald-500/30" },
  contribu_reader: { bg: "bg-amber-500/20", text: "text-amber-300", border: "border-amber-500/30" },
  listener: { bg: "bg-purple-500/20", text: "text-purple-300", border: "border-purple-500/30" },
  porter: { bg: "bg-rose-500/20", text: "text-rose-300", border: "border-rose-500/30" },
  infoporter: { bg: "bg-sky-500/20", text: "text-sky-300", border: "border-sky-500/30" },
  podcaster: { bg: "bg-violet-500/20", text: "text-violet-300", border: "border-violet-500/30" },
}

// Regles de paiement par profil
export const ROLE_PAYMENT_RULES: Record<string, { vixupoints: boolean; euros: boolean; hybrid: boolean }> = {
  visitor_minor: { vixupoints: true, euros: false, hybrid: false },
  visitor: { vixupoints: true, euros: true, hybrid: true },
  contributor: { vixupoints: false, euros: true, hybrid: false },
  contribu_reader: { vixupoints: true, euros: true, hybrid: true },
  listener: { vixupoints: true, euros: true, hybrid: true },
  porter: { vixupoints: false, euros: false, hybrid: false },
  infoporter: { vixupoints: false, euros: false, hybrid: false },
  podcaster: { vixupoints: false, euros: false, hybrid: false },
}

// Fonction utilitaire pour obtenir le label d'un role
export function getRoleLabel(roleKey: string): string {
  return ROLE_LABELS[roleKey] || roleKey
}

// Fonction utilitaire pour verifier si un profil peut utiliser le paiement hybride
export function canUseHybridPayment(roleKey: string, isMinor: boolean = false): boolean {
  if (isMinor && roleKey === "visitor") {
    return ROLE_PAYMENT_RULES.visitor_minor.hybrid
  }
  return ROLE_PAYMENT_RULES[roleKey]?.hybrid ?? false
}

// Fonction utilitaire pour verifier si un profil peut payer en euros
export function canPayInEuros(roleKey: string, isMinor: boolean = false): boolean {
  if (isMinor && roleKey === "visitor") {
    return ROLE_PAYMENT_RULES.visitor_minor.euros
  }
  return ROLE_PAYMENT_RULES[roleKey]?.euros ?? false
}
