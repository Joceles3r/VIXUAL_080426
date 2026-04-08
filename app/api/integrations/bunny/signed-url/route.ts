import { NextRequest, NextResponse } from "next/server";
import { bunnyCDNService } from "@/lib/integrations/bunny/bunny-cdn-service";
import { apiError, ErrorCodes } from "@/lib/api-errors";

/**
 * POST /api/integrations/bunny/signed-url
 * Generate a signed URL for secure file access
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { filePath, expiresIn, userId, sessionId, useHMAC } = body;
    
    if (!filePath) {
      return apiError(ErrorCodes.ERR_MISSING_FIELD, "filePath is required", 400);
    }
    
    const signedUrl = bunnyCDNService.generateSignedUrl({
      filePath,
      expiresIn: expiresIn || 3600, // Default 1 hour
      userId,
      sessionId,
      useHMAC: useHMAC ?? true, // Default to HMAC for security
    });
    
    return NextResponse.json({
      url: signedUrl,
      expiresIn: expiresIn || 3600,
      useHMAC: useHMAC ?? true,
    });
    
  } catch (error) {
    console.error("[Bunny Signed URL] Error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return apiError(ErrorCodes.ERR_INTERNAL, message, 500);
  }
}
