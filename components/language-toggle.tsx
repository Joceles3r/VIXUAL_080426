"use client"

import { useLanguage } from "@/hooks/use-language"
import { Globe } from "lucide-react"

export function LanguageToggle({ className = "" }: { className?: string }) {
  const { lang, setLang, hydrated } = useLanguage()

  if (!hydrated) return null

  return (
    <div className={`inline-flex items-center gap-1 ${className}`}>
      <Globe className="h-3.5 w-3.5 text-white/40" />
      <button
        onClick={() => setLang("fr")}
        className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
          lang === "fr"
            ? "bg-white/10 text-white"
            : "text-white/45 hover:text-white/70"
        }`}
        aria-label="Français"
      >
        FR
      </button>
      <span className="text-white/20 text-xs">/</span>
      <button
        onClick={() => setLang("en")}
        className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
          lang === "en"
            ? "bg-white/10 text-white"
            : "text-white/45 hover:text-white/70"
        }`}
        aria-label="English"
      >
        EN
      </button>
    </div>
  )
}
