/**
 * VIXUAL V1-001 — New Project Page
 *
 * Page to create a new project
 */

import ProjectSubmissionForm from "@/components/v1/project-submission-form"

export default function NewProjectPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <ProjectSubmissionForm />
    </div>
  )
}
