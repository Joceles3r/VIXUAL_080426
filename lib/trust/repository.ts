/**
 * VISUAL Trust Score -- Database Repository (Server-only)
 */
import "server-only";

import { sql } from "@/lib/db";
import type { TrustProfile, TrustEvent, TrustLevel } from "./types";
import { scoreToLevel } from "./types";

/** Fetch current trust profile for a user */
export async function getTrustProfile(userId: string): Promise<TrustProfile | null> {
  const rows = await sql`
    SELECT id::text as user_id, trust_score, trust_level, trust_last_update
    FROM users WHERE id = ${userId}::uuid
  `;
  if (!rows.length) return null;
  const r = rows[0] as { user_id: string; trust_score: number; trust_level: string; trust_last_update: string | null };
  return {
    userId: r.user_id,
    score: r.trust_score ?? 25,
    level: (r.trust_level as TrustLevel) ?? "newcomer",
    lastUpdate: r.trust_last_update,
  };
}

/** Update trust score and level in users table */
export async function updateTrustScore(userId: string, newScore: number): Promise<void> {
  const clamped = Math.max(0, Math.min(100, newScore));
  const level = scoreToLevel(clamped);
  await sql`
    UPDATE users
    SET trust_score = ${clamped},
        trust_level = ${level},
        trust_last_update = now()
    WHERE id = ${userId}::uuid
  `;
}

/** Insert a trust event into history */
export async function insertTrustEvent(event: TrustEvent): Promise<void> {
  await sql`
    INSERT INTO trust_events (user_id, event_type, delta, reason, metadata)
    VALUES (
      ${event.userId}::uuid,
      ${event.eventType},
      ${event.delta},
      ${event.reason},
      ${JSON.stringify(event.metadata ?? {})}::jsonb
    )
  `;
}

/** Get trust event history for a user (latest first, paginated) */
export async function getTrustHistory(
  userId: string,
  limit = 20,
  offset = 0
): Promise<TrustEvent[]> {
  const rows = await sql`
    SELECT id::text, user_id::text, event_type, delta, reason, metadata, created_at
    FROM trust_events
    WHERE user_id = ${userId}::uuid
    ORDER BY created_at DESC
    LIMIT ${limit} OFFSET ${offset}
  `;
  return rows.map((r) => {
    const row = r as Record<string, unknown>;
    return {
      id: row.id as string,
      userId: row.user_id as string,
      eventType: row.event_type as TrustEvent["eventType"],
      delta: row.delta as number,
      reason: row.reason as string,
      metadata: row.metadata as Record<string, unknown>,
      createdAt: row.created_at as string,
    };
  });
}
