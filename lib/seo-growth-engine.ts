/**
 * VIXUAL SEO + SOCIAL GROWTH ENGINE
 * Moteur combine de croissance organique pour VIXUAL
 * 
 * Sous-moteurs:
 * 1. SEO Engine - Acquisition via recherche organique
 * 2. Social Engine - Transformation en contenus partageables
 * 3. Viral Reward Engine - Recompenses pour partages utiles
 * 
 * Slogan officiel: VIXUAL — Regarde-Participe-Gagne
 */

// ─── Types ───

export type SocialSource = "instagram" | "tiktok" | "facebook" | "x" | "linkedin" | "youtube" | "other"
export type SeoStatus = "pending" | "approved" | "rejected"
export type ShareStatus = "valid" | "pending" | "blocked"
export type PageType = "guide" | "comparatif" | "categorie" | "landing" | "faq"
export type TargetProfile = "createur" | "contributeur" | "public"

export interface SeoSuggestion {
  id: string
  title: string
  description: string
  metaDescription: string
  keywords: string[]
  pageType: PageType
  targetProfile: TargetProfile
  structure: {
    h1: string
    h2: string[]
    h3: string[]
  }
  content: string
  score: number // Score SEO sur 100
  status: SeoStatus
  createdAt: Date
  approvedAt?: Date
  approvedBy?: string
}

export interface SocialShare {
  id: string
  userId: string
  projectId: string
  source: SocialSource
  trackingUrl: string
  clicks: number
  uniqueClicks: number
  signups: number
  conversions: number
  rewardVixupoints: number
  status: ShareStatus
  createdAt: Date
}

export interface SocialAsset {
  id: string
  projectId: string
  type: "square" | "portrait" | "landscape" | "citation" | "extrait_audio" | "extrait_video" | "cta"
  title: string
  description: string
  hashtags: string[]
  imageUrl?: string
  shortText: string
  longText: string
}

export interface SeoMetrics {
  totalTraffic: number
  weeklyTraffic: number
  monthlyTraffic: number
  newUsersViaSeo: number
  conversionRate: number
  topKeywords: { keyword: string; clicks: number; position: number }[]
  topPages: { path: string; views: number; bounceRate: number }[]
}

export interface SocialMetrics {
  totalShares: number
  totalClicks: number
  uniqueVisitors: number
  signupsGenerated: number
  conversions: number
  vixupointsDistributed: number
  topSharers: { userId: string; shares: number; conversions: number }[]
  bySource: Record<SocialSource, { shares: number; clicks: number; conversions: number }>
}

export interface GrowthScore {
  overall: number // Score global sur 100
  seo: number
  social: number
  engagement: number
  quality: number
}

// ─── Constantes ───

/** Bareme des recompenses VIXUpoints pour partages */
export const SHARE_REWARDS = {
  shareValid: 5,        // Partage valide
  clickQualified: 10,   // Clic qualifie
  signupGenerated: 30,  // Inscription generee
  conversionConfirmed: 50, // Participation confirmee
} as const

/** Limites anti-abus */
export const SHARE_LIMITS = {
  dailySharesMax: 10,
  weeklySharesMax: 50,
  minDelayBetweenRewards: 60 * 1000, // 1 minute
  maxRewardsPerDay: 200, // VIXUpoints max par jour via partage
} as const

/** Mots-cles cibles par defaut */
export const TARGET_KEYWORDS = [
  "financer un film independant",
  "plateforme auteurs independants",
  "publier un podcast",
  "soutenir un createur",
  "alternative youtube createurs",
  "alternative medium auteurs",
  "plateforme participative culturelle",
  "contribution participative",
  "financement participatif cinema",
  "publier un livre gratuitement",
] as const

