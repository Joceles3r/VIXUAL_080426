/**
 * VIXUAL - Constantes consolidees V1 (17/02/2026)
 * Source : Vixual_Formules_Consolidees_V1_170226
 *
 * Ce fichier centralise TOUS les parametres configurables du moteur Vixual.
 * Pret pour integration Stripe Connect.
 */

// ──────────────────────────────────────────────
// 1. TRANCHES DE CONTRIBUTION
// ──────────────────────────────────────────────

/** Montants de contribution autorises (en euros) */
export const CONTRIBUTION_TIERS_EUR = [2, 3, 4, 5, 6, 8, 10, 12, 15, 20] as const;
export type ContributionTierEur = (typeof CONTRIBUTION_TIERS_EUR)[number];

/** Prix porteur autorises (en euros) - max 10 EUR */
export const PORTER_PRICE_TIERS_EUR = [2, 3, 4, 5, 10] as const;
export type PorterPriceTierEur = (typeof PORTER_PRICE_TIERS_EUR)[number];

/** Prix d'extension (en euros) */
export const EXTENSION_PRICE_EUR = 25;

// ──────────────────────────────────────────────
// 2. CAUTIONS
// ──────────────────────────────────────────────

export const CAUTION = {
  /** Porteur (audiovisuel), Infoporteur (litteraire), Podcasteur */
  creator: 10_00, // 10 EUR en centimes
  /** Contributeur (audiovisuel), Contribu-lecteur (litteraire), Auditeur (podcast) */
  contributor: 20_00, // 20 EUR en centimes
} as const;

/** Cautions en euros pour affichage */
export const CAUTION_EUR = {
  creator: CAUTION.creator / 100,
  contributor: CAUTION.contributor / 100,
} as const;

// ──────────────────────────────────────────────
// 3. BAREME VOTES (contribution -> votes) - NOUVELLE GRILLE OFFICIELLE 2026
// ──────────────────────────────────────────────

/** 
 * Table contribution EUR -> nombre de votes (Grille officielle 2026)
 * Principe: plus la contribution est elevee, plus le nombre de votes augmente
 * Les votes servent uniquement au classement, PAS aux gains financiers
 */
export const CONTRIBUTION_TO_VOTES: ReadonlyMap<number, number> = new Map([
  [2, 1],
  [3, 2],
  [4, 3],
  [5, 4],
  [6, 5],
  [8, 7],
  [10, 8],
  [12, 10],
  [15, 13],
  [20, 15],
]);

/** 
 * Obtenir le nombre de votes pour un montant de contribution
 * @param amountEur Montant en euros
 * @returns Nombre de votes attribues
 */
export function getVotesForContribution(amountEur: number): number {
  return CONTRIBUTION_TO_VOTES.get(amountEur) ?? 0;
}

/**
 * Conversion euros vers votes (fonction alternative basee sur seuils)
 * Conforme a la grille officielle VIXUAL 2026
 */
export function euroToVotes(amount: number): number {
  const table = [
    { amount: 2, votes: 1 },
    { amount: 3, votes: 2 },
    { amount: 4, votes: 3 },
    { amount: 5, votes: 4 },
    { amount: 6, votes: 5 },
    { amount: 8, votes: 7 },
    { amount: 10, votes: 8 },
    { amount: 12, votes: 10 },
    { amount: 15, votes: 13 },
    { amount: 20, votes: 15 },
  ];
  const match = table.find(t => amount <= t.amount);
  return match ? match.votes : 15;
}

// ──────────────────────────────────────────────
// 3bis. REPARTITION DES GAINS - REGLES OFFICIELLES
// ──────────────────────────────────────────────

/**
 * Repartition globale des revenus VIXUAL (en pourcentage)
 * Total = 100%
 */
export const REVENUE_DISTRIBUTION = {
  creators: 40,           // Createurs de projets
  contributors: 30,       // Contributeurs gagnants
  community: 23,          // Communaute / redistribution
  platform: 7,            // Plateforme VIXUAL
} as const;

/**
 * Calcule le gain d'un utilisateur sur un projet gagnant
 * Formule: (contribution utilisateur / total contributions gagnantes) x enveloppe gains
 * 
 * @param userContribution Contribution de l'utilisateur en euros
 * @param totalWinningContributions Total des contributions sur les projets gagnants
 * @param prizePool Enveloppe de gains attribuee aux contributeurs
 * @returns Gain de l'utilisateur en euros
 */
