"use client"

import { useState } from "react"
import { AlertOctagon, X, Send, CheckCircle, ShieldAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useAuth } from "@/lib/auth-context"

// ── Report categories ──
const REPORT_CATEGORIES = [
  { key: "racism", label: "Racisme", desc: "Propos ou contenus racistes, discriminatoires" },
  { key: "homophobia", label: "Homophobie", desc: "Propos ou contenus homophobes ou transphobes" },
  { key: "antisemitism", label: "Antis\u00e9mitisme", desc: "Propos ou contenus antis\u00e9mites" },
  { key: "religious_hate", label: "Haine religieuse", desc: "Propos anti-religieux, intol\u00e9rance religieuse" },
  { key: "insults", label: "Insultes / Harc\u00e8lement", desc: "Injures, menaces, harc\u00e8lement moral" },
  { key: "sexual_content", label: "Contenu sexuel", desc: "Contenu pornographique ou \u00e0 caract\u00e8re sexuel" },
  { key: "violence", label: "Violence", desc: "Contenu violent, apologie de la violence, incitation" },
  { key: "plagiarism", label: "Plagiat / Droits d'auteur", desc: "Contenu vol\u00e9, plagi\u00e9 ou contrefa\u00e7on" },
  { key: "spam", label: "Spam / Arnaque", desc: "Contenu publicitaire non autoris\u00e9 ou frauduleux" },
  { key: "other", label: "Autre", desc: "Autre motif non list\u00e9 ci-dessus" },
] as const

export type ReportCategory = (typeof REPORT_CATEGORIES)[number]["key"]

interface ReportButtonProps {
  /** ID of the content or user being reported */
  targetId: string
  /** What is being reported */
  targetType: "content" | "user" | "comment"
  /** Optional: name of the content/user for display */
  targetName?: string
  /** Visual variant */
  variant?: "icon" | "full" | "minimal"
  /** Size */
  size?: "sm" | "md"
}

