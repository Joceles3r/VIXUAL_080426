"use client"

/**
 * VISUAL Sound Provider
 * 
 * Fournit le contexte audio global pour l'application VISUAL.
 * Gère l'état on/off, le volume, et fournit les fonctions de lecture.
 */

import { createContext, useContext, ReactNode } from "react"
import { useSounds, type UseSoundsReturn } from "@/lib/sounds"

const SoundContext = createContext<UseSoundsReturn | null>(null)

export function SoundProvider({ children }: { children: ReactNode }) {
  const sounds = useSounds()
  
  return (
    <SoundContext.Provider value={sounds}>
      {children}
    </SoundContext.Provider>
  )
}

export function useSoundContext(): UseSoundsReturn {
  const ctx = useContext(SoundContext)
  if (!ctx) {
    // Fallback pour les composants hors provider
    return useSounds()
  }
  return ctx
}