export function calculateUserGain(
  userContribution: number,
  totalWinningContributions: number,
  prizePool: number
): number {
  if (totalWinningContributions <= 0) return 0;
  return (userContribution / totalWinningContributions) * prizePool;
}

// ──────────────────────────────────────────────
// 4. VIXUPOINTS - BAREME FIDELITE
// ──────────────────────────────────────────────

/** Table contribution EUR -> VIXUpoints gagnes */
export const CONTRIBUTION_TO_VIXUPOINTS: ReadonlyMap<number, number> = new Map([
  [2, 10],
  [3, 15],
  [4, 20],
  [5, 25],
  [6, 30],
  [8, 40],
  [10, 50],
  [12, 60],
  [15, 80],
  [20, 110],
]);

/** Obtenir les VIXUpoints pour un montant de contribution */
export function getVixupointsForContribution(amountEur: number): number {
  return CONTRIBUTION_TO_VIXUPOINTS.get(amountEur) ?? 0;
}

// ──────────────────────────────────────────────
// 5. VIXUPOINTS - CONVERSION EN EUROS
// ──────────────────────────────────────────────

/** Seuil minimum pour conversion : 2500 VIXUpoints */
export const VIXUPOINTS_CONVERSION_THRESHOLD = 2500;

/** Taux : 100 VIXUpoints = 1 EUR */
export const VIXUPOINTS_PER_EUR = 100;

/** Retrait minimum en euros (correspondant au seuil) */
export const VIXUPOINTS_MIN_WITHDRAW_EUR = VIXUPOINTS_CONVERSION_THRESHOLD / VIXUPOINTS_PER_EUR; // 25 EUR

// ─── Backward Compatibility Aliases (contribution/investment seulement) ───
// VERROU FINAL: VISUPOINTS_* legacy aliases SUPPRIMES, utilisez VIXUPOINTS_*
export const INVESTMENT_TIERS_EUR = CONTRIBUTION_TIERS_EUR;
export type InvestmentTierEur = ContributionTierEur;
export const INVESTMENT_TO_VOTES = CONTRIBUTION_TO_VOTES;
export const getVotesForInvestment = getVotesForContribution;
export const INVESTMENT_TO_VIXUPOINTS = CONTRIBUTION_TO_VIXUPOINTS;
export const getVixupointsForInvestment = getVixupointsForContribution;

/**
 * Convertit des VIXUpoints en euros.
 * @returns { eurosConverted, pointsRemaining, eligibleForConversion }
 */
export function convertVixupoints(points: number): {
  eurosConverted: number;
  pointsRemaining: number;
  eligibleForConversion: boolean;
} {
  if (points < VIXUPOINTS_CONVERSION_THRESHOLD) {
    return {
      eurosConverted: 0,
      pointsRemaining: points,
      eligibleForConversion: false,
    };
  }

  const eurosConverted = Math.floor(points / VIXUPOINTS_PER_EUR);
  const pointsRemaining = points - VIXUPOINTS_PER_EUR * eurosConverted;

  return {
    eurosConverted,
    pointsRemaining,
    eligibleForConversion: true,
  };
}

// VERROU FINAL: convertVisupoints alias SUPPRIME, utilisez convertVixupoints

// ────────────────────────────��─────────────────
// 6. REPARTITION DES GAINS PAR CATEGORIE
// ──────────────────────────────────────────────
// Source doc: "Vixual - Formules Mathematiques et Repartitions Completes Optimisees"
// Hors VSLS et Petites Annonces (non implementes dans Vixual V1)

// ─── 6A. FILMS / VIDEOS / DOCUMENTAIRES ───
// Cloture configurable (admin) — 40/30/7/23
/** Investisseurs TOP 10 : 40% */
export const FILMS_INVESTOR_TOP10_PERCENT = 40;
export const FILMS_INVESTOR_TOP10_BPS = 4000;
/** Porteurs TOP 10 : 30% */
export const FILMS_CREATOR_TOP10_PERCENT = 30;
export const FILMS_CREATOR_TOP10_BPS = 3000;
/** Investisseurs rangs 11-100 : 7% */
export const FILMS_INVESTOR_11_100_PERCENT = 7;
export const FILMS_INVESTOR_11_100_BPS = 700;
/** Vixual (plateforme) : 23% */
export const FILMS_Vixual_PERCENT = 23;
export const FILMS_Vixual_BPS = 2300;