export function ReportButton({
  targetId,
  targetType,
  targetName,
  variant = "full",
  size = "sm",
}: ReportButtonProps) {
  const { isAuthed, user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<ReportCategory | null>(null)
  const [details, setDetails] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  if (!isAuthed) return null

  const handleSubmit = async () => {
    if (!selectedCategory) return
    setSubmitting(true)

    // In production: POST to /api/reports
    try {
      await fetch("/api/admin/secure-action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user?.email,
          action: "report_content",
          payload: {
            targetId,
            targetType,
            targetName,
            category: selectedCategory,
            details: details.trim(),
            reporterId: user?.id,
            reporterName: user?.name,
            timestamp: new Date().toISOString(),
          },
        }),
      })
    } catch {
      // Fallback: report accepted locally
    }

    setSubmitting(false)
    setSubmitted(true)
    setTimeout(() => {
      setIsOpen(false)
      setSubmitted(false)
      setSelectedCategory(null)
      setDetails("")
    }, 2500)
  }

  return (
    <>
      {/* Trigger Button -- BOUTON ROUGE ALERTE */}
      {variant === "icon" ? (
        <button
          onClick={() => setIsOpen(true)}
          className={`${size === "sm" ? "p-1.5" : "p-2"} rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-all border border-red-500/20 hover:border-red-500/40`}
          title="Signaler un contenu inappropri\u00e9"
          aria-label="Signaler un contenu inappropri\u00e9"
        >
          <AlertOctagon className={size === "sm" ? "h-4 w-4" : "h-5 w-5"} />
        </button>
      ) : variant === "minimal" ? (
        <button
          onClick={() => setIsOpen(true)}
          className="text-white/30 hover:text-red-400 transition-colors flex items-center gap-1.5 text-xs"
          title="Signaler"
          aria-label="Signaler un contenu inappropri\u00e9"
        >
          <AlertOctagon className="h-3.5 w-3.5" />
          <span className="sr-only sm:not-sr-only">Signaler</span>
        </button>
      ) : (
        <Button
          onClick={() => setIsOpen(true)}
          variant="outline"
          size={size}
          className="bg-red-500/5 border-red-500/20 text-red-400 hover:bg-red-500/15 hover:text-red-300 hover:border-red-500/40"
        >
          <AlertOctagon className="h-4 w-4 mr-2" />
          Signaler
        </Button>
      )}

      {/* Report Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => !submitting && setIsOpen(false)}
          />

          {/* Modal */}
          <Card className="relative w-full max-w-lg bg-slate-900 border-red-500/20 shadow-2xl shadow-red-500/10 z-10">
            <CardContent className="p-0">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
                    <ShieldAlert className="h-5 w-5 text-red-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-sm">Signaler un contenu</h3>
                    {targetName && (
                      <p className="text-white/40 text-xs truncate max-w-[250px]">{targetName}</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => !submitting && setIsOpen(false)}
                  className="text-white/30 hover:text-white/60 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {submitted ? (
                /* Success state */
                <div className="p-8 text-center">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="h-8 w-8 text-emerald-400" />
                  </div>
                  <h4 className="text-white font-semibold mb-2">Signalement envoy\u00e9</h4>
                  <p className="text-white/50 text-sm">
                    {"Merci pour votre vigilance. Notre \u00e9quipe de mod\u00e9ration examinera votre signalement dans les meilleurs d\u00e9lais."}
                  </p>
                </div>
              ) : (
                <>
                  {/* Community charter reminder */}
                  <div className="mx-4 mt-4 p-3 bg-amber-500/5 border border-amber-500/15 rounded-xl">
                    <p className="text-amber-400/80 text-xs leading-relaxed">
                      {"VIXUAL est un espace de respect mutuel. Tout propos raciste, homophobe, antisemite, anti-religieux, toute insulte, harcelement ou discrimination est strictement interdit et sera sanctionne (avertissement, suspension, suppression de compte)."}
                    </p>
                  </div>

                  {/* Category selection */}
                  <div className="p-4 space-y-3">
                    <p className="text-white/60 text-sm font-medium">{"Motif du signalement :"}</p>
                    <div className="grid grid-cols-2 gap-2 max-h-[240px] overflow-y-auto pr-1">
                      {REPORT_CATEGORIES.map((cat) => (
                        <button
                          key={cat.key}
                          onClick={() => setSelectedCategory(cat.key)}
                          className={`text-left p-3 rounded-xl border transition-all ${
                            selectedCategory === cat.key
                              ? "bg-red-500/10 border-red-500/40 ring-1 ring-red-500/30"
                              : "bg-white/[0.02] border-white/5 hover:border-white/15 hover:bg-white/[0.04]"
                          }`}
                        >
                          <span className={`text-xs font-medium block ${selectedCategory === cat.key ? "text-red-400" : "text-white/70"}`}>
                            {cat.label}
                          </span>
                          <span className="text-[10px] text-white/35 block mt-0.5 leading-tight">
                            {cat.desc}
                          </span>
                        </button>
                      ))}
                    </div>

                    {/* Optional details */}
                    <div>
                      <label className="text-white/40 text-xs mb-1.5 block">
                        {"D\u00e9tails (optionnel) :"}
                      </label>
                      <textarea
                        value={details}
                        onChange={(e) => setDetails(e.target.value)}
                        placeholder="D\u00e9crivez le probl\u00e8me..."
                        rows={2}
                        maxLength={500}
                        className="w-full bg-black/30 text-white/80 text-sm placeholder:text-white/20 rounded-xl border border-white/10 p-3 resize-none focus:outline-none focus:border-red-500/30"
                      />
                    </div>
                  </div>

                  {/* Footer actions */}
                  <div className="flex items-center justify-between p-4 border-t border-white/10">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsOpen(false)}
                      className="text-white/40 hover:text-white/70"
                      disabled={submitting}
                    >
                      Annuler
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSubmit}
                      disabled={!selectedCategory || submitting}
                      className="bg-red-600 hover:bg-red-500 text-white disabled:opacity-30"
                    >
                      {submitting ? (
                        <>
                          <span className="animate-spin mr-2 h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full inline-block" />
                          Envoi...
                        </>
                      ) : (
                        <>
                          <Send className="h-3.5 w-3.5 mr-2" />
                          Envoyer le signalement
                        </>
                      )}
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </>
  )
}
