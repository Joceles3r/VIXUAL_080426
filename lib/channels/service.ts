/**
 * Service du module "Chaines createurs" (V3, OFF par defaut).
 *
 * Une "chaine" est un univers creatif merite par un createur:
 * - eligible si trust_score >= 85 (cf. lib/trust/channel-eligibility)
 * - reservee aux createurs avec un projet finance ou produit
 * - chaque createur ne peut posseder qu'UNE seule chaine
 * - validee manuellement par le PATRON via /admin/creator-channels
 *
 * Aucun systeme d'abonnement, ni de pub, ni de monetisation directe.
 * La chaine est un cadeau VIXUAL pour valoriser les createurs serieux.
 */

import "server-only"
import { sql } from "@/lib/db"
import { getChannelEligibility } from "@/lib/trust/channel-eligibility"
import { normalizeSlug, isValidSlug } from "@/lib/channels/slug"

// Re-export pour compatibilite : ces helpers sont PURS, importables
// cote client. Pour un import client direct, preferer "@/lib/channels/slug".
export { normalizeSlug, isValidSlug }

export interface CreatorChannelRequest {
  id: string
  creatorId: string
  status: "pending" | "approved" | "rejected"
  channelSlug: string | null
  channelName: string
  channelBio: string | null
  trustScoreAtRequest: number
  reviewedBy: string | null
  reviewedAt: Date | null
  reviewNote: string | null
  createdAt: Date
  // Joined fields (lecture admin)
  creatorEmail?: string
  creatorDisplayName?: string
}

export interface CreatorChannel {
  id: string
  creatorId: string
  slug: string
  name: string
  bio: string | null
  bannerUrl: string | null
  isActive: boolean
  approvedAt: Date | null
  approvedBy: string | null
  viewCount: number
  createdAt: Date
  updatedAt: Date
  // Joined
  creatorEmail?: string
  creatorDisplayName?: string
}

export interface CreatorChannelContent {
  id: string
  channelId: string
  contentId: string
  displayOrder: number
  addedAt: Date
  // Joined depuis contents
  contentTitle?: string
  contentType?: string
  contentCoverUrl?: string | null
  contentDescription?: string | null
}

/* ─────────────────────────────────────────────────────────────────── */
/* ELIGIBILITE                                                         */
/* ─────────────────────────────────────────────────────────────────── */

export interface CreatorEligibilitySnapshot {
  eligible: boolean
  trustScore: number
  status: ReturnType<typeof getChannelEligibility>["status"]
  label: string
  reason: string
  hasFinancedProject: boolean
  hasExistingChannel: boolean
  hasPendingRequest: boolean
}

/**
 * Verifie si un createur peut demander une chaine.
 *
 * Regles (V3):
 * - trust_score >= 85
 * - au moins UN contenu publie ou finance
 * - aucune chaine deja existante
 * - aucune requete en attente
 */
export async function getCreatorEligibility(
  creatorId: string,
): Promise<CreatorEligibilitySnapshot> {
  const trustRows = await sql`
    SELECT trust_score
    FROM users
    WHERE id = ${creatorId}::uuid
    LIMIT 1
  `
  const trustScore = Number(trustRows[0]?.trust_score ?? 0)
  const eligibility = getChannelEligibility(trustScore)

  const projectRows = await sql`
    SELECT 1
    FROM contents
    WHERE creator_id = ${creatorId}::uuid
      AND (is_published = TRUE OR current_investment > 0)
    LIMIT 1
  `
  const hasFinancedProject = projectRows.length > 0

  const channelRows = await sql`
    SELECT 1 FROM creator_channels WHERE creator_id = ${creatorId}::uuid LIMIT 1
  `
  const hasExistingChannel = channelRows.length > 0

  const pendingRows = await sql`
    SELECT 1
    FROM creator_channel_requests
    WHERE creator_id = ${creatorId}::uuid AND status = 'pending'
    LIMIT 1
  `
  const hasPendingRequest = pendingRows.length > 0

  let reason = "Eligible pour creer une chaine"
  let eligible = eligibility.canApply
  if (!eligibility.canApply) {
    reason = `Trust score insuffisant (${trustScore} / 85 requis)`
  } else if (!hasFinancedProject) {
    eligible = false
    reason = "Vous devez avoir au moins un projet publie ou finance"
  } else if (hasExistingChannel) {
    eligible = false
    reason = "Vous avez deja une chaine creee"
  } else if (hasPendingRequest) {
    eligible = false
    reason = "Une demande est deja en attente de validation"
  }

  return {
    eligible,
    trustScore,
    status: eligibility.status,
    label: eligibility.label,
    reason,
    hasFinancedProject,
    hasExistingChannel,
    hasPendingRequest,
  }
}

