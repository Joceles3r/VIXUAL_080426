/**
 * VIXUAL - Système de Guidage par Profil Utilisateur
 *
 * Ce système guide chaque profil vers les actions logiques et avantages spécifiques.
 * Permet une meilleure expérience utilisateur et une compréhension claire des rôles.
 *
 * @since 2026-03-11
 */

// VERROU FINAL: cles officielles
export type UserProfile = 
  | "guest"
  | "visitor"
  | "creator"
  | "infoporteur"
  | "podcasteur"
  | "contributor"
  | "contribu_lecteur"
  | "auditeur"

export interface ProfileGuide {
  profile: UserProfile
  displayName: string
  requiresSignup: boolean
  description: string
  actions: ProfileAction[]
  advantages: string[]
  limitations: string[]
  vixupointsInfo: {
    canEarn: boolean
    canSpend: boolean
    maxCap: number | null
    capType: "total" | "monthly" | null
  }
  nextStep?: {
    description: string
    action: string
    incentive: string
  }
}

export interface ProfileAction {
  title: string
  description: string
  icon: string
  available: boolean
  requiresVIXUpoints?: boolean
  requiresPremium?: boolean
}

// ─── Configurations par profil ───

export const PROFILE_GUIDES: Record<UserProfile, ProfileGuide> = {
  // ─── INVITÉ (non inscrit) ───
  guest: {
    profile: "guest",
    displayName: "Invité",
    requiresSignup: false,
    description:
      "Naviguez librement sans inscription. Accès limité aux extraits et contenus gratuits uniquement.",
    actions: [
      {
        title: "Explorer les contenus gratuits",
        description: "Parcourez les extraits et découvrez les projets populaires",
        icon: "Eye",
        available: true,
      },
      {
        title: "Consulter le TOP 10/100/500",
        description: "Découvrez les meilleurs projets classés par catégorie",
        icon: "Trophy",
        available: true,
      },
      {
        title: "Lire les avis Vixual Social",
        description: "Consultez les commentaires de la communauté",
        icon: "MessageCircle",
        available: false,
        requiresPremium: true,
      },
      {
        title: "Acheter du contenu",
        description: "Accéder aux contenus payants et paiement hybride",
        icon: "ShoppingCart",
        available: false,
        requiresPremium: true,
      },
    ],
    advantages: [
      "Navigation libre et instantanée",
      "Découverte sans engagement",
      "Accès gratuit aux contenus libres",
    ],
    limitations: [
      "Aucun VIXUpoint gagné",
      "Aucun accès à Vixual Social",
      "Pas d'investissement ni contribution",
      "Pas de portefeuille personnel",
    ],
    vixupointsInfo: {
      canEarn: false,
      canSpend: false,
      maxCap: null,
      capType: null,
    },
    nextStep: {
      description: "Débloquez tous les avantages VIXUAL",
      action: "S'inscrire maintenant",
      incentive: "Inscription gratuite - Accès immédiat à Vixual Social et aux VIXUpoints",
    },
  },

  // ─── VISITEUR (inscrit, sans rôle créatif) ───
  visitor: {
    profile: "visitor",
    displayName: "Visiteur",
    requiresSignup: true,
    description:
      "Inscrit et connecté. Accès complet aux contenus gratuits, paiement hybride, participation communautaire.",
    actions: [
      {
        title: "Accéder à tous les contenus gratuits",
        description: "Explorez sans restriction tous les extraits et contenus libres",
        icon: "Play",
        available: true,
      },
      {
        title: "Acheter avec paiement hybride",
        description: "70% max en VIXUpoints + 30% min en euros",
        icon: "ShoppingCart",
        available: true,
        requiresVIXUpoints: true,
      },
      {
        title: "Participer à Vixual Social",
        description: "Partager des avis, commenter, discuter avec la communauté",
        icon: "MessageCircle",
        available: true,
      },
      {
        title: "Consulter vos VIXUpoints",
        description: "Suivi des gains et historique des achats",
        icon: "Coins",
        available: true,
      },
      {
        title: "Convertir en euros",
        description: "Échange possible dès 2500 VIXUpoints (25€)",
        icon: "TrendingUp",
        available: true,
        requiresVIXUpoints: true,
      },
      {
        title: "Devenir créateur",
        description: "Évoluer vers Porteur, Infoporteur ou Podcasteur",
        icon: "Upload",
        available: true,
      },
    ],
    advantages: [
      "Paiement hybride intelligent (70/30)",
      "Accumulation de VIXUpoints",
      "Participation à la communauté",
      "Accès illimité aux contenus gratuits",
      "Conversion VIXUpoints → euros (dès 2500 pts)",
      "Badges et reconnaissance communautaire",
    ],
    limitations: [
      "Maximum 2500 VIXUpoints (cap total)",
      "Pas de création de contenu",
      "Pas de retour d'investissement directs",
      "Lecture seule sur Vixual Social",
    ],
    vixupointsInfo: {
      canEarn: true,
      canSpend: true,
      maxCap: 2500,
      capType: "total",
    },
    nextStep: {
      description: "Passez au niveau supérieur en tant que créateur",
      action: "Devenir créateur (Porteur, Infoporteur ou Podcasteur)",
      incentive: "Débloquez la création de contenu et les gains potentiels",
    },
  },

  // ─── CREATEUR (créateur audiovisuel) ───
  creator: {
    profile: "creator",
    displayName: "Createur",
    requiresSignup: true,
    description:
      "Créateur audiovisuel. Déposez vos vidéos, gérez vos projets, recevez les contributions des visiteurs.",
    actions: [
      {
        title: "Déposer un film/vidéo",
        description: "Uploadez vos contenus audiovisuels avec description et prix",
        icon: "Upload",
        available: true,
      },
      {
        title: "Gérer vos projets",
        description: "Statistiques, état des contributions, promotion",
        icon: "BarChart3",
        available: true,
      },
      {
        title: "Accéder à Vixual Social",
        description: "Participer aux discussions, répondre aux avis",
        icon: "MessageCircle",
        available: true,
      },
      {
        title: "Acheter contenu d'autres créateurs",
        description: "Découvrir d'autres créateurs avec paiement hybride",
        icon: "ShoppingCart",
        available: true,
        requiresVIXUpoints: true,
      },
      {
        title: "Consulter vos gains",
        description: "Retours mensuels, historique, TOP 10 status",
        icon: "Wallet",
        available: true,
      },
      {
        title: "Retirer vos gains",
        description: "Paiement via Stripe Connect (min 25€)",
        icon: "TrendingUp",
        available: true,
      },
    ],
    advantages: [
      "Création illimitée de contenus",
      "Accès à la communauté créative",
      "Potentiel de gains via TOP 10",
      "Paiement hybride pour achats",
      "VIXUpoints bonus mensuels (1000 max)",
      "Caution créateur (10€, remboursable)",
    ],
    limitations: [
      "Caution obligatoire (10€)",
      "VIXUpoints plafonné à 1000/mois",
      "Ne peut pas acheter son propre contenu",
      "Gains conditionnés à TOP 10",
    ],
    vixupointsInfo: {
      canEarn: true,
      canSpend: true,
      maxCap: 1000,
      capType: "monthly",
    },
    nextStep: {
      description: "Maximisez votre potentiel de gains",
      action: "Consulter les statistiques et les conseils de promotion",
      incentive: "Rejoignez le TOP 10 pour recevoir vos premiers revenus le 1er du mois",
    },
  },

  // ─── INFOPORTEUR (créateur littéraire) ───
  infoporteur: {
    profile: "infoporteur",
    displayName: "Infoporteur",
    requiresSignup: true,
    description:
      "Créateur littéraire. Publiez vos articles et livres, recevez les achats des lecteurs.",
    actions: [
      {
        title: "Publier un article/livre",
        description: "Déposez vos contenus écrits avec description et prix",
        icon: "Upload",
        available: true,
      },
      {
        title: "Gérer vos publications",
        description: "Statistiques de lecture, état des ventes, promotion",
        icon: "BookOpen",
        available: true,
      },
      {
        title: "Participer à Vixual Social",
        description: "Discuter avec la communauté de lecteurs",
        icon: "MessageCircle",
        available: true,
      },
      {
        title: "Acheter vidéos et podcasts",
        description: "Explorer d'autres univers créatifs avec paiement hybride",
        icon: "ShoppingCart",
        available: true,
        requiresVIXUpoints: true,
      },
      {
        title: "Consulter vos revenus",
        description: "Ventes directes 70/30, pot mensuel, TOP 10 status",
        icon: "Wallet",
        available: true,
      },
      {
        title: "Retirer vos gains",
        description: "Paiement via Stripe Connect (min 25€)",
        icon: "TrendingUp",
        available: true,
      },
    ],
    advantages: [
      "Publication illimitée de contenus",
      "Système de vente 70/30 direct",
      "Accès à la communauté lecteurs",
      "Paiement hybride pour achats",
      "VIXUpoints bonus mensuels (1000 max)",
      "Caution créateur (10€, remboursable)",
    ],
    limitations: [
      "Caution obligatoire (10€)",
      "VIXUpoints plafonné à 1000/mois",
      "Ne peut pas acheter ses propres articles",
      "Gains dépendent du pot mensuel",
    ],
    vixupointsInfo: {
      canEarn: true,
      canSpend: true,
      maxCap: 1000,
      capType: "monthly",
    },
  },

  // ─── PODCASTEUR (créateur podcast) ───
  podcasteur: {
    profile: "podcasteur",
    displayName: "Podcasteur",
    requiresSignup: true,
    description:
      "Créateur podcast. Partagez vos émissions audio, recevez les écoutes et contributions.",
    actions: [
      {
        title: "Déposer un podcast/émission",
        description: "Uploadez vos contenus audio avec description et prix",
        icon: "Upload",
        available: true,
      },
      {
        title: "Gérer vos episodes",
        description: "Statistiques d'écoute, état des contributions",
        icon: "Music",
        available: true,
      },
      {
        title: "Accéder à Vixual Social",
        description: "Interagir avec votre audience d'auditeurs",
        icon: "MessageCircle",
        available: true,
      },
      {
        title: "Acheter vidéos et contenus écrits",
        description: "Découvrir d'autres univers créatifs",
        icon: "ShoppingCart",
        available: true,
        requiresVIXUpoints: true,
      },
      {
        title: "Consulter vos revenus",
        description: "Ventes directes 70/30, pot mensuel, bonus performance",
        icon: "Wallet",
        available: true,
      },
      {
        title: "Retirer vos gains",
        description: "Paiement via Stripe Connect (min 25€)",
        icon: "TrendingUp",
        available: true,
      },
    ],
    advantages: [
      "Publication illimitée d'épisodes",
      "Système de vente 70/30 direct",
      "Bonus de performance pour TOP 10",
      "Accès à la communauté auditeurs",
      "Paiement hybride pour achats",
      "VIXUpoints bonus mensuels (1000 max)",
    ],
    limitations: [
      "Caution obligatoire (10€)",
      "VIXUpoints plafonné à 1000/mois",
      "Ne peut pas acheter ses propres podcasts",
      "Gains dépendent du pot mensuel",
    ],
    vixupointsInfo: {
      canEarn: true,
      canSpend: true,
      maxCap: 1000,
      capType: "monthly",
    },
  },

  // ─── CONTRIBUTEUR (investisseur audiovisuel) ───
  contributor: {
    profile: "contributor",
    displayName: "Contributeur",
    requiresSignup: true,
    description:
      "Contributeur audiovisuel. Contribuez à des projets vidéo, recevez les gains des TOP 10.",
    actions: [
      {
        title: "Sélectionner un projet vidéo",
        description: "Choisir parmi les projets audiovisuels disponibles",
        icon: "Play",
        available: true,
      },
      {
        title: "Contribuer (2-20€)",
        description: "Supporter le projet créateur et gagner des votes",
        icon: "Heart",
        available: true,
      },
      {
        title: "Consulter votre portefeuille",
        description: "Projets en attente, TOP 10 status, gains potentiels",
        icon: "BarChart3",
        available: true,
      },
      {
        title: "Participer à Vixual Social",
        description: "Partager vos avis sur les projets",
        icon: "MessageCircle",
        available: true,
      },
      {
        title: "Acheter contenu d'autres univers",
        description: "Découvrir des articles et podcasts",
        icon: "ShoppingCart",
        available: true,
      },
      {
        title: "Retirer vos gains",
        description: "Si TOP 10 : revenus le 1er du mois",
        icon: "Wallet",
        available: true,
      },
    ],
    advantages: [
      "Contribution flexible (2-20€)",
      "Système de votes équitable",
      "Potentiel de gains TOP 10 (40%)",
      "Découverte de créateurs",
      "Participation communautaire active",
      "Caution contributeur (20€, remboursable)",
    ],
    limitations: [
      "Caution obligatoire (20€)",
      "Gains non garantis (TOP 10 seulement)",
      "Ne peut pas créer de contenu",
      "Votes limités par contribution",
    ],
    vixupointsInfo: {
      canEarn: true,
      canSpend: true,
      maxCap: 2500,
      capType: "total",
    },
  },

  // ─── CONTRI-LECTEUR (investisseur littéraire) ───
  contribu_lecteur: {
    profile: "contribu_lecteur",
    displayName: "Contri-lecteur",
    requiresSignup: true,
    description:
      "Contributeur littéraire. Soutenez les auteurs, participez au pot mensuel.",
    actions: [
      {
        title: "Sélectionner un article/livre",
        description: "Choisir parmi les contenus littéraires disponibles",
        icon: "BookOpen",
        available: true,
      },
      {
        title: "Contribuer (2-20€)",
        description: "Supporter l'auteur et participer au pot",
        icon: "Heart",
        available: true,
      },
      {
        title: "Consulter votre portefeuille",
        description: "Contenus lus, TOP 10 status, gains potentiels",
        icon: "BarChart3",
        available: true,
      },
      {
        title: "Participer à Vixual Social",
        description: "Partager vos avis de lecture",
        icon: "MessageCircle",
        available: true,
      },
      {
        title: "Acheter vidéos et podcasts",
        description: "Explorer d'autres univers créatifs",
        icon: "ShoppingCart",
        available: true,
      },
      {
        title: "Retirer vos gains",
        description: "Si TOP 10 : revenus le dernier jour du mois",
        icon: "Wallet",
        available: true,
      },
    ],
    advantages: [
      "Contribution flexible (2-20€)",
      "Support direct des auteurs",
      "Potentiel de gains TOP 10 (40%)",
      "Pot mensuel communautaire",
      "Participation lecteurs active",
    ],
    limitations: [
      "Caution obligatoire (20€)",
      "Gains non garantis (TOP 10 seulement)",
      "Ne peut pas créer de contenu",
    ],
    vixupointsInfo: {
      canEarn: true,
      canSpend: true,
      maxCap: 2500,
      capType: "total",
    },
  },

  // ─── AUDITEUR (contributeur podcast) ───
  auditeur: {
    profile: "auditeur",
    displayName: "Auditeur",
    requiresSignup: true,
    description:
      "Contributeur podcast. Écoutez et soutenez les podcasteurs.",
    actions: [
      {
        title: "Sélectionner un podcast",
        description: "Choisir parmi les podcasts disponibles",
        icon: "Headphones",
        available: true,
      },
      {
        title: "Contribuer (2-20€)",
        description: "Supporter le podcasteur et gagner des points écoute",
        icon: "Heart",
        available: true,
      },
      {
        title: "Consulter votre portefeuille",
        description: "Podcasts suivis, TOP 10 status, gains potentiels",
        icon: "BarChart3",
        available: true,
      },
      {
        title: "Participer à Vixual Social",
        description: "Discuter avec d'autres auditeurs",
        icon: "MessageCircle",
        available: true,
      },
      {
        title: "Acheter vidéos et contenus écrits",
        description: "Explorer d'autres univers créatifs",
        icon: "ShoppingCart",
        available: true,
      },
      {
        title: "Retirer vos gains",
        description: "Si TOP 10 : revenus le dernier jour du mois",
        icon: "Wallet",
        available: true,
      },
    ],
    advantages: [
      "Contribution flexible (2-20€)",
      "Support direct des podcasteurs",
      "Potentiel de gains TOP 10 (30%)",
      "Bonus de performance TOP 10",
      "Communauté auditeurs engagée",
    ],
    limitations: [
      "Caution obligatoire (20€)",
      "Gains non garantis (TOP 10 seulement)",
      "Ne peut pas créer de contenu",
    ],
    vixupointsInfo: {
      canEarn: true,
      canSpend: true,
      maxCap: 2500,
      capType: "total",
    },
  },
}

// ─── Utilitaires ───

export function getProfileGuide(profile: UserProfile): ProfileGuide {
  return PROFILE_GUIDES[profile]
}

export function getProfileDisplayName(profile: UserProfile): string {
  return PROFILE_GUIDES[profile].displayName
}

export function getProfileActions(profile: UserProfile): ProfileAction[] {
  return PROFILE_GUIDES[profile].actions
}

/**
 * Obtient le profil recommandé pour un utilisateur visiteur
 * basé sur ses préférences de contenu
 */
// VERROU FINAL: cles officielles
export function getRecommendedProfile(contentPreferences: string[]): UserProfile {
  const hasVideo = contentPreferences.includes("video")
  const hasText = contentPreferences.includes("text")
  const hasPodcast = contentPreferences.includes("podcast")

  // Si l'utilisateur aime creer du contenu
  if (hasVideo) return "creator"
  if (hasText) return "infoporteur"
  if (hasPodcast) return "podcasteur"

  // Si l'utilisateur aime consommer
  if (hasVideo) return "contributor"
  if (hasText) return "contribu_lecteur"
  if (hasPodcast) return "auditeur"

  return "visitor"
}
