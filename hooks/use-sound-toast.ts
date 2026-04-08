"use client"

/**
 * Sound-enhanced toast hook
 * 
 * Wraps useToast with automatic VISUAL jingle playback
 * based on toast type (success, error, default)
 */

import { useCallback } from "react"
import { useToast, toast as baseToast } from "./use-toast"
import { useSounds } from "@/lib/sounds"

export function useSoundToast() {
  const toastApi = useToast()
  const sounds = useSounds()

  const toast = useCallback(
    (props: Parameters<typeof baseToast>[0] & { sound?: "win" | "pulse" | "success" | "error" | "boost" | "none" }) => {
      const { sound, ...toastProps } = props

      // Déterminer quel son jouer
      if (sound !== "none" && sounds.enabled) {
        if (sound) {
          sounds.play(sound)
        } else if (toastProps.variant === "destructive") {
          sounds.playError()
        } else {
          sounds.playPulse()
        }
      }

      return baseToast(toastProps)
    },
    [sounds]
  )

  // Raccourcis pour les cas courants
  const toastSuccess = useCallback(
    (title: string, description?: string) => {
      sounds.playSuccess()
      return baseToast({ title, description })
    },
    [sounds]
  )

  const toastWin = useCallback(
    (title: string, description?: string) => {
      sounds.playWin()
      return baseToast({ title, description })
    },
    [sounds]
  )

  const toastError = useCallback(
    (title: string, description?: string) => {
      sounds.playError()
      return baseToast({ title, description, variant: "destructive" })
    },
    [sounds]
  )

  const toastBoost = useCallback(
    (title: string, description?: string) => {
      sounds.playBoost()
      return baseToast({ title, description })
    },
    [sounds]
  )

  return {
    ...toastApi,
    toast,
    toastSuccess,
    toastWin,
    toastError,
    toastBoost,
  }
}
