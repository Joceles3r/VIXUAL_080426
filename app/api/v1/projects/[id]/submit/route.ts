/**
 * VIXUAL V1-001 — Project Submit Route
 *
 * POST /api/v1/projects/:id/submit — Porteur submits project for review
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
      return errorResponse("Unauthorized", 401)
    }

    const project = await projectService.submitProjectForReview(id, ctx)

    return NextResponse.json({ success: true, data: project })
  } catch (error: any) {
    if (error.code === "PROJECT_NOT_FOUND") {
      return errorResponse("Project not found", 404)
    }
    if (error.code === "ACCESS_DENIED") {
      return errorResponse("Access denied", 403)
    }
    if (error.code === "INVALID_TRANSITION") {
      return errorResponse("Project not ready for submission", 400)
    }
    console.error("[Projects API] POST /api/v1/projects/:id/submit error:", error)
    return errorResponse("Failed to submit project", 500)
  }
}
