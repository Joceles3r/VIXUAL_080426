/**
 * VIXUAL — Upload Queue (preparation Bunny.net)
 *
 * Trace chaque upload (image / video) avec progression, retry, statut.
 */
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export type UploadStatus = "pending" | "uploading" | "completed" | "error" | "cancelled"
export type UploadProvider = "local" | "bunny" | "firebase" | "blob"

export interface UploadJob {
  id: string
  user_id: string
  file_name: string
  file_size: number
  file_type: string
  target_collection: string | null
  target_doc: string | null
  target_url: string | null
  provider: UploadProvider
  status: UploadStatus
  progress: number
  retry_count: number
  error_message: string | null
  created_at: string
  updated_at: string
  completed_at: string | null
}

export async function enqueueUpload(opts: {
  userId: string
  fileName: string
  fileSize: number
  fileType: string
  provider?: UploadProvider
  targetCollection?: string
  targetDoc?: string
}): Promise<string> {
  const rows = await sql`
    INSERT INTO upload_queue
      (user_id, file_name, file_size, file_type, provider, target_collection, target_doc)
    VALUES
      (${opts.userId}, ${opts.fileName}, ${opts.fileSize}, ${opts.fileType},
       ${opts.provider ?? "local"}, ${opts.targetCollection ?? null}, ${opts.targetDoc ?? null})
    RETURNING id
  ` as Array<{ id: string }>
  return rows[0].id
}

export async function updateUploadStatus(id: string, patch: {
  status?: UploadStatus
  progress?: number
  targetUrl?: string
  error?: string
  incrementRetry?: boolean
}) {
  if (patch.status === "completed") {
    await sql`
      UPDATE upload_queue
      SET status = 'completed', progress = 100, target_url = ${patch.targetUrl ?? null},
          completed_at = NOW(), updated_at = NOW(), error_message = NULL
      WHERE id = ${id}
    `
    return
  }
  if (patch.status === "error") {
    await sql`
      UPDATE upload_queue
      SET status = 'error', error_message = ${patch.error ?? "Unknown error"},
          retry_count = retry_count + ${patch.incrementRetry ? 1 : 0},
          updated_at = NOW()
      WHERE id = ${id}
    `
    return
  }
  await sql`
    UPDATE upload_queue
    SET status = COALESCE(${patch.status ?? null}, status),
        progress = COALESCE(${patch.progress ?? null}, progress),
        target_url = COALESCE(${patch.targetUrl ?? null}, target_url),
        updated_at = NOW()
    WHERE id = ${id}
  `
}

export async function listUserQueue(userId: string, limit = 50): Promise<UploadJob[]> {
  return (await sql`
    SELECT * FROM upload_queue
    WHERE user_id = ${userId}
    ORDER BY created_at DESC
    LIMIT ${limit}
  `) as unknown as UploadJob[]
}

export async function listAdminQueue(limit = 200): Promise<UploadJob[]> {
  return (await sql`
    SELECT * FROM upload_queue
    ORDER BY
      CASE status
        WHEN 'error' THEN 0
        WHEN 'uploading' THEN 1
        WHEN 'pending' THEN 2
        WHEN 'completed' THEN 3
        ELSE 4
      END,
      created_at DESC
    LIMIT ${limit}
  `) as unknown as UploadJob[]
}

export async function getQueueStats() {
  const rows = (await sql`
    SELECT status, COUNT(*)::int AS count
    FROM upload_queue
    WHERE created_at > NOW() - INTERVAL '7 days'
    GROUP BY status
  `) as Array<{ status: UploadStatus; count: number }>
  const stats: Record<UploadStatus, number> = {
    pending: 0, uploading: 0, completed: 0, error: 0, cancelled: 0,
  }
  for (const row of rows) stats[row.status] = row.count
  return stats
}
