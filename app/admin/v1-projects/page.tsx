/**
 * VIXUAL V1-001 — Admin Moderation Dashboard
 *
 * Admin page to validate/reject pending projects
 */

"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import type { ProjectV1 } from "@/lib/projects/v1-project"
import { CheckCircle, XCircle } from "lucide-react"

export default function AdminModerationPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [projects, setProjects] = useState<ProjectV1[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState("")
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    fetchPendingProjects()
  }, [])

  const fetchPendingProjects = async () => {
    try {
      // Note: This endpoint needs to be implemented on the API side
      const res = await fetch("/api/v1/projects?status=pending")
      if (!res.ok) throw new Error("Fetch failed")

      const result = await res.json()
      setProjects(result.data || [])
    } catch (error) {
      toast({ title: "Erreur", description: "Impossible de charger les projets", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (projectId: string) => {
    setProcessing(true)
    try {
      const res = await fetch(`/api/v1/projects/${projectId}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ moderationNote: "" }),
      })

      if (!res.ok) throw new Error("Approve failed")

      setProjects((prev) => prev.filter((p) => p.id !== projectId))
      toast({ title: "✓ Projet approuvé et publié" })
    } catch (error) {
      toast({ title: "Erreur", description: "Impossible d'approuver", variant: "destructive" })
    } finally {
      setProcessing(false)
    }
  }

  const handleReject = async (projectId: string) => {
    if (!rejectReason.trim()) {
      toast({ title: "Erreur", description: "Veuillez fournir un motif", variant: "destructive" })
      return
    }

    setProcessing(true)
    try {
      const res = await fetch(`/api/v1/projects/${projectId}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: rejectReason }),
      })

      if (!res.ok) throw new Error("Reject failed")

      setProjects((prev) => prev.filter((p) => p.id !== projectId))
      setRejectReason("")
      setSelectedProjectId(null)
      toast({ title: "✓ Projet rejeté" })
    } catch (error) {
      toast({ title: "Erreur", description: "Impossible de rejeter", variant: "destructive" })
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return <div className="min-h-screen bg-slate-950 text-white p-6">Chargement...</div>
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Validation des projets</h1>
          <p className="text-white/60">{projects.length} projet(s) en attente</p>
        </div>

        {projects.length === 0 && (
          <Card className="bg-slate-800/50 border-slate-700 text-center py-8">
            <p className="text-white/60">Aucun projet en attente de validation</p>
          </Card>
        )}

        <div className="grid grid-cols-1 gap-4">
          {projects.map((project) => (
            <Card key={project.id} className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-4">
                <div className="flex gap-4 justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-white font-semibold text-lg">{project.title}</h3>
                    <p className="text-white/60 text-sm mt-1">{project.description}</p>
                    <div className="flex gap-2 mt-2 text-xs text-white/40">
                      <span>{project.category}</span>
                      <span>•</span>
                      <span>{project.participationPrice}€</span>
                    </div>
                  </div>

                  <div className="flex gap-2 flex-shrink-0">
                    <Button
                      onClick={() => handleApprove(project.id)}
                      disabled={processing}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Approuver
                    </Button>

                    <Button
                      onClick={() => setSelectedProjectId(project.id)}
                      variant="outline"
                      className="border-red-500 text-red-400 hover:bg-red-500/10"
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      Rejeter
                    </Button>
                  </div>
                </div>

                {/* Reject Form */}
                {selectedProjectId === project.id && (
                  <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded space-y-2">
                    <label className="block text-sm text-red-200">Motif du refus</label>
                    <Textarea
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      placeholder="Expliquez pourquoi ce projet est refusé..."
                      className="bg-slate-700 border-slate-600 text-white text-sm"
                    />
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleReject(project.id)}
                        disabled={processing}
                        size="sm"
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Confirmer le refus
                      </Button>
                      <Button
                        onClick={() => {
                          setSelectedProjectId(null)
                          setRejectReason("")
                        }}
                        size="sm"
                        variant="outline"
                      >
                        Annuler
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
