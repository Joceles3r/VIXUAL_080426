"use client"

/**
 * VIXUAL — Page ADMIN/PATRON : Gestion Homepage V1
 *
 * Permet de modifier le Hero et les carrousels de la homepage publique.
 * Accès limité au PATRON et aux employés avec permission `manage_homepage`.
 */

import Link from "next/link"
import { ArrowLeft, LayoutDashboard } from "lucide-react"
import { HomepageManager } from "@/components/admin/homepage-manager"

export default function AdminHomepagePage() {
  return (
    <div className="p-6 lg:p-8 max-w-7xl">
      {/* Breadcrumb */}
      <div className="mb-6">
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour à l&apos;administration
        </Link>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <LayoutDashboard className="h-8 w-8 text-purple-400" />
            Gestion Homepage
          </h1>
          <p className="text-white/50 mt-1">
            Hero principal, carrousels et visuels de la homepage publique V1
          </p>
        </div>
      </div>

      <HomepageManager />
    </div>
  )
}
