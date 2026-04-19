/**
 * API Routes pour le Pass Decouverte VIXUAL
 * 
 * GET /api/visupoints/discovery-pass?userId=...
 * - Retourne le statut du Pass Decouverte pour l'utilisateur
 * 
 * POST /api/visupoints/discovery-pass
 * - action: "unlock" - Debloquer le Pass
 * - action: "consume" - Utiliser le Pass pour un contenu
 */

import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { apiError, ErrorCodes, withErrorHandler } from "@/lib/api-errors";
import {
  getDiscoveryPassStatus,
  unlockDiscoveryPass,
  consumeDiscoveryPass,
  DISCOVERY_PASS_REQUIREMENTS,
  VIXUPOINTS_GAINS,
  isEligibleForVixupoints,
} from "@/lib/vixupoints-engine";

/**
 * GET - Obtenir le statut du Pass Decouverte
 */
export const GET = withErrorHandler(async (req: Request) => {
  const url = new URL(req.url);
  const userId = url.searchParams.get("userId");

  if (!userId) {
    return apiError(ErrorCodes.ERR_MISSING_FIELD, "userId query param required", 400);
  }

  // Verifier l'utilisateur
  const users = await sql`
    SELECT id, role, is_minor
    FROM users WHERE id = ${userId} LIMIT 1
  `;
  if (!users || users.length === 0) {
    return apiError(ErrorCodes.ERR_USER_NOT_FOUND, "User not found", 404);
  }

  const user = users[0];
  const profile = user.is_minor ? "visitor_minor" : (user.role || "visitor");

  // Verifier eligibilite
  if (!isEligibleForVixupoints(profile)) {
    return NextResponse.json({
      eligible: false,
      reason: "Ce profil ne beneficie pas du Pass Decouverte.",
    });
  }

  // Obtenir les donnees du jour
  const today = new Date().toISOString().slice(0, 10);

  // Pass status
  const passRows = await sql`
    SELECT unlocked, used, unlocked_at, used_at
    FROM discovery_pass_daily
    WHERE user_id = ${userId} AND date = ${today}
    LIMIT 1
  `;
  const passData = passRows[0] || { unlocked: false, used: false };

  // Extraits visionnes aujourd'hui
  const excerptRows = await sql`
    SELECT COUNT(*) as count
    FROM content_views
    WHERE user_id = ${userId}
      AND DATE(viewed_at) = ${today}
      AND view_type = 'excerpt'
  `;
  const excerptViewsToday = Number(excerptRows[0]?.count || 0);

  // VIXUpoints gagnes aujourd'hui
  const pointsRows = await sql`
    SELECT COALESCE(SUM(points), 0) as total
    FROM visupoints_transactions
    WHERE user_id = ${userId}
      AND DATE(created_at) = ${today}
      AND type = 'credit'
  `;
  const vixupointsEarnedToday = Number(pointsRows[0]?.total || 0);

  // Interactions aujourd'hui
  const interactionRows = await sql`
    SELECT COUNT(*) as count
    FROM user_interactions
    WHERE user_id = ${userId}
      AND DATE(created_at) = ${today}
      AND type IN ('like', 'comment')
  `;
  const interactionsToday = Number(interactionRows[0]?.count || 0);

  // Construire le statut
  const status = getDiscoveryPassStatus(
    passData.unlocked ?? false,
    passData.used ?? false,
    excerptViewsToday,
    vixupointsEarnedToday,
    interactionsToday
  );

  return NextResponse.json({
    eligible: true,
    status,
    requirements: DISCOVERY_PASS_REQUIREMENTS,
    rewards: {
      fullContentView: VIXUPOINTS_GAINS.fullContentView,
    },
  });
});

/**
 * POST - Debloquer ou utiliser le Pass Decouverte
 */
