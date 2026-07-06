/**
 * VIXUAL V1-001 — Shared helpers for project API routes
 *
 * getAuthContext: extract and verify JWT session cookie
 * errorResponse:  standard JSON error response
 */

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

    // projectOwnerId is left empty here; service methods resolve it from the DB
    return { userId, userRoles: roles, projectOwnerId: "" }
  } catch {
    return null
  }
}

export function errorResponse(message: string, status: number = 400) {
  return NextResponse.json({ success: false, error: message }, { status })
}
