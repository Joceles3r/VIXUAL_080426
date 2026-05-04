/**
 * VIXUAL Archives + Statistiques Engine
 * Moteur central pour les archives prestigieuses et statistiques publiques
 */

import { ALL_CONTENTS } from "@/lib/mock-data"

// ─── Types ───

export type PublicTrend = "rising_fast" | "rising" | "stable" | "falling" | "falling_fast"

export type PrestigeLabel = 
  | "projet_emblematique"
  | "meilleure_progression"
  | "tres_soutenu"
  | "top_historique"
  | "projet_remarquable"
  | "hall_of_fame"
  | "elite_categorie"

export type ArchiveType = 
  | "monthly_top10"
  | "category_top10"
  | "historical_winner"
  | "hall_of_fame"
  | "remarkable_progression"

export interface PublicProjectStats {
  id: string
  slug: string
  title: string
  thumbnail: string
  category: "video" | "text" | "podcast"
  creatorName: string
  creatorId: string
  publicRank: number | null
  publicScore: number
  publicSupportCount: number
  publicQualifiedViews: number
  trend: PublicTrend
  trendDelta: number
  enteredTopAt: Date | null
  isPrestigeArchived: boolean
  prestigeLabel: PrestigeLabel | null
  hallOfFame: boolean
  status: "active" | "closed" | "archived"
}

export interface PrestigeArchive {
  id: string
  contentId: string
  archivePeriodKey: string
  archiveYear: number
  archiveMonth: number | null
  archiveQuarter: number | null
  archiveType: ArchiveType
  prestigeLabel: PrestigeLabel | null
  archivedReason: string
  project: PublicProjectStats
  createdAt: Date
}

export interface GlobalPublicStats {
  totalProjectsRanked: number
  totalProjectsInTop: number
  topCategoryNow: string
  bestProgressionMonth: PublicProjectStats | null
  mostSupportedEver: PublicProjectStats | null
  strongestDynamics30d: PublicProjectStats | null
  totalPrestigeArchived: number
  totalHallOfFame: number
}

export interface ArchivesByPeriod {
  year: number
  month?: number
  quarter?: number
  periodLabel: string
  projects: PublicProjectStats[]
}

// ─── Constants ───

export const PRESTIGE_LABELS_CONFIG: Record<PrestigeLabel, { label: string; color: string; icon: string }> = {
  projet_emblematique: { label: "Projet emblematique", color: "amber", icon: "star" },
  meilleure_progression: { label: "Meilleure progression", color: "emerald", icon: "trending-up" },
  tres_soutenu: { label: "Tres soutenu", color: "rose", icon: "heart" },
  top_historique: { label: "Top historique", color: "violet", icon: "trophy" },
  projet_remarquable: { label: "Projet remarquable", color: "sky", icon: "sparkles" },
  hall_of_fame: { label: "Hall of Fame", color: "yellow", icon: "crown" },
  elite_categorie: { label: "Elite de categorie", color: "purple", icon: "award" },
}

export const TREND_CONFIG: Record<PublicTrend, { label: string; color: string; icon: string }> = {
  rising_fast: { label: "Monte tres vite", color: "emerald", icon: "rocket" },
  rising: { label: "En hausse", color: "green", icon: "trending-up" },
  stable: { label: "Stable", color: "slate", icon: "minus" },
  falling: { label: "En baisse", color: "orange", icon: "trending-down" },
  falling_fast: { label: "Chute rapide", color: "red", icon: "arrow-down" },
}

// ─── Core Functions ───

/**
 * Compute public trend based on score delta
 */
export function computePublicTrend(currentScore: number, previousScore: number): PublicTrend {
  const delta = currentScore - previousScore
  
  if (delta > 25) return "rising_fast"
  if (delta > 5) return "rising"
  if (delta < -25) return "falling_fast"
  if (delta < -5) return "falling"
  return "stable"
}

// Fallback images for different categories
const FALLBACK_IMAGES = {
  video: [
    "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&h=450&fit=crop",
    "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&h=450&fit=crop",
    "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=800&h=450&fit=crop",
    "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800&h=450&fit=crop",
  ],
  text: [
    "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=450&fit=crop",
    "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&h=450&fit=crop",
    "https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=800&h=450&fit=crop",
    "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&h=450&fit=crop",
  ],
  podcast: [
    "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=800&h=450&fit=crop",
    "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=800&h=450&fit=crop",
    "https://images.unsplash.com/photo-1614149162883-504ce4d13909?w=800&h=450&fit=crop",
    "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&h=450&fit=crop",
  ],
}

function getRandomFallbackImage(category: "video" | "text" | "podcast"): string {
  const images = FALLBACK_IMAGES[category] || FALLBACK_IMAGES.video
  return images[Math.floor(Math.random() * images.length)]
}

/**
 * Map raw content to public project stats
 */
