/**
 * MOCK DATA V1 — Catalogue homepage V1 thématique cinéma premium.
 *
 * PATCH CINE-STREAMING + SAVOIR & CULTURE
 * - Images réalistes, cinématographiques, contrastées (style Netflix/Canal+)
 * - Moins "IA", moins fluo, plus documentaire/fiction/studio
 * - Nouvelle section "Explorer • Savoir & Culture" (8 contenus)
 */

export type V1Category = "films" | "podcasts" | "livres" | "savoir"

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

// ─── HERO : rue nocturne réaliste, lumière cinéma, ambiance polar / film noir ───
export const V1_FEATURED: V1Content = {
  id: "feat-001",
  title: "Les Ombres de Marseille",
  creator: "Camille Auriol",
  category: "films",
  thumbnail: U_HERO("photo-1494548162494-384bba4ab999"), // rue sombre nuit urbaine réaliste
  duration: "1h 47min",
  rating: 4.8,
  tagline: "Un polar nocturne au coeur de la cite phoceenne. Sept nuits. Un secret. Une derniere chance.",
  supports: 1248,
}

// ─── FILMS & VIDEOS (8) — Réalistes, cinématographiques, documentaires, drames ───
export const V1_FILMS: V1Content[] = [
  {
    id: "film-001",
    title: "Nuit Eternelle",
    creator: "Yanis Bernal",
    category: "films",
    thumbnail: U("photo-1536440136628-849c177e76a1"), // salle cinema sombre réaliste
    rating: 4.3,
    duration: "2h 12min",
    isNew: true,
    tagline: "Drame",
  },
  {
    id: "film-002",
    title: "Le Mystere Rouge",
    creator: "Iris Wenger",
    category: "films",
    thumbnail: U("photo-1489599849927-2ee91cede3ba"), // cinema nocturne néons réalistes
    rating: 4.6,
    duration: "1h 33min",
    tagline: "Thriller",
  },
  {
    id: "film-003",
    title: "Lumieres Urbaines",
    creator: "Mehdi Tassan",
    category: "films",
    thumbnail: U("photo-1477959858617-67f85cf4f1df"), // ville nuit skyline réaliste
    rating: 4.5,
    duration: "1h 58min",
    tagline: "Documentaire",
  },
  {
    id: "film-004",
    title: "Pluie de Verre",
    creator: "Soline Vasseur",
    category: "films",
    thumbnail: U("photo-1534447677768-be436bb09401"), // pluie vitre urbain réaliste
    rating: 4.7,
    duration: "1h 26min",
    isNew: true,
    tagline: "Court-metrage",
  },
  {
    id: "film-005",
    title: "Reverberation",
    creator: "Theo Marchand",
    category: "films",
    thumbnail: U("photo-1485846234645-a62644f84728"), // tournage équipe cinema lumière chaude
    rating: 4.4,
    duration: "2h 04min",
    tagline: "Making-of",
  },
  {
    id: "film-006",
    title: "Decembre, 21h",
    creator: "Naima Tassan",
    category: "films",
    thumbnail: U("photo-1517604931442-7e0c8ed2963c"), // salle projection cinema classique
    rating: 4.2,
    duration: "1h 41min",
    tagline: "Drame",
  },
  {
    id: "film-007",
    title: "Cellule 7",
    creator: "Rachid Damari",
    category: "films",
    thumbnail: U("photo-1507003211169-0a1dd7228f2d"), // portrait homme lumière cinema
    rating: 4.5,
    duration: "1h 52min",
    isNew: true,
    tagline: "Thriller",
  },
  {
    id: "film-008",
    title: "Brouillard Noir",
    creator: "Iris Wenger",
    category: "films",
    thumbnail: U("photo-1506905925346-21bda4d32df4"), // paysage brumeux montagne documentaire
    rating: 4.6,
    duration: "1h 38min",
    tagline: "Documentaire",
  },
]

