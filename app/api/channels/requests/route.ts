/**
 * GET  /api/channels/requests  -> retourne la derniere demande du createur
 * POST /api/channels/requests  -> cree une nouvelle demande de chaine
 */
import { NextResponse } from "next/server"
import { getRequestUser } from "@/lib/request-user"
import { isCreatorChannelsModuleActive } from "@/lib/channels/state"
import {
  createChannelRequest,
  getRequestForCreator,
} from "@/lib/channels/service"

export const runtime = "nodejs"

export async function GET(req: Request) {
  if (!(await isCreatorChannelsModuleActive())) {
    return NextResponse.json({ error: "Module desactive" }, { status: 403 })
  }
  const user = await getRequestUser(req)
  if (!user) return NextResponse.json({ error: "Non authentifie" }, { status: 401 })

  const request = await getRequestForCreator(user.id)
  return NextResponse.json({ request })
}

export async function POST(req: Request) {
  if (!(await isCreatorChannelsModuleActive())) {
    return NextResponse.json({ error: "Module desactive" }, { status: 403 })
  }
  const user = await getRequestUser(req)
  if (!user) return NextResponse.json({ error: "Non authentifie" }, { status: 401 })

  let body: { channelSlug?: string; channelName?: string; channelBio?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Body JSON invalide" }, { status: 400 })
  }

  if (!body.channelSlug || !body.channelName) {
    return NextResponse.json(
      { error: "channelSlug et channelName sont requis" },
      { status: 400 },
    )
  }

  try {
    const request = await createChannelRequest({
      creatorId: user.id,
      channelSlug: body.channelSlug,
      channelName: body.channelName,
      channelBio: body.channelBio,
    })
    return NextResponse.json({ request }, { status: 201 })
  } catch (e) {
    const message = e instanceof Error ? e.message : "Erreur inconnue"
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
