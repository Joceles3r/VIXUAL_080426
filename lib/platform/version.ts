import { sql } from "@/lib/db"

export type PlatformVersion = "V1" | "V2" | "V3"

let cachedVersion: PlatformVersion | null = null
let cacheExpiry = 0
const CACHE_TTL_MS = 30_000

export async function getPlatformVersion(): Promise<PlatformVersion> {
  const now = Date.now()
  if (cachedVersion && now < cacheExpiry) return cachedVersion
  try {
    const rows = await sql`SELECT current_version FROM platform_version WHERE id = 1 LIMIT 1`
    const v = (rows[0]?.current_version as PlatformVersion) ?? "V1"
    cachedVersion = v
    cacheExpiry = now + CACHE_TTL_MS
    return v
  } catch {
    return "V1"
  }
}

export function invalidatePlatformVersionCache() {
  cachedVersion = null
  cacheExpiry = 0
}

export async function setPlatformVersion(
  newVersion: PlatformVersion,
  changedBy: string,
  reason: string
): Promise<void> {
  const current = await getPlatformVersion()
  await sql`UPDATE platform_version SET current_version = ${newVersion}, updated_by = ${changedBy}, updated_at = NOW(), reason = ${reason} WHERE id = 1`
  await sql`INSERT INTO platform_version_history (from_version, to_version, changed_by, reason) VALUES (${current}, ${newVersion}, ${changedBy}, ${reason})`
  invalidatePlatformVersionCache()
}

export function isVersionAtLeast(current: PlatformVersion, required: PlatformVersion): boolean {
  const order = { V1: 1, V2: 2, V3: 3 }
  return order[current] >= order[required]
}
