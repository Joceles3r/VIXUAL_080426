/**
 * VIXUAL — TOP 100 Selection Engine
 *
 * Source de verite unique pour :
 *  - selection des 100 projets par cycle/univers
 *  - file d'attente equitable (priority + reentry + ordre soumission)
 *  - anti-monopole createur (max N projets par cycle)
 *  - classement (score) au sein des 100
 *  - cloture / TOP 10 / reintegration prioritaire
 *
 * Ne contient AUCUN tirage aleatoire.
 * Toutes les decisions sont mesurables et auditables.
 */

import "server-only"
import { sql } from "@/lib/db"

// ─── Types ───────────────────────────────────────────────────────────

export type VixualUniverse = "audiovisual" | "written" | "podcast"

/** Statuts unifies d'un projet dans le pipeline TOP 100. */
export type Top100ProjectStatus =
  | "draft"
  | "submitted"
  | "admin_review"
  | "approved"
  | "queued"
  | "selected_top100"
  | "active_competition"
  | "closed"
  | "top10_winner"
  | "non_top10"
  | "reentry_pending_payment"
  | "reentry_paid"
  | "requeued"
  | "rejected"

/** Cycle TOP 100 d'un univers. */
export interface Top100Cycle {
  id: string
  universe: VixualUniverse
  cycleNumber: number
  status: "open" | "closed"
  selectedCount: number
  maxProjects: number
  openedAt: Date
  closedAt: Date | null
}

/** Candidat en file d'attente. */
export interface Top100Candidate {
  contentId: string
  creatorId: string
  universe: VixualUniverse
  submittedAt: Date
  approvedAt?: Date
  priorityLevel: number
  reentryPaid: boolean
}

/** Decomposition du score VIXUAL TOP 100 (total /100). */
export interface Top100Score {
  total: number
  votesScore: number          // max 40
  contributionScore: number   // max 30
  engagementScore: number     // max 15
  freshnessScore: number      // max 10
  trustScore: number          // max  5
}

/** Projet classe au sein du cycle. */
export interface Top100RankedProject {
  contentId: string
  creatorId: string
  universe: VixualUniverse
  rank: number
  score: number
  scoreDetails: Top100Score
}

// ─── Normalisation univers ───────────────────────────────────────────

/**
 * L'ancien moteur (rule-of-100) utilise "literary".
 * Le patch impose "written". On centralise la conversion ici.
 */
export function normalizeUniverse(input: string): VixualUniverse {
  const v = input.trim().toLowerCase()
  if (v === "literary" || v === "written" || v === "text") return "written"
  if (v === "podcast" || v === "audio") return "podcast"
  return "audiovisual"
}

// ─── 1. FILE D'ATTENTE EQUITABLE ─────────────────────────────────────

/**
 * Tri equitable de la file d'attente :
 *  1. priorityLevel decroissant (priorite admin / events)
 *  2. reentry payee en premier (a priorite egale)
 *  3. ordre de soumission croissant (FIFO)
 *
 * Pas d'aleatoire, pas de coup de pouce cache.
 */
export function sortQueueFairly(candidates: Top100Candidate[]): Top100Candidate[] {
  return [...candidates].sort((a, b) => {
    if (b.priorityLevel !== a.priorityLevel) {
      return b.priorityLevel - a.priorityLevel
    }
    if (Number(b.reentryPaid) !== Number(a.reentryPaid)) {
      return Number(b.reentryPaid) - Number(a.reentryPaid)
    }
    return a.submittedAt.getTime() - b.submittedAt.getTime()
  })
}

// ─── 2. ANTI-MONOPOLE CREATEUR ───────────────────────────────────────

/**
 * Limite par defaut au lancement : 3 projets max par createur et par cycle.
 * Empeche un createur isole de monopoliser un univers.
 *
 * NB : la liste passee doit deja etre triee par sortQueueFairly().
 */
