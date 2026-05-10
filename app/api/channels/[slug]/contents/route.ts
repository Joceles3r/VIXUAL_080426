/**
 * POST   /api/channels/[slug]/contents -> ajoute un contenu (createur owner)
 * DELETE /api/channels/[slug]/contents -> retire un contenu (createur owner)
 *
 * Body POST   : { contentId, displayOrder? }
 * Body DELETE : { contentId }
 */
import { NextResponse } from "next/server"
import { getRequestUser } from "@/lib/request-user"
import { isCreatorChannelsModuleActive } from "@/lib/channels/state"
import {
  addContentToChannel,
  getChannelBySlug,
  removeContentFromChannel,
} from "@/lib/channels/service"

export const runtime = "nodejs"

async function loadOwnedChannel(req: Request, slug: string) {
  if (!(await isCreatorChannelsModuleActive())) {
    return { error: NextResponse.json({ error: "Module desactive" }, { status: 403 }) }
  }
  const user = await getRequestUser(req)
  if (!user) {
    return { error: NextResponse.json({ error: "Non authentifie" }, { status: 401 }) }
  }
  const channel = await getChannelBySlug(slug)
  if (!channel) {
    return { error: NextResponse.json({ error: "Chaine introuvable" }, { status: 404 }) }
  }
  if (channel.creatorId !== user.id) {
    return { error: NextResponse.json({ error: "Non autorise" }, { status: 403 }) }
  }
  return { user, channel }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params
  const ctx = await loadOwnedChannel(req, slug)
  if ("error" in ctx) return ctx.error

  let body: { contentId?: string; displayOrder?: number }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Body JSON invalide" }, { status: 400 })
  }
  if (!body.contentId) {
    return NextResponse.json({ error: "contentId requis" }, { status: 400 })
  }

  try {
    const item = await addContentToChannel({
      channelId: ctx.channel.id,
      creatorId: ctx.user.id,
      contentId: body.contentId,
      displayOrder: body.displayOrder,
    })
    return NextResponse.json({ item }, { status: 201 })
  } catch (e) {
    const message = e instanceof Error ? e.message : "Erreur inconnue"
    return NextResponse.json({ error: message }, { status: 400 })
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params
  const ctx = await loadOwnedChannel(req, slug)
  if ("error" in ctx) return ctx.error

  let body: { contentId?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Body JSON invalide" }, { status: 400 })
  }
  if (!body.contentId) {
    return NextResponse.json({ error: "contentId requis" }, { status: 400 })
  }

  try {
    await removeContentFromChannel({
      channelId: ctx.channel.id,
      creatorId: ctx.user.id,
      contentId: body.contentId,
    })
    return NextResponse.json({ ok: true })
  } catch (e) {
    const message = e instanceof Error ? e.message : "Erreur inconnue"
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