/** BPS par rang dans le TOP 10 investisseurs (pro-rata votes) */
export const FILMS_INVESTOR_TOP10_RANK_BPS: readonly number[] = [
  1366, 683, 455, 341, 273, 228, 195, 171, 152, 137,
];
/** BPS par rang dans le TOP 10 porteurs (pro-rata score) */
export const FILMS_CREATOR_TOP10_RANK_BPS: readonly number[] = [
  1024, 512, 341, 256, 205, 171, 146, 128, 114, 102,
];

// ─── 6B. VOIX DE L'INFO ───
// Vente unitaire 70/30 + Pot quotidien 60/40
// CRON quotidien a 00:15 UTC+1
export const VOIXINFO_SALE_AUTHOR_PERCENT = 70;
export const VOIXINFO_SALE_Vixual_PERCENT = 30;
export const VOIXINFO_POT_AUTHORS_TOP10_PERCENT = 60;
export const VOIXINFO_POT_READERS_PERCENT = 40;
/** Poids degressif par rang TOP 10 (rang 1 = 10 pts, rang 10 = 1 pt) */
export const VOIXINFO_RANK_WEIGHT = [10, 9, 8, 7, 6, 5, 4, 3, 2, 1] as const;

// ─── 6C. LIVRES ───
// Vente unitaire 70/30 + Pot mensuel 60/40
export const LIVRES_SALE_AUTHOR_PERCENT = 70;
export const LIVRES_SALE_Vixual_PERCENT = 30;
export const LIVRES_POT_AUTHORS_TOP10_PERCENT = 60;
export const LIVRES_POT_INVESTIREADERS_PERCENT = 40;
/** Poids degressif identique a Voix de l'Info */
export const LIVRES_RANK_WEIGHT = [10, 9, 8, 7, 6, 5, 4, 3, 2, 1] as const;
/** Ticket de repechage (optionnel) : 25 EUR */
export const LIVRES_REPECHAGE_EUR = 25;
/** Capacite mensuelle cible : 100 auteurs/mois */
export const LIVRES_TARGET_AUTHORS_MONTH = 100;

// ─── 6D. PODCASTS ───
// Vente episode 70/30 + Pot mensuel 40/30/20/10
export const PODCASTS_SALE_CREATOR_PERCENT = 70;
export const PODCASTS_SALE_Vixual_PERCENT = 30;
export const PODCASTS_POT_CREATORS_PERCENT = 40;
export const PODCASTS_POT_INVESTORS_PERCENT = 30;
export const PODCASTS_POT_Vixual_PERCENT = 20;
export const PODCASTS_POT_BONUS_PERCENT = 10;

// VERROU FINAL: cles VIXUAL officielles
export const FILMS_VIXUAL_BPS = FILMS_Vixual_BPS;
export const PODCASTS_POT_VIXUAL_PERCENT = PODCASTS_POT_Vixual_PERCENT;

/**
 * Detail du bonus 10% Podcasts (source: README payout-engine V2)
 *   6% : primes performance TOP 10 podcasters
 *   2% : reserve technique (arrondis) — comptabilisee cote plateforme
 *   2% : reserve evenementielle — comptabilisee cote plateforme
 */
export const PODCASTS_BONUS_BREAKDOWN = {
  performancePrimesPercent: 6,
  technicalReservePercent: 2,
  eventReservePercent: 2,
} as const;

/** CAP anti-capture: un investisseur ne peut representer plus de 20% des votes globaux mensuels */
export const PODCASTS_ANTI_CAPTURE_MAX_VOTE_SHARE = 0.20;
/**
 * Score audio pour ponderation investisseurs podcasts :
 * listen_score = 0.7 * completion + 0.3 * unique_listeners_norm
 */
export const PODCASTS_LISTEN_SCORE_WEIGHTS = {
  completion: 0.7,
  uniqueListenersNorm: 0.3,
} as const;

// ─── 6E. LEGACY ALIASES (backward compat) ───
// Pour le code existant qui reference les anciens noms

