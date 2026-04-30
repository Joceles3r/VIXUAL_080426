"use client"
import { ReactNode } from "react"
import Link from "next/link"
import { usePlatformVersion, isAtLeastVersion } from "@/hooks/use-platform-version"
import type { PlatformVersion } from "@/lib/platform/version"
import { Lock, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export function VersionGuard({ requiredVersion, children }: { requiredVersion: PlatformVersion; children: ReactNode }) {
  const current = usePlatformVersion()

  if (!isAtLeastVersion(current, requiredVersion)) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <div className="max-w-md text-center">
          <div className="w-14 h-14 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto mb-5">
            <Lock className="h-6 w-6 text-amber-400" />
          </div>
          <h1 className="text-xl font-semibold text-white mb-2">Fonctionnalite bientot disponible</h1>
          <p className="text-white/55 text-sm mb-6">
            Cette section ouvrira en {requiredVersion === "V2" ? "phase 2" : "phase 3"} de VIXUAL.
            En attendant, profitez des contenus disponibles sur l&apos;accueil.
          </p>
          <Link href="/explore">
            <Button variant="outline" className="border-white/15">
              <ArrowLeft className="h-4 w-4 mr-2" /> Retour a l&apos;exploration
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
