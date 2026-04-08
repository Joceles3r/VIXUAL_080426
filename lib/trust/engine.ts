/**
 * VISUAL Trust Score -- Engine
 *
 * Core function: recordTrustEvent(userId, eventType, reason?, metadata?)
 * This is the single entry point for recording any trust-impacting action.
 */

import type { TrustEventType, TrustProfile } from "./types";
import { scoreToLevel } from "./types";
import { TRUST_WEIGHTS } from "./weights";
import { getTrustProfile, updateTrustScore, insertTrustEvent } from "./repository";

/**
 * Record a trust event for a user.
 * Automatically looks up the weight, applies the delta, clamps to [0,100],
 * updates the user score, and inserts an audit event.
 *
 * @param deltaOverride -- if provided, overrides the default weight (for admin_boost/admin_penalty)
 */
export async function recordTrustEvent(
  userId: string,
  eventType: TrustEventType,
  reason?: string,
  metadata?: Record<string, unknown>,
  deltaOverride?: number
): Promise<TrustProfile> {
  const delta = deltaOverride ?? TRUST_WEIGHTS[eventType] ?? 0;
  const defaultReason = reason ?? `Trust event: ${eventType}`;

  // Fetch current profile
  const profile = await getTrustProfile(userId);
  const currentScore = profile?.score ?? 25;
  const newScore = Math.max(0, Math.min(100, currentScore + delta));

  // Update score
  await updateTrustScore(userId, newScore);

  // Insert audit event
  await insertTrustEvent({
    userId,
    eventType,
    delta,
    reason: defaultReason,
    metadata: { ...metadata, previousScore: currentScore, newScore },
  });

  return {
    userId,
    score: newScore,
    level: scoreToLevel(newScore),
    lastUpdate: new Date().toISOString(),
  };
}

/**
 * Get a user's current trust profile (public-safe).
 */
export async function getUserTrustProfile(userId: string): Promise<TrustProfile> {
  const profile = await getTrustProfile(userId);
  return profile ?? {
    userId,
    score: 25,
    level: "newcomer",
    lastUpdate: null,
  };
}
