/**
 * VIXUAL — GET /api/auth/verify?token=...
 * Verifie l'email d'un utilisateur via un token signe et limite dans le temps.
 */
import { NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

export const runtime = "nodejs"

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const token = url.searchParams.get("token")
  if (!token) {
    return NextResponse.redirect(new URL("/login?error=missing_token", req.url))
  }

  try {
    const rows = await sql`
      SELECT id, email, verification_token_expires_at
      FROM users
      WHERE verification_token = ${token}
      LIMIT 1
    `
    if (!rows || rows.length === 0) {
      return NextResponse.redirect(new URL("/login?error=invalid_token", req.url))
    }
    const user = rows[0] as { id: string; email: string; verification_token_expires_at: string }
    const expired = new Date(user.verification_token_expires_at).getTime() < Date.now()
    if (expired) {
      return NextResponse.redirect(new URL("/login?error=token_expired", req.url))
    }

    await sql`
      UPDATE users
      SET is_verified = TRUE,
          verification_token = NULL,
          verification_token_expires_at = NULL,
          updated_at = NOW()
      WHERE id = ${user.id}
    `

    return NextResponse.redirect(new URL("/login?verified=1", req.url))
  } catch {
    return NextResponse.redirect(new URL("/login?error=server_error", req.url))
  }
}
