import { NextRequest, NextResponse } from "next/server";
import { ErrorCodes, apiError, withErrorHandler } from "@/lib/api-errors";
import { canShareToday, logShareAction } from "@/lib/promo-engine";

const VALID_CHANNELS = ["email", "link", "social"] as const;

// POST: log a share/referral action
export const POST = withErrorHandler(async (req: Request) => {
  const body = await (req as NextRequest).json();
  const { userId, channel, contentId } = body as {
    userId?: string;
    channel?: string;
    contentId?: string;
  };

  if (!userId || !channel) {
    return apiError(ErrorCodes.ERR_MISSING_FIELD, "userId et channel requis", 400);
  }

  if (!VALID_CHANNELS.includes(channel as typeof VALID_CHANNELS[number])) {
    return apiError(ErrorCodes.ERR_INVALID_INPUT, `Channel invalide. Valeurs: ${VALID_CHANNELS.join(", ")}`, 400);
  }

  const check = await canShareToday(userId);
  if (!check.allowed) {
    return apiError(
      ErrorCodes.ERR_PROMO_LIMIT_REACHED,
      "Limite de partages atteinte pour aujourd'hui.",
      429
    );
  }

  await logShareAction(
    userId,
    channel as "email" | "link" | "social",
    { contentId: contentId || null }
  );

  return NextResponse.json({
    success: true,
    todayCount: check.todayCount + 1,
    message: "Partage enregistre.",
  });
});
