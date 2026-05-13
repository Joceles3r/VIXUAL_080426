/**
 * MOCK DATA V1 — Catalogue homepage streaming definitif.
 *
 * Format : thumbnails portrait 2:3 (affiche cinema)
 * 3 sections + 1 ligne categories Savoir & Culture
 * Images Unsplash thematiques uniques (aucun doublon entre rubriques).
 */

export type V1Category = "films" | "podcasts" | "livres"

export interface V1Content {
  id: string
  title: string
  creator?: string
  category: V1Category
  thumbnail: string
  rating: number
  duration?: string
  isNew?: boolean
  tagline?: string
}

const U = (id: string) => `https://images.unsplash.com/${id}?w=600&h=900&fit=crop&q=85&auto=format`
const U_HERO = (id: string) => `https://images.unsplash.com/${id}?w=1600&h=900&fit=crop&q=90&auto=format`

// ─── HERO : Les Ombres de Minuit (thriller urbain pluvieux) ───
export const V1_FEATURED = {
  id: "feat-001",
  title: "Les Ombres de Minuit",
  year: "2026",
  duration: "2h 15min",
  genres: ["Thriller", "Crime", "Mystère"],
  rating: 4.8,
  description:
    "Dans une ville plongée dans l'obscurité, un détective doit résoudre une série de mystères avant qu'il ne soit trop tard. Une production cinématographique époustouflante qui redéfinit le thriller moderne.",
  thumbnail: U_HERO("photo-1542204165-65bf26472b9b"), // rue mouillée nuit néons (style thriller urbain)
}

// ─── FILMS & SERIES — Thrillers / Policier / Horreur (TOUS DIFFERENTS) ───
export const V1_FILMS: V1Content[] = [
  {
    id: "film-001",
    title: "Lumières Urbaines",
    category: "films",
    thumbnail: U("photo-1517457373958-b7bdd4587205"), // silhouette + voiture phares
    rating: 4.5,
    duration: "1h 58min",
  },
  {
    id: "film-002",
    title: "Cinéma Central",
    category: "films",
    thumbnail: U("photo-1485846234645-a62644f84728"), // enseigne néon rouge cinema
    rating: 4.7,
    duration: "1h 26min",
  },
  {
    id: "film-003",
    title: "Nuit Éternelle",
    category: "films",
    thumbnail: U("photo-1551269901-5c5e14c25df7"), // silhouette nuit néon vert
    rating: 4.3,
    duration: "2h 12min",
    isNew: true,
  },
  {
    id: "film-004",
    title: "Le Mystère Rouge",
    category: "films",
    thumbnail: U("photo-1635805737707-575885ab0820"), // forêt rouge mystique horror
    rating: 4.6,
    duration: "1h 33min",
  },
  {
    id: "film-005",
    title: "Masques",
    category: "films",
    thumbnail: U("photo-1604881744146-1d752a791e95"), // masques horreur sombres
    rating: 4.4,
    duration: "1h 47min",
    isNew: true,
  },
  {
    id: "film-006",
    title: "Les Ombres de Minuit",
    category: "films",
    thumbnail: U("photo-1574267432553-4b4628081c31"), // silhouette ruelle sombre
    rating: 4.8,
    duration: "2h 15min",
  },
  {
    id: "film-007",
    title: "Pluie de Verre",
    category: "films",
    thumbnail: U("photo-1505740420928-5e560c06d30e"), // pluie ville nuit
    rating: 4.2,
    duration: "1h 52min",
  },
  {
    id: "film-008",
    title: "Pacte de Brume",
    category: "films",
    thumbnail: U("photo-1518709268805-4e9042af9f23"), // brume forêt mystique
    rating: 4.5,
    duration: "2h 04min",
  },
]

