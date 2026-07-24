"use client"

/**
 * VIXUAL V1-001 — Edit Project Page
 */

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import ProjectSubmissionForm from "@/components/v1/project-submission-form"
import type { ProjectV1 } from "@/lib/projects/v1-project"

export default function EditProjectPage() {
  const params = useParams<{ id: string }>()
  const projectId = params?.id

  const [project, setProject] = useState<ProjectV1 | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!projectId) {
      setLoading(false)
      return
    }

    const controller = new AbortController()

    async function fetchProject() {
      try {
        const res = await fetch(`/api/v1/projects/${projectId}`, {
          method: "GET",
          signal: controller.signal,
        })

        let result: any = null
        try {
          result = await res.json()
        } catch {
          result = null
        }

        if (!res.ok) {
          throw new Error(result?.message || result?.error || "Projet introuvable")
        }

        if (!result?.data) {
          throw new Error("Projet introuvable")
        }

        setProject(result.data)
      } catch (error) {
        if ((error as Error).name === "AbortError") return
        setProject(null)
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    fetchProject()

    return () => {
      controller.abort()
    }
  }, [projectId])

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white p-6">
        <div className="max-w-4xl mx-auto">
          <p className="text-white/60 mb-4">Chargement du projet...</p>
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-slate-950 text-white p-6">
        <div className="max-w-4xl mx-auto space-y-4">
          <p className="text-white/60">Projet introuvable</p>
          <Link href="/dashboard/v1-projects" className="text-purple-400 hover:text-purple-300 underline">
            Retour à mes projets
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <ProjectSubmissionForm isEditing={true} initialProject={project} />
      </div>
    </div>
  )
}
