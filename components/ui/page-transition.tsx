/**
 * COMPOSANT STRUCTUREL VIXUAL
 * Transition douce entre pages internes.
 * Usage : <PageTransition>{children}</PageTransition>
 */
"use client"

import { type ReactNode } from "react"

export function PageTransition({ children }: { children: ReactNode }) {
  return (
    <div className="animate-in fade-in-0 slide-in-from-bottom-2 duration-200">
      {children}
    </div>
  )
}
