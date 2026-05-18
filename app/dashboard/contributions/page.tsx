"use client"

import Link from "next/link"
import { Film, FileText, Mic, ArrowUpRight, Wallet } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

/**
 * VIXUAL — /dashboard/contributions
 *
 * Page contributions utilisateur. Affichage initial : etat vide propre.
 * (Les vraies contributions arriveront via une API BD une fois Stripe configure.)
 */
export default function ContributionsPage() {
  // VERROU AMF : pas de donnees fictives en lancement. Etat vide par defaut.
  const contributions: Array<{
    id: string
    contentTitle: string
    contentType: "video" | "text" | "podcast"
    amount: number
    returns: number
    status: string
  }> = []

  const totalContributed = contributions.reduce((sum, c) => sum + c.amount, 0)
  const totalReturns = contributions.reduce((sum, c) => sum + c.returns, 0)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Mes contributions</h1>
        <p className="text-white/60">
          Suivez vos soutiens aux createurs et leurs performances dans le temps
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-white/[0.03] border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-white/60 font-normal">Total contribue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-white">{totalContributed}€</p>
          </CardContent>
        </Card>

        <Card className="bg-white/[0.03] border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-white/60 font-normal">Gains potentiels cumules</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-emerald-400">{totalReturns}€</p>
          </CardContent>
        </Card>

        <Card className="bg-white/[0.03] border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-white/60 font-normal">Projets soutenus</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-white">{contributions.length}</p>
          </CardContent>
        </Card>
      </div>

      {contributions.length === 0 ? (
        <Card className="bg-white/[0.03] border-white/10">
          <CardContent className="py-16 text-center">
            <Wallet className="h-12 w-12 text-white/30 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Aucune contribution pour le moment</h3>
            <p className="text-white/55 mb-6 max-w-md mx-auto">
              Decouvrez les createurs et soutenez les projets qui vous parlent. Vos contributions apparaitront ici.
            </p>
            <Link href="/explore">
              <Button className="bg-gradient-to-r from-fuchsia-500 to-violet-600 text-white">
                Decouvrir les projets
                <ArrowUpRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {contributions.map((c) => {
            const TypeIcon = c.contentType === "video" ? Film : c.contentType === "text" ? FileText : Mic
            return (
              <Card key={c.id} className="bg-white/[0.03] border-white/10 hover:bg-white/[0.06] transition-colors">
                <CardContent className="p-4 flex items-center gap-4">
                  <TypeIcon className="h-5 w-5 text-white/50" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-white">{c.contentTitle}</h4>
                    <p className="text-white/50 text-sm">{c.amount}€ — {c.status}</p>
                  </div>
                  <Badge variant="outline" className="text-emerald-400 border-emerald-400/30">
                    +{c.returns}€
                  </Badge>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
