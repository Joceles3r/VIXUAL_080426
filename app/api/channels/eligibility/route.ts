/**
 * GET /api/channels/eligibility
 * Verifie si le createur authentifie peut demander une chaine.
 */
import { NextResponse } from "next/server"
import { getRequestUser } from "@/lib/request-user"
import { isCreatorChannelsModuleActive } from "@/lib/channels/state"
import { getCreatorEligibility } from "@/lib/channels/service"

export const runtime = "nodejs"

export async function GET(req: Request) {
  if (!(await isCreatorChannelsModuleActive())) {
    return NextResponse.json({ error: "Module desactive" }, { status: 403 })
  }
  const user = await getRequestUser(req)
  if (!user) return NextResponse.json({ error: "Non authentifie" }, { status: 401 })

  const eligibility = await getCreatorEligibility(user.id)
  return NextResponse.json({ eligibility })
}
