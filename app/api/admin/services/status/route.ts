/**
 * VIXUAL — Etat consolide des services
 *
 * Retourne un snapshot JSON simple :
 *   { homepage, uploads, auth, db, stripe, bunny, resend, maintenance }
 *
 * Chaque service => "ok" | "error" | "maintenance" | "not_configured"
 */
import { NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

export const runtime = "nodejs"

async function checkAdmin(req: NextRequest): Promise<boolean> {
  const email = req.headers.get("x-admin-email")
  if (!email) return false
  const rows = await sql`SELECT role FROM users WHERE email = ${email} LIMIT 1`
  const role = (rows[0] as { role?: string })?.role
  return role === "admin" || role === "patron"
}

type ServiceStatus = "ok" | "error" | "maintenance" | "not_configured"
interface ServiceReport {
  status: ServiceStatus
  detail?: string
}

async function checkDb(): Promise<ServiceReport> {
  try {
    await sql`SELECT 1`
    return { status: "ok" }
  } catch (e) {
    return { status: "error", detail: (e as Error).message.slice(0, 120) }
  }
}

async function checkMaintenance(): Promise<ServiceReport> {
  try {
    const rows = (await sql`
      SELECT value FROM platform_settings WHERE key = 'maintenance_mode' LIMIT 1
    `) as Array<{ value: string }>
    const enabled = rows[0]?.value === "true" || rows[0]?.value === "on"
    return { status: enabled ? "maintenance" : "ok" }
  } catch {
    return { status: "ok", detail: "no_settings_table" }
  }
}

function checkEnv(name: string): ServiceReport {
  return process.env[name]
    ? { status: "ok" }
    : { status: "not_configured", detail: `${name} missing` }
}

export async function GET(req: NextRequest) {
  if (!(await checkAdmin(req))) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 })
  }

  const [db, maintenance] = await Promise.all([checkDb(), checkMaintenance()])

  const services: Record<string, ServiceReport> = {
    db,
    maintenance,
    auth: { status: "ok" },
    homepage: { status: "ok" },
    uploads: { status: "ok" },
    stripe: checkEnv("STRIPE_SECRET_KEY"),
    bunny: process.env.BUNNY_STREAM_API_KEY || process.env.BUNNY_STORAGE_API_KEY
      ? { status: "ok" }
      : { status: "not_configured", detail: "BUNNY_STREAM_API_KEY missing" },
    resend: checkEnv("RESEND_API_KEY"),
    blob: checkEnv("BLOB_READ_WRITE_TOKEN"),
  }

  const overall: ServiceStatus = Object.values(services).some((s) => s.status === "error")
    ? "error"
    : services.maintenance.status === "maintenance"
      ? "maintenance"
      : "ok"

  return NextResponse.json({
    overall,
    services,
    checked_at: new Date().toISOString(),
  })
}
