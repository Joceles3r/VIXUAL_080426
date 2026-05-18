import { NextRequest, NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import path from "path"

/**
 * VIXUAL — API Upload Media Homepage (Phase 1)
 *
 * POST /api/admin/upload-homepage-media
 * Body: FormData { file, slot }
 *
 * slot = "hero-image" | "hero-video" | "card-{id}"
 *
 * Stocke dans /public/uploads/homepage/
 * Retourne le chemin public du fichier.
 *
 * SECURITE : Phase 1, pas de token check (admin-only par convention).
 * Phase 2 : brancher auth middleware + permission manage_homepage.
 */

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "homepage")

const IMAGE_TYPES = ["image/webp", "image/jpeg", "image/png", "image/jpg"]
const VIDEO_TYPES = ["video/mp4", "video/webm"]
const ALL_TYPES = [...IMAGE_TYPES, ...VIDEO_TYPES]

/**
 * Limites de taille en entree (avant compression next/image cote visiteurs).
 *
 * Note : `next/image` redimensionne et compresse automatiquement les vignettes
 * a la volee (formats WebP/AVIF, plusieurs resolutions). Les visiteurs ne
 * telechargent jamais le fichier source brut. La limite de 5 Mo en entree
 * laisse de la marge aux PATRON/ADMIN qui uploadent depuis smartphone, sans
 * impacter la performance utilisateur final.
 */
const MAX_HERO_VIDEO = 20 * 1024 * 1024 // 20 Mo — videos d'arriere-plan hero
const MAX_HERO_IMAGE = 5 * 1024 * 1024  // 5 Mo — image hero pleine largeur
const MAX_CARD_IMAGE = 5 * 1024 * 1024  // 5 Mo — vignettes carrousels (aligne sur hero-image)

function getMaxSize(slot: string, isVideo: boolean): number {
  if (slot === "hero-video" || (slot === "hero-image" && isVideo)) return MAX_HERO_VIDEO
  if (slot === "hero-image") return MAX_HERO_IMAGE
  return MAX_CARD_IMAGE
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
        ? "Astuce : compressez votre video avec HandBrake (preset Fast 1080p) ou ffmpeg."
        : "Astuce : convertissez en WebP (TinyPNG, Squoosh.app) pour reduire la taille de 60 a 80% sans perte visible. Format ideal : 600x900 px portrait."
      return NextResponse.json(
        {
          error: `Fichier trop lourd : ${currentMo} Mo (max ${maxMo} Mo).`,
          tip,
        },
        { status: 400 },
      )
    }

    // Nom de fichier safe
    const ext = file.name.split(".").pop()?.toLowerCase() || (isVideo ? "mp4" : "webp")
    const safeSlot = slot.replace(/[^a-z0-9-]/gi, "-").slice(0, 60)
    const timestamp = Date.now()
    const filename = `${safeSlot}-${timestamp}.${ext}`

    // Ecrire le fichier
    await mkdir(UPLOAD_DIR, { recursive: true })
    const buffer = Buffer.from(await file.arrayBuffer())
    const filePath = path.join(UPLOAD_DIR, filename)
    await writeFile(filePath, buffer)

    const publicPath = `/uploads/homepage/${filename}`

    return NextResponse.json({
      success: true,
      path: publicPath,
      filename,
      size: file.size,
      type: file.type,
      isVideo,
    })
  } catch (err) {
    console.error("[upload-homepage-media] error", err)
    return NextResponse.json({ error: "Erreur serveur upload" }, { status: 500 })
  }
}
