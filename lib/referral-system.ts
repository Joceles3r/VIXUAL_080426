/**
 * VIXUAL Referral System
 * 
 * Système viral - Chaque utilisateur devient un marketeur VIXUAL
 * 
 * Fonctionnalités:
 * - Génération de liens de parrainage uniques
 * - Tracking des clics et conversions
 * - Récompenses en VIXUpoints
 * - Analytics détaillées
 */

import { isFeatureEnabled } from "./feature-flags"

// ─── Constants ───

/** VIXUpoints reward for successful referral */
export const REFERRAL_REWARD_VIXUPOINTS = 50

/** VIXUpoints reward for referee (new user) */
export const REFEREE_WELCOME_VIXUPOINTS = 25

/** Maximum referrals per user per month */
export const MAX_REFERRALS_PER_MONTH = 50

/** Minimum days before referral reward is credited (anti-fraud) */
export const REFERRAL_REWARD_DELAY_DAYS = 7

// ─── Types ───

export interface Referral {
  id: string
  referrerId: string
  refereeId?: string
  contentId?: string
  code: string
  clicks: number
  conversions: number
  rewardsCredited: number
  status: "active" | "converted" | "expired" | "fraudulent"
  createdAt: string
  convertedAt?: string
  expiresAt: string
}

export interface ReferralStats {
  totalReferrals: number
  activeReferrals: number
  totalClicks: number
  totalConversions: number
  conversionRate: number
  totalRewardsEarned: number
  monthlyReferrals: number
  topContent: { contentId: string; conversions: number }[]
}

export interface ReferralLink {
  url: string
  code: string
  qrCodeUrl?: string
}

// ─── Link Generation ───

/**
 * Generate a unique referral code
 */
export function generateReferralCode(userId: string, contentId?: string): string {
  const timestamp = Date.now().toString(36)
  const userPart = userId.slice(0, 6)
  const contentPart = contentId ? `-${contentId.slice(0, 4)}` : ""
  const random = Math.random().toString(36).slice(2, 6)
  return `${userPart}${contentPart}-${timestamp}-${random}`.toUpperCase()
}

/**
 * Generate a referral link for sharing
 */
export function generateReferralLink(
  userId: string, 
  contentId?: string,
  baseUrl: string = "https://vixual.com"
): ReferralLink {
  const code = generateReferralCode(userId, contentId)
  
  const url = contentId 
    ? `${baseUrl}/content/${contentId}?ref=${code}`
    : `${baseUrl}?ref=${code}`
  
  return {
    url,
    code,
    qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`,
  }
}

/**
 * Parse referral code from URL
 */
export function parseReferralCode(url: string): string | null {
  try {
    const urlObj = new URL(url)
    return urlObj.searchParams.get("ref")
  } catch {
    return null
  }
}

// ─── Mock Data Store (Replace with DB in production) ───

const mockReferrals: Map<string, Referral> = new Map()

// ─── Referral Tracking ───

/**
 * Create a new referral tracking entry
 */
export async function createReferral(
  referrerId: string,
  contentId?: string
): Promise<Referral> {
  if (!isFeatureEnabled("referralSystem")) {
    throw new Error("Referral system is not enabled")
  }
  
  const code = generateReferralCode(referrerId, contentId)
  const now = new Date()
  const expiresAt = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000) // 90 days
  
  const referral: Referral = {
    id: `ref-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    referrerId,
    contentId,
    code,
    clicks: 0,
    conversions: 0,
    rewardsCredited: 0,
    status: "active",
    createdAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
  }
  
  mockReferrals.set(code, referral)
  return referral
}

/**
 * Track a click on a referral link
 */
export async function trackReferralClick(code: string): Promise<boolean> {
  const referral = mockReferrals.get(code)
  if (!referral || referral.status !== "active") return false
  
  // Check expiration
  if (new Date() > new Date(referral.expiresAt)) {
    referral.status = "expired"
    return false
  }
  
  referral.clicks++
  return true
}

