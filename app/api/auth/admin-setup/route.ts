import { NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import bcrypt from "bcryptjs"

const PATRON_EMAIL = "jocelyndru@gmail.com"
const SALT_ROUNDS = 12

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Validate email is the PATRON email
    if (email.toLowerCase().trim() !== PATRON_EMAIL) {
      return NextResponse.json(
        { error: "Email non autorise pour la configuration PATRON" },
        { status: 403 }
      )
    }

    // Validate password strength
    if (!password || password.length < 8) {
      return NextResponse.json(
        { error: "Le mot de passe doit contenir au moins 8 caracteres" },
        { status: 400 }
      )
    }

    if (!/[A-Z]/.test(password)) {
      return NextResponse.json(
        { error: "Le mot de passe doit contenir au moins une majuscule" },
        { status: 400 }
      )
    }

    if (!/[a-z]/.test(password)) {
      return NextResponse.json(
        { error: "Le mot de passe doit contenir au moins une minuscule" },
        { status: 400 }
      )
    }

    if (!/[0-9]/.test(password)) {
      return NextResponse.json(
        { error: "Le mot de passe doit contenir au moins un chiffre" },
        { status: 400 }
      )
    }

    // Hash password with bcrypt
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS)

    // Connect to database
    const sql = neon(process.env.DATABASE_URL!)

    // Check if user exists
    const existingUser = await sql`
      SELECT id, email, roles FROM users WHERE email = ${PATRON_EMAIL}
    `

    if (existingUser.length > 0) {
      // Update existing user with new password hash and ensure patron role
      const currentRoles = existingUser[0].roles || []
      const updatedRoles = currentRoles.includes("patron") 
        ? currentRoles 
        : [...currentRoles, "patron"]

      await sql`
        UPDATE users 
        SET password_hash = ${passwordHash},
            roles = ${updatedRoles},
            updated_at = NOW()
        WHERE email = ${PATRON_EMAIL}
      `

      return NextResponse.json({
        success: true,
        message: "Mot de passe PATRON mis a jour avec succes",
        userId: existingUser[0].id,
      })
    } else {
      // Create new PATRON user
      const result = await sql`
        INSERT INTO users (email, password_hash, name, roles, created_at, updated_at)
        VALUES (${PATRON_EMAIL}, ${passwordHash}, 'PATRON', ARRAY['visitor', 'patron']::text[], NOW(), NOW())
        RETURNING id
      `

      return NextResponse.json({
        success: true,
        message: "Compte PATRON cree avec succes",
        userId: result[0].id,
      })
    }
  } catch (error) {
    console.error("[ADMIN_SETUP] Error:", error)
    return NextResponse.json(
      { error: "Erreur serveur lors de la configuration" },
      { status: 500 }
    )
  }
}
