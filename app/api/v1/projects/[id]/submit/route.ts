/**
 * VIXUAL V1-001 — Submit project for review
 *
 * POST /api/v1/projects/[id]/submit
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

    const project = await projectService.submitProjectForReview(id, ctx)

    return NextResponse.json({ success: true, data: project })
  } catch (error: any) {
    if (error.code === "PROJECT_NOT_FOUND") {
      return errorResponse("Projet introuvable", 404)
    }
    if (error.code === "INVALID_TRANSITION") {
      return errorResponse("Le projet n'est pas prêt pour la soumission", 400)
    }
    if (error.code === "ACCESS_DENIED") {
      return errorResponse("Accès refusé", 403)
    }
    console.error("[Projects API] POST /api/v1/projects/[id]/submit error:", error)
    return errorResponse("Impossible de soumettre le projet", 500)
  }
}
