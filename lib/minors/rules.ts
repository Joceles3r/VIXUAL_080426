/**
 * VIXUAL Minors Module -- Rules (Server-only)
 *
 * Mineurs 16-17 ans:
 * - VIXUpoints ONLY (pas d'euros, pas de paiement hybride)
 * - Pas de contribution en euros
 * - Pas de retrait
 * - Pas de Stripe Connect
 * - Plafond VIXUpoints: 100/jour, 500/semaine, 10000 total
 * - Autorisation parentale requise et renouvelee tous les 12 mois
 */
import "server-only";

import { sql } from "@/lib/db";

/** Age minimum pour s'inscrire */
export const MIN_AGE = 16;
/** Age de majorite */
export const ADULT_AGE = 18;
/** Plafond VIXUpoints quotidien pour les mineurs */
export const MINOR_DAILY_VIXUPOINTS_CAP = 100;
/** Duree de validite de l'autorisation parentale (en mois) */
export const GUARDIAN_VALIDITY_MONTHS = 12;

/** Calculate age from a birthdate string */
export function calculateAge(birthdate: string): number {
  const birth = new Date(birthdate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

/** Check if a user is a minor based on DB data */
export async function isUserMinor(userId: string): Promise<{
  isMinor: boolean;
  age: number | null;
  birthdate: string | null;
  hasGuardianApproval: boolean;
  guardianExpired: boolean;
}> {
  const rows = await sql`
    SELECT birthdate, is_minor, minor_status
    FROM users WHERE id = ${userId}::uuid
  `;
  if (!rows.length) return { isMinor: false, age: null, birthdate: null, hasGuardianApproval: false, guardianExpired: false };

  const user = rows[0] as { birthdate: string | null; is_minor: boolean | null; minor_status: string | null };

  if (!user.birthdate) return { isMinor: false, age: null, birthdate: null, hasGuardianApproval: false, guardianExpired: false };

  const age = calculateAge(user.birthdate);
  const isMinor = age < ADULT_AGE;

  // If user turned 18, auto-unlock
  if (!isMinor && user.is_minor) {
    await sql`UPDATE users SET is_minor = false, minor_status = 'adult' WHERE id = ${userId}::uuid`;
  }

  // Check guardian approval
  let hasGuardianApproval = false;
  let guardianExpired = false;

  if (isMinor) {
    const guardianRows = await sql`
      SELECT id, status, approved_at
      FROM minor_guardian_verifications
      WHERE minor_user_id = ${userId}::uuid AND status = 'approved'
      ORDER BY approved_at DESC LIMIT 1
    `;
    if (guardianRows.length) {
      hasGuardianApproval = true;
      const approved = guardianRows[0] as { approved_at: string };
      const approvedDate = new Date(approved.approved_at);
      const expiresAt = new Date(approvedDate);
      expiresAt.setMonth(expiresAt.getMonth() + GUARDIAN_VALIDITY_MONTHS);
      guardianExpired = new Date() > expiresAt;
    }
  }

  return { isMinor, age, birthdate: user.birthdate, hasGuardianApproval, guardianExpired };
}

/** Check if a minor has exceeded their daily VIXUpoints cap */
export async function checkMinorDailyCap(userId: string): Promise<{
  exceeded: boolean;
  used: number;
  remaining: number;
}> {
  const rows = await sql`
    SELECT COALESCE(SUM(amount), 0) as total
    FROM visupoints_transactions
    WHERE user_id = ${userId}::uuid
      AND amount > 0
      AND created_at >= CURRENT_DATE
  `;
  const used = Number((rows[0] as { total: string }).total) || 0;
  return {
    exceeded: used >= MINOR_DAILY_VIXUPOINTS_CAP,
    used,
    remaining: Math.max(0, MINOR_DAILY_VIXUPOINTS_CAP - used),
  };
}
