"use client"

import { useState } from "react"
import { ProjectDepositProgress } from "@/components/project/project-deposit-progress"
import {
  PROJECT_SUPPORT_AMOUNTS,
  type ProjectDepositDraft,
} from "@/lib/projects/project-deposit"

export function ProjectDepositWizard() {
  const [draft, setDraft] = useState<ProjectDepositDraft>({
    techType: "video",
    supportAmounts: [],
  })

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

      <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 space-y-4">
        <h2 className="text-xl font-bold text-white">Dépôt de projet VIXUAL</h2>

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

        <input
          className="w-full rounded bg-slate-800 p-3 text-white"
          placeholder="Catégorie"
          onChange={(e) => setDraft({ ...draft, category: e.target.value })}
        />

        <div>
          <p className="text-white mb-3">Montants proposés</p>
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