export function applyCreatorDiversityLimit(
  candidates: Top100Candidate[],
  maxPerCreator = 3,
  maxTotal = 100,
): Top100Candidate[] {
  const countByCreator = new Map<string, number>()
  const selected: Top100Candidate[] = []

  for (const candidate of candidates) {
    const current = countByCreator.get(candidate.creatorId) ?? 0
    if (current >= maxPerCreator) continue

    selected.push(candidate)
    countByCreator.set(candidate.creatorId, current + 1)

    if (selected.length >= maxTotal) break
  }
  return selected
}

/**
 * Selection finale : tri equitable + anti-monopole + cap a 100.
 */
export function selectTop100Candidates(
  candidates: Top100Candidate[],
  options: { maxPerCreator?: number; maxTotal?: number } = {},
): Top100Candidate[] {
  const sorted = sortQueueFairly(candidates)
  return applyCreatorDiversityLimit(
    sorted,
    options.maxPerCreator ?? 3,
    options.maxTotal ?? 100,
  )
}

// ─── 3. SCORE VIXUAL TOP 100 ─────────────────────────────────────────

/**
 * Score sur 100 points, ponderation officielle :
 *   Votes              40%
 *   Contributions      30%
 *   Engagement         15%
 *   Fraicheur          10%
 *   Confiance createur  5%
 *
 * Compatible CGU/CGV : aucun aleatoire, aucun bonus cache.
 */
export function computeTop100Score(input: {
  votes: number
  contributionAmount: number
  engagement: number
  freshness: number
  creatorTrust: number
}): Top100Score {
  const votesScore        = Math.min(input.votes * 2, 40)
  const contributionScore = Math.min(input.contributionAmount / 5, 30)
  const engagementScore   = Math.min(input.engagement, 15)
  const freshnessScore    = Math.min(input.freshness, 10)
  const trustScore        = Math.min(input.creatorTrust, 5)

  return {
    votesScore,
    contributionScore,
    engagementScore,
    freshnessScore,
    trustScore,
    total:
      votesScore +
      contributionScore +
      engagementScore +
      freshnessScore +
      trustScore,
  }
}

// ─── 4. CLASSEMENT DES 100 ───────────────────────────────────────────

export function rankSelectedProjects(
  projects: Array<{
    contentId: string
    creatorId: string
    universe: VixualUniverse
    scoreDetails: Top100Score
  }>,
): Top100RankedProject[] {
  return [...projects]
    .sort((a, b) => b.scoreDetails.total - a.scoreDetails.total)
    .map((p, i) => ({
      contentId: p.contentId,
      creatorId: p.creatorId,
      universe: p.universe,
      rank: i + 1,
      score: p.scoreDetails.total,
      scoreDetails: p.scoreDetails,
    }))
}

// ─── 5. TOP 10 GAGNANTS ──────────────────────────────────────────────

export function getTop10Winners(
  rankedProjects: Top100RankedProject[],
): Top100RankedProject[] {
  return rankedProjects.filter((p) => p.rank <= 10)
}

// ─── 6. REINTEGRATION PRIORITAIRE 25 € ───────────────────────────────

/**
 * Verifie l'eligibilite a la reintegration prioritaire :
 *  - rang strictement > 10 et <= 100
 *  - dans la fenetre d'1 heure apres cloture du cycle
 *  - createur non sanctionne
 *
 * Le paiement Stripe lui-meme est verifie cote serveur (webhook).
 */
export function canRequestReentry(input: {
  rank: number
  closedAt: Date
  now: Date
  isSanctioned: boolean
}): boolean {
  const oneHourMs = 60 * 60 * 1000
  const withinWindow =
    input.now.getTime() - input.closedAt.getTime() <= oneHourMs

  return (
    input.rank > 10 &&
    input.rank <= 100 &&
    withinWindow &&
    !input.isSanctioned
  )
}

// ─── 7. AUDIT LOG ────────────────────────────────────────────────────

export type Top100AuditAction =
  | "queue_enter"
  | "queue_approve"
  | "select_top100"
  | "score_compute"
  | "cycle_close"
  | "rank_freeze"
  | "top10_assign"
  | "reentry_request"
  | "reentry_paid"
  | "reentry_requeue"
  | "reject"
  | "error"

