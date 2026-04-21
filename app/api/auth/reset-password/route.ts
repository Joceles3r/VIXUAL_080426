import { NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json()

    if (!token || !password) {
      return NextResponse.json(
        { error: "Token et mot de passe requis" },
        { status: 400 }
      )
    }

    // Validate password strength
    if (password.length < 12) {
      return NextResponse.json(
        { error: "Le mot de passe doit contenir au moins 12 caracteres" },
        { status: 400 }
      )
    }

    // Verify token
    const tokens = await sql`
      SELECT email, expires_at 
      FROM password_reset_tokens 
      WHERE token = ${token} 
      AND expires_at > now()
    `

    if (tokens.length === 0) {
      return NextResponse.json(
        { error: "Token invalide ou expire" },
        { status: 400 }
      )
    }

    const email = tokens[0].email

    // Hash new password with strong salt rounds
    const passwordHash = await bcrypt.hash(password, 12)

    // Update user password
    const result = await sql`
      UPDATE users 
      SET password_hash = ${passwordHash}, updated_at = now()
      WHERE LOWER(email) = ${email.toLowerCase()}
      RETURNING id, email
    `

    if (result.length === 0) {
      return NextResponse.json(
        { error: "Utilisateur non trouve" },
        { status: 404 }
      )
    }

    // Delete used token
    await sql`
      DELETE FROM password_reset_tokens WHERE email = ${email}
    `

    console.log(`[VIXUAL Auth] Password reset successful for: ${email}`)

    return NextResponse.json({ 
      success: true, 
      message: "Mot de passe mis a jour avec succes" 
    })
  } catch (error) {
    console.error("[VIXUAL Auth] Password reset error:", error)
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    )
  }
}
