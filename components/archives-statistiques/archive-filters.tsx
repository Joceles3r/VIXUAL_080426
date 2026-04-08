"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Filter, Film, FileText, Mic, Sparkles, TrendingUp, Heart, 
  Trophy, Crown, Calendar, X
} from "lucide-react"

export type FilterCategory = "all" | "video" | "text" | "podcast"
export type FilterPeriod = "all" | "this_month" | "last_3_months" | "this_year" | "all_time"
export type FilterStatus = "all" | "active" | "archived" | "hall_of_fame"
export type FilterSort = "rank" | "score" | "support" | "progression" | "recent"

export interface ArchiveFilters {
  category: FilterCategory
  period: FilterPeriod
  status: FilterStatus
  sort: FilterSort
}

interface ArchiveFiltersProps {
  filters: ArchiveFilters
  onChange: (filters: ArchiveFilters) => void
}

const CATEGORY_OPTIONS = [
  { value: "all" as const, label: "Tous", icon: Sparkles },
  { value: "video" as const, label: "Video", icon: Film },
  { value: "text" as const, label: "Ecrit", icon: FileText },
  { value: "podcast" as const, label: "Podcast", icon: Mic },
]

const PERIOD_OPTIONS = [
  { value: "all" as const, label: "Toutes periodes" },
  { value: "this_month" as const, label: "Ce mois" },
  { value: "last_3_months" as const, label: "3 derniers mois" },
  { value: "this_year" as const, label: "Cette annee" },
  { value: "all_time" as const, label: "Historique complet" },
]

const STATUS_OPTIONS = [
  { value: "all" as const, label: "Tous statuts" },
  { value: "active" as const, label: "Actifs" },
  { value: "archived" as const, label: "Archives" },
  { value: "hall_of_fame" as const, label: "Hall of Fame" },
]

const SORT_OPTIONS = [
  { value: "rank" as const, label: "Classement", icon: Trophy },
  { value: "score" as const, label: "Score", icon: TrendingUp },
  { value: "support" as const, label: "Soutiens", icon: Heart },
  { value: "progression" as const, label: "Progression", icon: TrendingUp },
  { value: "recent" as const, label: "Recent", icon: Calendar },
]

export function ArchiveFilters({ filters, onChange }: ArchiveFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  
  const activeFiltersCount = [
    filters.category !== "all",
    filters.period !== "all",
    filters.status !== "all",
    filters.sort !== "rank",
  ].filter(Boolean).length

  const resetFilters = () => {
    onChange({
      category: "all",
      period: "all",
      status: "all",
      sort: "rank",
    })
  }

  return (
    <div className="mb-8">
      {/* Mobile toggle */}
      <Button
        variant="outline"
        onClick={() => setIsExpanded(!isExpanded)}
        className="md:hidden w-full border-white/10 text-white/70 hover:bg-white/5 mb-4"
      >
        <Filter className="h-4 w-4 mr-2" />
        Filtres
        {activeFiltersCount > 0 && (
          <Badge className="ml-2 bg-violet-500/20 text-violet-300">{activeFiltersCount}</Badge>
        )}
      </Button>
      
      <div className={`space-y-4 ${isExpanded ? "block" : "hidden md:block"}`}>
        {/* Category filters */}
        <div className="flex flex-wrap gap-2">
          {CATEGORY_OPTIONS.map((option) => (
            <Button
              key={option.value}
              variant="outline"
              size="sm"
              onClick={() => onChange({ ...filters, category: option.value })}
              className={`border-white/10 ${
                filters.category === option.value
                  ? "bg-violet-500/20 text-violet-300 border-violet-400/30"
                  : "text-white/60 hover:bg-white/5"
              }`}
            >
              <option.icon className="h-4 w-4 mr-1.5" />
              {option.label}
            </Button>
          ))}
        </div>
        
        {/* Period & Status & Sort */}
        <div className="flex flex-wrap gap-4">
          {/* Period */}
          <select
            value={filters.period}
            onChange={(e) => onChange({ ...filters, period: e.target.value as FilterPeriod })}
            className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white/80 text-sm focus:outline-none focus:border-violet-400/50"
          >
            {PERIOD_OPTIONS.map((option) => (
              <option key={option.value} value={option.value} className="bg-slate-900">
                {option.label}
              </option>
            ))}
          </select>
          
          {/* Status */}
          <select
            value={filters.status}
            onChange={(e) => onChange({ ...filters, status: e.target.value as FilterStatus })}
            className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white/80 text-sm focus:outline-none focus:border-violet-400/50"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value} className="bg-slate-900">
                {option.label}
              </option>
            ))}
          </select>
          
          {/* Sort */}
          <div className="flex items-center gap-2">
            <span className="text-white/40 text-sm">Trier par:</span>
            <div className="flex gap-1">
              {SORT_OPTIONS.map((option) => (
                <Button
                  key={option.value}
                  variant="ghost"
                  size="sm"
                  onClick={() => onChange({ ...filters, sort: option.value })}
                  className={`px-2 ${
                    filters.sort === option.value
                      ? "text-violet-400"
                      : "text-white/40 hover:text-white/70"
                  }`}
                >
                  <option.icon className="h-4 w-4" />
                </Button>
              ))}
            </div>
          </div>
          
          {/* Reset */}
          {activeFiltersCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              className="text-white/40 hover:text-white/70"
            >
              <X className="h-4 w-4 mr-1" />
              Reinitialiser
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
