import type { InvestmentTierEur } from "@/lib/payout/constants"
import {
  INVESTMENT_TIERS_EUR,
  getVotesForInvestment,
  getVisupointsForInvestment,
  CAUTION_EUR,
} from "@/lib/payout/constants"

// Types de contenu
export type ContentType = "video" | "text" | "podcast"

export interface Content {
  id: string
  title: string
  description: string
  contentType: ContentType
  coverUrl: string
  creatorName: string
  creatorId: string
  createdAt: string
  investmentGoal: number
  currentInvestment: number
  contributorCount: number
  investorCount: number // Alias pour contributorCount (compatibilite)
  totalVotes: number
  isFree: boolean
  category: string
  hasTicketGoldActive?: boolean // Projet ayant un Ticket Gold actif
  duration?: string // Pour les videos et podcasts
  wordCount?: number // Pour les ecrits
  episodeCount?: number // Pour les podcasts
}

export interface Investment {
  id: string
  contentId: string
  contentTitle: string
  contentType: ContentType
  /** Montant en euros (doit etre dans INVESTMENT_TIERS_EUR) */
  amount: InvestmentTierEur
  /** Votes gagnes pour cet investissement */
  votes: number
  /** VIXUpoints gagnes pour cet investissement */
  vixupointsEarned: number
  date: string
  status: "active" | "completed" | "refunded"
  returns: number
}

export interface Transaction {
  id: string
  type: "investment" | "deposit" | "withdrawal" | "return" | "visupoints" | "caution"
  description: string
  /** Montant en euros (positif = credit, negatif = debit) */
  amount: number
  date: string
  status: "completed" | "pending" | "failed"
}

// Createurs verifies (source de verite pour le statut verifie)
export const VERIFIED_CREATORS_NAMES = [
  "Marie Stellaire",
  "Karim Ondes",
  "Thomas Voix",
  "Nora Mystere",
  "Hana Sound",
]

export function isVerifiedCreator(creatorName: string): boolean {
  return VERIFIED_CREATORS_NAMES.includes(creatorName)
}

/**
 * Vérifie si un créateur a le statut "Créateur Gold" (badge premium VIXUAL).
 * En production, ce statut viendra de la DB (table users.is_gold_creator).
 * En attendant, la liste des créateurs Gold est hardcodée ici.
 *
 * Note : ce badge est distinct de "Ticket Gold" (boost projet 48h, V3).
 */
const GOLD_CREATORS = new Set<string>([
  "Marie Stellaire",
  "Karim Ondes",
  // Ajouter ici les noms/IDs des créateurs Gold au fur et à mesure
]);

export function isGoldCreator(creatorName: string): boolean {
  return GOLD_CREATORS.has(creatorName);
}