/** @deprecated Use FILMS_Vixual_BPS instead */
export const Vixual_FEE_PERCENT = FILMS_Vixual_PERCENT;
export const Vixual_FEE_BPS = FILMS_Vixual_BPS;

/** @deprecated Use FILMS_INVESTOR_TOP10_PERCENT instead */
export const INVESTOR_TOP10_PERCENT = FILMS_INVESTOR_TOP10_PERCENT;
export const INVESTOR_TOP10_BPS = FILMS_INVESTOR_TOP10_RANK_BPS;

/** @deprecated Use FILMS_CREATOR_TOP10_PERCENT instead */
export const CREATOR_TOP10_PERCENT = FILMS_CREATOR_TOP10_PERCENT;
export const CREATOR_TOP10_BPS = FILMS_CREATOR_TOP10_RANK_BPS;

/** @deprecated Use FILMS_INVESTOR_11_100_BPS instead */
export const INVESTOR_11_100_PERCENT = FILMS_INVESTOR_11_100_PERCENT;
export const INVESTOR_11_100_BPS = FILMS_INVESTOR_11_100_BPS;

/** Porteurs rangs 11-100 : 0% en V1 */
export const CREATOR_11_100_PERCENT = 0;

// ─── 6F. CATEGORY SPLITS (pour affichage + settlement) ───

export type VixualCategory = "films" | "voix_info" | "livres" | "podcasts";

export const CATEGORY_SPLITS: Record<VixualCategory, {
  label: string;
  frequency: string;
  splits: { label: string; percent: number; color: string }[];
}> = {
  films: {
    label: "Films / Videos / Documentaires",
    frequency: "Configurable (admin)",
    splits: [
      { label: "Contributeurs TOP 10", percent: FILMS_INVESTOR_TOP10_PERCENT, color: "emerald" },
      { label: "Createurs TOP 10", percent: FILMS_CREATOR_TOP10_PERCENT, color: "teal" },
      { label: "Contributeurs rangs 11-100", percent: FILMS_INVESTOR_11_100_PERCENT, color: "sky" },
      { label: "Vixual (plateforme)", percent: FILMS_Vixual_PERCENT, color: "slate" },
    ],
  },
  voix_info: {
    label: "Voix de l'Info (articles)",
    frequency: "Mensuel (1er du mois)",
    splits: [
      { label: "Auteurs TOP 10", percent: VOIXINFO_POT_AUTHORS_TOP10_PERCENT, color: "amber" },
      { label: "Lecteurs gagnants", percent: VOIXINFO_POT_READERS_PERCENT, color: "sky" },
    ],
  },
  livres: {
    label: "Livres",
    frequency: "Mensuel (1er du mois)",
    splits: [
      { label: "Auteurs TOP 10", percent: LIVRES_POT_AUTHORS_TOP10_PERCENT, color: "amber" },
      { label: "Contribu-lecteurs gagnants", percent: LIVRES_POT_INVESTIREADERS_PERCENT, color: "sky" },
    ],
  },
  podcasts: {
    label: "Podcasts",
    frequency: "Mensuel (1er du mois)",
    splits: [
      { label: "Podcasteurs TOP 10 (base)", percent: PODCASTS_POT_CREATORS_PERCENT, color: "purple" },
      { label: "Auditeurs TOP 10 (investisseurs)", percent: PODCASTS_POT_INVESTORS_PERCENT, color: "emerald" },
      { label: "Vixual (plateforme)", percent: PODCASTS_POT_Vixual_PERCENT, color: "slate" },
      { label: "Bonus : primes perf. TOP 10", percent: PODCASTS_BONUS_BREAKDOWN.performancePrimesPercent, color: "amber" },
      { label: "Bonus : reserve technique", percent: PODCASTS_BONUS_BREAKDOWN.technicalReservePercent, color: "zinc" },
      { label: "Bonus : reserve evenementielle", percent: PODCASTS_BONUS_BREAKDOWN.eventReservePercent, color: "zinc" },
    ],
  },
};

/** Table de repartition Films (affichage principal, backward compat) */
export const DISTRIBUTION_TABLE = CATEGORY_SPLITS.films.splits;

/** Detail TOP 10 investisseurs pour affichage */
export const INVESTOR_TOP10_DETAIL = FILMS_INVESTOR_TOP10_RANK_BPS.map((bps, i) => ({
  rank: i + 1,
  percentOfG: bps / 100,
  label: `Rang ${i + 1}`,
}));

