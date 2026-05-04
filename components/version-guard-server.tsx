import { ReactNode } from "react"
import Link from "next/link"
import { sql } from "@/lib/db"
import { Lock, ArrowLeft } from "lucide-react"
import type { PlatformVersion } from "@/lib/platform/version"

async function getServerPlatformVersion(): Promise<PlatformVersion> {
  try {
    const rows = await sql`SELECT current_version FROM platform_version WHERE id = 1 LIMIT 1`
    return (rows[0]?.current_version as PlatformVersion) ?? "V1"
  } catch {
    return "V1"
  }
}

export async function VersionGuardServer({
  requiredVersion,
  children,
}: {
  requiredVersion: PlatformVersion
  children: ReactNode
}) {
  const current = await getServerPlatformVersion()
  const order = { V1: 1, V2: 2, V3: 3 }

  if (order[current] < order[requiredVersion]) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <div className="max-w-md text-center">
          <div className="w-14 h-14 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto mb-5">
            <Lock className="h-6 w-6 text-amber-400" />
          </div>
          <h1 className="text-xl font-semibold text-white mb-2">
            Fonctionnalite bientot disponible
          </h1>
          <p className="text-white/55 text-sm mb-6">
            Cette section ouvrira en {requiredVersion === "V2" ? "phase 2" : "phase 3"} de VIXUAL.
          </p>
          <Link
            href="/explore"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-white/15 text-white/80 hover:bg-white/5 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Retour a l&apos;exploration
          </Link>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
