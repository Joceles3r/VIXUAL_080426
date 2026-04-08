/**
 * VIXUAL — lib/stripe-config.ts
 * Chargement sécurisé de la configuration Stripe.
 *
 * Priorité :
 *   1. Base de données (table stripe_config) — modifiable depuis l'ADMIN
 *   2. Variables d'environnement (.env.local / Vercel env) — fallback
 *
 * Ce module est SERVER ONLY.
 */
import "server-only";
import { neon } from "@neondatabase/serverless";
import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "crypto";

// ── Environment Detection ────────────────────────────────────────────────────

const IS_PRODUCTION = process.env.NODE_ENV === "production";
const DEV_FALLBACK_KEY = "VIXUAL_DEV_FALLBACK_KEY_32chars!!";

// ── Encryption Key Validation ────────────────────────────────────────────────

/**
 * Validates that the encryption key meets security requirements.
 * In production, requires ADMIN_ENCRYPTION_KEY env var.
 * In development, allows fallback with warning.
 */
export function validateEncryptionKey(): { valid: boolean; warning?: string; error?: string } {
  const key = process.env.ADMIN_ENCRYPTION_KEY;
  
  if (!key) {
    if (IS_PRODUCTION) {
      return {
        valid: false,
        error: "ADMIN_ENCRYPTION_KEY is required in production. Generate with: openssl rand -base64 32",
      };
    }
    return {
      valid: true,
      warning: "Using development fallback encryption key. Set ADMIN_ENCRYPTION_KEY for production.",
    };
  }
  
  if (key.length < 32) {
    return {
      valid: false,
      error: "ADMIN_ENCRYPTION_KEY must be at least 32 characters long.",
    };
  }
  
  if (key === DEV_FALLBACK_KEY) {
    if (IS_PRODUCTION) {
      return {
        valid: false,
        error: "Cannot use development fallback key in production.",
      };
    }
    return {
      valid: true,
      warning: "Using default development key. Change for production.",
    };
  }
  
  return { valid: true };
}

// Log validation on module load (server-side only)
const keyValidation = validateEncryptionKey();
if (keyValidation.warning) {
  console.warn(`[Stripe Config] ${keyValidation.warning}`);
}
if (keyValidation.error) {
  console.error(`[Stripe Config] CRITICAL: ${keyValidation.error}`);
  if (IS_PRODUCTION) {
    throw new Error(keyValidation.error);
  }
}

// ── Chiffrement AES-256-GCM ──────────────────────────────────────────────────

const ENCRYPTION_KEY_RAW = process.env.ADMIN_ENCRYPTION_KEY || DEV_FALLBACK_KEY;
// Derive a 32-byte key from the raw string (memoized)
let _derivedKey: Buffer | null = null;
function getDerivedKey(): Buffer {
  if (!_derivedKey) {
    _derivedKey = scryptSync(ENCRYPTION_KEY_RAW, "vixual-stripe-salt", 32);
  }
  return _derivedKey;
}

export function encryptValue(plaintext: string): string {
  if (!plaintext) return "";
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", getDerivedKey(), iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  // Format: iv(hex):tag(hex):ciphertext(hex)
  return `${iv.toString("hex")}:${tag.toString("hex")}:${encrypted.toString("hex")}`;
}

export function decryptValue(ciphertext: string): string {
  if (!ciphertext || !ciphertext.includes(":")) return ciphertext; // not encrypted
  try {
    const [ivHex, tagHex, encHex] = ciphertext.split(":");
    const iv = Buffer.from(ivHex, "hex");
    const tag = Buffer.from(tagHex, "hex");
    const enc = Buffer.from(encHex, "hex");
    const decipher = createDecipheriv("aes-256-gcm", getDerivedKey(), iv);
    decipher.setAuthTag(tag);
    return decipher.update(enc).toString("utf8") + decipher.final("utf8");
  } catch {
    // If decryption fails, return the raw value (backward compat with unencrypted rows)
    return ciphertext;
  }
}

// ── Types ────────────────────────────────────────────────────────────────────

export type StripeMode = "test" | "live";

export interface StripeRuntimeConfig {
  secretKey: string;
  publishableKey: string;
  webhookSecret: string;
  connectClientId: string;
  mode: StripeMode;
  source: "database" | "environment";
}

// ── Chargement depuis la base ─────────────────────────────────────────────────

let _cache: (StripeRuntimeConfig & { fetchedAt: number }) | null = null;
const CACHE_TTL_MS = 60_000; // 1 minute

