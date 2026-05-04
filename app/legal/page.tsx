"use client"
import Link from "next/link"
import { ArrowLeft, FileText, Shield, Cookie, BookOpen } from "lucide-react"

export default function LegalIndexPage() {
  const sections = [
    { href: "/legal/terms", icon: BookOpen, title: "Conditions Generales d'Utilisation", color: "text-sky-400", bg: "bg-sky-500/10", border: "border-sky-500/20" },
    { href: "/legal/cgv", icon: FileText, title: "Conditions Generales de Vente", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
    { href: "/legal/privacy", icon: Shield, title: "Politique de Confidentialite", color: "text-violet-400", bg: "bg-violet-500/10", border: "border-violet-500/20" },
    { href: "/legal/cookies", icon: Cookie, title: "Politique Cookies", color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
  ]
  return (
    <div className="min-h-screen bg-slate-950">
      <div className="container mx-auto px-4 py-16 max-w-2xl">
        <Link href="/" className="inline-flex items-center gap-2 text-white/50 hover:text-white/80 mb-10 text-sm">
          <ArrowLeft className="h-4 w-4" /> Retour a l&apos;accueil
        </Link>
        <h1 className="text-3xl font-bold text-white mb-8">Informations legales</h1>
        <div className="space-y-3">
          {sections.map((s) => (
            <Link key={s.href} href={s.href} className={`flex items-center gap-4 p-5 rounded-xl ${s.bg} border ${s.border} hover:border-white/20 transition-all`}>
              <s.icon className={`h-5 w-5 ${s.color}`} />
              <span className="text-white font-medium">{s.title}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
