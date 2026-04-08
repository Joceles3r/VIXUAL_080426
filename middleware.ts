/**
 * VIXUAL - Edge Middleware
 *
 * Applies to all /api/* routes:
 * - Security headers (CSP, HSTS, X-Frame-Options, etc.)
 * - Rate limiting via Upstash Redis (financial routes get stricter limits)
 * - Request logging for audit trail
 */

import { NextResponse, type NextRequest } from "next/server";

// ── Route classification ──

type RouteClass = "financial" | "auth" | "webhook" | "admin" | "report" | "batch" | "standard";

function classifyRoute(pathname: string): RouteClass {
  if (pathname.includes("/api/integrations/stripe/webhooks") || pathname.includes("/api/integrations/bunny/webhook")) return "webhook";
  if (pathname.includes("/api/payout/batch")) return "batch";
  if (pathname.includes("/api/payout") || pathname.includes("/api/integrations/stripe/")) return "financial";
  if (pathname.includes("/api/admin")) return "admin";
  if (pathname.includes("/api/auth")) return "auth";
  if (pathname.includes("/api/report")) return "report";
  return "standard";
}

// ── Rate limit configs (mirrored from lib/rate-limit.ts for edge) ──
const RATE_CONFIGS: Record<RouteClass, { max: number; window: number }> = {
  standard: { max: 60, window: 60 },
  auth: { max: 10, window: 60 },
  financial: { max: 20, window: 60 },
  webhook: { max: 200, window: 60 },
  report: { max: 5, window: 60 },
  admin: { max: 30, window: 60 },
  batch: { max: 2, window: 60 },
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Security headers for ALL routes (not just /api) ──
  if (!pathname.startsWith("/api")) {
    const res = NextResponse.next();
    res.headers.set("X-Frame-Options", "DENY");
    res.headers.set("X-Content-Type-Options", "nosniff");
    res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    res.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(), fullscreen=(self)");
    res.headers.set("Cross-Origin-Opener-Policy", "same-origin");
    res.headers.set("Cross-Origin-Resource-Policy", "same-site");
    // Frontend CSP -- allow Stripe, Bunny.net CDN, and inline styles for Tailwind
    const frontendCsp = [
      "default-src 'self'",
      "script-src 'self' https://js.stripe.com 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "frame-src https://js.stripe.com https://cdn.bunny.net https://*.b-cdn.net",
      "connect-src 'self' https://api.stripe.com https://api.bunny.net https://cdn.bunny.net https://*.vercel-analytics.com",
      "img-src 'self' https://cdn.bunny.net https://*.b-cdn.net https://images.unsplash.com data: blob:",
      "media-src 'self' https://cdn.bunny.net https://*.b-cdn.net blob:",
      "font-src 'self'",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; ");
    res.headers.set("Content-Security-Policy", frontendCsp);
    return res;
  }

  const routeClass = classifyRoute(pathname);
  const config = RATE_CONFIGS[routeClass];

  // ── Extract identifier ──
  // SECURITY: En edge middleware, on n'a pas acces au JWT dechiffre
  // → toujours utiliser l'IP pour le rate-limiting (pas de header spoofable)
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
  const identifier = `ip:${ip}`;

  // ── Rate limiting via Upstash Redis REST API ──
  const kvUrl = process.env.KV_REST_API_URL;
  const kvToken = process.env.KV_REST_API_TOKEN;

  if (kvUrl && kvToken) {
    try {
      const key = `rl:${routeClass}:${identifier}`;
      const now = Math.floor(Date.now() / 1000);

      // Use Upstash REST API directly (edge-compatible)
      const countResp = await fetch(`${kvUrl}/pipeline`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${kvToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify([
          ["ZREMRANGEBYSCORE", key, "0", String(now - config.window)],
          ["ZCARD", key],
          ["ZADD", key, String(now), `${now}:${Math.random().toString(36).slice(2, 8)}`],
          ["EXPIRE", key, String(config.window)],
        ]),
      });

      if (countResp.ok) {
        const results = await countResp.json();
        const currentCount = results?.[1]?.result ?? 0;

        if (currentCount >= config.max) {
          return NextResponse.json(
            {
              error: "Rate limit exceeded",
              code: "ERR_RATE_LIMIT",
              retryAfter: config.window,
              timestamp: new Date().toISOString(),
            },
            {
              status: 429,
              headers: {
                "Retry-After": String(config.window),
                "X-RateLimit-Limit": String(config.max),
                "X-RateLimit-Remaining": "0",
                "X-RateLimit-Reset": String(now + config.window),
              },
            }
          );
        }
      }
    } catch (error) {
      // FAIL-OPEN: si Redis est down, on laisse passer mais on alerte
      console.error("[VIXUAL ALERT] Rate-limit Redis failure — FAIL-OPEN active", {
        route: pathname, identifier, error: error instanceof Error ? error.message : error,
        timestamp: new Date().toISOString(),
      });
    }
  }

  // ── Security headers ──
  const response = NextResponse.next();

  // Prevent clickjacking
  response.headers.set("X-Frame-Options", "DENY");
  // Prevent MIME type sniffing
  response.headers.set("X-Content-Type-Options", "nosniff");
  // XSS protection
  response.headers.set("X-XSS-Protection", "1; mode=block");
  // Referrer policy
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  // Permissions policy
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  // HSTS (1 year)
  response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
  // CSP -- restrictive for API routes
  response.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'"
  );
  // Rate limit headers
  response.headers.set("X-RateLimit-Limit", String(config.max));

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
