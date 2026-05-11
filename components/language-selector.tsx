"use client"

import { Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useLanguage, type Language } from "@/hooks/use-language"

/**
 * Sélecteur de langue VIXUAL.
 *
 * Langues supportées au lancement V1 : Français (par défaut), English.
 *
 * Les autres langues (es, de, pt, zh, ru, it, ar) ne sont pas affichées
 * tant que la plateforme n'a pas été traduite intégralement dans ces langues.
 * Les ajouter ici uniquement après :
 *  1. Traduction complète de la homepage cible
 *  2. Création du composant HomeV1XX correspondant
 *  3. Branchement dans le wrapper HomeV1Switch de app/page.tsx
 *     + ajout de la langue au type Language dans hooks/use-language.ts
 *
 * Branché sur le hook `useLanguage` (cookie + localStorage) — la sélection
 * est persistée et appliquée à la homepage V1.
 */
const languages: Array<{ code: Language; label: string; flag: string }> = [
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "en", label: "English", flag: "🇬🇧" },
]

export function LanguageSelector() {
  const { lang, setLang, hydrated } = useLanguage()

  const currentLanguage = languages.find((l) => l.code === lang) ?? languages[0]

  // Évite le mismatch SSR avant hydratation
  if (!hydrated) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="h-10 w-10 rounded-lg bg-white/5 border border-white/10"
        aria-label="Changer de langue"
        disabled
      >
        <Globe className="h-5 w-5 text-white/40" />
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-fuchsia-500/50 transition-all"
          aria-label={`Langue actuelle : ${currentLanguage.label}. Cliquer pour changer.`}
        >
          <Globe className="h-5 w-5 text-white/80" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-48 bg-gradient-to-b from-slate-900 to-slate-950 border-fuchsia-500/30 text-white"
      >
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => setLang(language.code)}
            className={`cursor-pointer focus:bg-fuchsia-600/30 focus:text-white ${
              lang === language.code ? "bg-fuchsia-600/20" : ""
            }`}
          >
            <span className="mr-2">{language.flag}</span>
            <span>{language.label}</span>
            {lang === language.code && (
              <span className="ml-auto text-fuchsia-400">✓</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
