import { Loader2 } from "lucide-react"

export default function DashboardLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 text-emerald-500 animate-spin" />
        <p className="text-white/60 text-sm">Chargement du tableau de bord...</p>
      </div>
    </div>
  )
}
