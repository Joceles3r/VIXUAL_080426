/**
 * VIXUAL Platform - Integrations Configuration
 * Centralized configuration for Stripe Connect and Bunny.net CDN
 */

// ── Stripe Connect Configuration ──
export const STRIPE_CONNECT_CONFIG = {
  // Platform fees (percentage of transaction)
  platformFeePercent: 10, // 10% commission VIXUAL
  
  // Stripe fees (approximate, for estimation)
  stripeFeesPercent: 2.9,
  stripeFeesFixed: 25, // 0.25€ in cents
  
  // Account types supported
  accountTypes: ["express", "standard", "custom"] as const,
  defaultAccountType: "express" as const,
  
  // Payout settings
  payoutSchedule: {
    interval: "weekly" as const,
    weeklyAnchor: "friday" as const,
  },
  
  // Minimum amounts (in cents)
  minPayoutAmount: 1000, // 10€ minimum payout
  minInvestmentAmount: 200, // 2€ minimum investment
  
  // Countries supported for Connect
  supportedCountries: ["FR", "BE", "CH", "LU", "MC", "CA", "US", "GB", "DE", "ES", "IT", "NL", "PT"],
  
  // Webhook events to handle
  webhookEvents: [
    "checkout.session.completed",
    "payment_intent.succeeded",
    "payment_intent.payment_failed",
    "charge.refunded",
    "transfer.failed",
    "account.updated",
    "account.application.deauthorized",
    "payout.paid",
    "payout.failed",
  ] as const,
} as const;

// ── Bunny.net CDN Configuration ──
export const BUNNY_CDN_CONFIG = {
  // Storage settings
  storageZoneName: process.env.BUNNY_STORAGE_ZONE_NAME || "vixual-storage",
  storageRegion: process.env.BUNNY_STORAGE_REGION || "de", // Frankfurt
  
  // CDN settings
  cdnHostname: process.env.BUNNY_CDN_HOSTNAME || "vixual.b-cdn.net",
  pullZoneId: process.env.BUNNY_PULL_ZONE_ID || "",
  
  // Video Library (optional)
  videoLibraryId: process.env.BUNNY_VIDEO_LIBRARY_ID || "",
  
  // Security settings
  tokenAuthKey: process.env.BUNNY_TOKEN_AUTH_KEY || "",
  
  // URL signing
  defaultUrlExpiry: 3600, // 1 hour default
  hmacSecret: process.env.BUNNY_HMAC_SECRET || "",
  
  // Upload limits
  maxFileSize: 5 * 1024 * 1024 * 1024, // 5GB
  allowedVideoTypes: ["video/mp4", "video/webm", "video/quicktime", "video/x-msvideo"],
  allowedImageTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
  allowedAudioTypes: ["audio/mpeg", "audio/wav", "audio/ogg", "audio/aac"],
  
  // Paths structure
  paths: {
    videos: "videos/",
    thumbnails: "thumbnails/",
    avatars: "avatars/",
    covers: "covers/",
    documents: "documents/",
  },
  
  // Retry settings
  maxRetries: 3,
  retryDelayMs: 1000,
} as const;

// ── Integration Status Types ──
export type StripeConnectAccountStatus = 
  | "none"
  | "pending"
  | "restricted"
  | "verified"
  | "disabled";

export type BunnyUploadStatus =
  | "uploading"
  | "processing"
  | "ready"
  | "failed"
  | "deleted";

// ── Helper: Calculate Stripe fees ──
export function calculateStripeFees(amountCents: number): {
  stripeFee: number;
  platformFee: number;
  netAmount: number;
} {
  // Stripe fee: 2.9% + 0.25€
  const stripeFee = Math.round(
    amountCents * (STRIPE_CONNECT_CONFIG.stripeFeesPercent / 100) + 
    STRIPE_CONNECT_CONFIG.stripeFeesFixed
  );
  
  // Platform fee: 10%
  const platformFee = Math.round(
    amountCents * (STRIPE_CONNECT_CONFIG.platformFeePercent / 100)
  );
  
  // Net amount to creator
  const netAmount = amountCents - stripeFee - platformFee;
  
  return { stripeFee, platformFee, netAmount };
}

// ── Helper: Build CDN URL ──
export function buildCdnUrl(filePath: string): string {
  const hostname = BUNNY_CDN_CONFIG.cdnHostname;
  const cleanPath = filePath.startsWith("/") ? filePath.slice(1) : filePath;
  return `https://${hostname}/${cleanPath}`;
}

// ── Helper: Build Storage URL ──
export function buildStorageUrl(filePath: string): string {
  const zone = BUNNY_CDN_CONFIG.storageZoneName;
  const region = BUNNY_CDN_CONFIG.storageRegion;
  const cleanPath = filePath.startsWith("/") ? filePath.slice(1) : filePath;
  return `https://${region}.storage.bunnycdn.com/${zone}/${cleanPath}`;
}

// ── Environment validation ──
export function validateStripeConnectEnv(): { valid: boolean; missing: string[] } {
  const required = ["STRIPE_SECRET_KEY"];
  const optional = ["STRIPE_WEBHOOK_SECRET", "STRIPE_CONNECT_CLIENT_ID"];
  const missing = required.filter(key => !process.env[key]);
  
  return {
    valid: missing.length === 0,
    missing,
  };
}

export function validateBunnyEnv(): { valid: boolean; missing: string[] } {
  const required = ["BUNNY_API_KEY", "BUNNY_STORAGE_API_KEY"];
  const missing = required.filter(key => !process.env[key]);
  
  return {
    valid: missing.length === 0,
    missing,
  };
}

// ── Integration health check response type ──
export interface IntegrationHealthCheck {
  stripe: {
    connected: boolean;
    mode: "test" | "live";
    webhooksConfigured: boolean;
    connectEnabled: boolean;
  };
  bunny: {
    connected: boolean;
    storageConfigured: boolean;
    cdnConfigured: boolean;
    videoLibraryConfigured: boolean;
  };
  timestamp: string;
}
