/**
 * MOCK DATA V1 — Catalogue homepage V1 thématique cinéma.
 *
 * Toutes les URLs Unsplash sont VÉRIFIÉES et UNIQUES dans leur rubrique.
 * - Format portrait 9:16 pour les vignettes (600×900).
 * - Format paysage 16:9 pour le hero (1920×1080).
 *
 * Mise à jour : hero polar nocturne, 8 vignettes par rubrique,
 * imagerie thriller/policier pour Films, setups studio variés pour Podcasts.
 */

export type V1Category = "films" | "podcasts" | "livres"

export interface V1Content {
  id: string
  title: string
  creator: string
  category: V1Category
  thumbnail: string
  rating: number
  duration?: string
  isNew?: boolean
  tagline?: string
  supports?: number
}

const U = (id: string) => `https://images.unsplash.com/${id}?w=600&h=900&fit=crop&q=85&auto=format`
const U_HERO = (id: string) => `https://images.unsplash.com/${id}?w=1920&h=1080&fit=crop&q=85&auto=format`

// ─── HERO : rue nocturne pluvieuse, ambiance polar / film noir ───
export const V1_FEATURED: V1Content = {
  id: "feat-001",
  title: "Les Ombres de Marseille",
  creator: "Camille Auriol",
  category: "films",
  thumbnail: U_HERO("photo-1519608487953-e999c86e7455"),
  duration: "1h 47min",
  rating: 4.8,
  tagline: "Un polar nocturne au coeur de la cite phoceenne. Sept nuits. Un secret. Une derniere chance.",
  supports: 1248,
}

// ─── FILMS & SERIES (8) — Thriller / policier / suspense, toutes différentes ───
export const V1_FILMS: V1Content[] = [
  {
    id: "film-002",
    title: "Nuit Eternelle",
    creator: "Yanis Bernal",
    category: "films",
    thumbnail: U("photo-1551269901-5c5e14c25df7"), // silhouette sombre fumee
    rating: 4.3,
    duration: "2h 12min",
    isNew: true,
  },
  {
    id: "film-003",
    title: "Le Mystere Rouge",
    creator: "Iris Wenger",
    category: "films",
    thumbnail: U("photo-1485846234645-a62644f84728"), // salle cinema sombre rouge
    rating: 4.6,
    duration: "1h 33min",
  },
  {
    id: "film-004",
    title: "Lumieres Urbaines",
    creator: "Mehdi Tassan",
    category: "films",
    thumbnail: U("photo-1517457373958-b7bdd4587205"), // ville nuit cinematique
    rating: 4.5,
    duration: "1h 58min",
  },
  {
    id: "film-005",
    title: "Pluie de Verre",
    creator: "Soline Vasseur",
    category: "films",
    thumbnail: U("photo-1500099817043-86d46000d58f"), // pluie sur vitre nuit
    rating: 4.7,
    duration: "1h 26min",
    isNew: true,
  },
  {
    id: "film-006",
    title: "Reverberation",
    creator: "Theo Marchand",
    category: "films",
    thumbnail: U("photo-1478720568477-152d9b164e26"), // sieges cinema penombre
    rating: 4.4,
    duration: "2h 04min",
  },
  {
    id: "film-007",
    title: "Decembre, 21h",
    creator: "Naima Tassan",
    category: "films",
    thumbnail: U("photo-1542204165-65bf26472b9b"), // silhouette mysterieuse
    rating: 4.2,
    duration: "1h 41min",
  },
  {
    id: "film-008",
    title: "Cellule 7",
    creator: "Rachid Damari",
    category: "films",
    thumbnail: U("photo-1502899576159-f224dc2349fa"), // couloir sombre
    rating: 4.5,
    duration: "1h 52min",
    isNew: true,
  },
  {
    id: "film-009",
    title: "Brouillard Noir",
    creator: "Iris Wenger",
    category: "films",
    thumbnail: U("photo-1505739679850-7adfd87e8d97"), // ambiance noir mysterieuse
    rating: 4.6,
    duration: "1h 38min",
  },
]

