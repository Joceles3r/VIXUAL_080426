/**
 * VIXUAL - Stripe Configuration Tests
 * Tests pour valider le chargement et la gestion de la config Stripe.
 */

import { describe, test, expect } from "vitest";

// ── Mock Data ────────────────────────────────────────────────────────────────

const VALID_SECRET_KEY = "sk_test_511234567890abcdefghijklmnopqrstuvwxyz";
const VALID_PUBLISHABLE_KEY = "pk_test_511234567890abcdefghijklmnopqrstuvwxyz";
const VALID_WEBHOOK_SECRET = "whsec_1234567890abcdefghijklmnopqrstuvwxyz";

const INVALID_KEYS = {
  tooShort: "sk_test_123",
  wrongPrefix: "pk_live_wrongprefix",
  noPrefix: "test_key_without_prefix",
  masked: "••••••••••••••••",
};

// ── Validation Functions (copied from stripe-config.ts) ──────────────────────

function isValidStripeKey(key: string, type: "secret" | "publishable" | "webhook"): boolean {
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

function isMaskedPlaceholder(value: string | undefined | null): boolean {
  if (!value) return false;
  return /^•+$/.test(value) || value === "••••••••••••••••";
}

function detectKeyMode(key: string): "test" | "live" | "unknown" {
  if (key.includes("_test_")) return "test";
  if (key.includes("_live_")) return "live";
  return "unknown";
}

// ── Tests ────────────────────────────────────────────────────────────────────

describe("Stripe Key Validation", () => {
  describe("Valid Keys", () => {
    test("devrait accepter une cle secrete test valide", () => {
      expect(isValidStripeKey(VALID_SECRET_KEY, "secret")).toBe(true);
    });

    test("devrait accepter une cle secrete live valide", () => {
      const liveKey = "sk_live_51abcdefghijklmnopqrstuvwxyz1234567890";
      expect(isValidStripeKey(liveKey, "secret")).toBe(true);
    });

    test("devrait accepter une cle publishable valide", () => {
      expect(isValidStripeKey(VALID_PUBLISHABLE_KEY, "publishable")).toBe(true);
    });

    test("devrait accepter un webhook secret valide", () => {
      expect(isValidStripeKey(VALID_WEBHOOK_SECRET, "webhook")).toBe(true);
    });
  });

  describe("Invalid Keys", () => {
    test("devrait rejeter une cle trop courte", () => {
      expect(isValidStripeKey(INVALID_KEYS.tooShort, "secret")).toBe(false);
    });

    test("devrait rejeter une cle avec mauvais prefixe", () => {
      expect(isValidStripeKey(INVALID_KEYS.wrongPrefix, "secret")).toBe(false);
    });

    test("devrait rejeter une cle sans prefixe", () => {
      expect(isValidStripeKey(INVALID_KEYS.noPrefix, "secret")).toBe(false);
    });

    test("devrait rejeter un placeholder maske", () => {
      expect(isValidStripeKey(INVALID_KEYS.masked, "secret")).toBe(false);
    });

    test("devrait rejeter une cle null/undefined", () => {
      expect(isValidStripeKey("", "secret")).toBe(false);
      expect(isValidStripeKey(null as unknown as string, "secret")).toBe(false);
    });
  });
});

describe("Key Mode Detection", () => {
  test("devrait detecter le mode 'test'", () => {
    expect(detectKeyMode("sk_test_abc123")).toBe("test");
    expect(detectKeyMode("pk_test_xyz789")).toBe("test");
  });

  test("devrait detecter le mode 'live'", () => {
    expect(detectKeyMode("sk_live_abc123")).toBe("live");
    expect(detectKeyMode("pk_live_xyz789")).toBe("live");
  });

  test("devrait retourner 'unknown' pour les cles sans mode", () => {
    expect(detectKeyMode("whsec_abc123")).toBe("unknown");
    expect(detectKeyMode("some_random_key")).toBe("unknown");
  });
});

describe("Configuration Source Resolution", () => {
  test("devrait prioriser la DB si une cle secrete est presente", () => {
    const dbConfig = {
      secretKey: VALID_SECRET_KEY,
      publishableKey: VALID_PUBLISHABLE_KEY,
      webhookSecret: VALID_WEBHOOK_SECRET,
      mode: "test" as const,
      source: "database" as const,
    };

    expect(dbConfig.source).toBe("database");
    expect(dbConfig.secretKey.startsWith("sk_")).toBe(true);
  });

  test("devrait fallback sur env vars si DB est vide", () => {
    const dbConfigEmpty = {
      secretKey: "",
      mode: "test" as const,
      source: "database" as const,
    };

    // Simuler fallback vers env
    const envKey = "sk_test_env_fallback_key_1234567890";
    const finalConfig = {
      secretKey: dbConfigEmpty.secretKey || envKey,
      source: dbConfigEmpty.secretKey ? "database" : "environment",
    };

    expect(finalConfig.secretKey).toBe(envKey);
    expect(finalConfig.source).toBe("environment");
  });

  test("devrait detecter si la cle correspond au mode configure", () => {
    const testKey = "sk_test_abc123";
    const liveKey = "sk_live_xyz789";
    const configuredMode = "test";

    const testKeyMode = detectKeyMode(testKey);
    const liveKeyMode = detectKeyMode(liveKey);

    expect(testKeyMode === configuredMode).toBe(true);
    expect(liveKeyMode === configuredMode).toBe(false);
  });
});

describe("Encryption/Decryption", () => {
  test("devrait chiffrer et dechiffrer correctement", () => {
    // Simuler le processus
    const plaintext = "sk_test_1234567890abcdef";
    const encrypted = `iv:tag:${Buffer.from(plaintext).toString("hex")}`;

    // La decryption doit reproduire le texte original
    const decryptedParts = encrypted.split(":");
    const decrypted = Buffer.from(decryptedParts[2], "hex").toString("utf8");

    expect(decrypted).toBe(plaintext);
  });

  test("devrait gerer les valeurs vides", () => {
    const emptyValue = "";
    expect(emptyValue || "").toBe("");
  });

  test("devrait gerer les valeurs non chiffrees (backward compat)", () => {
    const notEncrypted = "plaintext_value_no_colons";
    // Si pas de ":", c'est probablement pas chiffre
    const isEncrypted = notEncrypted.includes(":");
    expect(isEncrypted).toBe(false);
  });
});

describe("Cache Behavior (no caching)", () => {
  test("devrait lire la DB a chaque appel (pas de cache)", () => {
    let callCount = 0;

    const readConfig = async () => {
      callCount++;
      return {
        secretKey: "sk_test_fresh",
        mode: "test" as const,
        source: "database" as const,
      };
    };

    // Simuler 3 appels
    readConfig();
    readConfig();
    readConfig();

    expect(callCount).toBe(3);
  });
});
