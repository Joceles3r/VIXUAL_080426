/**
 * VIXUAL Referral API
 * 
 * Endpoints:
 * - GET: Fetch referral stats for a user
 * - POST: Track referral click or conversion
 */

import { NextRequest, NextResponse } from "next/server"
import { 
  createReferral, 
  trackReferralClick, 
  trackReferralConversion, 
  getReferralStats,
  generateReferralLink,
  REFERRAL_REWARD_VIXUPOINTS 
} from "@/lib/referral-system"
import { isFeatureEnabled } from "@/lib/feature-flags"

// GET - Fetch referral stats
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get("userId")
  
  if (!userId) {
    return NextResponse.json(
      { success: false, error: "userId is required" },
      { status: 400 }
    )
  }
  
  if (!isFeatureEnabled("referralSystem")) {
    return NextResponse.json(
      { success: false, error: "Referral system is disabled" },
      { status: 503 }
    )
  }
  
  try {
    const stats = await getReferralStats(userId)
    const link = generateReferralLink(userId)
    
    return NextResponse.json({
      success: true,
      data: {
        stats,
        link,
        rewardPerReferral: REFERRAL_REWARD_VIXUPOINTS,
      },
    })
  } catch (error) {
    console.error("[Referral API] Error fetching stats:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch referral stats" },
      { status: 500 }
    )
  }
}

// POST - Track click or conversion
export async function POST(request: NextRequest) {
  if (!isFeatureEnabled("referralSystem")) {
    return NextResponse.json(
      { success: false, error: "Referral system is disabled" },
      { status: 503 }
    )
  }
  
  try {
    const body = await request.json()
    const { action, code, userId, contentId, newUserId } = body
    
    switch (action) {
      case "create": {
        if (!userId) {
          return NextResponse.json(
            { success: false, error: "userId is required" },
            { status: 400 }
          )
        }
        
        const referral = await createReferral(userId, contentId)
        const link = generateReferralLink(userId, contentId)
        
        return NextResponse.json({
          success: true,
          data: { referral, link },
        })
      }
      
      case "click": {
        if (!code) {
          return NextResponse.json(
            { success: false, error: "code is required" },
            { status: 400 }
          )
        }
        
        const tracked = await trackReferralClick(code)
        
        return NextResponse.json({
          success: true,
          data: { tracked },
        })
      }
      
      case "conversion": {
        if (!code || !newUserId) {
          return NextResponse.json(
            { success: false, error: "code and newUserId are required" },
            { status: 400 }
          )
        }
        
        const result = await trackReferralConversion(code, newUserId)
        
        return NextResponse.json({
          success: true,
          data: result,
        })
      }
      
      default:
        return NextResponse.json(
          { success: false, error: "Invalid action. Use: create, click, or conversion" },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error("[Referral API] Error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to process referral action" },
      { status: 500 }
    )
  }
}
