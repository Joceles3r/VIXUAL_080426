"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { CheckCircle, XCircle, Loader2, ShieldCheck } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

function VerifyContent() {
  const params = useSearchParams()
  const token = params.get("token") || ""
  const [state, setState] = useState<"loading" | "ok" | "error">("loading")

  useEffect(() => {
    async function run() {
      if (!token) {
        setState("error")
        return
      }
      try {
        const res = await fetch("/api/minor/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        })
        setState(res.ok ? "ok" : "error")
      } catch {
        setState("error")
      }
    }
    run()
  }, [token])

  return (
    <main className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <Card className="bg-slate-900/50 border-white/10">
          <CardContent className="p-8 text-center space-y-4">
            {state === "loading" && (
              <>
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-emerald-500/10 mx-auto">
                  <Loader2 className="h-7 w-7 text-emerald-400 animate-spin" />
                </div>
                <p className="text-white/70 font-medium">{"V\u00e9rification en cours\u2026"}</p>
              </>
            )}
            {state === "ok" && (
              <>
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-emerald-500/15 mx-auto">
                  <CheckCircle className="h-7 w-7 text-emerald-400" />
                </div>
                <div>
                  <p className="text-emerald-400 font-bold text-lg">{"Autorisation valid\u00e9e"}</p>
                  <p className="text-white/50 text-sm mt-2">
                    {"Merci. Votre validation parentale est enregistr\u00e9e. L'\u00e9quipe VIXUAL va finaliser le contr\u00f4le."}
                  </p>
                </div>
              </>
            )}
            {state === "error" && (
              <>
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-red-500/10 mx-auto">
                  <XCircle className="h-7 w-7 text-red-400" />
                </div>
                <div>
                  <p className="text-red-400 font-bold text-lg">{"Lien invalide ou expir\u00e9"}</p>
                  <p className="text-white/50 text-sm mt-2">
                    {"Merci de relancer la demande d'autorisation parentale depuis votre compte VIXUAL."}
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

export default function MinorVerifyPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
          <Loader2 className="h-8 w-8 text-emerald-400 animate-spin" />
        </main>
      }
    >
      <VerifyContent />
    </Suspense>
  )
}
