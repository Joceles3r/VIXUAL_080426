import { sql } from "@/lib/db"

let cachedBlacklist: Set<string> | null = null
let cacheExpiry = 0
const CACHE_TTL_MS = 60_000

async function getBlacklist(): Promise<Set<string>> {
  const now = Date.now()
  if (cachedBlacklist && now < cacheExpiry) return cachedBlacklist

  try {
    const rows = await sql`
      SELECT ip_address FROM security_ip_blacklist
      WHERE expires_at IS NULL OR expires_at > NOW()
    `
    cachedBlacklist = new Set(rows.map((r) => r.ip_address as string))
  } catch {
    cachedBlacklist = new Set()
  }
  cacheExpiry = now + CACHE_TTL_MS
  return cachedBlacklist
}

export async function isIPBlacklisted(ip: string): Promise<boolean> {
  if (!ip || ip === "unknown") return false
  const blacklist = await getBlacklist()
  return blacklist.has(ip)
}

export async function blacklistIP(
  ip: string,
  reason: string,
  severity: "warn" | "block" | "ban" = "block",
  addedBy: string = "auto",
  expiresAt: Date | null = null,
): Promise<void> {
  const expiresIso = expiresAt ? expiresAt.toISOString() : null
  await sql`
    INSERT INTO security_ip_blacklist (ip_address, reason, severity, added_by, expires_at)
    VALUES (${ip}, ${reason}, ${severity}, ${addedBy}, ${expiresIso})
    ON CONFLICT (ip_address) DO UPDATE
      SET reason = EXCLUDED.reason,
          severity = EXCLUDED.severity,
          added_by = EXCLUDED.added_by,
          expires_at = EXCLUDED.expires_at
  `
  cachedBlacklist = null
  cacheExpiry = 0
}

export async function unblacklistIP(ip: string): Promise<void> {
  await sql`DELETE FROM security_ip_blacklist WHERE ip_address = ${ip}`
  cachedBlacklist = null
  cacheExpiry = 0
}