export async function getStripeConfig(): Promise<StripeRuntimeConfig> {
  // Use in-memory cache to avoid a DB hit on every request
  if (_cache && Date.now() - _cache.fetchedAt < CACHE_TTL_MS) {
    return _cache;
  }

  try {
    const sql = neon(process.env.DATABASE_URL!);
    const rows = await sql`
      SELECT
        test_secret_key, test_publishable_key, test_webhook_secret,
        live_secret_key, live_publishable_key, live_webhook_secret,
        active_mode, connect_client_id
      FROM stripe_config
      WHERE id = 1
      LIMIT 1
    `;

    if (rows.length > 0) {
      const row = rows[0];
      const mode = (row.active_mode as StripeMode) || "test";

      const secretKey =
        mode === "test"
          ? decryptValue(row.test_secret_key as string || "")
          : decryptValue(row.live_secret_key as string || "");

      const publishableKey =
        mode === "test"
          ? (row.test_publishable_key as string || "")
          : (row.live_publishable_key as string || "");

      const webhookSecret =
        mode === "test"
          ? decryptValue(row.test_webhook_secret as string || "")
          : decryptValue(row.live_webhook_secret as string || "");

      // Only use DB config if there's actually a secret key configured
      if (secretKey && secretKey.startsWith("sk_")) {
        const config: StripeRuntimeConfig = {
          secretKey,
          publishableKey,
          webhookSecret,
          connectClientId: (row.connect_client_id as string) || "",
          mode,
          source: "database",
        };
        _cache = { ...config, fetchedAt: Date.now() };
        return config;
      }
    }
  } catch {
    // DB unavailable — fall through to env vars
  }

  // ── Fallback: variables d'environnement ──────────────────────────────────
  const envMode: StripeMode =
    process.env.NEXT_PUBLIC_STRIPE_TEST_MODE !== "false" ? "test" : "live";

  const config: StripeRuntimeConfig = {
    secretKey:
      envMode === "test"
        ? process.env.STRIPE_TEST_SECRET_KEY || process.env.STRIPE_SECRET_KEY || ""
        : process.env.STRIPE_LIVE_SECRET_KEY || process.env.STRIPE_SECRET_KEY || "",
    publishableKey:
      envMode === "test"
        ? process.env.NEXT_PUBLIC_STRIPE_TEST_PUBLISHABLE_KEY || ""
        : process.env.NEXT_PUBLIC_STRIPE_LIVE_PUBLISHABLE_KEY || "",
    webhookSecret:
      envMode === "test"
        ? process.env.STRIPE_TEST_WEBHOOK_SECRET || process.env.STRIPE_WEBHOOK_SECRET || ""
        : process.env.STRIPE_LIVE_WEBHOOK_SECRET || process.env.STRIPE_WEBHOOK_SECRET || "",
    connectClientId: process.env.STRIPE_CONNECT_CLIENT_ID || "",
    mode: envMode,
    source: "environment",
  };

  _cache = { ...config, fetchedAt: Date.now() };
  return config;
}

/** Invalider le cache (appelé après une mise à jour depuis l'admin) */
export function invalidateStripeConfigCache() {
  _cache = null;
}

/** Masquer une clé pour l'affichage (sk_test_xxxx...xxxx) */
export function maskKey(key: string): string {
  if (!key || key.length < 12) return "••••••••";
  return key.slice(0, 10) + "••••••••" + key.slice(-4);
}

/** Placeholder masque standard pour les cles secretes */
export const MASKED_PLACEHOLDER = "••••••••••••••••";

/** Verifier si une valeur est le placeholder masque */
export function isMaskedPlaceholder(value: string | undefined | null): boolean {
  if (!value) return false;
  // Le placeholder contient uniquement des bullets
  return /^•+$/.test(value) || value === MASKED_PLACEHOLDER;
}

/** Valider le format d'une cle Stripe */
export function isValidStripeKey(
  key: string, 
  type: "secret" | "publishable" | "webhook"
): boolean {
  if (!key || isMaskedPlaceholder(key)) return false;
  
  switch (type) {
    case "secret":
      return /^sk_(test|live)_[a-zA-Z0-9]+$/.test(key);
    case "publishable":
      return /^pk_(test|live)_[a-zA-Z0-9]+$/.test(key);
    case "webhook":
      return /^whsec_[a-zA-Z0-9]+$/.test(key);
    default:
      return false;
  }
}

/**
 * Validation format des cles Stripe avec type specifique
 * Conforme au patch technique Stripe VIXUAL
 */
export function validateStripeKeyFormat(
  input: string,
  type: "pk" | "sk" | "whsec"
): { valid: boolean; error?: string } {
  if (!input) return { valid: false, error: "Cle manquante" };
  
  if (type === "pk") {
    const isValid = /^pk_(test|live)_[A-Za-z0-9]+$/.test(input);
    if (!isValid) return { valid: false, error: "Format invalide: doit commencer par pk_test_ ou pk_live_" };
    return { valid: true };
  }
  
  if (type === "sk") {
    const isValid = /^sk_(test|live)_[A-Za-z0-9]+$/.test(input);
    if (!isValid) return { valid: false, error: "Format invalide: doit commencer par sk_test_ ou sk_live_" };
    return { valid: true };
  }
  
  if (type === "whsec") {
    const isValid = /^whsec_[A-Za-z0-9]+$/.test(input);
    if (!isValid) return { valid: false, error: "Format invalide: doit commencer par whsec_" };
    return { valid: true };
  }
  
  return { valid: false, error: "Type de cle inconnu" };
}

