/**
 * MOCK DATA V1 — Catalogue homepage V1 (alignement Figma).
 *
 * Format thumbnails : portrait 9:16 (affiche cinema)
 * Structure : 3 sections principales empilees verticalement
 *   - Films & Series
 *   - Podcasts Populaires
 *   - Litterature a Decouvrir
 *
 * Chaque section : 2 cartes visibles cote a cote (grille 2 colonnes).
 * Notes etoiles (4.0-5.0) visibles directement sur chaque vignette.
 */

export type V1Category = "films" | "podcasts" | "livres"

export interface V1Content {
  id: string
  title: string
  creator: string
  category: V1Category
  thumbnail: string // Format portrait 9:16 (Unsplash w=600&h=900)
  rating: number // 4.0 - 5.0
  duration?: string
  isNew?: boolean
  tagline?: string
  supports?: number
}

// Unsplash URLs en format portrait 9:16 (affiche cinema)
const U = (id: string) => `https://images.unsplash.com/${id}?w=600&h=900&fit=crop&q=85&auto=format`

// Hero featured : reste en 16:9 paysage (image plein ecran)
const U_HERO = (id: string) => `https://images.unsplash.com/${id}?w=1920&h=1080&fit=crop&q=85&auto=format`

export const V1_FEATURED: V1Content = {
  id: "feat-001",
  title: "Les Ombres de Marseille",
  creator: "Camille Auriol",
  category: "films",
  thumbnail: U_HERO("photo-1489599849927-2ee91cede3ba"),
  duration: "1h 47min",
  rating: 4.8,
  tagline: "Un polar nocturne au coeur de la cite phoceenne. Sept nuits. Un secret. Une derniere chance.",
  supports: 1248,
}

// ─── FILMS (6 contenus, affichés en 2 colonnes scroll vertical) ───
export const V1_FILMS: V1Content[] = [
  {
    id: "film-002",
    title: "Nuit Eternelle",
    creator: "Yanis Bernal",
    category: "films",
    thumbnail: U("photo-1518929458119-e5bf444c30f4"),
    rating: 4.3,
    duration: "2h 12min",
    isNew: true,
  },
  {
    id: "film-003",
    title: "Le Mystere Rouge",
    creator: "Iris Wenger",
    category: "films",
    thumbnail: U("photo-1478737270239-2f02b77fc618"),
    rating: 4.6,
    duration: "1h 33min",
  },
  {
    id: "film-004",
    title: "Lumieres Urbaines",
    creator: "Mehdi Tassan",
    category: "films",
    thumbnail: U("photo-1440404653325-ab127d49abc1"),
    rating: 4.5,
    duration: "1h 58min",
  },
  {
    id: "film-005",
    title: "Cinema Central",
    creator: "Soline Vasseur",
    category: "films",
    thumbnail: U("photo-1478720568477-152d9b164e26"),
    rating: 4.7,
    duration: "1h 26min",
    isNew: true,
  },
  {
    id: "film-006",
    title: "Reverberation",
    creator: "Theo Marchand",
    category: "films",
    thumbnail: U("photo-1485846234645-a62644f84728"),
    rating: 4.4,
    duration: "2h 04min",
  },
  {
    id: "film-007",
    title: "Decembre, 21h",
    creator: "Naima Tassan",
    category: "films",
    thumbnail: U("photo-1517604931442-7e0c8ed2963c"),
    rating: 4.2,
    duration: "1h 41min",
  },
]

// ─── PODCASTS (6 contenus) — Images crédibles studios/micros ───
export const V1_PODCASTS: V1Content[] = [
  {
    id: "pod-001",
    title: "Studio Sessions",
    creator: "Atelier Lumen",
    category: "podcasts",
    thumbnail: U("photo-1590602847861-f357a9332bbc"), // micro studio pro
    rating: 4.8,
    duration: "12 episodes",
  },
  {
    id: "pod-002",
    title: "Paroles d'Or",
    creator: "Tanguy Lecomte",
    category: "podcasts",
    thumbnail: U("photo-1581368135153-a506cf13b1e1"), // micro vintage gold
    rating: 4.5,
    duration: "Hebdo",
    isNew: true,
  },
  {
    id: "pod-003",
    title: "Voix du Studio",
    creator: "Lou Bricard",
    category: "podcasts",
    thumbnail: U("photo-1487180144351-b8472da7d491"), // casque + micro
    rating: 4.9,
    duration: "8 episodes",
  },
  {
    id: "pod-004",
    title: "Conversations Nocturnes",
    creator: "Rachid Damari",
    category: "podcasts",
    thumbnail: U("photo-1478737270239-2f02b77fc618"), // table mixage nuit
    rating: 4.7,
    duration: "Mensuel",
  },
  {
    id: "pod-005",
    title: "Le Cinquieme Mur",
    creator: "Compagnie Ardente",
    category: "podcasts",
    thumbnail: U("photo-1598488035139-bdbb2231ce04"), // micro sur fond rouge
    rating: 4.4,
    duration: "6 episodes",
    isNew: true,
  },
  {
    id: "pod-006",
    title: "Cartographie Intime",
    creator: "Lou Bricard",
    category: "podcasts",
    thumbnail: U("photo-1546528377-7053cab43d0d"), // home studio podcast
    rating: 4.3,
    duration: "10 episodes",
  },
]

// ─── LIVRES (6 contenus) — Images crédibles livres/lecture ───
export const V1_LIVRES: V1Content[] = [
  {
    id: "liv-001",
    title: "Recits du Soir",
    creator: "Emilie Roussel",
    category: "livres",
    thumbnail: U("photo-1544716278-ca5e3f4abd8c"), // livre ouvert lampe chaude
    rating: 4.4,
    duration: "342 pages",
  },
  {
    id: "liv-002",
    title: "Bibliotheque Secrete",
    creator: "Karim Bennali",
    category: "livres",
    thumbnail: U("photo-1507842217343-583bb7270b66"), // bibliotheque vintage
    rating: 4.7,
    duration: "218 pages",
    isNew: true,
  },
  {
    id: "liv-003",
    title: "Mots Precieux",
    creator: "Solange Devaux",
    category: "livres",
    thumbnail: U("photo-1532012197267-da84d127e765"), // livres empiles
    rating: 4.5,
    duration: "276 pages",
  },
  {
    id: "liv-004",
    title: "Pages Rouges",
    creator: "Theo Marchand",
    category: "livres",
    thumbnail: U("photo-1495640388908-05fa85288e61"), // livre ouvert nature
    rating: 4.6,
    duration: "184 pages",
  },
  {
    id: "liv-005",
    title: "Cafe Litteraire",
    creator: "Naima Tassan",
    category: "livres",
    thumbnail: U("photo-1513001900722-370f803f498d"), // livre + cafe
    rating: 4.8,
    duration: "302 pages",
    isNew: true,
  },
  {
    id: "liv-006",
    title: "Carnets de l'Atlas",
    creator: "Karim Bennali",
    category: "livres",
    thumbnail: U("photo-1519682337058-a94d519337bc"), // carnet de voyage
    rating: 4.5,
    duration: "256 pages",
  },
]

export const V1_SECTIONS: Array<{ id: string; title: string; items: V1Content[] }> = [
  { id: "sect-films", title: "Films & Series", items: V1_FILMS },
  { id: "sect-podcasts", title: "Podcasts Populaires", items: V1_PODCASTS },
  { id: "sect-livres", title: "Litterature a Decouvrir", items: V1_LIVRES },
]
