import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { bunnyCDNService } from "@/lib/integrations/bunny/bunny-cdn-service";
import { apiError, ErrorCodes } from "@/lib/api-errors";
import { BUNNY_CDN_CONFIG } from "@/lib/integrations/config";

/**
 * POST /api/integrations/bunny/upload
 * Upload a file to Bunny Storage
 */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const userId = formData.get("userId") as string | null;
    const path = formData.get("path") as string | null;
    const contentId = formData.get("contentId") as string | null;
    
    if (!file || !userId) {
      return apiError(ErrorCodes.ERR_MISSING_FIELD, "file and userId are required", 400);
    }
    
    // Verify user exists
    const users = await sql`SELECT id FROM users WHERE id = ${userId}`;
    if (users.length === 0) {
      return apiError(ErrorCodes.ERR_USER_NOT_FOUND, "User not found", 404);
    }
    
    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Determine storage path
    const uploadPath = path || `users/${userId}/`;
    const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    
    // Upload to Bunny
    const result = await bunnyCDNService.uploadFile({
      file: buffer,
      fileName,
      path: uploadPath,
      contentType: file.type,
      userId,
    });
    
    // Record in database
    await sql`
      INSERT INTO video_uploads (user_id, file_name, file_path, cdn_url, file_size, content_type, content_id, status)
      VALUES (
        ${userId}, 
        ${fileName}, 
        ${result.filePath}, 
        ${result.cdnUrl}, 
        ${result.fileSize},
        ${file.type},
        ${contentId || null},
        'uploaded'
      )
    `;
    
    return NextResponse.json({
      success: true,
      filePath: result.filePath,
      cdnUrl: result.cdnUrl,
      fileSize: result.fileSize,
      message: "File uploaded successfully",
    });
    
  } catch (error) {
    console.error("[Bunny Upload] Error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return apiError(ErrorCodes.ERR_INTERNAL, message, 500);
  }
}