/* ─────────────────────────────────────────────────────────────────── */
/* DEMANDES (REQUESTS)                                                 */
/* ─────────────────────────────────────────────────────────────────── */

interface CreateRequestInput {
  creatorId: string
  channelSlug: string
  channelName: string
  channelBio?: string
}

export async function createChannelRequest(
  input: CreateRequestInput,
): Promise<CreatorChannelRequest> {
  const slug = normalizeSlug(input.channelSlug)
  if (!isValidSlug(slug)) {
    throw new Error("Slug invalide (3 a 60 caracteres alphanumeriques + tirets)")
  }

  const eligibility = await getCreatorEligibility(input.creatorId)
  if (!eligibility.eligible) {
    throw new Error(eligibility.reason)
  }

  const conflictRows = await sql`
    SELECT 1 FROM creator_channels WHERE slug = ${slug}
    UNION ALL
    SELECT 1 FROM creator_channel_requests WHERE channel_slug = ${slug} AND status = 'pending'
    LIMIT 1
  `
  if (conflictRows.length > 0) {
    throw new Error("Ce slug est deja utilise ou en cours de validation")
  }

  const inserted = await sql`
    INSERT INTO creator_channel_requests
      (creator_id, status, channel_slug, channel_name, channel_bio, trust_score_at_request)
    VALUES
      (${input.creatorId}::uuid, 'pending', ${slug}, ${input.channelName.trim()}, ${input.channelBio?.trim() ?? null}, ${eligibility.trustScore})
    RETURNING *
  `
  return mapRequest(inserted[0])
}

export async function getRequestForCreator(
  creatorId: string,
): Promise<CreatorChannelRequest | null> {
  const rows = await sql`
    SELECT * FROM creator_channel_requests
    WHERE creator_id = ${creatorId}::uuid
    ORDER BY created_at DESC
    LIMIT 1
  `
  return rows[0] ? mapRequest(rows[0]) : null
}

export async function listPendingRequests(): Promise<CreatorChannelRequest[]> {
  const rows = await sql`
    SELECT
      r.*,
      u.email AS creator_email,
      u.display_name AS creator_display_name
    FROM creator_channel_requests r
    JOIN users u ON u.id = r.creator_id
    WHERE r.status = 'pending'
    ORDER BY r.created_at DESC
    LIMIT 200
  `
  return rows.map(mapRequest)
}

interface ReviewInput {
  requestId: string
  reviewerEmail: string
  decision: "approved" | "rejected"
  reviewNote?: string
}

export async function reviewChannelRequest(input: ReviewInput): Promise<{
  request: CreatorChannelRequest
  channel: CreatorChannel | null
}> {
  const reqRows = await sql`
    SELECT * FROM creator_channel_requests WHERE id = ${input.requestId}::uuid LIMIT 1
  `
  const reqRow = reqRows[0]
  if (!reqRow) throw new Error("Demande introuvable")
  if (reqRow.status !== "pending") throw new Error("Cette demande a deja ete traitee")

  const updated = await sql`
    UPDATE creator_channel_requests
    SET
      status = ${input.decision},
      reviewed_by = ${input.reviewerEmail},
      reviewed_at = NOW(),
      review_note = ${input.reviewNote?.trim() ?? null}
    WHERE id = ${input.requestId}::uuid
    RETURNING *
  `
  const updatedRequest = mapRequest(updated[0])

  let channel: CreatorChannel | null = null
  if (input.decision === "approved") {
    const insertedChannel = await sql`
      INSERT INTO creator_channels
        (creator_id, slug, name, bio, is_active, approved_at, approved_by)
      VALUES
        (${reqRow.creator_id}::uuid, ${reqRow.channel_slug}, ${reqRow.channel_name}, ${reqRow.channel_bio}, TRUE, NOW(), ${input.reviewerEmail})
      RETURNING *
    `
    channel = mapChannel(insertedChannel[0])
  }

  return { request: updatedRequest, channel }
}

