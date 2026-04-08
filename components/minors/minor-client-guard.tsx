"use client"

import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"

const ALLOW = ["/minor/consent", "/minor/verify", "/legal", "/logout"]

export function MinorClientGuard() {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (ALLOW.some((p) => pathname.startsWith(p))) return

    try {
      const isMinor = localStorage.getItem("visual_is_minor") === "true"
      const status = localStorage.getItem("visual_minor_status") || "none"
      if (isMinor && status === "pending") {
        router.replace("/minor/consent")
      }
    } catch { /* silent */ }
  }, [pathname, router])

  return null
}