/** Detail TOP 10 porteurs pour affichage */
export const CREATOR_TOP10_DETAIL = FILMS_CREATOR_TOP10_RANK_BPS.map((bps, i) => ({
  rank: i + 1,
  percentOfG: bps / 100,
  label: `Rang ${i + 1}`,
}));

// ──────────────────────────────────────────────
// 6G. QUOTAS CREATEURS (mise en ligne Bunny.net)
// ──────────────────────────────────────────────

export const CREATOR_QUOTAS = {
  clips: { maxDuration: 5 * 60, perMonth: 2, priceEur: 2, label: "Clips (< 5 min)" },
  documentaires: { maxDuration: 30 * 60, perMonth: 1, priceEur: 5, label: "Documentaires (5-30 min)" },
  films: { maxDuration: Infinity, perQuarter: 1, priceEur: 7, label: "Films (> 30 min)" },
} as const;

// ────────────�����─────────────────────────────����──
// 7. VENTE D'ARTICLE (Infoporteur) - 70/30
// ──────────────────────────────────────────────

/** Part de l'auteur sur la vente d'un article */
export const ARTICLE_SALE_AUTHOR_PERCENT = 70;

/** Part de VIXUAL sur la vente d'un article */
export const ARTICLE_SALE_VIXUAL_PERCENT = 30;

/**
 * Calcule la repartition pour une vente d'article.
 * @param priceEurCents Prix en centimes
 */
export function computeArticleSale(priceEurCents: number): {
  authorCents: number;
  vixualCents: number;
} {
  const authorCents = Math.floor((priceEurCents * ARTICLE_SALE_AUTHOR_PERCENT) / 100);
  const vixualCents = priceEurCents - authorCents;
  return { authorCents, vixualCents };
}

// ──────────────────────────────────────────────
// 8. CLASSEMENT / COEFFICIENT D'ENGAGEMENT
// ──────────────────────────────────────────────

/**
 * Coefficient d'engagement pour departager les TOP 10 :
 * coeff(p) = round(montantTotal(p) / max(1, nbInvestisseurs(p)), 2)
 */
export function computeEngagementCoefficient(
  totalAmountEur: number,
  investorCount: number,
): number {
  return Math.round((totalAmountEur / Math.max(1, investorCount)) * 100) / 100;
}

// ──────────────────────────────────────────────
// 9. STRIPE CONNECT - CONFIGURATION FUTURE
// ──────────────────────────────────────────────

export const STRIPE_CONFIG = {
  /** Devise */
  currency: "eur" as const,
  /** Retrait minimum en centimes */
  minWithdrawCents: 25_00, // 25 EUR
  /** Delai de traitement des retraits (en jours) */
  withdrawProcessingDays: 7,
  /** Type de compte Stripe Connect */
  accountType: "express" as const,
} as const;

// ──────────────────────────────────────────────
// 10. MINEURS - CONFIGURATION
// ──────────────────────────────────────────────

/** Age minimum inscription Vixual */
export const MINOR_MIN_AGE = 16;
/** Age de majorite (deblocage retrait/invest/conversion) */
export const MAJORITY_AGE = 18;
/** Plafond VIXUpoints pour les mineurs (16-17 ans) */
export const MINOR_VIXUPOINTS_CAP = 10_000;
/** Equivalent en euros du plafond mineur */
export const MINOR_VIXUPOINTS_CAP_EUR = MINOR_VIXUPOINTS_CAP / VIXUPOINTS_PER_EUR; // 100 EUR
/** Seuil conversion majeur : 2500 VIXUpoints */
export const ADULT_VIXUPOINTS_CONVERSION_THRESHOLD = VIXUPOINTS_CONVERSION_THRESHOLD;

// VERROU FINAL: aliases VISUPOINTS_* SUPPRIMES, utilisez VIXUPOINTS_*

// ──────────────────────────────────────────────
// 11. VIXUPOINTS - PLAFONDS PAR PROFIL
// ──────────────────────────────────────────────

// VERROU FINAL: Cles officielles uniquement
export type VixupointsProfileKey =
  | "guest"
  | "visitor"
  | "visitor_minor"
  | "creator"
  | "contributor"
  | "infoporteur"
  | "podcasteur"
  | "auditeur"
  | "contribu_lecteur";

