"use client"
import { ReactNode } from "react"
import type { PlatformVersion } from "@/lib/platform/version"
import type { UserLevel } from "@/lib/platform/user-level"

interface Props {
  platformVersion: PlatformVersion
  userLevel?: UserLevel
  requiredVersion?: PlatformVersion
  requiredLevel?: UserLevel
  fallback?: ReactNode
  children: ReactNode
}

const order = { V1: 1, V2: 2, V3: 3 }

export function FeatureGate({ platformVersion, userLevel = 1, requiredVersion, requiredLevel, fallback = null, children }: Props) {
  if (requiredVersion && order[platformVersion] < order[requiredVersion]) return <>{fallback}</>
  if (requiredLevel && userLevel < requiredLevel) return <>{fallback}</>
  return <>{children}</>
}
