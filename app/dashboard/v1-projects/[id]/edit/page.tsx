/**
 * VIXUAL V1-001 — Edit Project Page
 */

"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import ProjectSubmissionForm from "@/components/v1/project-submission-form"
import type { ProjectV1 } from "@/lib/projects/v1-project"

export default function EditProjectPage() {
  const params = useParams()
  const projectId = params.id as string
  const { toast } = useToast()

  const [project, setProject] = useState<ProjectV1 | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await fetch(`/api/v1/projects/${projectId}`)
        if (res.status === 401) {
          toast({ title: "Non connecté", description: "Veuillez vous reconnecter", variant: "destructive" })
          return
        }
        if (res.status === 403) {
          toast({ title: "Accès refusé", description: "Vous n'avez pas les droits pour éditer ce projet", variant: "destructive" })
          return
        }
        if (!res.ok) throw new Error("Fetch failed")
        const result = await res.json()
        setProject(result.data)
      } catch (error) {
        console.error("[EditProjectPage] failed to load project:", error)
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
        <p className="text-white/60">Chargement du projet...</p>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-slate-950 text-white p-6">
        <p className="text-white/60">Projet introuvable.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <ProjectSubmissionForm initialProject={project} isEditing={true} />
      </div>
    </div>
  )
}
