import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getStripeConfig } from "@/lib/stripe-config";
import { STRIPE_CANONICAL_WEBHOOK_PATH, validateModeKeyConsistency } from "@/lib/integrations/stripe/constants";
import { runtimeFlags, isProduction } from "@/lib/runtime-flags";
import Stripe from "stripe";

/**
 * GET /api/admin/stripe-health
 * 
 * Endpoint de health-check Stripe pour l'admin.
 * Verifie:
 * - Acces DB config
 * - Source config (database ou memory)
 * - Mode actif (test/live)
 * - Presence des cles
 * - Coherence mode/cles
 * - Derniere date de mise a jour
 */
export async function GET() {
  const health: {
    ok: boolean;
    source: "database" | "memory" | "error";
    mode: "test" | "live" | null;
    has_secret_key: boolean;
    has_publishable_key: boolean;
    has_webhook_secret: boolean;
    webhook_url: string;
    updated_at: string | null;
    updated_by: string | null;
    warnings: string[];
    errors: string[];
    can_process_payments: boolean;
    can_receive_webhooks: boolean;
    mode_key_consistent: boolean;
  } = {
    ok: false,
    source: "error",
    mode: null,
    has_secret_key: false,
    has_publishable_key: false,
    has_webhook_secret: false,
    webhook_url: STRIPE_CANONICAL_WEBHOOK_PATH,
    updated_at: null,
    updated_by: null,
    warnings: [],
    errors: [],
    can_process_payments: false,
    can_receive_webhooks: false,
    mode_key_consistent: false,
  };

  try {
    // Tenter de charger la config depuis la DB
    let dbAvailable = false;
    let dbConfig: Record<string, unknown> | null = null;

    try {
      const rows = await sql`SELECT * FROM stripe_config WHERE id = 1 LIMIT 1`;
      if (rows.length > 0) {
        dbConfig = rows[0] as Record<string, unknown>;
        dbAvailable = true;
        health.source = "database";
      }
    } catch (dbError) {
      health.warnings.push("Base de donnees inaccessible - fallback memoire");
    }

    // Si pas de DB, utiliser le cache memoire
    if (!dbAvailable) {
      health.source = "memory";
      health.warnings.push("Configuration en memoire volatile - sera perdue au redemarrage");
      
      if (isProduction() && runtimeFlags.requireDatabaseForStripe) {
        health.errors.push("CRITIQUE: Configuration memoire interdite en production");
      }
    }

    // Charger la config (depuis DB ou memoire)
    const config = await getStripeConfig();
    
    health.mode = config.mode;
    health.has_secret_key = !!config.secretKey;
    health.has_publishable_key = !!config.publishableKey;
    health.has_webhook_secret = !!config.webhookSecret;
    health.updated_at = config.updatedAt || null;
    health.updated_by = config.updatedBy || null;

    // Verifications de coherence
    if (!health.has_secret_key) {
      health.errors.push("Cle secrete Stripe manquante");
    }
    if (!health.has_publishable_key) {
      health.warnings.push("Cle publique Stripe manquante");
    }
    if (!health.has_webhook_secret) {
      health.warnings.push("Secret webhook Stripe manquant - webhooks non securises");
    }

    // Validation coherence mode/cles
    if (config.secretKey && config.mode) {
      const consistency = validateModeKeyConsistency(
        config.mode,
        config.secretKey,
        config.publishableKey
      );
      health.mode_key_consistent = consistency.valid;
      if (!consistency.valid) {
        health.errors.push(...consistency.errors);
      }
    }

    // Determiner les capacites
    health.can_process_payments = health.has_secret_key && health.mode_key_consistent;
    health.can_receive_webhooks = health.has_webhook_secret;

    // TEST REEL DE CONNEXION STRIPE
    // Appel a l'API Stripe pour verifier que les cles sont valides
    let stripeConnectionOk = false;
    let stripeAccountInfo: { id?: string; email?: string; livemode?: boolean } | null = null;
    
    if (config.secretKey) {
      try {
        const stripe = new Stripe(config.secretKey, {
          apiVersion: "2025-04-30.basil",
          typescript: true,
        });
        
        // Appel leger pour tester la connexion - retrieve account info
        const account = await stripe.accounts.retrieve();
        
        stripeConnectionOk = true;
        stripeAccountInfo = {
          id: account.id,
          email: account.email || undefined,
          livemode: !account.id?.startsWith("acct_") || config.mode === "live",
        };
        
        // Verifier coherence livemode
        if (config.mode === "live" && account.id?.includes("test")) {
          health.warnings.push("Mode LIVE configure mais cle de test detectee");
        }
        if (config.mode === "test" && !account.id?.includes("test") && account.charges_enabled) {
          health.warnings.push("Mode TEST configure mais compte semble etre en production");
        }
        
      } catch (stripeError) {
        stripeConnectionOk = false;
        const errorMessage = stripeError instanceof Error ? stripeError.message : "Erreur inconnue";
        
        if (errorMessage.includes("Invalid API Key")) {
          health.errors.push("Cle API Stripe invalide - verifiez votre configuration");
        } else if (errorMessage.includes("authentication")) {
          health.errors.push("Echec d'authentification Stripe - cle incorrecte ou expiree");
        } else {
          health.errors.push(`Connexion Stripe echouee: ${errorMessage}`);
        }
      }
    }

    // ── Récupérer événements webhook récents ───────────────────
    let recentEvents: Array<{
      id: string;
      event_type: string;
      processing_status: string;
      error_message: string | null;
      processed_at: string;
    }> = [];
    let recentErrors: typeof recentEvents = [];
    let eventStats = { total_24h: 0, processed_24h: 0, failed_24h: 0 };
    
    try {
      const eventsRows = await sql`
        SELECT id, event_type, processing_status, error_message, processed_at
        FROM stripe_events_log
        ORDER BY processed_at DESC
        LIMIT 10
      `;
      recentEvents = eventsRows.map((r) => ({
        id: r.id as string,
        event_type: r.event_type as string,
        processing_status: r.processing_status as string,
        error_message: (r.error_message as string) || null,
        processed_at: new Date(r.processed_at as string).toISOString(),
      }));
      
      recentErrors = recentEvents.filter(
        (e) => e.processing_status === "failed" && e.error_message
      );
      
      const statsRows = await sql`
        SELECT 
          COUNT(*) as total,
          COUNT(*) FILTER (WHERE processing_status = 'processed') as processed,
          COUNT(*) FILTER (WHERE processing_status = 'failed') as failed
        FROM stripe_events_log
        WHERE processed_at >= NOW() - INTERVAL '24 hours'
      `;
      if (statsRows.length > 0) {
        eventStats = {
          total_24h: Number(statsRows[0].total) || 0,
          processed_24h: Number(statsRows[0].processed) || 0,
          failed_24h: Number(statsRows[0].failed) || 0,
        };
      }
    } catch (err) {
      health.warnings.push("Impossible de lire les événements webhook récents");
    }

    // ── Statistiques Stripe Connect ────────────────────────────
    let connectStats = {
      total_accounts: 0,
      verified_accounts: 0,
      pending_accounts: 0,
      restricted_accounts: 0,
      disabled_accounts: 0,
    };
    
    try {
      const connectRows = await sql`
        SELECT 
          COUNT(*) as total,
          COUNT(*) FILTER (WHERE stripe_account_status = 'verified') as verified,
          COUNT(*) FILTER (WHERE stripe_account_status = 'pending') as pending,
          COUNT(*) FILTER (WHERE stripe_account_status = 'restricted') as restricted,
          COUNT(*) FILTER (WHERE stripe_account_status = 'disabled') as disabled
        FROM users WHERE stripe_account_id IS NOT NULL
      `;
      if (connectRows.length > 0) {
        connectStats = {
          total_accounts: Number(connectRows[0].total) || 0,
          verified_accounts: Number(connectRows[0].verified) || 0,
          pending_accounts: Number(connectRows[0].pending) || 0,
          restricted_accounts: Number(connectRows[0].restricted) || 0,
          disabled_accounts: Number(connectRows[0].disabled) || 0,
        };
      }
    } catch {
      // Ignore: Connect stats are optional
    }

    // Verdict final - DOIT inclure le test reel de connexion
    health.ok = 
      health.errors.length === 0 && 
      health.source === "database" &&
      health.can_process_payments &&
      stripeConnectionOk;
    
    // Alertes supplémentaires
    if (eventStats.failed_24h > 5) {
      health.warnings.push(`${eventStats.failed_24h} webhooks en échec sur 24h — vérifiez les erreurs récentes`);
    }
    if (connectStats.restricted_accounts > 0) {
      health.warnings.push(`${connectStats.restricted_accounts} compte(s) Connect avec informations manquantes`);
    }

    // Ajouter les infos de compte Stripe si disponibles
    const response = {
      ...health,
      stripe_connection_tested: true,
      stripe_connection_ok: stripeConnectionOk,
      stripe_account: stripeAccountInfo,
      recent_events: recentEvents,
      recent_errors: recentErrors,
      event_stats: eventStats,
      connect_stats: connectStats,
    };

    // Warnings supplementaires
    if (health.mode === "live" && health.source === "memory") {
      health.errors.push("DANGER: Mode LIVE avec stockage memoire volatile");
    }

    if (health.mode === "live" && !isProduction()) {
      health.warnings.push("Mode LIVE actif en environnement de developpement");
    }

    return NextResponse.json(response);

  } catch (error) {
    health.errors.push(`Erreur systeme: ${error instanceof Error ? error.message : "Inconnue"}`);
    return NextResponse.json(health, { status: 500 });
  }
}