// ─── PODCASTS (8) — Studios audio sombres, micros pro, ambiances intimes ───
export const V1_PODCASTS: V1Content[] = [
  {
    id: "pod-001",
    title: "Studio Sessions",
    creator: "Atelier Lumen",
    category: "podcasts",
    thumbnail: U("photo-1598488035139-bdbb2231ce04"), // micro studio professionnel sombre
    rating: 4.8,
    duration: "12 episodes",
  },
  {
    id: "pod-002",
    title: "Paroles d'Or",
    creator: "Tanguy Lecomte",
    category: "podcasts",
    thumbnail: U("photo-1589903308904-1010c2294adc"), // animateur studio radio moderne
    rating: 4.5,
    duration: "Hebdo",
    isNew: true,
  },
  {
    id: "pod-003",
    title: "Voix du Studio",
    creator: "Lou Bricard",
    category: "podcasts",
    thumbnail: U("photo-1478737270239-2f02b77fc618"), // console mixage studio ambiance
    rating: 4.9,
    duration: "8 episodes",
  },
  {
    id: "pod-004",
    title: "Conversations Nocturnes",
    creator: "Rachid Damari",
    category: "podcasts",
    thumbnail: U("photo-1590602847861-f357a9332bbc"), // micro vintage lumière douce
    rating: 4.7,
    duration: "Mensuel",
  },
  {
    id: "pod-005",
    title: "Le Cinquieme Mur",
    creator: "Compagnie Ardente",
    category: "podcasts",
    thumbnail: U("photo-1511671782779-c97d3d27a1d4"), // casque audio pro studio
    rating: 4.4,
    duration: "6 episodes",
    isNew: true,
  },
  {
    id: "pod-006",
    title: "Cartographie Intime",
    creator: "Lou Bricard",
    category: "podcasts",
    thumbnail: U("photo-1571330735066-03aaa9429d89"), // onde sonore studio équipement
    rating: 4.3,
    duration: "10 episodes",
  },
  {
    id: "pod-007",
    title: "Onde Libre",
    creator: "Naima Tassan",
    category: "podcasts",
    thumbnail: U("photo-1524678606370-a47ad25cb82a"), // micro suspendu studio pro
    rating: 4.6,
    duration: "14 episodes",
    isNew: true,
  },
  {
    id: "pod-008",
    title: "Le Bruit du Monde",
    creator: "Solange Devaux",
    category: "podcasts",
    thumbnail: U("photo-1558403194-611308249627"), // setup podcast bureau minimaliste
    rating: 4.5,
    duration: "Bimensuel",
  },
]

// ─── LITTERATURE / ECRITS (8) — Livres, manuscrits, bureaux, lumière cinema ───
export const V1_LIVRES: V1Content[] = [
  {
    id: "liv-001",
    title: "Recits du Soir",
    creator: "Emilie Roussel",
    category: "livres",
    thumbnail: U("photo-1544716278-ca5e3f4abd8c"), // livre ouvert lumière chaude
    rating: 4.4,
    duration: "342 pages",
    tagline: "Roman",
  },
  {
    id: "liv-002",
    title: "Le Royaume Endormi",
    creator: "Karim Bennali",
    category: "livres",
    thumbnail: U("photo-1507842217343-583bb7270b66"), // bibliotheque moderne profonde
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
    thumbnail: U("photo-1456513080510-7bf3a84b82f8"), // manuscrit bureau sombre
    rating: 4.5,
    duration: "276 pages",
    tagline: "Poesie",
  },
  {
    id: "liv-004",
    title: "L'Echo du Quotidien",
    creator: "Theo Marchand",
    category: "livres",
    thumbnail: U("photo-1471107340929-a87cd0f5b5f3"), // journal papier lumiere naturelle
    rating: 4.6,
    duration: "Hebdomadaire",
    tagline: "Chroniques",
  },
  {
    id: "liv-005",
    title: "Cafe Litteraire",
    creator: "Naima Tassan",
    category: "livres",
    thumbnail: U("photo-1513001900722-370f803f498d"), // livre cafe ambiance
    rating: 4.8,
    duration: "302 pages",
    isNew: true,
    tagline: "Roman",
  },
  {
    id: "liv-006",
    title: "Chroniques du Web",
    creator: "Karim Bennali",
    category: "livres",
    thumbnail: U("photo-1499750310107-5fef28a66643"), // laptop ecriture moderne
    rating: 4.5,
    duration: "Blog hebdo",
    tagline: "Essais",
  },
  {
    id: "liv-007",
    title: "Contes des Sept Ombres",
    creator: "Emilie Roussel",
    category: "livres",
    thumbnail: U("photo-1532012197267-da84d127e765"), // livres empiles classique
    rating: 4.6,
    duration: "188 pages",
    isNew: true,
    tagline: "Conte",
  },
  {
    id: "liv-008",
    title: "Carnets de l'Atlas",
    creator: "Solange Devaux",
    category: "livres",
    thumbnail: U("photo-1519682337058-a94d519337bc"), // carnet voyage cuir
    rating: 4.5,
    duration: "256 pages",
    tagline: "Recit",
  },
]

