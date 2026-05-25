/**
 * VIXUAL Secure Signup API
 */

import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { SignJWT } from "jose"
import { sql } from "@/lib/db"
import { JWT_SECRET, SESSION_DURATION_SEC } from "@/lib/auth/jwt"
import { detectRapidAccountCreation } from "@/lib/moderation/detectors"
import { processModerationEvent } from "@/lib/moderation/trust-score-engine"
import { isSuspiciousEmail } from "@/lib/security/disposable-emails"
import { logSecurityEvent } from "@/lib/security/audit-logger"

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

    // ─── Module sécurité Phase 1 — rejet emails jetables / suspects ───
    if (isSuspiciousEmail(normalizedEmail)) {
      const ip =
        request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
        request.headers.get("x-real-ip") ??
        "unknown"
      await logSecurityEvent({
        eventType: "signup_rejected_disposable_email",
        severity: "warn",
        ipAddress: ip,
        userAgent: request.headers.get("user-agent"),
        action: "signup_attempt",
        outcome: "rejected",
        // RGPD : on log uniquement le domaine, pas l'email complet
        context: { emailDomain: normalizedEmail.split("@")[1] ?? null },
      })
      return NextResponse.json(
        {
          error:
            "Cette adresse email n'est pas acceptée. Veuillez utiliser une adresse personnelle.",
        },
        { status: 400 },
      )
    }

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

    // Calcul is_minor cote serveur a partir de birthDate
    const birthDateObj = birthDate ? new Date(birthDate) : null
    const ageMs = birthDateObj ? Date.now() - birthDateObj.getTime() : 0
    const ageYears = ageMs / (365.25 * 24 * 60 * 60 * 1000)
    const isMinor = birthDateObj ? ageYears < 18 : false

    // Create user (aligned with 001-init-database.sql schema)
    const newUsers = await sql`
      INSERT INTO users (id, email, display_name, password_hash, role, birth_date, is_minor, vixupoints_balance, trust_score, created_at, updated_at)
      VALUES (
        gen_random_uuid(),
        ${normalizedEmail},
        ${name},
        ${passwordHash},
        'user',
        ${birthDate || null},
        ${isMinor},
        0,
        50,
        now(),
        now()
      )
      RETURNING id, email, display_name, role
    `

    const user = newUsers[0]

    // Hook moderation : detection de creation de comptes en rafale
    // (5 comptes / 10 min sur meme IP = critique)
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      request.headers.get("x-real-ip") ??
      "unknown"
    if (ip !== "unknown") {
      await detectRapidAccountCreation(ip)
    }

    // Initialise le tracking d'activite du nouvel utilisateur
    await processModerationEvent({ kind: "user_active", userId: user.id })

    // Create JWT token
    const token = await new SignJWT({
      userId: user.id,
      email: user.email,
      name: user.display_name,
      role: user.role,
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
        name: user.display_name,
        role: user.role,
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
