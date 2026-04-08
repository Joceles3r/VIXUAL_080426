"use client"

import { useEffect } from "react"

/**
 * Suppresses the benign ResizeObserver loop error that occurs in some browsers.
 * This error is not harmful and is caused by ResizeObserver callbacks triggering
 * additional resize observations within the same frame.
 * 
 * See: https://github.com/WICG/resize-observer/issues/38
 */
export function ResizeObserverFix() {
  useEffect(() => {
    const resizeObserverError = (e: ErrorEvent) => {
      if (e.message === "ResizeObserver loop completed with undelivered notifications." ||
          e.message === "ResizeObserver loop limit exceeded") {
        e.stopImmediatePropagation()
        e.preventDefault()
      }
    }

    window.addEventListener("error", resizeObserverError)
    
    return () => {
      window.removeEventListener("error", resizeObserverError)
    }
  }, [])

  return null
}