/* ─────────────────────────────────────────────────────────────────── */
/* CHAINES (CHANNELS)                                                  */
/* ─────────────────────────────────────────────────────────────────── */

export async function getChannelBySlug(slug: string): Promise<CreatorChannel | null> {
  const rows = await sql`
    SELECT
      c.*,
      u.email AS creator_email,
      u.display_name AS creator_display_name
    FROM creator_channels c
    JOIN users u ON u.id = c.creator_id
    WHERE c.slug = ${slug} AND c.is_active = TRUE
    LIMIT 1
  `
  return rows[0] ? mapChannel(rows[0]) : null
}

export async function getChannelForCreator(
  creatorId: string,
): Promise<CreatorChannel | null> {
  const rows = await sql`
    SELECT * FROM creator_channels WHERE creator_id = ${creatorId}::uuid LIMIT 1
  `
  return rows[0] ? mapChannel(rows[0]) : null
}

export async function listActiveChannels(limit = 50): Promise<CreatorChannel[]> {
  const rows = await sql`
    SELECT
      c.*,
      u.email AS creator_email,
      u.display_name AS creator_display_name
    FROM creator_channels c
    JOIN users u ON u.id = c.creator_id
    WHERE c.is_active = TRUE
    ORDER BY c.view_count DESC, c.approved_at DESC
    LIMIT ${limit}
  `
  return rows.map(mapChannel)
}

export async function incrementChannelViewCount(channelId: string): Promise<void> {
  await sql`
    UPDATE creator_channels
    SET view_count = view_count + 1, updated_at = NOW()
    WHERE id = ${channelId}::uuid
  `
}

interface UpdateChannelInput {
  channelId: string
  creatorId: string
  bio?: string
  bannerUrl?: string | null
}

export async function updateChannel(input: UpdateChannelInput): Promise<CreatorChannel> {
  const owned = await sql`
    SELECT 1 FROM creator_channels
    WHERE id = ${input.channelId}::uuid AND creator_id = ${input.creatorId}::uuid
    LIMIT 1
  `
  if (owned.length === 0) throw new Error("Chaine introuvable ou non autorisee")

  const updated = await sql`
    UPDATE creator_channels
    SET
      bio = COALESCE(${input.bio?.trim() ?? null}, bio),
      banner_url = ${input.bannerUrl ?? null},
      updated_at = NOW()
    WHERE id = ${input.channelId}::uuid
    RETURNING *
  `
  return mapChannel(updated[0])
}

/* ─────────────────────────────────────────────────────────────────── */
/* CONTENUS DE LA CHAINE                                               */
/* ─────────────────────────────────────────────────────────────────── */

export async function listChannelContents(
  channelId: string,
): Promise<CreatorChannelContent[]> {
  const rows = await sql`
    SELECT
      cc.*,
      ct.title AS content_title,
      ct.content_type AS content_type,
      ct.cover_url AS content_cover_url,
      ct.description AS content_description
    FROM creator_channel_contents cc
    JOIN contents ct ON ct.id = cc.content_id
    WHERE cc.channel_id = ${channelId}::uuid
    ORDER BY cc.display_order ASC, cc.added_at DESC
  `
  return rows.map(mapChannelContent)
}