/** Pages SEO a creer ou enrichir */
export const SEO_PAGES = [
  { path: "/films-videos", title: "Films & Videos", profile: "createur" as TargetProfile },
  { path: "/livres-articles", title: "Livres & Articles", profile: "createur" as TargetProfile },
  { path: "/podcasts", title: "Podcasts", profile: "createur" as TargetProfile },
  { path: "/guide", title: "Guide VIXUAL", profile: "public" as TargetProfile },
  { path: "/guide/comment-fonctionne-vixual", title: "Comment fonctionne VIXUAL", profile: "public" as TargetProfile },
  { path: "/guide/comment-soutenir-un-createur", title: "Comment soutenir un createur", profile: "contributeur" as TargetProfile },
  { path: "/guide/comment-lancer-un-podcast", title: "Comment lancer un podcast", profile: "createur" as TargetProfile },
  { path: "/guide/comment-publier-un-livre", title: "Comment publier un livre", profile: "createur" as TargetProfile },
  { path: "/comparatif/vixual-vs-youtube", title: "VIXUAL vs YouTube", profile: "createur" as TargetProfile },
  { path: "/comparatif/vixual-vs-kickstarter", title: "VIXUAL vs Kickstarter", profile: "createur" as TargetProfile },
  { path: "/comparatif/vixual-vs-medium", title: "VIXUAL vs Medium", profile: "createur" as TargetProfile },
] as const

// ─── SEO Engine Functions ───

/**
 * Calcule le score SEO d'une page
 */
export function calculateSeoScore(page: {
  title: string
  description: string
  keywords: string[]
  content: string
  hasH1: boolean
  hasH2: boolean
  hasImages: boolean
  hasInternalLinks: boolean
}): number {
  let score = 0
  
  // Titre (20 points max)
  if (page.title.length >= 30 && page.title.length <= 60) score += 20
  else if (page.title.length > 0) score += 10
  
  // Description (20 points max)
  if (page.description.length >= 120 && page.description.length <= 160) score += 20
  else if (page.description.length > 0) score += 10
  
  // Mots-cles (15 points max)
  if (page.keywords.length >= 3 && page.keywords.length <= 10) score += 15
  else if (page.keywords.length > 0) score += 7
  
  // Contenu (20 points max)
  const wordCount = page.content.split(/\s+/).length
  if (wordCount >= 800) score += 20
  else if (wordCount >= 300) score += 12
  else if (wordCount >= 100) score += 5
  
  // Structure (15 points max)
  if (page.hasH1) score += 5
  if (page.hasH2) score += 5
  if (page.hasImages) score += 5
  
  // Liens internes (10 points max)
  if (page.hasInternalLinks) score += 10
  
  return Math.min(100, score)
}

/**
 * Genere une suggestion SEO basee sur un mot-cle
 */
export function generateSeoSuggestion(keyword: string, profile: TargetProfile): SeoSuggestion {
  const id = `seo_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
  
  const titleMap: Record<string, string> = {
    "financer un film independant": "Comment financer un film independant sur VIXUAL",
    "plateforme auteurs independants": "VIXUAL : La plateforme des auteurs independants",
    "publier un podcast": "Publier un podcast et gagner de l'argent sur VIXUAL",
    "soutenir un createur": "Comment soutenir un createur sur VIXUAL",
  }
  
  const title = titleMap[keyword] || `${keyword} - Guide complet VIXUAL`
  
  return {
    id,
    title,
    description: `Decouvrez comment ${keyword} sur VIXUAL, la premiere plateforme de streaming participative.`,
    metaDescription: `${keyword} - Guide complet sur VIXUAL. Regarde-Participe-Gagne.`,
    keywords: [keyword, "vixual", "streaming participatif", "createurs"],
    pageType: "guide",
    targetProfile: profile,
    structure: {
      h1: title,
      h2: ["Introduction", "Comment ca marche", "Avantages", "Commencer maintenant"],
      h3: [],
    },
    content: "",
    score: 0,
    status: "pending",
    createdAt: new Date(),
  }
}

// ─── Social Engine Functions ───

/**
 * Genere un lien de tracking pour un partage
 */
export function generateTrackingUrl(params: {
  projectId: string
  userId: string
  source: SocialSource
  campaign?: string
}): string {
  const base = typeof window !== "undefined" ? window.location.origin : "https://vixual.app"
  const searchParams = new URLSearchParams({
    src: params.source,
    uid: params.userId,
    pid: params.projectId,
    cmp: params.campaign || "social_share",
    t: Date.now().toString(36),
  })
  return `${base}/r/${params.projectId}?${searchParams.toString()}`
}

/**
 * Genere les textes de partage pour un projet
 */
export function generateSocialTexts(project: {
  title: string
  type: "video" | "text" | "podcast"
  creatorName: string
}): { short: string; long: string; hashtags: string[] } {
  const typeEmoji = {
    video: "\u{1F3AC}",
    text: "\u{1F4DA}",
    podcast: "\u{1F3A7}",
  }
  
  const emoji = typeEmoji[project.type]
  
  const short = `${emoji} Decouvrez "${project.title}" sur VIXUAL. Regarde-Participe-Gagne.`
  
  const long = `${emoji} Un projet qui merite d'etre vu : "${project.title}" par ${project.creatorName}.\n\nRejoignez VIXUAL, la premiere plateforme de streaming participative.\n\nRegarde-Participe-Gagne.`
  
  const hashtags = [
    "#VIXUAL",
    "#RegardParticipeGagne",
    "#StreamingParticipatif",
    project.type === "video" ? "#Cinema" : project.type === "podcast" ? "#Podcast" : "#Litterature",
    "#Createurs",
  ]
  
  return { short, long, hashtags }
}