// ─── PODCASTS — Vraies vignettes micros studios PRO (TOUS DIFFERENTS) ───
export const V1_PODCASTS: V1Content[] = [
  {
    id: "pod-001",
    title: "Voix du Studio",
    category: "podcasts",
    thumbnail: U("photo-1590602847861-f357a9332bbc"), // micro condensateur bleu/violet
    rating: 4.9,
    duration: "8 episodes",
  },
  {
    id: "pod-002",
    title: "Conversations Nocturnes",
    category: "podcasts",
    thumbnail: U("photo-1505236858219-8359eb29e329"), // micro vintage doré orange
    rating: 4.7,
    duration: "Mensuel",
  },
  {
    id: "pod-003",
    title: "L'Heure du Micro",
    category: "podcasts",
    thumbnail: U("photo-1598653222000-6b7b7a552625"), // micro studio bleu nuit
    rating: 4.6,
    duration: "Hebdo",
    isNew: true,
  },
  {
    id: "pod-004",
    title: "Studio Sessions",
    category: "podcasts",
    thumbnail: U("photo-1487180144351-b8472da7d491"), // setup studio podcast complet
    rating: 4.8,
    duration: "12 episodes",
  },
  {
    id: "pod-005",
    title: "Paroles d'Or",
    category: "podcasts",
    thumbnail: U("photo-1581368135153-a506cf13b1e1"), // micro vintage cuivré
    rating: 4.5,
    duration: "Hebdo",
  },
  {
    id: "pod-006",
    title: "Le Cinquième Mur",
    category: "podcasts",
    thumbnail: U("photo-1598488035139-bdbb2231ce04"), // micro fond rouge théâtral
    rating: 4.4,
    duration: "6 episodes",
  },
  {
    id: "pod-007",
    title: "Onde Libre",
    category: "podcasts",
    thumbnail: U("photo-1493225457124-a3eb161ffa5f"), // casque + table mixage
    rating: 4.6,
    duration: "Bi-mensuel",
  },
]

// ─── LITTÉRATURE — Livres / contes / journaux / blog (TOUS DIFFERENTS) ───
export const V1_LIVRES: V1Content[] = [
  {
    id: "liv-001",
    title: "Récits du Soir",
    category: "livres",
    thumbnail: U("photo-1544716278-ca5e3f4abd8c"), // livre ouvert lampe chaude (Harry Potter style)
    rating: 4.4,
    duration: "342 pages",
  },
  {
    id: "liv-002",
    title: "Bibliothèque Secrète",
    category: "livres",
    thumbnail: U("photo-1457369804613-52c61a468e7d"), // bibliothèque chaleureuse Kindle
    rating: 4.7,
    duration: "218 pages",
    isNew: true,
  },
  {
    id: "liv-003",
    title: "Le Royaume Endormi",
    category: "livres",
    thumbnail: U("photo-1535905557558-afc4877a26fc"), // conte fantastique brume
    rating: 4.6,
    duration: "284 pages",
    tagline: "Conte fantastique",
  },
  {
    id: "liv-004",
    title: "L'Echo du Quotidien",
    category: "livres",
    thumbnail: U("photo-1504711434969-e33886168f5c"), // journaux papier
    rating: 4.5,
    duration: "Hebdomadaire",
    tagline: "Journal & chroniques",
  },
  {
    id: "liv-005",
    title: "Café Littéraire",
    category: "livres",
    thumbnail: U("photo-1513001900722-370f803f498d"), // livre + tasse café
    rating: 4.8,
    duration: "302 pages",
  },
  {
    id: "liv-006",
    title: "Pages Rouges",
    category: "livres",
    thumbnail: U("photo-1495640388908-05fa85288e61"), // livre ouvert nature
    rating: 4.6,
    duration: "184 pages",
  },
  {
    id: "liv-007",
    title: "Chroniques du Web",
    category: "livres",
    thumbnail: U("photo-1499750310107-5fef28a66643"), // laptop blog moderne
    rating: 4.5,
    duration: "Blog hebdo",
    tagline: "Blog & essais",
  },
]

// ─── SECTIONS PRINCIPALES (3 carrousels horizontaux) ───
export const V1_SECTIONS: Array<{ id: string; title: string; items: V1Content[] }> = [
  { id: "sect-films", title: "En vedette cette semaine", items: V1_FILMS },
  { id: "sect-podcasts", title: "Podcasts Populaires", items: V1_PODCASTS },
  { id: "sect-livres", title: "Littérature à Découvrir", items: V1_LIVRES },
]

// ─── SAVOIR & CULTURE (catégories du bandeau bas) ───
export const V1_SAVOIR_CATEGORIES = [
  { id: "doc", label: "Documentaires", icon: "play-square" },
  { id: "hist", label: "Histoire", icon: "landmark" },
  { id: "sci", label: "Sciences", icon: "flask-conical" },
  { id: "arts", label: "Arts & Création", icon: "palette" },
  { id: "philo", label: "Philosophie", icon: "brain" },
  { id: "env", label: "Environnement", icon: "leaf" },
  { id: "soc", label: "Société", icon: "users" },
  { id: "edu", label: "Éducation", icon: "book-open" },
] as const