export function mapToPublicProjectStats(content: any, rank: number | null = null): PublicProjectStats {
  const baseScore = Math.random() * 500 + 100
  const previousScore = baseScore * (0.9 + Math.random() * 0.2)
  const trendDelta = baseScore - previousScore
  const category = content.contentType || content.type || "video"
  
  // Get thumbnail from coverUrl, thumbnail, or fallback
  let thumbnail = content.coverUrl || content.thumbnail
  if (!thumbnail || thumbnail.includes("placeholder")) {
    thumbnail = getRandomFallbackImage(category)
  }
  
  return {
    id: content.id,
    slug: content.slug || content.id,
    title: content.title,
    thumbnail,
    category,
    creatorName: content.creatorName || "Createur VIXUAL",
    creatorId: content.creatorId || "creator-1",
    publicRank: rank,
    publicScore: Math.round(baseScore),
    publicSupportCount: content.contributorCount || Math.floor(Math.random() * 500) + 50,
    publicQualifiedViews: Math.floor(Math.random() * 5000) + 500,
    trend: computePublicTrend(baseScore, previousScore),
    trendDelta: Math.round(trendDelta),
    enteredTopAt: rank && rank <= 100 ? new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) : null,
    isPrestigeArchived: Math.random() > 0.8,
    prestigeLabel: Math.random() > 0.7 ? getRandomPrestigeLabel() : null,
    hallOfFame: Math.random() > 0.95,
    status: "active",
  }
}

function getRandomPrestigeLabel(): PrestigeLabel {
  const labels: PrestigeLabel[] = Object.keys(PRESTIGE_LABELS_CONFIG) as PrestigeLabel[]
  return labels[Math.floor(Math.random() * labels.length)]
}

/**
 * Get current top projects
 */
export function getCurrentTopProjects(limit: number = 10, category?: "video" | "text" | "podcast"): PublicProjectStats[] {
  let contents = [...ALL_CONTENTS]
  
  if (category) {
    contents = contents.filter(c => c.contentType === category)
  }
  
  // Sort by simulated score
  contents.sort(() => Math.random() - 0.5)
  
  return contents.slice(0, limit).map((c, i) => mapToPublicProjectStats(c, i + 1))
}

/**
 * Get best progressions (rising fast)
 */
export function getBestProgressions(limit: number = 10): PublicProjectStats[] {
  return getCurrentTopProjects(50)
    .filter(p => p.trend === "rising_fast" || p.trend === "rising")
    .sort((a, b) => b.trendDelta - a.trendDelta)
    .slice(0, limit)
}

/**
 * Get Hall of Fame projects
 */
export function getHallOfFameProjects(): PublicProjectStats[] {
  const allProjects = getCurrentTopProjects(100)
  return allProjects
    .filter(() => Math.random() > 0.85)
    .map(p => ({
      ...p,
      hallOfFame: true,
      prestigeLabel: "hall_of_fame" as PrestigeLabel,
    }))
    .slice(0, 12)
}

/**
 * Get prestige archives by period
 */
export function getPrestigeArchivesByPeriod(): ArchivesByPeriod[] {
  const now = new Date()
  const archives: ArchivesByPeriod[] = []
  
  // Generate last 6 months of archives
  for (let i = 0; i < 6; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const monthNames = ["Janvier", "Fevrier", "Mars", "Avril", "Mai", "Juin", 
                        "Juillet", "Aout", "Septembre", "Octobre", "Novembre", "Decembre"]
    
    archives.push({
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      periodLabel: `${monthNames[date.getMonth()]} ${date.getFullYear()}`,
      projects: getCurrentTopProjects(10).map((p, idx) => ({
        ...p,
        publicRank: idx + 1,
        isPrestigeArchived: true,
        status: "archived" as const,
      })),
    })
  }
  
  return archives
}

/**
 * Build global public stats
 */
export function buildPublicGlobalStats(): GlobalPublicStats {
  const topProjects = getCurrentTopProjects(100)
  const bestProgression = getBestProgressions(1)[0]
  const mostSupported = [...topProjects].sort((a, b) => b.publicSupportCount - a.publicSupportCount)[0]
  const strongestDynamics = [...topProjects].sort((a, b) => b.trendDelta - a.trendDelta)[0]
  
  return {
    totalProjectsRanked: ALL_CONTENTS.length,
    totalProjectsInTop: Math.min(100, ALL_CONTENTS.length),
    topCategoryNow: "video",
    bestProgressionMonth: bestProgression,
    mostSupportedEver: mostSupported,
    strongestDynamics30d: strongestDynamics,
    totalPrestigeArchived: Math.floor(Math.random() * 50) + 20,
    totalHallOfFame: Math.floor(Math.random() * 15) + 5,
  }
}

/**
 * Get all public archives and stats for the main page
 */
export async function getPublicArchivesAndStats() {
  return {
    summary: {
      totalProjects: ALL_CONTENTS.length,
      totalInTop: Math.min(100, ALL_CONTENTS.length),
      totalPrestige: Math.floor(Math.random() * 50) + 20,
      totalHallOfFame: Math.floor(Math.random() * 15) + 5,
    },
    globalStats: buildPublicGlobalStats(),
    currentTopProjects: getCurrentTopProjects(10),
    bestProgressions: getBestProgressions(10),
    archivesByPeriod: getPrestigeArchivesByPeriod(),
    hallOfFame: getHallOfFameProjects(),
  }
}

/**
 * Get project detail for archive page
 */
export function getArchiveProjectDetail(slug: string): PublicProjectStats | null {
  const content = ALL_CONTENTS.find(c => c.id === slug)
  if (!content) return null
  return mapToPublicProjectStats(content, Math.floor(Math.random() * 10) + 1)
}
