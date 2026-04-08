"use client";

/**
 * VIXUAL — components/error-boundary.tsx
 * 
 * Composant ErrorBoundary React pour capturer les erreurs
 * et afficher un fallback UI elegant.
 */

import React, { Component, type ReactNode } from "react";
import { AlertTriangle, RefreshCw, Home, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ errorInfo });
    
    // Callback pour logging externe (Sentry, etc.)
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log en console pour le debug
    console.error("[ErrorBoundary] Caught error:", error);
    console.error("[ErrorBoundary] Component stack:", errorInfo.componentStack);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  handleGoHome = () => {
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      // Fallback personnalise si fourni
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Fallback par defaut avec style VIXUAL
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-900/80 border border-white/10 rounded-2xl p-8 text-center">
            {/* Icon */}
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-rose-400" />
            </div>

            {/* Title */}
            <h1 className="text-2xl font-bold text-white mb-2">
              Oups, une erreur est survenue
            </h1>

            {/* Description */}
            <p className="text-white/60 mb-6">
              Nous sommes desoles, quelque chose s&apos;est mal passe. 
              Notre equipe a ete notifiee et travaille a resoudre le probleme.
            </p>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
              <Button
                onClick={this.handleRetry}
                className="bg-amber-500 hover:bg-amber-600 text-black font-semibold"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Reessayer
              </Button>
              <Button
                onClick={this.handleGoHome}
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
              >
                <Home className="w-4 h-4 mr-2" />
                Accueil
              </Button>
            </div>

            {/* Support link */}
            <a
              href="mailto:support@vixual.co"
              className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-amber-400 transition-colors"
            >
              <Mail className="w-4 h-4" />
              Contacter le support
            </a>

            {/* Error details (dev mode only) */}
            {process.env.NODE_ENV === "development" && this.state.error && (
              <div className="mt-6 p-4 bg-slate-950/50 rounded-lg text-left">
                <p className="text-xs font-mono text-rose-400 mb-2">
                  {this.state.error.toString()}
                </p>
                {this.state.errorInfo && (
                  <pre className="text-xs font-mono text-white/30 overflow-auto max-h-32">
                    {this.state.errorInfo.componentStack}
                  </pre>
                )}
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// ── Hook pour composants fonctionnels ─────────────────────────────────────────

export function useErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null);

  const handleError = React.useCallback((error: Error) => {
    setError(error);
    console.error("[useErrorHandler] Error caught:", error);
  }, []);

  const resetError = React.useCallback(() => {
    setError(null);
  }, []);

  // Throw error to be caught by ErrorBoundary
  if (error) {
    throw error;
  }

  return { handleError, resetError };
}

export default ErrorBoundary;
