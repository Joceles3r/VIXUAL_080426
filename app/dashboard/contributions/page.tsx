"use client"

import Link from "next/link"
import { TrendingUp, Film, FileText, Mic, ArrowUpRight, Wallet } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

// VERROU AMF: pas de donnees fictives en lancement. Affichage etat vide.
const MOCK_INVESTMENTS: Array<{ id: string; amount: number; returns: number; contentType: string; contentTitle: string; contentId: string; status: string; date: string }> = []

export default function InvestmentsPage() {
  const totalInvested = MOCK_INVESTMENTS.reduce((sum, inv) => sum + inv.amount, 0)
  const totalReturns = MOCK_INVESTMENTS.reduce((sum, inv) => sum + inv.returns, 0)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Mes contributions</h1>
        <p className="text-white/60">
          Suivez vos soutiens aux createurs et leurs performances dans le temps
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-slate-900/50 border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-emerald-400" />
              </div>
              <div>
                <p className="text-white/60 text-sm">Total contribue</p>
                <p className="text-2xl font-bold text-white">{totalInvested}€</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-teal-500/20 flex items-center justify-center">
                <ArrowUpRight className="h-6 w-6 text-teal-400" />
              </div>
              <div>
                <p className="text-white/60 text-sm">Gains potentiels cumules</p>
                <p className="text-2xl font-bold text-emerald-400">
                  +{totalReturns.toFixed(2)}€
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-sky-500/20 flex items-center justify-center">
                <Wallet className="h-6 w-6 text-sky-400" />
              </div>
              <div>
                <p className="text-white/60 text-sm">Projets soutenus</p>
                <p className="text-2xl font-bold text-white">
                  {MOCK_INVESTMENTS.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Investments List */}
      <Card className="bg-slate-900/50 border-white/10">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-white">Liste des contributions</CardTitle>
          <Link href="/explore">
            <Button className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white">
              Explorer plus de projets
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {MOCK_INVESTMENTS.length > 0 ? (
            <div className="space-y-4">
              {MOCK_INVESTMENTS.map((investment) => (
                <div
                  key={investment.id}
                  className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-lg"
                >
                  <div
                    className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      investment.contentType === "video"
                        ? "bg-red-500/20"
                        : investment.contentType === "podcast"
                          ? "bg-purple-500/20"
                          : "bg-amber-500/20"
                    }`}
                  >
                    {investment.contentType === "video" ? (
                      <Film className="h-6 w-6 text-red-400" />
                    ) : investment.contentType === "podcast" ? (
                      <Mic className="h-6 w-6 text-purple-400" />
                    ) : (
                      <FileText className="h-6 w-6 text-amber-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-white">
                        {investment.contentTitle}
                      </p>
                      <Badge
                        className={`${
                          investment.status === "active"
                            ? "bg-emerald-500/20 text-emerald-400"
                            : investment.status === "completed"
                              ? "bg-sky-500/20 text-sky-400"
                              : "bg-red-500/20 text-red-400"
                        } border-0`}
                      >
                        {investment.status === "active"
                          ? "Actif"
                          : investment.status === "completed"
                            ? "Terminé"
                            : "Remboursé"}
                      </Badge>
                    </div>
                    <p className="text-sm text-white/60">
                      Soutenu le {investment.date}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-white">{investment.amount}€</p>
                    <p className="text-sm text-emerald-400">
                      +{investment.returns.toFixed(2)}€
                    </p>
                  </div>
                  <Link href={`/video/${investment.contentId}`} onClick={(e) => {
                    if (!investment.contentId) e.preventDefault()
                  }}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-transparent border-white/20 text-white hover:bg-white/10"
                      disabled={!investment.contentId}
                    >
                      Voir
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <TrendingUp className="h-12 w-12 text-white/20 mx-auto mb-4" />
              <p className="text-white/60 mb-4">
                Vous n'avez pas encore de contribution
              </p>
              <Link href="/explore">
                <Button className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white">
                  Explorer les projets
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