/**
 * Track a conversion (new user signup through referral)
 */
export async function trackReferralConversion(
  code: string,
  newUserId: string
): Promise<{ success: boolean; reward?: number }> {
  const referral = mockReferrals.get(code)
  if (!referral || referral.status !== "active") {
    return { success: false }
  }
  
  referral.conversions++
  referral.refereeId = newUserId
  referral.convertedAt = new Date().toISOString()
  referral.status = "converted"
  
  // Schedule reward (with delay for anti-fraud)
  // In production, this would be a database job
  const reward = REFERRAL_REWARD_VIXUPOINTS
  
  return { 
    success: true, 
    reward,
  }
}

/**
 * Credit referral rewards after delay period
 */
export async function creditReferralReward(
  referralId: string
): Promise<{ credited: boolean; amount: number }> {
  const referral = Array.from(mockReferrals.values()).find(r => r.id === referralId)
  if (!referral || referral.rewardsCredited > 0) {
    return { credited: false, amount: 0 }
  }
  
  // Check if enough time has passed
  const convertedAt = referral.convertedAt ? new Date(referral.convertedAt) : null
  if (!convertedAt) return { credited: false, amount: 0 }
  
  const daysSinceConversion = (Date.now() - convertedAt.getTime()) / (1000 * 60 * 60 * 24)
  if (daysSinceConversion < REFERRAL_REWARD_DELAY_DAYS) {
    return { credited: false, amount: 0 }
  }
  
  referral.rewardsCredited = REFERRAL_REWARD_VIXUPOINTS
  
  return { credited: true, amount: REFERRAL_REWARD_VIXUPOINTS }
}

// ─── Analytics ───

/**
 * Get referral statistics for a user
 */
export async function getReferralStats(userId: string): Promise<ReferralStats> {
  const userReferrals = Array.from(mockReferrals.values()).filter(
    r => r.referrerId === userId
  )
  
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  
  const monthlyReferrals = userReferrals.filter(
    r => new Date(r.createdAt) >= monthStart
  ).length
  
  const totalClicks = userReferrals.reduce((sum, r) => sum + r.clicks, 0)
  const totalConversions = userReferrals.reduce((sum, r) => sum + r.conversions, 0)
  const totalRewardsEarned = userReferrals.reduce((sum, r) => sum + r.rewardsCredited, 0)
  
  // Group by content
  const contentStats = new Map<string, number>()
  userReferrals.forEach(r => {
    if (r.contentId && r.conversions > 0) {
      contentStats.set(
        r.contentId, 
        (contentStats.get(r.contentId) || 0) + r.conversions
      )
    }
  })
  
  const topContent = Array.from(contentStats.entries())
    .map(([contentId, conversions]) => ({ contentId, conversions }))
    .sort((a, b) => b.conversions - a.conversions)
    .slice(0, 5)
  
  return {
    totalReferrals: userReferrals.length,
    activeReferrals: userReferrals.filter(r => r.status === "active").length,
    totalClicks,
    totalConversions,
    conversionRate: totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0,
    totalRewardsEarned,
    monthlyReferrals,
    topContent,
  }
}

// ─── Share Helpers ───

export interface ShareOptions {
  platform: "twitter" | "facebook" | "linkedin" | "whatsapp" | "email" | "copy"
  url: string
  title?: string
  description?: string
}

/**
 * Generate share URLs for different platforms
 */
export function getShareUrl(options: ShareOptions): string {
  const { platform, url, title = "Découvrez VIXUAL", description = "" } = options
  const encodedUrl = encodeURIComponent(url)
  const encodedTitle = encodeURIComponent(title)
  const encodedDesc = encodeURIComponent(description)
  
  switch (platform) {
    case "twitter":
      return `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`
    case "facebook":
      return `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`
    case "linkedin":
      return `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`
    case "whatsapp":
      return `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`
    case "email":
      return `mailto:?subject=${encodedTitle}&body=${encodedDesc}%0A%0A${encodedUrl}`
    case "copy":
    default:
      return url
  }
}
