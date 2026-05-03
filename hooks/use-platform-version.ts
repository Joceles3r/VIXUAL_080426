"use client"
import { useEffect, useState } from "react"
import type { PlatformVersion } from "@/lib/platform/version"

// ──────────────────────────────────────────────────────────────────
// Etat global partage entre tous les composants useurs du hook.
// ──────────────────────────────────────────────────────────────────
let cachedVersion: PlatformVersion | null = null
let cacheExpiry = 0
let inflight: Promise<PlatformVersion> | null = null
const CACHE_TTL_MS = 30_000

// Registre de listeners : chaque instance du hook s'inscrit ici.
// A chaque changement de version (bascule admin, refresh manuel, TTL),
// on notifie TOUS les listeners pour declencher un re-render React
// instantane sans rechargement de page.
type Listener = (v: PlatformVersion) => void
const listeners = new Set<Listener>()

function notifyAll(v: PlatformVersion) {
  listeners.forEach((l) => {
    try {
      l(v)
    } catch {
      /* listener detached */
    }
  })
}

async function fetchVersion(): Promise<PlatformVersion> {
  if (inflight) return inflight
  inflight = fetch("/api/platform/version", { cache: "no-store" })
    .then((r) => r.json())
    .then((d) => {
      const v = (d.version as PlatformVersion) ?? "V3"
      cachedVersion = v
      cacheExpiry = Date.now() + CACHE_TTL_MS
      return v
    })
    .catch(() => "V3" as PlatformVersion)
    .finally(() => {
      inflight = null
    })
  return inflight
}

// ──────────────────────────────────────────────────────────────────
// Hook React : abonnement automatique au registre + premier fetch.
// ──────────────────────────────────────────────────────────────────
export function usePlatformVersion(): PlatformVersion {
  const [version, setVersion] = useState<PlatformVersion>(cachedVersion ?? "V3")

  useEffect(() => {
    // 1. S'abonner aux notifications de changement
    listeners.add(setVersion)

    // 2. Si le cache est valide, l'utiliser ; sinon fetch frais
    const now = Date.now()
    if (cachedVersion && now < cacheExpiry) {
      setVersion(cachedVersion)
    } else {
      fetchVersion().then(setVersion)
    }

    // 3. Au demontage : se desabonner
    return () => {
      listeners.delete(setVersion)
    }
  }, [])

  return version
}

export function isAtLeastVersion(current: PlatformVersion, required: PlatformVersion): boolean {
  const order = { V1: 1, V2: 2, V3: 3 }
  return order[current] >= order[required]
}

/**
 * Notifie INSTANTANEMENT tous les hooks usePlatformVersion montes
 * dans la page. Utilise apres une bascule admin pour propager la
 * nouvelle version sans reload ni re-fetch.
 */
export function invalidatePlatformVersionCache(newVersion?: PlatformVersion) {
  if (newVersion) {
    cachedVersion = newVersion
    cacheExpiry = Date.now() + CACHE_TTL_MS
    notifyAll(newVersion)
  } else {
    // Force un re-fetch reseau
    cachedVersion = null
    cacheExpiry = 0
    fetchVersion().then(notifyAll)
  }
}