// Filtre les contenus des créateurs Gold
export const MOCK_VIDEO_CONTENTS: Content[] = [
  { id: "v1", title: "L'Odyssee des Etoiles", description: "Un court-metrage de science-fiction epoustouflant explorant les confins de l'univers.", contentType: "video", coverUrl: "https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?w=800&h=450&fit=crop", creatorName: "Marie Stellaire", creatorId: "c1", createdAt: "2026-01-15", investmentGoal: 5000, currentInvestment: 3200, contributorCount: 47, investorCount: 47, totalVotes: 312, isFree: false, category: "Science-Fiction", duration: "18:45" },
  { id: "v2", title: "Murmures de la Foret", description: "Documentaire immersif sur la biodiversite cachee des forets tropicales.", contentType: "video", coverUrl: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&h=450&fit=crop", creatorName: "Lucas Nature", creatorId: "c2", createdAt: "2026-01-20", investmentGoal: 3000, currentInvestment: 2800, contributorCount: 89, investorCount: 89, totalVotes: 245, isFree: false, category: "Documentaire", duration: "32:10" },
  { id: "v3", title: "Metropolis 2050", description: "Vision futuriste d'une megapole ou technologie et humanite coexistent.", contentType: "video", coverUrl: "https://images.unsplash.com/photo-1519608487953-e999c86e7455?w=800&h=450&fit=crop", creatorName: "Felix Cinema", creatorId: "c8", createdAt: "2026-01-25", investmentGoal: 8000, currentInvestment: 5600, contributorCount: 73, investorCount: 73, totalVotes: 410, isFree: false, category: "Science-Fiction", duration: "24:30" },
  { id: "v4", title: "Danse des Flammes", description: "Court-metrage sur l'art du flamenco et la passion qui consume tout.", contentType: "video", coverUrl: "https://images.unsplash.com/photo-1508700929628-666bc8bd84ea?w=800&h=450&fit=crop", creatorName: "Amina Vision", creatorId: "c9", createdAt: "2026-01-28", investmentGoal: 2500, currentInvestment: 2500, contributorCount: 56, investorCount: 56, totalVotes: 189, isFree: false, category: "Drame", duration: "14:20" },
  { id: "v5", title: "Les Abysses", description: "Plongee vertigineuse dans les profondeurs oceaniques et ses creatures.", contentType: "video", coverUrl: "https://images.unsplash.com/photo-1551244072-5d12893278ab?w=800&h=450&fit=crop", creatorName: "Paul Real", creatorId: "c10", createdAt: "2026-02-01", investmentGoal: 4000, currentInvestment: 1200, contributorCount: 29, investorCount: 29, totalVotes: 156, isFree: true, category: "Documentaire", duration: "28:45" },
  { id: "v6", title: "Jazz a Minuit", description: "Un hommage cinematographique au jazz des annees folles dans les clubs parisiens.", contentType: "video", coverUrl: "https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=800&h=450&fit=crop", creatorName: "Lina Studio", creatorId: "c11", createdAt: "2026-02-03", investmentGoal: 3500, currentInvestment: 3100, contributorCount: 67, investorCount: 67, totalVotes: 278, isFree: false, category: "Musique", duration: "21:15" },
  { id: "v7", title: "Saveurs du Monde", description: "Tour gastronomique en images a travers cinq continents.", contentType: "video", coverUrl: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=450&fit=crop", creatorName: "Yann Film", creatorId: "c12", createdAt: "2026-02-05", investmentGoal: 2000, currentInvestment: 1800, contributorCount: 41, investorCount: 41, totalVotes: 198, isFree: false, category: "Documentaire", duration: "35:00" },
  { id: "v8", title: "Le Silence de la Montagne", description: "Meditation visuelle sur la solitude et la grandeur des sommets alpins.", contentType: "video", coverUrl: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&h=450&fit=crop", creatorName: "Eva Regard", creatorId: "c13", createdAt: "2026-02-07", investmentGoal: 1500, currentInvestment: 900, contributorCount: 22, investorCount: 22, totalVotes: 134, isFree: true, category: "Documentaire", duration: "19:30" },
  { id: "v9", title: "Robots a Sentiments", description: "Comedie dramatique ou une IA decouvre les emotions humaines.", contentType: "video", coverUrl: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&h=450&fit=crop", creatorName: "Marco Pixel", creatorId: "c14", createdAt: "2026-02-09", investmentGoal: 6000, currentInvestment: 4800, contributorCount: 95, investorCount: 95, totalVotes: 520, isFree: false, category: "Comedie", duration: "22:00" },
  { id: "v10", title: "Le Dernier Train", description: "Thriller nocturne a bord d'un train mysterieux traversant l'Europe.", contentType: "video", coverUrl: "https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=800&h=450&fit=crop", creatorName: "Nadia Camera", creatorId: "c15", createdAt: "2026-02-11", investmentGoal: 4500, currentInvestment: 2100, contributorCount: 38, investorCount: 38, totalVotes: 267, isFree: false, category: "Drame", duration: "26:40" },
  { id: "v11", title: "Aurore Boreale", description: "Voyage poetique sous les lumieres du Grand Nord scandinave.", contentType: "video", coverUrl: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=800&h=450&fit=crop", creatorName: "Romain Scene", creatorId: "c16", createdAt: "2026-02-13", investmentGoal: 3000, currentInvestment: 2400, contributorCount: 52, investorCount: 52, totalVotes: 301, isFree: false, category: "Documentaire", duration: "30:15" },
  { id: "v12", title: "Graffiti Vivant", description: "L'art urbain prend vie dans les rues de Marseille en realite augmentee.", contentType: "video", coverUrl: "https://images.unsplash.com/photo-1499781350541-7783f6c6a0c8?w=800&h=450&fit=crop", creatorName: "Chloe Script", creatorId: "c17", createdAt: "2026-02-15", investmentGoal: 2000, currentInvestment: 1600, contributorCount: 44, investorCount: 44, totalVotes: 213, isFree: true, category: "Animation", duration: "12:50" },
  { id: "v13", title: "Ocean Profond", description: "Exploration sous-marine des recifs coralliens en danger.", contentType: "video", coverUrl: "https://images.unsplash.com/photo-1546026423-cc4642628d2b?w=800&h=450&fit=crop", creatorName: "Karim Prod", creatorId: "c18", createdAt: "2026-02-17", investmentGoal: 5500, currentInvestment: 3300, contributorCount: 61, investorCount: 61, totalVotes: 345, isFree: false, category: "Documentaire", duration: "40:20" },
  { id: "v14", title: "Origami Vivant", description: "Animation en stop-motion ou des origamis explorent un monde de papier.", contentType: "video", coverUrl: "https://images.unsplash.com/photo-1605729845515-63b11e02af7c?w=800&h=450&fit=crop", creatorName: "Iris Lumiere", creatorId: "c19", createdAt: "2026-02-19", investmentGoal: 1800, currentInvestment: 1800, contributorCount: 35, investorCount: 35, totalVotes: 178, isFree: false, category: "Animation", duration: "9:45" },
  { id: "v15", title: "Danseurs du Vent", description: "Performance de danse contemporaine filmee sur les toits de Lyon.", contentType: "video", coverUrl: "https://images.unsplash.com/photo-1518834107812-67b0b7c58434?w=800&h=450&fit=crop", creatorName: "Leo Motion", creatorId: "c20", createdAt: "2026-02-21", investmentGoal: 2200, currentInvestment: 800, contributorCount: 18, investorCount: 18, totalVotes: 97, isFree: false, category: "Drame", duration: "16:10" },
  { id: "v16", title: "Lumieres de Berlin", description: "Documentaire nocturne sur la scene artistique underground berlinoise.", contentType: "video", coverUrl: "https://images.unsplash.com/photo-1560969184-10fe8719e047?w=800&h=450&fit=crop", creatorName: "Hana Screen", creatorId: "c21", createdAt: "2026-02-23", investmentGoal: 3800, currentInvestment: 2700, contributorCount: 58, investorCount: 58, totalVotes: 289, isFree: false, category: "Documentaire", duration: "33:25" },
]

// Mock contenus litteraires (16 ecrits)
export const MOCK_TEXT_CONTENTS: Content[] = [
  { id: "t1", title: "Les Chroniques du Temps Perdu", description: "Un roman fantastique captivant ou le temps n'est qu'une illusion.", contentType: "text", coverUrl: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=450&fit=crop", creatorName: "Pierre Michel", creatorId: "c5", createdAt: "2026-01-10", investmentGoal: 2000, currentInvestment: 1800, contributorCount: 62, investorCount: 62, totalVotes: 287, isFree: false, category: "Fantastique", wordCount: 85000 },
  { id: "t2", title: "Reflexions sur l'IA", description: "Un essai philosophique sur notre cohabitation avec l'intelligence artificielle.", contentType: "text", coverUrl: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=450&fit=crop", creatorName: "Dr. Emma Pensee", creatorId: "c6", createdAt: "2026-01-25", investmentGoal: 1000, currentInvestment: 750, contributorCount: 28, investorCount: 28, totalVotes: 134, isFree: true, category: "Essai", wordCount: 15000 },
  { id: "t3", title: "Contes de Minuit", description: "Une collection de nouvelles mysterieuses a lire quand la nuit tombe.", contentType: "text", coverUrl: "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=800&h=450&fit=crop", creatorName: "Nora Mystere", creatorId: "c7", createdAt: "2026-02-03", investmentGoal: 1500, currentInvestment: 400, contributorCount: 15, investorCount: 15, totalVotes: 89, isFree: false, category: "Nouvelles", wordCount: 45000 },
  { id: "t4", title: "Pages d'Amour", description: "Un recueil poetique sur la magie des rencontres litteraires.", contentType: "text", coverUrl: "https://images.unsplash.com/photo-1474932430478-367dbb6832c1?w=800&h=450&fit=crop", creatorName: "Claire Lettres", creatorId: "c4", createdAt: "2026-02-02", investmentGoal: 1500, currentInvestment: 1500, contributorCount: 34, investorCount: 34, totalVotes: 156, isFree: false, category: "Poesie", wordCount: 12000 },
  { id: "t5", title: "La Bibliotheque Oubliee", description: "Roman policier au coeur d'une bibliotheque ancestrale renfermant des secrets.", contentType: "text", coverUrl: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=800&h=450&fit=crop", creatorName: "Andre Plume", creatorId: "c30", createdAt: "2026-02-05", investmentGoal: 2500, currentInvestment: 2100, contributorCount: 48, investorCount: 48, totalVotes: 234, isFree: false, category: "Thriller", wordCount: 92000 },
  { id: "t6", title: "L'Encre de la Memoire", description: "Recit autobiographique d'une calligraphe qui perd progressivement la vue.", contentType: "text", coverUrl: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&h=450&fit=crop", creatorName: "Luna Pages", creatorId: "c31", createdAt: "2026-02-07", investmentGoal: 1800, currentInvestment: 1200, contributorCount: 37, investorCount: 37, totalVotes: 178, isFree: false, category: "Roman", wordCount: 67000 },
  { id: "t7", title: "Le Samourai Digital", description: "Science-fiction cyberpunk ou un guerrier virtuel defend le dernier firewall.", contentType: "text", coverUrl: "https://images.unsplash.com/photo-1614294149010-950b698f72c0?w=800&h=450&fit=crop", creatorName: "Sami Texte", creatorId: "c32", createdAt: "2026-02-09", investmentGoal: 3000, currentInvestment: 2400, contributorCount: 55, investorCount: 55, totalVotes: 312, isFree: false, category: "Science-Fiction", wordCount: 78000 },
  { id: "t8", title: "Le Cafe des Philosophes", description: "Dialogues fictifs entre grands penseurs de toutes les epoques.", contentType: "text", coverUrl: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&h=450&fit=crop", creatorName: "Elsa Roman", creatorId: "c33", createdAt: "2026-02-11", investmentGoal: 1200, currentInvestment: 900, contributorCount: 31, investorCount: 31, totalVotes: 145, isFree: true, category: "Essai", wordCount: 28000 },
  { id: "t9", title: "Le Jardinier des Etoiles", description: "Conte fantastique ou un jardinier cultive des galaxies dans son jardin.", contentType: "text", coverUrl: "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=800&h=450&fit=crop", creatorName: "Marc Prose", creatorId: "c34", createdAt: "2026-02-13", investmentGoal: 1600, currentInvestment: 1600, contributorCount: 43, investorCount: 43, totalVotes: 256, isFree: false, category: "Fantastique", wordCount: 52000 },
  { id: "t10", title: "Les Ombres de Venise", description: "Thriller historique dans les ruelles sombres de la Serenissime.", contentType: "text", coverUrl: "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=800&h=450&fit=crop", creatorName: "Julie Encre", creatorId: "c35", createdAt: "2026-02-15", investmentGoal: 2200, currentInvestment: 1100, contributorCount: 26, investorCount: 26, totalVotes: 167, isFree: false, category: "Thriller", wordCount: 88000 },
  { id: "t11", title: "La Revolution Douce", description: "Essai engage sur les mouvements citoyens pacifiques du vingt-et-unieme siecle.", contentType: "text", coverUrl: "https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=800&h=450&fit=crop", creatorName: "Youssef Chapitre", creatorId: "c36", createdAt: "2026-02-17", investmentGoal: 1400, currentInvestment: 800, contributorCount: 19, investorCount: 19, totalVotes: 98, isFree: true, category: "Essai", wordCount: 35000 },
  { id: "t12", title: "Lettres Invisibles", description: "Roman epistolaire entre deux inconnus qui s'ecrivent sans jamais se rencontrer.", contentType: "text", coverUrl: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&h=450&fit=crop", creatorName: "Mina Verso", creatorId: "c37", createdAt: "2026-02-19", investmentGoal: 1700, currentInvestment: 1500, contributorCount: 40, investorCount: 40, totalVotes: 201, isFree: false, category: "Roman", wordCount: 61000 },
  { id: "t13", title: "Paris Eternel", description: "Recueil de nouvelles romantiques se deroulant dans le Paris de toutes les epoques.", contentType: "text", coverUrl: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&h=450&fit=crop", creatorName: "Romain Ligne", creatorId: "c38", createdAt: "2026-02-21", investmentGoal: 1900, currentInvestment: 700, contributorCount: 21, investorCount: 21, totalVotes: 112, isFree: false, category: "Nouvelles", wordCount: 48000 },
  { id: "t14", title: "Le Code Quantique", description: "Thriller technologique ou un physicien decouvre une faille dans la realite.", contentType: "text", coverUrl: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&h=450&fit=crop", creatorName: "Elodie Style", creatorId: "c39", createdAt: "2026-02-22", investmentGoal: 2800, currentInvestment: 2200, contributorCount: 64, investorCount: 64, totalVotes: 345, isFree: false, category: "Science-Fiction", wordCount: 95000 },
  { id: "t15", title: "Jardin de Poemes", description: "Poesie contemplative sur la nature, les saisons et l'emerveillement.", contentType: "text", coverUrl: "https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=800&h=450&fit=crop", creatorName: "Tarik Recit", creatorId: "c40", createdAt: "2026-02-24", investmentGoal: 800, currentInvestment: 600, contributorCount: 16, investorCount: 16, totalVotes: 78, isFree: true, category: "Poesie", wordCount: 8000 },
  { id: "t16", title: "Nuit Polaire", description: "Huis clos psychologique dans une station arctique coupee du monde.", contentType: "text", coverUrl: "https://images.unsplash.com/photo-1483664852095-d6cc6870702d?w=800&h=450&fit=crop", creatorName: "Margot Fable", creatorId: "c41", createdAt: "2026-02-26", investmentGoal: 2400, currentInvestment: 1900, contributorCount: 51, investorCount: 51, totalVotes: 278, isFree: false, category: "Thriller", wordCount: 82000 },
]

// Mock contenus podcasts (16 podcasts)
export const MOCK_PODCAST_CONTENTS: Content[] = [
  { id: "p1", title: "Le Dernier Cafe", description: "Rencontres improbables autour d'un cafe, chaque episode explore une histoire humaine unique.", contentType: "podcast", coverUrl: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&h=450&fit=crop", creatorName: "Sophie Drama", creatorId: "c3", createdAt: "2026-02-01", investmentGoal: 2000, currentInvestment: 500, contributorCount: 12, investorCount: 12, totalVotes: 89, isFree: true, category: "Societe", duration: "45:00", episodeCount: 8 },
  { id: "p2", title: "Les Voix de la Nuit", description: "Temoignages nocturnes de personnes qui vivent quand le monde dort.", contentType: "podcast", coverUrl: "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=800&h=450&fit=crop", creatorName: "Karim Ondes", creatorId: "c50", createdAt: "2026-01-18", investmentGoal: 3000, currentInvestment: 2400, contributorCount: 56, investorCount: 56, totalVotes: 312, isFree: false, category: "Societe", duration: "38:00", episodeCount: 12 },
  { id: "p3", title: "Ondes Urbaines", description: "Le pouls des grandes villes du monde capture en sons et en mots.", contentType: "podcast", coverUrl: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800&h=450&fit=crop", creatorName: "Lina Audio", creatorId: "c51", createdAt: "2026-01-22", investmentGoal: 2500, currentInvestment: 1800, contributorCount: 43, investorCount: 43, totalVotes: 234, isFree: false, category: "Culture", duration: "42:00", episodeCount: 10 },
  { id: "p4", title: "Tech de Demain", description: "Decryptage des innovations technologiques qui faconnent notre avenir.", contentType: "podcast", coverUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&h=450&fit=crop", creatorName: "Thomas Voix", creatorId: "c52", createdAt: "2026-01-28", investmentGoal: 4000, currentInvestment: 3600, contributorCount: 78, investorCount: 78, totalVotes: 456, isFree: false, category: "Technologie", duration: "35:00", episodeCount: 15 },
  { id: "p5", title: "Histoires Oubliees", description: "Redecouverte d'evenements historiques meconnus qui ont change le monde.", contentType: "podcast", coverUrl: "https://images.unsplash.com/photo-1461360370896-922624d12a74?w=800&h=450&fit=crop", creatorName: "Mina Podcast", creatorId: "c53", createdAt: "2026-02-02", investmentGoal: 2800, currentInvestment: 2200, contributorCount: 52, investorCount: 52, totalVotes: 289, isFree: false, category: "Histoire", duration: "50:00", episodeCount: 9 },
  { id: "p6", title: "Rires et Compagnie", description: "Spectacle d'humour enregistre en live avec des invites surprises.", contentType: "podcast", coverUrl: "https://images.unsplash.com/photo-1527224538127-2104bb71c51b?w=800&h=450&fit=crop", creatorName: "Sami Micro", creatorId: "c54", createdAt: "2026-02-04", investmentGoal: 1500, currentInvestment: 1500, contributorCount: 38, investorCount: 38, totalVotes: 201, isFree: true, category: "Humour", duration: "55:00", episodeCount: 20 },
  { id: "p7", title: "Secrets de Cuisine", description: "Les chefs les plus talentueux revelent leurs recettes et philosophies culinaires.", contentType: "podcast", coverUrl: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=450&fit=crop", creatorName: "Eva Studio", creatorId: "c55", createdAt: "2026-02-06", investmentGoal: 1800, currentInvestment: 1200, contributorCount: 33, investorCount: 33, totalVotes: 167, isFree: false, category: "Culture", duration: "40:00", episodeCount: 11 },
  { id: "p8", title: "L'Affaire en Cours", description: "Enquetes approfondies sur des affaires judiciaires non resolues.", contentType: "podcast", coverUrl: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&h=450&fit=crop", creatorName: "Yann Ecoute", creatorId: "c56", createdAt: "2026-02-08", investmentGoal: 5000, currentInvestment: 4200, contributorCount: 91, investorCount: 91, totalVotes: 534, isFree: false, category: "Investigation", duration: "60:00", episodeCount: 6 },
  { id: "p9", title: "Echos de Voyage", description: "Carnets sonores d'un globe-trotteur a travers les cinq continents.", contentType: "podcast", coverUrl: "https://images.unsplash.com/photo-1488085061387-422e29b40080?w=800&h=450&fit=crop", creatorName: "Hana Sound", creatorId: "c57", createdAt: "2026-02-10", investmentGoal: 2200, currentInvestment: 1600, contributorCount: 39, investorCount: 39, totalVotes: 198, isFree: false, category: "Culture", duration: "32:00", episodeCount: 14 },
  { id: "p10", title: "Galaxie Sonore", description: "Exploration de l'univers a travers les sons de l'espace et la science.", contentType: "podcast", coverUrl: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=800&h=450&fit=crop", creatorName: "Marco Frequence", creatorId: "c58", createdAt: "2026-02-12", investmentGoal: 3500, currentInvestment: 2800, contributorCount: 65, investorCount: 65, totalVotes: 378, isFree: false, category: "Technologie", duration: "45:00", episodeCount: 8 },
  { id: "p11", title: "Philosophie du Quotidien", description: "Reflexions philosophiques appliquees aux situations de la vie courante.", contentType: "podcast", coverUrl: "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=800&h=450&fit=crop", creatorName: "Nadia Canal", creatorId: "c59", createdAt: "2026-02-14", investmentGoal: 1200, currentInvestment: 800, contributorCount: 24, investorCount: 24, totalVotes: 134, isFree: true, category: "Societe", duration: "28:00", episodeCount: 18 },
  { id: "p12", title: "Musiques du Monde", description: "Voyage musical a travers les traditions sonores de chaque continent.", contentType: "podcast", coverUrl: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800&h=450&fit=crop", creatorName: "Romain Episode", creatorId: "c60", createdAt: "2026-02-16", investmentGoal: 2000, currentInvestment: 1400, contributorCount: 36, investorCount: 36, totalVotes: 189, isFree: false, category: "Culture", duration: "50:00", episodeCount: 12 },
  { id: "p13", title: "Le Mental du Champion", description: "Psychologie du sport et preparation mentale des athletes de haut niveau.", contentType: "podcast", coverUrl: "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=800&h=450&fit=crop", creatorName: "Chloe Wave", creatorId: "c61", createdAt: "2026-02-18", investmentGoal: 2600, currentInvestment: 2000, contributorCount: 47, investorCount: 47, totalVotes: 256, isFree: false, category: "Societe", duration: "36:00", episodeCount: 10 },
  { id: "p14", title: "Ecologie en Action", description: "Initiatives ecologiques concretes et temoignages d'acteurs du changement.", contentType: "podcast", coverUrl: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=450&fit=crop", creatorName: "Felix Bande", creatorId: "c62", createdAt: "2026-02-20", investmentGoal: 1600, currentInvestment: 1100, contributorCount: 29, investorCount: 29, totalVotes: 145, isFree: true, category: "Societe", duration: "44:00", episodeCount: 16 },
  { id: "p15", title: "L'Esprit Entrepreneur", description: "Parcours inspirants de createurs d'entreprises et lecons de resilience.", contentType: "podcast", coverUrl: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800&h=450&fit=crop", creatorName: "Iris Talk", creatorId: "c63", createdAt: "2026-02-22", investmentGoal: 3200, currentInvestment: 2600, contributorCount: 58, investorCount: 58, totalVotes: 312, isFree: false, category: "Societe", duration: "48:00", episodeCount: 7 },
  { id: "p16", title: "Cinema : Les Coulisses", description: "Decouverte des metiers et secrets de fabrication du septieme art.", contentType: "podcast", coverUrl: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&h=450&fit=crop", creatorName: "Paul Emission", creatorId: "c64", createdAt: "2026-02-24", investmentGoal: 2400, currentInvestment: 1700, contributorCount: 42, investorCount: 42, totalVotes: 223, isFree: false, category: "Culture", duration: "52:00", episodeCount: 9 },
]

// Tous les contenus combines (48 total)
export const ALL_CONTENTS: Content[] = [...MOCK_VIDEO_CONTENTS, ...MOCK_TEXT_CONTENTS, ...MOCK_PODCAST_CONTENTS]

// Mock investissements (montants alignes sur INVESTMENT_TIERS_EUR)
export const MOCK_INVESTMENTS: Investment[] = [
  {
    id: "inv1",
    contentId: "v1",
    contentTitle: "L'Odyssee des Etoiles",
    contentType: "video",
    amount: 15,
    votes: getVotesForInvestment(15),         // 9 votes
    vixupointsEarned: getVisupointsForInvestment(15), // 80 pts
    date: "2026-01-20",
    status: "active",
    returns: 2.5,
  },
  {
    id: "inv2",
    contentId: "t1",
    contentTitle: "Les Chroniques du Temps Perdu",
    contentType: "text",
    amount: 10,
    votes: getVotesForInvestment(10),         // 7 votes
    vixupointsEarned: getVisupointsForInvestment(10), // 50 pts
    date: "2026-01-22",
    status: "active",
    returns: 1.8,
  },
  {
    id: "inv3",
    contentId: "v2",
    contentTitle: "Murmures de la Foret",
    contentType: "video",
    amount: 5,
    votes: getVotesForInvestment(5),          // 4 votes
    vixupointsEarned: getVisupointsForInvestment(5),  // 25 pts
    date: "2026-02-05",
    status: "active",
    returns: 0.6,
  },
  {
    id: "inv4",
    contentId: "t4",
    contentTitle: "Pages d'Amour",
    contentType: "text",
    amount: 20,
    votes: getVotesForInvestment(20),         // 10 votes
    vixupointsEarned: getVisupointsForInvestment(20), // 110 pts
    date: "2026-02-10",
    status: "completed",
    returns: 5.2,
  },
]

// Mock transactions (alignees avec les formules V1)
export const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: "tr0",
    type: "caution",
    description: `Caution Contributeur (${CAUTION_EUR.contributor}EUR)`,
    amount: -CAUTION_EUR.contributor,
    date: "2026-01-15",
    status: "completed",
  },
  {
    id: "tr1",
    type: "investment",
    description: "Investissement 15EUR - L'Odyssee des Etoiles (9 votes, +80 pts)",
    amount: -15,
    date: "2026-01-20",
    status: "completed",
  },
  {
    id: "tr2",
    type: "investment",
    description: "Investissement 10EUR - Chroniques du Temps Perdu (7 votes, +50 pts)",
    amount: -10,
    date: "2026-01-22",
    status: "completed",
  },
  {
    id: "tr3",
    type: "return",
    description: "Retour sur investissement - L'Odyssee des Etoiles",
    amount: 2.5,
    date: "2026-02-01",
    status: "completed",
  },
  {
    id: "tr4",
    type: "investment",
    description: "Investissement 5EUR - Murmures de la Foret (4 votes, +25 pts)",
    amount: -5,
    date: "2026-02-05",
    status: "completed",
  },
  {
    id: "tr5",
    type: "investment",
    description: "Investissement 20EUR - Pages d'Amour (10 votes, +110 pts)",
    amount: -20,
    date: "2026-02-10",
    status: "completed",
  },
  {
    id: "tr6",
    type: "return",
    description: "Retour sur investissement - Pages d'Amour (rang 4, 3.41% de G)",
    amount: 5.2,
    date: "2026-02-15",
    status: "completed",
  },
]

// Catégories
export const VIDEO_CATEGORIES = [
  "Tous",
  "Court-métrage",
  "Documentaire",
  "Animation",
  "Musique",
  "Comédie",
  "Science-Fiction",
  "Drame",
]

export const TEXT_CATEGORIES = [
  "Tous",
  "Roman",
  "Nouvelles",
  "Essai",
  "Poésie",
  "Fantastique",
  "Science-Fiction",
  "Thriller",
]

export const PODCAST_CATEGORIES = [
  "Tous",
  "Societe",
  "Culture",
  "Technologie",
  "Histoire",
  "Humour",
  "Investigation",
  "Voix de l'Info",
]

// FAQ data
export const FAQ_ITEMS = [
  {
    question: "Qu'est-ce que VIXUAL ?",
    answer: "VIXUAL est une plateforme d'investissement participatif dans les projets audiovisuels, litteraires et podcasts. Vous pouvez soutenir des createurs et potentiellement recevoir des retours sur vos investissements.",
  },
  {
    question: "Comment fonctionne l'investissement ?",
    answer: "Vous choisissez un projet qui vous interesse, selectionnez un montant entre 2 EUR et 20 EUR (tranches : 2, 3, 4, 5, 6, 8, 10, 12, 15, 20 EUR), et devenez investisseur. Si le projet genere des revenus, vous recevez une part proportionnelle a votre investissement.",
  },
  {
    question: "Qu'est-ce que la caution ?",
    answer: "La caution est un depot unique (10 EUR pour les createurs : Porteur, Infoporteur, Podcasteur ; 20 EUR pour les investisseurs : Contributeur, Contribu-lecteur, Auditeur) qui garantit votre engagement. Elle est remboursable en cas de resiliation.",
  },
  {
    question: "Comment retirer mes gains ?",
    answer: "Vos gains sont consultables dans votre Wallet. Pour retirer, vous devez connecter votre compte Stripe. Les retraits sont traités chaque semaine.",
  },
  {
    question: "Que sont les VIXUpoints ?",
    answer: "Les VIXUpoints sont des points de fidélité que vous gagnez en utilisant la plateforme : parrainages, partages, commentaires, etc. Ils débloquent des avantages exclusifs.",
  },
  {
    question: "Puis-je être créateur ET investisseur ?",
    answer: "Absolument ! Vous pouvez cumuler plusieurs rôles sur VIXUAL. Chaque rôle nécessite sa propre caution.",
  },
]

// How it works steps
export const HOW_IT_WORKS_STEPS = [
  {
    step: 1,
    title: "Créez votre compte",
    description: "Inscrivez-vous gratuitement et devenez Visiteur. Explorez la plateforme et gagnez des VIXUpoints.",
    icon: "user",
  },
  {
    step: 2,
    title: "Choisissez votre rôle",
    description: "Devenez Porteur pour créer du contenu audiovisuel, Infoporteur pour publier des écrits, ou Contributeur pour soutenir des projets.",
    icon: "layers",
  },
  {
    step: 3,
    title: "Payez votre caution",
    description: "10€ pour les créateurs, 20€ pour les investisseurs. Cette caution est remboursable si vous résiliez votre compte.",
    icon: "shield",
  },
  {
    step: 4,
    title: "Participez et gagnez",
    description: "Créez ou investissez dans des projets. Suivez vos statistiques et retirez vos gains via Stripe Connect.",
    icon: "trending-up",
  },
]

// ---------- LEADERBOARD DATA ----------

export type LeaderboardEntry = {
  rank: number
  name: string
  score: number
  detail: string
}

function generateEntries(
  baseName: string[],
  baseScore: number,
  detailFn: (score: number) => string,
  count: number
): LeaderboardEntry[] {
  return Array.from({ length: count }, (_, i) => {
    const score = Math.max(10, Math.round(baseScore * (1 - i * 0.04) + (count - i) * 2))
    return {
      rank: i + 1,
      name: baseName[i % baseName.length] + (i >= baseName.length ? ` (${Math.floor(i / baseName.length) + 1})` : ""),
      score,
      detail: detailFn(score),
    }
  })
}

const VISITEUR_NAMES = ["Emma V.", "Hugo T.", "Clara M.", "Nathan S.", "Léa B.", "Théo R.", "Inès D.", "Lucas P.", "Manon G.", "Noah L.", "Jade K.", "Raphaël F.", "Camille S.", "Axel M.", "Zoé C.", "Arthur B.", "Louise N.", "Ethan J.", "Chloé W.", "Liam A.", "Alice H.", "Maxime T.", "Éva R.", "Tom D.", "Sarah P."]
const PORTEUR_NAMES = ["Marie Stellaire", "Lucas Nature", "Sophie Drama", "Félix Cinéma", "Amina Vision", "Paul Réal", "Lina Studio", "Yann Film", "Eva Regard", "Marco Pixel", "Nadia Caméra", "Romain Scène", "Chloé Script", "Karim Prod", "Iris Lumière", "L��o Motion", "Hana Screen", "Dario Cut", "Mila Format", "Oscar Take", "Jade Shot", "Hugo Frame", "Alice Montage", "Noah Edit", "Sara Lens"]
const INFOPORTEUR_NAMES = ["Pierre Michel", "Nora Mystère", "Claire Lettres", "André Plume", "Luna Pages", "Sami Texte", "Elsa Roman", "Marc Prose", "Julie Encre", "Youssef Chapitre", "Mina Verso", "Romain Ligne", "Élodie Style", "Tarik Récit", "Margot Fable", "Léon Essai", "Inès Poème", "David Mot", "Lana Conte", "Oscar Critique", "Jade Chronique", "Hugo Nouvelle", "Alice Saga", "Noah Tome", "Sara Verset"]
const PODCASTEUR_NAMES = ["Karim Ondes", "Lina Audio", "Thomas Voix", "Mina Podcast", "Sami Micro", "Éva Studio", "Yann Écoute", "Hana Sound", "Marco Fréquence", "Nadia Canal", "Romain Épisode", "Chloé Wave", "Félix Bande", "Iris Talk", "Paul Émission", "Léo Direct", "Dario Cast", "Mila Capsule", "Oscar Pod", "Jade Stream", "Hugo Série", "Alice Show", "Noah Radio", "Sara Live", "Tom Replay"]

export const LEADERBOARD_CATEGORIES = [
  { key: "porteur" as const, label: "TOP Porteur", color: "text-red-400", bgColor: "bg-red-500/20", borderColor: "border-red-500/30" },
  { key: "infoporteur" as const, label: "TOP Infoporteur", color: "text-sky-400", bgColor: "bg-sky-500/20", borderColor: "border-sky-500/30" },
  { key: "podcasteur" as const, label: "TOP Podcasteur", color: "text-purple-400", bgColor: "bg-purple-500/20", borderColor: "border-purple-500/30" },
] as const

export type LeaderboardCategoryKey = typeof LEADERBOARD_CATEGORIES[number]["key"]

export const LEADERBOARD_DATA: Record<LeaderboardCategoryKey, LeaderboardEntry[]> = {
  porteur: generateEntries(PORTEUR_NAMES, 15600, (s) => `${s.toLocaleString()}\u20ac collect\u00e9s`, 500),
  infoporteur: generateEntries(INFOPORTEUR_NAMES, 9800, (s) => `${s.toLocaleString()}\u20ac collect\u00e9s`, 500),
  podcasteur: generateEntries(PODCASTEUR_NAMES, 8200, (s) => `${s.toLocaleString()}\u20ac collect\u00e9s`, 500),
}

// Current user mock rankings (for dashboard)
export const USER_RANKINGS: Record<LeaderboardCategoryKey, number> = {
  porteur: 128,
  infoporteur: 256,
  podcasteur: 87,
}
