"use client"

import Link from "next/link"
import { Heart, Compass } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ContentCard } from "@/components/content-card"
import { ALL_CONTENTS } from "@/lib/mock-data"

// Mock: first 3 contents are favorites
const MOCK_FAVORITES = ALL_CONTENTS.slice(0, 3)

export default function FavoritesPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Mes favoris</h1>
        <p className="text-white/60">
          Retrouvez tous les projets que vous avez sauvegardés
        </p>
      </div>

      {/* Favorites Grid */}
      {MOCK_FAVORITES.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {MOCK_FAVORITES.map((content) => (
            <ContentCard key={content.id} content={content} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-full bg-slate-900/50 flex items-center justify-center mx-auto mb-4">
            <Heart className="h-8 w-8 text-white/40" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">
            Aucun favori pour l'instant
          </h3>
          <p className="text-white/60 mb-6">
            Explorez des projets et ajoutez-les à vos favoris
          </p>
          <Link href="/explore">
            <Button className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white">
              <Compass className="mr-2 h-4 w-4" />
              Explorer les projets
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}
