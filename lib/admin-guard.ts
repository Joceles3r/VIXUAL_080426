/**
 * Server-side admin verification utility.
 * Uses VIXUAL_ADMIN_EMAIL (server-only) as primary source of truth.
 * Falls back to NEXT_PUBLIC_ADMIN_EMAIL, then to the hardcoded PATRON email.
 *
 * IMPORTANT: This file must ONLY run on the server (route handlers, server actions).
 */

// FIX A — Correction du nom de variable (VISUAL → VIXUAL) + ajout fallback PATRON
const PATRON_FALLBACK_EMAIL = "jocelyndru@gmail.com";

function getAdminEmail(): string | undefined {
  return (
    process.env.VIXUAL_ADMIN_EMAIL?.toLowerCase() ||
    process.env.NEXT_PUBLIC_ADMIN_EMAIL?.toLowerCase() ||
    PATRON_FALLBACK_EMAIL
  )
}

/**
 * Verify if a given email matches the admin email.
 * Double-check on the server to prevent client-side spoofing.
 */
export function isAdminEmail(email: string | undefined | null): boolean {
  if (!email) return false
  const adminEmail = getAdminEmail()
  if (!adminEmail) return false
  return email.toLowerCase() === adminEmail
}

/**
 * Check if a user ID belongs to an admin.
 * Looks up the user's email in the database and compares it to the admin email.
 */
export async function isAdmin(userId: string): Promise<boolean> {
  try {
    const { sql } = await import("@/lib/db");
    const rows = await sql`SELECT email FROM users WHERE id = ${userId}::uuid LIMIT 1`;
    if (!rows.length) return false;
    return isAdminEmail((rows[0] as { email: string }).email);
  } catch {
    return false;
  }
}

/**
 * Guard helper for API route handlers.
 * Returns a 403 Response if the caller is not admin, or null if authorized.
 *
 * Usage:
 *   const denied = adminGuard(requestEmail)
 *   if (denied) return denied
 */
export function adminGuard(callerEmail: string | undefined | null): Response | null {
  if (!isAdminEmail(callerEmail)) {
    return new Response(
      JSON.stringify({ error: "Forbidden - Admin access required" }),
      { status: 403, headers: { "Content-Type": "application/json" } }
    )
  }
  return null
}
