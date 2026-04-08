import { NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import bcrypt from "bcryptjs"
import { cookies } from "next/headers"
import { jwtVerify } from "jose"

const sql = neon(process.env.DATABASE_URL!)

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "vixual-secret-key-change-in-production"
)

export async function POST(request: NextRequest) {
  try {
    const { currentPassword, newPassword, email } = await request.json()

    // Validate input
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Mot de passe actuel et nouveau mot de passe requis" },
        { status: 400 }
      )
    }

    // Validate new password strength
    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: "Le nouveau mot de passe doit contenir au moins 8 caracteres" },
        { status: 400 }
      )
    }

    if (!/[A-Z]/.test(newPassword) || !/[a-z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      return NextResponse.json(
        { error: "Le mot de passe doit contenir une majuscule, une minuscule et un chiffre" },
        { status: 400 }
      )
    }

    // Get user from JWT auth cookie
    const cookieStore = await cookies()
    const authCookie = cookieStore.get("vixual_auth")
    
    let userId: string | null = null
    let userEmail: string | null = email || null

    if (authCookie) {
      try {
        const { payload } = await jwtVerify(authCookie.value, JWT_SECRET)
        userId = payload.userId as string
        userEmail = payload.email as string
      } catch {
        // JWT invalid, try with email
      }
    }

    // If no valid JWT, require email
    if (!userId && !userEmail) {
      return NextResponse.json(
        { error: "Session invalide. Veuillez vous reconnecter." },
        { status: 401 }
      )
    }

    // Fetch user from database (by ID or email)
    const users = userId 
      ? await sql`SELECT id, email, password_hash FROM users WHERE id = ${userId}`
      : await sql`SELECT id, email, password_hash FROM users WHERE LOWER(email) = ${userEmail!.toLowerCase()}`

    if (users.length === 0) {
      return NextResponse.json(
        { error: "Utilisateur non trouve" },
        { status: 404 }
      )
    }

    const user = users[0]

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password_hash)
    if (!isValidPassword) {
      return NextResponse.json(
        { error: "Mot de passe actuel incorrect" },
        { status: 401 }
      )
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, 12)

    // Update password in database
    await sql`
      UPDATE users
      SET password_hash = ${newPasswordHash}, updated_at = NOW()
      WHERE id = ${user.id}
    `

    return NextResponse.json({
      success: true,
      message: "Mot de passe modifie avec succes",
    })

  } catch (error) {
    console.error("[VIXUAL] Change password error:", error)
    return NextResponse.json(
      { error: "Erreur serveur. Veuillez reessayer." },
      { status: 500 }
    )
  }
}
