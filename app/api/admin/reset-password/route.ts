/**
 * VIXUAL - Route temporaire pour réinitialiser le mot de passe admin
 * À SUPPRIMER après utilisation
 */

import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { sql } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, newPassword, secretKey } = body

    // Vérification de la clé secrète temporaire
    if (secretKey !== "VIXUAL_TEMP_RESET_2026") {
      return NextResponse.json(
        { error: "Clé secrète invalide" },
        { status: 403 }
      )
    }

    if (!email || !newPassword) {
      return NextResponse.json(
        { error: "Email et nouveau mot de passe requis" },
        { status: 400 }
      )
    }

    // Hasher le nouveau mot de passe
    const passwordHash = await bcrypt.hash(newPassword, 10)
    
    console.log(`[VIXUAL Admin Reset] Generating hash for password`)
    console.log(`[VIXUAL Admin Reset] Hash: ${passwordHash}`)

    // Mettre à jour le mot de passe dans la base de données
    const result = await sql`
      UPDATE users 
      SET 
        password_hash = ${passwordHash},
        updated_at = NOW()
      WHERE LOWER(email) = ${email.toLowerCase().trim()}
      RETURNING id, email, display_name, role
    `

    if (result.length === 0) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 }
      )
    }

    console.log(`[VIXUAL Admin Reset] Password updated for: ${email}`)

    return NextResponse.json({
      success: true,
      message: "Mot de passe réinitialisé avec succès",
      user: result[0]
    })
  } catch (error) {
    console.error("[VIXUAL Admin Reset] Error:", error)
    return NextResponse.json(
      { error: "Erreur serveur lors de la réinitialisation" },
      { status: 500 }
    )
  }
}
