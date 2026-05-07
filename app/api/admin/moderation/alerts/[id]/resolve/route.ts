import { NextRequest, NextResponse } from "next/server"
import { resolveAlert } from "@/lib/moderation/alert-engine"
import { logAudit } from "@/lib/moderation/audit"
import { PATRON_EMAIL } from "@/lib/admin/roles"

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const adminEmail = req.headers.get("x-admin-email")
  if (!adminEmail || adminEmail.toLowerCase() !== PATRON_EMAIL.toLowerCase()) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }
  const { id } = await params
  const body = (await req.json()) as {
    status: "approved" | "rejected" | "escalated"
    note?: string | null
  }
  await resolveAlert(id, body.status, adminEmail, body.note ?? null)
  await logAudit({
    eventType: "alert_resolved",
    alertId: id,
    triggeredBy: adminEmail,
    context: { newStatus: body.status, note: body.note ?? null },
  })
  return NextResponse.json({ success: true })
}
