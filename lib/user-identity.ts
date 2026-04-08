import "server-only";
import { sql } from "@/lib/db";

// ── Constants ──

const PSEUDONYM_MIN_LENGTH = 3;
const PSEUDONYM_MAX_LENGTH = 30;
const PSEUDONYM_REGEX = /^[a-zA-Z0-9_\-.\u00C0-\u024F]+$/;
const RESERVED_NAMES = [
  "visual", "admin", "moderator", "support", "system",
  "official", "staff", "help", "root", "null", "undefined",
];

// ── Validation ──

export interface PseudonymValidation {
  valid: boolean;
  reason?: string;
}

/**
 * Validates a pseudonym against rules:
 * - 3-30 chars, alphanumeric + accents + _-.
 * - Not reserved
 * - Not already taken by another user
 */
export async function validatePseudonym(
  pseudonym: string,
  currentUserId?: string
): Promise<PseudonymValidation> {
  const trimmed = pseudonym.trim();

  if (trimmed.length < PSEUDONYM_MIN_LENGTH) {
    return { valid: false, reason: `Minimum ${PSEUDONYM_MIN_LENGTH} caracteres.` };
  }
  if (trimmed.length > PSEUDONYM_MAX_LENGTH) {
    return { valid: false, reason: `Maximum ${PSEUDONYM_MAX_LENGTH} caracteres.` };
  }
  if (!PSEUDONYM_REGEX.test(trimmed)) {
    return { valid: false, reason: "Caracteres autorises : lettres, chiffres, _ - . et accents." };
  }
  if (RESERVED_NAMES.includes(trimmed.toLowerCase())) {
    return { valid: false, reason: "Ce pseudonyme est reserve." };
  }

  // Check uniqueness
  const existing = currentUserId
    ? await sql`
        SELECT id FROM users
        WHERE LOWER(pseudonym) = LOWER(${trimmed})
          AND id != ${currentUserId}::uuid
        LIMIT 1
      `
    : await sql`
        SELECT id FROM users
        WHERE LOWER(pseudonym) = LOWER(${trimmed})
        LIMIT 1
      `;

  if (existing.length > 0) {
    return { valid: false, reason: "Ce pseudonyme est deja pris." };
  }

  return { valid: true };
}

// ── Identity management ──

export interface UserIdentity {
  userId: string;
  name: string;
  displayName: string | null;
  pseudonym: string | null;
  pseudonymEnabled: boolean;
}

/**
 * Returns the display identity for a user.
 * If pseudonym_enabled is true, displays pseudonym; otherwise real name.
 */
export async function getUserIdentity(userId: string): Promise<UserIdentity | null> {
  const rows = await sql`
    SELECT id::text as user_id, name, display_name, pseudonym, pseudonym_enabled
    FROM users WHERE id = ${userId}::uuid LIMIT 1
  `;
  if (!rows.length) return null;
  const r = rows[0] as {
    user_id: string; name: string; display_name: string | null;
    pseudonym: string | null; pseudonym_enabled: boolean;
  };
  return {
    userId: r.user_id,
    name: r.name,
    displayName: r.display_name,
    pseudonym: r.pseudonym,
    pseudonymEnabled: r.pseudonym_enabled ?? false,
  };
}

/**
 * Returns the public-facing name for a user.
 */
export function getPublicName(identity: UserIdentity): string {
  if (identity.pseudonymEnabled && identity.pseudonym) {
    return identity.pseudonym;
  }
  return identity.displayName || identity.name;
}

/**
 * Updates identity fields for a user.
 */
export async function updateUserIdentity(
  userId: string,
  fields: {
    displayName?: string;
    pseudonym?: string | null;
    pseudonymEnabled?: boolean;
  }
) {
  if (fields.displayName !== undefined) {
    await sql`UPDATE users SET display_name = ${fields.displayName} WHERE id = ${userId}::uuid`;
  }
  if (fields.pseudonym !== undefined) {
    await sql`UPDATE users SET pseudonym = ${fields.pseudonym} WHERE id = ${userId}::uuid`;
  }
  if (fields.pseudonymEnabled !== undefined) {
    await sql`UPDATE users SET pseudonym_enabled = ${fields.pseudonymEnabled} WHERE id = ${userId}::uuid`;
  }
}
