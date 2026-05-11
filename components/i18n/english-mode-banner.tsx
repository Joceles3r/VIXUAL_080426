"use client"

import { Languages } from "lucide-react"
import { useLanguage } from "@/hooks/use-language"

/**
 * Bandeau global "English preview enabled".
 * Affiché si et seulement si lang === "en". Réactif via LanguageProvider.
 * Disparait immediatement quand on repasse en FR.
 */
export function EnglishModeBanner() {
  const { lang, setLang, hydrated } = useLanguage()

  if (!hydrated) return null
  if (lang !== "en") return null

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed top-24 left-1/2 z-[60] w-[min(92vw,760px)] -translate-x-1/2 rounded-2xl border border-sky-400/25 bg-slate-950/90 px-4 py-3 text-sm text-white shadow-2xl shadow-sky-950/40 backdrop-blur-xl"
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 rounded-full bg-sky-400/15 p-2 text-sky-200">
          <Languages className="h-4 w-4" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="font-semibold text-white">English preview enabled</p>
          <p className="mt-1 text-white/65 leading-relaxed">
            Main VIXUAL homepage messages are displayed in English. Full legal
            and admin pages remain in French for now.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setLang("fr")}
          className="shrink-0 rounded-full border border-white/10 px-3 py-1 text-xs text-white/70 hover:bg-white/10 hover:text-white transition-colors"
          aria-label="Switch back to French"
        >
          FR
        </button>
      </div>
    </div>
  )
}
