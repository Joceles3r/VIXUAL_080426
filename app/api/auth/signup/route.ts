/**
 * VIXUAL Secure Signup API
 */

import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
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

    // Generation du token de verification email + envoi du lien
    try {
      const verificationToken = crypto.randomUUID() + "-" + Date.now().toString(36)
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24h
      await sql`
        UPDATE users
        SET verification_token = ${verificationToken},
            verification_token_expires_at = ${expiresAt.toISOString()}
        WHERE id = ${user.id}
      `
      const verifyLink = `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/api/auth/verify?token=${verificationToken}`
      const { sendEmail } = await import("@/lib/email/resend")
      await sendEmail(
        normalizedEmail,
        "Confirmez votre adresse email VIXUAL",
        `<div style="font-family:system-ui;max-width:520px;margin:0 auto;padding:24px"><h2>Bienvenue ${name} !</h2><p>Merci de votre inscription sur VIXUAL. Cliquez sur le lien ci-dessous pour confirmer votre adresse email :</p><p><a href="${verifyLink}" style="background:#10b981;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block">Confirmer mon email</a></p><p style="color:#888;font-size:13px">Ce lien expire dans 24h.</p></div>`,
      )
    } catch (e) {
      console.error("[signup] echec envoi email verification :", (e as Error).message)
      // On ne bloque pas l'inscription si l'email echoue
    }

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
