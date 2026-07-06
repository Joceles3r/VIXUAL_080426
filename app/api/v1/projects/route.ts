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
import * as projectService from "@/lib/projects/v1-project-service"
import { CreateProjectSchema } from "@/lib/projects/v1-project"
import { getAuthContext, errorResponse } from "./_lib/auth"

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

