/**
 * VIXUAL — app/api/admin/stripe-config/route.ts
 *
 * API sécurisée pour lire et mettre à jour la configuration Stripe.
 * Réservée au PATRON (jocelyndru@gmail.com).
 *
 * GET  /api/admin/stripe-config       → lit la config (clés masquées)
 * POST /api/admin/stripe-config       → met à jour la config
 * DELETE /api/admin/stripe-config     → bascule le mode test/live
 */
import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { 
  encryptValue, 
  decryptValue, 
  maskKey, 
  invalidateStripeConfigCache,
  isMaskedPlaceholder,
  shouldUpdateSecretField 
} from "@/lib/stripe-config";
import { PATRON_EMAIL } from "@/lib/admin/roles";
import { logStripeSettingsUpdate } from "@/lib/admin/audit";

// ── In-memory fallback cache (when DB is not available) ──
let memoryCache: {
  test_secret_key?: string;
  test_publishable_key?: string;
  test_webhook_secret?: string;
  live_secret_key?: string;
  live_publishable_key?: string;
  live_webhook_secret?: string;
  active_mode?: string;
  connect_client_id?: string;
  updated_by?: string;
  updated_at?: string;
} = {};

// ── Check if DB is configured ──
function isDatabaseConfigured(): boolean {
  return !!process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("your-database");
}

// ── Ensure table exists ──
async function ensureTableExists() {
  if (!isDatabaseConfigured()) return false;
  
  try {
    const sql = neon(process.env.DATABASE_URL!);
    await sql`
      CREATE TABLE IF NOT EXISTS stripe_config (
        id INTEGER PRIMARY KEY DEFAULT 1,
        test_secret_key TEXT,
        test_publishable_key TEXT,
        test_webhook_secret TEXT,
        live_secret_key TEXT,
        live_publishable_key TEXT,
        live_webhook_secret TEXT,
        active_mode TEXT DEFAULT 'test',
        connect_client_id TEXT,
        updated_by TEXT,
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        CONSTRAINT single_row CHECK (id = 1)
      )
    `;
    return true;
  } catch (err) {
    console.error("[Admin/StripeConfig] Table creation error:", err);
    return false;
  }
}

// ── Auth guard ────────────────────────────────────────────────────────────────

function getAdminEmail(req: NextRequest): string | null {
  // Accept email from JSON body or query param (for GET)
  // In production, replace with session/cookie verification
  const email = req.headers.get("x-admin-email") || req.nextUrl.searchParams.get("email");
  return email;
}

function isPatron(email: string | null): boolean {
  return email === PATRON_EMAIL;
}

