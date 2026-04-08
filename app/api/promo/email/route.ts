import { NextRequest, NextResponse } from "next/server";
import { ErrorCodes, apiError, withErrorHandler } from "@/lib/api-errors";
import {
  canSendPromoEmail,
  logPromoEmail,
  getUserPromoStats,
  type PromoType,
} from "@/lib/promo-engine";

const VALID_PROMO_TYPES: PromoType[] = [
  "welcome", "re_engagement", "milestone",
  "referral_reward", "cycle_closure", "content_published",
];

// POST: trigger a promotional email (subject to cooldown + monthly cap)
export const POST = withErrorHandler(async (req: Request) => {
  const body = await (req as NextRequest).json();
  const { userId, promoType, subject } = body as {
    userId?: string;
    promoType?: string;
    subject?: string;
  };

  if (!userId || !promoType || !subject) {
    return apiError(ErrorCodes.ERR_MISSING_FIELD, "userId, promoType, subject requis", 400);
  }

  if (!VALID_PROMO_TYPES.includes(promoType as PromoType)) {
    return apiError(ErrorCodes.ERR_INVALID_INPUT, `promoType invalide. Types: ${VALID_PROMO_TYPES.join(", ")}`, 400);
  }

  const check = await canSendPromoEmail(userId);
  if (!check.allowed) {
    return apiError(
      ErrorCodes.ERR_PROMO_COOLDOWN,
      check.reason || "Email promotionnel non autorise pour le moment.",
      429,
      check.nextAllowedAt ? `Prochain envoi: ${check.nextAllowedAt}` : undefined
    );
  }

  // In production, this would integrate with an email provider (Resend, SendGrid, etc.)
  // For now, we log the intent and return success
  await logPromoEmail(userId, promoType as PromoType, subject, {
    triggeredAt: new Date().toISOString(),
  });

  return NextResponse.json({
    success: true,
    message: `Email promotionnel "${promoType}" enregistre.`,
    monthlyCount: (check.monthlyCount ?? 0) + 1,
  });
});

// GET: get promo stats for a user
export const GET = withErrorHandler(async (req: Request) => {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  if (!userId) {
    return apiError(ErrorCodes.ERR_MISSING_FIELD, "userId is required", 400);
  }

  const stats = await getUserPromoStats(userId);
  return NextResponse.json({ success: true, data: stats });
});
