/**
 * VIXUAL V1-001 — Project Types & Schemas
 *
 * Type definitions and Zod validation schemas for the creator project submission workflow.
 * Supports V1 feature set: draft → ready → pending → published/rejected
 */

import { z } from "zod";

// ════════════════════════════════════════════════════════════════════════════
// ENUMS & CONSTANTS
// ════════════════════════════════════════════════════════════════════════════

export const PROJECT_STATUSES = {
  draft: "draft", // incomplete or not yet submitted
  ready: "ready", // complete but not submitted
  pending: "pending", // submitted, awaiting moderation
  published: "published", // approved and visible
  rejected: "rejected", // rejected or returned for correction
} as const;

export type ProjectStatus = typeof PROJECT_STATUSES[keyof typeof PROJECT_STATUSES];

export const PROJECT_CATEGORIES = {
  audiovisuel: "Audiovisuel",
  litteraire: "Littéraire",
  podcast: "Podcast",
  savoirCulture: "Savoir & Culture",
} as const;

export type ProjectCategory = keyof typeof PROJECT_CATEGORIES;

export const PROJECT_SUB_CATEGORIES: Record<ProjectCategory, string[]> = {
  audiovisuel: ["Court métrage", "Long métrage", "Documentaire", "Animation", "Clip musical"],
  litteraire: ["Roman", "Nouvelle", "Essai", "Poésie", "Article"],
  podcast: ["Interview", "Série audio", "Documentaire sonore", "Débat", "Autre"],
  savoirCulture: ["Tutoriel", "Conférence", "Cours", "Guide pratique", "Autre"],
};

export const PARTICIPATION_PRICE_RANGES = {
  min: 2.0, // 2 EUR minimum
  max: 100.0, // 100 EUR maximum
  step: 0.5,
} as const;

// ════════════════════════════════════════════════════════════════════════════
// MEDIA TYPES
// ════════════════════════════════════════════════════════════════════════════

export interface ProjectMedia {
  /** Unique identifier for the media file */
  id: string;
  /** Type of media: excerpt (preview) or full (main content) */
  type: "excerpt" | "full";
  /** Original file name */
  fileName: string;
  /** File size in bytes */
  fileSize: number;
  /** MIME type (e.g., "video/mp4", "application/pdf") */
  mimeType: string;
  /** Storage URL (local path for V1, would be Bunny URL later) */
  storageUrl: string;
  /** Storage provider: 'local' for V1, 'bunny' for future */
  storageProvider: "local" | "bunny" | "aws";
  /** Upload status */
  status: "uploading" | "uploaded" | "failed" | "deleted";
  /** Additional metadata (duration, resolution, etc.) */
  metadata?: Record<string, unknown>;
  /** Creation timestamp */
  createdAt: string;
  /** Last update timestamp */
  updatedAt: string;
}

// ════════════════════════════════════════════════════════════════════════════
// PROJECT ENTITY
// ════════════════════════════════════════════════════════════════════════════

export interface Project {
  /** Unique identifier */
  id: string;
  /** Creator/Owner user ID */
  ownerId: string;
  /** Project title */
  title: string;
  /** URL-friendly slug */
  slug?: string;
  /** Detailed description */
  description: string;
  /** Main category */
  category: ProjectCategory;
  /** Sub-category within the main category */
  subCategory: string;
  /** Cover image URL (displayed in cards/listings) */
  coverImage?: string;
  /** Excerpt media (preview content) */
  excerptMedia?: ProjectMedia;
  /** Full media (main content) */
  fullMedia?: ProjectMedia;
  /** Participation price in EUR */
  participationPrice: number;
  /** Project status in the workflow */
  status: ProjectStatus;
  /** Moderation notes (admin only) */
  moderationNote?: string;
  /** Whether the project is featured on homepage */
  isFeatured: boolean;
  /** Creation timestamp */
  createdAt: string;
  /** Last update timestamp */
  updatedAt: string;
  /** Publication timestamp (set when status = 'published') */
  publishedAt?: string;
}

// ════════════════════════════════════════════════════════════════════════════
// DTO (API REQUEST/RESPONSE)
// ════════════════════════════════════════════════════════════════════════════

export interface CreateProjectDTO {
  title: string;
  description: string;
  category: ProjectCategory;
  subCategory: string;
  participationPrice?: number;
}

export interface UpdateProjectDTO {
  title?: string;
  description?: string;
  category?: ProjectCategory;
  subCategory?: string;
  coverImage?: string;
  participationPrice?: number;
  status?: ProjectStatus;
  moderationNote?: string;
  isFeatured?: boolean;
}