// ─── SAVOIR & CULTURE (8) — Mini-series, documentaires, contenus immersifs ───
export const V1_SAVOIR: V1Content[] = [
  {
    id: "sav-001",
    title: "Mysteres de l'Histoire",
    creator: "Collectif Lumiere",
    category: "savoir",
    thumbnail: U("photo-1461360370896-922624d12a74"), // archives historiques lumiere cinema
    rating: 4.9,
    duration: "8 episodes",
    isNew: true,
    tagline: "Mini-serie",
  },
  {
    id: "sav-002",
    title: "Civilisations Disparues",
    creator: "Rachid Damari",
    category: "savoir",
    thumbnail: U("photo-1539650116574-8efeb43e2750"), // ruines anciennes lumiere doree
    rating: 4.7,
    duration: "12 episodes",
    tagline: "Documentaire",
  },
  {
    id: "sav-003",
    title: "Science & Futur",
    creator: "Atelier Lumen",
    category: "savoir",
    thumbnail: U("photo-1507413245164-6160d8298b31"), // laboratoire scientifique moderne
    rating: 4.6,
    duration: "10 episodes",
    isNew: true,
    tagline: "Vulgarisation",
  },
  {
    id: "sav-004",
    title: "Comprendre le Numerique",
    creator: "Lou Bricard",
    category: "savoir",
    thumbnail: U("photo-1518770660439-4636190af475"), // technologie circuits lumiere bleue
    rating: 4.5,
    duration: "6 episodes",
    tagline: "Education",
  },
  {
    id: "sav-005",
    title: "Les Dangers des Reseaux",
    creator: "Naima Tassan",
    category: "savoir",
    thumbnail: U("photo-1563986768609-322da13575f0"), // smartphone ecran sombre
    rating: 4.8,
    duration: "5 episodes",
    isNew: true,
    tagline: "Sensibilisation",
  },
  {
    id: "sav-006",
    title: "Histoire du Cinema",
    creator: "Iris Wenger",
    category: "savoir",
    thumbnail: U("photo-1440404653325-ab127d49abc1"), // projecteur cinema vintage
    rating: 4.7,
    duration: "14 episodes",
    tagline: "Documentaire",
  },
  {
    id: "sav-007",
    title: "Grandes Inventions",
    creator: "Theo Marchand",
    category: "savoir",
    thumbnail: U("photo-1581091226825-a6a2a5aee158"), // invention machine lumiere studio
    rating: 4.4,
    duration: "8 episodes",
    tagline: "Vulgarisation",
  },
  {
    id: "sav-008",
    title: "Culture Generale Immersive",
    creator: "Collectif Lumiere",
    category: "savoir",
    thumbnail: U("photo-1481627834876-b7833e8f5570"), // bibliotheque immense lumiere
    rating: 4.6,
    duration: "20 episodes",
    tagline: "Quiz & Decouverte",
  },
]

export const V1_SECTIONS: Array<{ id: string; title: string; items: V1Content[] }> = [
  { id: "sect-films", title: "Films & Videos", items: V1_FILMS },
  { id: "sect-podcasts", title: "Podcasts", items: V1_PODCASTS },
  { id: "sect-livres", title: "Litterature & Ecrits", items: V1_LIVRES },
]
