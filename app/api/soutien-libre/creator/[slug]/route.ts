import { NextRequest, NextResponse } from "next/server";
import { getCreatorBySlug } from "@/lib/soutien-libre/engine";

/**
 * GET /api/soutien-libre/creator/[slug]
 * Recupere les informations d'un createur
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    if (!slug) {
      return NextResponse.json(
        { success: false, error: "Slug requis" },
        { status: 400 }
      );
    }

    const creator = await getCreatorBySlug(slug);

    if (!creator) {
      return NextResponse.json(
        { success: false, error: "Createur non trouve" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      creator: {
        id: creator.id,
        slug: creator.slug,
        displayName: creator.displayName,
        avatarUrl: creator.avatarUrl,
        bio: creator.bio,
        stripeAccountId: creator.stripeAccountId ? "configured" : null,
        stripeAccountStatus: creator.stripeAccountStatus,
      },
    });
  } catch (error) {
    console.error("[Soutien Libre Creator API] Erreur:", error);
    return NextResponse.json(
      { success: false, error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
