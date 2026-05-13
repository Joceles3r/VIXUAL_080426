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
    thumbnail: U("photo-1518156677180-95a2893f3e9f"), // route nuit phares brouillard
    rating: 4.5,
    duration: "2h 12min",
    isNew: true,
  },
  {
    id: "film-003",
    title: "Le Dernier Témoin",
    category: "films",
    thumbnail: U("photo-1504893524553-b855bce32c67"), // paysage dramatique ciel orageux
    rating: 4.6,
    duration: "1h 47min",
  },
  {
    id: "film-004",
    title: "Échos du Passé",
    category: "films",
    thumbnail: U("photo-1509023464722-18d996393ca8"), // ciel nuages dramatiques sombre
    rating: 4.4,
    duration: "2h 04min",
  },
  {
    id: "film-005",
    title: "L'Inconnu",
    category: "films",
    thumbnail: U("photo-1507003211169-0a1dd7228f2d"), // portrait homme mystérieux
    rating: 4.8,
    duration: "1h 33min",
    isNew: true,
  },
  {
    id: "film-006",
    title: "Territoire Hostile",
    category: "films",
    thumbnail: U("photo-1469474968028-56623f02e42e"), // paysage montagne brume dramatique
    rating: 4.3,
    duration: "2h 21min",
  },
  {
    id: "film-007",
    title: "Dernier Souffle",
    category: "films",
    thumbnail: U("photo-1494500764479-0c8f2919a3d8"), // forêt brume mystérieuse
    rating: 4.5,
    duration: "1h 52min",
  },
  {
    id: "film-008",
    title: "Les Disparus",
    category: "films",
    thumbnail: U("photo-1470252649378-9c29740c9fa8"), // coucher soleil dramatique
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
    thumbnail: U("photo-1511671782779-c97d3d27a1d4"), // ambiance intime nuit musique
    rating: 4.9,
    duration: "Mensuel",
  },
  {
    id: "pod-002",
    title: "Histoires Vraies",
    category: "podcasts",
    thumbnail: U("photo-1516450360452-9312f5e86fc7"), // concert atmosphère live
    rating: 4.7,
    duration: "Hebdo",
    isNew: true,
  },
  {
    id: "pod-003",
    title: "Voix du Silence",
    category: "podcasts",
    thumbnail: U("photo-1493225457124-a3eb161ffa5f"), // scène concert dramatique
    rating: 4.6,
    duration: "12 episodes",
  },
  {
    id: "pod-004",
    title: "Enquêtes Criminelles",
    category: "podcasts",
    thumbnail: U("photo-1478737270239-2f02b77fc618"), // ambiance studio warm tones
    rating: 4.8,
    duration: "Bi-mensuel",
  },
  {
    id: "pod-005",
    title: "Le Cinquième Mur",
    category: "podcasts",
    thumbnail: U("photo-1507676184212-d03ab07a01bf"), // théâtre rideau rouge dramatique
    rating: 4.5,
    duration: "6 episodes",
  },
  {
    id: "pod-006",
    title: "Mystères Inexpliqués",
    category: "podcasts",
    thumbnail: U("photo-1419242902214-272b3f66ee7a"), // ciel étoilé mystère cosmos
    rating: 4.4,
    duration: "Hebdo",
    isNew: true,
  },
  {
    id: "pod-007",
    title: "Confessions",
    category: "podcasts",
    thumbnail: U("photo-1508700115892-45ecd05ae2ad"), // femme portrait artistique
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
    thumbnail: U("photo-1507842217343-583bb7270b66"), // bibliothèque majestueuse
    rating: 4.8,
    duration: "218 pages",
    isNew: true,
  },
  {
    id: "liv-003",
    title: "Le Royaume Endormi",
    category: "livres",
    thumbnail: U("photo-1516979187457-637abb4f9353"), // livres empilés atmosphérique
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
    thumbnail: U("photo-1495446815901-a7297e633e8d"), // livres café atmosphère
    rating: 4.8,
    duration: "302 pages",
  },
  {
    id: "liv-006",
    title: "Le Manuscrit",
    category: "livres",
    thumbnail: U("photo-1455885661740-29cbf08a42fa"), // vieux manuscrit mystérieux
    rating: 4.4,
    duration: "184 pages",
    isNew: true,
  },
  {
    id: "liv-007",
    title: "Lettres Perdues",
    category: "livres",
    thumbnail: U("photo-1481627834876-b7833e8f5570"), // bibliothèque couloir noble
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
