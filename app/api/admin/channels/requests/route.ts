/**
 * GET /api/admin/channels/requests -> liste toutes les demandes en attente
 * Reserve au PATRON.
 */
import { NextResponse } from "next/server"
import { getRequestUser } from "@/lib/request-user"
import { isPatron } from "@/lib/admin/roles"
import { listPendingRequests } from "@/lib/channels/service"

export const runtime = "nodejs"

export async function GET(req: Request) {
  const user = await getRequestUser(req)
  if (!user || !isPatron(user.email)) {
    return NextResponse.json({ error: "Acces reserve au PATRON" }, { status: 403 })
  }

  const requests = await listPendingRequests()
  return NextResponse.json({ requests })
}