export interface ProjectListResponse {
  projects: Project[];
  total: number;
  page: number;
  pageSize: number;
}

// ════════════════════════════════════════════════════════════════════════════
// ZOD VALIDATION SCHEMAS
// ════════════════════════════════════════════════════════════════════════════

/**
 * Schema for creating a new project
 */
export const createProjectSchema = z.object({
  title: z
    .string()
    .min(3, "Le titre doit faire au moins 3 caractères")
    .max(255, "Le titre ne peut pas dépasser 255 caractères"),
  description: z
    .string()
    .min(10, "La description doit faire au moins 10 caractères")
    .max(5000, "La description ne peut pas dépasser 5000 caractères"),
  category: z.enum(Object.keys(PROJECT_CATEGORIES) as [ProjectCategory, ...ProjectCategory[]]),
  subCategory: z.string().min(1, "Veuillez sélectionner une sous-catégorie"),
  participationPrice: z
    .number()
    .optional()
    .default(0)
    .refine(
      (val) => val >= PARTICIPATION_PRICE_RANGES.min && val <= PARTICIPATION_PRICE_RANGES.max,
      `Le prix doit être entre ${PARTICIPATION_PRICE_RANGES.min}€ et ${PARTICIPATION_PRICE_RANGES.max}€`
    ),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;

/**
 * Schema for updating a project
 */
export const updateProjectSchema = z.object({
  title: z
    .string()
    .min(3, "Le titre doit faire au moins 3 caractères")
    .max(255, "Le titre ne peut pas dépasser 255 caractères")
    .optional(),
  description: z
    .string()
    .min(10, "La description doit faire au moins 10 caractères")
    .max(5000, "La description ne peut pas dépasser 5000 caractères")
    .optional(),
  category: z.enum(Object.keys(PROJECT_CATEGORIES) as [ProjectCategory, ...ProjectCategory[]]).optional(),
  subCategory: z.string().min(1, "Veuillez sélectionner une sous-catégorie").optional(),
  coverImage: z.string().url().optional(),
  participationPrice: z
    .number()
    .refine(
      (val) => val >= PARTICIPATION_PRICE_RANGES.min && val <= PARTICIPATION_PRICE_RANGES.max,
      `Le prix doit être entre ${PARTICIPATION_PRICE_RANGES.min}€ et ${PARTICIPATION_PRICE_RANGES.max}€`
    )
    .optional(),
  status: z.enum(Object.values(PROJECT_STATUSES) as [ProjectStatus, ...ProjectStatus[]]).optional(),
  moderationNote: z.string().optional(),
  isFeatured: z.boolean().optional(),
});

export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;

/**
 * Schema for requesting project publication
 */
export const submitProjectSchema = z.object({
  projectId: z.string().uuid("Invalid project ID"),
});

export type SubmitProjectInput = z.infer<typeof submitProjectSchema>;

/**
 * Schema for media upload metadata
 */
export const mediaUploadSchema = z.object({
  projectId: z.string().uuid("Invalid project ID"),
  mediaType: z.enum(["excerpt", "full"]),
  fileName: z.string().min(1),
  fileSize: z.number().positive(),
  mimeType: z.string(),
});

export type MediaUploadInput = z.infer<typeof mediaUploadSchema>;

/**
 * Helper to validate project status is editable
 */
export function isProjectEditable(status: ProjectStatus): boolean {
  return status === "draft" || status === "ready" || status === "rejected";
}

/**
 * Helper to check if project can be submitted for publication
 */
export function canSubmitForPublication(project: Project): boolean {
  return (
    project.status === "ready" ||
    (project.status === "rejected" && project.moderationNote !== undefined)
  );
}

/**
 * Helper to get readable status label
 */
export function getProjectStatusLabel(status: ProjectStatus): string {
  const labels: Record<ProjectStatus, string> = {
    draft: "Brouillon",
    ready: "Prêt à publier",
    pending: "En attente de modération",
    published: "Publié",
    rejected: "Rejeté",
  };
  return labels[status];
}

/**
 * Helper to get status badge color
 */
export function getProjectStatusColor(
  status: ProjectStatus
): "default" | "secondary" | "destructive" | "outline" | "success" | "warning" {
  const colors: Record<ProjectStatus, "default" | "secondary" | "destructive" | "outline" | "success" | "warning"> = {
    draft: "outline",
    ready: "secondary",
    pending: "warning",
    published: "success",
    rejected: "destructive",
  };
  return colors[status];
}
