/**
 * VIXUAL V1-001 — Project Submission Form (Client)
 *
 * Wizard-style form for PORTEUR to create/edit projects
 * Handles: basic info, media upload, preview, submission
 */

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import {
  buildProjectProgress,
  getProjectProgressPercent,
  isProjectReadyForSubmission,
  type ProjectV1,
} from "@/lib/projects/v1-project"
import { Upload, Save, CheckCircle, AlertCircle, Film, FileText } from "lucide-react"

interface ProjectFormProps {
  initialProject?: Partial<ProjectV1>
  isEditing?: boolean
}

export default function ProjectSubmissionForm({ initialProject, isEditing = false }: ProjectFormProps) {
  const router = useRouter()
  const { toast } = useToast()

  const [formData, setFormData] = useState<Partial<ProjectV1>>(
    initialProject || {
      title: "",
      description: "",
      category: "",
      subCategory: "",
      participationPrice: 0,
      status: "draft",
    }
  )

  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<"info" | "media" | "review">("info")
  // Persists the ID of a newly created project so subsequent saves/submits work correctly
  const [savedProjectId, setSavedProjectId] = useState<string | undefined>(undefined)

  const progress = buildProjectProgress(formData)
  const progressPercent = getProjectProgressPercent(formData)
  const isReady = isProjectReadyForSubmission(formData)

  // ────────────────────────────────────────────────────────────────────────────
  // HANDLERS
  // ────────────────────────────────────────────────────────────────────────────

  const handleInputChange = (field: keyof ProjectV1, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleMediaUpload = async (mediaType: "coverImage" | "excerptMedia" | "fullMedia", file: File) => {
    try {
      const reader = new FileReader()
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string
        handleInputChange(mediaType, dataUrl)
        toast({ title: "Média chargé", description: `${mediaType} prêt` })
      }
      reader.readAsDataURL(file)
    } catch (error) {
      toast({ title: "Erreur", description: "Échec du chargement", variant: "destructive" })
    }
  }

  const handleSaveDraft = async () => {
    setIsLoading(true)
    try {
      // Resolve the current project ID: provided via props or persisted after first save
      const currentId = initialProject?.id || savedProjectId
      const isUpdate = isEditing || !!currentId

      if (isUpdate && !currentId) {
        // Should not happen, but guard against undefined URL
        toast({ title: "Erreur", description: "Identifiant du projet manquant", variant: "destructive" })
        return
      }

      const url = isUpdate ? `/api/v1/projects/${currentId}` : "/api/v1/projects"
      const method = isUpdate ? "PUT" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      let result: any = {}
      try {
        result = await res.json()
      } catch {
        // Ignore JSON parse errors; rely on res.ok below
      }

      if (!res.ok) {
        const errMsg = result?.error || result?.message || "Impossible de sauvegarder"
        throw new Error(errMsg)
      }

      toast({ title: "✓ Brouillon sauvegardé" })

      if (!isUpdate && result?.data?.id) {
        // Persist the new project ID for subsequent saves/submits
        setSavedProjectId(result.data.id)
        router.push(`/dashboard/v1-projects/${result.data.id}/edit`)
      }
    } catch (error: any) {
      toast({ title: "Erreur", description: error?.message || "Impossible de sauvegarder", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmitForReview = async () => {
    if (!isReady) {
      toast({ title: "Projet incomplet", description: "Remplissez tous les champs requis", variant: "destructive" })
      return
    }

    // Resolve the project ID; must have been saved at least once
    const currentId = initialProject?.id || savedProjectId
    if (!currentId) {
      toast({ title: "Erreur", description: "Enregistrez d'abord le projet avant de le soumettre", variant: "destructive" })
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch(`/api/v1/projects/${currentId}/submit`, {
        method: "POST",
      })

      let result: any = {}
      try {
        result = await res.json()
      } catch {
        // Ignore JSON parse errors
      }

      if (!res.ok) {
        const errMsg = result?.error || result?.message || "Impossible de soumettre"
        throw new Error(errMsg)
      }

      toast({ title: "✓ Projet soumis pour validation", description: "Un admin le validera bientôt" })
      router.push("/dashboard/v1-projects")
    } catch (error: any) {
      toast({ title: "Erreur", description: error?.message || "Impossible de soumettre", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  // ────────────────────────────────────────────────────────────────────────────
  // RENDER
  // ────────────────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">
          {isEditing ? "Modifier le projet" : "Déposer un nouveau projet"}
        </h1>
        <p className="text-white/60">
          {isEditing
            ? "Complétez et soumettez votre projet pour validation"
            : "Créez votre projet porteur V1 en quelques étapes"}
        </p>
      </div>

      {/* Progress */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Progression: {progressPercent}%</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Progress value={progressPercent} className="h-2" />
          <div className="grid grid-cols-5 gap-2">
            {progress.map((step) => (
              <div
                key={step.id}
                className={`p-2 rounded text-xs text-center ${
                  step.completed ? "bg-green-500/20 text-green-400" : "bg-slate-700 text-white/60"
                }`}
              >
                {step.label}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-700">
        {["info", "media", "review"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-4 py-2 border-b-2 transition ${
              activeTab === tab
                ? "border-purple-500 text-white"
                : "border-transparent text-white/60 hover:text-white"
            }`}
          >
            {tab === "info" && "Infos"}
            {tab === "media" && "Médias"}
            {tab === "review" && "Aperçu"}
          </button>
        ))}
      </div>

      {/* TAB 1: INFO */}
      {activeTab === "info" && (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Informations du projet</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-white text-sm mb-2">Titre *</label>
              <Input
                value={formData.title || ""}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="Ex: Mon documentaire"
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-white text-sm mb-2">Description *</label>
              <Textarea
                value={formData.description || ""}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Décrivez votre projet"
                className="bg-slate-700 border-slate-600 text-white min-h-[120px]"
              />
            </div>

            {/* Category */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-white text-sm mb-2">Catégorie *</label>
                <select
                  value={formData.category || ""}
                  onChange={(e) => handleInputChange("category", e.target.value)}
                  className="w-full bg-slate-700 border-slate-600 text-white rounded px-3 py-2"
                >
                  <option value="">Sélectionner...</option>
                  <option value="film">Film</option>
                  <option value="documentaire">Documentaire</option>
                  <option value="serie">Série</option>
                  <option value="podcast">Podcast</option>
                </select>
              </div>

              <div>
                <label className="block text-white text-sm mb-2">Prix de participation (EUR) *</label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.participationPrice || 0}
                  onChange={(e) => handleInputChange("participationPrice", parseFloat(e.target.value))}
                  placeholder="5.00"
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* TAB 2: MEDIA */}
      {activeTab === "media" && (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Médias du projet</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Cover Image */}
            <div>
              <label className="block text-white text-sm mb-2">Image de couverture *</label>
              <div className="border-2 border-dashed border-slate-600 rounded p-4 text-center hover:border-purple-500 cursor-pointer transition">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && handleMediaUpload("coverImage", e.target.files[0])}
                  className="hidden"
                  id="cover-input"
                />
                <label htmlFor="cover-input" className="cursor-pointer">
                  <Upload className="w-6 h-6 mx-auto mb-2 text-white/60" />
                  <p className="text-white/60">Cliquez ou glissez une image</p>
                </label>
              </div>
            </div>

            {/* Excerpt Media */}
            <div>
              <label className="block text-white text-sm mb-2">Extrait / aperçu *</label>
              <div className="border-2 border-dashed border-slate-600 rounded p-4 text-center">
                <input
                  type="file"
                  accept="video/*,audio/*,image/*"
                  onChange={(e) => e.target.files?.[0] && handleMediaUpload("excerptMedia", e.target.files[0])}
                  className="hidden"
                  id="excerpt-input"
                />
                <label htmlFor="excerpt-input" className="cursor-pointer">
                  <Upload className="w-6 h-6 mx-auto mb-2 text-white/60" />
                  <p className="text-white/60">Média d'aperçu (vidéo, audio, image)</p>
                </label>
              </div>
            </div>

            {/* Full Media */}
            <div>
              <label className="block text-white text-sm mb-2">Contenu complet *</label>
              <div className="border-2 border-dashed border-slate-600 rounded p-4 text-center">
                <input
                  type="file"
                  accept="video/*,audio/*"
                  onChange={(e) => e.target.files?.[0] && handleMediaUpload("fullMedia", e.target.files[0])}
                  className="hidden"
                  id="full-input"
                />
                <label htmlFor="full-input" className="cursor-pointer">
                  <Upload className="w-6 h-6 mx-auto mb-2 text-white/60" />
                  <p className="text-white/60">Contenu principal (vidéo ou audio)</p>
                </label>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* TAB 3: REVIEW */}
      {activeTab === "review" && (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Aperçu du projet</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-slate-700 p-4 rounded">
              <h3 className="text-white font-bold text-lg">{formData.title}</h3>
              <p className="text-white/60 text-sm mt-2">{formData.description}</p>
              <div className="flex gap-2 mt-3">
                <Badge>{formData.category}</Badge>
                <Badge variant="secondary">{formData.participationPrice}€</Badge>
              </div>
            </div>

            {!isReady && (
              <div className="bg-yellow-500/20 border border-yellow-500 rounded p-3 flex gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-yellow-200">
                  <p className="font-semibold">Projet incomplet</p>
                  <p>Complétez toutes les étapes avant de soumettre</p>
                </div>
              </div>
            )}

            {isReady && (
              <div className="bg-green-500/20 border border-green-500 rounded p-3 flex gap-2">
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-green-200">
                  <p className="font-semibold">Projet complet</p>
                  <p>Prêt à être soumis pour validation</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex gap-3 justify-between">
        <Button
          onClick={handleSaveDraft}
          disabled={isLoading}
          variant="outline"
          className="border-white/20"
        >
          <Save className="w-4 h-4 mr-2" />
          Enregistrer en brouillon
        </Button>

        <Button
          onClick={handleSubmitForReview}
          disabled={isLoading || !isReady}
          className="bg-purple-600 hover:bg-purple-700"
        >
          <CheckCircle className="w-4 h-4 mr-2" />
          Soumettre pour validation
        </Button>
      </div>
    </div>
  )
}