// VERROU FINAL: Cles officielles uniquement, plus d'anciens alias
export const VIXUPOINTS_PROFILE_CAPS: Record<VixupointsProfileKey, {
  label: string;
  cap: number | null; // null = ne gagne pas
  capType: "total" | "monthly" | "none";
  convertible: boolean;
  objective: string;
}> = {
  guest:            { label: "Invite",                   cap: null,   capType: "none",    convertible: false, objective: "Acquisition" },
  visitor:          { label: "Visiteur majeur",          cap: 2_500,  capType: "total",   convertible: true,  objective: "Inciter a contribuer" },
  visitor_minor:    { label: "Visiteur mineur (16-17)",  cap: 10_000, capType: "total",   convertible: false, objective: "Fidelisation long terme" },
  creator:          { label: "Createur",                 cap: 1_000,  capType: "monthly", convertible: false, objective: "Boost visibilite" },
  contributor:      { label: "Contributeur",             cap: null,   capType: "none",    convertible: false, objective: "Remunere via gains" },
  infoporteur:      { label: "Infoporteur",              cap: 1_000,  capType: "monthly", convertible: false, objective: "Boost article" },
  podcasteur:       { label: "Podcasteur",               cap: 1_000,  capType: "monthly", convertible: false, objective: "Mise en avant" },
  auditeur:         { label: "Auditeur",                 cap: 2_500,  capType: "total",   convertible: true,  objective: "Encourager ecoute" },
  contribu_lecteur: { label: "Contribu-lecteur",         cap: 2_500,  capType: "total",   convertible: true,  objective: "Lecture active" },
};

/** Maximum journalier recommande */
export const VIXUPOINTS_MAX_DAILY = 60;
// VERROU FINAL: VISUPOINTS_MAX_DAILY alias SUPPRIME

// ──────────────────────────────────────────────
// 12. ENGAGEMENT REDIRECT ENGINE
// ──────────────────────────────────────────────

/** Seuils d'engagement pour visiteurs */
export const ENGAGEMENT_THRESHOLDS = {
  /** Suggestion douce */
  info: 2_000,
  /** Avertissement */
  warning: 2_300,
  /** Critique : proposition d'action */
  critical: 2_450,
} as const;

export type EngagementLevel = "none" | "info" | "warning" | "critical";

// ──────────────────────────────────────────────
// 13. PAIEMENT HYBRIDE (CHEMIN A)
// ──────────────────────────────────────────────

/** Part minimum en euros (cash) */
export const HYBRID_PAYMENT_MIN_CASH_RATIO = 0.30;
/** Part maximum en VIXUpoints */
export const HYBRID_PAYMENT_MAX_POINTS_RATIO = 0.70;
/** Bonus d'utilisation des VIXUpoints */
export const HYBRID_BONUS_RATIO = 0.05;
/** Plafond mensuel du bonus en points */
export const HYBRID_BONUS_MONTHLY_CAP = 200;

/**
 * Calcule la repartition d'un paiement hybride.
 * @param priceCents Prix total en centimes
 * @param pointsBalance VIXUpoints disponibles
 * @returns Repartition cash/points et bonus
 */
export function computeHybridPayment(priceCents: number, pointsBalance: number): {
  cashMinCents: number;
  pointsMaxUsable: number;
  pointsActualUsable: number;
  bonusPoints: number;
} {
  const cashMinCents = Math.ceil(priceCents * HYBRID_PAYMENT_MIN_CASH_RATIO);
  const pointsMaxUsable = Math.floor(priceCents * HYBRID_PAYMENT_MAX_POINTS_RATIO);
  const pointsActualUsable = Math.min(pointsMaxUsable, pointsBalance);
  const bonusPoints = Math.floor(pointsActualUsable * HYBRID_BONUS_RATIO);
  return { cashMinCents, pointsMaxUsable, pointsActualUsable, bonusPoints };
}

// ──────────────────────────────────────────────
// 14. EVOLUTION DE PROFIL (CHEMIN B)
// ──────────────────────────────────────────────

/** Bonus VIXUpoints au passage Investisseur */
export const INVESTOR_EVOLUTION_BONUS = 500;
