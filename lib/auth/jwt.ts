// lib/auth/jwt.ts
import "server-only";

/**
 * VIXUAL — JWT Configuration (source unique de verite)
 * 
 * EN PRODUCTION : JWT_SECRET DOIT etre defini dans l'environnement.
 * Aucun fallback n'est accepte.
 */

const IS_PRODUCTION = process.env.NODE_ENV === "production";

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  
  if (!secret) {
    if (IS_PRODUCTION) {
      throw new Error(
        "[VIXUAL CRITICAL] JWT_SECRET is not defined in production. " +
        "Refusing to start with a hardcoded secret."
      );
    }
    console.warn("[VIXUAL Auth] JWT_SECRET not set — using dev-only fallback.");
    return new TextEncoder().encode("vixual-dev-only-jwt-secret-do-not-use-in-prod");
  }
  
  if (secret.length < 32) {
    throw new Error("[VIXUAL] JWT_SECRET must be at least 32 characters.");
  }
  
  return new TextEncoder().encode(secret);
}

export const JWT_SECRET = getJwtSecret();
export const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 jours
export const SESSION_DURATION_SEC = SESSION_DURATION_MS / 1000;
