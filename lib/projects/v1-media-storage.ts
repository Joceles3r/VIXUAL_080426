/**
 * VIXUAL V1-001 — Media Storage Abstraction Layer
 *
 * Abstracts storage backend to allow easy switching between local, Bunny, AWS.
 * Currently supports:
 * - Local/mock storage (in-memory data URLs or file reference)
 * - Bunny CDN integration (prepared)
 *
 * This layer allows future migration to Bunny.net without changing project code.
 */

import "server-only"
import { generateMediaStorageKey, isDataUrl } from "./v1-project"

// ══════════════════════════════════════════════════════════════════════════════
// TYPES
// ══════════════════════════════════════════════════════════════════════════════

export type StorageProvider = "local" | "bunny" | "aws"

export interface StorageUploadResult {
  url: string
  storageProvider: StorageProvider
  storageKey: string
  mimeType: string
  fileSize: number
}

export interface StorageConfig {
  provider: StorageProvider
  bunnyEnabled?: boolean
  bunnyStorageKey?: string
  bunnyStorageZone?: string
  bunnyHostname?: string
}

// ══════════════════════════════════════════════════════════════════════════════
// STORAGE IMPLEMENTATION
// ══════════════════════════════════════════════════════════════════════════════

class MediaStorage {
  private config: StorageConfig

  constructor(config: StorageConfig) {
    this.config = config
  }

  /**
   * Determine active provider based on config
   */
  private getActiveProvider(): StorageProvider {
    if (this.config.provider === "bunny" && this.config.bunnyEnabled) {
      return "bunny"
    }
    return "local"
  }

  /**
   * Upload media file and return URL
   * For local: converts to data URL or stores reference
   * For Bunny: uploads to Bunny CDN
   */
  async uploadMedia(
    buffer: Buffer,
    projectId: string,
    mediaType: "excerpt" | "full",
    mimeType: string
  ): Promise<StorageUploadResult> {
    const provider = this.getActiveProvider()

    if (provider === "bunny") {
      return this.uploadToBunny(buffer, projectId, mediaType, mimeType)
    }

    // Default: local storage (data URL or mock reference)
    return this.uploadLocal(buffer, projectId, mediaType, mimeType)
  }

  /**
   * Local storage: convert to data URL for now (can be optimized later)
   * In production, could store in /public/uploads or cloud storage
   */
  private async uploadLocal(
    buffer: Buffer,
    projectId: string,
    mediaType: "excerpt" | "full",
    mimeType: string
  ): Promise<StorageUploadResult> {
    const base64 = buffer.toString("base64")
    const dataUrl = `data:${mimeType};base64,${base64}`
    const storageKey = generateMediaStorageKey(projectId, mediaType)

    return {
      url: dataUrl,
      storageProvider: "local",
      storageKey,
      mimeType,
      fileSize: buffer.length,
    }
  }

  /**
   * Bunny CDN upload (prepared for integration)
   * Will be implemented when Bunny config is active
   */
  private async uploadToBunny(
    buffer: Buffer,
    projectId: string,
    mediaType: "excerpt" | "full",
    mimeType: string
  ): Promise<StorageUploadResult> {
    if (!this.config.bunnyStorageKey || !this.config.bunnyStorageZone) {
      throw new Error("Bunny storage not configured")
    }

    // Placeholder: actual Bunny API call would go here
    // For now, fallback to local
    console.warn("[MediaStorage] Bunny not fully configured, using local storage")
    return this.uploadLocal(buffer, projectId, mediaType, mimeType)
  }

  /**
   * Get download URL for media (supports all providers)
   */
  getDownloadUrl(storageUrl: string, storageProvider: StorageProvider): string {
    if (isDataUrl(storageUrl)) {
      return storageUrl
    }

    if (storageProvider === "bunny" && this.config.bunnyHostname) {
      // Extract key and build Bunny CDN URL
      const key = storageUrl.split("/").pop()
      return `${this.config.bunnyHostname}/${key}`
    }

    return storageUrl
  }

  /**
   * Delete media from storage (if provider supports it)
   */
  async deleteMedia(storageUrl: string, storageProvider: StorageProvider): Promise<void> {
    if (isDataUrl(storageUrl)) {
      // Data URLs don't need cleanup
      return
    }

    if (storageProvider === "bunny") {
      // Would call Bunny delete API here
      console.log("[MediaStorage] Would delete from Bunny:", storageUrl)
    }

    // Local file references: would delete from /public/uploads here
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// SINGLETON INSTANCE
// ══════════════════════════════════════════════════════════════════════════════

let storageInstance: MediaStorage | null = null

function getStorageConfig(): StorageConfig {
  const bunnyEnabled = !!(
    process.env.BUNNY_STORAGE_API_KEY && process.env.BUNNY_CDN_HOSTNAME
  )

  return {
    provider: bunnyEnabled ? "bunny" : "local",
    bunnyEnabled,
    bunnyStorageKey: process.env.BUNNY_STORAGE_API_KEY,
    bunnyStorageZone: process.env.BUNNY_STORAGE_ZONE,
    bunnyHostname: process.env.BUNNY_CDN_HOSTNAME,
  }
}

export function getMediaStorage(): MediaStorage {
  if (!storageInstance) {
    storageInstance = new MediaStorage(getStorageConfig())
  }
  return storageInstance
}

/**
 * Upload project media
 */
export async function uploadProjectMedia(
  buffer: Buffer,
  projectId: string,
  mediaType: "excerpt" | "full",
  mimeType: string
): Promise<StorageUploadResult> {
  const storage = getMediaStorage()
  return storage.uploadMedia(buffer, projectId, mediaType, mimeType)
}

/**
 * Get download URL for project media
 */
export function getProjectMediaUrl(
  storageUrl: string,
  storageProvider: StorageProvider = "local"
): string {
  const storage = getMediaStorage()
  return storage.getDownloadUrl(storageUrl, storageProvider)
}

/**
 * Delete project media
 */
export async function deleteProjectMedia(
  storageUrl: string,
  storageProvider: StorageProvider = "local"
): Promise<void> {
  const storage = getMediaStorage()
  return storage.deleteMedia(storageUrl, storageProvider)
}
