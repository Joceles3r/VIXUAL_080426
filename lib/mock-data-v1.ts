/**
 * MOCK DATA V1 — Catalogue homepage V1 cinéma premium.
 *
 * PATCH FINAL — STREAMING CINÉMA + SAVOIR & CULTURE
 * - Images narratives crédibles (scènes, ambiances, émotions)
 * - Aucune image "IA flashy", aucun cyberpunk, aucune image générique
 * - Style Netflix / Canal+ / Prime Video
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
const U_HERO = (id: string) => `https://images.unsplash.com/${id}?w=2400&h=1080&fit=crop&q=85&auto=format`

// ─── HERO — Thriller urbain narratif (Les Ombres de Marseille) ──────────
// Route brumeuse nocturne, phares dans la nuit — drame polar émotionnel.
// AUCUN cyberpunk, aucune néon agressif : ambiance cinéma crédible.
export const V1_FEATURED: V1Content = {
  id: "feat-001",
  title: "Les Ombres de Marseille",
  creator: "Camille Auriol",
  category: "films",
  thumbnail: U_HERO("photo-1518715308788-3005759c61d5"),
  duration: "1h 47min",
  rating: 4.8,
  tagline: "Un polar nocturne au coeur de la cite phoceenne. Sept nuits. Un secret. Une derniere chance.",
  supports: 1248,
}

// ─── FILMS & VIDEOS (8) — Thriller, drame, sci-fi, documentaire ──────────
// Images narratives crédibles : ambiances, paysages, univers, jamais studio.
export const V1_FILMS: V1Content[] = [
  {
    id: "film-001",
    title: "Nuit Eternelle",
    creator: "Yanis Bernal",
    category: "films",
    // Silhouette urbaine pluie nuit — drame contemporain
    thumbnail: U("photo-1485095329183-d0797cdc5676"),
    rating: 4.3,
    duration: "2h 12min",
    isNew: true,
    tagline: "Drame urbain",
  },
  {
    id: "film-002",
    title: "Le Mystere Rouge",
    creator: "Iris Wenger",
    category: "films",
    // Horloge ancienne lumière sombre — thriller temporel
    thumbnail: U("photo-1501139083538-0139583c060f"),
    rating: 4.6,
    duration: "1h 33min",
    tagline: "Thriller temporel",
  },
  {
    id: "film-003",
    title: "Lumieres Urbaines",
    creator: "Mehdi Tassan",
    category: "films",
    // Skyline urbain nocturne — documentaire ville
    thumbnail: U("photo-1519501025264-65ba15a82390"),
    rating: 4.5,
    duration: "1h 58min",
    tagline: "Documentaire urbain",
  },
  {
    id: "film-004",
    title: "Pluie de Verre",
    creator: "Soline Vasseur",
    category: "films",
    // Pluie sur vitre nuit — court-métrage intime
    thumbnail: U("photo-1534447677768-be436bb09401"),
    rating: 4.7,
    duration: "1h 26min",
    isNew: true,
    tagline: "Court-metrage",
  },
  {
    id: "film-005",
    title: "Pacte de Brume",
    creator: "Anouk Beriot",
    category: "films",
    // Forêt brumeuse mystique — drame mystère contemplatif
    thumbnail: U("photo-1502134249126-9f3755a50d78"),
    rating: 4.4,
    duration: "2h 04min",
    tagline: "Drame mystere",
  },
  {
    id: "film-006",
    title: "Decembre, 21h",
    creator: "Naima Tassan",
    category: "films",
    // Route campagne brouillard — polar rural
    thumbnail: U("photo-1500964757637-c85e8a162699"),
    rating: 4.2,
    duration: "1h 41min",
    tagline: "Drame",
  },
  {
    id: "film-007",
    title: "Cellule 7",
    creator: "Rachid Damari",
    category: "films",
    // Couloir béton sombre — drame carcéral
    thumbnail: U("photo-1542204165-65bf26472b9b"),
    rating: 4.5,
    duration: "1h 52min",
    isNew: true,
    tagline: "Thriller",
  },
  {
    id: "film-008",
    title: "Frontieres",
    creator: "Adele Romanov",
    category: "films",
    // Paysage froid montagne — drame social
    thumbnail: U("photo-1418065460487-3e41a6c84dc5"),
    rating: 4.6,
    duration: "1h 38min",
    tagline: "Drame social",
  },
]

// ─── PODCASTS (8) — Ambiances sonores, émotions, univers ─────────────────
// Aucun "micro générique" : on raconte un univers, une intimité.
export const V1_PODCASTS: V1Content[] = [
  {
    id: "pod-001",
    title: "Studio Sessions",
    creator: "Atelier Lumen",
    category: "podcasts",
    // Console de mixage ambiance dorée — coulisses studio
    thumbnail: U("photo-1598653222000-6b7b7a552625"),
    rating: 4.8,
    duration: "12 episodes",
    tagline: "Coulisses",
  },
  {
    id: "pod-002",
    title: "Paroles d'Or",
    creator: "Tanguy Lecomte",
    category: "podcasts",
    // Platine vinyle vintage chaude — nostalgie sonore
    thumbnail: U("photo-1507676184212-d03ab07a01bf"),
    rating: 4.5,
    duration: "Hebdo",
    isNew: true,
    tagline: "Recits intimes",
  },
  {
    id: "pod-003",
    title: "Voix du Studio",
    creator: "Lou Bricard",
    category: "podcasts",
    // Casque audio pro lumière chaude — immersion
    thumbnail: U("photo-1487180144351-b8472da7d491"),
    rating: 4.9,
    duration: "8 episodes",
    tagline: "Confessions",
  },
  {
    id: "pod-004",
    title: "Conversations Nocturnes",
    creator: "Rachid Damari",
    category: "podcasts",
    // Café fumant fenêtre nuit — intimité tardive
    thumbnail: U("photo-1497636577773-f1231844b336"),
    rating: 4.7,
    duration: "Mensuel",
    tagline: "Tard dans la nuit",
  },
  {
    id: "pod-005",
    title: "Le Cinquieme Mur",
    creator: "Compagnie Ardente",
    category: "podcasts",
    // Sièges théâtre rouge vide — univers scène
    thumbnail: U("photo-1503095396549-807759245b35"),
    rating: 4.4,
    duration: "6 episodes",
    isNew: true,
    tagline: "Univers scene",
  },
  {
    id: "pod-006",
    title: "Cartographie Intime",
    creator: "Lou Bricard",
    category: "podcasts",
    // Carte ancienne lumière chaude — voyages intérieurs
    thumbnail: U("photo-1524661135-423995f22d0b"),
    rating: 4.3,
    duration: "10 episodes",
    tagline: "Voyages interieurs",
  },
  {
    id: "pod-007",
    title: "Onde Libre",
    creator: "Naima Tassan",
    category: "podcasts",
    // Antenne radio montagne — liberté des ondes
    thumbnail: U("photo-1505739679850-7adcb5fb1d05"),
    rating: 4.6,
    duration: "14 episodes",
    isNew: true,
    tagline: "Voix libres",
  },
  {
    id: "pod-008",
    title: "Le Bruit du Monde",
    creator: "Solange Devaux",
    category: "podcasts",
    // Ville vue d'en haut nuit — soundscape urbain
    thumbnail: U("photo-1444723121867-7a241cacace9"),
    rating: 4.5,
    duration: "Bimensuel",
    tagline: "Sons du reel",
  },
]

// ─── LITTERATURE / ECRITS (8) — Ambiances lecture premium ────────────────
// Roman, récit, thriller littéraire, poésie. Lumière chaude, profondeur.
export const V1_LIVRES: V1Content[] = [
  {
    id: "liv-001",
    title: "Recits du Soir",
    creator: "Emilie Roussel",
    category: "livres",
    // Livre ouvert lampe chaude — lecture intime du soir
    thumbnail: U("photo-1544716278-ca5e3f4abd8c"),
    rating: 4.4,
    duration: "342 pages",
    tagline: "Roman",
  },
  {
    id: "liv-002",
    title: "Le Royaume Endormi",
    creator: "Karim Bennali",
    category: "livres",
    // Bibliothèque ancienne profonde — conte fantastique
    thumbnail: U("photo-1507842217343-583bb7270b66"),
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
    // Manuscrit plume encrier — poésie
    thumbnail: U("photo-1455390582262-044cdead277a"),
    rating: 4.5,
    duration: "276 pages",
    tagline: "Poesie",
  },
  {
    id: "liv-004",
    title: "L'Echo du Quotidien",
    creator: "Theo Marchand",
    category: "livres",
    // Carnet écriture bureau bois — chroniques
    thumbnail: U("photo-1456513080510-7bf3a84b82f8"),
    rating: 4.6,
    duration: "Hebdomadaire",
    tagline: "Chroniques",
  },
  {
    id: "liv-005",
    title: "Cafe Litteraire",
    creator: "Naima Tassan",
    category: "livres",
    // Tasse café livre lumière dorée — atmosphère lecture
    thumbnail: U("photo-1513001900722-370f803f498d"),
    rating: 4.8,
    duration: "302 pages",
    isNew: true,
    tagline: "Roman",
  },
  {
    id: "liv-006",
    title: "Pages Rouges",
    creator: "Karim Bennali",
    category: "livres",
    // Livre ouvert nature contemplatif — thriller littéraire
    thumbnail: U("photo-1495640388908-05fa85288e61"),
    rating: 4.5,
    duration: "184 pages",
    tagline: "Thriller litteraire",
  },
  {
    id: "liv-007",
    title: "Contes des Sept Ombres",
    creator: "Emilie Roussel",
    category: "livres",
    // Livres empilés vintage — contes nocturnes
    thumbnail: U("photo-1532012197267-da84d127e765"),
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
    // Carnet voyage cuir cartes — récit d'aventure
    thumbnail: U("photo-1519682337058-a94d519337bc"),
    rating: 4.5,
    duration: "256 pages",
    tagline: "Recit de voyage",
  },
]

// ─── SAVOIR & CULTURE (8) — Mini-séries documentaires immersives ─────────
// Univers de découverte JAMAIS scolaire : cinéma documentaire premium.
// Durée maximale 10 min/épisode, public jeune accessible via VIXUpoints.
export const V1_SAVOIR: V1Content[] = [
  {
    id: "sav-001",
    title: "Mysteres de l'Histoire",
    creator: "Collectif Lumiere",
    category: "savoir",
    // Temple ancien pierre dorée — archéologie cinéma
    thumbnail: U("photo-1539037116277-4db20889f2d4"),
    rating: 4.9,
    duration: "8 ep · 8min",
    isNew: true,
    tagline: "Mini-serie",
  },
  {
    id: "sav-002",
    title: "Civilisations Disparues",
    creator: "Rachid Damari",
    category: "savoir",
    // Ruines Maya jungle dorée — civilisations oubliées
    thumbnail: U("photo-1564769625392-651b2c4eaaf0"),
    rating: 4.7,
    duration: "12 ep · 9min",
    tagline: "Documentaire",
  },
  {
    id: "sav-003",
    title: "Science & Futur",
    creator: "Atelier Lumen",
    category: "savoir",
    // Nébuleuse cosmique profonde — astrophysique narrative
    thumbnail: U("photo-1462331940025-496dfbfc7564"),
    rating: 4.6,
    duration: "10 ep · 10min",
    isNew: true,
    tagline: "Cosmos & idees",
  },
  {
    id: "sav-004",
    title: "Comprendre le Numerique",
    creator: "Lou Bricard",
    category: "savoir",
    // Code lumineux bleu profond — vulgarisation tech
    thumbnail: U("photo-1518770660439-4636190af475"),
    rating: 4.5,
    duration: "6 ep · 7min",
    tagline: "Comprendre la tech",
  },
  {
    id: "sav-005",
    title: "Les Dangers des Reseaux",
    creator: "Naima Tassan",
    category: "savoir",
    // Silhouette dos écran sombre — vie numérique
    thumbnail: U("photo-1542435503-956c469947f6"),
    rating: 4.8,
    duration: "5 ep · 10min",
    isNew: true,
    tagline: "Vivre connecte",
  },
  {
    id: "sav-006",
    title: "Histoire du Cinema",
    creator: "Iris Wenger",
    category: "savoir",
    // Projecteur vintage faisceau chaud — patrimoine cinéma
    thumbnail: U("photo-1485846234645-a62644f84728"),
    rating: 4.7,
    duration: "14 ep · 9min",
    tagline: "Le 7e art",
  },
  {
    id: "sav-007",
    title: "Grandes Inventions",
    creator: "Theo Marchand",
    category: "savoir",
    // Atelier ancien outils — histoire des inventions
    thumbnail: U("photo-1453928582365-b6ad33cbcf64"),
    rating: 4.4,
    duration: "8 ep · 8min",
    tagline: "Genie humain",
  },
  {
    id: "sav-008",
    title: "Culture Generale Immersive",
    creator: "Collectif Lumiere",
    category: "savoir",
    // Galerie musée tableaux — culture immersive
    thumbnail: U("photo-1564399579883-451a5d44ec08"),
    rating: 4.6,
    duration: "15 ep · 6min",
    tagline: "Voyager dans le savoir",
  },
]

export const V1_SECTIONS: Array<{ id: string; title: string; items: V1Content[] }> = [
  { id: "sect-films", title: "Films & Videos", items: V1_FILMS },
  { id: "sect-podcasts", title: "Podcasts", items: V1_PODCASTS },
  { id: "sect-livres", title: "Litterature & Ecrits", items: V1_LIVRES },
]
