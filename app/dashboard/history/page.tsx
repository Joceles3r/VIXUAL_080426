"use client"

import { useState } from "react"
import { History, ArrowUpRight, ArrowDownRight, Filter, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { MOCK_TRANSACTIONS } from "@/lib/mock-data"

const ALL_TRANSACTIONS = [
  ...MOCK_TRANSACTIONS,
  {
    id: "tr4",
    type: "contribution" as const,
    description: "Contribution - Contes de Minuit",
    amount: -10,
    date: "2026-01-28",
    status: "completed" as const,
  },
  {
    id: "tr5",
    type: "withdrawal" as const,
    description: "Retrait bancaire",
    amount: -50,
    date: "2026-01-20",
    status: "completed" as const,
  },
  {
    id: "tr6",
    type: "deposit" as const,
    description: "Caution Contributeur",
    amount: -20,
    date: "2026-01-15",
    status: "completed" as const,
  },
]

export default function HistoryPage() {
  const [filter, setFilter] = useState("all")

  const filteredTransactions =
    filter === "all"
      ? ALL_TRANSACTIONS
      : ALL_TRANSACTIONS.filter((tx) => tx.type === filter)

  const getIcon = (type: string, amount: number) => {
    if (type === "visupoints") return Star
    return amount >= 0 ? ArrowDownRight : ArrowUpRight
  }

  const getIconColor = (type: string, amount: number) => {
    if (type === "visupoints") return "bg-amber-500/20 text-amber-400"
    return amount >= 0
      ? "bg-emerald-500/20 text-emerald-400"
      : "bg-slate-700 text-white/60"
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "contribution":
        return "Contribution"
      case "return":
        return "Retour"
      case "withdrawal":
        return "Retrait"
      case "deposit":
        return "Caution"
      case "visupoints":
        return "VIXUpoints"
      default:
        return type
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Historique</h1>
          <p className="text-white/60">
            Consultez toutes vos transactions passées
          </p>
        </div>

        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[200px] bg-slate-900/50 border-white/10 text-white">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filtrer par type" />
          </SelectTrigger>
          <SelectContent className="bg-slate-900 border-white/10">
            <SelectItem
              value="all"
              className="text-white focus:bg-emerald-600/30 focus:text-white"
            >
              Toutes les transactions
            </SelectItem>
            <SelectItem
              value="contribution"
              className="text-white focus:bg-emerald-600/30 focus:text-white"
            >
              Contributions
            </SelectItem>
            <SelectItem
              value="return"
              className="text-white focus:bg-emerald-600/30 focus:text-white"
            >
              Retours
            </SelectItem>
            <SelectItem
              value="withdrawal"
              className="text-white focus:bg-emerald-600/30 focus:text-white"
            >
              Retraits
            </SelectItem>
            <SelectItem
              value="deposit"
              className="text-white focus:bg-emerald-600/30 focus:text-white"
            >
              Cautions
            </SelectItem>
            <SelectItem
              value="visupoints"
              className="text-white focus:bg-emerald-600/30 focus:text-white"
            >
              VIXUpoints
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Transactions List */}
      <Card className="bg-slate-900/50 border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <History className="h-5 w-5 text-emerald-400" />
            Transactions ({filteredTransactions.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredTransactions.length > 0 ? (
            <div className="space-y-3">
              {filteredTransactions.map((tx) => {
                const Icon = getIcon(tx.type, tx.amount)
                const iconColor = getIconColor(tx.type, tx.amount)

                return (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-12 h-12 rounded-lg flex items-center justify-center ${iconColor.split(" ")[0]}`}
                      >
                        <Icon className={`h-6 w-6 ${iconColor.split(" ")[1]}`} />
                      </div>
                      <div>
                        <p className="font-medium text-white">{tx.description}</p>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-white/40">{tx.date}</span>
                          <span className="text-white/20">•</span>
                          <span className="text-white/60">
                            {getTypeLabel(tx.type)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span
                        className={`text-lg font-semibold ${
                          tx.type === "visupoints"
                            ? "text-amber-400"
                            : tx.amount >= 0
                              ? "text-emerald-400"
                              : "text-white"
                        }`}
                      >
                        {tx.type === "visupoints"
                          ? `+${tx.amount} pts`
                          : `${tx.amount >= 0 ? "+" : ""}${tx.amount.toFixed(2)}€`}
                      </span>
                      <p
                        className={`text-xs ${
                          tx.status === "completed"
                            ? "text-emerald-400"
                            : tx.status === "pending"
                              ? "text-amber-400"
                              : "text-red-400"
                        }`}
                      >
                        {tx.status === "completed"
                          ? "Complété"
                          : tx.status === "pending"
                            ? "En attente"
                            : "Échoué"}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <History className="h-12 w-12 text-white/20 mx-auto mb-4" />
              <p className="text-white/60">Aucune transaction trouvée</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
