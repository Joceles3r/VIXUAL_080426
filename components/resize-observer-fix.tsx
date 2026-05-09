"use client"

import { useEffect } from "react"

/**
 * Supprime deux erreurs benignes du navigateur qui polluent la console
 * et peuvent declencher des Error Boundaries inutilement :
 *
 * 1. "ResizeObserver loop ..." : callbacks declenchant d'autres mesures
 *    dans la meme frame. Sans danger.
 *    https://github.com/WICG/resize-observer/issues/38
 *
 * 2. "Failed to execute 'removeChild' on 'Node'" / "insertBefore" :
 *    causee par des extensions navigateur (Google Translate, Grammarly,
 *    LanguageTool, etc.) qui modifient le DOM en dehors de React.
 *    Le bloc <html translate="no"> + <meta name="google" content="notranslate">
 *    bloque le cas le plus frequent, mais d'autres extensions peuvent encore
 *    declencher cette erreur. La supprimer evite des Error Boundaries
 *    parasites — l'utilisateur recharge naturellement la page si le DOM
 *    est trop corrompu.
 */
export function ResizeObserverFix() {
  useEffect(() => {
    const isBenign = (msg: string | undefined): boolean => {
      if (!msg) return false
      return (
        msg.includes("ResizeObserver loop") ||
        msg.includes("Failed to execute 'removeChild' on 'Node'") ||
        msg.includes("Failed to execute 'insertBefore' on 'Node'") ||
        msg.includes("The node to be removed is not a child of this node") ||
        msg.includes("The node before which the new node is to be inserted is not a child of this node")
      )
    }

    const onError = (e: ErrorEvent) => {
      if (isBenign(e.message)) {
        e.stopImmediatePropagation()
        e.preventDefault()
      }
    }

    const onUnhandledRejection = (e: PromiseRejectionEvent) => {
      const reason = e.reason
      const msg =
        typeof reason === "string"
          ? reason
          : reason && typeof reason.message === "string"
            ? reason.message
            : undefined
      if (isBenign(msg)) {
        e.preventDefault()
      }
    }

    window.addEventListener("error", onError)
    window.addEventListener("unhandledrejection", onUnhandledRejection)

    return () => {
      window.removeEventListener("error", onError)
      window.removeEventListener("unhandledrejection", onUnhandledRejection)
    }
  }, [])

  return null
}
