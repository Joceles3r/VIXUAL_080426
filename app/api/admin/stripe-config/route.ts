/**
 * VIXUAL — app/api/admin/stripe-config/route.ts
 *
 * API securisee pour lire et mettre a jour la configuration Stripe.
 * Reservee au PATRON (jocelyndru@gmail.com).
 *
 * VERROU FINAL: DB ONLY - plus de memoryCache comme comportement normal.
 * La DB est la seule source de verite.
 *
 * GET  /api/admin/stripe-config       → lit la config (cles masquees)
 * POST /api/admin/stripe-config       → met a jour la config
 * PATCH /api/admin/stripe-config      → bascule le mode test/live
 */
import { NextRequest, NextResponse } from "next/server";
import { sql, isDatabaseConfigured } from "@/lib/db";
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

// ── Ensure table exists ──
async function ensureTableExists(): Promise<boolean> {
  if (!isDatabaseConfigured()) return false;
  
  try {
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
    return NextResponse.json({ error: "Acces reserve au PATRON" }, { status: 403 });
  }

  // DB est la seule source de verite
  if (!isDatabaseConfigured()) {
    return NextResponse.json({
      configured: false,
      error: "Base de donnees non configuree. Definissez DATABASE_URL.",
      source: "none",
    }, { status: 503 });
  }

  try {
    await ensureTableExists();
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

    if (rows.length === 0) {
      // Aucune config, mais table existe
      return NextResponse.json({
        configured: false,
        active_mode: "test",
        updated_by: null,
        updated_at: null,
        test_secret_key_masked: "",
        test_publishable_key: "",
        test_webhook_secret_masked: "",
        live_secret_key_masked: "",
        live_publishable_key: "",
        live_webhook_secret_masked: "",
        connect_client_id: "",
        has_test_secret: false,
        has_live_secret: false,
        has_test_webhook: false,
        has_live_webhook: false,
        source: "database",
      });
    }

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
      has_test_secret: testSecretRaw.startsWith("sk_test_") || (!!row.test_secret_key && (row.test_secret_key as string).length > 10),
      has_live_secret: liveSecretRaw.startsWith("sk_live_") || (!!row.live_secret_key && (row.live_secret_key as string).length > 10),
      has_test_webhook: testWebhookRaw.startsWith("whsec_") || (!!row.test_webhook_secret && (row.test_webhook_secret as string).length > 10),
      has_live_webhook: liveWebhookRaw.startsWith("whsec_") || (!!row.live_webhook_secret && (row.live_webhook_secret as string).length > 10),
      source: "database",
    });
  } catch (err) {
    console.error("[Admin/StripeConfig] GET DB error:", err);
    return NextResponse.json({
      error: "Erreur lecture base de donnees",
      configured: false,
      source: "error",
    }, { status: 500 });
  }
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
    return NextResponse.json({ error: "Acces reserve au PATRON" }, { status: 403 });
  }

  // DB obligatoire pour sauvegarder
  if (!isDatabaseConfigured()) {
    return NextResponse.json({
      error: "Base de donnees requise. Configurez DATABASE_URL avant de sauvegarder vos cles Stripe.",
      source: "none",
    }, { status: 503 });
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

  const now = new Date().toISOString();

  try {
    await ensureTableExists();

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
    
    // Cles publiques: toujours mettre a jour si fournies (et non vides)
    if (body.test_publishable_key !== undefined && body.test_publishable_key !== "")
      updates.test_publishable_key = body.test_publishable_key;
    if (body.live_publishable_key !== undefined && body.live_publishable_key !== "")
      updates.live_publishable_key = body.live_publishable_key;
    if (body.active_mode !== undefined)
      updates.active_mode = body.active_mode;
    // N'ecraser connect_client_id que si une valeur non-vide est fournie
    if (body.connect_client_id && body.connect_client_id !== "")
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
      // UPDATE - preserver les valeurs existantes si non fournies
      const existingRow = existingRows[0];
      
      const finalTestSecret = updates.test_secret_key !== undefined ? updates.test_secret_key : existingRow.test_secret_key;
      const finalTestPublishable = updates.test_publishable_key !== undefined ? updates.test_publishable_key : existingRow.test_publishable_key;
      const finalTestWebhook = updates.test_webhook_secret !== undefined ? updates.test_webhook_secret : existingRow.test_webhook_secret;
      const finalLiveSecret = updates.live_secret_key !== undefined ? updates.live_secret_key : existingRow.live_secret_key;
      const finalLivePublishable = updates.live_publishable_key !== undefined ? updates.live_publishable_key : existingRow.live_publishable_key;
      const finalLiveWebhook = updates.live_webhook_secret !== undefined ? updates.live_webhook_secret : existingRow.live_webhook_secret;
      const finalActiveMode = updates.active_mode !== undefined ? updates.active_mode : existingRow.active_mode;
      const finalConnectId = updates.connect_client_id !== undefined ? updates.connect_client_id : existingRow.connect_client_id;
      
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

    // Invalider le cache lib/stripe-config.ts
    invalidateStripeConfigCache();

    // Relire la DB pour confirmer
    const verifyRows = await sql`SELECT active_mode, updated_by, updated_at FROM stripe_config WHERE id = 1`;
    const savedRow = verifyRows[0] || {};

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
      message: "Configuration Stripe sauvegardee en base de donnees",
      active_mode: savedRow.active_mode || body.active_mode || "test",
      updated_by: savedRow.updated_by,
      updated_at: savedRow.updated_at,
      source: "database",
    });
  } catch (err) {
    console.error("[Admin/StripeConfig] POST DB error:", err);
    return NextResponse.json({
      error: "Impossible de sauvegarder en base de donnees",
      source: "error",
    }, { status: 500 });
  }
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
    return NextResponse.json({ error: "Acces reserve au PATRON" }, { status: 403 });
  }

  if (!["test", "live"].includes(body.mode)) {
    return NextResponse.json({ error: "mode doit etre 'test' ou 'live'" }, { status: 422 });
  }

  // DB obligatoire
  if (!isDatabaseConfigured()) {
    return NextResponse.json({
      error: "Base de donnees requise pour changer le mode Stripe.",
      source: "none",
    }, { status: 503 });
  }

  try {
    await ensureTableExists();
    await sql`
      UPDATE stripe_config
      SET active_mode = ${body.mode}, updated_by = ${body.email}, updated_at = NOW()
      WHERE id = 1
    `;
    
    invalidateStripeConfigCache();

    // Log mode change audit event
    logStripeSettingsUpdate(body.email, body.email, {
      modeChanged: true,
      newMode: body.mode,
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      message: `Mode bascule en ${body.mode.toUpperCase()}`,
      active_mode: body.mode,
      source: "database",
    });
  } catch (err) {
    console.error("[Admin/StripeConfig] PATCH DB error:", err);
    return NextResponse.json({
      error: "Impossible de changer le mode en base de donnees",
      source: "error",
    }, { status: 500 });
  }
}
