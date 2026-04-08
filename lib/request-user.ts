/**
 * VIXUAL - Request User Helper
 *
 * Extracts and validates user identity from request headers.
 * In production, this would validate a JWT or session token.
 * Currently reads from x-vixual-user-id / x-vixual-user-email headers
 * set by the auth context or middleware.
 */

import { sql } from "@/lib/db";

export interface RequestUser {
  id: string;
  email: string;
  role: string;
  isMinor: boolean;
  kycVerified: boolean;
  accountStatus: string;
  trustScore: number;
}

/**
 * Extracts user from request headers and validates against DB.
 * Returns null if no user identity is found.
 */
export async function getRequestUser(req: Request): Promise<RequestUser | null> {
  const userId = req.headers.get("x-vixual-user-id");
  const userEmail = req.headers.get("x-vixual-user-email");

  if (!userId && !userEmail) return null;

  try {
    const rows = userId
      ? await sql`SELECT id, email, role, is_minor, kyc_verified, account_status, trust_score FROM users WHERE id = ${userId} LIMIT 1`
      : await sql`SELECT id, email, role, is_minor, kyc_verified, account_status, trust_score FROM users WHERE email = ${userEmail} LIMIT 1`;

    if (!rows || rows.length === 0) return null;

    const row = rows[0];
    return {
      id: row.id,
      email: row.email,
      role: row.role || "visitor",
      isMinor: row.is_minor ?? false,
      kycVerified: row.kyc_verified ?? false,
      accountStatus: row.account_status || "active",
      trustScore: row.trust_score ?? 50,
    };
  } catch {
    return null;
  }
}

/**
 * Checks if the user's account is in good standing (not suspended/banned).
 */
export function isAccountActive(user: RequestUser): boolean {
  return user.accountStatus === "active";
}