// ── GET ───────────────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const email = getAdminEmail(req);
  if (!isPatron(email)) {
    return NextResponse.json({ error: "Accès réservé au PATRON" }, { status: 403 });
  }

  // Try DB first, fallback to memory cache
  if (isDatabaseConfigured()) {
    try {
      await ensureTableExists();
      const sql = neon(process.env.DATABASE_URL!);
      const rows = await sql`
        SELECT
          test_secret_key, test_publishable_key, test_webhook_secret,
          live_secret_key, live_publishable_key, live_webhook_secret,
          active_mode, connect_client_id,
          updated_by, updated_at
        FROM stripe_config
        WHERE id = 1
        LIMIT 1
      `;

      if (rows.length > 0) {
        const row = rows[0];
        const testSecretRaw = decryptValue(row.test_secret_key as string || "");
        const liveSecretRaw = decryptValue(row.live_secret_key as string || "");
        const testWebhookRaw = decryptValue(row.test_webhook_secret as string || "");
        const liveWebhookRaw = decryptValue(row.live_webhook_secret as string || "");

        return NextResponse.json({
          configured: !!(testSecretRaw || liveSecretRaw),
          active_mode: row.active_mode,
          updated_by: row.updated_by,
          updated_at: row.updated_at,
          test_secret_key_masked: maskKey(testSecretRaw),
          test_publishable_key: row.test_publishable_key || "",
          test_webhook_secret_masked: maskKey(testWebhookRaw),
          live_secret_key_masked: maskKey(liveSecretRaw),
          live_publishable_key: row.live_publishable_key || "",
          live_webhook_secret_masked: maskKey(liveWebhookRaw),
          connect_client_id: row.connect_client_id || "",
          // FIX PERSISTENCE — detecter les cles meme si dechiffrement echoue
          // Une cle est presente si: valeur dechiffree valide OU valeur brute non-vide en DB
          has_test_secret: testSecretRaw.startsWith("sk_test_") || (!!row.test_secret_key && (row.test_secret_key as string).length > 10),
          has_live_secret: liveSecretRaw.startsWith("sk_live_") || (!!row.live_secret_key && (row.live_secret_key as string).length > 10),
          has_test_webhook: testWebhookRaw.startsWith("whsec_") || (!!row.test_webhook_secret && (row.test_webhook_secret as string).length > 10),
          has_live_webhook: liveWebhookRaw.startsWith("whsec_") || (!!row.live_webhook_secret && (row.live_webhook_secret as string).length > 10),
          source: "database",
        });
      }
    } catch (err) {
      console.error("[Admin/StripeConfig] GET DB error, using memory fallback:", err);
    }
  }

  // Fallback to memory cache
  const testSecretRaw = memoryCache.test_secret_key || "";
  const liveSecretRaw = memoryCache.live_secret_key || "";
  const testWebhookRaw = memoryCache.test_webhook_secret || "";
  const liveWebhookRaw = memoryCache.live_webhook_secret || "";

  return NextResponse.json({
    configured: !!(testSecretRaw || liveSecretRaw),
    active_mode: memoryCache.active_mode || "test",
    updated_by: memoryCache.updated_by,
    updated_at: memoryCache.updated_at,
    test_secret_key_masked: maskKey(testSecretRaw),
    test_publishable_key: memoryCache.test_publishable_key || "",
    test_webhook_secret_masked: maskKey(testWebhookRaw),
    live_secret_key_masked: maskKey(liveSecretRaw),
    live_publishable_key: memoryCache.live_publishable_key || "",
    live_webhook_secret_masked: maskKey(liveWebhookRaw),
    connect_client_id: memoryCache.connect_client_id || "",
    has_test_secret: testSecretRaw.startsWith("sk_test_"),
    has_live_secret: liveSecretRaw.startsWith("sk_live_"),
    has_test_webhook: testWebhookRaw.startsWith("whsec_"),
    has_live_webhook: liveWebhookRaw.startsWith("whsec_"),
    source: "memory",
  });
}

