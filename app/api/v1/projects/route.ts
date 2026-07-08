/**
 * VIXUAL V1-001 — Project API Route
 *
 * Collection endpoints:
 * GET  /api/v1/projects
 * POST /api/v1/projects
 *
 * Dynamic routes are handled in:
 * app/api/v1/projects/[id]/route.ts         — GET, PUT, DELETE
 * app/api/v1/projects/[id]/submit/route.ts  — POST
 * app/api/v1/projects/[id]/approve/route.ts — POST
 * app/api/v1/projects/[id]/reject/route.ts  — POST
 */

import { NextRequest, NextResponse } from "next/server"
import * as projectService from "@/lib/projects/v1-project-service"
import { CreateProjectSchema } from "@/lib/projects/v1-project"
import { getAuthContext, errorResponse } from "./_helpers"

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
