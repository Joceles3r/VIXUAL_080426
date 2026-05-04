import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { apiError, ErrorCodes, withErrorHandler } from "@/lib/api-errors"
import { createHmac } from "crypto"

/**
 * Verify Bunny.net webhook signature
 * Bunny uses HMAC-SHA256 with the webhook secret
 */
function verifyBunnyWebhookSignature(
  signature: string,
  rawBody: string,
  secret: string
): boolean {
  try {
    const expectedSignature = createHmac("sha256", secret)
      .update(rawBody)
      .digest("hex")
    
    // Constant-time comparison to prevent timing attacks
    if (signature.length !== expectedSignature.length) {
      return false
    }
    
    let result = 0
    for (let i = 0; i < signature.length; i++) {
      result |= signature.charCodeAt(i) ^ expectedSignature.charCodeAt(i)
    }
    
    return result === 0
  } catch (error) {
    console.error("[BUNNY WEBHOOK] Signature verification error:", error)
    return false
  }
}

/**
 * POST /api/integrations/bunny/webhook
 *
 * Recoit les notifications de Bunny.net concernant le statut de transcodage des videos.
 * 
 * Statuts Bunny:
 * - 0: Created
 * - 1: Uploaded
 * - 2: Processing
 * - 3: Transcoding
 * - 4: Finished (ready to play)
 * - 5: Error
 */
export const POST = withErrorHandler(async (req: Request) => {
  // Read raw body for signature verification
  const rawBody = await req.text()
  let body: Record<string, unknown>
  
  try {
    body = JSON.parse(rawBody)
  } catch {
    console.error("[BUNNY WEBHOOK] Invalid JSON body")
    return apiError(ErrorCodes.ERR_INVALID_INPUT, "Invalid JSON body", 400)
  }
  
  // Verify webhook signature (required in production)
  const webhookSecret = process.env.BUNNY_WEBHOOK_SECRET
  const isProduction = process.env.NODE_ENV === "production"
  
  if (webhookSecret) {
    const signature = req.headers.get("x-bunny-signature") || req.headers.get("x-signature")
    
    if (!signature) {
      console.warn("[BUNNY WEBHOOK] Missing signature header")
      if (isProduction) {
        return apiError(ErrorCodes.ERR_UNAUTHORIZED, "Missing webhook signature", 403)
      }
      // Allow in dev without signature but log warning
      console.warn("[BUNNY WEBHOOK] DEV MODE: Allowing request without signature")
    } else {
      const isValid = verifyBunnyWebhookSignature(signature, rawBody, webhookSecret)
      
      if (!isValid) {
        console.error("[BUNNY WEBHOOK] Invalid signature detected - possible spoofing attempt")
        return apiError(ErrorCodes.ERR_UNAUTHORIZED, "Invalid webhook signature", 403)
      }
      
      console.log("[BUNNY WEBHOOK] Signature verified successfully")
    }
  } else if (isProduction) {
    console.error("[BUNNY WEBHOOK] CRITICAL: No BUNNY_WEBHOOK_SECRET configured in production!")
    // In production without secret, reject all webhooks for security
    return apiError(ErrorCodes.ERR_INTERNAL, "Webhook not configured", 500)
  } else {
    console.warn("[BUNNY WEBHOOK] DEV MODE: No webhook secret configured - accepting all requests")
  }
  
  const { VideoGuid, Status, Length, Width, Height, ErrorMessage } = body
  
  // Validation des champs requis
  if (!VideoGuid) {
    return apiError(ErrorCodes.ERR_MISSING_FIELD, "VideoGuid is required", 400)
  }
  
  if (Status === undefined || Status === null) {
    return apiError(ErrorCodes.ERR_MISSING_FIELD, "Status is required", 400)
  }
  
  // Mapper le statut numérique vers un texte lisible
  const statusMap: Record<number, string> = {
    0: "created",
    1: "uploaded",
    2: "processing",
    3: "transcoding",
    4: "finished",
    5: "error",
  }
  
  const statusText = (statusMap as Record<number, string>)[Status as number] || "unknown"
  
  // Mettre à jour le statut de la vidéo dans la base de données
  try {
    // Vérifier si la vidéo existe
    const existingVideo = await sql`
      SELECT id, content_id, creator_id FROM video_uploads 
      WHERE bunny_video_id = ${VideoGuid}
    `
    
    if (existingVideo.length === 0) {
      // Vidéo non trouvée - peut-être pas encore enregistrée dans notre système
      console.warn(`[BUNNY WEBHOOK] Video ${VideoGuid} not found in database`)
      return NextResponse.json({
        success: false,
        message: `Video ${VideoGuid} not found in database`,
      }, { status: 404 })
    }
    
    // Mettre à jour le statut
    await sql`
      UPDATE video_uploads
      SET 
        bunny_status = ${statusText},
        bunny_status_code = ${Status},
        duration_seconds = ${Length || null},
        width = ${Width || null},
        height = ${Height || null},
        error_message = ${ErrorMessage || null},
        updated_at = NOW()
      WHERE bunny_video_id = ${VideoGuid}
    `
    
    // Si le transcodage est terminé avec succès, mettre à jour le contenu associé
    if (Status === 4) {
      const video = existingVideo[0]
      await sql`
        UPDATE contents
        SET 
          video_status = 'ready',
          video_duration = ${Length || null},
          updated_at = NOW()
        WHERE id = ${video.content_id}
      `
      
      console.log(`[BUNNY WEBHOOK] Video ${VideoGuid} transcoding completed successfully`)
    }
    
    // Si erreur de transcodage, logger et marquer le contenu
    if (Status === 5) {
      const video = existingVideo[0]
      await sql`
        UPDATE contents
        SET 
          video_status = 'error',
          video_error = ${ErrorMessage || 'Transcoding failed'},
          updated_at = NOW()
        WHERE id = ${video.content_id}
      `
      
      console.error(`[BUNNY WEBHOOK] Video ${VideoGuid} transcoding failed: ${ErrorMessage}`)
    }
    
    return NextResponse.json({
      success: true,
      message: `Video ${VideoGuid} status updated to ${statusText}`,
      data: {
        videoId: VideoGuid,
        status: statusText,
        statusCode: Status,
        duration: Length,
      },
    })
  } catch (error) {
    console.error("[BUNNY WEBHOOK] Database error:", error)
    return apiError(
      ErrorCodes.ERR_DATABASE,
      "Failed to update video status",
      500
    )
  }
})

/**
 * GET /api/integrations/bunny/webhook
 * 
 * Endpoint de vérification pour Bunny.com (health check)
 */
export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "VIXUAL Bunny Webhook Handler",
    timestamp: new Date().toISOString(),
  })
}
