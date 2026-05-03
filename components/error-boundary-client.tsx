"use client"

import { ReactNode } from "react"
import { ErrorBoundary } from "@/components/error-boundary"

interface ErrorBoundaryClientProps {
  children: ReactNode
  fallback?: ReactNode
}

/**
 * Client-side wrapper for ErrorBoundary that handles onError callback.
 * This allows us to use ErrorBoundary from a Server Component (layout.tsx).
 */
export function ErrorBoundaryClient({ children, fallback }: ErrorBoundaryClientProps) {
  return (
    <ErrorBoundary
      fallback={fallback}
      onError={(error, errorInfo) => {
        // Log to external service in production (Sentry, LogRocket, etc.)
        if (process.env.NODE_ENV === "production") {
          console.error("[VIXUAL] Global error:", error.message)
          // NOTE post-Bunny: Send to error tracking service
        }
      }}
    >
      {children}
    </ErrorBoundary>
  )
}
