/**
 * VIXUAL — app/api/admin/briefing/data/route.ts
 * Renvoie les donnees du briefing pour affichage temps reel.
 */
import { NextRequest, NextResponse } from "next/server"
import { collectBriefingData } from "@/lib/briefing/collector"

export async function GET(req: NextRequest) {
  const adminEmail = req.headers.get("x-admin-email")
  const patronEmail = process.env.PATRON_EMAIL ?? "jocelyndru@gmail.com"

  if (adminEmail !== patronEmail) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  const data = await collectBriefingData()
  return NextResponse.json({ data })
}
