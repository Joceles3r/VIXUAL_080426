import "server-only";
import crypto from "crypto";
import { 
  BUNNY_CDN_CONFIG, 
  buildCdnUrl, 
  buildStorageUrl,
  type BunnyUploadStatus 
} from "../config";

/**
 * VIXUAL Platform - Bunny.net CDN Service
 * Complete service for storage, CDN, and video streaming
 */

// ── Types ──
export interface UploadParams {
  file: Buffer;
  fileName: string;
  path: string;
  contentType: string;
  userId: string;
}

export interface UploadResult {
  success: boolean;
  filePath: string;
  cdnUrl: string;
  storageUrl: string;
  fileSize: number;
}

export interface SignedUrlParams {
  filePath: string;
  expiresIn?: number; // seconds
  userId?: string;
  sessionId?: string;
  useHMAC?: boolean;
}

export interface VideoUploadParams {
  videoBuffer: Buffer;
  title: string;
  collectionId?: string;
  thumbnailTime?: number;
}

export interface VideoInfo {
  guid: string;
  title: string;
  dateUploaded: string;
  views: number;
  status: number;
  length: number;
  framerate: number;
  width: number;
  height: number;
  availableResolutions: string;
  thumbnailUrl: string;
  hlsUrl: string;
}

export interface StorageStats {
  bandwidthUsed: number;
  requestsServed: number;
  cacheHitRate: number;
  storageUsed: number;
}

