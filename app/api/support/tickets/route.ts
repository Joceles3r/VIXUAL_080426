import { NextRequest, NextResponse } from "next/server";
import { sql, isDatabaseConfigured } from "@/lib/db";
import { ErrorCodes, apiError, withErrorHandler } from "@/lib/api-errors";
import { triageMessage } from "@/lib/support/ai-support-engine";

/**
 * GET /api/support/tickets?userId=xxx
 *  - Si userId fourni : retourne les tickets de l'utilisateur (mailbox)
 *  - Si pas de userId : retourne tous les tickets (admin uniquement, via ?admin=email)
 */
export const GET = withErrorHandler(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  const adminEmail = searchParams.get("adminEmail") || req.headers.get("x-admin-email");

  if (!isDatabaseConfigured()) {
    return NextResponse.json({ tickets: [], source: "memory" });
  }

  // Mode admin : retourne tous les tickets ouverts/escaladés
  if (adminEmail) {
    const tickets = await sql`
      SELECT 
        t.id, t.user_id, t.user_email, t.user_name, t.subject, t.message,
        t.category, t.priority, t.status, t.assigned_to, t.escalated,
        t.ai_response, t.ai_confidence, t.ai_resolved, t.created_at, t.updated_at,
        (SELECT COUNT(*) FROM support_ticket_responses WHERE ticket_id = t.id) AS response_count
      FROM support_tickets t
      WHERE t.status IN ('open', 'in_progress', 'escalated')
      ORDER BY 
        CASE t.priority 
          WHEN 'urgent' THEN 1 
          WHEN 'high' THEN 2 
          WHEN 'normal' THEN 3 
          WHEN 'low' THEN 4 
        END,
        t.created_at DESC
      LIMIT 200
    `;
    return NextResponse.json({ tickets, source: "database" });
  }

  // Mode utilisateur : ses propres tickets
  if (!userId) {
    return apiError(ErrorCodes.ERR_INVALID_INPUT, "userId ou adminEmail requis", 400);
  }

  const tickets = await sql`
    SELECT id, subject, message, category, priority, status, escalated,
           ai_response, ai_resolved, created_at, updated_at
    FROM support_tickets
    WHERE user_id = ${userId}
    ORDER BY created_at DESC
    LIMIT 100
  `;

  return NextResponse.json({ tickets, source: "database" });
});

/**
 * POST /api/support/tickets
 * Créer un nouveau ticket (depuis la mailbox usager)
 * Le triage IA est exécuté automatiquement.
 */
export const POST = withErrorHandler(async (req: NextRequest) => {
  const body = await req.json();
  const { userId, userEmail, userName, subject, message } = body;

  if (!userId || !userEmail || !subject || !message) {
    return apiError(
      ErrorCodes.ERR_INVALID_INPUT,
      "userId, userEmail, subject, message sont requis",
      400
    );
  }

  // Triage IA pour determiner categorie + priorite + reponse auto
  const triage = await triageMessage(message, subject);

  if (!isDatabaseConfigured()) {
    // En dev, retourne une réponse simulée
    return NextResponse.json({
      ticket: {
        id: `dev-${Date.now()}`,
        subject,
        message,
        category: triage.category,
        priority: triage.priority,
        status: triage.shouldEscalate ? "escalated" : "open",
        ai_response: triage.suggestedResponse,
        ai_confidence: triage.confidence,
        ai_resolved: triage.canAutoResolve,
        escalated: triage.shouldEscalate,
        created_at: new Date().toISOString(),
      },
      source: "memory",
    });
  }

  const inserted = await sql`
    INSERT INTO support_tickets (
      user_id, user_email, user_name, subject, message,
      category, priority, status, escalated,
      ai_response, ai_confidence, ai_resolved
    ) VALUES (
      ${userId}, ${userEmail}, ${userName || null}, ${subject}, ${message},
      ${triage.category}, ${triage.priority},
      ${triage.shouldEscalate ? "escalated" : "open"},
      ${triage.shouldEscalate},
      ${triage.suggestedResponse}, ${triage.confidence}, ${triage.canAutoResolve}
    )
    RETURNING id, subject, message, category, priority, status, escalated,
              ai_response, ai_confidence, ai_resolved, created_at
  `;

  return NextResponse.json({ ticket: inserted[0], source: "database" }, { status: 201 });
});

/**
 * PATCH /api/support/tickets
 * Met à jour le statut d'un ticket (admin uniquement)
 */
export const PATCH = withErrorHandler(async (req: NextRequest) => {
  const body = await req.json();
  const { ticketId, status, assignedTo, response } = body;
  const adminEmail = req.headers.get("x-admin-email");

  if (!adminEmail) {
    return apiError(ErrorCodes.ERR_FORBIDDEN, "Accès admin requis", 403);
  }

  if (!ticketId) {
    return apiError(ErrorCodes.ERR_INVALID_INPUT, "ticketId requis", 400);
  }

  if (!isDatabaseConfigured()) {
    return apiError(ErrorCodes.ERR_INTERNAL, "Base de données indisponible", 503);
  }

  // Mise à jour du ticket
  if (status || assignedTo) {
    await sql`
      UPDATE support_tickets
      SET 
        status = COALESCE(${status || null}, status),
        assigned_to = COALESCE(${assignedTo || null}, assigned_to),
        updated_at = NOW()
      WHERE id = ${ticketId}
    `;
  }

  // Ajout d'une réponse admin
  if (response) {
    await sql`
      INSERT INTO support_ticket_responses (ticket_id, author_type, author_email, message)
      VALUES (${ticketId}, 'admin', ${adminEmail}, ${response})
    `;
  }

  return NextResponse.json({ success: true });
});
