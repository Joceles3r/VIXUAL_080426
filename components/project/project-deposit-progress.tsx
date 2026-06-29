"use client"

import { Check, X } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import {
  buildProjectProgress,
  getProjectProgressPercent,
  type ProjectDepositDraft,
} from "@/lib/projects/project-deposit"

export function ProjectDepositProgress({ draft }: { draft: ProjectDepositDraft }) {
  const steps = buildProjectProgress(draft)
  const percent = getProjectProgressPercent(draft)

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-white font-semibold">Assistant de publication VIXUAL</h3>
          <p className="text-white/50 text-sm">Complétez votre projet avant validation.</p>
        </div>
        <span className="text-emerald-400 font-bold">{percent}%</span>
      </div>

      <Progress value={percent} className="h-2 bg-slate-800" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {steps.map((step) => (
          <div key={step.id} className="flex items-center gap-2 text-sm">
            {step.completed ? (
              <Check className="h-4 w-4 text-emerald-400" />
            ) : (
              <X className="h-4 w-4 text-red-400" />
            )}
            <span className={step.completed ? "text-white/80" : "text-white/40"}>
              {step.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
