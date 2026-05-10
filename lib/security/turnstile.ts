/**
 * Cloudflare Turnstile : challenge invisible anti-bot, alternative RGPD-friendly
 * à reCAPTCHA. Token vide par défaut → mode désactivé.
 *
 * Activation :
 * 1. Créer un site sur dash.cloudflare.com → Turnstile
 * 2. Récupérer Site Key (publique) et Secret Key (serveur)
 * 3. Renseigner dans .env :
 *    NEXT_PUBLIC_TURNSTILE_SITE_KEY=...
 *    TURNSTILE_SECRET_KEY=...
 */
const TURNSTILE_VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify"

export function isTurnstileEnabled(): boolean {
  return Boolean(
    process.env.TURNSTILE_SECRET_KEY && process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
  )
}

export async function verifyTurnstileToken(
  token: string,
  ip?: string,
): Promise<{ success: boolean; reason?: string }> {
  if (!isTurnstileEnabled()) {
    // Module désactivé → accepter par défaut (le rate limiting reste actif)
    return { success: true, reason: "turnstile_disabled" }
  }

  if (!token) return { success: false, reason: "missing_token" }

  try {
    const body = new URLSearchParams({
      secret: process.env.TURNSTILE_SECRET_KEY!,
      response: token,
      ...(ip && { remoteip: ip }),
    })

    const res = await fetch(TURNSTILE_VERIFY_URL, {
      method: "POST",
      body,
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    })

    if (!res.ok) return { success: false, reason: "verify_request_failed" }

    const data = (await res.json()) as { success: boolean; "error-codes"?: string[] }
    if (data.success) return { success: true }
    return {
      success: false,
      reason: (data["error-codes"] ?? []).join(",") || "verification_failed",
    }
  } catch {
    return { success: false, reason: "verify_exception" }
  }
}
