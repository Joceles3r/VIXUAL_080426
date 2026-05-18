"use client"

import { useEffect, useState } from "react"

/**
 * Detecte si l'appareil est tactile (smartphone, tablette, ecran tactile).
 *
 * Combine plusieurs indicateurs pour une detection fiable :
 * - `ontouchstart` : evenements tactiles disponibles
 * - `navigator.maxTouchPoints` : nombre max de points de contact (>0 sur tactile)
 * - Media query `(pointer: coarse)` : pointeur grossier (doigt vs souris)
 *
 * Reagit aux changements (rotation, ecran externe branche, mode tablette Windows).
 *
 * @returns `true` si l'appareil est tactile, `false` sinon (et pendant SSR).
 *
 * @example
 * const isTouch = useTouchDevice()
 * return isTouch ? <MobileBottomNav /> : <DesktopSidebar />
 */
export function useTouchDevice(): boolean {
  const [isTouch, setIsTouch] = useState(false)

  useEffect(() => {
    const check = () => {
      const hasTouch =
        "ontouchstart" in window ||
        navigator.maxTouchPoints > 0 ||
        // @ts-expect-error: legacy IE/Edge
        navigator.msMaxTouchPoints > 0
      const coarsePointer =
        typeof window.matchMedia === "function" &&
        window.matchMedia("(pointer: coarse)").matches
      setIsTouch(hasTouch || coarsePointer)
    }

    check()
    window.addEventListener("resize", check)

    let mq: MediaQueryList | null = null
    if (typeof window.matchMedia === "function") {
      mq = window.matchMedia("(pointer: coarse)")
      mq.addEventListener?.("change", check)
    }

    return () => {
      window.removeEventListener("resize", check)
      mq?.removeEventListener?.("change", check)
    }
  }, [])

  return isTouch
}
