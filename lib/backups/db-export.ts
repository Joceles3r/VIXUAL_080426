/**
 * VIXUAL — lib/backups/db-export.ts
 * Export quotidien de la BD en JSON pour archivage.
 */
import { sql, isDatabaseConfigured } from "@/lib/db"

export interface BackupSummary {
  date: string
  tables: Record<string, number>
  totalRows: number
}

export async function generateBackupSummary(): Promise<BackupSummary> {
  const summary: BackupSummary = {
    date: new Date().toISOString(),
    tables: {},
    totalRows: 0,
  }

  if (!isDatabaseConfigured()) return summary

  const tablesToBackup = [
    "users", "contents", "contributions", "creator_channels",
    "moderation_alerts", "moderation_audit_log", "security_audit_log",
    "stripe_events_log", "video_uploads", "comments", "notifications",
  ]

  for (const table of tablesToBackup) {
    try {
      const result = await sql.unsafe(`SELECT COUNT(*) AS cnt FROM ${table}`)
      const count = Number((result as any)[0]?.cnt ?? 0)
      summary.tables[table] = count
      summary.totalRows += count
    } catch {
      summary.tables[table] = -1
    }
  }

  return summary
}
