"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Calendar, Loader2, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export function BirthdateStep() {
  const router = useRouter()
  const [birthdate, setBirthdate] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/auth/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ birthdate }),
      })

      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        setError(data?.message || "Impossible d'enregistrer la date de naissance.")
        return
      }

      if (data?.isMinor) {
        try {
          localStorage.setItem("visual_minor_status", data?.minorStatus || "pending")
          localStorage.setItem("visual_is_minor", "true")
        } catch { /* silent */ }
        router.replace("/minor/consent")
        return
      }

      router.replace("/explore")
    } catch {
      setError("Une erreur est survenue.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-emerald-500/15 flex items-center justify-center">
          <Calendar className="h-5 w-5 text-emerald-400" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">{"Votre date de naissance"}</h3>
          <p className="text-sm text-white/50">
            {"VIXUAL est accessible \u00e0 partir de seize ans. Les mineurs (seize et dix-sept ans) doivent fournir une autorisation parentale."}
          </p>
        </div>
      </div>

      <input
        className="bg-black/20 border border-white/10 rounded-lg px-4 py-3 w-full text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
        type="date"
        value={birthdate}
        onChange={(e) => setBirthdate(e.target.value)}
      />

      {error && <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-3">{error}</p>}

      <Button
        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white h-12"
        disabled={!birthdate || loading}
        onClick={submit}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
        ) : (
          <ArrowRight className="h-4 w-4 mr-2" />
        )}
        {loading ? "Validation\u2026" : "Continuer"}
      </Button>
    </div>
  )
}