/**
 * Detecter si le mode de la cle correspond au mode configure
 */
export function detectKeyMode(key: string): "test" | "live" | "unknown" {
  if (key.includes("_test_")) return "test";
  if (key.includes("_live_")) return "live";
  return "unknown";
}

/**
 * Verifier la coherence mode/cle
 */
export function validateKeyModeCoherence(
  key: string,
  expectedMode: StripeMode
): { coherent: boolean; warning?: string } {
  const keyMode = detectKeyMode(key);
  if (keyMode === "unknown") {
    return { coherent: true }; // webhook secrets n'ont pas de mode
  }
  if (keyMode !== expectedMode) {
    return {
      coherent: false,
      warning: `Cle en mode ${keyMode} mais configuration en mode ${expectedMode}`,
    };
  }
  return { coherent: true };
}

// ── Interface pour AdminStripeSettings (lecture DB brute) ────────────────────

export interface AdminStripeSettings {
  stripe_mode: StripeMode;
  stripe_publishable_key_test?: string;
  stripe_secret_key_test?: string;
  stripe_webhook_secret_test?: string;
  stripe_publishable_key_live?: string;
  stripe_secret_key_live?: string;
  stripe_webhook_secret_live?: string;
  stripe_connect_client_id?: string;
}

/**
 * Resoudre la configuration Stripe active selon le mode
 * C'est LA fonction centrale pour obtenir les cles selon le mode actif
 */
export function resolveStripeRuntimeConfig(settings: AdminStripeSettings): StripeRuntimeConfig {
  const mode = settings.stripe_mode === "live" ? "live" : "test";

  if (mode === "live") {
    return {
      mode,
      publishableKey: settings.stripe_publishable_key_live || process.env.STRIPE_PUBLISHABLE_KEY_LIVE || "",
      secretKey: settings.stripe_secret_key_live || process.env.STRIPE_SECRET_KEY_LIVE || "",
      webhookSecret: settings.stripe_webhook_secret_live || process.env.STRIPE_WEBHOOK_SECRET_LIVE || "",
      connectClientId: settings.stripe_connect_client_id || process.env.STRIPE_CONNECT_CLIENT_ID || "",
      source: "database",
    };
  }

  return {
    mode,
    publishableKey: settings.stripe_publishable_key_test || process.env.STRIPE_PUBLISHABLE_KEY_TEST || "",
    secretKey: settings.stripe_secret_key_test || process.env.STRIPE_SECRET_KEY_TEST || "",
    webhookSecret: settings.stripe_webhook_secret_test || process.env.STRIPE_WEBHOOK_SECRET_TEST || "",
    connectClientId: settings.stripe_connect_client_id || process.env.STRIPE_CONNECT_CLIENT_ID || "",
    source: "database",
  };
}

/**
 * Charger les settings admin depuis la DB (format brut)
 */
export async function loadAdminStripeSettings(): Promise<AdminStripeSettings | null> {
  try {
    const sql = neon(process.env.DATABASE_URL!);
    const rows = await sql`
      SELECT
        active_mode as stripe_mode,
        test_publishable_key as stripe_publishable_key_test,
        test_secret_key as stripe_secret_key_test,
        test_webhook_secret as stripe_webhook_secret_test,
        live_publishable_key as stripe_publishable_key_live,
        live_secret_key as stripe_secret_key_live,
        live_webhook_secret as stripe_webhook_secret_live,
        connect_client_id as stripe_connect_client_id
      FROM stripe_config
      WHERE id = 1
      LIMIT 1
    `;

    if (rows.length === 0) return null;

    const row = rows[0];
    return {
      stripe_mode: (row.stripe_mode as StripeMode) || "test",
      stripe_publishable_key_test: row.stripe_publishable_key_test as string || undefined,
      stripe_secret_key_test: decryptValue(row.stripe_secret_key_test as string || ""),
      stripe_webhook_secret_test: decryptValue(row.stripe_webhook_secret_test as string || ""),
      stripe_publishable_key_live: row.stripe_publishable_key_live as string || undefined,
      stripe_secret_key_live: decryptValue(row.stripe_secret_key_live as string || ""),
      stripe_webhook_secret_live: decryptValue(row.stripe_webhook_secret_live as string || ""),
      stripe_connect_client_id: row.stripe_connect_client_id as string || undefined,
    };
  } catch {
    return null;
  }
}

/** Verifier si une valeur doit etre mise a jour (non vide et non placeholder) */
export function shouldUpdateSecretField(
  newValue: string | undefined | null
): boolean {
  if (!newValue) return false;
  if (isMaskedPlaceholder(newValue)) return false;
  return true;
}
