/**
 * VIXUAL V1-001 — Project Resource Route
 *
 * Per-resource endpoints:
 * GET    /api/v1/projects/:id  — Get a single project
 * PUT    /api/v1/projects/:id  — Update a project
 * DELETE /api/v1/projects/:id  — Delete a project
 */

import { NextRequest, NextResponse } from "next/server"
import { jwtVerify } from "jose"
import { JWT_SECRET } from "@/lib/auth/jwt"
import * as projectService from "@/lib/projects/v1-project-service"
import { UpdateProjectSchema } from "@/lib/projects/v1-project"
import type { PermissionContext } from "@/lib/projects/v1-project"

// ══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ══════════════════════════════════════════════════════════════════════════════

async function getAuthContext(req: NextRequest): Promise<PermissionContext | null> {
  try {
    const sessionCookie = req.cookies.get("vixual_session")
    if (!sessionCookie?.value) return null

    const { payload } = await jwtVerify(sessionCookie.value, JWT_SECRET)
    const userId = payload.userId as string
    const roles = (payload.roles as string[]) || []

    return {
      userId,
      userRoles: roles,
      projectOwnerId: "",
    }
  } catch {
    return null
  }
}

function errorResponse(message: string, status: number = 400) {
  return NextResponse.json({ success: false, error: message }, { status })
}

// ══════════════════════════════════════════════════════════════════════════════
// GET /api/v1/projects/:id — Get single project
// ══════════════════════════════════════════════════════════════════════════════

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const ctx = await getAuthContext(req)
    if (!ctx) {
      return errorResponse("Unauthorized", 401)
    }

    const project = await projectService.getProject(id)

    const isOwner = ctx.userId === project.ownerId
    const isAdmin = ctx.userRoles.includes("admin")

    if (!isOwner && !isAdmin) {
      return errorResponse("Access denied", 403)
    }

    return NextResponse.json({ success: true, data: project })
  } catch (error: any) {
    if (error.code === "PROJECT_NOT_FOUND") {
      return errorResponse("Project not found", 404)
    }
    console.error("[Projects API] GET /api/v1/projects/:id error:", error)
    return errorResponse("Failed to fetch project", 500)
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// PUT /api/v1/projects/:id — Update project
// ══════════════════════════════════════════════════════════════════════════════

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const ctx = await getAuthContext(req)
    if (!ctx) {
      return errorResponse("Unauthorized", 401)
    }

    const body = await req.json()
    const validated = UpdateProjectSchema.parse(body)

    const project = await projectService.updateProject(id, ctx, validated)

    return NextResponse.json({ success: true, data: project })
  } catch (error: any) {
    if (error.code === "PROJECT_NOT_FOUND") {
      return errorResponse("Project not found", 404)
    }
    if (error.code === "ACCESS_DENIED") {
      return errorResponse("Access denied", 403)
    }
    if (error.code === "INVALID_TRANSITION") {
      return errorResponse(error.message, 400)
    }
    if (error.name === "ZodError") {
      return errorResponse(`Validation error: ${error.errors[0].message}`, 400)
    }
    console.error("[Projects API] PUT /api/v1/projects/:id error:", error)
    return errorResponse("Failed to update project", 500)
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// DELETE /api/v1/projects/:id — Delete project
// ══════════════════════════════════════════════════════════════════════════════

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const ctx = await getAuthContext(req)
    if (!ctx) {
      return errorResponse("Unauthorized", 401)
    }

    await projectService.deleteProject(id, ctx)

    return NextResponse.json({ success: true, message: "Project deleted" })
  } catch (error: any) {
    if (error.code === "PROJECT_NOT_FOUND") {
      return errorResponse("Project not found", 404)
    }
    if (error.code === "ACCESS_DENIED") {
      return errorResponse("Access denied", 403)
    }
    if (error.code === "CANNOT_DELETE") {
      return errorResponse(error.message, 400)
    }
    console.error("[Projects API] DELETE /api/v1/projects/:id error:", error)
    return errorResponse("Failed to delete project", 500)
  }
}
