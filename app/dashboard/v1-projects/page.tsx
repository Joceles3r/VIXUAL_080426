/**
 * VIXUAL V1-001 — Porteur Dashboard
 *
 * Dashboard "Mes projets" for PORTEUR role
 * List projects with status, actions (edit/preview/submit/delete)
 */

"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/auth-context"
import { PROJECT_STATUS_LABELS } from "@/lib/projects/v1-project"
import type { ProjectV1, ProjectStatus } from "@/lib/projects/v1-project"
import {
  Film,
  Plus,
  Edit,
  Eye,
  SendHorizontal,
  Trash2,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react"

const STATUS_COLORS: Record<ProjectStatus, string> = {
  draft: "bg-slate-500/20 text-slate-300",
  ready: "bg-blue-500/20 text-blue-300",
  pending: "bg-yellow-500/20 text-yellow-300",
  published: "bg-green-500/20 text-green-300",
  rejected: "bg-red-500/20 text-red-300",
}

const STATUS_ICONS: Record<ProjectStatus, any> = {
  draft: Clock,
  ready: CheckCircle,
  pending: AlertCircle,
  published: CheckCircle,
  rejected: AlertCircle,
}

export default function PorteurDashboard() {
  const router = useRouter()
  const { toast } = useToast()
  const { user, isAuthed } = useAuth()

  const [projects, setProjects] = useState<ProjectV1[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [submittingProjectId, setSubmittingProjectId] = useState<string | null>(null)

  useEffect(() => {
    if (!isAuthed || !user) {
      router.push("/auth/login")
      return
    }

    fetchProjects()
  }, [isAuthed, user, router])

  const fetchProjects = async () => {
    try {
      const res = await fetch("/api/v1/projects?limit=50")
      if (!res.ok) throw new Error("Fetch failed")

      const result = await res.json()
      setProjects(result.data || [])
    } catch (error) {
      toast({ title: "Erreur", description: "Impossible de charger vos projets", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitProject = async (projectId: string) => {
    if (!projectId?.trim()) {
      toast({ title: "Erreur", description: "Identifiant projet invalide", variant: "destructive" })
      return
    }

    setSubmittingProjectId(projectId)
    try {
      const res = await fetch(`/api/v1/projects/${projectId}/submit`, { method: "POST" })
      let result: any = null
      try {
        result = await res.json()
      } catch {
        result = null
      }

      if (!res.ok) {
        const message = result?.message || result?.error || "Impossible de soumettre le projet"
        throw new Error(message)
      }

      setProjects((prev) =>
        prev.map((project) =>
          project.id === projectId
            ? {
                ...project,
                ...(result?.data || {}),
                status: (result?.data?.status || "pending") as ProjectStatus,
              }
            : project
        )
      )

      toast({ title: "✓ Projet soumis", description: result?.message || "Le projet est en attente de validation" })
    } catch (error) {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Impossible de soumettre le projet",
        variant: "destructive",
      })
    } finally {
      setSubmittingProjectId(null)
    }
  }

  const handleDelete = async (projectId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce projet ?")) return

    setDeleting(projectId)
    try {
      const res = await fetch(`/api/v1/projects/${projectId}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Delete failed")

      setProjects((prev) => prev.filter((p) => p.id !== projectId))
      toast({ title: "✓ Projet supprimé" })
    } catch (error) {
      toast({ title: "Erreur", description: "Impossible de supprimer", variant: "destructive" })
    } finally {
      setDeleting(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white p-6">
        <p>Chargement...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Mes projets</h1>
            <p className="text-white/60">Gérez vos projets de création V1</p>
          </div>
          <Link href="/dashboard/v1-projects/new">
            <Button className="bg-purple-600 hover:bg-purple-700">
              <Plus className="w-4 h-4 mr-2" />
              Créer un projet
            </Button>
          </Link>
        </div>

        {projects.length === 0 && (
          <Card className="bg-slate-800/50 border-slate-700 text-center py-12">
            <Film className="w-12 h-12 mx-auto text-white/40 mb-3" />
            <h3 className="text-white font-semibold">Aucun projet</h3>
            <p className="text-white/60">Créez votre premier projet pour commencer</p>
          </Card>
        )}

        <div className="grid grid-cols-1 gap-4">
          {projects.map((project) => {
            const StatusIcon = STATUS_ICONS[project.status]
            const canEdit = ["draft", "ready", "rejected"].includes(project.status)
            const canSubmit = ["draft", "ready", "rejected"].includes(project.status)

            return (
              <Card key={project.id} className="bg-slate-800/50 border-slate-700 overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex gap-4 p-4">
                    {project.coverImage && (
                      <div className="w-24 h-24 rounded flex-shrink-0 bg-slate-700 overflow-hidden">
                        <img
                          src={project.coverImage}
                          alt={project.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="text-white font-semibold truncate">{project.title}</h3>
                        <Badge className={STATUS_COLORS[project.status]}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {PROJECT_STATUS_LABELS[project.status]}
                        </Badge>
                      </div>

                      <p className="text-white/60 text-sm truncate mb-2">{project.description}</p>

                      <div className="flex gap-2 text-xs text-white/40">
                        <span>{project.category}</span>
                        <span>•</span>
                        <span>{project.participationPrice}€</span>
                        <span>•</span>
                        <span>
                          {new Date(project.updatedAt).toLocaleDateString("fr-FR")}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2 flex-shrink-0">
                      {canEdit && (
                        <Link href={`/dashboard/v1-projects/${project.id}/edit`}>
                          <Button size="sm" variant="ghost">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </Link>
                      )}

                      <Link href={`/dashboard/v1-projects/${project.id}`}>
                        <Button size="sm" variant="ghost">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </Link>

                      {canSubmit && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleSubmitProject(project.id)}
                          disabled={submittingProjectId === project.id}
                        >
                          <SendHorizontal className="w-4 h-4" />
                        </Button>
                      )}

                      {canEdit && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(project.id)}
                          disabled={deleting === project.id}
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {project.moderationNote && project.status === "rejected" && (
                    <div className="bg-red-500/10 border-t border-red-500/20 p-3 text-sm text-red-200">
                      <p className="font-semibold">Motif du refus:</p>
                      <p>{project.moderationNote}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
