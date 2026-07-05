/**
 * VIXUAL V1-001 — Edit Project Page
 */

import { ProjectSubmissionForm } from "@/components/v1/project-submission-form"

export default function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <p className="text-white/60 mb-4">
          Chargement du projet... (à compléter avec fetch réel)
        </p>
        <ProjectSubmissionForm isEditing={true} />
      </div>
    </div>
  )
}
