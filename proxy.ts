/**
 * VIXUAL — Proxy de routage & sécurité (anciennement middleware.ts)
 *
 * Responsabilités:
 *   1. Exclure les routes Stripe et Bunny de la protection preview
 *   2. Appliquer l'authentification Basic Auth au preview staging
 *   3. Bypass Next.js internals + resources statiques
 *   4. Compatible avec Upstash Redis + classification routes (legacy)
 *
 * Architecture:
 *   - Edge runtime safe (atob au lieu de Buffer.from)
 *   - Fail-open si pas de credentials preview
 *   - Idempotent: plusieurs appels retournent le même résultat
 *
 * Migration: middleware.ts -> proxy.ts (Next.js 17 convention)
 */

import { NextRequest, NextResponse } from "next/server";

const USER = process.env.VIXUAL_PREVIEW_USER;
const PASS = process.env.VIXUAL_PREVIEW_PASSWORD;

export function proxy(req: NextRequest) {
  const url = req.nextUrl.pathname;

  // ── Autoriser les routes critiques (bypass auth) ─────────────────────────

  // Next.js internals — jamais filtrer
  if (url.startsWith("/_next") || url === "/favicon.ico" || url === "/robots.txt") {
    return NextResponse.next();
  }

  // Stripe webhooks & API (production critical) — jamais filtrer
  if (url.startsWith("/api/stripe") || url.startsWith("/api/integrations/stripe")) {
    return NextResponse.next();
  }

  // Bunny.net webhooks & API (production critical) — jamais filtrer
  if (url.startsWith("/api/bunny")) {
    return NextResponse.next();
  }

  // Pas de credentials preview configurées — laisser passer
  if (!USER || !PASS) {
    return NextResponse.next();
  }

  // ── Vérifier Basic Auth (pour preview staging) ─────────────────────────────

  const auth = req.headers.get("authorization");

  if (auth?.startsWith("Basic ")) {
    const encoded = auth.split(" ")[1] ?? "";
    let decoded = "";

    try {
      // Edge runtime safe: utiliser atob au lieu de Buffer.from
      decoded = atob(encoded);
    } catch {
      decoded = "";
    }

    const [user, pass] = decoded.split(":");

    if (user === USER && pass === PASS) {
      const response = NextResponse.next();
      response.headers.set("X-Robots-Tag", "noindex, nofollow");
      return response;
    }
  }

  // ── Auth échouée: retourner 401 avec challenge WWW-Authenticate ──────────

  return new NextResponse("VIXUAL Preview Protected", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="VIXUAL Preview"',
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}

// ── Configuration du matcher ──────────────────────────────────────────────────
// Exempte les routes critiques du proxy (bypass total)

export const config = {
  matcher: [
    "/((?!api/stripe|api/integrations/stripe|api/bunny|_next|favicon.ico|robots.txt).*)",
  ],
};
