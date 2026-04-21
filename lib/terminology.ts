/**
 * VIXUAL - Terminologie standardisee
 * Source : PATCH-002 conformite juridique & UX
 *
 * Utiliser ces constantes pour garantir la coherence des termes
 * dans toute l'interface utilisateur.
 *
 * COMPTAGE OFFICIEL DES PROFILS VIXUAL:
 * - 8 profils au total
 * - 1 Invite (non inscrit)
 * - 7 inscrits: Visiteur, Porteur, Infoporteur, Podcasteur, Contributeur, Contribu-lecteur, Auditeur
 */

// ── Nombre de profils ──
export const PROFILE_COUNT = {
  total: 8,
  nonInscrit: 1, // Invite
  inscrits: 7,   // Visiteur, Porteur, Infoporteur, Podcasteur, Contributeur, Contribu-lecteur, Auditeur
} as const;

// ── Roles ──

/**
 * CLES OFFICIELLES ROLES VIXUAL - VERROU FINAL
 * 
 * Nomenclature officielle FR -> Cles internes:
 * - invite -> guest
 * - visiteur -> visitor
 * - createur -> creator (ex: porteur)
 * - contributeur -> contributor
 * - infoporteur -> infoporteur
 * - podcasteur -> podcasteur
 * - auditeur -> auditeur
 * - contribu-lecteur -> contribu_lecteur
 */
export const ROLE_LABELS = {
  guest: { singular: "Invite", plural: "Invites" },
  visitor: { singular: "Visiteur", plural: "Visiteurs" },
  creator: { singular: "Createur", plural: "Createurs" },
  infoporteur: { singular: "Infoporteur", plural: "Infoporteurs" },
  podcasteur: { singular: "Podcasteur", plural: "Podcasteurs" },
  contributor: { singular: "Contributeur", plural: "Contributeurs" },
  contribu_lecteur: { singular: "Contribu-lecteur", plural: "Contribu-lecteurs" },
  auditeur: { singular: "Auditeur", plural: "Auditeurs" },
} as const;

export type RoleKey = keyof typeof ROLE_LABELS;

// ── Categories (officially registered) ──

export const CONTENT_CATEGORIES = {
  video: {
    label: "Films & Vidéos",
    description: "Univers audiovisuel",
    internal: "video",
  },
  text: {
    label: "Livres & Articles",
    description: "Univers littéraire",
    internal: "text",
  },
  podcast: {
    label: "Podcasts",
    description: "Univers audio",
    internal: "podcast",
  },
} as const;

export type CategoryKey = keyof typeof CONTENT_CATEGORIES;

export function getCategoryLabel(category: string): string {
  const cat = CONTENT_CATEGORIES[category as CategoryKey];
  return cat?.label || category;
}

/**
 * Returns the human-readable label for a role.
 * @param role  Internal role key
 * @param plural  If true, returns the plural form
 */
export function getRoleLabel(role: string, plural = false): string {
  const entry = ROLE_LABELS[role as RoleKey];
  if (!entry) return role;
  return plural ? entry.plural : entry.singular;
}

// ── Actions ──

export const ACTION_LABELS = {
  contribute: "Contribuer",
  deposit: "Deposer",
  withdraw: "Retirer",
  connect: "Connecter",
  disconnect: "Deconnexion",
} as const;

// ── Currency formatting ──

/**
 * Formats a monetary amount with the correct French locale.
 * @param amount  Numeric value
 * @param currency  "eur" or "visupoints"
 */
export function formatAmount(amount: number, currency: "eur" | "vixupoints" = "eur"): string {
  if (currency === "eur") {
    return `${amount.toLocaleString("fr-FR")}\u00a0\u20ac`;
  }
  return `${amount.toLocaleString("fr-FR")}\u00a0pts`;
}

// ── Cautions ──

export const CAUTION_LABELS = {
  creator: "10\u00a0\u20ac",
  contributor: "20\u00a0\u20ac",
} as const;

