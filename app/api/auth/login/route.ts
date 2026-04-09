/**
 * VIXUAL Secure Login API
 * 
 * Real authentication with bcrypt password verification
 * and secure HTTP-only cookie session management.
 */

import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { SignJWT } from "jose"
import { sql } from "@/lib/db"
import { JWT_SECRET, SESSION_DURATION_MS, SESSION_DURATION_SEC } from "@/lib/auth/jwt"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email et mot de passe requis" },
        { status: 400 }
      )
    }

    const normalizedEmail = email.toLowerCase().trim()

    // Fetch user from database
    const users = await sql`
      SELECT 
        id, 
        email, 
        display_name, 
        password_hash, 
        role,
        is_verified,
        is_creator,
        vixupoints_balance,
        trust_score,
        created_at
      FROM users 
      WHERE LOWER(email) = ${normalizedEmail}
      LIMIT 1
    `

    if (users.length === 0) {
      console.log(`[v0] Login failed - user not found: ${normalizedEmail}`)
      return NextResponse.json(
        { error: "Identifiants invalides" },
        { status: 401 }
      )
    }

    const user = users[0]
    console.log(`[v0] User found: ${user.email}, role: ${user.role}, hash exists: ${!!user.password_hash}`)

    // Verify password with bcrypt
    const isValidPassword = await bcrypt.compare(password, user.password_hash)
    console.log(`[v0] Password verification result: ${isValidPassword}`)

    if (!isValidPassword) {
      console.log(`[v0] Login failed - invalid password for: ${normalizedEmail}`)
      return NextResponse.json(
        { error: "Identifiants invalides" },
        { status: 401 }
      )
    }

    // Check if user has admin role (patron)
    const userRole = user.role || "visitor"
    const isAdmin = userRole === "admin"

    // Create JWT token
    const token = await new SignJWT({
      userId: user.id,
      email: user.email,
      name: user.display_name,
      role: userRole,
      isAdmin: isAdmin,
      isCreator: user.is_creator || false,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(JWT_SECRET)

    // Create response with user data (excluding password)
    const response = NextResponse.json({
      success: true,
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

    // Set HTTP-only secure cookie
    response.cookies.set("vixual_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: SESSION_DURATION_SEC,
      path: "/",
    })

    console.log(`[VIXUAL Auth] Successful login for: ${normalizedEmail}`)

    return response
  } catch (error) {
    console.error("[VIXUAL Auth] Login error:", error)
    return NextResponse.json(
      { error: "Erreur serveur lors de la connexion" },
      { status: 500 }
    )
  }
}
