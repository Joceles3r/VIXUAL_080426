/**
 * VIXUAL Session Verification API
 * 
 * Returns the currently authenticated user from the session cookie.
 * Used by auth-context to restore session on page load.
 */

import { NextRequest, NextResponse } from "next/server"
import { jwtVerify } from "jose"
import { sql } from "@/lib/db"
import { JWT_SECRET } from "@/lib/auth/jwt"

export async function GET(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get("vixual_session")
    
    if (!sessionCookie?.value) {
      return NextResponse.json({ user: null }, { status: 200 })
    }

    // Verify JWT token
    const { payload } = await jwtVerify(sessionCookie.value, JWT_SECRET)
    
    if (!payload.userId) {
      return NextResponse.json({ user: null }, { status: 200 })
    }

    // Fetch fresh user data from database
    const users = await sql`
      SELECT 
        id, 
        email, 
        display_name, 
        role,
        is_verified,
        is_creator,
        vixupoints_balance,
        trust_score
      FROM users 
      WHERE id = ${payload.userId}::uuid
      LIMIT 1
    `

    if (users.length === 0) {
      // User was deleted or doesn't exist anymore
      return NextResponse.json({ user: null }, { status: 200 })
    }

    const user = users[0]
    const userRole = user.role || "visitor"
    const isAdmin = userRole === "admin"

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.display_name,
        role: userRole,
        isAdmin: isAdmin,
        isVerified: user.is_verified,
        isCreator: user.is_creator,
        vixupointsBalance: user.vixupoints_balance,
        trustScore: user.trust_score,
      },
    })
  } catch (error) {
    // Token expired or invalid
    console.error("[VIXUAL Auth] Session verification error:", error)
    return NextResponse.json({ user: null }, { status: 200 })
  }
}