// ─── PODCASTS (8) — 8 setups studio / micros / vinyles différents ───
export const V1_PODCASTS: V1Content[] = [
  {
    id: "pod-001",
    title: "Studio Sessions",
    creator: "Atelier Lumen",
    category: "podcasts",
    thumbnail: U("photo-1590602847861-f357a9332bbc"), // micro studio pro vintage
    rating: 4.8,
    duration: "12 episodes",
  },
  {
    id: "pod-002",
    title: "Paroles d'Or",
    creator: "Tanguy Lecomte",
    category: "podcasts",
    thumbnail: U("photo-1581368135153-a506cf13b1e1"), // micro doré classique
    rating: 4.5,
    duration: "Hebdo",
    isNew: true,
  },
  {
    id: "pod-003",
    title: "Voix du Studio",
    creator: "Lou Bricard",
    category: "podcasts",
    thumbnail: U("photo-1487180144351-b8472da7d491"), // casque audio close-up
    rating: 4.9,
    duration: "8 episodes",
  },
  {
    id: "pod-004",
    title: "Conversations Nocturnes",
    creator: "Rachid Damari",
    category: "podcasts",
    thumbnail: U("photo-1478737270239-2f02b77fc618"), // table de mixage neon
    rating: 4.7,
    duration: "Mensuel",
  },
  {
    id: "pod-005",
    title: "Le Cinquieme Mur",
    creator: "Compagnie Ardente",
    category: "podcasts",
    thumbnail: U("photo-1598488035139-bdbb2231ce04"), // micro fond rouge
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
  {
    id: "pod-007",
    title: "Onde Libre",
    creator: "Naima Tassan",
    category: "podcasts",
    thumbnail: U("photo-1493225457124-a3eb161ffa5f"), // platine vinyle
    rating: 4.6,
    duration: "14 episodes",
    isNew: true,
  },
  {
    id: "pod-008",
    title: "Le Bruit du Monde",
    creator: "Solange Devaux",
    category: "podcasts",
    thumbnail: U("photo-1505236858219-8359eb29e329"), // micro suspendu studio
    rating: 4.5,
    duration: "Bimensuel",
  },
]

// ─── LITTERATURE (8) — Romans, contes, journaux, blog, varies ───
export const V1_LIVRES: V1Content[] = [
  {
    id: "liv-001",
    title: "Recits du Soir",
    creator: "Emilie Roussel",
    category: "livres",
    thumbnail: U("photo-1544716278-ca5e3f4abd8c"),
    rating: 4.4,
    duration: "342 pages",
  },
  {
    id: "liv-002",
    title: "Le Royaume Endormi",
    creator: "Karim Bennali",
    category: "livres",
    thumbnail: U("photo-1535905557558-afc4877a26fc"),
    rating: 4.7,
    duration: "218 pages",
    isNew: true,
    tagline: "Conte fantastique",
  },
  {
    id: "liv-003",
    title: "Mots Precieux",
    creator: "Solange Devaux",
    category: "livres",
    thumbnail: U("photo-1532012197267-da84d127e765"),
    rating: 4.5,
    duration: "276 pages",
  },
  {
    id: "liv-004",
    title: "L'Echo du Quotidien",
    creator: "Theo Marchand",
    category: "livres",
    thumbnail: U("photo-1504711434969-e33886168f5c"),
    rating: 4.6,
    duration: "Hebdomadaire",
    tagline: "Journal & chroniques",
  },
  {
    id: "liv-005",
    title: "Cafe Litteraire",
    creator: "Naima Tassan",
    category: "livres",
    thumbnail: U("photo-1513001900722-370f803f498d"),
    rating: 4.8,
    duration: "302 pages",
    isNew: true,
  },
  {
    id: "liv-006",
    title: "Chroniques du Web",
    creator: "Karim Bennali",
    category: "livres",
    thumbnail: U("photo-1499750310107-5fef28a66643"),
    rating: 4.5,
    duration: "Blog hebdo",
    tagline: "Blog & essais",
  },
  {
    id: "liv-007",
    title: "Contes des Sept Ombres",
    creator: "Emilie Roussel",
    category: "livres",
    thumbnail: U("photo-1518709268805-4e9042af9f23"),
    rating: 4.6,
    duration: "188 pages",
    isNew: true,
    tagline: "Conte fantastique",
  },
  {
    id: "liv-008",
    title: "Carnets de l'Atlas",
    creator: "Solange Devaux",
    category: "livres",
    thumbnail: U("photo-1519682337058-a94d519337bc"),
    rating: 4.5,
    duration: "256 pages",
  },
]

export const V1_SECTIONS: Array<{ id: string; title: string; items: V1Content[] }> = [
  { id: "sect-films", title: "Films & Series", items: V1_FILMS },
  { id: "sect-podcasts", title: "Podcasts Populaires", items: V1_PODCASTS },
  { id: "sect-livres", title: "Litterature a Decouvrir", items: V1_LIVRES },
]
