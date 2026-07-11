import { NextRequest, NextResponse } from "next/server"
import * as projectService from "@/lib/projects/v1-project-service"
import { getAuthContext, errorResponse } from "../../_helpers"

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const ctx = await getAuthContext(req)
    if (!ctx) return errorResponse("Unauthorized", 401)

    const body = await req.json()
    const project = await projectService.approveProject(id, ctx, body.moderationNote)
    return NextResponse.json({ success: true, data: project })
  } catch (error: any) {
    if (error.code === "ACCESS_DENIED") return errorResponse("Only admins can approve", 403)
    return errorResponse("Failed to approve project", 500)
  }
}
