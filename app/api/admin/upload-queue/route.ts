import { NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { listAdminQueue, getQueueStats } from "@/lib/upload-queue"

export const runtime = "nodejs"

async function checkAdmin(req: NextRequest): Promise<boolean> {
  const email = req.headers.get("x-admin-email")
  if (!email) return false
  const rows = await sql`SELECT role FROM users WHERE email = ${email} LIMIT 1`
  const role = (rows[0] as { role?: string })?.role
  return role === "admin" || role === "patron"
}

export async function GET(req: NextRequest) {
  if (!(await checkAdmin(req))) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 })
  }
  const [items, stats] = await Promise.all([listAdminQueue(200), getQueueStats()])
  return NextResponse.json({ items, stats })
}
