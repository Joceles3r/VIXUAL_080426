/**
 * COMPOSANT STRUCTUREL VIXUAL — TEST-LAB
 * Gate cote client : seul l'ADMIN/PATRON (email officiel) accede.
 * Le serveur revalide via assertTestLabAccess sur chaque route API.
 */
"use client"

import type { ReactNode } from "react"
import Link from "next/link"
import { Lock, FlaskConical, ArrowLeft } from "lucide-react"
import { useTestLabAccess } from "@/lib/test-lab/use-test-lab-access"

export default function TestLabLayout({ children }: { children: ReactNode }) {
  const access = useTestLabAccess()

  if (!access.canAccess) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <div className="max-w-md text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center">
            <Lock className="h-8 w-8 text-rose-400" />
          </div>
          <h1 className="text-xl font-semibold text-white">
            Laboratoire de tests reserve
          </h1>
          <p className="text-white/60 text-sm">
            Cet espace est strictement reserve a l&apos;ADMIN/PATRON VIXUAL.
            {!access.isVisible && " Le module est actuellement desactive."}
          </p>
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-sm text-white/80 hover:bg-white/5 transition"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour ADMIN/PATRON
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <header className="border-b border-violet-500/20 bg-violet-500/5">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-3">
          <FlaskConical className="h-5 w-5 text-violet-300" />
          <p className="text-sm text-violet-200 font-medium">
            Laboratoire de tests VIXUAL — environnement isole
          </p>
          <Link
            href="/admin"
            className="ml-auto text-xs text-white/50 hover:text-white/80 transition"
          >
            Retour ADMIN
          </Link>
        </div>
      </header>
      {children}
    </div>
  )
}
