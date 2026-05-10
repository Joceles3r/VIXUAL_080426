"use client"

import { useEffect, useRef, useState } from "react"

declare global {
  interface Window {
    turnstile?: {
      render: (container: HTMLElement, options: Record<string, unknown>) => string
      reset: (widgetId: string) => void
    }
  }
}

interface TurnstileWidgetProps {
  onSuccess: (token: string) => void
  onError?: () => void
  theme?: "light" | "dark" | "auto"
}

export function TurnstileWidget({ onSuccess, onError, theme = "dark" }: TurnstileWidgetProps) {
  const ref = useRef<HTMLDivElement>(null)
  const widgetIdRef = useRef<string | null>(null)
  const [loaded, setLoaded] = useState(false)
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY

  useEffect(() => {
    if (!siteKey) return // Module désactivé
    if (document.querySelector('script[src*="challenges.cloudflare.com"]')) {
      setLoaded(true)
      return
    }
    const script = document.createElement("script")
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js"
    script.async = true
    script.defer = true
    script.onload = () => setLoaded(true)
    document.body.appendChild(script)
  }, [siteKey])

  useEffect(() => {
    if (!loaded || !ref.current || !window.turnstile || !siteKey) return
    widgetIdRef.current = window.turnstile.render(ref.current, {
      sitekey: siteKey,
      callback: onSuccess,
      "error-callback": onError,
      theme,
      size: "normal",
    })
  }, [loaded, siteKey, onSuccess, onError, theme])

  if (!siteKey) return null
  return <div ref={ref} className="my-3" />
}
