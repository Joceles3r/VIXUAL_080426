/**
 * MOCK DATA V1 — Catalogue streaming convaincant pour homepage V1.
 *
 * 25 contenus credibles repartis sur 5 categories (Films, Podcasts,
 * Documentaires, Livres, Creations originales) avec thumbnails Unsplash
 * (16:9 ratio, cinematique, premium).
 *
 * Utilise uniquement pour le rendu visuel de la homepage V1.
 * Les contenus reels viendront via la table `contents` une fois la
 * plateforme peuplee.
 */

export type V1Category = "films" | "podcasts" | "documentaires" | "livres" | "creations"

export interface V1Content {
  id: string
  title: string
  creator: string
  category: V1Category
  thumbnail: string
  duration: string
  isNew?: boolean
  isFeatured?: boolean
  tagline: string
  supports: number
}

// Unsplash URLs (libres de droits, format 16:9 optimise)
const U = (id: string) => `https://images.unsplash.com/${id}?w=800&h=450&fit=crop&q=80&auto=format`

export const V1_FEATURED: V1Content = {
  id: "feat-001",
  title: "Les Ombres de Marseille",
  creator: "Camille Auriol",
  category: "films",
  thumbnail: U("photo-1489599849927-2ee91cede3ba"),
  duration: "1h 47min",
  isFeatured: true,
  tagline: "Un polar nocturne au coeur de la cite phoceenne. Sept nuits. Un secret. Une derniere chance.",
  supports: 1248,
}

export const V1_FILMS: V1Content[] = [
  {
    id: "film-002",
    title: "La Ligne du Sud",
    creator: "Yanis Bernal",
    category: "films",
    thumbnail: U("photo-1518929458119-e5bf444c30f4"),
    duration: "2h 12min",
    isNew: true,
    tagline: "Road-movie d'auteur entre Toulouse et Tanger.",
    supports: 892,
  },
  {
    id: "film-003",
    title: "Reverberation",
    creator: "Iris Wenger",
    category: "films",
    thumbnail: U("photo-1485846234645-a62644f84728"),
    duration: "1h 33min",
    tagline: "Quand le son devient memoire.",
    supports: 567,
  },
  {
    id: "film-004",
    title: "Decembre, 21h",
    creator: "Mehdi Tassan",
    category: "films",
    thumbnail: U("photo-1440404653325-ab127d49abc1"),
    duration: "1h 58min",
    tagline: "Chronique d'un dernier reveillon.",
    supports: 1124,
  },
  {
    id: "film-005",
    title: "Le Bruit des Couleurs",
    creator: "Soline Vasseur",
    category: "films",
    thumbnail: U("photo-1478720568477-152d9b164e26"),
    duration: "1h 26min",
    isNew: true,
    tagline: "Une synesthete face au silence.",
    supports: 412,
  },
]

export const V1_PODCASTS: V1Content[] = [
  {
    id: "pod-001",
    title: "Fragments — voix d'ailleurs",
    creator: "Atelier Lumen",
    category: "podcasts",
    thumbnail: U("photo-1478737270239-2f02b77fc618"),
    duration: "12 episodes",
    tagline: "Recits sonores de l'exil contemporain.",
    supports: 2104,
  },
  {
    id: "pod-002",
    title: "L'Heure Bleue",
    creator: "Tanguy Lecomte",
    category: "podcasts",
    thumbnail: U("photo-1590602847861-f357a9332bbc"),
    duration: "Hebdo",
    isNew: true,
    tagline: "Entretiens nocturnes avec des artistes francophones.",
    supports: 1789,
  },
  {
    id: "pod-003",
    title: "Cartographie intime",
    creator: "Lou Bricard",
    category: "podcasts",
    thumbnail: U("photo-1505236858219-8359eb29e329"),
    duration: "8 episodes",
    tagline: "La memoire des lieux qu'on quitte.",
    supports: 934,
  },
  {
    id: "pod-004",
    title: "Onde courte",
    creator: "Rachid Damari",
    category: "podcasts",
    thumbnail: U("photo-1493225457124-a3eb161ffa5f"),
    duration: "Mensuel",
    tagline: "Sciences et incertitudes, avec ceux qui doutent.",
    supports: 1567,
  },
  {
    id: "pod-005",
    title: "Le Cinquieme Mur",
    creator: "Compagnie Ardente",
    category: "podcasts",
    thumbnail: U("photo-1507676184212-d03ab07a01bf"),
    duration: "6 episodes",
    isNew: true,
    tagline: "Le theatre raconte par ses artisans.",
    supports: 678,
  },
]

export const V1_DOCS: V1Content[] = [
  {
    id: "doc-001",
    title: "Mediterranee — derniere generation",
    creator: "Studio Halage",
    category: "documentaires",
    thumbnail: U("photo-1505142468610-359e7d316be0"),
    duration: "52min",
    isNew: true,
    tagline: "Pecheurs et climat sur la cote provencale.",
    supports: 1432,
  },
  {
    id: "doc-002",
    title: "Sous les arbres centenaires",
    creator: "Anais Bellier",
    category: "documentaires",
    thumbnail: U("photo-1448375240586-882707db888b"),
    duration: "1h 18min",
    tagline: "La foret de Verdun, 100 ans apres.",
    supports: 987,
  },
  {
    id: "doc-003",
    title: "Le travail invisible",
    creator: "Collectif Frequence",
    category: "documentaires",
    thumbnail: U("photo-1497366216548-37526070297c"),
    duration: "44min",
    tagline: "Celles et ceux qui font tourner la nuit.",
    supports: 1689,
  },
  {
    id: "doc-004",
    title: "Acheres, depot 7",
    creator: "Hugo Verrier",
    category: "documentaires",
    thumbnail: U("photo-1474314881477-04c4aac40a0e"),
    duration: "1h 02min",
    tagline: "Trois mois dans un centre de tri postal.",
    supports: 543,
  },
  {
    id: "doc-005",
    title: "Briancon, 1300m",
    creator: "Studio Halage",
    category: "documentaires",
    thumbnail: U("photo-1551632811-561732d1e306"),
    duration: "58min",
    isNew: true,
    tagline: "Une vallee, un hiver, des refugies.",
    supports: 2031,
  },
]

