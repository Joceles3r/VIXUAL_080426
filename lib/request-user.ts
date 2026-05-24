/**
 * VIXUAL — Request User Helper (Server-only)
 *
 * Extrait et valide l'identite utilisateur depuis le cookie JWT 'vixual_session'.
 * Les anciens headers x-vixual-user-id / x-vixual-user-email sont DEPRECATED
 * (spoofables) et ne sont plus utilises.
 *
 * Source de verite : cookie JWT signe + verification BD.
 */
import "server-only";

import { jwtVerify } from "jose";
import { sql } from "@/lib/db";
import { JWT_SECRET } from "@/lib/auth/jwt";

export interface RequestUser {
  id: string;
  email: string;
  role: string;
  isMinor: boolean;
  kycVerified: boolean;
  accountStatus: string;
  trustScore: number;
}

interface SessionPayload {
  userId: string;
  email: string;
  name?: string;
  role?: string;
}

/**
 * Extrait le user depuis le cookie JWT signe et valide en BD.
 * Retourne null si pas de session valide.
 */
export async function getRequestUser(req: Request): Promise<RequestUser | null> {
  // Lecture du cookie 'vixual_session' (signe avec JWT_SECRET cote login/signup)
  const cookieHeader = req.headers.get("cookie");
  if (!cookieHeader) return null;

  const sessionMatch = cookieHeader.match(/vixual_session=([^;]+)/);
  if (!sessionMatch) return null;

  const token = sessionMatch[1];

  // Verification cryptographique de la signature JWT
  let payload: SessionPayload;
  try {
    const verified = await jwtVerify(token, JWT_SECRET);
    payload = verified.payload as unknown as SessionPayload;
  } catch {
    return null; // JWT invalide ou expire
  }

  if (!payload.userId) return null;

  // Validation BD : on verifie que l'utilisateur existe toujours et son etat
  try {
    const rows = await sql`
      SELECT id, email, role, is_minor, kyc_verified, account_status, trust_score
      FROM users WHERE id = ${payload.userId} LIMIT 1
    `;

    if (!rows || rows.length === 0) return null;

    const row = rows[0] as {
      id: string;
      email: string;
      role: string | null;
      is_minor: boolean | null;
      kyc_verified: boolean | null;
      account_status: string | null;
      trust_score: number | null;
    };

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
 * Verifie que le compte est en bon etat (pas suspendu/banni).
 */
export function isAccountActive(user: RequestUser): boolean {
  return user.accountStatus === "active";
}
