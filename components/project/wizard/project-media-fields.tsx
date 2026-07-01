"use client"

import { Check, Upload } from "lucide-react"
import type { ProjectDepositDraft } from "@/lib/projects/project-deposit"

type Props = {
  draft: ProjectDepositDraft
  setDraft: (draft: ProjectDepositDraft) => void
}

export function ProjectMediaFields({ draft, setDraft }: Props) {
  const handleFile = (
    file: File | null,
    field: "fullContentUrl" | "excerptUrl" | "thumbnailUrl"
  ) => {
    if (!file) return

    const localValue = `local:${file.name}`

    setDraft({
      ...draft,
      [field]: localValue,
    })
  }

  const mediaInputs = [
    {
      field: "fullContentUrl" as const,
      title: "Contenu complet",
      description: "Le contenu qui sera débloqué après participation.",
      accept: "video/*,audio/*,.pdf,.epub,.docx,.odt,.rtf,.txt",
      value: draft.fullContentUrl,
    },
    {
      field: "excerptUrl" as const,
      title: "Extrait gratuit",
      description: "L’aperçu accessible avant participation.",
      accept: "video/*,audio/*,.pdf,.epub,.jpg,.png,.webp",
      value: draft.excerptUrl,
    },
    {
      field: "thumbnailUrl" as const,
      title: "Miniature / couverture",
      description: "Image visible sur la fiche publique du projet.",
      accept: "image/*",
      value: draft.thumbnailUrl,
    },
  ]

  return (
    <div className="space-y-4">
      {mediaInputs.map((item) => (
        <div
          key={item.field}
          className="rounded-2xl border border-white/10 bg-slate-800/40 p-5"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <h4 className="font-semibold text-white">{item.title}</h4>
              <p className="text-sm text-white/45">{item.description}</p>
              {item.value && (
                <p className="mt-2 text-sm text-emerald-300">
                  Fichier sélectionné : {item.value.replace("local:", "")}
                </p>
              )}
            </div>

            <label className="cursor-pointer rounded-xl border border-white/15 px-4 py-2 text-sm text-white/70 hover:bg-white/10">
              <input
                type="file"
                accept={item.accept}
                className="hidden"
                onChange={(e) => handleFile(e.target.files?.[0] ?? null, item.field)}
              />
              <span className="flex items-center gap-2">
                {item.value ? (
                  <Check className="h-4 w-4 text-emerald-400" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
                Choisir
              </span>
            </label>
          </div>
        </div>
      ))}
    </div>
  )
}