"use client"

import { useState } from "react"
import { ProjectDepositProgress } from "@/components/project/project-deposit-progress"
import {
  PROJECT_SUPPORT_AMOUNTS,
  type ProjectDepositDraft,
  type ProjectTechType,
} from "@/lib/projects/project-deposit"

const PROJECT_TYPES: {
  id: ProjectTechType
  label: string
  description: string
  categories: string[]
}[] = [
  {
    id: "video",
    label: "Vidéo",
    description: "Films, clips, documentaires, séries",
    categories: ["Film", "Clip / Vidéo", "Documentaire", "Série"],
  },
  {
    id: "audio",
    label: "Audio",
    description: "Podcasts, Voix de l’Info",
    categories: ["Podcast", "Voix de l’Info"],
  },
  {
    id: "publication",
    label: "Publication",
    description: "Livres, documents, EPUB, PDF",
    categories: ["Livre", "Publication"],
  },
  {
    id: "culture",
    label: "Savoir & Culture",
    description: "Contenus pédagogiques, culturels ou documentaires",
    categories: ["Savoir & Culture"],
  },
]

export function ProjectDepositWizard() {
  const [draft, setDraft] = useState<ProjectDepositDraft>({
    techType: "video",
    supportAmounts: [],
  })

  const selectedType = PROJECT_TYPES.find((type) => type.id === draft.techType)

  const toggleAmount = (amount: number) => {
    const current = draft.supportAmounts ?? []
    setDraft({
      ...draft,
      supportAmounts: current.includes(amount)
        ? current.filter((a) => a !== amount)
        : [...current, amount],
    })
  }

  return (
    <div className="space-y-6">
      <ProjectDepositProgress draft={draft} />

      <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 space-y-6">
        <div>
          <p className="text-emerald-400 text-sm font-medium mb-2">Étape 1</p>
          <h2 className="text-2xl font-bold text-white">Créer un projet VIXUAL</h2>
          <p className="text-white/50 text-sm mt-1">
            Choisissez le type de projet, complétez les informations, puis préparez votre publication.
          </p>
        </div>

        <div>
          <p className="text-white font-medium mb-3">Type de projet</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {PROJECT_TYPES.map((type) => (
              <button
                key={type.id}
                type="button"
                onClick={() =>
                  setDraft({
                    ...draft,
                    techType: type.id,
                    category: "",
                  })
                }
                className={`rounded-2xl border p-4 text-left transition ${
                  draft.techType === type.id
                    ? "border-emerald-400 bg-emerald-500/15"
                    : "border-white/10 bg-slate-800/40 hover:border-white/30"
                }`}
              >
                <p className="text-white font-semibold">{type.label}</p>
                <p className="text-white/45 text-sm mt-1">{type.description}</p>
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-white font-medium mb-3">Catégorie</p>
          <div className="flex flex-wrap gap-3">
            {selectedType?.categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setDraft({ ...draft, category })}
                className={`rounded-xl px-4 py-2 border ${
                  draft.category === category
                    ? "border-sky-400 bg-sky-500/20 text-sky-300"
                    : "border-white/20 text-white/60"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <input
          className="w-full rounded bg-slate-800 p-3 text-white"
          placeholder="Titre du projet"
          onChange={(e) => setDraft({ ...draft, title: e.target.value })}
        />

        <input
          className="w-full rounded bg-slate-800 p-3 text-white"
          placeholder="Description courte"
          onChange={(e) => setDraft({ ...draft, shortDescription: e.target.value })}
        />

        <textarea
          className="w-full rounded bg-slate-800 p-3 text-white min-h-28"
          placeholder="Description complète"
          onChange={(e) => setDraft({ ...draft, longDescription: e.target.value })}
        />

        <div>
          <p className="text-white font-medium mb-3">Montants proposés</p>
          <div className="flex flex-wrap gap-3">
            {PROJECT_SUPPORT_AMOUNTS.map((amount) => (
              <button
                key={amount}
                type="button"
                onClick={() => toggleAmount(amount)}
                className={`rounded-xl px-4 py-2 border ${
                  draft.supportAmounts?.includes(amount)
                    ? "border-emerald-400 bg-emerald-500/20 text-emerald-300"
                    : "border-white/20 text-white/60"
                }`}
              >
                {amount} €
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}