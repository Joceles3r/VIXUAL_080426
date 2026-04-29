import { NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { sendEmail, TEMPLATES } from "@/lib/email/resend"
import crypto from "crypto"

export async function POST(req: NextRequest) {
  const { email } = await req.json()
  if (!email) return NextResponse.json({ error: "Email requis" }, { status: 400 })

  const users = await sql`SELECT id, display_name FROM users WHERE LOWER(email) = ${email.toLowerCase()} LIMIT 1`
  // Always return success (anti-enumeration)
  if (users.length === 0) return NextResponse.json({ success: true })

  const token = crypto.randomBytes(32).toString("hex")
  const expires = new Date(Date.now() + 3600_000) // 1h

  await sql`INSERT INTO password_reset_tokens (token, email, expires_at) VALUES (${token}, ${email.toLowerCase()}, ${expires.toISOString()})`

  const link = `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password?token=${token}`
  const t = TEMPLATES.passwordReset(users[0].display_name as string, link)
  await sendEmail(email, t.subject, t.html)

  return NextResponse.json({ success: true })
}
