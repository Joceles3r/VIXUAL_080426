import { NextRequest, NextResponse } from "next/server"
import { getPlatformVersion, setPlatformVersion, getVersionFeatures, getVersionProfiles, type PlatformVersion } from "@/lib/platform/version"

const PATRON_EMAIL = "jocelyndru@gmail.com"

export async function GET() {
  const version = await getPlatformVersion()
  const features = getVersionFeatures(version)
  const profiles = getVersionProfiles(version)
  return NextResponse.json({ version, features, profiles })
}

export async function POST(req: NextRequest) {
  const adminEmail = req.headers.get("x-admin-email")
  if (!adminEmail || adminEmail.toLowerCase() !== PATRON_EMAIL) {
    return NextResponse.json({ error: "Acces PATRON requis" }, { status: 403 })
  }
  const body = await req.json()
  const newVersion = body.version as PlatformVersion
  const reason = (body.reason as string) ?? "Bascule manuelle"
  if (!["V1","V2","V3"].includes(newVersion)) {
    return NextResponse.json({ error: "Version invalide" }, { status: 400 })
  }
  await setPlatformVersion(newVersion, adminEmail, reason)
  return NextResponse.json({ success: true, version: newVersion })
}
