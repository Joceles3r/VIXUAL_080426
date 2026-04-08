"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"

type Props = {
  isMinor?: boolean
  minorStatus?: string
}

export function MinorStatusBadge(props: Props) {
  const { user } = useAuth()
  const [local, setLocal] = useState<{ isMinor: boolean; status: string } | null>(null)

  useEffect(() => {
    if (typeof props.isMinor === "boolean" && typeof props.minorStatus === "string") return
    try {
      const isMinor = localStorage.getItem("visual_is_minor") === "true"
      const status = localStorage.getItem("visual_minor_status") || "none"
      setLocal({ isMinor, status })
    } catch {
      setLocal({ isMinor: false, status: "none" })
    }
  }, [props.isMinor, props.minorStatus])

  const isMinor = typeof props.isMinor === "boolean" ? props.isMinor : (local?.isMinor ?? false)
  const status = typeof props.minorStatus === "string" ? props.minorStatus : (local?.status ?? "none")

  if (!isMinor) return null
  if (status !== "pending") return null

  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-300">
      <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
      {"Validation mineur en cours"}
    </span>
  )
}
