import { NextRequest, NextResponse } from "next/server"
import * as projectService from "@/lib/projects/v1-project-service"
import { getAuthContext, errorResponse } from "../../_helpers"

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const ctx = await getAuthContext(req)
    if (!ctx) return errorResponse("Unauthorized", 401)

    const project = await projectService.submitProjectForReview(id, ctx)
    return NextResponse.json({ success: true, data: project })
  } catch (error: any) {
    if (error.code === "PROJECT_NOT_FOUND") return errorResponse("Project not found", 404)
    if (error.code === "INVALID_TRANSITION") return errorResponse("Project not ready for submission", 400)
    return errorResponse("Failed to submit project", 500)
  }
}
