"use client"
import { useEffect, useState } from "react"
import type { PlatformVersion } from "@/lib/platform/version"

let cachedVersion: PlatformVersion | null = null
let cacheExpiry = 0
const CACHE_TTL_MS = 30_000

export function usePlatformVersion(): PlatformVersion {
  const [version, setVersion] = useState<PlatformVersion>(cachedVersion ?? "V3")

  useEffect(() => {
    const now = Date.now()
    if (cachedVersion && now < cacheExpiry) {
      setVersion(cachedVersion)
      return
    }
    fetch("/api/platform/version")
      .then(r => r.json())
      .then(d => {
        const v = (d.version as PlatformVersion) ?? "V3"
        cachedVersion = v
        cacheExpiry = Date.now() + CACHE_TTL_MS
        setVersion(v)
      })
      .catch(() => setVersion("V3"))
  }, [])

  return version
}

export function isAtLeastVersion(current: PlatformVersion, required: PlatformVersion): boolean {
  const order = { V1: 1, V2: 2, V3: 3 }
  return order[current] >= order[required]
}
