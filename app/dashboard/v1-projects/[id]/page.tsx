/**
 * VIXUAL V1-001 — Project Detail Page
 */

"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { PROJECT_STATUS_LABELS } from "@/lib/projects/v1-project"
import type { ProjectV1 } from "@/lib/projects/v1-project"
import { ArrowLeft, Play } from "lucide-react"
import Link from "next/link"

export default function ProjectDetailPage() {
  const params = useParams()
  const projectId = params.id as string
  const { toast } = useToast()

  const [project, setProject] = useState<ProjectV1 | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await fetch(`/api/v1/projects/${projectId}`)
        if (!res.ok) throw new Error("Fetch failed")

        const result = await res.json()
        setProject(result.data)
      } catch (error) {
        toast({ title: "Erreur", description: "Impossible de charger le projet", variant: "destructive" })
      } finally {
        setLoading(false)
      }
    }

    if (projectId) {
      fetchProject()
    }
  }, [projectId, toast])

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white p-6">
        <p>Chargement...</p>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-slate-950 text-white p-6">
        <p>Projet non trouvé</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Back Button */}
        <Link href="/dashboard/v1-projects">
          <Button variant="ghost" className="text-white/60 hover:text-white">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
        </Link>

        {/* Title & Status */}
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h1 className="text-3xl font-bold">{project.title}</h1>
            <Badge className="bg-purple-500/20 text-purple-300">
              {PROJECT_STATUS_LABELS[project.status]}
            </Badge>
          </div>
          <p className="text-white/60">{project.description}</p>
        </div>

        {/* Cover Image */}
        {project.coverImage && (
          <Card className="bg-slate-800/50 border-slate-700 overflow-hidden">
            <div className="aspect-video bg-slate-700">
              <img
                src={project.coverImage}
                alt={project.title}
                className="w-full h-full object-cover"
              />
            </div>
          </Card>
        )}

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-sm text-white/60">Catégorie</CardTitle>
            </CardHeader>
            <CardContent className="text-white font-semibold">{project.category}</CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-sm text-white/60">Prix de participation</CardTitle>
            </CardHeader>
            <CardContent className="text-white font-semibold">{project.participationPrice}€</CardContent>
          </Card>
        </div>

        {/* Media Preview */}
        <div className="grid grid-cols-2 gap-4">
          {project.excerptMedia && (
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-sm text-white/60">Aperçu / Extrait</CardTitle>
              </CardHeader>
              <CardContent className="aspect-video bg-slate-700 flex items-center justify-center">
                {project.excerptMedia.startsWith("data:image") ? (
                  <img src={project.excerptMedia} alt="Excerpt" className="w-full h-full object-cover" />
                ) : (
                  <Play className="w-8 h-8 text-white/40" />
                )}
              </CardContent>
            </Card>
          )}

          {project.fullMedia && (
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-sm text-white/60">Contenu complet</CardTitle>
              </CardHeader>
              <CardContent className="aspect-video bg-slate-700 flex items-center justify-center">
                <Play className="w-8 h-8 text-white/40" />
              </CardContent>
            </Card>
          )}
        </div>

        {/* Moderation Note */}
        {project.moderationNote && project.status === "rejected" && (
          <Card className="bg-red-500/10 border-red-500/30">
            <CardHeader>
              <CardTitle className="text-red-200">Motif du refus</CardTitle>
            </CardHeader>
            <CardContent className="text-red-100">{project.moderationNote}</CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
