/**
 * VIXUAL V1-001 — Project Types & Business Logic
 *
 * Defines all types for the PORTEUR project submission module.
 * Uses the `projects` table schema (v1-specific, separate from `contents`).
 */

import { z } from "zod"

// ══════════════════════════════════════════════════════════════════════════════
// STATUTS
// ══════════════════════════════════════════════════════════════════════════════

export type ProjectStatus = "draft" | "ready" | "pending" | "published" | "rejected"

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  draft: "Brouillon",
  ready: "Prêt à soumettre",
  pending: "En attente de validation",
  published: "Publié",
  rejected: "Refusé",
}

export const PROJECT_STATUS_DESCRIPTIONS: Record<ProjectStatus, string> = {
  draft: "Projet incomplet ou non soumis",
  ready: "Projet complet, prêt pour soumission",
  pending: "En attente de validation par l'admin",
  published: "Visible publiquement et accepté",
  rejected: "Refusé ou à corriger",
}

// ══════════════════════════════════════════════════════════════════════════════
// TYPES D'INTERFACE
// ══════════════════════════════════════════════════════════════════════════════

export interface ProjectMedia {
  id?: string
  projectId?: string
  mediaType: "excerpt" | "full"
  fileName: string
  fileSize: number
  mimeType: string
  storageUrl: string
  storageProvider: "local" | "bunny" | "aws"
  status: "uploading" | "uploaded" | "failed" | "deleted"
  createdAt?: string
  updatedAt?: string
}

export interface ProjectV1 {
  id: string
  ownerId: string
  ownerEmail?: string
  title: string
  slug?: string
  description: string
  category: string
  subCategory?: string
  coverImage: string // URL or data URL
  excerptMedia?: string // URL or data URL
  fullMedia?: string // URL or data URL
  participationPrice: number // EUR, e.g., 5.00
  status: ProjectStatus
  moderationNote?: string
  isFeatured?: boolean
  createdAt: string // ISO timestamp
  updatedAt: string // ISO timestamp
  publishedAt?: string // ISO timestamp
}

export interface ProjectAuditLog {
  id: string
  projectId: string
  ownerId: string
  action: string
  oldStatus?: ProjectStatus
  newStatus?: ProjectStatus
  reason?: string
  createdAt: string
}

// ══════════════════════════════════════════════════════════════════════════════
// FORM & CREATION TYPES
// ══════════════════════════════════════════════════════════════════════════════

export interface CreateProjectInput {
  title: string
  description: string
  category: string
  subCategory?: string
  coverImage?: string
  excerptMedia?: string
  fullMedia?: string
  participationPrice: number
}

export interface UpdateProjectInput {
  title?: string
  description?: string
  category?: string
  subCategory?: string
  coverImage?: string
  excerptMedia?: string
  fullMedia?: string
  participationPrice?: number
  status?: ProjectStatus
  moderationNote?: string
}

// ══════════════════════════════════════════════════════════════════════════════
// PROGRESS TRACKING
// ══════════════════════════════════════════════════════════════════════════════

export interface ProjectProgressStep {
  id: string
  label: string
  completed: boolean
  required: boolean
}

export function buildProjectProgress(project: Partial<ProjectV1>): ProjectProgressStep[] {
  return [
    {
      id: "info",
      label: "Infos générales",
      completed: !!(project.title && project.description && project.category),
      required: true,
    },
    {
      id: "cover",
      label: "Image de couverture",
      completed: !!project.coverImage,
      required: true,
    },
    {
      id: "excerpt",
      label: "Extrait / aperçu",
      completed: !!project.excerptMedia,
      required: true,
    },
    {
      id: "full-media",
      label: "Contenu complet",
      completed: !!project.fullMedia,
      required: true,
    },
    {
      id: "price",
      label: "Prix de participation",
      completed: project.participationPrice !== undefined && project.participationPrice > 0,
      required: true,
    },
  ]
}

export function getProjectProgressPercent(project: Partial<ProjectV1>): number {
  const steps = buildProjectProgress(project)
  const completed = steps.filter((s) => s.completed).length
  return Math.round((completed / steps.length) * 100)
}

export function isProjectReadyForSubmission(project: Partial<ProjectV1>): boolean {
  const steps = buildProjectProgress(project)
  return steps.every((s) => !s.required || s.completed)
}

// ══════════════════════════════════════════════════════════════════════════════
// VALIDATION SCHEMAS
// ══════════════════════════════════════════════════════════════════════════════

export const CreateProjectSchema = z.object({
  title: z.string().min(3, "Titre min 3 chars").max(255),
  description: z.string().min(20, "Description min 20 chars").max(5000),
  category: z.string().min(1, "Catégorie requise"),
  subCategory: z.string().optional(),
  coverImage: z.string().url().or(z.string().startsWith("data:")).optional(),
  excerptMedia: z.string().url().or(z.string().startsWith("data:")).optional(),
  fullMedia: z.string().url().or(z.string().startsWith("data:")).optional(),
  participationPrice: z.number().positive("Prix > 0").max(1000),
})

export const UpdateProjectSchema = z.object({
  title: z.string().min(3).max(255).optional(),
  description: z.string().min(20).max(5000).optional(),
  category: z.string().optional(),
  subCategory: z.string().optional(),
  coverImage: z.string().optional(),
  excerptMedia: z.string().optional(),
  fullMedia: z.string().optional(),
  participationPrice: z.number().positive().max(1000).optional(),
  status: z.enum(["draft", "ready", "pending", "published", "rejected"]).optional(),
  moderationNote: z.string().optional(),
})

// ══════════════════════════════════════════════════════════════════════════════
// PERMISSIONS
// ══════════════════════════════════════════════════════════════════════════════

export interface PermissionContext {
  userId: string
  userRoles: string[]
  projectOwnerId: string
}

/**
 * Vérifie si l'utilisateur peut modifier ce projet
 */
export function canEditProject(ctx: PermissionContext): boolean {
  const isOwner = ctx.userId === ctx.projectOwnerId
  const isAdmin = ctx.userRoles.includes("admin")
  return isOwner || isAdmin
}

/**
 * Vérifie si le projet peut être modifié
 */
export function canProjectStatusTransition(from: ProjectStatus, to: ProjectStatus): boolean {
  const allowedTransitions: Record<ProjectStatus, ProjectStatus[]> = {
    draft: ["draft", "ready", "pending"], // Can save, mark ready, or submit
    ready: ["draft", "ready", "pending"], // Can go back to draft or submit
    pending: ["pending", "published", "rejected"], // Admin only
    published: ["published"], // Published projects don't change status
    rejected: ["draft", "ready", "pending"], // Can resubmit after correction
  }
  return allowedTransitions[from]?.includes(to) ?? false
}

/**
 * Vérifie si le projet est éditable
 */
export function isProjectEditable(status: ProjectStatus): boolean {
  return ["draft", "ready", "rejected"].includes(status)
}

// ══════════════════════════════════════════════════════════════════════════════
// MEDIA STORAGE HELPERS
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Détecte si une URL est un data URL (local storage)
 */
export function isDataUrl(url?: string): boolean {
  return url?.startsWith("data:") ?? false
}

/**
 * Génère une clé de stockage pour un fichier média
 */
export function generateMediaStorageKey(projectId: string, mediaType: "excerpt" | "full"): string {
  return `projects/${projectId}/${mediaType}-${Date.now()}`
}
