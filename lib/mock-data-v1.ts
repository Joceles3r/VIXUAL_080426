/**
 * MOCK DATA V1 — Catalogue homepage streaming premium.
 *
 * Format : thumbnails portrait 2:3 (affiche cinema)
 * 3 sections + 1 ligne categories Savoir & Culture
 * Images Unsplash narratives / emotionnelles (zéro placeholder IA).
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

// ─── HERO : Les Ombres de Minuit (thriller urbain atmosphérique) ───
export const V1_FEATURED = {
  id: "feat-001",
  title: "Les Ombres de Minuit",
  year: "2026",
  duration: "2h 15min",
  genres: ["Thriller", "Crime", "Mystère"],
  rating: 4.8,
  description:
    "Dans une ville plongée dans l'obscurité, un détective doit résoudre une série de mystères avant qu'il ne soit trop tard. Une production cinématographique époustouflante qui redéfinit le thriller moderne.",
  thumbnail: U_HERO("photo-1519501025264-65ba15a82390"), // ville nocturne skyline dramatique
}

// ─── FILMS & VIDÉOS — Univers narratifs crédibles (thriller/drame/mystère) ───
export const V1_FILMS: V1Content[] = [
  {
    id: "film-001",
    title: "Silhouettes",
    category: "films",
    thumbnail: U("photo-1534430480872-3498386e7856"), // silhouette homme fenêtre dramatique
    rating: 4.7,
    duration: "1h 58min",
  },
  {
    id: "film-002",
    title: "Nuit Sans Fin",
    category: "films",
    thumbnail: U("photo-1517604931442-7e0c8ed2963c"), // ruelle nocturne pluie cinematique
    rating: 4.5,
    duration: "2h 12min",
    isNew: true,
  },
  {
    id: "film-003",
    title: "Le Dernier Témoin",
    category: "films",
    thumbnail: U("photo-1485846234645-a62644f84728"), // neon rouge "CINEMA" nuit
    rating: 4.6,
    duration: "1h 47min",
  },
  {
    id: "film-004",
    title: "Échos du Passé",
    category: "films",
    thumbnail: U("photo-1568667256549-094345857637"), // portrait noir blanc dramatique homme
    rating: 4.4,
    duration: "2h 04min",
  },
  {
    id: "film-005",
    title: "L'Inconnu",
    category: "films",
    thumbnail: U("photo-1542204165-65bf26472b9b"), // homme silhouette imper film noir
    rating: 4.8,
    duration: "1h 33min",
    isNew: true,
  },
  {
    id: "film-006",
    title: "Territoire Hostile",
    category: "films",
    thumbnail: U("photo-1574267432553-4b4628081c31"), // homme dos foule action thriller
    rating: 4.3,
    duration: "2h 21min",
  },
  {
    id: "film-007",
    title: "Dernier Souffle",
    category: "films",
    thumbnail: U("photo-1490810194309-344b3661ba39"), // homme noir blanc fumee chapeau noir
    rating: 4.5,
    duration: "1h 52min",
  },
  {
    id: "film-008",
    title: "Les Disparus",
    category: "films",
    thumbnail: U("photo-1551269901-5c5e14c25df7"), // silhouette néons verts mystere
    rating: 4.6,
    duration: "2h 08min",
  },
]

// ─── PODCASTS — Ambiances / émotions / storytelling (pas juste des micros) ───
export const V1_PODCASTS: V1Content[] = [
  {
    id: "pod-001",
    title: "Conversations Nocturnes",
    category: "podcasts",
    thumbnail: U("photo-1590602847861-f357a9332bbc"), // micro condensateur studio bleu nuit
    rating: 4.9,
    duration: "Mensuel",
  },
  {
    id: "pod-002",
    title: "Histoires Vraies",
    category: "podcasts",
    thumbnail: U("photo-1505236858219-8359eb29e329"), // micro vintage dore broadcast retro
    rating: 4.7,
    duration: "Hebdo",
    isNew: true,
  },
  {
    id: "pod-003",
    title: "Voix du Silence",
    category: "podcasts",
    thumbnail: U("photo-1487180144351-b8472da7d491"), // homme casque studio podcast pro
    rating: 4.6,
    duration: "12 episodes",
  },
  {
    id: "pod-004",
    title: "Enquêtes Criminelles",
    category: "podcasts",
    thumbnail: U("photo-1556761175-5973dc0f32e7"), // bureau enquete journal cafe ambiance
    rating: 4.8,
    duration: "Bi-mensuel",
  },
  {
    id: "pod-005",
    title: "Le Cinquième Mur",
    category: "podcasts",
    thumbnail: U("photo-1598488035139-bdbb2231ce04"), // micro fond rouge theatre
    rating: 4.5,
    duration: "6 episodes",
  },
  {
    id: "pod-006",
    title: "Mystères Inexpliqués",
    category: "podcasts",
    thumbnail: U("photo-1581368135153-a506cf13b1e1"), // micro vintage cuivre ambient
    rating: 4.4,
    duration: "Hebdo",
    isNew: true,
  },
  {
    id: "pod-007",
    title: "Confessions",
    category: "podcasts",
    thumbnail: U("photo-1598653222000-6b7b7a552625"), // micro studio bleu indigo profond
    rating: 4.6,
    duration: "10 episodes",
  },
]

// ─── LITTÉRATURE — Ambiance lecture premium / noble / cinéma ───
export const V1_LIVRES: V1Content[] = [
  {
    id: "liv-001",
    title: "Récits du Soir",
    category: "livres",
    thumbnail: U("photo-1544716278-ca5e3f4abd8c"), // livre ouvert lampe chaude
    rating: 4.7,
    duration: "342 pages",
  },
  {
    id: "liv-002",
    title: "Bibliothèque Secrète",
    category: "livres",
    thumbnail: U("photo-1457369804613-52c61a468e7d"), // kindle livre cosy ambiance hivernale
    rating: 4.8,
    duration: "218 pages",
    isNew: true,
  },
  {
    id: "liv-003",
    title: "Le Royaume Endormi",
    category: "livres",
    thumbnail: U("photo-1535905557558-afc4877a26fc"), // foret brume conte fantastique
    rating: 4.6,
    duration: "284 pages",
    tagline: "Conte fantastique",
  },
  {
    id: "liv-004",
    title: "Carnets d'Ailleurs",
    category: "livres",
    thumbnail: U("photo-1519682337058-a94d519337bc"), // carnet de voyage authentique
    rating: 4.5,
    duration: "196 pages",
  },
  {
    id: "liv-005",
    title: "Café Littéraire",
    category: "livres",
    thumbnail: U("photo-1513001900722-370f803f498d"), // livre tasse cafe lecture matinale
    rating: 4.8,
    duration: "302 pages",
  },
  {
    id: "liv-006",
    title: "Le Manuscrit",
    category: "livres",
    thumbnail: U("photo-1532012197267-da84d127e765"), // vieux livres relies cuir bibliotheque
    rating: 4.4,
    duration: "184 pages",
    isNew: true,
  },
  {
    id: "liv-007",
    title: "Lettres Perdues",
    category: "livres",
    thumbnail: U("photo-1455390582262-044cdead277a"), // plume encre vieux papier ecriture
    rating: 4.6,
    duration: "256 pages",
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

// ─── SAVOIR & CULTURE — Cartes immersives documentaires (style Netflix doc) ───
export interface V1SavoirCard {
  id: string
  title: string
  tagline: string
  thumbnail: string
  iconKey: "landmark" | "rocket" | "globe" | "brain" | "film" | "users" | "lightbulb"
  duration: string // toujours <= 10 min
}

export const V1_SAVOIR_CULTURE: V1SavoirCard[] = [
  {
    id: "sav-001",
    title: "Mystères de l'Histoire",
    tagline: "Les énigmes oubliées du passé",
    thumbnail: U("photo-1564399579883-451a5d44ec08"), // temple ancien dramatique
    iconKey: "landmark",
    duration: "8 min",
  },
  {
    id: "sav-002",
    title: "Science & Futur",
    tagline: "Comprendre les inventions qui changent le monde",
    thumbnail: U("photo-1465101046530-73398c7f28ca"), // espace cosmos étoiles
    iconKey: "rocket",
    duration: "7 min",
  },
  {
    id: "sav-003",
    title: "Civilisations Disparues",
    tagline: "Voyage au cœur des cultures oubliées",
    thumbnail: U("photo-1539650116574-75c0c6d73f6e"), // ruines antiques majestueuses
    iconKey: "globe",
    duration: "9 min",
  },
  {
    id: "sav-004",
    title: "Comprendre Internet",
    tagline: "Décrypter le monde numérique en clair",
    thumbnail: U("photo-1518770660439-4636190af475"), // circuits électroniques sombres
    iconKey: "lightbulb",
    duration: "6 min",
  },
  {
    id: "sav-005",
    title: "Les Dangers des Réseaux Toxiques",
    tagline: "Protéger les jeunes du scroll toxique",
    thumbnail: U("photo-1611532736597-de2d4265fba3"), // silhouette devant écran nuit
    iconKey: "users",
    duration: "10 min",
  },
  {
    id: "sav-006",
    title: "Histoire du Cinéma",
    tagline: "Des frères Lumière à l'ère numérique",
    thumbnail: U("photo-1485846234645-a62644f84728"), // projecteur cinéma vintage
    iconKey: "film",
    duration: "9 min",
  },
  {
    id: "sav-007",
    title: "Grandes Idées qui ont Changé le Monde",
    tagline: "Philosophie & société en immersion",
    thumbnail: U("photo-1488646953014-85cb44e25828"), // bibliothèque ancienne pensée
    iconKey: "brain",
    duration: "8 min",
  },
]
