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

async function resolveId(params: { id: string } | Promise<{ id: string }>) {
  const resolved = await Promise.resolve(params)
  return resolved.id
}

export async function POST(req: NextRequest, context: { params: { id: string } | Promise<{ id: string }> }) {
  try {
    const id = await resolveId(context.params)
    const ctx = await getAuthContext(req)
    if (!ctx) {
      return errorResponse("Unauthorized", 401)
    }

    let body: any = null
    try {
      body = await req.json()
    } catch {
      body = null
    }

    const reason = typeof body?.reason === "string" ? body.reason.trim() : ""
    if (!reason) {
      return errorResponse("reason is required", 400)
    }

    const project = await projectService.rejectProject(id, ctx, reason)

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
    return errorResponse("Failed to reject project", 500)
  }
}
