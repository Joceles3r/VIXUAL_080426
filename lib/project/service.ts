/**
 * VIXUAL V1-001 — Project Service (Server-side)
 *
 * Server-side helpers for project operations: CRUD, permissions, validation.
 * All database operations go through this service.
 */

import "server-only";
import { sql } from "@/lib/db";
import {
  Project,
  ProjectStatus,
  CreateProjectInput,
  UpdateProjectInput,
  isProjectEditable,
} from "@/lib/project/types";

// ════════════════════════════════════════════════════════════════════════════
// CREATE
// ════════════════════════════════════════════════════════════════════════════

/**
 * Create a new project draft for a creator
 */
export async function createProject(
  ownerId: string,
  data: CreateProjectInput
): Promise<Project> {
  try {
    const slug = data.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    const rows = await sql`
      INSERT INTO projects (
        owner_id,
        title,
        slug,
        description,
        category,
        sub_category,
        participation_price,
        status
      )
      VALUES (
        ${ownerId}::uuid,
        ${data.title},
        ${slug},
        ${data.description},
        ${data.category},
        ${data.subCategory},
        ${data.participationPrice || 0},
        'draft'
      )
      RETURNING *
    `;

    return mapRowToProject(rows[0]);
  } catch (error) {
    console.error("[ProjectService] Failed to create project:", error);
    throw new Error("Impossible de créer le projet");
  }
}

// ════════════════════════════════════════════════════════════════════════════
// READ
// ════════════════════════════════════════════════════════════════════════════

/**
 * Get a single project by ID with ownership check
 */
export async function getProjectById(projectId: string, ownerId?: string): Promise<Project | null> {
  try {
    let query = sql`SELECT * FROM projects WHERE id = ${projectId}::uuid`;

    if (ownerId) {
      // If ownerId provided, verify ownership
      query = sql`SELECT * FROM projects WHERE id = ${projectId}::uuid AND owner_id = ${ownerId}::uuid`;
    }

    const rows = await query;
    if (!rows || rows.length === 0) return null;

    return mapRowToProject(rows[0]);
  } catch (error) {
    console.error("[ProjectService] Failed to fetch project:", error);
    return null;
  }
}

/**
 * Get all projects for a creator
 */
export async function getCreatorProjects(
  ownerId: string,
  filters?: {
    status?: ProjectStatus;
    limit?: number;
    offset?: number;
  }
): Promise<{ projects: Project[]; total: number }> {
  try {
    const limit = filters?.limit || 50;
    const offset = filters?.offset || 0;

    let query = sql`SELECT * FROM projects WHERE owner_id = ${ownerId}::uuid`;

    if (filters?.status) {
      query = sql`SELECT * FROM projects WHERE owner_id = ${ownerId}::uuid AND status = ${filters.status}`;
    }

    // Get total count
    const countRows = await sql`
      SELECT COUNT(*) as count FROM projects WHERE owner_id = ${ownerId}::uuid
      ${filters?.status ? sql`AND status = ${filters.status}` : sql``}
    `;
    const total = (countRows[0] as { count: number }).count;

    // Get paginated results
    const rows = await sql`
      ${query}
      ORDER BY updated_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    return {
      projects: (rows || []).map(mapRowToProject),
      total,
    };
  } catch (error) {
    console.error("[ProjectService] Failed to fetch creator projects:", error);
    return { projects: [], total: 0 };
  }
}

/**
 * Get published projects (public listing)
 */
export async function getPublishedProjects(
  filters?: {
    category?: string;
    limit?: number;
    offset?: number;
  }
): Promise<{ projects: Project[]; total: number }> {
  try {
    const limit = filters?.limit || 20;
    const offset = filters?.offset || 0;

    let whereClause = sql`WHERE status = 'published'`;
    if (filters?.category) {
      whereClause = sql`WHERE status = 'published' AND category = ${filters.category}`;
    }

    const countRows = await sql`SELECT COUNT(*) as count FROM projects ${whereClause}`;
    const total = (countRows[0] as { count: number }).count;

    const rows = await sql`
      SELECT * FROM projects
      ${whereClause}
      ORDER BY published_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    return {
      projects: (rows || []).map(mapRowToProject),
      total,
    };
  } catch (error) {
    console.error("[ProjectService] Failed to fetch published projects:", error);
    return { projects: [], total: 0 };
  }
}

// ════════════════════════════════════════════════════════════════════════════
// UPDATE
// ════════════════════════════════════════════════════════════════════════════

/**
 * Update a project (only editable statuses)
 */
