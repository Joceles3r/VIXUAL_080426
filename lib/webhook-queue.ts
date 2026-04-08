import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

// ── Queue keys ──
const QUEUE_KEY = "visual:webhook:queue";
const PROCESSING_KEY = "visual:webhook:processing";
const DEAD_LETTER_KEY = "visual:webhook:dead_letter";
const MAX_RETRIES = 3;
const LOCK_TTL_SECONDS = 30;

export interface WebhookJob {
  eventId: string;
  eventType: string;
  payload: string; // JSON stringified
  attempt: number;
  enqueuedAt: string;
  lastError?: string;
}

/**
 * Enqueue a webhook event for async processing.
 * Returns the job that was enqueued.
 */
export async function enqueueWebhookEvent(
  eventId: string,
  eventType: string,
  payload: string
): Promise<WebhookJob> {
  const job: WebhookJob = {
    eventId,
    eventType,
    payload,
    attempt: 0,
    enqueuedAt: new Date().toISOString(),
  };

  // Use a sorted set with timestamp as score for FIFO ordering
  await redis.zadd(QUEUE_KEY, {
    score: Date.now(),
    member: JSON.stringify(job),
  });

  return job;
}

/**
 * Dequeue the next webhook job for processing.
 * Uses a lock to prevent concurrent processing of the same job.
 */
export async function dequeueNextJob(): Promise<WebhookJob | null> {
  // Get the oldest job from the sorted set
  const results = await redis.zrange(QUEUE_KEY, 0, 0) as string[];
  if (!results || results.length === 0) return null;

  const raw = results[0];
  const job: WebhookJob = typeof raw === "string" ? JSON.parse(raw) : raw as WebhookJob;

  // Try to acquire a lock for this event
  const lockKey = `visual:webhook:lock:${job.eventId}`;
  const acquired = await redis.set(lockKey, "1", { nx: true, ex: LOCK_TTL_SECONDS });
  if (!acquired) return null; // Another worker is processing this

  // Move from queue to processing
  await redis.zrem(QUEUE_KEY, raw);
  await redis.hset(PROCESSING_KEY, { [job.eventId]: JSON.stringify(job) });

  return job;
}

/**
 * Mark a job as successfully completed.
 */
export async function completeJob(eventId: string): Promise<void> {
  await redis.hdel(PROCESSING_KEY, eventId);
  await redis.del(`visual:webhook:lock:${eventId}`);
}

/**
 * Mark a job as failed. Re-enqueue if under max retries, else dead-letter.
 */
export async function failJob(eventId: string, error: string): Promise<{ retried: boolean; deadLettered: boolean }> {
  const raw = await redis.hget(PROCESSING_KEY, eventId) as string | null;
  if (!raw) return { retried: false, deadLettered: false };

  const job: WebhookJob = typeof raw === "string" ? JSON.parse(raw) : raw as WebhookJob;
  job.attempt += 1;
  job.lastError = error;

  // Remove from processing
  await redis.hdel(PROCESSING_KEY, eventId);
  await redis.del(`visual:webhook:lock:${eventId}`);

  if (job.attempt >= MAX_RETRIES) {
    // Send to dead letter queue
    await redis.zadd(DEAD_LETTER_KEY, {
      score: Date.now(),
      member: JSON.stringify(job),
    });
    return { retried: false, deadLettered: true };
  }

  // Re-enqueue with exponential backoff score
  const backoffMs = Math.pow(2, job.attempt) * 1000; // 2s, 4s, 8s
  await redis.zadd(QUEUE_KEY, {
    score: Date.now() + backoffMs,
    member: JSON.stringify(job),
  });

  return { retried: true, deadLettered: false };
}

/**
 * Get queue stats for admin dashboard monitoring.
 */
export async function getQueueStats(): Promise<{
  pending: number;
  processing: number;
  deadLettered: number;
}> {
  const [pending, processingMap, deadLettered] = await Promise.all([
    redis.zcard(QUEUE_KEY),
    redis.hlen(PROCESSING_KEY),
    redis.zcard(DEAD_LETTER_KEY),
  ]);

  return {
    pending: pending ?? 0,
    processing: processingMap ?? 0,
    deadLettered: deadLettered ?? 0,
  };
}

/**
 * Get dead letter queue entries for admin review.
 */
export async function getDeadLetterJobs(limit = 20): Promise<WebhookJob[]> {
  const results = await redis.zrange(DEAD_LETTER_KEY, 0, limit - 1, { rev: true }) as string[];
  return results.map((r) => (typeof r === "string" ? JSON.parse(r) : r as WebhookJob));
}

/**
 * Retry a specific dead-lettered job by moving it back to queue.
 */
export async function retryDeadLetteredJob(eventId: string): Promise<boolean> {
  const jobs = await getDeadLetterJobs(100);
  const job = jobs.find((j) => j.eventId === eventId);
  if (!job) return false;

  job.attempt = 0;
  job.lastError = undefined;

  // Remove from dead letter and re-enqueue
  await redis.zrem(DEAD_LETTER_KEY, JSON.stringify(jobs.find((j) => j.eventId === eventId)));
  await redis.zadd(QUEUE_KEY, {
    score: Date.now(),
    member: JSON.stringify(job),
  });

  return true;
}
