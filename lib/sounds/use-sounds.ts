"use client"

/**
 * VISUAL Sound System - React Hook
 * 
 * Usage:
 * const { play, playWin, playPulse, enabled, setEnabled } = useSounds()
 * 
 * play("spark")  // Joue le jingle principal
 * playWin()      // Raccourci pour jouer le son de victoire
 */

import { useCallback, useEffect, useState } from "react"
import type { SoundName, SoundState } from "./types"
import { DEFAULT_SOUND_STATE } from "./types"
import { playSound } from "./synthesizer"

const STORAGE_KEY = "visual_sound_settings"

export function useSounds() {
  const [state, setState] = useState<SoundState>(DEFAULT_SOUND_STATE)
  const [isClient, setIsClient] = useState(false)

  // Hydratation côté client
  useEffect(() => {
    setIsClient(true)
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        setState(JSON.parse(stored))
      }
    } catch {
      // Ignore localStorage errors
    }
  }, [])

  // Persistance des préférences
  useEffect(() => {
    if (isClient) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
      } catch {
        // Ignore localStorage errors
      }
    }
  }, [state, isClient])

  const play = useCallback(
    (name: SoundName) => {
      if (!isClient || !state.enabled) return
      playSound(name, state.volume)
    },
    [isClient, state.enabled, state.volume]
  )

  const setEnabled = useCallback((enabled: boolean) => {
    setState((s) => ({ ...s, enabled }))
  }, [])

  const setVolume = useCallback((volume: number) => {
    setState((s) => ({ ...s, volume: Math.max(0, Math.min(1, volume)) }))
  }, [])

  const toggle = useCallback(() => {
    setState((s) => ({ ...s, enabled: !s.enabled }))
  }, [])

  // Raccourcis pour les sons courants
  const playSpark = useCallback(() => play("spark"), [play])
  const playPulse = useCallback(() => play("pulse"), [play])
  const playWin = useCallback(() => play("win"), [play])
  const playBoost = useCallback(() => play("boost"), [play])
  const playClick = useCallback(() => play("click"), [play])
  const playSuccess = useCallback(() => play("success"), [play])
  const playError = useCallback(() => play("error"), [play])

  return {
    // État
    enabled: state.enabled,
    volume: state.volume,
    
    // Actions
    play,
    setEnabled,
    setVolume,
    toggle,

    // Raccourcis
    playSpark,
    playPulse,
    playWin,
    playBoost,
    playClick,
    playSuccess,
    playError,
  }
}

export type UseSoundsReturn = ReturnType<typeof useSounds>
