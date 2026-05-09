/**
 * GET   /api/channels/[slug]
 *   -> detail d'une chaine + ses contenus
 *
 * PATCH /api/channels/[slug]
 *   -> mise a jour bio / banner par le createur proprietaire
 */
import { NextResponse } from "next/server"
import { getRequestUser } from "@/lib/request-user"
import { isCreatorChannelsModuleActive } from "@/lib/channels/state"
import {
  getChannelBySlug,
  incrementChannelViewCount,
  listChannelContents,
  updateChannel,
} from "@/lib/channels/service"

export const runtime = "nodejs"

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  if (!(await isCreatorChannelsModuleActive())) {
    return NextResponse.json({ error: "Module desactive" }, { status: 403 })
  }
  const { slug } = await params
  const channel = await getChannelBySlug(slug)
  if (!channel) return NextResponse.json({ error: "Chaine introuvable" }, { status: 404 })

  const [contents] = await Promise.all([
    listChannelContents(channel.id),
    incrementChannelViewCount(channel.id),
  ])
  return NextResponse.json({ channel, contents })
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  if (!(await isCreatorChannelsModuleActive())) {
    return NextResponse.json({ error: "Module desactive" }, { status: 403 })
  }
  const user = await getRequestUser(req)
  if (!user) return NextResponse.json({ error: "Non authentifie" }, { status: 401 })

  const { slug } = await params
  const channel = await getChannelBySlug(slug)
  if (!channel) return NextResponse.json({ error: "Chaine introuvable" }, { status: 404 })
  if (channel.creatorId !== user.id) {
    return NextResponse.json({ error: "Non autorise" }, { status: 403 })
  }

  let body: { bio?: string; bannerUrl?: string | null }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Body JSON invalide" }, { status: 400 })
  }

  try {
    const updated = await updateChannel({
      channelId: channel.id,
      creatorId: user.id,
      bio: body.bio,
      bannerUrl: body.bannerUrl ?? null,
    })
    return NextResponse.json({ channel: updated })
  } catch (e) {
    const message = e instanceof Error ? e.message : "Erreur inconnue"
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