// ── POST ──────────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  let body: Record<string, string>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Corps JSON invalide" }, { status: 400 });
  }

  const { email } = body;
  if (!isPatron(email)) {
    return NextResponse.json({ error: "Accès réservé au PATRON" }, { status: 403 });
  }

  // Validate keys format - ignorer les placeholders masques
  const validations: string[] = [];
  if (body.test_secret_key && !isMaskedPlaceholder(body.test_secret_key) && !body.test_secret_key.startsWith("sk_test_")) {
    validations.push("La cle secrete TEST doit commencer par sk_test_");
  }
  if (body.live_secret_key && !isMaskedPlaceholder(body.live_secret_key) && !body.live_secret_key.startsWith("sk_live_")) {
    validations.push("La cle secrete LIVE doit commencer par sk_live_");
  }
  if (body.test_publishable_key && !body.test_publishable_key.startsWith("pk_test_")) {
    validations.push("La cle publique TEST doit commencer par pk_test_");
  }
  if (body.live_publishable_key && !body.live_publishable_key.startsWith("pk_live_")) {
    validations.push("La cle publique LIVE doit commencer par pk_live_");
  }
  if (body.test_webhook_secret && !isMaskedPlaceholder(body.test_webhook_secret) && !body.test_webhook_secret.startsWith("whsec_")) {
    validations.push("Le secret webhook TEST doit commencer par whsec_");
  }
  if (body.live_webhook_secret && !isMaskedPlaceholder(body.live_webhook_secret) && !body.live_webhook_secret.startsWith("whsec_")) {
    validations.push("Le secret webhook LIVE doit commencer par whsec_");
  }
  if (body.active_mode && !["test", "live"].includes(body.active_mode)) {
    validations.push("active_mode doit etre 'test' ou 'live'");
  }

  if (validations.length > 0) {
    return NextResponse.json({ error: validations.join(" | ") }, { status: 422 });
  }

  // Update memory cache - ignorer les placeholders masques pour les cles secretes
  const now = new Date().toISOString();
  
  // Cles secretes: ne mettre a jour que si vraie nouvelle valeur
  if (shouldUpdateSecretField(body.test_secret_key)) memoryCache.test_secret_key = body.test_secret_key;
  if (shouldUpdateSecretField(body.test_webhook_secret)) memoryCache.test_webhook_secret = body.test_webhook_secret;
  if (shouldUpdateSecretField(body.live_secret_key)) memoryCache.live_secret_key = body.live_secret_key;
  if (shouldUpdateSecretField(body.live_webhook_secret)) memoryCache.live_webhook_secret = body.live_webhook_secret;
  // Cles publiques: toujours mettre a jour si fournies (et non vides)
  if (body.test_publishable_key) memoryCache.test_publishable_key = body.test_publishable_key;
  if (body.live_publishable_key) memoryCache.live_publishable_key = body.live_publishable_key;
  if (body.active_mode !== undefined) memoryCache.active_mode = body.active_mode;
  if (body.connect_client_id) memoryCache.connect_client_id = body.connect_client_id;
  memoryCache.updated_by = email;
  memoryCache.updated_at = now;

  // Try to persist to DB if available
  let savedToDb = false;
  if (isDatabaseConfigured()) {
    try {
      await ensureTableExists();
      const sql = neon(process.env.DATABASE_URL!);

      // Build update fields dynamically - ignorer les placeholders masques
      const updates: Record<string, string | null | undefined> = {
        updated_by: email,
        updated_at: now,
      };

      // Cles secretes: ne mettre a jour que si vraie nouvelle valeur (pas placeholder)
      if (shouldUpdateSecretField(body.test_secret_key))
        updates.test_secret_key = encryptValue(body.test_secret_key);
      if (shouldUpdateSecretField(body.test_webhook_secret))
        updates.test_webhook_secret = encryptValue(body.test_webhook_secret);
      if (shouldUpdateSecretField(body.live_secret_key))
        updates.live_secret_key = encryptValue(body.live_secret_key);
      if (shouldUpdateSecretField(body.live_webhook_secret))
        updates.live_webhook_secret = encryptValue(body.live_webhook_secret);
      
      // Cles publiques: toujours mettre a jour si fournies
      if (body.test_publishable_key !== undefined)
        updates.test_publishable_key = body.test_publishable_key || null;
      if (body.live_publishable_key !== undefined)
        updates.live_publishable_key = body.live_publishable_key || null;
      if (body.active_mode !== undefined)
        updates.active_mode = body.active_mode;
      // FIX #5 — n'écraser connect_client_id en DB que si une valeur non-vide est fournie
      if (body.connect_client_id)
        updates.connect_client_id = body.connect_client_id;

      // Verifier si la row existe
      const existingRows = await sql`SELECT * FROM stripe_config WHERE id = 1`;
      
      if (existingRows.length === 0) {
        // INSERT - premiere creation
        await sql`
          INSERT INTO stripe_config (id, test_secret_key, test_publishable_key, test_webhook_secret, live_secret_key, live_publishable_key, live_webhook_secret, active_mode, connect_client_id, updated_by, updated_at)
          VALUES (1, ${updates.test_secret_key || null}, ${updates.test_publishable_key || null}, ${updates.test_webhook_secret || null}, ${updates.live_secret_key || null}, ${updates.live_publishable_key || null}, ${updates.live_webhook_secret || null}, ${updates.active_mode || 'test'}, ${updates.connect_client_id || null}, ${updates.updated_by}, ${updates.updated_at})
        `;
      } else {
        // UPDATE - construire dynamiquement les SET clauses
        // NE PAS utiliser COALESCE car cela empeche de distinguer undefined de null
        // A la place, on construit une requete UPDATE avec seulement les champs fournis
        const existingRow = existingRows[0];
        
        // Preparer les valeurs finales (nouvelle valeur si fournie, sinon valeur existante)
        const finalTestSecret = updates.test_secret_key !== undefined ? updates.test_secret_key : existingRow.test_secret_key;
        const finalTestPublishable = updates.test_publishable_key !== undefined ? updates.test_publishable_key : existingRow.test_publishable_key;
        const finalTestWebhook = updates.test_webhook_secret !== undefined ? updates.test_webhook_secret : existingRow.test_webhook_secret;
        const finalLiveSecret = updates.live_secret_key !== undefined ? updates.live_secret_key : existingRow.live_secret_key;
        const finalLivePublishable = updates.live_publishable_key !== undefined ? updates.live_publishable_key : existingRow.live_publishable_key;
        const finalLiveWebhook = updates.live_webhook_secret !== undefined ? updates.live_webhook_secret : existingRow.live_webhook_secret;
        const finalActiveMode = updates.active_mode !== undefined ? updates.active_mode : existingRow.active_mode;
        const finalConnectId = updates.connect_client_id !== undefined ? updates.connect_client_id : existingRow.connect_client_id;
        
        console.log("[Admin/StripeConfig] Updating with preserved values:", {
          hasTestSecret: !!finalTestSecret,
          hasTestWebhook: !!finalTestWebhook,
          hasLiveSecret: !!finalLiveSecret,
          activeMode: finalActiveMode,
        });
        
        await sql`
          UPDATE stripe_config SET
            test_secret_key = ${finalTestSecret},
            test_publishable_key = ${finalTestPublishable},
            test_webhook_secret = ${finalTestWebhook},
            live_secret_key = ${finalLiveSecret},
            live_publishable_key = ${finalLivePublishable},
            live_webhook_secret = ${finalLiveWebhook},
            active_mode = ${finalActiveMode || 'test'},
            connect_client_id = ${finalConnectId},
            updated_by = ${updates.updated_by},
            updated_at = ${updates.updated_at}
          WHERE id = 1
        `;
      }
      savedToDb = true;
      console.log("[Admin/StripeConfig] Successfully saved to database");
    } catch (err) {
      console.error("[Admin/StripeConfig] POST DB error, saved to memory only:", err);
    }
  }

  // Invalidate the in-memory cache so next request picks up new keys
  invalidateStripeConfigCache();

  // Log audit event
  const keysUpdated: string[] = [];
  if (shouldUpdateSecretField(body.test_secret_key)) keysUpdated.push("test_secret_key");
  if (shouldUpdateSecretField(body.test_webhook_secret)) keysUpdated.push("test_webhook_secret");
  if (shouldUpdateSecretField(body.live_secret_key)) keysUpdated.push("live_secret_key");
  if (shouldUpdateSecretField(body.live_webhook_secret)) keysUpdated.push("live_webhook_secret");
  if (body.test_publishable_key) keysUpdated.push("test_publishable_key");
  if (body.live_publishable_key) keysUpdated.push("live_publishable_key");
  
  if (keysUpdated.length > 0) {
    logStripeSettingsUpdate(email, email, { keysUpdated }).catch(() => {});
  }

  return NextResponse.json({
    success: true,
    message: savedToDb 
      ? "Configuration Stripe sauvegardee en base de donnees" 
      : "Configuration Stripe sauvegardee en memoire (base de donnees non disponible)",
    active_mode: body.active_mode || memoryCache.active_mode || "test",
    source: savedToDb ? "database" : "memory",
  });
}

