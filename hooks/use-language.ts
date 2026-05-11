"use client"

import { useEffect, useState, useCallback } from "react"

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
  // Lire cookie
  if (typeof document !== "undefined") {
    const match = document.cookie.match(new RegExp(`${COOKIE_NAME}=(fr|en)`))
    if (match) return match[1] as Language
  }
  return detectBrowserLanguage()
}

export function useLanguage() {
  const [lang, setLangState] = useState<Language>("fr")
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setLangState(readStoredLanguage())
    setHydrated(true)
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
    }
  }, [])

  return { lang, setLang, hydrated }
}
