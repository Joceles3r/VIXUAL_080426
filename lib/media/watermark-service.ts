/**
 * VIXUAL Watermark Service
 * 
 * Ajoute le branding "Propulsé par VIXUAL" sur les contenus vidéo/image.
 * Important pour la viralité et le marketing automatique.
 * 
 * Options utilisateur:
 * - Aucun watermark
 * - Badge discret (coin inférieur droit)
 * - Intro VIXUAL (3 secondes au début)
 * - Outro VIXUAL (5 secondes à la fin)
 */

import { isFeatureEnabled } from "@/lib/feature-flags"

// ─── Types ───

export type WatermarkPosition = 
  | "top-left" 
  | "top-right" 
  | "bottom-left" 
  | "bottom-right" 
  | "center"

export type WatermarkStyle = 
  | "none" 
  | "badge" 
  | "intro" 
  | "outro" 
  | "intro-outro"

export interface WatermarkConfig {
  style: WatermarkStyle
  position: WatermarkPosition
  opacity: number // 0-100
  text: string
  logoUrl?: string
  fontSize: number // in pixels
  fontColor: string
  backgroundColor?: string
  duration?: number // for intro/outro in seconds
}

export interface WatermarkResult {
  success: boolean
  outputPath?: string
  error?: string
  processingTime?: number
}

// ─── Default Configuration ───

export const DEFAULT_WATERMARK_CONFIG: WatermarkConfig = {
  style: "badge",
  position: "bottom-right",
  opacity: 80,
  text: "Propulsé par VIXUAL",
  fontSize: 24,
  fontColor: "#FFFFFF",
  backgroundColor: "rgba(0,0,0,0.5)",
  duration: 3,
}

// ─── Watermark Presets ───

export const WATERMARK_PRESETS: Record<WatermarkStyle, Partial<WatermarkConfig>> = {
  none: {
    style: "none",
  },
  badge: {
    style: "badge",
    position: "bottom-right",
    opacity: 80,
    fontSize: 20,
  },
  intro: {
    style: "intro",
    position: "center",
    opacity: 100,
    fontSize: 48,
    duration: 3,
  },
  outro: {
    style: "outro",
    position: "center",
    opacity: 100,
    fontSize: 48,
    duration: 5,
  },
  "intro-outro": {
    style: "intro-outro",
    position: "center",
    opacity: 100,
    fontSize: 48,
    duration: 3,
  },
}

// ─── FFmpeg Command Generators ───

/**
 * Generate FFmpeg command for adding a text watermark
 * Note: Requires FFmpeg to be installed on the server
 */
export function generateWatermarkCommand(
  inputPath: string,
  outputPath: string,
  config: WatermarkConfig = DEFAULT_WATERMARK_CONFIG
): string {
  if (config.style === "none") {
    // Just copy the file
    return `ffmpeg -i "${inputPath}" -c copy "${outputPath}"`
  }
  
  const { text, position, fontSize, fontColor, opacity } = config
  
  // Calculate position coordinates
  const positionMap: Record<WatermarkPosition, string> = {
    "top-left": "x=20:y=20",
    "top-right": "x=W-tw-20:y=20",
    "bottom-left": "x=20:y=H-th-20",
    "bottom-right": "x=W-tw-20:y=H-th-20",
    "center": "x=(W-tw)/2:y=(H-th)/2",
  }
  
  const posCoords = positionMap[position]
  const alphaValue = opacity / 100
  
  // Build the drawtext filter
  const drawtext = `drawtext=text='${text}':fontcolor=${fontColor}@${alphaValue}:fontsize=${fontSize}:${posCoords}`
  
  return `ffmpeg -i "${inputPath}" -vf "${drawtext}" -codec:a copy "${outputPath}"`
}

/**
 * Generate FFmpeg command for adding intro/outro
 */
export function generateIntroOutroCommand(
  inputPath: string,
  outputPath: string,
  config: WatermarkConfig,
  introVideoPath?: string,
  outroVideoPath?: string
): string {
  const parts: string[] = []
  
  if (config.style === "intro" || config.style === "intro-outro") {
    if (introVideoPath) {
      parts.push(`-i "${introVideoPath}"`)
    }
  }
  
  parts.push(`-i "${inputPath}"`)
  
  if (config.style === "outro" || config.style === "intro-outro") {
    if (outroVideoPath) {
      parts.push(`-i "${outroVideoPath}"`)
    }
  }
  
  // For a real implementation, this would use FFmpeg concat demuxer
  // This is a simplified version
  const filterComplex = "concat=n=2:v=1:a=1"
  
  return `ffmpeg ${parts.join(" ")} -filter_complex "${filterComplex}" "${outputPath}"`
}

// ─── Service Functions ───

/**
 * Add watermark to a video file
 * Note: In production, this would use a worker queue (e.g., Bull/BullMQ)
 */
export async function addWatermarkToVideo(
  inputPath: string,
  outputPath: string,
  config: Partial<WatermarkConfig> = {}
): Promise<WatermarkResult> {
  if (!isFeatureEnabled("watermark")) {
    return { success: false, error: "Watermark feature is disabled" }
  }
  
  const startTime = Date.now()
  const fullConfig: WatermarkConfig = { ...DEFAULT_WATERMARK_CONFIG, ...config }
  
  // In a real implementation, this would execute FFmpeg
  // For now, we simulate the process
  try {
    const command = generateWatermarkCommand(inputPath, outputPath, fullConfig)
    
    // Simulate processing (in production, use child_process.exec)
    console.log(`[VIXUAL Watermark] Command: ${command}`)
    
    // Simulate async processing
    await new Promise(resolve => setTimeout(resolve, 100))
    
    return {
      success: true,
      outputPath,
      processingTime: Date.now() - startTime,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      processingTime: Date.now() - startTime,
    }
  }
}

/**
 * Add watermark to an image file
 */
export async function addWatermarkToImage(
  inputPath: string,
  outputPath: string,
  config: Partial<WatermarkConfig> = {}
): Promise<WatermarkResult> {
  if (!isFeatureEnabled("watermark")) {
    return { success: false, error: "Watermark feature is disabled" }
  }
  
  const startTime = Date.now()
  const fullConfig: WatermarkConfig = { ...DEFAULT_WATERMARK_CONFIG, ...config }
  
  // In production, use Sharp or ImageMagick
  try {
    console.log(`[VIXUAL Watermark] Processing image: ${inputPath}`)
    console.log(`[VIXUAL Watermark] Config: ${JSON.stringify(fullConfig)}`)
    
    await new Promise(resolve => setTimeout(resolve, 50))
    
    return {
      success: true,
      outputPath,
      processingTime: Date.now() - startTime,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      processingTime: Date.now() - startTime,
    }
  }
}

// ─── User Preferences ───

export interface UserWatermarkPreferences {
  userId: string
  defaultStyle: WatermarkStyle
  customText?: string
  position: WatermarkPosition
  opacity: number
  includeOnExport: boolean
}

const mockUserPreferences: Map<string, UserWatermarkPreferences> = new Map()

/**
 * Get user watermark preferences
 */
export function getUserWatermarkPreferences(userId: string): UserWatermarkPreferences {
  return mockUserPreferences.get(userId) || {
    userId,
    defaultStyle: "badge",
    position: "bottom-right",
    opacity: 80,
    includeOnExport: true,
  }
}

/**
 * Save user watermark preferences
 */
export function saveUserWatermarkPreferences(
  preferences: UserWatermarkPreferences
): boolean {
  mockUserPreferences.set(preferences.userId, preferences)
  return true
}
