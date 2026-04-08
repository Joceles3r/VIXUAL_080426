import { NextRequest, NextResponse } from "next/server";
import { 
  createSoutienLibreCheckout, 
  getCreatorBySlug,
  validateSoutienAmount,
} from "@/lib/soutien-libre/engine";

/**
 * POST /api/soutien-libre/checkout
 * Cree une session Stripe Checkout pour un soutien libre
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      creatorSlug, 
      amount, 
      includeVixualTip = false, 
      donorEmail, 
      message, 
      isAnonymous = false 
    } = body;

    // Validation
    if (!creatorSlug) {
      return NextResponse.json(
        { success: false, error: "creatorSlug requis" },
        { status: 400 }
      );
    }

    if (!donorEmail) {
      return NextResponse.json(
        { success: false, error: "Email requis" },
        { status: 400 }
      );
    }

    const validation = validateSoutienAmount(amount);
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }

    // Recuperer le createur
    const creator = await getCreatorBySlug(creatorSlug);
    
    if (!creator) {
      return NextResponse.json(
        { success: false, error: "Createur non trouve" },
        { status: 404 }
      );
    }

    if (!creator.stripeAccountId) {
      return NextResponse.json(
        { success: false, error: "Ce createur ne peut pas recevoir de soutiens" },
        { status: 400 }
      );
    }

    // Recuperer l'ID utilisateur du header si connecte
    const donorId = req.headers.get("x-vixual-user-id") || undefined;

    // Creer la session Stripe
    const result = await createSoutienLibreCheckout({
      creatorId: creator.id,
      creatorSlug: creator.slug,
      creatorName: creator.displayName,
      creatorStripeAccountId: creator.stripeAccountId,
      amount,
      includeVixualTip,
      donorEmail,
      donorId,
      message,
      isAnonymous,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      checkoutUrl: result.checkoutUrl,
      sessionId: result.sessionId,
    });
  } catch (error) {
    console.error("[Soutien Libre API] Erreur:", error);
    return NextResponse.json(
      { success: false, error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
