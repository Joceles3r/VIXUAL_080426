/**
 * VIXUAL — app/api/admin/backups/status/route.ts
 * Renvoie un etat des donnees BD (compte des lignes par table).
 */
import { NextRequest, NextResponse } from "next/server"
import { generateBackupSummary } from "@/lib/backups/db-export"

export async function GET(req: NextRequest) {
  const adminEmail = req.headers.get("x-admin-email")
  const patronEmail = process.env.PATRON_EMAIL ?? "jocelyndru@gmail.com"
  if (adminEmail !== patronEmail) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  const summary = await generateBackupSummary()
  return NextResponse.json({ summary, neonBackupNote: "Neon assure des branches PITR (Point-in-Time Recovery) automatiques 7 jours." })
}
