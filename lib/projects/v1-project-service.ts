/**
 * VIXUAL V1-001 — Project Service (Server-side)
 *
 * Handles all project operations: CRUD, validation, permissions, audit logging.
 * All database operations go through this service.
 */

import "server-only"
import { sql } from "@/lib/db"
import {
  ProjectV1,
  ProjectStatus,
  CreateProjectInput,
  UpdateProjectInput,
  ProjectAuditLog,
  canEditProject,
  canProjectStatusTransition,
  isProjectEditable,
  PermissionContext,
} from "./v1-project"

// ══════════════════════════════════════════════════════════════════════════════
// ERRORS
// ══════════════════════════════════════════════════════════════════════════════

export class ProjectError extends Error {
  constructor(
    message: string,
    public code: string
  ) {
    super(message)
  }
}

export class ProjectNotFoundError extends ProjectError {
  constructor(projectId: string) {
    super(`Project ${projectId} not found`, "PROJECT_NOT_FOUND")
  }
}

export class ProjectAccessDeniedError extends ProjectError {
  constructor() {
    super("You don't have permission to access this project", "ACCESS_DENIED")
  }
}

export class ProjectStatusTransitionError extends ProjectError {
  constructor(from: ProjectStatus, to: ProjectStatus) {
    super(`Cannot transition from ${from} to ${to}`, "INVALID_TRANSITION")
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// CREATE
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Create a new project draft for a creator
 */
export async function createProject(
  ownerId: string,
  data: CreateProjectInput
): Promise<ProjectV1> {
  const slug = data.title
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 100)

  const result = await sql`
    INSERT INTO projects (
      owner_id,
      title,
      slug,
      description,
      category,
      sub_category,
      cover_image,
      excerpt_media,
      full_media,
      participation_price,
      status
    ) VALUES (
      ${ownerId},
      ${data.title},
      ${slug},
      ${data.description},
      ${data.category},
      ${data.subCategory || null},
      ${data.coverImage || null},
      ${data.excerptMedia || null},
      ${data.fullMedia || null},
      ${data.participationPrice},
      'draft'
    )
    RETURNING *
  `

  if (result.length === 0) {
    throw new ProjectError("Failed to create project", "CREATE_FAILED")
  }

  return dbRowToProject(result[0])
}

// ══════════════════════════════════════════════════════════════════════════════
// READ
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Get a single project by ID
 */
export async function getProject(projectId: string): Promise<ProjectV1> {
  const result = await sql`
    SELECT * FROM projects WHERE id = ${projectId}
  `

  if (result.length === 0) {
    throw new ProjectNotFoundError(projectId)
  }

  return dbRowToProject(result[0])
}

/**
 * Get all projects by owner (paginated)
 */
export async function getProjectsByOwner(
  ownerId: string,
  limit: number = 50,
  offset: number = 0
): Promise<{ projects: ProjectV1[]; total: number }> {
  const projects = await sql`
    SELECT * FROM projects
    WHERE owner_id = ${ownerId}
    ORDER BY updated_at DESC
    LIMIT ${limit} OFFSET ${offset}
  `

  const countResult = await sql`
    SELECT COUNT(*) as count FROM projects WHERE owner_id = ${ownerId}
  `

  const total = (countResult[0] as any)?.count || 0

  return {
    projects: projects.map(dbRowToProject),
    total,
  }
}

/**
 * Get projects pending moderation (admin only)
 */
export async function getPendingProjects(
  limit: number = 50,
  offset: number = 0
): Promise<{ projects: ProjectV1[]; total: number }> {
  const projects = await sql`
    SELECT * FROM projects
    WHERE status = 'pending'
    ORDER BY updated_at ASC
    LIMIT ${limit} OFFSET ${offset}
  `

  const countResult = await sql`
    SELECT COUNT(*) as count FROM projects WHERE status = 'pending'
  `

  const total = (countResult[0] as any)?.count || 0

  return {
    projects: projects.map(dbRowToProject),
    total,
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// UPDATE
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Update a project (with permission check)
 */
export async function updateProject(
  projectId: string,
  ctx: PermissionContext,
  data: UpdateProjectInput
): Promise<ProjectV1> {
  // Get current project
  const current = await getProject(projectId)

  // Permission check
  if (!canEditProject({ ...ctx, projectOwnerId: current.ownerId })) {
    throw new ProjectAccessDeniedError()
  }

  // Status validation
  if (data.status && !canProjectStatusTransition(current.status, data.status)) {
    throw new ProjectStatusTransitionError(current.status, data.status)
  }

  // Requête statique et paramétrée : évite sql.unsafe et les injections SQL.
  // Les tests `!== undefined` permettent aussi d'enregistrer explicitement null.
  const result = await sql`
    UPDATE projects
    SET
      title = CASE
        WHEN ${data.title !== undefined} THEN ${data.title ?? null}
        ELSE title
      END,
      description = CASE
        WHEN ${data.description !== undefined} THEN ${data.description ?? null}
        ELSE description
      END,
      category = CASE
        WHEN ${data.category !== undefined} THEN ${data.category ?? null}
        ELSE category
      END,
      sub_category = CASE
        WHEN ${data.subCategory !== undefined} THEN ${data.subCategory ?? null}
        ELSE sub_category
      END,
      cover_image = CASE
        WHEN ${data.coverImage !== undefined} THEN ${data.coverImage ?? null}
        ELSE cover_image
      END,
      excerpt_media = CASE
        WHEN ${data.excerptMedia !== undefined} THEN ${data.excerptMedia ?? null}
        ELSE excerpt_media
      END,
      full_media = CASE
        WHEN ${data.fullMedia !== undefined} THEN ${data.fullMedia ?? null}
        ELSE full_media
      END,
      participation_price = CASE
        WHEN ${data.participationPrice !== undefined} THEN ${data.participationPrice ?? null}
        ELSE participation_price
      END,
      status = CASE
        WHEN ${data.status !== undefined} THEN ${data.status ?? null}
        ELSE status
      END,
      moderation_note = CASE
        WHEN ${data.moderationNote !== undefined} THEN ${data.moderationNote ?? null}
        ELSE moderation_note
      END,
      updated_at = NOW()
    WHERE id = ${projectId}::uuid
    RETURNING *
  `

  if (result.length === 0) {
    throw new ProjectNotFoundError(projectId)
  }

  const updated = dbRowToProject(result[0])

  // Log to audit
  if (data.status && data.status !== current.status) {
    await logProjectAudit({
      projectId,
      ownerId: current.ownerId,
      action: "status_changed",
      oldStatus: current.status,
      newStatus: data.status,
      reason: data.moderationNote,
    })
  }

  return updated
}

/**
 * Submit a project for publication (porteur only)
 */
export async function submitProjectForReview(
  projectId: string,
  ctx: PermissionContext
): Promise<ProjectV1> {
  const current = await getProject(projectId)

  // Permission check
  if (!canEditProject({ ...ctx, projectOwnerId: current.ownerId })) {
    throw new ProjectAccessDeniedError()
  }

  // Can only submit from ready or rejected
  if (!["ready", "rejected"].includes(current.status)) {
    throw new ProjectStatusTransitionError(current.status, "pending")
  }

  return updateProject(projectId, ctx, { status: "pending" })
}

/**
 * Approve project for publication (admin only)
 */
export async function approveProject(
  projectId: string,
  ctx: PermissionContext,
  moderationNote?: string
): Promise<ProjectV1> {
  if (!ctx.userRoles.includes("admin")) {
    throw new ProjectAccessDeniedError()
  }

  const current = await getProject(projectId)

  if (current.status !== "pending") {
    throw new ProjectStatusTransitionError(current.status, "published")
  }

  return updateProject(projectId, ctx, {
    status: "published",
    moderationNote,
  })
}

/**
 * Reject project with feedback (admin only)
 */
export async function rejectProject(
  projectId: string,
  ctx: PermissionContext,
  reason: string
): Promise<ProjectV1> {
  if (!ctx.userRoles.includes("admin")) {
    throw new ProjectAccessDeniedError()
  }

  const current = await getProject(projectId)

  if (current.status !== "pending") {
    throw new ProjectStatusTransitionError(current.status, "rejected")
  }

  return updateProject(projectId, ctx, {
    status: "rejected",
    moderationNote: reason,
  })
}

// ══════════════════════════════════════════════════════════════════════════════
// DELETE
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Delete a project (draft or rejected only)
 */
export async function deleteProject(
  projectId: string,
  ctx: PermissionContext
): Promise<void> {
  const current = await getProject(projectId)

  // Permission check
  if (!canEditProject({ ...ctx, projectOwnerId: current.ownerId })) {
    throw new ProjectAccessDeniedError()
  }

  // Can only delete drafts or rejected
  if (!["draft", "rejected"].includes(current.status)) {
    throw new ProjectError(
      `Cannot delete ${current.status} project`,
      "CANNOT_DELETE"
    )
  }

  await sql`DELETE FROM projects WHERE id = ${projectId}`
}

// ══════════════════════════════════════════════════════════════════════════════
// AUDIT LOGGING
// ══════════════════════════════════════════════════════════════════════════════

export interface AuditLogInput {
  projectId: string
  ownerId: string
  action: string
  oldStatus?: ProjectStatus
  newStatus?: ProjectStatus
  reason?: string
}

export async function logProjectAudit(input: AuditLogInput): Promise<void> {
  await sql`
    INSERT INTO projects_audit_log (
      project_id,
      owner_id,
      action,
      old_status,
      new_status,
      reason
    ) VALUES (
      ${input.projectId},
      ${input.ownerId},
      ${input.action},
      ${input.oldStatus || null},
      ${input.newStatus || null},
      ${input.reason || null}
    )
  `
}

/**
 * Get audit log for a project
 */
export async function getProjectAuditLog(projectId: string): Promise<ProjectAuditLog[]> {
  const result = await sql`
    SELECT * FROM projects_audit_log
    WHERE project_id = ${projectId}
    ORDER BY created_at DESC
  `

  return result.map((row: any) => ({
    id: row.id,
    projectId: row.project_id,
    ownerId: row.owner_id,
    action: row.action,
    oldStatus: row.old_status,
    newStatus: row.new_status,
    reason: row.reason,
    createdAt: new Date(row.created_at).toISOString(),
  }))
}

// ══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ══════════════════════════════════════════════════════════════════════════════

function dbRowToProject(row: any): ProjectV1 {
  return {
    id: row.id,
    ownerId: row.owner_id,
    title: row.title,
    slug: row.slug,
    description: row.description,
    category: row.category,
    subCategory: row.sub_category,
    coverImage: row.cover_image,
    excerptMedia: row.excerpt_media,
    fullMedia: row.full_media,
    participationPrice: parseFloat(row.participation_price),
    status: row.status,
    moderationNote: row.moderation_note,
    isFeatured: row.is_featured,
    createdAt: new Date(row.created_at).toISOString(),
    updatedAt: new Date(row.updated_at).toISOString(),
    publishedAt: row.published_at ? new Date(row.published_at).toISOString() : undefined,
  }
}
