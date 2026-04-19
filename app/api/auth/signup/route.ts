/**
 * VIXUAL Secure Signup API
 */

import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { SignJWT } from "jose"
import { sql } from "@/lib/db"
import { JWT_SECRET, SESSION_DURATION_SEC } from "@/lib/auth/jwt"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, password, birthDate } = body

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Nom, email et mot de passe requis" },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Le mot de passe doit contenir au moins 8 caracteres" },
        { status: 400 }
      )
    }

    const normalizedEmail = email.toLowerCase().trim()

    // Check if user already exists
    const existingUsers = await sql`
      SELECT id FROM users WHERE LOWER(email) = ${normalizedEmail}
    `

    if (existingUsers.length > 0) {
      return NextResponse.json(
        { error: "Un compte existe deja avec cet email" },
        { status: 409 }
      )
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12)

    // Create user
    const newUsers = await sql`
      INSERT INTO users (id, email, name, password_hash, roles, birth_date, created_at, updated_at)
      VALUES (
        gen_random_uuid(),
        ${normalizedEmail},
        ${name},
        ${passwordHash},
        ARRAY['visitor']::text[],
        ${birthDate || null},
        now(),
        now()
      )
      RETURNING id, email, name, roles
    `

    const user = newUsers[0]

    // Create JWT token
    const token = await new SignJWT({
      userId: user.id,
      email: user.email,
      name: user.name,
      roles: user.roles,
      isAdmin: false,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(JWT_SECRET)

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        roles: user.roles,
      },
    })

    response.cookies.set("vixual_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: SESSION_DURATION_SEC,
      path: "/",
    })

    return response
  } catch (error) {
    console.error("[VIXUAL Auth] Signup error:", error)
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    )
  }
}
