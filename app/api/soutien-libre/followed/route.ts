import { NextRequest, NextResponse } from "next/server";
import { getFollowedCreators } from "@/lib/soutien-libre/engine";

/**
 * GET /api/soutien-libre/followed
 * Recupere les createurs suivis par l'utilisateur connecte
 */
export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get("x-vixual-user-id");

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Non authentifie" },
        { status: 401 }
      );
    }

    const creators = await getFollowedCreators(userId);

    return NextResponse.json({
      success: true,
      creators: creators.map((c) => ({
        id: c.id,
        slug: c.slug,
        displayName: c.displayName,
        avatarUrl: c.avatarUrl,
        bio: c.bio,
        stripeAccountId: c.stripeAccountId ? "configured" : null,
        stripeAccountStatus: c.stripeAccountStatus,
      })),
    });
  } catch (error) {
    console.error("[Soutien Libre Followed API] Erreur:", error);
    return NextResponse.json(
      { success: false, error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