// ── Helper: Retry with exponential backoff ──
async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = BUNNY_CDN_CONFIG.maxRetries
): Promise<T> {
  let lastError: Error | undefined;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (attempt < maxRetries) {
        const delay = BUNNY_CDN_CONFIG.retryDelayMs * Math.pow(2, attempt - 1);
        console.log(`[Bunny] Retry ${attempt}/${maxRetries} after ${delay}ms`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
}

// ── Service Class ──
class BunnyCDNService {
  private apiKey: string;
  private storageApiKey: string;
  private initialized: boolean = false;
  
  constructor() {
    this.apiKey = process.env.BUNNY_API_KEY || "";
    this.storageApiKey = process.env.BUNNY_STORAGE_API_KEY || "";
    this.initialized = !!(this.apiKey && this.storageApiKey);
  }
  
  /**
   * Check if Bunny CDN is configured
   */
  isConfigured(): boolean {
    return this.initialized;
  }
  
  /**
   * Ensure Bunny is configured before operations
   */
  private ensureConfigured(): void {
    if (!this.initialized) {
      throw new Error(
        "[VIXUAL] Bunny CDN non configure. " +
        "Definissez BUNNY_API_KEY et BUNNY_STORAGE_API_KEY dans les variables d'environnement."
      );
    }
  }
  
  // ── Storage Operations ──
  
  /**
   * Upload a file to Bunny Storage
   */
  async uploadFile(params: UploadParams): Promise<UploadResult> {
    this.ensureConfigured();
    const { file, fileName, path, contentType, userId } = params;
    
    // Validate file type
    const allowedTypes = [
      ...BUNNY_CDN_CONFIG.allowedVideoTypes,
      ...BUNNY_CDN_CONFIG.allowedImageTypes,
      ...BUNNY_CDN_CONFIG.allowedAudioTypes,
    ];
    
    if (!allowedTypes.includes(contentType as typeof allowedTypes[number])) {
      throw new Error(`File type ${contentType} is not allowed`);
    }
    
    // Validate file size
    if (file.length > BUNNY_CDN_CONFIG.maxFileSize) {
      throw new Error(`File size exceeds maximum of ${BUNNY_CDN_CONFIG.maxFileSize / (1024 * 1024 * 1024)}GB`);
    }
    
    const filePath = `${path}${fileName}`.replace(/\/+/g, "/");
    const storageUrl = buildStorageUrl(filePath);
    
    console.log(`[Bunny] Uploading file: ${filePath}`);
    
    return withRetry(async () => {
      const response = await fetch(storageUrl, {
        method: "PUT",
        headers: {
          "AccessKey": this.storageApiKey,
          "Content-Type": contentType,
        },
        body: (file instanceof Buffer ? new Uint8Array(file) : file) as BodyInit,
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Upload failed: ${response.status} - ${errorText}`);
      }
      
      console.log(`[Bunny] Upload successful: ${filePath}`);
      
      return {
        success: true,
        filePath,
        cdnUrl: buildCdnUrl(filePath),
        storageUrl,
        fileSize: file.length,
      };
    });
  }
  
  /**
   * Download a file from Bunny Storage
   */
  async downloadFile(filePath: string): Promise<Buffer> {
    const storageUrl = buildStorageUrl(filePath);
    
    return withRetry(async () => {
      const response = await fetch(storageUrl, {
        method: "GET",
        headers: {
          "AccessKey": this.storageApiKey,
        },
      });
      
      if (!response.ok) {
        throw new Error(`Download failed: ${response.status}`);
      }
      
      const arrayBuffer = await response.arrayBuffer();
      return Buffer.from(arrayBuffer);
    });
  }
  
  /**
   * Delete a file from Bunny Storage
   */
  async deleteFile(filePath: string): Promise<boolean> {
    const storageUrl = buildStorageUrl(filePath);
    
    return withRetry(async () => {
      const response = await fetch(storageUrl, {
        method: "DELETE",
        headers: {
          "AccessKey": this.storageApiKey,
        },
      });
      
      if (!response.ok && response.status !== 404) {
        throw new Error(`Delete failed: ${response.status}`);
      }
      
      console.log(`[Bunny] File deleted: ${filePath}`);
      return true;
    });
  }
  
  /**
   * List files in a directory
   */
  async listFiles(path: string): Promise<Array<{
    name: string;
    path: string;
    length: number;
    lastChanged: string;
    isDirectory: boolean;
  }>> {
    const storageUrl = buildStorageUrl(path + "/");
    
    const response = await fetch(storageUrl, {
      method: "GET",
      headers: {
        "AccessKey": this.storageApiKey,
        "Accept": "application/json",
      },
    });
    
    if (!response.ok) {
      throw new Error(`List files failed: ${response.status}`);
    }
    
    return response.json();
  }
  
  // ── URL Signing (Security) ──
  
  /**
   * Generate a signed URL for secure access
   */
  generateSignedUrl(params: SignedUrlParams): string {
    const { 
      filePath, 
      expiresIn = BUNNY_CDN_CONFIG.defaultUrlExpiry,
      userId,
      sessionId,
      useHMAC = false 
    } = params;
    
    const cdnUrl = buildCdnUrl(filePath);
    const expires = Math.floor(Date.now() / 1000) + expiresIn;
    
    if (useHMAC && BUNNY_CDN_CONFIG.hmacSecret) {
      // HMAC-based signature (anti-piracy, recommended)
      return this.generateHmacSignedUrl(cdnUrl, expires, userId, sessionId);
    } else if (BUNNY_CDN_CONFIG.tokenAuthKey) {
      // Simple token-based signature
      return this.generateTokenSignedUrl(cdnUrl, expires);
    }
    
    // No signing configured, return plain URL
    return cdnUrl;
  }
  
  /**
   * Generate HMAC-signed URL (anti-piracy)
   */
  private generateHmacSignedUrl(
    url: string,
    expires: number,
    userId?: string,
    sessionId?: string
  ): string {
    const secret = BUNNY_CDN_CONFIG.hmacSecret;
    const urlObj = new URL(url);
    
    // Build signature payload
    const signatureBase = [
      secret,
      urlObj.pathname,
      expires.toString(),
      userId || "",
      sessionId || "",
    ].join("");
    
    // Generate HMAC-SHA256 signature
    const signature = crypto
      .createHmac("sha256", secret)
      .update(signatureBase)
      .digest("base64url");
    
    // Build signed URL
    urlObj.searchParams.set("token", signature);
    urlObj.searchParams.set("expires", expires.toString());
    if (userId) urlObj.searchParams.set("uid", userId);
    if (sessionId) urlObj.searchParams.set("sid", sessionId);
    
    return urlObj.toString();
  }
  
  /**
   * Generate token-signed URL (simple auth)
   */
  private generateTokenSignedUrl(url: string, expires: number): string {
    const tokenKey = BUNNY_CDN_CONFIG.tokenAuthKey;
    const urlObj = new URL(url);
    
    const signatureBase = tokenKey + urlObj.pathname + expires.toString();
    const token = crypto
      .createHash("md5")
      .update(signatureBase)
      .digest("base64url");
    
    urlObj.searchParams.set("token", token);
    urlObj.searchParams.set("expires", expires.toString());
    
    return urlObj.toString();
  }
  
  // ── Video Library (Stream) ──
  
  /**
   * Upload video to Bunny Stream
   */
  async uploadVideo(params: VideoUploadParams): Promise<{ videoId: string; status: string }> {
    const { videoBuffer, title, collectionId, thumbnailTime } = params;
    const libraryId = BUNNY_CDN_CONFIG.videoLibraryId;
    
    if (!libraryId) {
      throw new Error("Video Library ID not configured");
    }
    
    // Create video entry
    const createResponse = await fetch(
      `https://video.bunnycdn.com/library/${libraryId}/videos`,
      {
        method: "POST",
        headers: {
          "AccessKey": this.apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          collectionId: collectionId || undefined,
          thumbnailTime: thumbnailTime || 0,
        }),
      }
    );
    
    if (!createResponse.ok) {
      throw new Error(`Failed to create video: ${createResponse.status}`);
    }
    
    const videoData = await createResponse.json();
    const videoId = videoData.guid;
    
    // Upload video content
    const uploadResponse = await fetch(
      `https://video.bunnycdn.com/library/${libraryId}/videos/${videoId}`,
      {
        method: "PUT",
        headers: {
          "AccessKey": this.apiKey,
          "Content-Type": "application/octet-stream",
        },
        body: (videoBuffer instanceof Buffer ? new Uint8Array(videoBuffer) : videoBuffer) as BodyInit,
      }
    );
    
    if (!uploadResponse.ok) {
      throw new Error(`Failed to upload video content: ${uploadResponse.status}`);
    }
    
    console.log(`[Bunny] Video uploaded: ${videoId}`);
    
    return {
      videoId,
      status: "processing",
    };
  }
  
  /**
   * Get video information
   */
  async getVideoInfo(videoId: string): Promise<VideoInfo> {
    const libraryId = BUNNY_CDN_CONFIG.videoLibraryId;
    
    const response = await fetch(
      `https://video.bunnycdn.com/library/${libraryId}/videos/${videoId}`,
      {
        method: "GET",
        headers: {
          "AccessKey": this.apiKey,
        },
      }
    );
    
    if (!response.ok) {
      throw new Error(`Failed to get video info: ${response.status}`);
    }
    
    const data = await response.json();
    
    return {
      guid: data.guid,
      title: data.title,
      dateUploaded: data.dateUploaded,
      views: data.views,
      status: data.status,
      length: data.length,
      framerate: data.framerate,
      width: data.width,
      height: data.height,
      availableResolutions: data.availableResolutions,
      thumbnailUrl: `https://vz-${libraryId}.b-cdn.net/${videoId}/thumbnail.jpg`,
      hlsUrl: `https://vz-${libraryId}.b-cdn.net/${videoId}/playlist.m3u8`,
    };
  }
  
  /**
   * Delete video from Stream
   */
  async deleteVideo(videoId: string): Promise<boolean> {
    const libraryId = BUNNY_CDN_CONFIG.videoLibraryId;
    
    const response = await fetch(
      `https://video.bunnycdn.com/library/${libraryId}/videos/${videoId}`,
      {
        method: "DELETE",
        headers: {
          "AccessKey": this.apiKey,
        },
      }
    );
    
    if (!response.ok && response.status !== 404) {
      throw new Error(`Failed to delete video: ${response.status}`);
    }
    
    console.log(`[Bunny] Video deleted: ${videoId}`);
    return true;
  }
  
  // ── Cache Management ──
  
  /**
   * Purge a specific URL from cache
   */
  async purgeUrl(url: string): Promise<boolean> {
    const response = await fetch(
      "https://api.bunny.net/purge",
      {
        method: "POST",
        headers: {
          "AccessKey": this.apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      }
    );
    
    if (!response.ok) {
      throw new Error(`Purge failed: ${response.status}`);
    }
    
    console.log(`[Bunny] URL purged: ${url}`);
    return true;
  }
  
  /**
   * Purge entire pull zone cache
   */
  async purgeZone(): Promise<boolean> {
    const pullZoneId = BUNNY_CDN_CONFIG.pullZoneId;
    
    if (!pullZoneId) {
      throw new Error("Pull Zone ID not configured");
    }
    
    const response = await fetch(
      `https://api.bunny.net/pullzone/${pullZoneId}/purgeCache`,
      {
        method: "POST",
        headers: {
          "AccessKey": this.apiKey,
        },
      }
    );
    
    if (!response.ok) {
      throw new Error(`Zone purge failed: ${response.status}`);
    }
    
    console.log(`[Bunny] Pull zone purged: ${pullZoneId}`);
    return true;
  }
  
  // ── Statistics ──
  
  /**
   * Get CDN statistics for a date range
   */
  async getStatistics(dateFrom: string, dateTo: string): Promise<StorageStats> {
    const pullZoneId = BUNNY_CDN_CONFIG.pullZoneId;
    
    const response = await fetch(
      `https://api.bunny.net/statistics?dateFrom=${dateFrom}&dateTo=${dateTo}${pullZoneId ? `&pullZone=${pullZoneId}` : ""}`,
      {
        method: "GET",
        headers: {
          "AccessKey": this.apiKey,
        },
      }
    );
    
    if (!response.ok) {
      throw new Error(`Failed to get statistics: ${response.status}`);
    }
    
    const data = await response.json();
    
    return {
      bandwidthUsed: data.TotalBandwidthUsed || 0,
      requestsServed: data.TotalRequestsServed || 0,
      cacheHitRate: data.CacheHitRate || 0,
      storageUsed: data.TotalStorageUsed || 0,
    };
  }
  
  // ── Health Check ──
  
  /**
   * Test connection to Bunny.net
   */
  async healthCheck(): Promise<{
    storage: boolean;
    cdn: boolean;
    videoLibrary: boolean;
  }> {
    const results = {
      storage: false,
      cdn: false,
      videoLibrary: false,
    };
    
    // Test storage
    try {
      const testPath = "_health_check_" + Date.now();
      const testContent = Buffer.from("health");
      await this.uploadFile({
        file: testContent,
        fileName: testPath,
        path: "system/",
        contentType: "text/plain",
        userId: "system",
      });
      await this.deleteFile(`system/${testPath}`);
      results.storage = true;
    } catch {
      results.storage = false;
    }
    
    // Test CDN (just check if configured)
    results.cdn = !!BUNNY_CDN_CONFIG.cdnHostname;
    
    // Test video library
    results.videoLibrary = !!BUNNY_CDN_CONFIG.videoLibraryId;
    
    return results;
  }
}

// ── Export singleton ──
export const bunnyCDNService = new BunnyCDNService();