export async function addContentToChannel(input: {
  channelId: string
  creatorId: string
  contentId: string
  displayOrder?: number
}): Promise<CreatorChannelContent> {
  const owned = await sql`
    SELECT 1 FROM creator_channels
    WHERE id = ${input.channelId}::uuid AND creator_id = ${input.creatorId}::uuid
    LIMIT 1
  `
  if (owned.length === 0) throw new Error("Chaine introuvable ou non autorisee")

  const owns = await sql`
    SELECT 1 FROM contents
    WHERE id = ${input.contentId}::uuid AND creator_id = ${input.creatorId}::uuid
    LIMIT 1
  `
  if (owns.length === 0) throw new Error("Contenu non possede par ce createur")

  const inserted = await sql`
    INSERT INTO creator_channel_contents (channel_id, content_id, display_order)
    VALUES (${input.channelId}::uuid, ${input.contentId}::uuid, ${input.displayOrder ?? 0})
    ON CONFLICT (channel_id, content_id) DO UPDATE
      SET display_order = EXCLUDED.display_order
    RETURNING *
  `
  return mapChannelContent(inserted[0])
}

export async function removeContentFromChannel(input: {
  channelId: string
  creatorId: string
  contentId: string
}): Promise<void> {
  const owned = await sql`
    SELECT 1 FROM creator_channels
    WHERE id = ${input.channelId}::uuid AND creator_id = ${input.creatorId}::uuid
    LIMIT 1
  `
  if (owned.length === 0) throw new Error("Chaine introuvable ou non autorisee")

  await sql`
    DELETE FROM creator_channel_contents
    WHERE channel_id = ${input.channelId}::uuid AND content_id = ${input.contentId}::uuid
  `
}

/* ─────────────────────────────────────────────────────────────────── */
/* MAPPERS                                                             */
/* ─────────────────────────────────────────────────────────────────── */

function mapRequest(row: Record<string, unknown>): CreatorChannelRequest {
  return {
    id: String(row.id),
    creatorId: String(row.creator_id),
    status: row.status as CreatorChannelRequest["status"],
    channelSlug: row.channel_slug ? String(row.channel_slug) : null,
    channelName: String(row.channel_name),
    channelBio: row.channel_bio ? String(row.channel_bio) : null,
    trustScoreAtRequest: Number(row.trust_score_at_request),
    reviewedBy: row.reviewed_by ? String(row.reviewed_by) : null,
    reviewedAt: row.reviewed_at ? new Date(row.reviewed_at as string) : null,
    reviewNote: row.review_note ? String(row.review_note) : null,
    createdAt: new Date(row.created_at as string),
    creatorEmail: row.creator_email ? String(row.creator_email) : undefined,
    creatorDisplayName: row.creator_display_name ? String(row.creator_display_name) : undefined,
  }
}

function mapChannel(row: Record<string, unknown>): CreatorChannel {
  return {
    id: String(row.id),
    creatorId: String(row.creator_id),
    slug: String(row.slug),
    name: String(row.name),
    bio: row.bio ? String(row.bio) : null,
    bannerUrl: row.banner_url ? String(row.banner_url) : null,
    isActive: Boolean(row.is_active),
    approvedAt: row.approved_at ? new Date(row.approved_at as string) : null,
    approvedBy: row.approved_by ? String(row.approved_by) : null,
    viewCount: Number(row.view_count ?? 0),
    createdAt: new Date(row.created_at as string),
    updatedAt: new Date(row.updated_at as string),
    creatorEmail: row.creator_email ? String(row.creator_email) : undefined,
    creatorDisplayName: row.creator_display_name ? String(row.creator_display_name) : undefined,
  }
}

function mapChannelContent(row: Record<string, unknown>): CreatorChannelContent {
  return {
    id: String(row.id),
    channelId: String(row.channel_id),
    contentId: String(row.content_id),
    displayOrder: Number(row.display_order ?? 0),
    addedAt: new Date(row.added_at as string),
    contentTitle: row.content_title ? String(row.content_title) : undefined,
    contentType: row.content_type ? String(row.content_type) : undefined,
    contentCoverUrl: row.content_cover_url ? String(row.content_cover_url) : null,
    contentDescription: row.content_description ? String(row.content_description) : null,
  }
}
