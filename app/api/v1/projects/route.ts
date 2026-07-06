/**
 * VIXUAL V1-001 — Project API Route
 *
 * GET  /api/v1/projects  — list projects by owner
 * POST /api/v1/projects  — create a new draft project
 *
 * Per-project routes live in [id]/route.ts
 * Submission / admin actions in [id]/submit, [id]/approve, [id]/reject
 */

import { NextRequest, NextResponse } from "next/server"
import { jwtVerify } from "jose"
import { JWT_SECRET } from "@/lib/auth/jwt"
import * as projectService from "@/lib/projects/v1-project-service"
import { CreateProjectSchema } from "@/lib/projects/v1-project"
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