export const POST = withErrorHandler(async (req: Request) => {
  const body = await req.json();
  const { userId, action, contentId } = body;

  if (!userId || !action) {
    return apiError(ErrorCodes.ERR_INVALID_INPUT, "userId and action required", 400);
  }

  if (!["unlock", "consume"].includes(action)) {
    return apiError(ErrorCodes.ERR_INVALID_INPUT, "action must be 'unlock' or 'consume'", 400);
  }

  // Verifier l'utilisateur
  const users = await sql`
    SELECT id, role, is_minor, visupoints_balance
    FROM users WHERE id = ${userId} LIMIT 1
  `;
  if (!users || users.length === 0) {
    return apiError(ErrorCodes.ERR_USER_NOT_FOUND, "User not found", 404);
  }

  const user = users[0];
  const profile = user.is_minor ? "visitor_minor" : (user.role || "visitor");

  if (!isEligibleForVixupoints(profile)) {
    return apiError(ErrorCodes.ERR_FORBIDDEN, "Ce profil ne beneficie pas du Pass Decouverte", 403);
  }

  const today = new Date().toISOString().slice(0, 10);

  // Obtenir les donnees du jour
  const passRows = await sql`
    SELECT unlocked, used
    FROM discovery_pass_daily
    WHERE user_id = ${userId} AND date = ${today}
    LIMIT 1
  `;
  let passData = passRows[0];

  // Creer l'entree si elle n'existe pas
  if (!passData) {
    await sql`
      INSERT INTO discovery_pass_daily (user_id, date, unlocked, used)
      VALUES (${userId}, ${today}, false, false)
      ON CONFLICT (user_id, date) DO NOTHING
    `;
    passData = { unlocked: false, used: false };
  }

  if (action === "unlock") {
    if (passData.unlocked) {
      return NextResponse.json({ success: true, message: "Pass deja debloque.", alreadyUnlocked: true });
    }

    // Verifier les conditions de deblocage
    const excerptRows = await sql`
      SELECT COUNT(*) as count FROM content_views
      WHERE user_id = ${userId} AND DATE(viewed_at) = ${today} AND view_type = 'excerpt'
    `;
    const excerptViewsToday = Number(excerptRows[0]?.count || 0);

    const pointsRows = await sql`
      SELECT COALESCE(SUM(points), 0) as total FROM visupoints_transactions
      WHERE user_id = ${userId} AND DATE(created_at) = ${today} AND type = 'credit'
    `;
    const vixupointsEarnedToday = Number(pointsRows[0]?.total || 0);

    const interactionRows = await sql`
      SELECT COUNT(*) as count FROM user_interactions
      WHERE user_id = ${userId} AND DATE(created_at) = ${today} AND type IN ('like', 'comment')
    `;
    const interactionsToday = Number(interactionRows[0]?.count || 0);

    const unlockResult = unlockDiscoveryPass(excerptViewsToday, vixupointsEarnedToday, interactionsToday);

    if (!unlockResult.success) {
      return NextResponse.json({
        success: false,
        message: "Conditions de deblocage non remplies.",
        progress: {
          excerpts: { current: excerptViewsToday, required: DISCOVERY_PASS_REQUIREMENTS.excerptViews },
          vixupoints: { current: vixupointsEarnedToday, required: DISCOVERY_PASS_REQUIREMENTS.vixupoints },
          interactions: { current: interactionsToday, required: DISCOVERY_PASS_REQUIREMENTS.interactions },
        },
      });
    }

    // Debloquer le Pass
    await sql`
      UPDATE discovery_pass_daily
      SET unlocked = true, unlocked_at = NOW(), unlock_method = ${unlockResult.method}
      WHERE user_id = ${userId} AND date = ${today}
    `;

    return NextResponse.json({
      success: true,
      message: "Pass Decouverte debloque !",
      method: unlockResult.method,
    });
  }

  if (action === "consume") {
    if (!contentId) {
      return apiError(ErrorCodes.ERR_MISSING_FIELD, "contentId required for consume action", 400);
    }

    const consumeResult = consumeDiscoveryPass(passData.unlocked ?? false, passData.used ?? false);

    if (!consumeResult.success) {
      return NextResponse.json({ success: false, message: consumeResult.message });
    }

    // Consommer le Pass
    await sql`
      UPDATE discovery_pass_daily
      SET used = true, used_at = NOW(), content_id = ${contentId}
      WHERE user_id = ${userId} AND date = ${today}
    `;

    // Crediter les VIXUpoints bonus pour le contenu complet
    const newBalance = Number(user.visupoints_balance || 0) + VIXUPOINTS_GAINS.fullContentView;
    
    await sql`
      INSERT INTO visupoints_transactions (user_id, type, points, source, balance_after, created_at)
      VALUES (${userId}, 'credit', ${VIXUPOINTS_GAINS.fullContentView}, 'discovery_pass', ${newBalance}, NOW())
    `;

    await sql`
      UPDATE users SET visupoints_balance = ${newBalance} WHERE id = ${userId}
    `;

    return NextResponse.json({
      success: true,
      message: consumeResult.message,
      contentId,
      bonusPoints: VIXUPOINTS_GAINS.fullContentView,
      newBalance,
    });
  }

  return apiError(ErrorCodes.ERR_INVALID_INPUT, "Invalid action", 400);
});
