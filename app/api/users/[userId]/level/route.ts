import { NextResponse } from "next/server"
import { getUserLevelStatus, evaluateAutoPromotion } from "@/lib/platform/user-level"

export async function GET(_req: Request, { params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params
  await evaluateAutoPromotion(userId)
  const status = await getUserLevelStatus(userId)
  if (!status) return NextResponse.json({ error: "User not found" }, { status: 404 })
  return NextResponse.json(status)
}
