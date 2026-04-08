import "server-only";
import { sql } from "@/lib/db";

// ── Types ──

export type Universe = "audiovisual" | "literary" | "podcast";

const THRESHOLD_DEFAULT = 100;

/**
 * Mapping univers -> content_type + categories possibles.
 * Adapte les categories si les noms diffèrent dans ta DB.
 */
export function getUniverseFilter(universe: Universe): {
  contentTypes: string[];
  categories?: string[];
} {
  switch (universe) {
    case "audiovisual":
      return {
        contentTypes: ["video"],
        categories: [
          "film",
          "video",
          "clip",
          "documentaire",
          "reportage",
          "theatre",
          "concert",
          "show",
        ],
      };
    case "literary":
      return {
        contentTypes: ["text"],
        categories: ["livre", "blog", "article", "journal"],
      };
    case "podcast":
      return {
        contentTypes: ["podcast", "audio"],
        categories: ["podcast", "radio", "livre_audio"],
      };
  }
}

/**
 * Maps a content_type OR category string to its Universe.
 * Handles both content_type ("video","text","podcast") and
 * category names ("film","documentaire","livre","radio", etc.).
 */
export function contentTypeToUniverse(contentTypeOrCategory: string): Universe {
  const v = contentTypeOrCategory.toLowerCase().trim();

  // Audiovisual universe
  const audiovisualKeys = [
    "video", "film", "clip", "documentaire", "reportage",
    "theatre", "concert", "show", "serie", "court_metrage",
    "animation", "spectacle",
  ];
  if (audiovisualKeys.includes(v)) return "audiovisual";

  // Literary universe
  const literaryKeys = [
    "text", "livre", "blog", "article", "journal",
    "roman", "nouvelle", "poesie", "essai", "bd",
    "manga", "script", "scenario",
  ];
  if (literaryKeys.includes(v)) return "literary";

  // Podcast universe
  const podcastKeys = [
    "podcast", "audio", "radio", "livre_audio",
    "emission", "interview_audio", "chronique",
  ];
  if (podcastKeys.includes(v)) return "podcast";

  // Default fallback
  return "audiovisual";
}

// ── Cycle management ──

/**
 * Recupere le cycle actif (open) d'un univers, sinon le cree.
 */
export async function getOrCreateActiveCycle(universe: Universe) {
  const existing = await sql`
    SELECT id::text as id, universe, cycle_number, status, threshold, started_at, closed_at
    FROM universe_cycles
    WHERE universe = ${universe}
      AND status = 'open'
    ORDER BY cycle_number DESC
    LIMIT 1
  `;
  if (existing.length) return existing[0] as {
    id: string; universe: string; cycle_number: number;
    status: string; threshold: number; started_at: string; closed_at: string | null;
  };

  // No open cycle: find last cycle_number and increment
  const last = await sql`
    SELECT cycle_number
    FROM universe_cycles
    WHERE universe = ${universe}
    ORDER BY cycle_number DESC
    LIMIT 1
  `;
  const nextNumber = ((last[0] as { cycle_number?: number })?.cycle_number ?? 0) + 1;

  const created = await sql`
    INSERT INTO universe_cycles (universe, cycle_number, status, threshold)
    VALUES (${universe}, ${nextNumber}, 'open', ${THRESHOLD_DEFAULT})
    RETURNING id::text as id, universe, cycle_number, status, threshold, started_at, closed_at
  `;
  return created[0] as {
    id: string; universe: string; cycle_number: number;
    status: string; threshold: number; started_at: string; closed_at: string | null;
  };
}

// ── Content attachment ──

/**
 * Assigne un content au cycle "open" au moment de sa validation (approved/published).
 */
export async function attachContentToActiveCycle(
  contentId: string,
  universe: Universe
) {
  const cycle = await getOrCreateActiveCycle(universe);

  await sql`
    UPDATE contents
    SET universe = ${universe},
        cycle_id = ${cycle.id}::uuid,
        updated_at = now()
    WHERE id = ${contentId}::uuid
  `;
  return cycle;
}

// ── Counting ──

/**
 * Compte les projets valides (approved/published) dans un cycle.
 */
export async function countValidatedInCycle(
  universe: Universe,
  cycleId: string
) {
  const filter = getUniverseFilter(universe);
  const withCategory = !!filter.categories?.length;

  const rows = withCategory
    ? await sql`
      SELECT COUNT(*)::int as cnt
      FROM contents
      WHERE cycle_id = ${cycleId}::uuid
        AND universe = ${universe}
        AND content_type = ANY(${filter.contentTypes})
        AND category = ANY(${filter.categories})
        AND status IN ('approved','published')
    `
    : await sql`
      SELECT COUNT(*)::int as cnt
      FROM contents
      WHERE cycle_id = ${cycleId}::uuid
        AND universe = ${universe}
        AND content_type = ANY(${filter.contentTypes})
        AND status IN ('approved','published')
    `;

  return Number((rows[0] as { cnt: number })?.cnt ?? 0);
}

// ── Enforcement ──

