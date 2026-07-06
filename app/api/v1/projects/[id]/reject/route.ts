/**
 * VIXUAL V1-001 — Reject project (admin)
 *
 * POST /api/v1/projects/[id]/reject
 */

import { NextRequest, NextResponse } from "next/server"
import { jwtVerify } from "jose"
import { JWT_SECRET } from "@/lib/auth/jwt"
import * as projectService from "@/lib/projects/v1-project-service"
import type { PermissionContext } from "@/lib/projects/v1-project"

async function getAuthContext(req: NextRequest): Promise<PermissionContext | null> {
  try {
    const sessionCookie = req.cookies.get("vixual_session")
    if (!sessionCookie?.value) return null

    const { payload } = await jwtVerify(sessionCookie.value, JWT_SECRET)
    const userId = payload.userId as string
    const roles = (payload.roles as string[]) || []

    return { userId, userRoles: roles, projectOwnerId: "" }
  } catch {
    return null
  }
}

function errorResponse(message: string, status: number = 400) {
  return NextResponse.json({ success: false, error: message }, { status })
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const ctx = await getAuthContext(req)
    if (!ctx) {
      return errorResponse("Non connecté", 401)
    }

    if (!ctx.userRoles.includes("admin")) {
      return errorResponse("Réservé aux administrateurs", 403)
    }

    const body = await req.json()
    const reason = body.reason || "Aucun motif fourni"
    const project = await projectService.rejectProject(id, ctx, reason)

    return NextResponse.json({ success: true, data: project })
  } catch (error: any) {
    if (error.code === "PROJECT_NOT_FOUND") {
      return errorResponse("Projet introuvable", 404)
    }
    if (error.code === "ACCESS_DENIED") {
      return errorResponse("Réservé aux administrateurs", 403)
    }
    console.error("[Projects API] POST /api/v1/projects/[id]/reject error:", error)
    return errorResponse("Impossible de rejeter le projet", 500)
  }
}