export const V1_LIVRES: V1Content[] = [
  {
    id: "liv-001",
    title: "Les Quais d'Anvers",
    creator: "Emilie Roussel",
    category: "livres",
    thumbnail: U("photo-1495446815901-a7297e633e8d"),
    duration: "342 pages",
    tagline: "Roman noir flamand. Prix Decouverte 2025.",
    supports: 1245,
  },
  {
    id: "liv-002",
    title: "Carnets de l'Atlas",
    creator: "Karim Bennali",
    category: "livres",
    thumbnail: U("photo-1519682337058-a94d519337bc"),
    duration: "218 pages",
    isNew: true,
    tagline: "Recit de voyage poetique au coeur du Haut Atlas.",
    supports: 867,
  },
  {
    id: "liv-003",
    title: "Avant la maree",
    creator: "Solange Devaux",
    category: "livres",
    thumbnail: U("photo-1481627834876-b7833e8f5570"),
    duration: "276 pages",
    tagline: "Une saga familiale bretonne sur trois generations.",
    supports: 1567,
  },
  {
    id: "liv-004",
    title: "Le langage des fougeres",
    creator: "Theo Marchand",
    category: "livres",
    thumbnail: U("photo-1532012197267-da84d127e765"),
    duration: "184 pages",
    tagline: "Essai sur la botanique et le silence.",
    supports: 423,
  },
  {
    id: "liv-005",
    title: "Quartier des Lumieres",
    creator: "Naima Tassan",
    category: "livres",
    thumbnail: U("photo-1524995997946-a1c2e315a42f"),
    duration: "302 pages",
    isNew: true,
    tagline: "Premier roman. La banlieue est lyonnaise.",
    supports: 789,
  },
]

export const V1_CREATIONS: V1Content[] = [
  {
    id: "cre-001",
    title: "Sequence Lumiere",
    creator: "Atelier Reverse",
    category: "creations",
    thumbnail: U("photo-1518709268805-4e9042af2176"),
    duration: "Serie photo",
    tagline: "Photographies argentiques de la Drome.",
    supports: 612,
  },
  {
    id: "cre-002",
    title: "Geometries lentes",
    creator: "Joana Bertrand",
    category: "creations",
    thumbnail: U("photo-1502945015378-0e284ca1a5be"),
    duration: "Animation",
    isNew: true,
    tagline: "Cycle d'animations dessinees a la main.",
    supports: 1098,
  },
  {
    id: "cre-003",
    title: "Pieces pour 4 mains",
    creator: "Duo Aris",
    category: "creations",
    thumbnail: U("photo-1465847899084-d164df4dedc6"),
    duration: "EP musical",
    tagline: "Piano et violoncelle, compositions originales.",
    supports: 754,
  },
  {
    id: "cre-004",
    title: "Cartographies imaginaires",
    creator: "Vincent Hure",
    category: "creations",
    thumbnail: U("photo-1524661135-423995f22d0b"),
    duration: "Collection",
    tagline: "Cartes dessinees a l'encre de villes inventees.",
    supports: 489,
  },
  {
    id: "cre-005",
    title: "Le souffle de la pierre",
    creator: "Atelier Cetia",
    category: "creations",
    thumbnail: U("photo-1582294746991-c7f8e3a8e44e"),
    duration: "Sculpture",
    isNew: true,
    tagline: "Sculptures contemporaines en pierre calcaire.",
    supports: 856,
  },
]

export const V1_ROWS: Array<{ id: string; title: string; subtitle: string; items: V1Content[] }> = [
  {
    id: "row-tendances",
    title: "Tendances de la semaine",
    subtitle: "Les soutiens qui montent",
    items: [V1_FILMS[0], V1_PODCASTS[1], V1_DOCS[4], V1_LIVRES[2], V1_FILMS[3], V1_CREATIONS[1]],
  },
  {
    id: "row-films",
    title: "Films & creations cinematographiques",
    subtitle: "Recits longs, regards d'auteurs",
    items: V1_FILMS,
  },
  {
    id: "row-podcasts",
    title: "Podcasts a decouvrir",
    subtitle: "Voix, recits, conversations",
    items: V1_PODCASTS,
  },
  {
    id: "row-docs",
    title: "Documentaires",
    subtitle: "Le reel raconte autrement",
    items: V1_DOCS,
  },
  {
    id: "row-livres",
    title: "Livres & ecrits",
    subtitle: "Litterature independante francophone",
    items: V1_LIVRES,
  },
  {
    id: "row-creations",
    title: "Creations originales",
    subtitle: "Photographie, musique, animation, sculpture",
    items: V1_CREATIONS,
  },
]