export interface RuleOf100Result {
  ok: boolean;
  universe: Universe;
  activeCycleId?: string;
  activeCycleNumber?: number;
  closedCycleId?: string;
  closedCycleNumber?: number;
  nextCycleId?: string;
  nextCycleNumber?: number;
  validatedCount: number;
  closed: boolean;
  rolled: boolean;
}

/**
 * Regle des 100 + rollover automatique :
 * - Si seuil atteint: cloture le cycle open + ferme les contenus du cycle
 * - Ouvre immediatement le cycle suivant (open)
 */
export async function enforceRuleOf100AndRollToNext(
  universe: Universe
): Promise<RuleOf100Result> {
  const cycle = await getOrCreateActiveCycle(universe);
  const count = await countValidatedInCycle(universe, cycle.id);

  if (count < cycle.threshold) {
    return {
      ok: true,
      universe,
      activeCycleId: cycle.id,
      activeCycleNumber: cycle.cycle_number,
      validatedCount: count,
      closed: false,
      rolled: false,
    };
  }

  // 1) Cloture le cycle courant
  await sql`
    UPDATE universe_cycles
    SET status = 'closed', closed_at = now()
    WHERE id = ${cycle.id}::uuid AND status = 'open'
  `;

  // 2) Fermer les contenus valides du cycle (gel des investissements)
  await sql`
    UPDATE contents
    SET status = 'closed', closed_at = now(), updated_at = now()
    WHERE cycle_id = ${cycle.id}::uuid
      AND status IN ('approved','published')
  `;

  // 3) Ouvre le cycle suivant
  const nextCycle = await sql`
    INSERT INTO universe_cycles (universe, cycle_number, status, threshold)
    VALUES (${universe}, ${cycle.cycle_number + 1}, 'open', ${cycle.threshold})
    ON CONFLICT (universe, cycle_number) DO UPDATE SET status = 'open'
    RETURNING id::text as id, universe, cycle_number, status, threshold, started_at, closed_at
  `;

  const next = nextCycle[0] as { id: string; cycle_number: number };

  return {
    ok: true,
    universe,
    closed: true,
    rolled: true,
    closedCycleId: cycle.id,
    closedCycleNumber: cycle.cycle_number,
    validatedCount: count,
    nextCycleId: next.id,
    nextCycleNumber: next.cycle_number,
  };
}

// ── Investment guard ──

/**
 * A appeler AVANT d'accepter un investissement sur un contenu :
 * - Si le cycle du contenu est closed -> interdit
 * - Si le contenu n'a pas de cycle -> tente de l'attacher au cycle open
 */
export async function assertInvestmentsOpenForContent(contentId: string): Promise<{
  open: boolean;
  reason?: string;
  universe?: string;
  cycleNumber?: number;
  validatedCount?: number;
  threshold?: number;
}> {
  const rows = await sql`
    SELECT c.id::text as id, c.cycle_id::text as cycle_id, c.content_type, c.universe, c.category,
           uc.status as cycle_status, uc.cycle_number, uc.threshold
    FROM contents c
    LEFT JOIN universe_cycles uc ON uc.id = c.cycle_id
    WHERE c.id = ${contentId}::uuid
    LIMIT 1
  `;
  if (!rows.length) return { open: false, reason: "Contenu introuvable." };
  const r = rows[0] as {
    id: string; cycle_id: string | null; content_type: string;
    universe: string | null; category: string | null;
    cycle_status: string | null; cycle_number: number | null;
    threshold: number | null;
  };

  // If content has no cycle yet, attach it to the open cycle
  if (!r.cycle_id) {
    const universe = contentTypeToUniverse(r.category || r.content_type);
    const cycle = await attachContentToActiveCycle(contentId, universe);
    return { open: true, universe };
  }

  if (r.cycle_status === "closed") {
    const count = r.cycle_id ? await countValidatedInCycle(r.universe as Universe, r.cycle_id) : 0;
    return {
      open: false,
      reason: "La cession est fermee pour ce contenu. Les 100 oeuvres de ce cycle sont validees.",
      universe: r.universe || undefined,
      cycleNumber: r.cycle_number || undefined,
      validatedCount: count,
      threshold: r.threshold || THRESHOLD_DEFAULT,
    };
  }

  return { open: true, universe: r.universe || undefined };
}

// ── Status helpers ──

/**
 * Returns the current status of all universe cycles.
 */
export async function getAllCyclesStatus() {
  const rows = await sql`
    SELECT
      uc.id::text as id,
      uc.universe,
      uc.cycle_number,
      uc.status,
      uc.threshold,
      uc.started_at,
      uc.closed_at,
      (
        SELECT COUNT(*)::int
        FROM contents c
        WHERE c.cycle_id = uc.id
          AND c.status IN ('approved','published','closed')
      ) as validated_count
    FROM universe_cycles uc
    ORDER BY uc.universe, uc.cycle_number DESC
  `;
  return rows as Array<{
    id: string; universe: string; cycle_number: number; status: string;
    threshold: number; started_at: string; closed_at: string | null;
    validated_count: number;
  }>;
}
