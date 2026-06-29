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
    description: "Livres et documents numériques",
    categories: ["Livre", "Publication"],
  },
  {
    id: "culture",
    label: "Savoir & Culture",
    description: "Contenus pédagogiques, culturels ou documentaires",
    categories: ["Savoir & Culture"],
  },
]

const STEPS = [
  "Informations",
  "Paramètres",
  "Médias",
  "Participation",
  "Prévisualisation",
  "Validation",
]

export function ProjectDepositWizard() {
  const [currentStep, setCurrentStep] = useState(0)
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

  const nextStep = () => setCurrentStep((step) => Math.min(step + 1, STEPS.length - 1))
  const previousStep = () => setCurrentStep((step) => Math.max(step - 1, 0))

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
        <div className="flex flex-wrap gap-3 text-sm">
          {STEPS.map((step, index) => (
            <button
              key={step}
              type="button"
              onClick={() => setCurrentStep(index)}
              className={`rounded-full px-4 py-2 border ${
                index === currentStep
                  ? "border-emerald-400 bg-emerald-500/20 text-emerald-300"
                  : index < currentStep
                    ? "border-sky-400/50 bg-sky-500/10 text-sky-300"
                    : "border-white/10 text-white/40"
              }`}
            >
              {index + 1}. {step}
            </button>
          ))}
        </div>
      </div>

      <ProjectDepositProgress draft={draft} />

      <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 space-y-6">
        {currentStep === 0 && (
          <div className="space-y-6">
            <div>
              <p className="text-emerald-400 text-sm font-medium mb-2">Étape 1</p>
              <h2 className="text-2xl font-bold text-white">Informations générales</h2>
              <p className="text-white/50 text-sm mt-1">
                Définissez la nature du projet et ses informations principales.
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
              value={draft.title ?? ""}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
            />

            <input
              className="w-full rounded bg-slate-800 p-3 text-white"
              placeholder="Description courte"
              value={draft.shortDescription ?? ""}
              onChange={(e) => setDraft({ ...draft, shortDescription: e.target.value })}
            />

            <textarea
              className="w-full rounded bg-slate-800 p-3 text-white min-h-28"
              placeholder="Description complète"
              value={draft.longDescription ?? ""}
              onChange={(e) => setDraft({ ...draft, longDescription: e.target.value })}
            />
          </div>
        )}

        {currentStep === 1 && (
          <div className="space-y-6">
            <div>
              <p className="text-emerald-400 text-sm font-medium mb-2">Étape 2</p>
              <h2 className="text-2xl font-bold text-white">Paramètres de publication</h2>
              <p className="text-white/50 text-sm mt-1">
                Ajoutez les métadonnées utiles à la présentation et au classement.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                className="w-full rounded bg-slate-800 p-3 text-white"
                placeholder="Langue — ex : français"
                value={draft.language ?? ""}
                onChange={(e) => setDraft({ ...draft, language: e.target.value })}
              />

              <input
                className="w-full rounded bg-slate-800 p-3 text-white"
                placeholder="Pays — ex : France"
                value={draft.country ?? ""}
                onChange={(e) => setDraft({ ...draft, country: e.target.value })}
              />

              <input
                className="w-full rounded bg-slate-800 p-3 text-white"
                placeholder="Année — ex : 2026"
                type="number"
                value={draft.year ?? ""}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    year: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
              />

              <input
                className="w-full rounded bg-slate-800 p-3 text-white"
                placeholder="Durée — ex : 12 min"
                value={draft.duration ?? ""}
                onChange={(e) => setDraft({ ...draft, duration: e.target.value })}
              />

              <input
                className="w-full rounded bg-slate-800 p-3 text-white"
                placeholder="Âge conseillé — ex : Tous publics"
                value={draft.ageRating ?? ""}
                onChange={(e) => setDraft({ ...draft, ageRating: e.target.value })}
              />
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-6">
            <div>
              <p className="text-emerald-400 text-sm font-medium mb-2">Étape 3</p>
              <h2 className="text-2xl font-bold text-white">Médias du projet</h2>
              <p className="text-white/50 text-sm mt-1">
                Ajoutez le contenu complet, l’extrait gratuit et la miniature ou couverture.
              </p>
            </div>

            <input
              className="w-full rounded bg-slate-800 p-3 text-white"
              placeholder="URL ou futur upload du contenu complet"
              value={draft.fullContentUrl ?? ""}
              onChange={(e) => setDraft({ ...draft, fullContentUrl: e.target.value })}
            />

            <input
              className="w-full rounded bg-slate-800 p-3 text-white"
              placeholder="URL ou futur upload de l'extrait gratuit"
              value={draft.excerptUrl ?? ""}
              onChange={(e) => setDraft({ ...draft, excerptUrl: e.target.value })}
            />

            <input
              className="w-full rounded bg-slate-800 p-3 text-white"
              placeholder="URL de la miniature ou de la couverture"
              value={draft.thumbnailUrl ?? ""}
              onChange={(e) => setDraft({ ...draft, thumbnailUrl: e.target.value })}
            />
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-6">
            <div>
              <p className="text-emerald-400 text-sm font-medium mb-2">Étape 4</p>
              <h2 className="text-2xl font-bold text-white">Participation VIXUAL</h2>
              <p className="text-white/50 text-sm mt-1">
                Choisissez les montants que les contributeurs pourront utiliser pour soutenir ce projet.
              </p>
            </div>

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
        )}

        {currentStep === 4 && (
          <div className="space-y-6">
            <div>
              <p className="text-emerald-400 text-sm font-medium mb-2">Étape 5</p>
              <h2 className="text-2xl font-bold text-white">Prévisualisation</h2>
              <p className="text-white/50 text-sm mt-1">
                Vérifiez la fiche publique avant envoi en validation.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-800/50 p-5 space-y-3">
              <p className="text-white/40 text-sm">{draft.category || "Catégorie non définie"}</p>
              <h3 className="text-2xl font-bold text-white">{draft.title || "Titre du projet"}</h3>
              <p className="text-white/60">{draft.shortDescription || "Description courte du projet."}</p>
              <p className="text-white/40 text-sm">
                Type : {selectedType?.label ?? "Non défini"} · Langue : {draft.language || "non renseignée"} · Pays : {draft.country || "non renseigné"}
              </p>
              <div className="flex flex-wrap gap-2">
                {(draft.supportAmounts ?? []).map((amount) => (
                  <span key={amount} className="rounded-full bg-emerald-500/20 px-3 py-1 text-emerald-300 text-sm">
                    {amount} €
                  </span>
                ))}
              </div>
            </div>

            <label className="flex items-center gap-3 text-white/70">
              <input
                type="checkbox"
                checked={draft.previewConfirmed === true}
                onChange={(e) => setDraft({ ...draft, previewConfirmed: e.target.checked })}
              />
              Je confirme avoir vérifié la prévisualisation.
            </label>
          </div>
        )}

        {currentStep === 5 && (
          <div className="space-y-6">
            <div>
              <p className="text-emerald-400 text-sm font-medium mb-2">Étape 6</p>
              <h2 className="text-2xl font-bold text-white">Validation finale</h2>
              <p className="text-white/50 text-sm mt-1">
                Confirmez les droits et demandez la mise en validation VIXUAL.
              </p>
            </div>

            <label className="flex items-center gap-3 text-white/70">
              <input
                type="checkbox"
                checked={draft.legalAccepted === true}
                onChange={(e) => setDraft({ ...draft, legalAccepted: e.target.checked })}
              />
              Je confirme posséder les droits nécessaires et accepter les CGU.
            </label>

            <button
              type="button"
              disabled={!draft.legalAccepted || !draft.previewConfirmed}
              className="rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white disabled:opacity-40"
              onClick={() => alert("Projet prêt à être envoyé en validation VIXUAL.")}
            >
              Envoyer en validation
            </button>
          </div>
        )}

        <div className="flex justify-between pt-4 border-t border-white/10">
          <button
            type="button"
            onClick={previousStep}
            disabled={currentStep === 0}
            className="rounded-xl border border-white/20 px-4 py-2 text-white/70 disabled:opacity-30"
          >
            Précédent
          </button>

          <button
            type="button"
            onClick={nextStep}
            disabled={currentStep === STEPS.length - 1}
            className="rounded-xl bg-emerald-600 px-4 py-2 text-white disabled:opacity-30"
          >
            Suivant
          </button>
        </div>
      </div>
    </div>
  )
}