/**
 * VIXUAL — Soft-delete (archives reversibles)
 *
 * Au lieu de DELETE definitif, on copie la ligne dans `archives` puis on supprime/marque.
 * Permet de restaurer plus tard via /admin/archives.
 */
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export interface ArchiveRow {
  id: string
  original_table: string
  original_id: string
  payload: Record<string, unknown>
  archived_by: string
  archived_at: string
  reason: string | null
  status: "archived" | "restored" | "purged"
  restored_by: string | null
  restored_at: string | null
}

export async function archiveRecord(opts: {
  table: string
  id: string
  payload: Record<string, unknown>
  archivedBy: string
  reason?: string
}): Promise<string> {
  const rows = await sql`
    INSERT INTO archives (original_table, original_id, payload, archived_by, reason)
    VALUES (${opts.table}, ${opts.id}, ${JSON.stringify(opts.payload)}::jsonb, ${opts.archivedBy}, ${opts.reason ?? null})
    RETURNING id
  ` as Array<{ id: string }>
  return rows[0].id
}

export async function listArchives(
  status: ArchiveRow["status"] | "all" = "archived",
  limit = 100,
): Promise<ArchiveRow[]> {
  if (status === "all") {
    return (await sql`
      SELECT * FROM archives
      ORDER BY archived_at DESC
      LIMIT ${limit}
    `) as unknown as ArchiveRow[]
  }
  return (await sql`
    SELECT * FROM archives
    WHERE status = ${status}
    ORDER BY archived_at DESC
    LIMIT ${limit}
  `) as unknown as ArchiveRow[]
}

export async function markRestored(archiveId: string, restoredBy: string) {
  await sql`
    UPDATE archives
    SET status = 'restored', restored_by = ${restoredBy}, restored_at = NOW()
    WHERE id = ${archiveId}
  `
}

export async function purgeArchive(archiveId: string) {
  await sql`
    UPDATE archives SET status = 'purged' WHERE id = ${archiveId}
  `
}
