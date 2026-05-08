import { NextRequest, NextResponse } from "next/server"
import { listAlerts } from "@/lib/moderation/alert-engine"
import { PATRON_EMAIL } from "@/lib/admin/roles"

function checkAuth(req: NextRequest): boolean {
  const adminEmail = req.headers.get("x-admin-email")
  return Boolean(adminEmail && adminEmail.toLowerCase() === PATRON_EMAIL.toLowerCase())
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  const status = req.nextUrl.searchParams.get("status") ?? "pending"
  const severity = req.nextUrl.searchParams.get("severity") ?? undefined
  const alerts = await listAlerts({ status, severity })
  return NextResponse.json({ alerts })
}
