"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

/**
 * Displays a warning banner when Stripe is in test mode.
 * Reads the NEXT_PUBLIC env var directly on the client.
 */
export function StripeModeBanner() {
  const isTest = process.env.NEXT_PUBLIC_STRIPE_TEST_MODE !== "false";

  if (!isTest) return null;

  return (
    <Alert className="bg-amber-500/10 border-amber-500/30 rounded-none border-x-0 border-t-0">
      <AlertTriangle className="h-4 w-4 text-amber-400" />
      <AlertTitle className="text-amber-400 text-sm font-medium">
        Mode Test Stripe
      </AlertTitle>
      <AlertDescription className="text-amber-400/70 text-xs">
        {"Les paiements ne sont pas r\u00e9els. Carte de test : 4242 4242 4242 4242"}
      </AlertDescription>
    </Alert>
  );
}
