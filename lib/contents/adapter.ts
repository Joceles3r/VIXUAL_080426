/**
 * VIXUAL — lib/contents/adapter.ts
 *
 * Adaptateur DB → interface Content (compatible mock-data).
 * Permet de basculer transparently entre mocks et vraies donnees BD.
 */

import type { Content, ContentType } from "@/lib/mock-data"

/** Ligne brute renvoyee par la table `contents` */
export interface ContentDbRow {
  id: string
  creator_id: string
  creator_name?: string | null
  title: string
  description: string | null
  content_type: string
  category: string | null
  cover_url: string | null
  media_url: string | null
  duration: string | null
  word_count: number | null
  episode_count: number | null
  investment_goal: number | null
  current_investment: number | null
  contributor_count: number | null
  total_votes: number | null
  is_free: boolean | null
  is_published: boolean | null
  created_at: string | Date
  bunny_video_id?: string | null
  bunny_status?: string | null
}

/** Convertit une ligne BD en interface Content (UI mock-compatible). */
export function dbRowToContent(row: ContentDbRow): Content {
  const contentType = (
    row.content_type === "video" || row.content_type === "text" || row.content_type === "podcast"
      ? row.content_type
      : "video"
  ) as ContentType

  const created = typeof row.created_at === "string"
    ? row.created_at
    : new Date(row.created_at).toISOString()

  return {
    id: row.id,
    title: row.title,
    description: row.description ?? "",
    contentType,
    coverUrl: row.cover_url ?? "/placeholder.svg",
    creatorName: row.creator_name ?? "Createur VIXUAL",
    creatorId: row.creator_id,
    createdAt: created,
    investmentGoal: row.investment_goal ?? 0,
    currentInvestment: row.current_investment ?? 0,
    contributorCount: row.contributor_count ?? 0,
    investorCount: row.contributor_count ?? 0, // alias compat
    totalVotes: row.total_votes ?? 0,
    isFree: row.is_free ?? false,
    category: row.category ?? "general",
    duration: row.duration ?? undefined,
    wordCount: row.word_count ?? undefined,
    episodeCount: row.episode_count ?? undefined,
  }
}