export async function updateProject(
  projectId: string,
  ownerId: string,
  data: UpdateProjectInput
): Promise<Project> {
  try {
    // Verify ownership and editable status
    const existing = await getProjectById(projectId, ownerId);
    if (!existing) {
      throw new Error("Projet non trouvé ou accès refusé");
    }

    if (!isProjectEditable(existing.status)) {
      throw new Error("Ce projet ne peut pas être modifié dans son état actuel");
    }

    // Build update query dynamically
    const updates: { key: string; value: unknown }[] = [];

    if (data.title) updates.push({ key: "title", value: data.title });
    if (data.description) updates.push({ key: "description", value: data.description });
    if (data.category) updates.push({ key: "category", value: data.category });
    if (data.subCategory) updates.push({ key: "sub_category", value: data.subCategory });
    if (data.coverImage !== undefined) updates.push({ key: "cover_image", value: data.coverImage });
    if (data.participationPrice !== undefined) {
      updates.push({ key: "participation_price", value: data.participationPrice });
    }

    if (updates.length === 0) {
      return existing; // No updates
    }

    // Add updated_at
    updates.push({ key: "updated_at", value: new Date() });

    // Build SET clause
    const setClause = updates.map((u) => `${u.key} = $${updates.indexOf(u) + 1}`).join(", ");
    const values = updates.map((u) => u.value);

    const rows = await sql`
      UPDATE projects
      SET ${sql.unsafe(setClause)}
      WHERE id = ${projectId}::uuid AND owner_id = ${ownerId}::uuid
      RETURNING *
    `;

    if (!rows || rows.length === 0) {
      throw new Error("Impossible de mettre à jour le projet");
    }

    return mapRowToProject(rows[0]);
  } catch (error) {
    console.error("[ProjectService] Failed to update project:", error);
    throw error instanceof Error ? error : new Error("Erreur lors de la mise à jour");
  }
}

/**
 * Change project status (admin or creator submission)
 */
export async function updateProjectStatus(
  projectId: string,
  newStatus: ProjectStatus,
  ownerId?: string,
  moderationNote?: string
): Promise<Project> {
  try {
    let query;

    if (ownerId) {
      // Creator submitting for publication
      if (newStatus !== "pending") {
        throw new Error("Les créateurs ne peuvent que soumettre (pending)");
      }
      query = sql`
        UPDATE projects
        SET status = ${newStatus}, updated_at = now()
        WHERE id = ${projectId}::uuid AND owner_id = ${ownerId}::uuid
        RETURNING *
      `;
    } else {
      // Admin action
      query = sql`
        UPDATE projects
        SET status = ${newStatus}, moderation_note = ${moderationNote || null}, updated_at = now()
        ${newStatus === "published" ? sql``, published_at = now()`` : sql``}
        WHERE id = ${projectId}::uuid
        RETURNING *
      `;
    }

    const rows = await query;

    if (!rows || rows.length === 0) {
      throw new Error("Impossible de mettre à jour le statut");
    }

    // Log the change
    await logProjectAudit(projectId, ownerId || "admin", "status_change", newStatus, moderationNote);

    return mapRowToProject(rows[0]);
  } catch (error) {
    console.error("[ProjectService] Failed to update project status:", error);
    throw error instanceof Error ? error : new Error("Erreur lors de la mise à jour du statut");
  }
}

// ════════════════════════════════════════════════════════════════════════════
// DELETE
// ════════════════════════════════════════════════════════════════════════════

/**
 * Delete a project (only drafts or by admin)
 */
export async function deleteProject(projectId: string, ownerId: string): Promise<boolean> {
  try {
    // Check ownership and status
    const project = await getProjectById(projectId, ownerId);
    if (!project) {
      throw new Error("Projet non trouvé ou accès refusé");
    }

    if (project.status !== "draft") {
      throw new Error("Seuls les brouillons peuvent être supprimés");
    }

    await sql`DELETE FROM projects WHERE id = ${projectId}::uuid AND owner_id = ${ownerId}::uuid`;
    return true;
  } catch (error) {
    console.error("[ProjectService] Failed to delete project:", error);
    throw error instanceof Error ? error : new Error("Impossible de supprimer le projet");
  }
}

// ════════════════════════════════════════════════════════════════════════════
// AUDIT & LOGGING
// ════════════════════════════════════════════════════════════════════════════

/**
 * Log project changes for audit trail
 */
async function logProjectAudit(
  projectId: string,
  userId: string,
  action: string,
  newStatus?: ProjectStatus,
  reason?: string
): Promise<void> {
  try {
    await sql`
      INSERT INTO projects_audit_log (project_id, owner_id, action, new_status, reason)
      VALUES (
        ${projectId}::uuid,
        ${userId}::uuid,
        ${action},
        ${newStatus || null},
        ${reason || null}
      )
    `;
  } catch (error) {
    console.error("[ProjectService] Failed to log audit:", error);
    // Don't throw - audit logging shouldn't block operations
  }
}

// ════════════════════════════════════════════════════════════════════════════
// HELPERS
// ════════════════════════════════════════════════════════════════════════════

/**
 * Convert database row to Project entity
 */
function mapRowToProject(row: any): Project {
  return {
    id: row.id,
    ownerId: row.owner_id,
    title: row.title,
    slug: row.slug,
    description: row.description,
    category: row.category,
    subCategory: row.sub_category,
    coverImage: row.cover_image,
    participationPrice: parseFloat(row.participation_price || 0),
    status: row.status,
    moderationNote: row.moderation_note,
    isFeatured: row.is_featured || false,
    createdAt: row.created_at?.toISOString() || new Date().toISOString(),
    updatedAt: row.updated_at?.toISOString() || new Date().toISOString(),
    publishedAt: row.published_at?.toISOString(),
  };
}

/**
 * Check if user can manage this project
 */
export function canManageProject(project: Project, userId: string, isAdmin: boolean): boolean {
  return isAdmin || project.ownerId === userId;
}

/**
 * Check if user can submit this project for publication
 */
export function canSubmitProject(project: Project, userId: string): boolean {
  return (
    project.ownerId === userId &&
    (project.status === "ready" || project.status === "rejected")
  );
}
