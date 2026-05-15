/**
 * VIXUAL — hooks/use-content.ts
 *
 * Hook unifie pour charger un contenu (BD + fallback mock).
 * Utilise par /video/[id] et toute page necessitant un contenu unique.
 */
"use client"

import { useState, useEffect } from "react"
import type { Content } from "@/lib/mock-data"
import { ALL_CONTENTS } from "@/lib/mock-data"

export type UseContentResult = {
  content: Content | null
  isLoading: boolean
  source: "db" | "mock" | null
  error: string | null
}

export function useContent(id: string | undefined | null): UseContentResult {
  const [content, setContent] = useState<Content | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [source, setSource] = useState<"db" | "mock" | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) {
      setIsLoading(false)
      setError("missing_id")
      return
    }

    let cancelled = false
    setIsLoading(true)
    setError(null)

    // Tentative API (BD + fallback BD-mock cote serveur)
    fetch(`/api/contents/${id}`)
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json() as Promise<{ content: Content; source: "db" | "mock" }>
      })
      .then((data) => {
        if (cancelled) return
        setContent(data.content)
        setSource(data.source)
        setIsLoading(false)
      })
      .catch((e) => {
        if (cancelled) return
        // Fallback ultime : si l'API echoue completement, on tente direct le mock
        const mock = ALL_CONTENTS.find((c) => c.id === id)
        if (mock) {
          setContent(mock)
          setSource("mock")
          setIsLoading(false)
        } else {
          setError(e instanceof Error ? e.message : "fetch_failed")
          setIsLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [id])

  return { content, isLoading, source, error }
}
