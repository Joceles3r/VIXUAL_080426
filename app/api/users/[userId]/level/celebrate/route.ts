import { NextResponse } from "next/server"
import { markCelebrationSeen } from "@/lib/platform/user-level"

export async function POST(_req: Request, { params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params
  await markCelebrationSeen(userId)
  return NextResponse.json({ success: true })
}
