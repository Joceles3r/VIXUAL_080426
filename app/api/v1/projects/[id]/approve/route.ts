/**
 * VIXUAL V1-001 — Approve project (admin)
 *
 * POST /api/v1/projects/[id]/approve
 */

import { NextRequest, NextResponse } from "next/server"
import * as projectService from "@/lib/projects/v1-project-service"
import { getAuthContext, errorResponse } from "../../_lib/auth"

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
    const project = await projectService.approveProject(id, ctx, body.moderationNote)

    return NextResponse.json({ success: true, data: project })
  } catch (error: any) {
    if (error.code === "PROJECT_NOT_FOUND") {
      return errorResponse("Projet introuvable", 404)
    }
    if (error.code === "ACCESS_DENIED") {
      return errorResponse("Réservé aux administrateurs", 403)
    }
    console.error("[Projects API] POST /api/v1/projects/[id]/approve error:", error)
    return errorResponse("Impossible d'approuver le projet", 500)
  }
}