export async function logTop100Audit(entry: {
  action: Top100AuditAction
  contentId?: string | null
  creatorId?: string | null
  universe?: VixualUniverse | null
  cycleId?: string | null
  details?: Record<string, unknown>
  createdBy?: string | null
}): Promise<void> {
  try {
    await sql`
      INSERT INTO top100_audit_log
        (action, content_id, creator_id, universe, cycle_id, details, created_by)
      VALUES (
        ${entry.action},
        ${entry.contentId ?? null},
        ${entry.creatorId ?? null},
        ${entry.universe ?? null},
        ${entry.cycleId ?? null},
        ${JSON.stringify(entry.details ?? {})}::jsonb,
        ${entry.createdBy ?? null}
      )
    `
  } catch {
    // l'audit ne doit jamais bloquer le flux principal
  }
}

// ─── 8. ACCESS DB : CYCLE COURANT ────────────────────────────────────

/**
 * Recupere ou cree le cycle "open" pour un univers.
 */
export async function getOrCreateCurrentCycle(
  universe: VixualUniverse,
): Promise<Top100Cycle> {
  const existing = await sql`
    SELECT id::text, universe, cycle_number, status, selected_count,
           max_projects, opened_at, closed_at
    FROM top100_cycles
    WHERE universe = ${universe} AND status = 'open'
    ORDER BY cycle_number DESC
    LIMIT 1
  `
  if (existing.length > 0) {
    const r = existing[0] as any
    return {
      id: r.id,
      universe: r.universe,
      cycleNumber: r.cycle_number,
      status: r.status,
      selectedCount: r.selected_count,
      maxProjects: r.max_projects,
      openedAt: new Date(r.opened_at),
      closedAt: r.closed_at ? new Date(r.closed_at) : null,
    }
  }

  const last = await sql`
    SELECT cycle_number FROM top100_cycles
    WHERE universe = ${universe}
    ORDER BY cycle_number DESC LIMIT 1
  `
  const next = ((last[0] as any)?.cycle_number ?? 0) + 1

  const created = await sql`
    INSERT INTO top100_cycles (universe, cycle_number, status)
    VALUES (${universe}, ${next}, 'open')
    RETURNING id::text, universe, cycle_number, status, selected_count,
              max_projects, opened_at, closed_at
  `
  const c = created[0] as any
  return {
    id: c.id,
    universe: c.universe,
    cycleNumber: c.cycle_number,
    status: c.status,
    selectedCount: c.selected_count,
    maxProjects: c.max_projects,
    openedAt: new Date(c.opened_at),
    closedAt: c.closed_at ? new Date(c.closed_at) : null,
  }
}

/**
 * Lit la file d'attente "queued" + "reentry_paid" pour un univers.
 */
export async function loadQueueForUniverse(
  universe: VixualUniverse,
): Promise<Top100Candidate[]> {
  const rows = await sql`
    SELECT content_id, creator_id, universe, status, priority_level,
           reentry_paid, submitted_at, approved_at
    FROM top100_queue
    WHERE universe = ${universe}
      AND status IN ('queued', 'reentry_paid')
    ORDER BY priority_level DESC, reentry_paid DESC, submitted_at ASC
  `
  return rows.map((r: any) => ({
    contentId: r.content_id,
    creatorId: r.creator_id,
    universe: r.universe,
    submittedAt: new Date(r.submitted_at),
    approvedAt: r.approved_at ? new Date(r.approved_at) : undefined,
    priorityLevel: r.priority_level,
    reentryPaid: r.reentry_paid,
  }))
}

/**
 * Lit le classement fige du cycle courant ou en cours.
 */
export async function loadRankingsForCycle(
  cycleId: string,
): Promise<Top100RankedProject[]> {
  const rows = await sql`
    SELECT content_id, universe, rank, score, score_details
    FROM top100_rankings
    WHERE cycle_id = ${cycleId}::uuid
    ORDER BY rank ASC
    LIMIT 100
  `
  return rows.map((r: any) => ({
    contentId: r.content_id,
    creatorId: "", // creatorId n'est pas stocke dans rankings (cf. queue)
    universe: r.universe,
    rank: r.rank,
    score: Number(r.score),
    scoreDetails: r.score_details as Top100Score,
  }))
}
