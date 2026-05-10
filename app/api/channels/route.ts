/**
 * GET /api/channels -> liste publique des chaines actives
 */
import { NextResponse } from "next/server"
import { isCreatorChannelsModuleActive } from "@/lib/channels/state"
import { listActiveChannels } from "@/lib/channels/service"

export const runtime = "nodejs"

export async function GET() {
  if (!(await isCreatorChannelsModuleActive())) {
    return NextResponse.json({ error: "Module desactive" }, { status: 403 })
  }
  const channels = await listActiveChannels(50)
  return NextResponse.json({ channels })
}
