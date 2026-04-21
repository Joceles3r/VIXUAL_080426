import { NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token")

  if (!token) {
    return NextResponse.json({ valid: false })
  }

  try {
    const tokens = await sql`
      SELECT email, expires_at 
      FROM password_reset_tokens 
      WHERE token = ${token} 
      AND expires_at > now()
    `

    return NextResponse.json({ valid: tokens.length > 0 })
  } catch {
    return NextResponse.json({ valid: false })
  }
}
