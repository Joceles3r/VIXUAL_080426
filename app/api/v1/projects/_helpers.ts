import { NextRequest, NextResponse } from "next/server"
import { jwtVerify } from "jose"
import { JWT_SECRET } from "@/lib/auth/jwt"
import type { PermissionContext } from "@/lib/projects/v1-project"

export async function getAuthContext(req: NextRequest): Promise<PermissionContext | null> {
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

export function errorResponse(message: string, status = 400) {
  return NextResponse.json({ success: false, error: message }, { status })
}
