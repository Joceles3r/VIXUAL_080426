"use client"

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react"

export type Language = "fr" | "en"

const STORAGE_KEY = "vixual_lang"
const COOKIE_NAME = "vixual_lang"

/** Détecte la langue préférée du navigateur (fallback français) */
function detectBrowserLanguage(): Language {
  if (typeof navigator === "undefined") return "fr"
  const lang = (navigator.language || (navigator as any).userLanguage || "fr").toLowerCase()
  return lang.startsWith("en") ? "en" : "fr"
}

/** Lit la langue stockée (cookie ou localStorage), sinon détecte */
function readStoredLanguage(): Language {
  if (typeof window === "undefined") return "fr"
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY) as Language | null
    if (stored === "fr" || stored === "en") return stored
  } catch {}
  if (typeof document !== "undefined") {
    const match = document.cookie.match(new RegExp(`${COOKIE_NAME}=(fr|en)`))
    if (match) return match[1] as Language
  }
  return detectBrowserLanguage()
}

// ──────────────────────────────────────────────────────────────────
// Contexte global — source de vérité unique pour toute l'application
// ──────────────────────────────────────────────────────────────────
type LanguageContextValue = {
  lang: Language
  setLang: (lang: Language) => void
  hydrated: boolean
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>("fr")
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    const initial = readStoredLanguage()
    setLangState(initial)
    setHydrated(true)
    if (typeof document !== "undefined") {
      document.documentElement.lang = initial
    }
  }, [])

  const setLang = useCallback((newLang: Language) => {
    setLangState(newLang)
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(STORAGE_KEY, newLang)
      } catch {}
    }
    if (typeof document !== "undefined") {
      document.cookie = `${COOKIE_NAME}=${newLang}; path=/; max-age=31536000; SameSite=Lax`
      document.documentElement.lang = newLang
    }
  }, [])

  const value = useMemo(
    () => ({ lang, setLang, hydrated }),
    [lang, setLang, hydrated],
  )

  return React.createElement(LanguageContext.Provider, { value }, children)
}

/**
 * Hook d'accès à la langue active.
 * API inchangée : `{ lang, setLang, hydrated }`.
 * Si le provider n'est pas monté (rare, ex: outils dev), fallback non-réactif sûr.
 */
export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext)
  if (ctx) return ctx
  // Fallback défensif si LanguageProvider absent — pas de réactivité, juste lecture
  return {
    lang: "fr",
    setLang: () => {},
    hydrated: false,
  }
}
