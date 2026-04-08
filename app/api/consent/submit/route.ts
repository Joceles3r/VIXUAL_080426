import { NextResponse } from "next/server"

/**
 * POST /api/consent/submit
 *
 * Enregistre le consentement parental pour un compte mineur.
 * En dev/v0 : stockage en memoire. En production : remplacer par DB.
 */

const memoryStore = new Map<string, Record<string, unknown>>()

export async function POST(req: Request) {
  const body = await req.json().catch(() => null)

  if (!body?.userId || !body?.payload?.acceptedByGuardian) {
    return NextResponse.json({ error: "Requ\u00eate invalide. userId et consentement requis." }, { status: 400 })
  }

  if (!body.payload.guardianEmail?.trim()) {
    return NextResponse.json({ error: "L'email du repr\u00e9sentant l\u00e9gal est obligatoire." }, { status: 400 })
  }

  const record = {
    userId: String(body.userId),
    status: "pending" as const,
    acceptedByGuardian: true,
    acceptedAt: new Date().toISOString(),
    guardianName: body.payload.guardianName ?? null,
    guardianEmail: body.payload.guardianEmail.trim(),
    documentType: body.payload.documentType ?? null,
    documentKey: body.payload.documentKey ?? null,
  }

  memoryStore.set(record.userId, record)

  return NextResponse.json({ ok: true, record })
}

export async function GET() {
  return NextResponse.json({ count: memoryStore.size })
}
