export type ProjectTechType = "video" | "audio" | "publication" | "culture"

export type ProjectStatus =
  | "draft"
  | "complete"
  | "pending_validation"
  | "published"
  | "rejected"
  | "archived"

export const PROJECT_SUPPORT_AMOUNTS = [2, 3, 4, 5, 10] as const

export interface ProjectDepositDraft {
  title?: string
  shortDescription?: string
  longDescription?: string

  techType?: ProjectTechType
  category?: string

  language?: string
  country?: string
  year?: number
  duration?: string
  ageRating?: string

  fullContentUrl?: string
  excerptUrl?: string
  thumbnailUrl?: string
  coverUrl?: string

  supportAmounts?: number[]

  legalAccepted?: boolean
  previewConfirmed?: boolean
}

export interface ProjectProgressStep {
  id: string
  label: string
  completed: boolean
}

export function buildProjectProgress(draft: ProjectDepositDraft): ProjectProgressStep[] {
  return [
    { id: "identity", label: "Informations générales", completed: Boolean(draft.title && draft.shortDescription && draft.longDescription && draft.category) },
    { id: "full-content", label: "Contenu complet", completed: Boolean(draft.fullContentUrl) },
    { id: "excerpt", label: "Extrait", completed: Boolean(draft.excerptUrl) },
    { id: "visual", label: "Miniature / couverture", completed: Boolean(draft.thumbnailUrl || draft.coverUrl) },
    { id: "support-amounts", label: "Montants de participation", completed: Boolean(draft.supportAmounts?.length) },
    { id: "legal", label: "Validation droits et CGU", completed: draft.legalAccepted === true },
    { id: "preview", label: "Prévisualisation", completed: draft.previewConfirmed === true },
  ]
}

export function getProjectProgressPercent(draft: ProjectDepositDraft): number {
  const steps = buildProjectProgress(draft)
  const done = steps.filter((step) => step.completed).length
  return Math.round((done / steps.length) * 100)
}

export function isProjectReadyForValidation(draft: ProjectDepositDraft): boolean {
  return buildProjectProgress(draft).every((step) => step.completed)
}

export function validateProjectSupportAmounts(amounts: number[]): boolean {
  return amounts.length > 0 && amounts.every((amount) =>
    PROJECT_SUPPORT_AMOUNTS.includes(amount as 2 | 3 | 4 | 5 | 10)
  )
}
