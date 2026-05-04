/**
 * COMPOSANT STRUCTUREL VIXUAL
 * Modifier avec prudence : impact navigation /social.
 */
export default function SocialLoading() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center bg-slate-950">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin" />
        <p className="text-white/60 text-sm">Chargement du feed social...</p>
      </div>
    </div>
  )
}
