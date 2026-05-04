import { Loader2 } from "lucide-react"

export default function VideoLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-4 border-emerald-500/20" />
          <Loader2 className="absolute inset-0 m-auto h-8 w-8 text-emerald-500 animate-spin" />
        </div>
        <p className="text-white/60 text-sm">Chargement du contenu...</p>
      </div>
    </div>
  )
}
