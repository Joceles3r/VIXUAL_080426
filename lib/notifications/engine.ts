import { sql } from "@/lib/db"

export type NotificationType = "level_up" | "contribution_received" | "cycle_ended" | "monthly_gain" | "comment_reply" | "boost_received" | "pass_unlocked"

export async function createNotification(userId: string, type: NotificationType, title: string, body: string | null, link?: string): Promise<void> {
  await sql`INSERT INTO notifications (user_id, type, title, body, link) VALUES (${userId}::uuid, ${type}, ${title}, ${body}, ${link ?? null})`
}

export async function getUnreadNotifications(userId: string, limit = 20) {
  return await sql`SELECT id, type, title, body, link, is_read, created_at FROM notifications WHERE user_id = ${userId}::uuid ORDER BY created_at DESC LIMIT ${limit}`
}

export async function markAllRead(userId: string): Promise<void> {
  await sql`UPDATE notifications SET is_read = true, read_at = NOW() WHERE user_id = ${userId}::uuid AND is_read = false`
}

export async function getUnreadCount(userId: string): Promise<number> {
  const rows = await sql`SELECT COUNT(*) AS cnt FROM notifications WHERE user_id = ${userId}::uuid AND is_read = false`
  return Number(rows[0]?.cnt ?? 0)
}
