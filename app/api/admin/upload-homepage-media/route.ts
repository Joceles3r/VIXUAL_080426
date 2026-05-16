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

const MAX_HERO_VIDEO = 20 * 1024 * 1024 // 20 Mo
const MAX_HERO_IMAGE = 5 * 1024 * 1024  // 5 Mo
const MAX_CARD_IMAGE = 2 * 1024 * 1024  // 2 Mo

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
      return NextResponse.json(
        { error: `Fichier trop lourd (${Math.round(file.size / 1024 / 1024)} Mo). Max: ${maxMo} Mo.` },
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
