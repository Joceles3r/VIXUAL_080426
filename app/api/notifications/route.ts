import { NextRequest, NextResponse } from "next/server"
import { getUnreadNotifications, markAllRead } from "@/lib/notifications/engine"

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId")
  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 })
  const items = await getUnreadNotifications(userId)
  return NextResponse.json({ notifications: items })
}

export async function PATCH(req: NextRequest) {
  const { userId } = await req.json()
  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 })
  await markAllRead(userId)
  return NextResponse.json({ success: true })
}
