import { NextRequest, NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import path from "path"
import { bunnyCDNService } from "@/lib/integrations/bunny/bunny-cdn-service"

/**
 * VIXUAL — API Upload Media Homepage
 *
 * POST /api/admin/upload-homepage-media
 * Body: FormData { file, slot }
 *
 * Strategie storage adaptative :
 *  - Si BUNNY_STORAGE_API_KEY configure → upload vers Bunny CDN (production).
 *  - Sinon → fallback /public/uploads/homepage/ (developpement local).
 *
 * Limites :
 *  - hero-video : 20 Mo (MP4/WebM)
 *  - hero-image : 5 Mo (WebP/JPEG/PNG)
 *  - card-* : 5 Mo (vignettes carrousels)
 */

const IMAGE_TYPES = ["image/webp", "image/jpeg", "image/png", "image/jpg"]
const VIDEO_TYPES = ["video/mp4", "video/webm"]
const ALL_TYPES = [...IMAGE_TYPES, ...VIDEO_TYPES]

const MAX_HERO_VIDEO = 20 * 1024 * 1024
const MAX_HERO_IMAGE = 5 * 1024 * 1024
const MAX_CARD_IMAGE = 5 * 1024 * 1024

function getMaxSize(slot: string, isVideo: boolean): number {
  if (slot === "hero-video" || (slot === "hero-image" && isVideo)) return MAX_HERO_VIDEO
  if (slot === "hero-image") return MAX_HERO_IMAGE
  return MAX_CARD_IMAGE
}

function isBunnyConfigured(): boolean {
  return !!(process.env.BUNNY_STORAGE_API_KEY && process.env.BUNNY_CDN_HOSTNAME)
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get("file") as File | null
    const slot = (formData.get("slot") as string) || "hero-image"

    if (!file) {
      return NextResponse.json({ error: "Aucun fichier fourni" }, { status: 400 })
    }

    if (!ALL_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: `Type non autorise: ${file.type}. Acceptes: .webp .jpg .jpeg .png .mp4 .webm` },
        { status: 400 },
      )
    }

    const isVideo = VIDEO_TYPES.includes(file.type)
    const maxSize = getMaxSize(slot, isVideo)

    if (file.size > maxSize) {
      const maxMo = Math.round(maxSize / 1024 / 1024)
      const currentMo = Math.round((file.size / 1024 / 1024) * 10) / 10
      const tip = isVideo
        ? "Astuce : compressez avec HandBrake (preset Fast 1080p)."
        : "Astuce : convertissez en WebP (Squoosh.app, TinyPNG) pour reduire 60-80% sans perte."
      return NextResponse.json(
        { error: `Fichier trop lourd : ${currentMo} Mo (max ${maxMo} Mo).`, tip },
        { status: 400 },
      )
    }

    // Nom de fichier safe
    const ext = file.name.split(".").pop()?.toLowerCase() || (isVideo ? "mp4" : "webp")
    const safeSlot = slot.replace(/[^a-z0-9-]/gi, "-").slice(0, 60)
    const timestamp = Date.now()
    const filename = `${safeSlot}-${timestamp}.${ext}`
    const buffer = Buffer.from(await file.arrayBuffer())

    // ─── Strategie 1 : Bunny CDN (production) ───
    if (isBunnyConfigured()) {
      try {
        const result = await bunnyCDNService.uploadFile({
          file: buffer,
          fileName: filename,
          path: "homepage/",
          contentType: file.type,
          userId: "admin-homepage",
        })

        return NextResponse.json({
          success: true,
          path: result.cdnUrl,
          filename,
          size: file.size,
          type: file.type,
          isVideo,
          storage: "bunny",
        })
      } catch (e) {
        console.error("[upload-homepage-media] Echec Bunny, fallback local :", (e as Error).message)
        // Fallback transparent sur stockage local en cas d'echec
      }
    }

    // ─── Strategie 2 : Fallback /public/uploads/ (developpement local uniquement) ───
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json(
        {
          error: "Storage Bunny non configure en production.",
          tip: "Configurez BUNNY_STORAGE_API_KEY et BUNNY_CDN_HOSTNAME dans les variables d'environnement Render.",
        },
        { status: 503 },
      )
    }

    const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "homepage")
    await mkdir(UPLOAD_DIR, { recursive: true })
    const filePath = path.join(UPLOAD_DIR, filename)
    await writeFile(filePath, buffer)

    return NextResponse.json({
      success: true,
      path: `/uploads/homepage/${filename}`,
      filename,
      size: file.size,
      type: file.type,
      isVideo,
      storage: "local",
    })
  } catch (err) {
    console.error("[upload-homepage-media] error", err)
    return NextResponse.json({ error: "Erreur serveur upload" }, { status: 500 })
  }
}