// ─── Viral Reward Engine Functions ───

/**
 * Calcule la recompense VIXUpoints pour un partage
 */
export function calculateShareReward(share: {
  clicks: number
  uniqueClicks: number
  signups: number
  conversions: number
}): number {
  let reward = 0
  
  // Base: partage valide
  reward += SHARE_REWARDS.shareValid
  
  // Bonus: clics qualifies (uniques seulement)
  reward += Math.min(share.uniqueClicks, 5) * SHARE_REWARDS.clickQualified
  
  // Bonus: inscriptions generees
  reward += share.signups * SHARE_REWARDS.signupGenerated
  
  // Bonus: conversions confirmees
  reward += share.conversions * SHARE_REWARDS.conversionConfirmed
  
  // Plafonner a la limite journaliere
  return Math.min(reward, SHARE_LIMITS.maxRewardsPerDay)
}

/**
 * Verifie si un partage est suspect (anti-abus)
 */
export function detectShareAbuse(params: {
  userId: string
  sharesToday: number
  sharesThisWeek: number
  lastRewardTime?: Date
  ipHistory: string[]
}): { blocked: boolean; reason?: string } {
  // Limite quotidienne
  if (params.sharesToday >= SHARE_LIMITS.dailySharesMax) {
    return { blocked: true, reason: "Limite quotidienne atteinte" }
  }
  
  // Limite hebdomadaire
  if (params.sharesThisWeek >= SHARE_LIMITS.weeklySharesMax) {
    return { blocked: true, reason: "Limite hebdomadaire atteinte" }
  }
  
  // Delai minimum entre recompenses
  if (params.lastRewardTime) {
    const elapsed = Date.now() - params.lastRewardTime.getTime()
    if (elapsed < SHARE_LIMITS.minDelayBetweenRewards) {
      return { blocked: true, reason: "Delai minimum non respecte" }
    }
  }
  
  // Detection multi-IP suspecte (plus de 3 IPs differentes en 24h)
  const uniqueIps = new Set(params.ipHistory).size
  if (uniqueIps > 5) {
    return { blocked: true, reason: "Activite IP suspecte" }
  }
  
  return { blocked: false }
}

// ─── Growth Score Functions ───

/**
 * Calcule le score de croissance global VIXUAL
 */
export function calculateGrowthScore(metrics: {
  seoTraffic: number
  socialTraffic: number
  conversionRate: number
  engagementRate: number
  contentQuality: number
}): GrowthScore {
  // Score SEO (trafic organique)
  const seoScore = Math.min(100, (metrics.seoTraffic / 10000) * 100)
  
  // Score Social (trafic social)
  const socialScore = Math.min(100, (metrics.socialTraffic / 5000) * 100)
  
  // Score Engagement
  const engagementScore = metrics.engagementRate * 100
  
  // Score Qualite
  const qualityScore = metrics.contentQuality
  
  // Score global pondere
  const overall = Math.round(
    seoScore * 0.30 +
    socialScore * 0.25 +
    engagementScore * 0.25 +
    qualityScore * 0.20
  )
  
  return {
    overall: Math.min(100, overall),
    seo: Math.round(seoScore),
    social: Math.round(socialScore),
    engagement: Math.round(engagementScore),
    quality: Math.round(qualityScore),
  }
}

// ─── Mock Data pour Dashboard ───

