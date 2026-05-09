/**
 * POST /api/admin/channels/requests/[id]/review
 * Approuve ou rejette une demande de chaine. Si approuvee, cree la chaine.
 * Reserve au PATRON.
 */
import { NextResponse } from "next/server"
import { getRequestUser } from "@/lib/request-user"
import { isPatron } from "@/lib/admin/roles"
import { reviewChannelRequest } from "@/lib/channels/service"

export const runtime = "nodejs"

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getRequestUser(req)
  if (!user || !isPatron(user.email)) {
    return NextResponse.json({ error: "Acces reserve au PATRON" }, { status: 403 })
  }

  const { id } = await params
  let body: { decision?: "approved" | "rejected"; reviewNote?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Body JSON invalide" }, { status: 400 })
  }

  if (body.decision !== "approved" && body.decision !== "rejected") {
    return NextResponse.json(
      { error: "decision doit etre 'approved' ou 'rejected'" },
      { status: 400 },
    )
  }

  try {
    const result = await reviewChannelRequest({
      requestId: id,
      reviewerEmail: user.email,
      decision: body.decision,
      reviewNote: body.reviewNote,
    })
    return NextResponse.json(result)
  } catch (e) {
    const message = e instanceof Error ? e.message : "Erreur inconnue"
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