// ── Caps ──

export const CAP_LABELS = {
  minor: "10\u00a0000 points (100\u00a0\u20ac)",
  visitor: "2\u00a0500 points",
  creator_monthly: "1\u00a0000 points/mois",
} as const;

// ── Creator quotas (descriptive, for UI) ──

export const CREATOR_QUOTA_DESCRIPTIONS = {
  clips: {
    title: "Clips courts",
    description: "D\u00e9posez jusqu'\u00e0 2 vid\u00e9os courtes par mois (5 min max)",
    examples: "Teasers, extraits, annonces",
    price: "2\u00a0\u20ac",
  },
  documentaires: {
    title: "Documentaires",
    description: "Publiez 1 documentaire par mois (30 min max)",
    examples: "Reportages, portraits, enqu\u00eates",
    price: "5\u00a0\u20ac",
  },
  films: {
    title: "Films & Longs formats",
    description: "Sortez 1 film par trimestre (dur\u00e9e illimit\u00e9e)",
    examples: "Longs-m\u00e9trages, s\u00e9ries, spectacles",
    price: "7\u00a0\u20ac",
  },
} as const;

export const TEXT_QUOTA_DESCRIPTIONS = {
  articles: {
    title: "Articles & Nouvelles",
    description: "Publiez jusqu'\u00e0 4 textes courts par mois",
    examples: "Chroniques, critiques, actualit\u00e9s",
    price: "2\u00a0\u20ac",
  },
  recits: {
    title: "R\u00e9cits & Essais",
    description: "1 texte long par mois (10\u00a0000 mots max)",
    examples: "Nouvelles, essais, biographies",
    price: "5\u00a0\u20ac",
  },
  livres: {
    title: "Livres complets",
    description: "1 ouvrage par trimestre (illimit\u00e9)",
    examples: "Romans, recueils, documentaires",
    price: "7\u00a0\u20ac",
  },
} as const;

export const PODCAST_QUOTA_DESCRIPTIONS = {
  episodes: {
    title: "\u00c9pisodes r\u00e9guliers",
    description: "Sortez jusqu'\u00e0 4 \u00e9pisodes par mois",
    examples: "Chroniques, interviews, d\u00e9bats",
    price: "2\u00a0\u20ac",
  },
  series: {
    title: "S\u00e9ries documentaires",
    description: "1 s\u00e9rie de 4-6 \u00e9pisodes par mois",
    examples: "Enqu\u00eates, reportages sonores",
    price: "5\u00a0\u20ac",
  },
  emissions: {
    title: "\u00c9missions & Shows",
    description: "1 format long par trimestre (illimit\u00e9)",
    examples: "Talk-shows, fictions audio, concerts",
    price: "7\u00a0\u20ac",
  },
} as const;

// ── Vote explanation (for UI/how-it-works) ──

export const VOTE_EXPLANATION_STEPS = [
  {
    icon: "Coins" as const,
    title: "1. Vous contribuez",
    description: "Chaque euro contribue vous donne des votes selon le bareme : 2 EUR = 1 vote, 5 EUR = 4 votes, 10 EUR = 7 votes, 20 EUR = 10 votes.",
  },
  {
    icon: "TrendingUp" as const,
    title: "2. Le projet grandit",
    description: "Plus le projet recoit de contributions, plus la cagnotte a partager grossit. Vos votes determinent votre part du gateau.",
  },
  {
    icon: "PieChart" as const,
    title: "3. La redistribution",
    description: "A la cloture, les gains sont repartis : 40% aux contributeurs TOP 10 (selon leurs votes), 30% aux createurs TOP 10, etc.",
  },
  {
    icon: "Wallet" as const,
    title: "4. Vous recevez",
    description: "Si vous etes dans le TOP 10, vous recevez votre part directement sur votre wallet Stripe Connect.",
  },
] as const;