export function getMockSeoMetrics(): SeoMetrics {
  return {
    totalTraffic: 45230,
    weeklyTraffic: 8450,
    monthlyTraffic: 32100,
    newUsersViaSeo: 1234,
    conversionRate: 4.2,
    topKeywords: [
      { keyword: "plateforme streaming participatif", clicks: 1250, position: 3 },
      { keyword: "financer film independant", clicks: 890, position: 5 },
      { keyword: "publier podcast gratuit", clicks: 720, position: 4 },
      { keyword: "alternative youtube createurs", clicks: 650, position: 7 },
      { keyword: "soutenir auteur independant", clicks: 540, position: 6 },
    ],
    topPages: [
      { path: "/", views: 12500, bounceRate: 35 },
      { path: "/explore", views: 8200, bounceRate: 28 },
      { path: "/how-it-works", views: 5600, bounceRate: 22 },
      { path: "/signup", views: 4100, bounceRate: 45 },
      { path: "/faq", views: 2800, bounceRate: 30 },
    ],
  }
}

export function getMockSocialMetrics(): SocialMetrics {
  return {
    totalShares: 8920,
    totalClicks: 34500,
    uniqueVisitors: 18200,
    signupsGenerated: 1456,
    conversions: 890,
    vixupointsDistributed: 125400,
    topSharers: [
      { userId: "user_1", shares: 89, conversions: 34 },
      { userId: "user_2", shares: 76, conversions: 28 },
      { userId: "user_3", shares: 65, conversions: 22 },
    ],
    bySource: {
      instagram: { shares: 2800, clicks: 12000, conversions: 320 },
      tiktok: { shares: 2100, clicks: 9500, conversions: 280 },
      facebook: { shares: 1500, clicks: 5200, conversions: 120 },
      x: { shares: 1200, clicks: 4800, conversions: 98 },
      linkedin: { shares: 620, clicks: 1800, conversions: 45 },
      youtube: { shares: 450, clicks: 900, conversions: 20 },
      other: { shares: 250, clicks: 300, conversions: 7 },
    },
  }
}

export function getMockSeoSuggestions(): SeoSuggestion[] {
  return [
    {
      id: "seo_1",
      title: "Comment financer un film independant en 2026",
      description: "Guide complet pour financer votre film sur VIXUAL",
      metaDescription: "Decouvrez comment financer votre film independant grace au streaming participatif sur VIXUAL.",
      keywords: ["financement film", "cinema independant", "crowdfunding film", "vixual"],
      pageType: "guide",
      targetProfile: "createur",
      structure: {
        h1: "Comment financer un film independant en 2026",
        h2: ["Pourquoi choisir VIXUAL", "Les etapes du financement", "Conseils pour reussir"],
        h3: [],
      },
      content: "",
      score: 87,
      status: "pending",
      createdAt: new Date("2026-03-15"),
    },
    {
      id: "seo_2",
      title: "VIXUAL vs YouTube : Quelle plateforme pour les createurs ?",
      description: "Comparatif detaille entre VIXUAL et YouTube pour les createurs de contenu",
      metaDescription: "VIXUAL vs YouTube : decouvrez quelle plateforme offre le meilleur revenu aux createurs.",
      keywords: ["vixual vs youtube", "alternative youtube", "monetisation createur"],
      pageType: "comparatif",
      targetProfile: "createur",
      structure: {
        h1: "VIXUAL vs YouTube : Le comparatif complet",
        h2: ["Monetisation", "Audience", "Fonctionnalites", "Notre verdict"],
        h3: [],
      },
      content: "",
      score: 92,
      status: "pending",
      createdAt: new Date("2026-03-16"),
    },
    {
      id: "seo_3",
      title: "Publier un podcast et gagner de l'argent",
      description: "Lancez votre podcast sur VIXUAL et generez des revenus",
      metaDescription: "Apprenez a publier un podcast et gagner de l'argent avec le streaming participatif VIXUAL.",
      keywords: ["publier podcast", "monetiser podcast", "podcast gratuit"],
      pageType: "guide",
      targetProfile: "createur",
      structure: {
        h1: "Publier un podcast et gagner de l'argent sur VIXUAL",
        h2: ["Creer son podcast", "Le publier sur VIXUAL", "Monetiser son audience"],
        h3: [],
      },
      content: "",
      score: 78,
      status: "approved",
      createdAt: new Date("2026-03-14"),
      approvedAt: new Date("2026-03-15"),
      approvedBy: "admin",
    },
  ]
}
