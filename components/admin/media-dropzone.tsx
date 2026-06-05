"use client"

/**
 * VIXUAL — MediaDropzone
 *
 * Composant glisser-deposer universel (PC + smartphone + tablette).
 * Utilise react-dropzone pour la compatibilite tactile native.
 *
 * AMÉLIORATIONS PHASE 1:
 * - Support des images sans Bunny (drag & drop → dataURL côté navigateur)
 * - Champ pour coller des URLs (https:// ou data:image/*)
 * - Conversion automatique image → dataURL avec limite de taille
 * - Les vidéos restent bloquées tant que Bunny n'est pas configuré
 *
 * Props:
 *   slot        — identifiant cible ("hero-image", "hero-video", "card-xxx")
 *   currentUrl  — URL du media actuel (fallback si upload echoue)
 *   accept      — "image" | "video" | "both"
 *   maxSizeMb   — taille max en Mo
 *   onUploaded  — callback avec le nouveau chemin public
 *   onError     — callback erreur
 *   className   — classes CSS additionnelles
 */

import { useCallback, useState } from "react"
import { useDropzone, type FileRejection } from "react-dropzone"
import Image from "next/image"
import {
  Upload,
  CheckCircle2,
  AlertTriangle,
  X,
  Film,
  ImageIcon,
  Loader2,
  Copy,
  AlertCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const ACCEPT_MAP = {
  image: { "image/*": [".png", ".jpg", ".jpeg", ".webp"] },
  video: { "video/*": [".mp4", ".webm"] },
  both: {
    "image/*": [".png", ".jpg", ".jpeg", ".webp"],
    "video/*": [".mp4", ".webm"],
  },
} as const

interface MediaDropzoneProps {
  slot: string
  currentUrl?: string
  accept?: "image" | "video" | "both"
  maxSizeMb?: number
  onUploaded: (path: string, isVideo?: boolean) => void
  onError?: (msg: string) => void
  className?: string
  isVideo?: boolean
}

export function MediaDropzone({
  slot,
  currentUrl,
  accept = "image",
  maxSizeMb = 5,
  onUploaded,
  onError,
  className = "",
  isVideo = false,
}: MediaDropzoneProps) {
  const [preview, setPreview] = useState<string | null>(null)
  const [previewIsVideo, setPreviewIsVideo] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploaded, setUploaded] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pastedUrl, setPastedUrl] = useState("")
  const [pastedError, setPastedError] = useState<string | null>(null)

  const maxBytes = maxSizeMb * 1024 * 1024

  // ───── HANDLE PASTED URL ─────
  const handlePasteUrl = useCallback(async () => {
    setPastedError(null)
    const url = pastedUrl.trim()

    if (!url) {
      setPastedError("Collez une URL (https:// ou data:image/*)")
      return
    }

    // Si c'est une dataURL, l'utiliser directement
    if (url.startsWith("data:image/")) {
      const sizeInKb = (url.length * 3) / 4 / 1024
      if (sizeInKb > maxBytes / 1024) {
        setPastedError(`Image trop volumineuse (${sizeInKb.toFixed(1)} Ko > ${maxSizeMb} Mo)`)
        return
      }
      onUploaded(url, false)
      setPastedUrl("")
      setPreview(null)
      setFile(null)
      setUploaded(true)
      return
    }

    // Si c'est une URL https://, vérifier qu'on peut y accéder
    if (url.startsWith("https://")) {
      try {
        // Valider que l'URL est accessible (CORS friendly)
        const response = await fetch(url, { method: "HEAD" })
        if (!response.ok) {
          setPastedError("URL inaccessible ou image non trouvée")
          return
        }
        onUploaded(url, false)
        setPastedUrl("")
        setPreview(null)
        setFile(null)
        setUploaded(true)
        return
      } catch (err) {
        setPastedError("Impossible de charger l'image depuis cette URL (CORS ?)")
        return
      }
    }

    setPastedError("Utilisez une URL https:// ou une dataURL (data:image/*)")
  }, [pastedUrl, maxBytes, maxSizeMb, onUploaded])

  // ───── CONVERT FILE TO DATAURL ─────
  const convertFileToDataUrl = useCallback(
    (file: File): Promise<string> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => {
          const dataUrl = reader.result as string
          const sizeInKb = (dataUrl.length * 3) / 4 / 1024
          if (sizeInKb > maxBytes / 1024) {
            reject(
              new Error(
                `Image trop volumineuse après conversion (${sizeInKb.toFixed(1)} Ko > ${maxSizeMb} Mo). Utilisez un format compressé.`
              )
            )
          } else {
            resolve(dataUrl)
          }
        }
        reader.onerror = () => reject(new Error("Erreur lecture fichier"))
        reader.readAsDataURL(file)
      })
    },
    [maxBytes, maxSizeMb]
  )

  // ───── HANDLE DROP ─────
  const handleDrop = useCallback(
    (accepted: File[], rejected: FileRejection[]) => {
      setError(null)
      setUploaded(false)
      setPastedError(null)

      if (rejected.length > 0) {
        const r = rejected[0]
        const msg =
          r.errors[0]?.code === "file-too-large"
            ? `Fichier trop lourd (max ${maxSizeMb} Mo)`
            : r.errors[0]?.code === "file-invalid-type"
              ? "Format non autorise"
              : r.errors[0]?.message ?? "Fichier refuse"
        setError(msg)
        onError?.(msg)
        return
      }

      const f = accepted[0]
      if (!f) return

      // Bloquer les vidéos si Bunny non configuré
      if (f.type.startsWith("video/")) {
        setError(
          "Les vidéos nécessitent Bunny.net pour être utilisées en production. Configurez d'abord Bunny dans l'administration."
        )
        return
      }

      setFile(f)
      const isVideo = f.type.startsWith("video/")
      setPreviewIsVideo(isVideo)

      // Preview locale immediate
      const url = URL.createObjectURL(f)
      setPreview(url)
    },
    [maxSizeMb, onError]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: ACCEPT_MAP[accept],
    multiple: false,
    maxSize: maxBytes,
    onDrop: handleDrop,
  })

  // ───── HANDLE CONFIRM (convert to dataURL client-side) ─────
  const handleConfirm = async () => {
    if (!file) return
    setUploading(true)
    setError(null)

    try {
      // Convertir l'image en dataURL côté navigateur
      const dataUrl = await convertFileToDataUrl(file)
      onUploaded(dataUrl, false)
      setUploaded(true)
      setFile(null)
      if (preview) URL.revokeObjectURL(preview)
      setPreview(null)
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erreur conversion image"
      setError(msg)
      onError?.(msg)
    } finally {
      setUploading(false)
    }
  }

  const handleCancel = () => {
    if (preview) URL.revokeObjectURL(preview)
    setPreview(null)
    setFile(null)
    setPreviewIsVideo(false)
    setUploaded(false)
    setError(null)
    setPastedUrl("")
    setPastedError(null)
  }

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} o`
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} Ko`
    return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* ─── Zone drag & drop ─── */}
      <div
        {...getRootProps()}
        className={`
          relative flex flex-col items-center justify-center
          min-h-[140px] rounded-xl cursor-pointer
          border-2 border-dashed transition-all duration-200
          ${isDragActive
            ? "border-purple-400 bg-purple-500/10 shadow-[0_0_24px_-4px_rgba(167,139,250,0.25)]"
            : "border-white/8 bg-[#070B12] hover:border-white/15 hover:bg-[#0a0e16]"
          }
          ${error ? "border-red-500/40 bg-red-500/5" : ""}
          ${uploaded ? "border-emerald-500/40 bg-emerald-500/5" : ""}
        `}
      >
        <input {...getInputProps()} />

        {isDragActive ? (
          <div className="flex flex-col items-center gap-2 py-4">
            <Upload className="h-8 w-8 text-purple-400 animate-bounce" />
            <p className="text-sm text-purple-300 font-medium">
              {"Deposez votre fichier ici"}
            </p>
          </div>
        ) : preview ? (
          /* ─── Preview du fichier selectionne ─── */
          <div className="w-full p-3">
            <div className="relative rounded-lg overflow-hidden bg-black/60 border border-white/5">
              {previewIsVideo ? (
                <video
                  src={preview}
                  className="w-full max-h-[200px] object-contain"
                  controls
                  muted
                  playsInline
                />
              ) : (
                <div className="relative aspect-video max-h-[200px]">
                  <Image
                    src={preview}
                    alt="Apercu media"
                    fill
                    className="object-contain"
                    unoptimized
                  />
                </div>
              )}
            </div>

            {/* Info fichier */}
            {file && (
              <div className="flex items-center gap-2 mt-2 px-1">
                {previewIsVideo ? (
                  <Film className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                ) : (
                  <ImageIcon className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                )}
                <span className="text-xs text-white/60 truncate flex-1">{file.name}</span>
                <span className="text-xs text-white/40 shrink-0">
                  {formatSize(file.size)}
                </span>
              </div>
            )}
          </div>
        ) : (
          /* ─── Etat vide ─── */
          <div className="flex flex-col items-center gap-3 py-6 px-4">
            <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/8 flex items-center justify-center">
              <Upload className="h-5 w-5 text-white/40" />
            </div>
            <div className="text-center">
              <p className="text-sm text-white/60 font-medium">
                Glissez une image ou cliquez ici
              </p>
              <p className="text-xs text-white/30 mt-1">
                {accept === "image" && ".webp .jpg .png"}
                {accept === "video" && ".mp4 .webm"}
                {accept === "both" && ".webp .jpg .png .mp4 .webm"}
                {" — max "}
                {maxSizeMb} Mo
              </p>
            </div>

            {/* Apercu du media actuel */}
            {currentUrl && (
              <div className="relative w-16 h-10 rounded overflow-hidden border border-white/10 mt-1">
                <Image
                  src={currentUrl}
                  alt="Actuel"
                  fill
                  className="object-cover opacity-50"
                  unoptimized
                  onError={() => {
                    // Silently fail for current preview
                  }}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* ─── CHAMP POUR COLLER URL ─── */}
      {accept === "image" && (
        <div className="space-y-2 p-3 rounded-lg bg-white/[0.02] border border-white/5">
          <label className="text-xs text-white/60 flex items-center gap-2">
            <Copy className="h-3.5 w-3.5" />
            Ou coller une URL d&apos;image
          </label>
          <div className="flex gap-2">
            <Input
              value={pastedUrl}
              onChange={(e) => {
                setPastedUrl(e.target.value)
                setPastedError(null)
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") handlePasteUrl()
              }}
              placeholder="https://... ou data:image/webp;base64,..."
              className="bg-black/30 border-white/10 text-white text-xs placeholder:text-white/20 flex-1"
            />
            <Button
              size="sm"
              onClick={handlePasteUrl}
              disabled={!pastedUrl.trim() || uploading}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs h-9 px-3"
            >
              {uploading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                "Valider"
              )}
            </Button>
          </div>
          {pastedError && (
            <div className="flex items-center gap-2 text-xs text-red-400 px-1">
              <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
              <span>{pastedError}</span>
            </div>
          )}
        </div>
      )}

      {/* ─── ALERTE VIDEO BUNNY ─── */}
      {accept !== "image" && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-500/5 border border-blue-500/20 text-xs">
          <AlertCircle className="h-3.5 w-3.5 text-blue-400 shrink-0 mt-0.5" />
          <span className="text-blue-300">
            Les vidéos nécessitent Bunny.net pour être utilisées en production.
            Configurez d&apos;abord les clés Bunny dans votre environnement Render.
          </span>
        </div>
      )}

      {/* ─── Erreur drag & drop ─── */}
      {error && (
        <div className="flex items-center gap-2 text-xs text-red-400 px-1">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ─── Succes ─── */}
      {uploaded && !error && (
        <div className="flex items-center gap-2 text-xs text-emerald-400 px-1">
          <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
          <span>Image enregistrée avec succès (stockée côté client)</span>
        </div>
      )}

      {/* ─── Boutons confirmer / annuler ─── */}
      {preview && !uploaded && (
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={handleConfirm}
            disabled={uploading}
            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs h-8"
          >
            {uploading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                Conversion…
              </>
            ) : (
              <>
                <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
                Confirmer
              </>
            )}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation()
              handleCancel()
            }}
            disabled={uploading}
            className="text-white/50 hover:text-white text-xs h-8"
          >
            <X className="h-3.5 w-3.5 mr-1" />
            Annuler
          </Button>
        </div>
      )}

      {/* Bouton re-upload apres succes */}
      {uploaded && (
        <Button
          size="sm"
          variant="ghost"
          onClick={(e) => {
            e.stopPropagation()
            handleCancel()
          }}
          className="text-white/40 hover:text-white text-xs h-7"
        >
          Remplacer par une autre image
        </Button>
      )}
    </div>
  )
}
