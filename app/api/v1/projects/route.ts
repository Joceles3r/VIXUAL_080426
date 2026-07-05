/**
 * VIXUAL V1-001 — Project API Route
 *
 * CRUD endpoints for projects submission workflow
 * GET  /api/v1/projects
 * GET  /api/v1/projects/:id
 * POST /api/v1/projects
 * PUT  /api/v1/projects/:id
 * DELETE /api/v1/projects/:id
 *
 * Admin endpoints:
 * GET /api/v1/projects/pending
 * POST /api/v1/projects/:id/approve
 * POST /api/v1/projects/:id/reject
 */

import { NextRequest, NextResponse } from "next/server"
import { jwtVerify } from "jose"
import { JWT_SECRET } from "@/lib/auth/jwt"
import * as projectService from "@/lib/projects/v1-project-service"
import { CreateProjectSchema, UpdateProjectSchema } from "@/lib/projects/v1-project"
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
      projectOwnerId: "", // Will be set per-request
    }
  } catch (e) {
    return null
  }
}

function errorResponse(message: string, status: number = 400) {
  return NextResponse.json({ success: false, error: message }, { status })
}

// ══════════════════════════════════════════════════════════════════════════════
// GET /api/v1/projects — List projects by owner
// ══════════════════════════════════════════════════════════════════════════════

export async function GET(req: NextRequest) {
  try {
    const ctx = await getAuthContext(req)
    if (!ctx) {
      return errorResponse("Unauthorized", 401)
    }

    const url = new URL(req.url)
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "50"), 100)
    const offset = Math.max(parseInt(url.searchParams.get("offset") || "0"), 0)

    const { projects, total } = await projectService.getProjectsByOwner(
      ctx.userId,
      limit,
      offset
    )

    return NextResponse.json({
      success: true,
      data: projects,
      pagination: { limit, offset, total },
    })
  } catch (error) {
    console.error("[Projects API] GET /api/v1/projects error:", error)
    return errorResponse("Failed to fetch projects", 500)
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// POST /api/v1/projects — Create new project
// ══════════════════════════════════════════════════════════════════════════════

export async function POST(req: NextRequest) {
  try {
    const ctx = await getAuthContext(req)
    if (!ctx) {
      return errorResponse("Unauthorized", 401)
    }

    // Only creators can create projects
    if (!["creator", "infoporteur", "podcasteur"].includes(ctx.userRoles[0])) {
      return errorResponse("Only creators can submit projects", 403)
    }

    const body = await req.json()
    const validated = CreateProjectSchema.parse(body)

    const project = await projectService.createProject(ctx.userId, validated)

    // Log creation
    await projectService.logProjectAudit({
      projectId: project.id,
      ownerId: ctx.userId,
      action: "created",
    })

    return NextResponse.json({
      success: true,
      data: project,
    })
  } catch (error: any) {
    console.error("[Projects API] POST /api/v1/projects error:", error)
    if (error.name === "ZodError") {
      return errorResponse(`Validation error: ${error.errors[0].message}`, 400)
    }
    return errorResponse("Failed to create project", 500)
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// GET /api/v1/projects/[id] — Get single project
// ══════════════════════════════════════════════════════════════════════════════

export async function GET_BY_ID(
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

    // Check permissions
    const isOwner = ctx.userId === project.ownerId
    const isAdmin = ctx.userRoles.includes("admin")

    if (!isOwner && !isAdmin) {
      return errorResponse("Access denied", 403)
    }

    return NextResponse.json({
      success: true,
      data: project,
    })
  } catch (error: any) {
    if (error.code === "PROJECT_NOT_FOUND") {
      return errorResponse("Project not found", 404)
    }
    return errorResponse("Failed to fetch project", 500)
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// PUT /api/v1/projects/[id] — Update project
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

    const project = await projectService.updateProject(id, { ...ctx, projectOwnerId: "" }, validated)

    return NextResponse.json({
      success: true,
      data: project,
    })
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
    return errorResponse("Failed to update project", 500)
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// DELETE /api/v1/projects/[id] — Delete project
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

    return NextResponse.json({
      success: true,
      message: "Project deleted",
    })
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
    return errorResponse("Failed to delete project", 500)
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// ADMIN ENDPOINTS
// ══════════════════════════════════════════════════════════════════════════════

/**
 * POST /api/v1/projects/[id]/submit
 * Porteur submits project for review
 */
export async function POST_SUBMIT(
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

    return NextResponse.json({
      success: true,
      data: project,
    })
  } catch (error: any) {
    if (error.code === "PROJECT_NOT_FOUND") {
      return errorResponse("Project not found", 404)
    }
    if (error.code === "INVALID_TRANSITION") {
      return errorResponse("Project not ready for submission", 400)
    }
    return errorResponse("Failed to submit project", 500)
  }
}

/**
 * POST /api/v1/projects/[id]/approve
 * Admin approves project for publication
 */
export async function POST_APPROVE(
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
    const project = await projectService.approveProject(id, ctx, body.moderationNote)

    return NextResponse.json({
      success: true,
      data: project,
    })
  } catch (error: any) {
    if (error.code === "ACCESS_DENIED") {
      return errorResponse("Only admins can approve", 403)
    }
    return errorResponse("Failed to approve project", 500)
  }
}

/**
 * POST /api/v1/projects/[id]/reject
 * Admin rejects project with feedback
 */
export async function POST_REJECT(
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
    const reason = body.reason || "No feedback provided"
    const project = await projectService.rejectProject(id, ctx, reason)

    return NextResponse.json({
      success: true,
      data: project,
    })
  } catch (error: any) {
    if (error.code === "ACCESS_DENIED") {
      return errorResponse("Only admins can reject", 403)
    }
    return errorResponse("Failed to reject project", 500)
  }
}