// ── PATCH — basculer mode test/live ──────────────────────────────────────────

export async function PATCH(req: NextRequest) {
  let body: { email: string; mode: "test" | "live" };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Corps JSON invalide" }, { status: 400 });
  }

  if (!isPatron(body.email)) {
    return NextResponse.json({ error: "Accès réservé au PATRON" }, { status: 403 });
  }

  if (!["test", "live"].includes(body.mode)) {
    return NextResponse.json({ error: "mode doit être 'test' ou 'live'" }, { status: 422 });
  }

  // Update memory cache
  memoryCache.active_mode = body.mode;
  memoryCache.updated_by = body.email;
  memoryCache.updated_at = new Date().toISOString();

  // Try to persist to DB
  let savedToDb = false;
  if (isDatabaseConfigured()) {
    try {
      await ensureTableExists();
      const sql = neon(process.env.DATABASE_URL!);
      await sql`
        UPDATE stripe_config
        SET active_mode = ${body.mode}, updated_by = ${body.email}, updated_at = NOW()
        WHERE id = 1
      `;
      savedToDb = true;
      
      // Log mode change audit event
      logStripeSettingsUpdate(body.email, body.email, {
        modeChanged: true,
        newMode: body.mode,
      }).catch(() => {});
    } catch (err) {
      console.error("[Admin/StripeConfig] PATCH DB error:", err);
    }
  }

  invalidateStripeConfigCache();

  return NextResponse.json({
    success: true,
    message: `Mode bascule en ${body.mode.toUpperCase()}`,
    active_mode: body.mode,
    source: savedToDb ? "database" : "memory",
  });
}
