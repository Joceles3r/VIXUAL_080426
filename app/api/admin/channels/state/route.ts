/**
 * GET  /api/admin/channels/state -> retourne l'etat actuel du module
 * POST /api/admin/channels/state -> active/desactive le module
 *
 * Reserve au PATRON. Body POST : { enabled: boolean }
 */
import { NextResponse } from "next/server"
import { getRequestUser } from "@/lib/request-user"
import { isPatron } from "@/lib/admin/roles"
import {
  disableCreatorChannelsModule,
  enableCreatorChannelsModule,
  getCreatorChannelsState,
} from "@/lib/channels/state"

export const runtime = "nodejs"

export async function GET(req: Request) {
  const user = await getRequestUser(req)
  if (!user || !isPatron(user.email)) {
    return NextResponse.json({ error: "Acces reserve au PATRON" }, { status: 403 })
  }
  const state = await getCreatorChannelsState()
  return NextResponse.json({ state })
}

export async function POST(req: Request) {
  const user = await getRequestUser(req)
  if (!user || !isPatron(user.email)) {
    return NextResponse.json({ error: "Acces reserve au PATRON" }, { status: 403 })
  }

  let body: { enabled?: boolean }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Body JSON invalide" }, { status: 400 })
  }
  if (typeof body.enabled !== "boolean") {
    return NextResponse.json({ error: "enabled (boolean) requis" }, { status: 400 })
  }

  if (body.enabled) await enableCreatorChannelsModule(user.email)
  else await disableCreatorChannelsModule(user.email)

  const state = await getCreatorChannelsState()
  return NextResponse.json({ state })
}
